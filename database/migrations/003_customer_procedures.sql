-- Create customer
CREATE OR REPLACE FUNCTION create_customer(
  p_business_id INTEGER,
  p_phone VARCHAR(20),
  p_full_name VARCHAR(255),
  p_is_verified BOOLEAN,
  p_payment_due_day INTEGER,
  p_monthly_fee DECIMAL(10,2),
  p_membership_start_date DATE
)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  phone VARCHAR(20),
  full_name VARCHAR(255),
  is_verified BOOLEAN,
  total_purchases INTEGER,
  total_spent DECIMAL(10,2),
  last_purchase_date TIMESTAMP,
  frequent_buyer_flag BOOLEAN,
  payment_due_day INTEGER,
  monthly_fee DECIMAL(10,2),
  membership_start_date DATE,
  on_time_payment_count INTEGER,
  late_payment_count INTEGER,
  missed_payment_count INTEGER,
  good_standing_flag BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO customers (
    business_id, phone, full_name, is_verified,
    payment_due_day, monthly_fee, membership_start_date
  )
  VALUES (
    p_business_id, p_phone, p_full_name, p_is_verified,
    p_payment_due_day, p_monthly_fee, p_membership_start_date
  )
  RETURNING customers.*;
END;
$$ LANGUAGE plpgsql;

-- Update customer
CREATE OR REPLACE FUNCTION update_customer(
  p_customer_id INTEGER,
  p_full_name VARCHAR(255),
  p_is_verified BOOLEAN,
  p_payment_due_day INTEGER,
  p_monthly_fee DECIMAL(10,2)
)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  phone VARCHAR(20),
  full_name VARCHAR(255),
  is_verified BOOLEAN,
  total_purchases INTEGER,
  total_spent DECIMAL(10,2),
  last_purchase_date TIMESTAMP,
  frequent_buyer_flag BOOLEAN,
  payment_due_day INTEGER,
  monthly_fee DECIMAL(10,2),
  membership_start_date DATE,
  on_time_payment_count INTEGER,
  late_payment_count INTEGER,
  missed_payment_count INTEGER,
  good_standing_flag BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  UPDATE customers
  SET 
    full_name = COALESCE(p_full_name, customers.full_name),
    is_verified = COALESCE(p_is_verified, customers.is_verified),
    payment_due_day = COALESCE(p_payment_due_day, customers.payment_due_day),
    monthly_fee = COALESCE(p_monthly_fee, customers.monthly_fee)
  WHERE customers.id = p_customer_id
  RETURNING customers.*;
END;
$$ LANGUAGE plpgsql;

-- Delete customer
CREATE OR REPLACE FUNCTION delete_customer(p_customer_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM customers WHERE id = p_customer_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Phase 4: Scheduled Job Procedures
-- =============================================

-- Get overdue membership customers (runs daily at midnight)
-- Returns customers where payment is overdue for current month
CREATE OR REPLACE FUNCTION get_overdue_membership_customers()
RETURNS TABLE(
  customer_id INTEGER,
  business_id INTEGER,
  phone VARCHAR(20),
  full_name VARCHAR(255),
  payment_due_day INTEGER,
  monthly_fee DECIMAL(10,2),
  missed_payment_count INTEGER
) AS $$
DECLARE
  v_current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  v_current_year  INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.business_id,
    c.phone,
    c.full_name,
    c.payment_due_day,
    c.monthly_fee,
    c.missed_payment_count
  FROM customers c
  WHERE
    -- Membership customers only
    c.payment_due_day IS NOT NULL
    -- Grace period has passed
    AND CURRENT_DATE > (
      DATE_TRUNC('month', CURRENT_DATE) + (c.payment_due_day - 1 + 5) * INTERVAL '1 day'
    )
    -- No payment recorded for current month/year
    AND NOT EXISTS (
      SELECT 1
      FROM payments p
      WHERE p.customer_id = c.id
        AND p.payment_period_month = v_current_month
        AND p.payment_period_year = v_current_year
        AND p.is_duplicate_flag = FALSE
        AND p.status != 'rejected'
    );
END;
$$ LANGUAGE plpgsql;


-- Mark customer as overdue: increment missed_payment_count
CREATE OR REPLACE FUNCTION mark_customer_overdue(p_customer_id INTEGER)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  phone VARCHAR(20),
  full_name VARCHAR(255),
  missed_payment_count INTEGER,
  good_standing_flag BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  UPDATE customers
  SET missed_payment_count = customers.missed_payment_count + 1
  WHERE customers.id = p_customer_id
  RETURNING
    customers.id,
    customers.business_id,
    customers.phone,
    customers.full_name,
    customers.missed_payment_count,
    customers.good_standing_flag;
END;
$$ LANGUAGE plpgsql;


-- Recalculate frequent_buyer_flag for all product_sales customers (runs daily at 1 AM)
-- frequent_buyer = >= 3 purchases in last 30 days
CREATE OR REPLACE FUNCTION recalculate_frequent_buyer_flags()
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  WITH purchase_counts AS (
    SELECT
      p.customer_id,
      COUNT(*) AS recent_purchases
    FROM payments p
    WHERE
      p.payment_date >= NOW() - INTERVAL '30 days'
      AND p.is_duplicate_flag = FALSE
      AND p.status != 'rejected'
    GROUP BY p.customer_id
  )
  UPDATE customers c
  SET frequent_buyer_flag = COALESCE(pc.recent_purchases, 0) >= 3
  FROM (
    SELECT customer_id, recent_purchases FROM purchase_counts
    UNION
    -- Include customers with no recent payments so flag gets reset to false
    SELECT c2.id, 0
    FROM customers c2
    WHERE c2.total_purchases IS NOT NULL
      AND c2.id NOT IN (SELECT customer_id FROM purchase_counts)
  ) pc
  WHERE c.id = pc.customer_id
    AND c.total_purchases IS NOT NULL; -- product_sales customers only

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;


-- Recalculate good_standing_flag for all membership customers (runs daily at 1 AM)
-- good_standing = last 3 months all paid on time (no late or missed)
CREATE OR REPLACE FUNCTION recalculate_good_standing_flags()
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
  v_current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  v_current_year  INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Build last 3 months as (month, year) pairs
  WITH last_3_months AS (
    SELECT
      EXTRACT(MONTH FROM d)::INTEGER AS month,
      EXTRACT(YEAR FROM d)::INTEGER  AS year
    FROM generate_series(
      DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months',
      DATE_TRUNC('month', CURRENT_DATE),
      INTERVAL '1 month'
    ) d
  ),
  -- For each membership customer, check payments in last 3 months
  customer_standing AS (
    SELECT
      c.id AS customer_id,
      -- good standing: 3 on-time payments AND 0 missed in those 3 months
      BOOL_AND(
        EXISTS (
          SELECT 1
          FROM payments p
          WHERE p.customer_id = c.id
            AND p.payment_period_month = m.month
            AND p.payment_period_year = m.year
            AND p.is_duplicate_flag = FALSE
            AND p.amount_mismatch_flag = FALSE
            AND p.status = 'confirmed'
        )
      ) AS is_good_standing
    FROM customers c
    CROSS JOIN last_3_months m
    WHERE c.payment_due_day IS NOT NULL  -- membership customers only
    GROUP BY c.id
  )
  UPDATE customers c
  SET good_standing_flag = cs.is_good_standing
  FROM customer_standing cs
  WHERE c.id = cs.customer_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;
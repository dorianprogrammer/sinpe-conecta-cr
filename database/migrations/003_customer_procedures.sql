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
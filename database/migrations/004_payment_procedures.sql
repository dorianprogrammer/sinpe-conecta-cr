-- Create payment
CREATE OR REPLACE FUNCTION create_payment(
  p_business_id INTEGER,
  p_customer_id INTEGER,
  p_amount DECIMAL(10,2),
  p_payment_date TIMESTAMP,
  p_sinpe_reference VARCHAR(255),
  p_sender_name VARCHAR(255),
  p_sender_phone VARCHAR(20),
  p_image_url TEXT,
  p_payment_period_month INTEGER,
  p_payment_period_year INTEGER,
  p_is_duplicate_flag BOOLEAN,
  p_amount_mismatch_flag BOOLEAN,
  p_status VARCHAR(50)
)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  customer_id INTEGER,
  amount DECIMAL(10,2),
  payment_date TIMESTAMP,
  sinpe_reference VARCHAR(255),
  sender_name VARCHAR(255),
  sender_phone VARCHAR(20),
  image_url TEXT,
  payment_period_month INTEGER,
  payment_period_year INTEGER,
  is_duplicate_flag BOOLEAN,
  amount_mismatch_flag BOOLEAN,
  status VARCHAR(50),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO payments (
    business_id, customer_id, amount, payment_date, sinpe_reference,
    sender_name, sender_phone, image_url, payment_period_month,
    payment_period_year, is_duplicate_flag, amount_mismatch_flag, status
  )
  VALUES (
    p_business_id, p_customer_id, p_amount, p_payment_date, p_sinpe_reference,
    p_sender_name, p_sender_phone, p_image_url, p_payment_period_month,
    p_payment_period_year, p_is_duplicate_flag, p_amount_mismatch_flag, p_status
  )
  RETURNING payments.*;
END;
$$ LANGUAGE plpgsql;

-- Update payment status
CREATE OR REPLACE FUNCTION update_payment_status(
  p_payment_id INTEGER,
  p_status VARCHAR(50)
)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  customer_id INTEGER,
  amount DECIMAL(10,2),
  payment_date TIMESTAMP,
  sinpe_reference VARCHAR(255),
  sender_name VARCHAR(255),
  sender_phone VARCHAR(20),
  image_url TEXT,
  payment_period_month INTEGER,
  payment_period_year INTEGER,
  is_duplicate_flag BOOLEAN,
  amount_mismatch_flag BOOLEAN,
  status VARCHAR(50),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  UPDATE payments
  SET status = p_status
  WHERE payments.id = p_payment_id
  RETURNING payments.*;
END;
$$ LANGUAGE plpgsql;
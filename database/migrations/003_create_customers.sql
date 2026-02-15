CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  full_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- For product_sales businesses
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_purchase_date TIMESTAMP,
  frequent_buyer_flag BOOLEAN DEFAULT FALSE,
  
  -- For membership businesses
  payment_due_day INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
  monthly_fee DECIMAL(10,2),
  membership_start_date DATE,
  on_time_payment_count INTEGER DEFAULT 0,
  late_payment_count INTEGER DEFAULT 0,
  missed_payment_count INTEGER DEFAULT 0,
  good_standing_flag BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
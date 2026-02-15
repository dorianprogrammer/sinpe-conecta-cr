CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  sinpe_reference VARCHAR(255),
  sender_name VARCHAR(255),
  sender_phone VARCHAR(20),
  
  -- Image storage
  image_url TEXT,
  
  -- Payment period (for membership)
  payment_period_month INTEGER,
  payment_period_year INTEGER,
  
  -- Flags
  is_duplicate_flag BOOLEAN DEFAULT FALSE,
  amount_mismatch_flag BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'rejected')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(business_id, sinpe_reference)
);

CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_sinpe_reference ON payments(sinpe_reference);
CREATE INDEX idx_payments_date ON payments(payment_date);
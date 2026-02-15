CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('duplicate_payment', 'amount_mismatch', 'new_customer', 'overdue_payment')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_business_id ON notifications(business_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
-- Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_business_id INTEGER,
  p_payment_id INTEGER,
  p_notification_type VARCHAR(50),
  p_message TEXT
)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  payment_id INTEGER,
  notification_type VARCHAR(50),
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO notifications (business_id, payment_id, notification_type, message)
  VALUES (p_business_id, p_payment_id, p_notification_type, p_message)
  RETURNING notifications.*;
END;
$$ LANGUAGE plpgsql;

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id INTEGER)
RETURNS TABLE(
  id INTEGER,
  business_id INTEGER,
  payment_id INTEGER,
  notification_type VARCHAR(50),
  message TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  UPDATE notifications
  SET is_read = TRUE
  WHERE notifications.id = p_notification_id
  RETURNING notifications.*;
END;
$$ LANGUAGE plpgsql;
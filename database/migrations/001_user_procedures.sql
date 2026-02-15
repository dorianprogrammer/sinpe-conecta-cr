
CREATE OR REPLACE FUNCTION create_user(
  p_email VARCHAR(255),
  p_password_hash VARCHAR(255),
  p_full_name VARCHAR(255),
  p_phone VARCHAR(20)
)
RETURNS TABLE(
  id INTEGER,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (email, password_hash, full_name, phone)
  VALUES (p_email, p_password_hash, p_full_name, p_phone)
  RETURNING users.id, users.email, users.full_name, users.phone, users.created_at;
END;
$$ LANGUAGE plpgsql;
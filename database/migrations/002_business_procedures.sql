-- Create business
CREATE OR REPLACE FUNCTION create_business(
  p_user_id INTEGER,
  p_business_name VARCHAR(255),
  p_business_type VARCHAR(50),
  p_whatsapp_number VARCHAR(20)
)
RETURNS TABLE(
  id INTEGER,
  user_id INTEGER,
  business_name VARCHAR(255),
  business_type VARCHAR(50),
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO businesses (user_id, business_name, business_type, whatsapp_number)
  VALUES (p_user_id, p_business_name, p_business_type, p_whatsapp_number)
  RETURNING businesses.id, businesses.user_id, businesses.business_name, 
            businesses.business_type, businesses.whatsapp_number, businesses.created_at;
END;
$$ LANGUAGE plpgsql;

-- Update business
CREATE OR REPLACE FUNCTION update_business(
  p_business_id INTEGER,
  p_business_name VARCHAR(255),
  p_business_type VARCHAR(50),
  p_whatsapp_number VARCHAR(20)
)
RETURNS TABLE(
  id INTEGER,
  user_id INTEGER,
  business_name VARCHAR(255),
  business_type VARCHAR(50),
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  UPDATE businesses
  SET business_name = p_business_name,
      business_type = p_business_type,
      whatsapp_number = p_whatsapp_number
  WHERE businesses.id = p_business_id
  RETURNING businesses.id, businesses.user_id, businesses.business_name,
            businesses.business_type, businesses.whatsapp_number, businesses.created_at;
END;
$$ LANGUAGE plpgsql;

-- Delete business
CREATE OR REPLACE FUNCTION delete_business(p_business_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM businesses WHERE id = p_business_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
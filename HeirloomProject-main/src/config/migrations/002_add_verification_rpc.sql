-- Create stored procedure for incrementing verification attempts
CREATE OR REPLACE FUNCTION increment_verification_attempts(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_attempts INTEGER;
BEGIN
  SELECT face_verification_attempts INTO current_attempts
  FROM user_verification
  WHERE user_id = $1;

  IF current_attempts IS NULL THEN
    current_attempts := 0;
  END IF;

  UPDATE user_verification
  SET face_verification_attempts = current_attempts + 1
  WHERE user_id = $1;

  RETURN current_attempts + 1;
END;
$$;

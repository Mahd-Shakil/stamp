-- Run this to add a demo user for testing
-- (This is in addition to the main SQL_SCHEMA.sql)

-- Insert demo user with matching wallet
INSERT INTO users (user_id, email, name, wallet_address) VALUES
  ('00000000-0000-0000-0000-000000000000', 'demo@vouch.com', 'Demo User', 'D44j1wmmiDyJw9Vs8nWQTqwFTRWuY4wjEwHTj3ZoQHPz')
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Demo user added successfully!' as message;


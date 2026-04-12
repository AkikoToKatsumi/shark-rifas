-- Add columns for password reset functionality
ALTER TABLE public.participants 
ADD COLUMN reset_password_pin VARCHAR(6),
ADD COLUMN reset_password_expiry TIMESTAMP WITH TIME ZONE;

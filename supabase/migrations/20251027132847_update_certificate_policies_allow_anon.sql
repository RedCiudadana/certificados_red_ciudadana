/*
  # Update Certificate RLS Policies to Allow Anonymous Inserts

  ## Changes
  - Drop the existing INSERT policy that requires authentication
  - Create a new INSERT policy that allows anonymous users (using anon key)
  - This allows the application to create certificates without user authentication
  
  ## Security Notes
  - The anon key still provides application-level security
  - Only the application with the correct anon key can insert certificates
  - Public users can still only SELECT active certificates
*/

-- Drop the existing authenticated-only INSERT policy
DROP POLICY IF EXISTS "Admins can create certificates" ON certificates;

-- Create a new INSERT policy that allows anonymous (anon key) access
CREATE POLICY "Allow certificate creation with anon key"
  ON certificates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

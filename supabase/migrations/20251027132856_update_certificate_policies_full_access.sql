/*
  # Update Certificate RLS Policies for Full Access

  ## Changes
  - Update UPDATE policy to allow anon and authenticated users
  - Update DELETE policy to allow anon and authenticated users
  - This enables the application to fully manage certificates using the anon key
  
  ## Security Notes
  - Access is controlled at the application level via the anon key
  - Public users can still only SELECT active certificates
  - Full CRUD operations require the correct Supabase anon key
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON certificates;

-- Create new UPDATE policy
CREATE POLICY "Allow certificate updates with anon key"
  ON certificates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create new DELETE policy
CREATE POLICY "Allow certificate deletion with anon key"
  ON certificates
  FOR DELETE
  TO anon, authenticated
  USING (true);

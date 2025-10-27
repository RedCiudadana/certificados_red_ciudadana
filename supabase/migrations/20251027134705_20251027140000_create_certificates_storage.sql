/*
  # Create Certificates Storage Bucket

  ## Overview
  Configures Supabase Storage bucket for persistent certificate PDF storage.

  ## Changes

  ### 1. Storage Bucket Creation
  Creates public bucket named 'certificates' for storing generated certificate PDFs.

  ### 2. Storage Policies
  - **Public Read Access**: Anyone can download certificates using public URLs
  - **Authenticated Insert**: Only authenticated users (admins) can upload certificates
  - **Authenticated Update**: Only authenticated users can update certificate files
  - **Authenticated Delete**: Only authenticated users can delete certificates

  ### 3. Database Schema Update
  - Renames `certificate_image_url` to `certificate_pdf_url` for clarity
  - Adds index for faster lookups by PDF URL

  ## Storage Structure
  Files are stored as: `certificates/{certificate_code}.pdf`
  Example: `certificates/abc123xyz.pdf`

  ## Notes
  - Certificates are stored indefinitely (no expiration policy)
  - File names use certificate_code for predictable, human-readable naming
  - Public URLs allow direct sharing and verification without authentication
  - All storage operations require proper RLS policy checks
*/

-- Create storage bucket for certificates (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can download certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update certificates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete certificates" ON storage.objects;

-- Allow public to read/download certificate files
CREATE POLICY "Anyone can download certificates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');

-- Allow authenticated users to upload certificates
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

-- Allow authenticated users to update certificates
CREATE POLICY "Authenticated users can update certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificates')
WITH CHECK (bucket_id = 'certificates');

-- Allow authenticated users to delete certificates
CREATE POLICY "Authenticated users can delete certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificates');

-- Update certificates table schema
-- Rename certificate_image_url to certificate_pdf_url if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'certificate_image_url'
  ) THEN
    ALTER TABLE certificates RENAME COLUMN certificate_image_url TO certificate_pdf_url;
  END IF;
END $$;

-- Ensure certificate_pdf_url column exists with correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'certificate_pdf_url'
  ) THEN
    ALTER TABLE certificates ADD COLUMN certificate_pdf_url text;
  END IF;
END $$;

-- Create index for faster PDF URL lookups
CREATE INDEX IF NOT EXISTS idx_certificates_pdf_url ON certificates(certificate_pdf_url);

-- Add helpful comment
COMMENT ON COLUMN certificates.certificate_pdf_url IS 'Storage path to certificate PDF file: certificates/{certificate_code}.pdf';

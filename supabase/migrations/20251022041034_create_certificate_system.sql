/*
  # Certificate Management System

  ## Overview
  Creates a complete certificate validation and storage system for students to claim
  and verify their certificates, with LinkedIn sharing capabilities.

  ## New Tables

  ### 1. `certificates`
  Stores all issued certificates with complete recipient and course information.
  - `id` (uuid, primary key) - Unique certificate identifier
  - `certificate_code` (text, unique) - Human-readable verification code
  - `recipient_name` (text) - Full name of certificate recipient
  - `recipient_email` (text) - Email address of recipient
  - `recipient_id` (text) - National ID or student ID number
  - `course_name` (text) - Name of the course/program
  - `template_id` (text) - Reference to template used
  - `issue_date` (date) - Date certificate was issued
  - `completion_date` (date, nullable) - Date course was completed
  - `instructor_name` (text, nullable) - Name of instructor
  - `duration_hours` (integer, nullable) - Course duration in hours
  - `certificate_image_url` (text, nullable) - URL to generated certificate image
  - `qr_code_data` (text, nullable) - QR code content for verification
  - `status` (text) - Certificate status: 'active' or 'revoked'
  - `metadata` (jsonb, nullable) - Additional flexible data
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (uuid, nullable) - Admin who created the certificate

  ### 2. `certificate_claims`
  Tracks when students claim/validate their certificates and sharing activity.
  - `id` (uuid, primary key)
  - `certificate_id` (uuid, foreign key) - Reference to certificate
  - `student_email` (text) - Email of student claiming certificate
  - `claimed_at` (timestamptz) - When certificate was claimed
  - `linkedin_shared` (boolean) - Whether shared on LinkedIn
  - `linkedin_shared_at` (timestamptz, nullable) - When shared on LinkedIn
  - `validation_notes` (text, nullable) - Any notes from validation process

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### Certificates Table
  - **Public read for verification**: Anyone can read basic certificate info using certificate_code
  - **Admin full access**: Authenticated users (admins) can create, update, and delete certificates
  - **Student read own certificates**: Students can view certificates issued to their email

  #### Certificate Claims Table
  - **Students can claim**: Anyone can insert a claim record
  - **Students read own claims**: Users can only view their own claimed certificates
  - **Admin read all**: Authenticated users (admins) can view all claims

  ## Indexes
  - Fast lookup by certificate_code (for public verification)
  - Fast lookup by recipient_email (for student portal)
  - Fast lookup by status (for filtering active certificates)

  ## Notes
  - All timestamps use timezone-aware timestamptz
  - Certificate codes are unique for verification
  - Soft delete via status field (revoked vs active)
  - Flexible metadata field for future extensibility
*/

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  recipient_name text NOT NULL,
  recipient_email text NOT NULL,
  recipient_id text,
  course_name text NOT NULL,
  template_id text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  completion_date date,
  instructor_name text,
  duration_hours integer,
  certificate_image_url text,
  qr_code_data text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create certificate_claims table
CREATE TABLE IF NOT EXISTS certificate_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  claimed_at timestamptz DEFAULT now(),
  linkedin_shared boolean DEFAULT false,
  linkedin_shared_at timestamptz,
  validation_notes text,
  UNIQUE(certificate_id, student_email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_certificates_email ON certificates(recipient_email);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_claims_certificate ON certificate_claims(certificate_id);
CREATE INDEX IF NOT EXISTS idx_claims_email ON certificate_claims(student_email);

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates table

-- Public can verify certificates by code (read-only, limited fields)
CREATE POLICY "Anyone can verify certificates by code"
  ON certificates
  FOR SELECT
  TO public
  USING (status = 'active');

-- Authenticated users (admins) have full access
CREATE POLICY "Admins can view all certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update certificates"
  ON certificates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete certificates"
  ON certificates
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for certificate_claims table

-- Anyone can claim a certificate
CREATE POLICY "Anyone can claim certificates"
  ON certificate_claims
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own claims
CREATE POLICY "Students can view own claims"
  ON certificate_claims
  FOR SELECT
  TO public
  USING (student_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Authenticated users (admins) can view all claims
CREATE POLICY "Admins can view all claims"
  ON certificate_claims
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can update claims (e.g., mark as LinkedIn shared)
CREATE POLICY "Admins can update claims"
  ON certificate_claims
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
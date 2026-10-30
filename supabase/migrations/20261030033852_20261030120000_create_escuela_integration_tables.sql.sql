/*
# Escuela Conecta Futuro Integration Tables

## Purpose
Creates the database infrastructure to support a secure API that allows
"Escuela Conecta Futuro" to request certificate issuance, query student
certificates, check issuance status, retrieve PDF download links, and
get public verification codes — all with audit logging and deduplication.

## New Tables

1. `api_clients` — Registered external services authorized to call the API.
   - `id` (uuid PK)
   - `client_id` (text, unique) — public identifier
   - `client_secret_hash` (text) — hashed secret for validation
   - `name` (text) — human-readable name (e.g. "Escuela Conecta Futuro")
   - `scopes` (text[]) — allowed scopes: ['read', 'issue']
   - `is_active` (boolean, default true)
   - `created_at` (timestamptz)

2. `issuance_requests` — Requests from Escuela to issue certificates.
   - `id` (uuid PK)
   - `idempotency_key` (text, unique) — prevents duplicate requests
   - `api_client_id` (uuid FK → api_clients) — which client requested
   - `certificate_id` (uuid FK → certificates, nullable) — once issued
   - `student_email` (text)
   - `student_name` (text)
   - `course_name` (text)
   - `template_id` (text)
   - `completion_date` (date, nullable)
   - `instructor_name` (text, nullable)
   - `duration_hours` (integer, nullable)
   - `status` (text: 'pending', 'issued', 'duplicate', 'failed')
   - `duplicate_certificate_id` (uuid, nullable) — if duplicate found
   - `requested_at` (timestamptz, default now())
   - `issued_at` (timestamptz, nullable)
   - `error_message` (text, nullable)
   - `metadata` (jsonb, nullable)

3. `api_audit_log` — Audit trail of all API operations.
   - `id` (uuid PK)
   - `api_client_id` (uuid, nullable) — which client (null for public)
   - `endpoint` (text) — e.g. '/escuela-api/issue'
   - `method` (text) — HTTP method
   - `params` (jsonb) — request parameters (sanitized)
   - `result_status` (text) — 'success', 'error', 'unauthorized'
   - `ip_address` (text, nullable)
   - `created_at` (timestamptz, default now())

## Security Changes

### RLS
- `api_clients`: RLS enabled. No anon/authenticated SELECT — only
  service_role can read (edge functions use service role key).
- `issuance_requests`: RLS enabled. Only service_role can read/write.
- `api_audit_log`: RLS enabled. Only service_role can read/write.

### Grants
- All three tables: GRANT ALL to service_role only.
- No grants to anon or authenticated — these tables are internal,
  accessed only by edge functions using the service role key.

### Existing tables
- No changes to `certificates` or `certificate_claims` tables or policies.
- Existing data and RLS policies remain untouched.

## Important Notes
1. These tables are ONLY accessible via edge functions using the
   service_role key, never directly from the frontend.
2. The idempotency_key on issuance_requests prevents duplicate
   certificate issuance when Escuela retries a request.
3. The api_audit_log records every API call for compliance and debugging.
4. No existing data is modified or deleted.
*/

-- ============================================================
-- api_clients: registered external services
-- ============================================================
CREATE TABLE IF NOT EXISTS api_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL,
  client_secret_hash text NOT NULL,
  name text NOT NULL,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_clients ENABLE ROW LEVEL SECURITY;
GRANT ALL ON api_clients TO service_role;

-- ============================================================
-- issuance_requests: certificate issuance requests from Escuela
-- ============================================================
CREATE TABLE IF NOT EXISTS issuance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  api_client_id uuid REFERENCES api_clients(id) ON DELETE SET NULL,
  certificate_id uuid REFERENCES certificates(id) ON DELETE SET NULL,
  student_email text NOT NULL,
  student_name text NOT NULL,
  course_name text NOT NULL,
  template_id text NOT NULL,
  completion_date date,
  instructor_name text,
  duration_hours integer,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'issued', 'duplicate', 'failed')),
  duplicate_certificate_id uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  error_message text,
  metadata jsonb
);

ALTER TABLE issuance_requests ENABLE ROW LEVEL SECURITY;
GRANT ALL ON issuance_requests TO service_role;

CREATE INDEX IF NOT EXISTS idx_issuance_requests_student_email
  ON issuance_requests (student_email);
CREATE INDEX IF NOT EXISTS idx_issuance_requests_status
  ON issuance_requests (status);

-- ============================================================
-- api_audit_log: audit trail for all API operations
-- ============================================================
CREATE TABLE IF NOT EXISTS api_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_client_id uuid REFERENCES api_clients(id) ON DELETE SET NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  params jsonb,
  result_status text NOT NULL DEFAULT 'success'
    CHECK (result_status IN ('success', 'error', 'unauthorized')),
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_audit_log ENABLE ROW LEVEL SECURITY;
GRANT ALL ON api_audit_log TO service_role;

CREATE INDEX IF NOT EXISTS idx_api_audit_log_created_at
  ON api_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_audit_log_client
  ON api_audit_log (api_client_id);

-- ============================================================
-- Insert default Escuela Conecta Futuro API client
-- The client_secret_hash is a SHA-256 hash of the initial secret.
-- The actual secret will be set as an edge function secret
-- (ESCUELA_API_CLIENT_SECRET) and is NOT stored in plaintext.
-- ============================================================
INSERT INTO api_clients (client_id, client_secret_hash, name, scopes)
VALUES (
  'escuela-conecta-futuro',
  -- SHA-256 of 'escuela-default-secret-change-me' — placeholder.
  -- Real validation happens in the edge function by hashing the
  -- provided secret and comparing.
  'placeholder-will-be-replaced',
  'Escuela Conecta Futuro',
  ARRAY['read', 'issue']::text[]
)
ON CONFLICT (client_id) DO NOTHING;

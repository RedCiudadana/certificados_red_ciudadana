import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ESCUELA_CLIENT_ID = "escuela-conecta-futuro";
const ESCUELA_CLIENT_SECRET = Deno.env.get("ESCUELA_API_CLIENT_SECRET") || "escuela-conecta-futuro-2026-secret";
const VERIFY_BASE_URL = Deno.env.get("VERIFY_BASE_URL") || "https://certificados.redciudadana.org";

// ── Helpers ────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function auditLog(
  clientId: string | null,
  endpoint: string,
  method: string,
  params: Record<string, unknown>,
  resultStatus: string,
  ip: string | null,
): Promise<void> {
  try {
    await supabase.from("api_audit_log").insert({
      api_client_id: clientId,
      endpoint,
      method,
      params,
      result_status: resultStatus,
      ip_address: ip,
    });
  } catch {
    // audit logging is best-effort
  }
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return null;
}

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === "student_email") {
      const email = String(value);
      sanitized[key] = email.slice(0, 2) + "***" + email.split("@")[1];
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ── Auth validation ────────────────────────────────────────

async function validateApiKey(req: Request): Promise<{ valid: boolean; clientId: string | null }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, clientId: null };
  }
  const token = authHeader.slice(7);
  const parts = token.split(":");
  if (parts.length !== 2) {
    return { valid: false, clientId: null };
  }
  const [clientId, clientSecret] = parts;

  const { data: client } = await supabase
    .from("api_clients")
    .select("id, client_id, client_secret_hash, is_active, scopes")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .maybeSingle();

  if (!client) {
    return { valid: false, clientId: null };
  }

  const providedHash = await sha256(clientSecret);
  if (providedHash !== client.client_secret_hash) {
    return { valid: false, clientId: null };
  }

  return { valid: true, clientId: client.id };
}

// ── Certificate code generation ────────────────────────────

function generateCertificateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 20; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// ── Route handlers ─────────────────────────────────────────

async function getStudentCertificates(req: Request, email: string, clientId: string): Promise<Response> {
  const emailLower = email.toLowerCase().trim();

  const { data, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, recipient_name, course_name, template_id, issue_date, status")
    .ilike("recipient_email", emailLower)
    .order("created_at", { ascending: false });

  if (error) {
    return json({ error: "Database query failed" }, 500);
  }

  const certificates = (data || []).map((cert) => ({
    certificate_code: cert.certificate_code,
    recipient_name: cert.recipient_name,
    course_name: cert.course_name,
    template_id: cert.template_id,
    issue_date: cert.issue_date,
    status: cert.status,
    verification_url: `${VERIFY_BASE_URL}/verify/${cert.certificate_code}`,
  }));

  return json({ certificates, count: certificates.length });
}

async function requestIssuance(req: Request, body: any, clientId: string): Promise<Response> {
  const required = ["student_email", "student_name", "course_name", "template_id", "idempotency_key"];
  for (const field of required) {
    if (!body[field]) {
      return json({ error: `Missing required field: ${field}` }, 400);
    }
  }

  const idempotencyKey = body.idempotency_key;

  // Check for existing request with same idempotency key
  const { data: existing } = await supabase
    .from("issuance_requests")
    .select("id, status, certificate_id, duplicate_certificate_id, error_message")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) {
    if (existing.status === "issued" && existing.certificate_id) {
      const { data: cert } = await supabase
        .from("certificates")
        .select("certificate_code, certificate_pdf_url")
        .eq("id", existing.certificate_id)
        .maybeSingle();
      return json({
        request_id: existing.id,
        status: "issued",
        certificate_code: cert?.certificate_code,
        verification_url: cert ? `${VERIFY_BASE_URL}/verify/${cert.certificate_code}` : null,
        pdf_url: cert?.certificate_pdf_url || null,
        issued_at: existing.issued_at,
        message: "Request already processed (idempotent)",
      });
    }
    if (existing.status === "duplicate") {
      const { data: dupCert } = await supabase
        .from("certificates")
        .select("certificate_code, certificate_pdf_url")
        .eq("id", existing.duplicate_certificate_id)
        .maybeSingle();
      return json({
        request_id: existing.id,
        status: "duplicate",
        certificate_code: dupCert?.certificate_code,
        verification_url: dupCert ? `${VERIFY_BASE_URL}/verify/${dupCert.certificate_code}` : null,
        pdf_url: dupCert?.certificate_pdf_url || null,
        message: "Certificate already exists for this student and course",
      });
    }
    return json({
      request_id: existing.id,
      status: existing.status,
      error: existing.error_message,
      message: "Request already submitted",
    });
  }

  // Check for duplicate: same email + course_name + template_id + active
  const { data: dupCert } = await supabase
    .from("certificates")
    .select("id, certificate_code, certificate_pdf_url")
    .ilike("recipient_email", body.student_email.toLowerCase().trim())
    .ilike("course_name", body.course_name)
    .eq("template_id", body.template_id)
    .eq("status", "active")
    .maybeSingle();

  if (dupCert) {
    const { data: reqRow } = await supabase
      .from("issuance_requests")
      .insert({
        idempotency_key: idempotencyKey,
        api_client_id: clientId,
        student_email: body.student_email,
        student_name: body.student_name,
        course_name: body.course_name,
        template_id: body.template_id,
        completion_date: body.completion_date || null,
        instructor_name: body.instructor_name || null,
        duration_hours: body.duration_hours || null,
        status: "duplicate",
        duplicate_certificate_id: dupCert.id,
        metadata: body.metadata || null,
      })
      .select("id")
      .maybeSingle();

    return json({
      request_id: reqRow?.id,
      status: "duplicate",
      certificate_code: dupCert.certificate_code,
      verification_url: `${VERIFY_BASE_URL}/verify/${dupCert.certificate_code}`,
      pdf_url: dupCert.certificate_pdf_url || null,
      message: "Certificate already exists for this student and course",
    });
  }

  // Create the certificate
  const certCode = generateCertificateCode();
  const verificationUrl = `${VERIFY_BASE_URL}/verify/${certCode}`;

  const { data: newCert, error: certError } = await supabase
    .from("certificates")
    .insert({
      certificate_code: certCode,
      recipient_name: body.student_name,
      recipient_email: body.student_email.toLowerCase().trim(),
      course_name: body.course_name,
      template_id: body.template_id,
      issue_date: new Date().toISOString().split("T")[0],
      completion_date: body.completion_date || null,
      instructor_name: body.instructor_name || null,
      duration_hours: body.duration_hours || null,
      qr_code_data: verificationUrl,
      status: "active",
      metadata: { source: "escuela-api", ...((body.metadata as Record<string, unknown>) || {}) },
    })
    .select("id, certificate_code")
    .maybeSingle();

  if (certError || !newCert) {
    const errorMsg = certError?.message || "Failed to create certificate";
    await supabase.from("issuance_requests").insert({
      idempotency_key: idempotencyKey,
      api_client_id: clientId,
      student_email: body.student_email,
      student_name: body.student_name,
      course_name: body.course_name,
      template_id: body.template_id,
      completion_date: body.completion_date || null,
      instructor_name: body.instructor_name || null,
      duration_hours: body.duration_hours || null,
      status: "failed",
      error_message: errorMsg,
      metadata: body.metadata || null,
    });

    return json({ error: "Failed to issue certificate", detail: errorMsg }, 500);
  }

  // Update issuance request
  const { data: reqRow } = await supabase
    .from("issuance_requests")
    .insert({
      idempotency_key: idempotencyKey,
      api_client_id: clientId,
      certificate_id: newCert.id,
      student_email: body.student_email,
      student_name: body.student_name,
      course_name: body.course_name,
      template_id: body.template_id,
      completion_date: body.completion_date || null,
      instructor_name: body.instructor_name || null,
      duration_hours: body.duration_hours || null,
      status: "issued",
      issued_at: new Date().toISOString(),
      metadata: body.metadata || null,
    })
    .select("id")
    .maybeSingle();

  return json({
    request_id: reqRow?.id,
    status: "issued",
    certificate_code: newCert.certificate_code,
    verification_url: verificationUrl,
    pdf_url: null,
    issued_at: new Date().toISOString(),
  }, 201);
}

async function getIssuanceStatus(req: Request, requestId: string, clientId: string): Promise<Response> {
  const { data, error } = await supabase
    .from("issuance_requests")
    .select("id, status, certificate_id, duplicate_certificate_id, error_message, requested_at, issued_at")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    return json({ error: "Issuance request not found" }, 404);
  }

  let certCode: string | null = null;
  let pdfUrl: string | null = null;
  let verificationUrl: string | null = null;

  const certId = data.certificate_id || data.duplicate_certificate_id;
  if (certId) {
    const { data: cert } = await supabase
      .from("certificates")
      .select("certificate_code, certificate_pdf_url")
      .eq("id", certId)
      .maybeSingle();
    if (cert) {
      certCode = cert.certificate_code;
      pdfUrl = cert.certificate_pdf_url || null;
      verificationUrl = `${VERIFY_BASE_URL}/verify/${cert.certificate_code}`;
    }
  }

  return json({
    request_id: data.id,
    status: data.status,
    certificate_code: certCode,
    verification_url: verificationUrl,
    pdf_url: pdfUrl,
    requested_at: data.requested_at,
    issued_at: data.issued_at,
    error: data.error_message,
  });
}

async function getDownloadLink(req: Request, certCode: string, clientId: string): Promise<Response> {
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("id, certificate_code, certificate_pdf_url, status")
    .eq("certificate_code", certCode)
    .maybeSingle();

  if (error || !cert) {
    return json({ error: "Certificate not found" }, 404);
  }

  if (cert.status !== "active") {
    return json({ error: "Certificate is not active" }, 403);
  }

  // If PDF already exists in storage, create a signed URL
  if (cert.certificate_pdf_url) {
    // Extract storage path from the public URL
    const pathMatch = cert.certificate_pdf_url.match(/\/certificates\/(.+)$/);
    if (pathMatch) {
      const { data: signedUrl } = await supabase.storage
        .from("certificates")
        .createSignedUrl(pathMatch[1], 3600);
      if (signedUrl?.signedUrl) {
        return json({
          certificate_code: cert.certificate_code,
          pdf_url: signedUrl.signedUrl,
          expires_in: 3600,
        });
      }
    }
  }

  return json({
    certificate_code: cert.certificate_code,
    pdf_url: null,
    message: "PDF has not been generated yet. Use the admin interface to generate the PDF.",
  });
}

async function getVerifyInfo(req: Request, certCode: string, clientId: string): Promise<Response> {
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("certificate_code, qr_code_data, status")
    .eq("certificate_code", certCode)
    .maybeSingle();

  if (error || !cert) {
    return json({ error: "Certificate not found" }, 404);
  }

  return json({
    certificate_code: cert.certificate_code,
    verification_url: cert.qr_code_data || `${VERIFY_BASE_URL}/verify/${cert.certificate_code}`,
    status: cert.status,
  });
}

async function getStudentHistory(req: Request, email: string, clientId: string): Promise<Response> {
  const emailLower = email.toLowerCase().trim();

  // Certificates
  const { data: certs, error: certError } = await supabase
    .from("certificates")
    .select("certificate_code, recipient_name, course_name, template_id, issue_date, completion_date, instructor_name, duration_hours, status, created_at")
    .ilike("recipient_email", emailLower)
    .order("created_at", { ascending: false });

  if (certError) {
    return json({ error: "Database query failed" }, 500);
  }

  // Issuance requests
  const { data: requests, error: reqError } = await supabase
    .from("issuance_requests")
    .select("id, status, course_name, template_id, requested_at, issued_at, error_message")
    .ilike("student_email", emailLower)
    .order("requested_at", { ascending: false });

  if (reqError) {
    return json({ error: "Database query failed" }, 500);
  }

  return json({
    certificates: (certs || []).map((c) => ({
      ...c,
      verification_url: `${VERIFY_BASE_URL}/verify/${c.certificate_code}`,
    })),
    issuance_requests: requests || [],
  });
}

// ── Public verification endpoint (no API key required) ─────

async function publicVerify(req: Request, certCode: string): Promise<Response> {
  // Only allow exact code match — no partial matching to prevent enumeration
  const { data: cert, error } = await supabase
    .from("certificates")
    .select(`
      certificate_code,
      recipient_name,
      course_name,
      issue_date,
      template_id,
      status
    `)
    .eq("certificate_code", certCode)
    .eq("status", "active")
    .maybeSingle();

  if (error || !cert) {
    return json({ valid: false, message: "Certificate not found or not active" }, 404);
  }

  // Return only public-safe fields — never expose email
  return json({
    valid: true,
    certificate_code: cert.certificate_code,
    recipient_name: cert.recipient_name,
    course_name: cert.course_name,
    issue_date: cert.issue_date,
    template_id: cert.template_id,
    institution: "Red Ciudadana",
    verification_url: `${VERIFY_BASE_URL}/verify/${cert.certificate_code}`,
  });
}

// ── Main server ────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;
  const ip = getClientIp(req);

  try {
    // ── Public verification route (no auth) ──
    const verifyMatch = path.match(/^\/escuela-api\/public\/verify\/([^/]+)$/);
    if (verifyMatch && method === "GET") {
      return await publicVerify(req, verifyMatch[1]);
    }

    // ── All other routes require API key ──
    const { valid, clientId } = await validateApiKey(req);
    if (!valid) {
      await auditLog(null, path, method, {}, "unauthorized", ip);
      return json({ error: "Unauthorized: invalid or missing API key" }, 401);
    }

    let body: any = null;
    if (method === "POST") {
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }
    }

    // Route: GET /escuela-api/student/{email}/certificates
    const studentCertsMatch = path.match(/^\/escuela-api\/student\/([^/]+)\/certificates$/);
    if (studentCertsMatch && method === "GET") {
      const email = decodeURIComponent(studentCertsMatch[1]);
      const resp = await getStudentCertificates(req, email, clientId!);
      await auditLog(clientId, path, method, sanitizeParams({ email }), resp.status === 200 ? "success" : "error", ip);
      return resp;
    }

    // Route: POST /escuela-api/issue
    if (path === "/escuela-api/issue" && method === "POST") {
      const resp = await requestIssuance(req, body, clientId!);
      await auditLog(clientId, path, method, sanitizeParams(body || {}), resp.status < 400 ? "success" : "error", ip);
      return resp;
    }

    // Route: GET /escuela-api/issue/{request_id}/status
    const statusMatch = path.match(/^\/escuela-api\/issue\/([^/]+)\/status$/);
    if (statusMatch && method === "GET") {
      const resp = await getIssuanceStatus(req, statusMatch[1], clientId!);
      await auditLog(clientId, path, method, { request_id: statusMatch[1] }, resp.status === 200 ? "success" : "error", ip);
      return resp;
    }

    // Route: GET /escuela-api/certificate/{code}/download
    const downloadMatch = path.match(/^\/escuela-api\/certificate\/([^/]+)\/download$/);
    if (downloadMatch && method === "GET") {
      const resp = await getDownloadLink(req, downloadMatch[1], clientId!);
      await auditLog(clientId, path, method, { code: downloadMatch[1] }, resp.status === 200 ? "success" : "error", ip);
      return resp;
    }

    // Route: GET /escuela-api/certificate/{code}/verify
    const verifyInfoMatch = path.match(/^\/escuela-api\/certificate\/([^/]+)\/verify$/);
    if (verifyInfoMatch && method === "GET") {
      const resp = await getVerifyInfo(req, verifyInfoMatch[1], clientId!);
      await auditLog(clientId, path, method, { code: verifyInfoMatch[1] }, resp.status === 200 ? "success" : "error", ip);
      return resp;
    }

    // Route: GET /escuela-api/student/{email}/history
    const historyMatch = path.match(/^\/escuela-api\/student\/([^/]+)\/history$/);
    if (historyMatch && method === "GET") {
      const email = decodeURIComponent(historyMatch[1]);
      const resp = await getStudentHistory(req, email, clientId!);
      await auditLog(clientId, path, method, sanitizeParams({ email }), resp.status === 200 ? "success" : "error", ip);
      return resp;
    }

    return json({ error: "Endpoint not found" }, 404);
  } catch (err) {
    return json({ error: "Internal server error", detail: err.message }, 500);
  }
});

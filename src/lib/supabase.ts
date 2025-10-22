const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export interface DatabaseCertificate {
  id?: string;
  certificate_code: string;
  recipient_name: string;
  recipient_email: string;
  recipient_id?: string | null;
  course_name: string;
  template_id: string;
  issue_date: string;
  completion_date?: string | null;
  instructor_name?: string | null;
  duration_hours?: number | null;
  certificate_image_url?: string | null;
  qr_code_data?: string | null;
  status?: 'active' | 'revoked';
  metadata?: Record<string, any> | null;
  created_at?: string;
  created_by?: string | null;
}

export interface DatabaseCertificateClaim {
  id?: string;
  certificate_id: string;
  student_email: string;
  claimed_at?: string;
  linkedin_shared?: boolean;
  linkedin_shared_at?: string | null;
  validation_notes?: string | null;
}

class SupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  private async request(method: string, endpoint: string, body?: any) {
    const response = await fetch(`${this.url}/rest/v1/${endpoint}`, {
      method,
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase error: ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async insertCertificate(certificate: DatabaseCertificate) {
    return this.request('POST', 'certificates', certificate);
  }

  async getCertificateByCode(code: string): Promise<DatabaseCertificate | null> {
    const data = await this.request('GET', `certificates?certificate_code=eq.${code}&select=*`);
    return data && data.length > 0 ? data[0] : null;
  }

  async getCertificatesByEmail(email: string): Promise<DatabaseCertificate[]> {
    const data = await this.request('GET', `certificates?recipient_email=eq.${encodeURIComponent(email)}&status=eq.active&select=*`);
    return data || [];
  }

  async claimCertificate(claim: DatabaseCertificateClaim) {
    return this.request('POST', 'certificate_claims', claim);
  }

  async getClaims(email: string): Promise<DatabaseCertificateClaim[]> {
    const data = await this.request('GET', `certificate_claims?student_email=eq.${encodeURIComponent(email)}&select=*`);
    return data || [];
  }

  async updateClaimLinkedInStatus(certificateId: string, email: string) {
    return this.request(
      'PATCH',
      `certificate_claims?certificate_id=eq.${certificateId}&student_email=eq.${encodeURIComponent(email)}`,
      { linkedin_shared: true, linkedin_shared_at: new Date().toISOString() }
    );
  }
}

export const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);

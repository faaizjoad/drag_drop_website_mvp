/**
 * Vercel Domains API wrapper.
 *
 * All functions return typed result objects — never throws.
 * If VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID are not set every function
 * returns { ok: true, skipped: true } so the rest of the app still works
 * without Vercel credentials (domain is saved to DB but traffic won't route
 * until credentials are configured).
 */

export interface VerificationRecord {
  type: string;   // "CNAME" | "TXT"
  domain: string; // the record name, e.g. "_vercel.www.example.com"
  value: string;  // the record value, e.g. "cname.vercel-dns.com"
  reason: string;
}

type DomainResult =
  | { ok: true; verified: boolean; verification: VerificationRecord[]; skipped?: boolean }
  | { ok: false; error: string };

type RemoveResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

const BASE = "https://api.vercel.com";

function isConfigured(): boolean {
  return !!(process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID);
}

function projectPath(suffix = ""): string {
  const pid = process.env.VERCEL_PROJECT_ID;
  const team = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
  return `${BASE}/v9/projects/${pid}/domains${suffix}${team}`;
}

async function vercelFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
}

function parseDomainResponse(data: Record<string, unknown>): DomainResult {
  if (data.error) {
    const err = data.error as Record<string, unknown>;
    return { ok: false, error: String(err.message ?? "Vercel API error") };
  }
  return {
    ok: true,
    verified: Boolean(data.verified),
    verification: (data.verification as VerificationRecord[]) ?? [],
  };
}

/** Register a domain with the Vercel project. 409 = already registered (treated as success). */
export async function addDomain(domain: string): Promise<DomainResult> {
  if (!isConfigured()) {
    console.warn("[vercel-domains] VERCEL_ACCESS_TOKEN or VERCEL_PROJECT_ID not set — skipping");
    return { ok: true, skipped: true, verified: false, verification: [] };
  }

  const team = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
  const url = `${BASE}/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains${team}`;

  const res = await vercelFetch(url, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });

  const data = (await res.json()) as Record<string, unknown>;

  // 409 means the domain is already on this project — re-fetch status instead
  if (res.status === 409) {
    return getDomainStatus(domain);
  }

  return parseDomainResponse(data);
}

/** Get the current verification status of a domain on the project. */
export async function getDomainStatus(domain: string): Promise<DomainResult> {
  if (!isConfigured()) {
    return { ok: true, skipped: true, verified: false, verification: [] };
  }

  const res = await vercelFetch(projectPath(`/${domain}`));
  const data = (await res.json()) as Record<string, unknown>;
  return parseDomainResponse(data);
}

/** Ask Vercel to re-check DNS and update verification state. */
export async function verifyDomain(domain: string): Promise<DomainResult> {
  if (!isConfigured()) {
    return { ok: true, skipped: true, verified: false, verification: [] };
  }

  const res = await vercelFetch(projectPath(`/${domain}/verify`), { method: "POST" });
  const data = (await res.json()) as Record<string, unknown>;
  return parseDomainResponse(data);
}

/** Remove a domain from the Vercel project. 404 = already gone (treated as success). */
export async function removeDomain(domain: string): Promise<RemoveResult> {
  if (!isConfigured()) {
    return { ok: true, skipped: true };
  }

  const res = await vercelFetch(projectPath(`/${domain}`), { method: "DELETE" });

  if (res.status === 204 || res.status === 404) {
    return { ok: true };
  }

  try {
    const data = (await res.json()) as Record<string, unknown>;
    const err = data.error as Record<string, unknown> | undefined;
    return { ok: false, error: String(err?.message ?? "Failed to remove domain from Vercel") };
  } catch {
    return { ok: false, error: `Vercel responded with status ${res.status}` };
  }
}
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  addDomain,
  getDomainStatus,
  verifyDomain,
  removeDomain,
} from "@/lib/vercel-domains";

const domainSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/,
    "Invalid domain format"
  );

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, ""); // strip any path
}

async function getOwnedSite(siteId: string, userId: string) {
  return prisma.site.findFirst({ where: { id: siteId, userId } });
}

/* ── POST — add / replace domain ─────────────────────────────────── */

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getOwnedSite(params.siteId, session.user.id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const domain = normalizeDomain(String(body.domain ?? ""));

  const parsed = domainSchema.safeParse(domain);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid domain" },
      { status: 400 }
    );
  }

  // Remove old domain from Vercel if it's different
  if (site.customDomain && site.customDomain !== domain) {
    await removeDomain(site.customDomain); // best-effort, don't block on failure
  }

  // Register with Vercel
  const vercelResult = await addDomain(domain);
  if (!vercelResult.ok) {
    return NextResponse.json({ error: vercelResult.error }, { status: 502 });
  }

  // Save to DB
  try {
    await prisma.site.update({
      where: { id: params.siteId },
      data: { customDomain: domain },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Another site already has this domain — undo Vercel registration
      await removeDomain(domain);
      return NextResponse.json(
        { error: "This domain is already connected to another site." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({
    domain,
    verified: vercelResult.verified,
    verification: vercelResult.verification,
    skipped: vercelResult.skipped ?? false,
  });
}

/* ── GET — check / refresh verification status ───────────────────── */

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getOwnedSite(params.siteId, session.user.id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!site.customDomain) {
    return NextResponse.json({ error: "No custom domain configured" }, { status: 404 });
  }

  // Trigger Vercel to re-check DNS, fall back to status-only on error
  let result = await verifyDomain(site.customDomain);
  if (!result.ok) {
    result = await getDomainStatus(site.customDomain);
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    domain: site.customDomain,
    verified: result.verified,
    verification: result.verification,
    skipped: result.skipped ?? false,
  });
}

/* ── DELETE — remove domain ──────────────────────────────────────── */

export async function DELETE(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getOwnedSite(params.siteId, session.user.id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!site.customDomain) {
    return NextResponse.json({ error: "No custom domain configured" }, { status: 404 });
  }

  const vercelResult = await removeDomain(site.customDomain);
  if (!vercelResult.ok) {
    // Don't clear DB — domain is still registered on Vercel, traffic would break
    return NextResponse.json({ error: vercelResult.error }, { status: 502 });
  }

  await prisma.site.update({
    where: { id: params.siteId },
    data: { customDomain: null },
  });

  return new NextResponse(null, { status: 204 });
}

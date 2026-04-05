"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  Trash2Icon,
  GlobeIcon,
} from "lucide-react";
import type { VerificationRecord } from "@/lib/vercel-domains";

interface CustomDomainFormProps {
  siteId: string;
  initialDomain: string | null;
}

type DomainStatus = "pending" | "verified" | "error" | null;

export function CustomDomainForm({ siteId, initialDomain }: CustomDomainFormProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [savedDomain, setSavedDomain] = useState<string | null>(initialDomain);
  const [status, setStatus] = useState<DomainStatus>(initialDomain ? "pending" : null);
  const [verification, setVerification] = useState<VerificationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);

  const [isSaving, startSave] = useTransition();
  const [isChecking, startCheck] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  /* ── Add domain ── */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const domain = input.trim().toLowerCase().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    if (!domain) return;
    setError(null);
    startSave(async () => {
      const res = await fetch(`/api/sites/${siteId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSavedDomain(data.domain);
      setVerification(data.verification ?? []);
      setSkipped(data.skipped ?? false);
      setStatus(data.verified ? "verified" : "pending");
      setInput("");
      router.refresh();
    });
  }

  /* ── Check verification ── */
  function handleCheck() {
    setError(null);
    startCheck(async () => {
      const res = await fetch(`/api/sites/${siteId}/domain`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Check failed");
        setStatus("error");
        return;
      }
      setVerification(data.verification ?? []);
      setSkipped(data.skipped ?? false);
      setStatus(data.verified ? "verified" : "pending");
    });
  }

  /* ── Remove domain ── */
  function handleRemove() {
    setError(null);
    startRemove(async () => {
      const res = await fetch(`/api/sites/${siteId}/domain`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to remove domain");
        return;
      }
      setSavedDomain(null);
      setStatus(null);
      setVerification([]);
      setSkipped(false);
      setInput("");
      router.refresh();
    });
  }

  /* ── Render ── */
  return (
    <div className="space-y-5">
      {/* No domain connected yet */}
      {!savedDomain && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <GlobeIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null); }}
              placeholder="www.yoursite.com"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving || !input.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2 shrink-0"
          >
            {isSaving && <Loader2Icon size={13} className="animate-spin" />}
            {isSaving ? "Connecting…" : "Connect"}
          </button>
        </form>
      )}

      {/* Domain connected */}
      {savedDomain && (
        <>
          {/* Domain + status row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg truncate">
                {savedDomain}
              </code>
              <StatusBadge status={status} />
            </div>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Remove domain"
            >
              {isRemoving ? (
                <Loader2Icon size={12} className="animate-spin" />
              ) : (
                <Trash2Icon size={12} />
              )}
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          </div>

          {/* Vercel not configured notice */}
          {skipped && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
              Domain saved. To enable routing and SSL, set{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">VERCEL_ACCESS_TOKEN</code>{" "}
              and{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">VERCEL_PROJECT_ID</code>{" "}
              in your environment variables.
            </div>
          )}

          {/* DNS instructions */}
          {!skipped && verification.length > 0 && status !== "verified" && (
            <DnsInstructions records={verification} />
          )}

          {/* Check verification button */}
          {status !== "verified" && !skipped && (
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {isChecking ? (
                <Loader2Icon size={13} className="animate-spin" />
              ) : (
                <CheckCircle2Icon size={13} />
              )}
              {isChecking ? "Checking…" : "Check verification"}
            </button>
          )}

          {/* Verified state */}
          {status === "verified" && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Your domain is verified and SSL is active. Visitors to{" "}
              <strong>{savedDomain}</strong> will see this site.
            </p>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: DomainStatus }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2Icon size={11} />
        Active
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <ClockIcon size={11} />
        Pending DNS
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <XCircleIcon size={11} />
        Error
      </span>
    );
  return null;
}

/* ── DNS instructions card ────────────────────────────────────────── */

function DnsInstructions({ records }: { records: VerificationRecord[] }) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-900">
        Add this DNS record at your domain registrar (GoDaddy, Namecheap, etc.)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-blue-700 border-b border-blue-200">
              <th className="text-left pb-2 pr-4 font-semibold">Type</th>
              <th className="text-left pb-2 pr-4 font-semibold">Name</th>
              <th className="text-left pb-2 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {records.map((r, i) => (
              <tr key={i}>
                <td className="py-2 pr-4 font-mono font-semibold text-blue-800">{r.type}</td>
                <td className="py-2 pr-4 font-mono text-blue-800">
                  {/* Show just the subdomain label, not the full FQDN */}
                  {r.domain.replace(/\.$/, "").split(".")[0]}
                </td>
                <td className="py-2">
                  <CopyableValue value={r.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-blue-700">
        DNS changes can take up to 48 hours to propagate. Click{" "}
        <strong>Check verification</strong> once you&apos;ve added the record.
      </p>
    </div>
  );
}

/* ── Copyable value cell ──────────────────────────────────────────── */

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-blue-800 break-all">{value}</code>
      <button
        onClick={handleCopy}
        className="shrink-0 p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
        title="Copy"
      >
        {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
      </button>
    </div>
  );
}

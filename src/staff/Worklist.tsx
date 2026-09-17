// Staff → Work list. Everyone due for a refill across BOTH PrimeRX databases,
// one row per person, most actionable first. "Authorised" means a live per-Rx
// auto-refill consent is on file — the pharmacy may fill without calling.
// Phone numbers are tel: links so a desk phone / softphone works today;
// outcome logging plugs into the same rows next.

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { useApp } from "@/context";
import { getWorklist, type WorklistQuery } from "@/lib/api";
import type { Worklist as WorklistData, WorklistPerson, WorklistRx } from "@/lib/types";
import { fmtDate } from "@/lib/dates";

const LANG: Record<number, string> = { 1: "EN", 2: "ES", 3: "RU", 4: "ZH", 5: "KO" };

function fmtPhone(d: string | null): string {
  if (!d) return "—";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function Overdue({ days }: { days: number | null }) {
  if (days == null) return <span className="muted">—</span>;
  if (days < 0) return <span className="wl-overdue">ran out {-days}d ago</span>;
  if (days === 0) return <span className="wl-due">due today</span>;
  return <span className="muted">due in {days}d</span>;
}

function RxLine({ rx }: { rx: WorklistRx }) {
  return (
    <div className="wl-rx">
      <span className={`staff-badge wl-db-${rx.db}`}>{rx.db === "340b" ? "340B" : "CONV"}</span>
      <span className="wl-drug">{rx.drugName ?? "—"}</span>
      <span className="muted">Rx {rx.rxno} · {rx.refillsRemaining} refills left · {rx.daysSupply ?? "?"}d supply</span>
      <Overdue days={rx.daysRemaining} />
      {rx.consentUntil ? <span className="wl-tag wl-tag-ok" title={`Auto-refill consent until ${fmtDate(rx.consentUntil)}`}>authorised</span> : null}
      {rx.deaClass > 0 ? <span className="wl-tag wl-tag-warn">C{["", "", "II", "III", "IV", "V"][rx.deaClass]}</span> : null}
      {rx.portalRequestId ? <span className="wl-tag wl-tag-info">patient asked {fmtDate(rx.portalRequestedAt)}</span> : null}
      {rx.inPrimeRxQueueSince ? <span className="wl-tag" title={`In PrimeRX refill queue since ${fmtDate(rx.inPrimeRxQueueSince)}`}>in PrimeRX queue</span> : null}
      <span className="muted">{rx.handoff === "delivery" ? "🚚 delivery" : "🏪 pickup"}</span>
    </div>
  );
}

function PersonRow({ p }: { p: WorklistPerson }) {
  const [open, setOpen] = useState(false);
  const num = p.mobile ?? p.phone;
  const name = [p.lastName, p.firstName].filter(Boolean).join(", ") || "—";
  return (
    <>
      <tr className={`wl-person${p.hasPortalRequest ? " is-requested" : ""}`} onClick={() => setOpen((o) => !o)}>
        <td className="wl-name">
          {name}
          <div className="muted wl-sub">
            DOB {fmtDate(p.dob)} · {p.records.map((r) => `${r.db === "340b" ? "340B" : "CONV"} #${r.patientno}`).join(" · ")}
            {p.languageNo && p.languageNo !== 1 ? ` · ${LANG[p.languageNo] ?? p.languageNo}` : ""}
          </div>
        </td>
        <td>
          {num ? (
            <a className="wl-tel" href={`tel:+1${num}`} onClick={(e) => e.stopPropagation()}>
              📞 {fmtPhone(num)}
            </a>
          ) : (
            <span className="muted">no number</span>
          )}
        </td>
        <td>{p.rxCount}</td>
        <td>{p.consentCount > 0 ? <span className="wl-tag wl-tag-ok">{p.consentCount} authorised</span> : <span className="muted">—</span>}</td>
        <td><Overdue days={p.mostOverdueDays > 0 ? -p.mostOverdueDays : null} /></td>
        <td>{p.hasPortalRequest ? <span className="wl-tag wl-tag-info">portal request</span> : null}</td>
      </tr>
      {open ? (
        <tr className="wl-detail">
          <td colSpan={6}>
            {p.rx.map((rx) => <RxLine key={`${rx.db}-${rx.rxno}`} rx={rx} />)}
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default function Worklist() {
  const { pushToast } = useApp();
  // pushToast is a fresh function each render; keep it out of the effect deps
  // or every render re-fetches (and re-audits) the whole list.
  const toast = useRef(pushToast);
  toast.current = pushToast;
  const [q, setQ] = useState<WorklistQuery>({ db: "340b", consent: "any", ranOut: "any" });
  const [data, setData] = useState<WorklistData | null>(null);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    if (refresh) setRefreshing(true);
    try {
      const next = await getWorklist({ ...q, refresh });
      setData(next);
      if (refresh) {
        const b = next.totals.byDb;
        toast.current(
          `Re-read both databases: 340B ${b["340b"]?.people ?? 0} people, Conventional ${b["conventional"]?.people ?? 0}.`,
        );
      }
    } catch (e) {
      toast.current((e as Error).message || "Couldn't load the work list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [q]);
  useEffect(() => { void load(); }, [load]);

  const t = data?.totals;
  return (
    <div className="staff-page">
      <div className="row-spread">
        <div>
          <h1 className="staff-h1">Work list</h1>
          <p className="muted">
            Due for a refill (PrimeRX's own verdict), one row per person across both databases.
            {data ? ` Snapshot ${new Date(data.generatedAt).toLocaleTimeString()}.` : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" leadingIcon="refresh-cw" onClick={() => void load(true)} disabled={loading}>
          {refreshing ? "Re-reading PrimeRX…" : loading ? "Loading…" : "Refresh from PrimeRX"}
        </Button>
      </div>

      {t ? (
        <div className="wl-stats">
          <div><b>{t.byDb["340b"]?.people ?? 0}</b> people · {t.byDb["340b"]?.rx ?? 0} Rx <span className="muted">340B</span></div>
          <div><b>{t.byDb["conventional"]?.people ?? 0}</b> people · {t.byDb["conventional"]?.rx ?? 0} Rx <span className="muted">Conventional</span></div>
          <div><b>{t.withConsent}</b> <span className="muted">people with authorisation on file</span></div>
          <div><b>{t.ranOut}</b> <span className="muted">people already ran out</span></div>
        </div>
      ) : null}

      <div className="wl-filters">
        <label>Database
          <select className="input" value={q.db} onChange={(e) => setQ({ ...q, db: e.target.value as WorklistQuery["db"] })}>
            <option value="340b">340B</option>
            <option value="conventional">Conventional</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label>Authorisation
          <select className="input" value={q.consent} onChange={(e) => setQ({ ...q, consent: e.target.value as WorklistQuery["consent"] })}>
            <option value="any">Any</option>
            <option value="yes">Authorised (consent on file)</option>
            <option value="no">Needs a call</option>
          </select>
        </label>
        <label>Supply
          <select className="input" value={q.ranOut} onChange={(e) => setQ({ ...q, ranOut: e.target.value as WorklistQuery["ranOut"] })}>
            <option value="any">Any</option>
            <option value="yes">Already ran out</option>
          </select>
        </label>
        {data ? <span className="muted">{data.matched} people match</span> : null}
      </div>

      {refreshing ? (
        <div className="staff-callout wl-progress">
          <span className="wl-spinner" /> Re-reading both PrimeRX databases — about 10 seconds. The list below is the previous snapshot.
        </div>
      ) : null}

      <table className={`staff-table wl-table${loading && data ? " is-stale" : ""}`}>
        <thead>
          <tr><th>Patient</th><th>Phone</th><th>Rx due</th><th>Authorised</th><th>Supply</th><th /></tr>
        </thead>
        <tbody>
          {loading && !data ? (
            <tr><td colSpan={6} className="muted">Reading both databases… (first load takes ~10s)</td></tr>
          ) : data?.people.length ? (
            data.people.map((p) => <PersonRow key={p.key} p={p} />)
          ) : (
            <tr><td colSpan={6} className="muted">Nobody matches these filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

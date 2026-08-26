// Prescription detail — real data from GET /prescriptions/:rxno.
//
// Everything here comes from PrimeRX: supply, prescriber, and the actual fill
// history. Sections the old mock carried that have no data source (price/cost,
// indication, the delivery-scheduling wizard, a hardcoded pharmacy + insurance
// card) are intentionally gone rather than faked. Refills go to the pharmacist
// queue — nothing is dispensed until a human acts.

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Banner, Button, Card, Pill } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { useApp } from "@/context";
import { ApiError, cancelRequest, getPrescription, requestRefill } from "@/lib/api";
import type { ApiRxDetail } from "@/lib/types";
import { daysLeftFrom } from "@/lib/mappers";
import { PHARMACY, PHARMACY_TEL } from "@/lib/pharmacy";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** PrimeRX stores "02:41:19 PM"; drop the seconds and the leading zero. */
function fmtTime(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
  if (!m) return t;
  return `${String(Number(m[1]))}:${m[2]}${m[3] ? ` ${m[3].toUpperCase()}` : ""}`;
}

function fmtPhone(raw: string | null): string {
  const d = (raw ?? "").replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return raw?.trim() || "—";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--fg-3)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div className="tabular" style={{ fontSize: 32, fontWeight: 700, color: "var(--fg-1)", marginTop: 4 }}>
        {value}
      </div>
      {sub ? <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}

export default function PrescriptionDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { pushToast, refreshPrescriptions } = useApp();

  const [detail, setDetail] = useState<ApiRxDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refilling, setRefilling] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      setDetail(await getPrescription(id));
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 404) setNotFound(true);
      else {
        // eslint-disable-next-line no-console
        console.error("failed to load prescription", e);
        pushToast(err.message || "Couldn't load that prescription.");
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="page" data-screen-label="Prescription detail">
        <PageHeader title="Loading…" crumbs={[{ label: "Prescriptions", to: "/prescriptions" }]} />
      </main>
    );
  }

  if (notFound || !detail) {
    return (
      <main className="page" data-screen-label="Prescription detail">
        <PageHeader
          title="Prescription not found"
          sub="We couldn't find that prescription on your record."
          crumbs={[{ label: "Prescriptions", to: "/prescriptions" }]}
        />
        <Button variant="secondary" onClick={() => nav("/prescriptions")}>
          Back to prescriptions
        </Button>
      </main>
    );
  }

  const { rx, delivery, prescriber, history, pendingRefillRequest } = detail;
  const title = [rx.drugName, rx.drugStrength].filter(Boolean).join(" ") || `Rx ${rx.rxno}`;
  const daysLeft = daysLeftFrom(rx.lastFilledAt, rx.daysSupply);
  const canRefill = rx.refillsRemaining > 0 && !pendingRefillRequest;

  const onRefill = async () => {
    if (!canRefill || refilling) return;
    setRefilling(true);
    try {
      await requestRefill(rx.rxno);
      pushToast(`Sent to the pharmacy. If you need it urgently, call ${PHARMACY.phone}.`);
      await load();
      void refreshPrescriptions();
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "request_already_pending") {
        pushToast("You've already requested a refill for this prescription.");
        await load();
      } else if (err.code === "no_refills_remaining") {
        pushToast("No refills left — your prescriber needs to authorise a new one.");
      } else {
        pushToast(err.message || "Couldn't request that refill. Please try again.");
      }
    } finally {
      setRefilling(false);
    }
  };

  // Only possible while the request is still pending — once a pharmacist has
  // claimed it the server refuses, and we surface that rather than pretending.
  const onCancelRefill = async () => {
    if (!pendingRefillRequest || canceling) return;
    setCanceling(true);
    try {
      await cancelRequest(pendingRefillRequest.id);
      pushToast("Refill request canceled.");
      await load();
      void refreshPrescriptions();
    } catch (e) {
      const err = e as ApiError;
      pushToast(
        err.code === "request_not_cancelable"
          ? "The pharmacy has already started on this request — call us if you need to stop it."
          : err.message || "Couldn't cancel that request. Please try again.",
      );
      await load();
    } finally {
      setCanceling(false);
    }
  };

  const prescriberName = prescriber
    ? [prescriber.firstName, prescriber.lastName].filter(Boolean).join(" ").trim()
    : "";

  return (
    <main className="page" data-screen-label="Prescription detail">
      <PageHeader
        crumbs={[{ label: "Prescriptions", to: "/prescriptions" }, { label: title }]}
        title={title}
        sub={rx.sig ?? undefined}
        action={
          <div className="row">
            <Button
              variant="primary"
              leadingIcon="refresh-cw"
              onClick={onRefill}
              disabled={!canRefill || refilling}
            >
              {refilling
                ? "Requesting…"
                : pendingRefillRequest
                  ? "Refill requested"
                  : rx.refillsRemaining > 0
                    ? "Request refill"
                    : "No refills left"}
            </Button>
          </div>
        }
      />

      {pendingRefillRequest ? (
        <Banner tone="info" icon="info" title="Refill requested.">
          Sent {fmtDate(pendingRefillRequest.requestedAt)} — a pharmacist is reviewing it. We'll let
          you know when it's ready.
        </Banner>
      ) : null}

      <div className="detail-grid">
        <div className="col-stack">
          <Card title="Status & supply">
            <div style={{ padding: 20 }}>
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <Stat
                  label="Days left"
                  value={daysLeft ?? "—"}
                  sub={<>Last filled: <b style={{ color: "var(--fg-1)" }}>{fmtDate(rx.lastFilledAt)}</b></>}
                />
                <Stat
                  label="Refills remaining"
                  value={
                    <>
                      {rx.refillsRemaining}
                      <span style={{ fontSize: 16, color: "var(--fg-3)", fontWeight: 500 }}>
                        {" "}/ {rx.refillsTotal}
                      </span>
                    </>
                  }
                />
                <Stat
                  label="Per fill"
                  value={
                    <>
                      {rx.qtyOrdered ?? "—"}
                      {rx.drugForm ? (
                        <span style={{ fontSize: 16, color: "var(--fg-3)", fontWeight: 500 }}>
                          {" "}{rx.drugForm}
                        </span>
                      ) : null}
                    </>
                  }
                  sub={rx.daysSupply ? <>{rx.daysSupply}-day supply</> : undefined}
                />
              </div>
            </div>
          </Card>

          <Card title="Prescription details">
            <div style={{ padding: 20 }}>
              <div className="kv">
                <span className="k">Medication</span>
                <span className="v">{title}</span>
                <span className="k">Directions</span>
                <span className="v">{rx.sig || "—"}</span>
                <span className="k">Form</span>
                <span className="v">{rx.drugForm || "—"}</span>
                <span className="k">Rx number</span>
                <span className="v">{rx.rxno}</span>
                <span className="k">NDC</span>
                <span className="v">{rx.ndc || "—"}</span>
                {rx.is340b ? (
                  <>
                    <span className="k">Program</span>
                    <span className="v">340B</span>
                  </>
                ) : null}
              </div>
            </div>
          </Card>

          <Card title="Fill history">
            {history.length > 0 ? (
              history.map((h) => (
                <div key={h.refillNo} className="list-row" style={{ cursor: "default" }}>
                  <span className="rx-tile" style={{ background: "var(--slate-100)", color: "var(--fg-3)" }}>
                    <Icon name="check-circle" />
                  </span>
                  <div className="list-main">
                    <div className="list-name">
                      {h.refillNo === 0 ? "Original fill" : `Refill ${h.refillNo}`}
                    </div>
                    <div className="list-meta">
                      Filled {fmtDate(h.filledAt)}
                      {h.qtyDispensed ? ` · ${h.qtyDispensed} dispensed` : ""}
                    </div>
                    {h.handoff === "delivered" && h.delivery?.address ? (
                      <div className="list-meta" style={{ marginTop: 2 }}>
                        <Icon name="map-pin" /> {h.delivery.address}
                      </div>
                    ) : null}
                  </div>
                  <div className="list-right">
                    {h.pickedUp ? (
                      <Pill tone="success" icon={h.handoff === "delivered" ? "truck" : "check"}>
                        {h.handoff === "delivered" ? "Delivered" : "Picked up"}{" "}
                        {fmtDate(h.pickupDate)}
                        {fmtTime(h.pickupTime) ? `, ${fmtTime(h.pickupTime)}` : ""}
                      </Pill>
                    ) : (
                      <Pill tone="neutral">Not collected</Pill>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: 20 }} className="muted">
                No fills recorded yet.
              </div>
            )}
          </Card>
        </div>

        <div className="col-stack">
          {rx.handoff ? (
            <Card
              title={
                rx.handoff === "awaiting_delivery"
                  ? "Delivery"
                  : rx.handoff === "delivered"
                    ? "Latest delivery"
                    : "Latest pickup"
              }
            >
              <div style={{ padding: 20 }}>
                <div className="kv">
                  <span className="k">Status</span>
                  <span className="v">
                    {rx.handoff === "awaiting_delivery" ? (
                      <Pill tone="info" icon="truck">
                        Scheduled for delivery
                      </Pill>
                    ) : (
                      <>
                        {rx.handoff === "delivered" ? "Delivered " : "Picked up "}
                        {fmtDate(rx.pickupDate)}
                        {fmtTime(rx.pickupTime) ? ` at ${fmtTime(rx.pickupTime)}` : ""}
                      </>
                    )}
                  </span>
                  {rx.handoff === "awaiting_delivery" && delivery?.requestedDate ? (
                    <>
                      <span className="k">Expected</span>
                      <span className="v">{fmtDate(delivery.requestedDate)}</span>
                    </>
                  ) : null}
                  {rx.handoff !== "picked_up" && delivery?.address ? (
                    <>
                      <span className="k">Address</span>
                      <span className="v">{delivery.address}</span>
                    </>
                  ) : null}
                  {rx.handoff === "delivered" && delivery?.driver ? (
                    <>
                      <span className="k">Driver</span>
                      <span className="v">{delivery.driver}</span>
                    </>
                  ) : null}
                  {delivery?.instructions ? (
                    <>
                      <span className="k">Instructions</span>
                      <span className="v">{delivery.instructions}</span>
                    </>
                  ) : null}
                  {delivery?.trackingNo ? (
                    <>
                      <span className="k">Tracking</span>
                      <span className="v">{delivery.trackingNo}</span>
                    </>
                  ) : null}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 14 }}>
                  Something wrong with this {rx.handoff === "picked_up" ? "pickup" : "delivery"}?
                  Call us at{" "}
                  <a className="link" style={{ display: "inline" }} href={`tel:${PHARMACY_TEL}`}>
                    {PHARMACY.phone}
                  </a>
                  .
                </div>
              </div>
            </Card>
          ) : null}

          <Card title="Prescriber">
            <div style={{ padding: 20 }}>
              {prescriber && (prescriberName || prescriber.npi) ? (
                <div className="kv">
                  <span className="k">Name</span>
                  <span className="v">{prescriberName || "—"}</span>
                  <span className="k">Phone</span>
                  <span className="v">{fmtPhone(prescriber.phone)}</span>
                  <span className="k">NPI</span>
                  <span className="v">{prescriber.npi || "—"}</span>
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 14 }}>
                  Prescriber details aren't on file for this prescription.
                </div>
              )}
            </div>
          </Card>

          <Card title="Need a refill?">
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="muted" style={{ fontSize: 14 }}>
                {rx.refillsRemaining > 0
                  ? "Requesting a refill sends it to our pharmacists. They'll prepare it and let you know when it's ready."
                  : rx.renewalRequestedAt
                    ? `No refills left — we asked ${prescriberName || "your prescriber"} for a renewal on ${fmtDate(rx.renewalRequestedAt)} and are waiting to hear back. We'll fill it as soon as they authorise it.`
                    : "This prescription has no refills left. Your prescriber needs to authorise a new one — give us a call and we'll chase it for you."}
              </div>
              <Button
                variant={canRefill ? "primary" : "secondary"}
                block
                onClick={onRefill}
                disabled={!canRefill || refilling}
              >
                {refilling
                  ? "Requesting…"
                  : pendingRefillRequest
                    ? "Refill already requested"
                    : rx.refillsRemaining > 0
                      ? "Request refill"
                      : "No refills left"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

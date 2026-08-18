// Dashboard layout A — stat-tile grid with two-column lists.

import { useNavigate } from "react-router-dom";
import { Banner, Button, Card, StatTile } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { MedicationRow, DeliveryItem } from "@/components/rows";
import { PageHeader } from "@/components/Layout";
import { DELIVERIES } from "@/data";
import { useApp } from "@/context";

export default function DashboardA() {
  const nav = useNavigate();
  const { patient, prescriptions } = useApp();
  const readyToRefill = prescriptions.filter(
    (m) => m.statusTone === "success" || m.statusTone === "warning",
  ).length;
  const visible = prescriptions.slice(0, 4);

  return (
    <main className="page" data-screen-label="Dashboard A">
      <PageHeader
        title={`Good morning, ${patient.name.split(" ")[0]}`}
        sub={`You have <b>${readyToRefill} prescriptions</b> ready to refill and <b>1 delivery</b> arriving today.`}
        action={
          <div className="row">
            <Button
              variant="secondary"
              leadingIcon="message-square"
              onClick={() => nav("/messages")}
            >
              Contact pharmacy
            </Button>
            <Button
              variant="primary"
              leadingIcon="plus"
              onClick={() => nav("/prescriptions")}
            >
              Request refill
            </Button>
          </div>
        }
      />

      <Banner
        tone="info"
        icon="info"
        title="Lisinopril refill ready for pickup."
        action={
          <Button variant="secondary" size="sm" onClick={() => nav("/rx/lisin")}>
            View
          </Button>
        }
      >
        Available at Maple St. Pharmacy until Friday, May 8 — or schedule delivery.
      </Banner>

      <div className="stat-grid">
        <StatTile
          icon="pill"
          iconTone="brand"
          label="Active prescriptions"
          value={prescriptions.length}
          sub={`<b>${readyToRefill}</b> ready to refill`}
          onClick={() => nav("/prescriptions")}
        />
        <StatTile
          icon="package"
          iconTone="warning"
          label="In transit"
          value="1"
          sub="arriving <b>today</b>, 2:00–4:00 PM"
          onClick={() => nav("/prescriptions")}
        />
      </div>

      <div className="cols">
        <Card
          title="Your prescriptions"
          action={
            <button className="link" onClick={() => nav("/prescriptions")} type="button">
              View all <Icon name="arrow-right" />
            </button>
          }
        >
          <div role="list">
            {visible.map((m) => (
              <MedicationRow
                key={m.id}
                med={{
                  ...m,
                  displayName: `${m.name} ${m.strength}`,
                  displaySig: `${m.qtyPerFill} ${m.form}s · ${m.sig
                    .replace("Take ", "")
                    .replace(" by mouth", "")}`,
                }}
                onClick={() => nav(`/rx/${m.id}`)}
              />
            ))}
          </div>
        </Card>

        <div className="col-stack">
          <Card
            title="Upcoming deliveries"
            action={
              <button
                className="link"
                onClick={() => nav("/prescriptions")}
                type="button"
              >
                Track all <Icon name="arrow-right" />
              </button>
            }
          >
            {DELIVERIES.slice(0, 3).map((d) => (
              <DeliveryItem
                key={d.id}
                when={d.when}
                time={d.time}
                items={d.items}
                status={d.status}
                statusTone={d.statusTone}
                dotState={d.dot}
              />
            ))}
          </Card>

        </div>
      </div>
    </main>
  );
}

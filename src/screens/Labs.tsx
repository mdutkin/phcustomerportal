// Lab results list — category chips filter the panel.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { LabResultRow } from "@/components/rows";
import { PageHeader } from "@/components/Layout";
import { LAB_RESULTS } from "@/data";

export default function Labs() {
  const nav = useNavigate();
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(LAB_RESULTS.map((l) => l.category)))];
  const list =
    cat === "All" ? LAB_RESULTS : LAB_RESULTS.filter((l) => l.category === cat);

  return (
    <main className="page" data-screen-label="Lab results">
      <PageHeader
        title="Lab results"
        sub="From your blood draw on <b>April 24, 2026</b>. Reviewed by Dr. Patel on April 26."
        action={
          <Button variant="secondary" leadingIcon="download">
            Download PDF
          </Button>
        }
      />

      <div className="row" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${cat === c ? "active" : ""}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <Card>
        {list.map((l) => (
          <LabResultRow key={l.id} lab={l} onClick={() => nav(`/lab/${l.id}`)} />
        ))}
      </Card>
    </main>
  );
}

// Shop — OTC catalog browse with category chips and add-to-cart.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Pill } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { OTC_PRODUCTS } from "@/data";
import { useApp } from "@/context";

export default function Shop() {
  const nav = useNavigate();
  const { cart, addToCart } = useApp();
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(OTC_PRODUCTS.map((p) => p.category)))];
  const list =
    cat === "All" ? OTC_PRODUCTS : OTC_PRODUCTS.filter((p) => p.category === cat);
  const cartTotal = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <main className="page" data-screen-label="Shop">
      <PageHeader
        title="Shop over-the-counter"
        sub="Pain relief, vitamins, first aid, and daily living. <b>No prescription needed.</b>"
        action={
          <Button
            variant="secondary"
            leadingIcon="shopping-cart"
            onClick={() => nav("/cart")}
          >
            Cart {cartTotal > 0 ? `(${cartTotal})` : ""}
          </Button>
        }
      />

      <div className="cat-row">
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

      <div className="shop-grid">
        {list.map((p) => (
          <div key={p.id} className="product-card">
            <div className="product-thumb">
              <Icon name={p.icon as IconName} />
              {p.sale ? <Pill tone="warning">Sale</Pill> : null}
            </div>
            <div>
              <div className="product-name">{p.name}</div>
              <div className="product-meta">
                {p.brand} · {p.pack}
              </div>
            </div>
            <div
              className="row"
              style={{ gap: 6, fontSize: 12, color: "var(--fg-3)" }}
            >
              <Icon
                name="star"
                style={{ width: 14, height: 14, color: "var(--warning-600)" }}
              />
              <span className="tabular">
                <b style={{ color: "var(--fg-2)" }}>{p.rating}</b>
              </span>
              <span>·</span>
              <span>{p.category}</span>
            </div>
            <div className="product-foot">
              <span className="product-price tabular">${p.price.toFixed(2)}</span>
              <Button
                variant="secondary"
                size="sm"
                leadingIcon="plus"
                onClick={() => addToCart(p)}
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// Cart + checkout + done — three-step state machine.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Field } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { PATIENT } from "@/data";
import { useApp } from "@/context";

type Step = "cart" | "checkout" | "done";

export default function Cart() {
  const nav = useNavigate();
  const { cart, setCart, pushToast } = useApp();
  const [step, setStep] = useState<Step>("cart");

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const shipping = subtotal > 35 ? 0 : 4.99;
  const tax = +(subtotal * 0.0875).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c
        .map((x) =>
          x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x,
        )
        .filter((x) => x.qty > 0),
    );
  };
  const removeItem = (id: string) =>
    setCart((c) => c.filter((x) => x.id !== id));

  if (cart.length === 0 && step === "cart") {
    return (
      <main className="page" data-screen-label="Cart empty">
        <PageHeader title="Your cart" />
        <Card>
          <div style={{ padding: 64, textAlign: "center" }}>
            <Icon
              name="shopping-cart"
              style={{ width: 40, height: 40, color: "var(--fg-4)" }}
            />
            <p
              style={{
                fontSize: 16,
                color: "var(--fg-1)",
                fontWeight: 600,
                marginTop: 16,
                marginBottom: 4,
              }}
            >
              Your cart is empty
            </p>
            <p
              className="muted"
              style={{ fontSize: 14, marginTop: 0, marginBottom: 20 }}
            >
              Browse over-the-counter products and add what you need.
            </p>
            <Button
              variant="primary"
              leadingIcon="shopping-bag"
              onClick={() => nav("/shop")}
            >
              Browse shop
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="page" data-screen-label="Cart">
      <PageHeader
        crumbs={[
          { label: "Shop", to: "/shop" },
          {
            label:
              step === "cart"
                ? "Cart"
                : step === "checkout"
                  ? "Checkout"
                  : "Confirmation",
          },
        ]}
        title={
          step === "cart"
            ? "Your cart"
            : step === "checkout"
              ? "Checkout"
              : "Order confirmed"
        }
      />

      {step === "cart" && (
        <div className="cols">
          <Card title={`${cart.length} item${cart.length === 1 ? "" : "s"}`}>
            <div style={{ padding: "0 20px" }}>
              {cart.map((c) => (
                <div key={c.id} className="cart-item">
                  <div className="cart-thumb">
                    <Icon name={c.icon as IconName} />
                  </div>
                  <div className="cart-main">
                    <div className="cart-name">{c.name}</div>
                    <div className="cart-meta">
                      {c.brand} · {c.pack}
                    </div>
                    <div className="cart-foot">
                      <div className="qty-stepper">
                        <button
                          type="button"
                          onClick={() => updateQty(c.id, -1)}
                          aria-label="Decrease"
                        >
                          <Icon name="minus" />
                        </button>
                        <span className="qty">{c.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(c.id, 1)}
                          aria-label="Increase"
                        >
                          <Icon name="plus" />
                        </button>
                      </div>
                      <div className="row" style={{ gap: 12 }}>
                        <button
                          type="button"
                          className="link"
                          onClick={() => removeItem(c.id)}
                          style={{ color: "var(--fg-3)" }}
                        >
                          Remove
                        </button>
                        <span className="cart-price">
                          ${(c.price * c.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="summary-card">
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--fg-1)",
                marginBottom: 4,
              }}
            >
              Order summary
            </div>
            <div className="summary-row">
              <span className="k">Subtotal</span>
              <span className="v">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="k">Shipping</span>
              <span className="v">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row">
              <span className="k">Tax (est.)</span>
              <span className="v">${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span className="k">Total</span>
              <span className="v">${total.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              block
              onClick={() => setStep("checkout")}
              leadingIcon="credit-card"
            >
              Checkout
            </Button>
            <Button variant="ghost" size="sm" block onClick={() => nav("/shop")}>
              Continue shopping
            </Button>
          </div>
        </div>
      )}

      {step === "checkout" && (
        <div className="cols">
          <div className="col-stack">
            <Card title="Delivery address">
              <div style={{ padding: 20 }}>
                <Field label="Address">
                  <input className="input" defaultValue={PATIENT.address} />
                </Field>
              </div>
            </Card>
            <Card title="Delivery option">
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <label className="time-window selected" style={{ cursor: "pointer" }}>
                  <span>
                    <b>Standard delivery</b> · 2 business days
                  </span>
                  <span className="tabular">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </label>
                <label className="time-window" style={{ cursor: "pointer" }}>
                  <span>
                    <b>Same day</b> · arrive by 8 PM today
                  </span>
                  <span className="tabular">$8.99</span>
                </label>
              </div>
            </Card>
            <Card title="Payment">
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <label className="time-window selected" style={{ cursor: "pointer" }}>
                  <span className="row" style={{ gap: 10 }}>
                    <Icon name="credit-card" />
                    <span>
                      <b>Visa</b> ending in 4242 · exp 08/28
                    </span>
                  </span>
                  <Icon name="check" style={{ color: "var(--brand-primary)" }} />
                </label>
                <button
                  type="button"
                  className="link"
                  style={{ alignSelf: "flex-start" }}
                >
                  + Add new card
                </button>
              </div>
            </Card>
          </div>
          <div className="summary-card">
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--fg-1)",
                marginBottom: 4,
              }}
            >
              Order summary
            </div>
            {cart.map((c) => (
              <div key={c.id} className="summary-row">
                <span className="k">
                  {c.name} × {c.qty}
                </span>
                <span className="v">${(c.price * c.qty).toFixed(2)}</span>
              </div>
            ))}
            <div
              className="summary-row"
              style={{ borderTop: "1px solid var(--slate-200)", paddingTop: 14 }}
            >
              <span className="k">Shipping</span>
              <span className="v">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summary-row">
              <span className="k">Tax</span>
              <span className="v">${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span className="k">Total</span>
              <span className="v">${total.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              block
              leadingIcon="lock"
              onClick={() => setStep("done")}
            >
              Place order — ${total.toFixed(2)}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              block
              onClick={() => setStep("cart")}
            >
              Back to cart
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div style={{ maxWidth: 560, margin: "32px auto" }}>
          <Card>
            <div style={{ padding: 40, textAlign: "center" }}>
              <span
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  background: "var(--success-bg)",
                  color: "var(--success-700)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name="check" style={{ width: 32, height: 32 }} />
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--fg-1)",
                  margin: "0 0 6px",
                }}
              >
                Order placed
              </h2>
              <p
                className="muted"
                style={{ fontSize: 15, margin: "0 0 24px" }}
              >
                Order #M-2026-04293 · We'll text you tracking when it ships.
              </p>
              <div
                style={{
                  padding: 16,
                  background: "var(--slate-50)",
                  borderRadius: 8,
                  textAlign: "left",
                  marginBottom: 20,
                }}
              >
                <div className="row-spread">
                  <span className="muted">Total charged</span>
                  <span className="tabular" style={{ fontWeight: 700 }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="row-spread" style={{ marginTop: 6 }}>
                  <span className="muted">Delivery to</span>
                  <span style={{ color: "var(--fg-1)" }}>
                    {PATIENT.address.split(",")[0]}
                  </span>
                </div>
                <div className="row-spread" style={{ marginTop: 6 }}>
                  <span className="muted">Arriving</span>
                  <span style={{ color: "var(--fg-1)", fontWeight: 600 }}>
                    Wed, May 6
                  </span>
                </div>
              </div>
              <div
                className="row"
                style={{ justifyContent: "center", gap: 10 }}
              >
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCart([]);
                    nav("/shop");
                  }}
                >
                  Continue shopping
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCart([]);
                    pushToast("Order placed — thanks!");
                    nav("/");
                  }}
                >
                  Back to dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}

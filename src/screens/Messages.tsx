// Messages — conversation list + active thread with composer.

import { Fragment, useState } from "react";
import { Button, Card } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/Layout";
import { MESSAGES, THREAD_PHARM, type ThreadMsg } from "@/data";

export default function Messages() {
  const [active, setActive] = useState("t1");
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState<ThreadMsg[]>(THREAD_PHARM);

  const send = () => {
    if (!draft.trim()) return;
    setThread((t) => [
      ...t,
      { from: "me", text: draft.trim(), time: "Just now" },
    ]);
    setDraft("");
    setTimeout(() => {
      setThread((t) => [
        ...t,
        {
          from: "them",
          text: "Got it — I'll update your file and confirm by text shortly. Anything else?",
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  const iconForWho = (who: string): IconName =>
    who === "doc" ? "stethoscope" : who === "support" ? "headphones" : "pill";

  return (
    <main className="page" data-screen-label="Messages">
      <PageHeader
        title="Messages"
        sub="Talk to your pharmacist or care team. Average reply in <b>12 minutes</b>."
      />

      <div className="cols-1-2" style={{ alignItems: "stretch" }}>
        <Card title="Conversations">
          {MESSAGES.map((m) => (
            <div
              key={m.id}
              className="list-row"
              onClick={() => setActive(m.id)}
              style={{ background: active === m.id ? "var(--brand-tint)" : "" }}
            >
              <span
                className="rx-tile"
                style={{
                  background:
                    m.who === "doc"
                      ? "var(--success-bg)"
                      : m.who === "support"
                        ? "var(--info-bg)"
                        : "var(--brand-tint)",
                  color:
                    m.who === "doc"
                      ? "var(--success-700)"
                      : m.who === "support"
                        ? "var(--info-700)"
                        : "var(--brand-primary)",
                }}
              >
                <Icon name={iconForWho(m.who)} />
              </span>
              <div className="list-main">
                <div className="row-spread">
                  <div className="list-name">{m.from}</div>
                  <span className="caption">{m.time}</span>
                </div>
                <div
                  className="list-meta"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {m.lastSnippet}
                </div>
              </div>
              {m.unread ? (
                <span
                  className="dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: "var(--brand-primary)",
                    flex: "0 0 8px",
                  }}
                />
              ) : null}
            </div>
          ))}
        </Card>

        <Card title="Maple St. Pharmacy" sub="Open until 9:00 PM today">
          <div className="thread">
            {thread.map((m, i) => (
              <Fragment key={i}>
                <div className={`msg ${m.from === "me" ? "msg-me" : "msg-them"}`}>
                  {m.text}
                </div>
                <div className="msg-meta">{m.time}</div>
              </Fragment>
            ))}
          </div>
          <div className="composer">
            <textarea
              className="textarea"
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button variant="primary" onClick={send} leadingIcon="send">
              Send
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

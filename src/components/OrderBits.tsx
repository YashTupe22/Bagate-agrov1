import type { Order } from "../services/types"
import { statusLabel } from "../services/orders"
import Icon from "./Icon"

export function formatTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function StatusPill({ status }: { status: Order["status"] }) {
  return (
    <span className={`status ${String(status).split(" ").join("-")}`}>
      <i />
      {statusLabel(status)}
    </span>
  )
}

export function OrderCard({
  order,
  onOpen,
}: {
  order: Order
  onOpen: () => void
}) {
  return (
    <article className="order-card" onClick={onOpen}>
      <div className="order-card-top">
        <strong>{order.id}</strong>
        <StatusPill status={order.status} />
      </div>
      <p className="order-card-items">
        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
      </p>
      <div className="order-card-bottom">
        <span>
          ₹{order.total} • {order.items.reduce((s, i) => s + i.quantity, 0)}{" "}
          items
        </span>
        <small>{formatTime(order.createdAt)}</small>
      </div>
    </article>
  )
}

export function Timeline({ order }: { order: Order }) {
  return (
    <ol className="order-timeline">
      {order.timeline.map((step, index) => (
        <li
          key={`${step.status}-${step.at}-${index}`}
          className={index === order.timeline.length - 1 ? "current" : ""}
        >
          <span className="timeline-dot">
            {index < order.timeline.length - 1 ? (
              <Icon name="check" size={12} />
            ) : (
              <Icon name="clock" size={12} />
            )}
          </span>
          <div>
            <strong>{statusLabel(step.status)}</strong>
            <small>
              {formatTime(step.at)} — {step.note}
            </small>
          </div>
        </li>
      ))}
    </ol>
  )
}

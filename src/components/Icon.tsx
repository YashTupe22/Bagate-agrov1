import type { ReactNode } from "react"

export type IconName = "arrow" | "bag" | "box" | "chart" | "check" | "chevron" | "clock" | "close" | "grid" | "leaf" | "location" | "menu" | "minus" | "orders" | "plus" | "search" | "settings" | "truck" | "user" | "star" | "phone" | "shield" | "wallet" | "refresh"

export default function Icon({
  name,
  size = 20,
}: {
  name: IconName
  size?: number
}) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="m4 7 8 4v10l8-4V7M8 5l8 4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V4M16 19v-7M22 19H2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    leaf: (
      <>
        <path d="M5 20c1-9 6-15 15-16 0 9-5 15-13 15" />
        <path d="M6 19c3-4 6-7 11-10" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    orders: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    plus: (
      <>
        <path d="M5 12h14M12 5v14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l-2-.5a7 7 0 0 0-1-2l1-2-2-2-2 1a7 7 0 0 0-2 0L9 3 6 4 5.5 6a7 7 0 0 0-1 2L2 9v3l2 .5a7 7 0 0 0 1 2l-1 2 2 2 2-1a7 7 0 0 0 2 1l.5 2.5h3l.5-2.5a7 7 0 0 0 2-1l2 1 2-2-1-2a7 7 0 0 0 1-1Z" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-5 4-7 8-7s7 2 8 7" />
      </>
    ),
    star: (
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3z" />
    ),
    phone: (
      <path d="M7 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 5 5a2 2 0 0 1 2-2Z" />
    ),
    shield: (
      <>
        <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7h18v12H3z" />
        <path d="M3 7l2-3h12l2 3" />
        <circle cx="16" cy="13" r="1.2" />
      </>
    ),
    refresh: (
      <>
        <path d="M4 12a8 8 0 0 1 14-5" />
        <path d="M20 12a8 8 0 0 1-14 5" />
        <path d="M18 4v4h-4M6 20v-4h4" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

import Icon from "./Icon"

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark">
        <Icon name="leaf" size={22} />
      </span>
      <span>
        <strong>Bagate</strong>
        <small>AGRO</small>
      </span>
    </span>
  )
}

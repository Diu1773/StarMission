export default function CardFrame({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="screen">
      <header className="screen__head">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="screen__title">{title}</h1>
        {subtitle && <p className="screen__subtitle">{subtitle}</p>}
      </header>
      <div className="screen__body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

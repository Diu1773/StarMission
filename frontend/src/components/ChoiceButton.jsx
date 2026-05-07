export default function ChoiceButton({ selected, onSelect, children, style }) {
  return (
    <button
      className={`option${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
      style={style}
    >
      <span className="option__indicator" />
      <span>{children}</span>
    </button>
  );
}

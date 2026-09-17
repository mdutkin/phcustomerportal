export default function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="staff-page">
      <h1 className="staff-h1">{title}</h1>
      <p className="muted">{note}</p>
    </div>
  );
}

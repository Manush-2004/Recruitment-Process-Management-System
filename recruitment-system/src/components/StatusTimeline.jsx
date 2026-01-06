const StatusTimeline = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-ds-text-secondary">No status updates</p>}
      {items.map((it) => (
        <div key={it.id} className="p-3 bg-ds-surface rounded-ds-card">
          <p className="text-sm text-ds-text-secondary">{new Date(it.createdAt).toLocaleString()}</p>
          <p className="font-medium">{it.oldStatus} → {it.newStatus}</p>
          <p className="text-sm text-ds-text-secondary">By {it.changedBy}</p>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
const StatusTimeline = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-ds-text-secondary">No status updates</p>}
      {items.map((it) => (
        <div key={it.id} className="p-3 bg-ds-surface rounded-ds-card">
          <p className="text-sm text-ds-text-secondary">{new Date(it.changedAt ?? it.ChangedAt ?? it.createdAt).toLocaleString()}</p>
          <p className="font-medium">{it.oldStatus ?? it.OldStatus} → {it.newStatus ?? it.NewStatus}</p>
          <p className="text-sm text-ds-text-secondary">By {it.changedBy ?? it.ChangedBy}</p>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
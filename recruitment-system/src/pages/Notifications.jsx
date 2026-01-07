import { useNotifications } from '../contexts/NotificationContext';

const NotificationsPage = () => {
  const { notifications, unread, markAllRead } = useNotifications();
  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div>
          <button onClick={markAllRead} className="px-3 py-1 rounded bg-gray-200">Mark all read</button>
        </div>
      </div>
      {notifications.length === 0 ? <p className="text-sm text-ds-text-secondary">No notifications</p> : (
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id} className="p-3 border rounded">
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-ds-text-secondary">{new Date(n.receivedAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
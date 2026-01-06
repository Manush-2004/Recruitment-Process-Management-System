import NavigationBar from '../../components/NavigationBar';
import { useNotifications } from '../../contexts/NotificationContext';

const CandidateNotifications = () => {
  const { notifications, unread, markAllRead } = useNotifications();

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar />
      <main className="max-w-[900px] mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <div>
            {unread > 0 && (
              <button onClick={markAllRead} className="px-3 py-2 bg-blue-600 text-white rounded">Mark all read</button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-ds-text-secondary">No notifications</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="p-4 bg-ds-surface rounded-ds-card">
                <p className="text-sm text-ds-text-secondary">{new Date(n.receivedAt).toLocaleString()}</p>
                <p className="font-medium">{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CandidateNotifications;

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const connectionRef = useRef(null);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications')
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveNotification', (message) => {
      setNotifications((prev) => [{ id: Date.now(), message, receivedAt: new Date() }, ...prev]);
      setUnread((u) => u + 1);
    });

    conn.start().catch((e) => console.error('SignalR start failed', e));

    connectionRef.current = conn;

    return () => {
      conn.stop().catch(() => {});
    };
  }, []);

  const markAllRead = () => setUnread(0);

  const value = {
    notifications,
    unread,
    markAllRead,
    connection: connectionRef.current,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

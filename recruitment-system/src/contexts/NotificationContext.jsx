/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../config/apiRoutes.js';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Use absolute hub URL so client works regardless of how frontend is served (localhost vs IP)
    const hubUrl = new URL('/hubs/notifications', API_BASE_URL).href;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    conn.on('ReceiveNotification', (message) => {
      setNotifications((prev) => [{ id: Date.now(), message, receivedAt: new Date() }, ...prev]);
      setUnread((u) => u + 1);
    });

    // Start with simple retry/backoff so transient network changes don't leave the app blank
    let attempts = 0;
    const startWithRetry = async () => {
      attempts += 1;
      try {
        await conn.start();
        connectionRef.current = conn;
      } catch (err) {
        console.warn('SignalR start failed (attempt ' + attempts + ')', err);
        if (attempts < 6) {
          const delay = Math.min(3000 * attempts, 15000);
          setTimeout(startWithRetry, delay);
        }
      }
    };

    startWithRetry();

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

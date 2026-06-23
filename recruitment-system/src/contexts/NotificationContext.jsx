/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Use absolute hub URL so client works regardless of how frontend is served (localhost vs IP)
    const hubUrl = new URL("/hubs/notifications", API_BASE_URL).href;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on("ReceiveNotification", (message) => {
      setNotifications((prev) => [
        { id: Date.now(), message, receivedAt: new Date() },
        ...prev,
      ]);
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
        console.warn("SignalR start failed (attempt " + attempts + ")", err);

        // If negotiation abort is the cause, try direct WebSocket transport as a fallback
        if (
          err &&
          (err.name === "AbortError" ||
            (err.message && err.message.toLowerCase().includes("negotiation")))
        ) {
          try {
            console.info("SignalR: retrying with WebSockets transport");
            const wsConn = new signalR.HubConnectionBuilder()
              .withUrl(hubUrl, {
                transport: signalR.HttpTransportType.WebSockets,
              })
              .withAutomaticReconnect()
              .build();
            await wsConn.start();
            connectionRef.current = wsConn;
            return;
          } catch (wsErr) {
            console.warn("SignalR websocket fallback failed", wsErr);
          }
        }

        if (attempts < 6) {
          const delay = Math.min(3000 * attempts, 15000);
          setTimeout(startWithRetry, delay);
        }
      }
    };

    startWithRetry();

    return () => {
      const toStop = connectionRef.current || conn;
      if (toStop) {
        // graceful stop
        toStop.stop().catch(() => {});
        if (connectionRef.current === conn) connectionRef.current = null;
      }
    };
  }, []);

  const markAllRead = () => setUnread(0);

  const value = {
    notifications,
    unread,
    markAllRead,
    connection: connectionRef.current,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
};

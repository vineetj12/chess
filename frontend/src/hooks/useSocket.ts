import { useEffect, useRef, useState } from 'react';

export function useSocket(customUrl?: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outboundQueueRef = useRef<string[]>([]);
  const shouldReconnectRef = useRef(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // Build WebSocket URL from current browser location
  const getWebSocketUrl = () => {
    if (customUrl) return customUrl;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;

    const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
    if (envUrl) {
      if (envUrl.startsWith('ws://') || envUrl.startsWith('wss://')) {
        return envUrl;
      }

      if (envUrl.startsWith('/')) {
        return `${protocol}//${window.location.host}${envUrl}`;
      }

      return `${protocol}//${envUrl}`;
    }

    // Local default for non-proxy development.
    const backendPort = '8080';
    return `${protocol}//${host}:${backendPort}`;
  };

  useEffect(() => {
    shouldReconnectRef.current = true;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    function connect() {
      if (!shouldReconnectRef.current) {
        return;
      }

      const url = getWebSocketUrl();
      console.log('[useSocket] Connecting to:', url);
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setSocket(ws);

      ws.onopen = () => {
        if (!shouldReconnectRef.current || socketRef.current !== ws) {
          ws.close(1000, 'stale_connection');
          return;
        }

        // Flush messages that were queued while the socket was connecting.
        while (outboundQueueRef.current.length > 0) {
          const nextMessage = outboundQueueRef.current.shift();
          if (nextMessage) {
            ws.send(nextMessage);
          }
        }

        setConnected(true);
      };

      ws.onclose = () => {
        if (socketRef.current === ws) {
          socketRef.current = null;
          setSocket(null);
        }

        setConnected(false);

        if (!shouldReconnectRef.current) {
          return;
        }

        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(connect, 1000);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = () => {
      };
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();

      const ws = socketRef.current;
      socketRef.current = null;
      setSocket(null);
      setConnected(false);

      if (!ws) {
        return;
      }

      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;

      try {
        // Avoid the browser warning when cleanup happens during CONNECTING in React StrictMode.
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'cleanup');
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.addEventListener(
            'open',
            () => {
              try {
                ws.close(1000, 'cleanup');
              } catch {
              }
            },
            { once: true }
          );
        }
      } catch {
      }
    };
  }, []);

  function send(data: unknown) {
    try {
      const message = JSON.stringify(data);
      const s = socketRef.current;
      if (s && s.readyState === WebSocket.OPEN) {
        s.send(message);
      } else {
        outboundQueueRef.current.push(message);
      }
    } catch {
    }
  }

  return { socketRef, socket, connected, send };
}

export default useSocket;

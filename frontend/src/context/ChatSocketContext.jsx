import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { chatAPI, chatSocketUrl } from '../services/api';

/*
 * App-wide chat socket.
 *
 * Previously the socket was opened inside the Chat page, which meant the app
 * could only learn about a message while you were already looking at it. A
 * notification system cannot live inside the page you would visit *because* of
 * the notification, so the connection is hoisted to the app shell: one socket,
 * open for the whole session, feeding both the unread badges and the chat view.
 *
 * Responsibilities:
 *   - keep exactly one socket alive while the user is authenticated
 *   - reconnect with exponential backoff when it drops
 *   - track unread counts per conversation
 *   - broadcast incoming messages to whichever component is interested
 */

const ChatSocketContext = createContext(null);

// Backoff schedule in ms. Caps at 30s so a long outage does not turn into a
// tight reconnect loop hammering the server.
const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

/** Stable key for a conversation, matching the backend's format. */
export const conversationKey = ({ kidney_match_id, donation_id }) =>
  kidney_match_id != null ? `kidney:${kidney_match_id}` : `donation:${donation_id}`;

export const ChatSocketProvider = ({ user, children }) => {
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState({ total: 0, byConversation: {} });

  const socketRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);
  const closedByUsRef = useRef(false);

  /*
   * Subscribers are held in a ref, not state.
   *
   * Putting them in state would re-render every consumer whenever any component
   * subscribed or unsubscribed, and would make `connect` depend on a value that
   * changes constantly — tearing down and rebuilding the socket each time.
   */
  const listenersRef = useRef(new Set());

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const emit = useCallback((message) => {
    listenersRef.current.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        // One bad subscriber must not stop the others from being notified.
        console.error('Chat listener failed:', error);
      }
    });
  }, []);

  // ─── Unread bookkeeping ──────────────────────────────────

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await chatAPI.getUnread();
      setUnread({ total: data.total, byConversation: data.by_conversation || {} });
    } catch {
      // Non-fatal: badges are an enhancement, not a requirement for the app to
      // work, so a failure here should never surface as an error to the user.
    }
  }, []);

  /** Called when the chat view opens a thread and marks it read server-side. */
  const clearConversation = useCallback((key) => {
    setUnread((previous) => {
      const count = previous.byConversation[key];
      if (!count) return previous;

      const byConversation = { ...previous.byConversation };
      delete byConversation[key];
      return { total: Math.max(0, previous.total - count), byConversation };
    });
  }, []);

  // ─── Connection ──────────────────────────────────────────

  const connect = useCallback(async () => {
    if (socketRef.current || !user) return;

    let ticket;
    try {
      // A fresh ticket every attempt: they expire in 60 seconds, so a cached
      // one would be stale by the time a reconnect actually fires.
      ({ data: { ticket } } = await chatAPI.getWsTicket());
    } catch {
      scheduleRetry();
      return;
    }

    const socket = new WebSocket(chatSocketUrl(ticket));
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
      // Catch up on anything that arrived while we were disconnected.
      refreshUnread();
    };

    socket.onmessage = (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      if (payload.error) {
        emit(payload);
        return;
      }

      // Only count messages addressed to us. The server echoes our own sends
      // back for delivery confirmation, and those must not inflate the badge.
      if (payload.sender_id !== user.id) {
        const key = conversationKey(payload);
        setUnread((previous) => ({
          total: previous.total + 1,
          byConversation: {
            ...previous.byConversation,
            [key]: (previous.byConversation[key] || 0) + 1,
          },
        }));
      }

      emit(payload);
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      if (!closedByUsRef.current) scheduleRetry();
    };

    socket.onerror = () => {
      // onerror is always followed by onclose, which owns the retry. Closing
      // here as well would schedule two reconnects for one failure.
      setConnected(false);
    };
  }, [user, emit, refreshUnread]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleRetry = useCallback(() => {
    const delay = RETRY_DELAYS[Math.min(retryRef.current, RETRY_DELAYS.length - 1)];
    retryRef.current += 1;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => connect(), delay);
  }, [connect]);

  /** Send a message. Returns false if the socket is not ready. */
  const sendMessage = useCallback((body) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(body));
    return true;
  }, []);

  // ─── Lifecycle ───────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      // Logged out: tear the socket down so the next user does not inherit it.
      closedByUsRef.current = true;
      clearTimeout(timerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      setUnread({ total: 0, byConversation: {} });
      setConnected(false);
      return undefined;
    }

    closedByUsRef.current = false;
    refreshUnread();
    connect();

    return () => {
      closedByUsRef.current = true;
      clearTimeout(timerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [user, connect, refreshUnread]);

  /*
   * Reconnect when the tab wakes up.
   *
   * Browsers suspend background tabs and silently drop sockets. Without this,
   * coming back to a tab left open overnight shows "Connected" while nothing
   * actually arrives.
   */
  useEffect(() => {
    if (!user) return undefined;

    const onWake = () => {
      if (document.visibilityState === 'visible' && !socketRef.current) {
        retryRef.current = 0;
        connect();
      }
    };

    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('online', onWake);
    return () => {
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('online', onWake);
    };
  }, [user, connect]);

  const value = useMemo(
    () => ({
      connected,
      unreadTotal: unread.total,
      unreadByConversation: unread.byConversation,
      subscribe,
      sendMessage,
      clearConversation,
      refreshUnread,
    }),
    [connected, unread, subscribe, sendMessage, clearConversation, refreshUnread]
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
};

export const useChatSocket = () => {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error('useChatSocket must be used inside a ChatSocketProvider');
  }
  return context;
};

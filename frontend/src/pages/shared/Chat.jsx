import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, CheckCheck, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, donorsAPI, kidneyAPI, chatSocketUrl } from '../../services/api';
import { Spinner } from '../../components/ui';
import { getErrorMessage } from '../../utils/apiError';
import styles from './Chat.module.css';

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });

const dayOf = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Chat = ({ isKidney = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { donationId, matchId } = useParams();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [title, setTitle] = useState('Chat');

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let socket = null;
    let cancelled = false;

    const loadHistory = async () => {
      try {
        if (isKidney) {
          const { data: match } = await kidneyAPI.getMatchDetails(matchId);
          setTitle(user.id === match.donor_id ? match.patient_name : match.donor_name);
          const { data } = await chatAPI.getKidneyHistory(matchId);
          setMessages(data);
        } else {
          const { data: donation } = await donorsAPI.getDonation(donationId);
          setTitle(`Blood request #${donation.request_id}`);
          const { data } = await chatAPI.getHistory(donationId);
          setMessages(data);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Could not load this conversation'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Swap the access token for a 60-second, socket-only ticket. The browser
    // WebSocket API cannot send an Authorization header, and a long-lived token
    // in the URL would end up in proxy and access logs.
    const openSocket = async () => {
      try {
        const { data } = await chatAPI.getWsTicket();
        if (cancelled) return;

        socket = new WebSocket(chatSocketUrl(data.ticket));

        socket.onopen = () => setConnected(true);
        socket.onclose = () => setConnected(false);
        socket.onerror = () => setConnected(false);

        socket.onmessage = (event) => {
          const payload = JSON.parse(event.data);

          if (payload.error) {
            toast.error(payload.detail || 'Message could not be sent');
            return;
          }

          const belongsHere = isKidney
            ? payload.kidney_match_id === Number(matchId)
            : payload.donation_id === Number(donationId);

          // The server echoes the sender's own message back with a delivery
          // flag, so the same id can arrive twice. De-duplicate on id.
          if (belongsHere) {
            setMessages((previous) =>
              previous.some((message) => message.id === payload.id)
                ? previous.map((message) => (message.id === payload.id ? payload : message))
                : [...previous, payload]
            );
          }
        };

        socketRef.current = socket;
      } catch (error) {
        setConnected(false);
        toast.error('Could not connect to chat');
      }
    };

    loadHistory();
    openSocket();

    return () => {
      cancelled = true;
      if (socket) socket.close();
      socketRef.current = null;
    };
  }, [donationId, matchId, isKidney, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text || socketRef.current?.readyState !== WebSocket.OPEN) return;

    // No receiver_id: the server resolves the recipient from the conversation,
    // so a client cannot address someone it has no relationship with.
    socketRef.current.send(JSON.stringify(
      isKidney
        ? { kidney_match_id: Number(matchId), message: text }
        : { donation_id: Number(donationId), message: text }
    ));

    setDraft('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    // Enter sends, Shift+Enter makes a new line — the convention in every
    // messaging app, so it needs no explanation.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  // Group by calendar day so a date separator can be inserted between runs.
  const grouped = useMemo(() => {
    const groups = [];
    messages.forEach((message) => {
      const day = dayOf(message.created_at);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.items.push(message);
      else groups.push({ day, items: [message] });
    });
    return groups;
  }, [messages]);

  const canSend = draft.trim().length > 0 && connected;

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>

        <span className={styles.headerText}>
          <span className={styles.headerTitle}>{title}</span>
          <span className={styles.headerMeta}>
            {isKidney ? 'Kidney connection' : 'Blood donation'}
            <span
              className={`${styles.status} ${connected ? styles.statusOnline : styles.statusOffline}`}
            >
              {connected ? 'Connected' : 'Reconnecting'}
            </span>
          </span>
        </span>
      </header>

      <div className={styles.messages}>
        {loading ? (
          <Spinner fullPage label="Loading conversation" />
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={32} />
            <p className={styles.emptyText}>
              No messages yet. Say hello — a short introduction is usually the
              easiest way to start.
            </p>
          </div>
        ) : (
          <div className={styles.thread}>
            {grouped.map((group) => (
              <div key={group.day} className={styles.thread}>
                <span className={styles.dayDivider}>{group.day}</span>

                {group.items.map((message) => {
                  const mine = message.sender_id === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`${styles.row} ${mine ? styles.rowMine : ''}`}
                    >
                      <div className={`${styles.bubble} ${mine ? styles.bubbleMine : ''}`}>
                        {message.message}
                        <span className={styles.time}>
                          {timeOf(message.created_at)}
                          {mine && (message.is_read
                            ? <CheckCheck size={13} aria-label="Read" />
                            : <Check size={13} aria-label="Sent" />)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className={styles.composer}>
        {!connected && !loading && (
          <p className={styles.notice}>
            Disconnected. Refresh the page to reconnect.
          </p>
        )}

        <div className={styles.composerInner}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            rows={1}
            aria-label="Message"
          />
          <button
            className={styles.send}
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

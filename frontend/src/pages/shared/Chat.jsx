import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, donorsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, Droplets, Circle } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { donationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const donationRes = await donorsAPI.getDonation(donationId);
        const donation = donationRes.data;
        const receiver = user.id === donation.donor_id
          ? donation.patient_id
          : donation.donor_id;
        setReceiverId(receiver);

        const historyRes = await chatAPI.getHistory(donationId);
        setMessages(historyRes.data);
      } catch (err) {
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    initChat();

    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8000/api/v1/chat/ws/${token}`);
    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.donation_id === parseInt(donationId)) {
        setMessages(prev => [...prev, data]);
      }
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    wsRef.current = ws;
    return () => ws.close();
  }, [donationId, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !wsRef.current || !receiverId) return;
    wsRef.current.send(JSON.stringify({
      receiver_id: receiverId,
      donation_id: parseInt(donationId),
      message: newMessage.trim(),
    }));
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div style={styles.headerLogo}>
            <Droplets size={20} color="#E74C3C" />
            <span style={styles.headerTitle}>RaktaSeva Chat</span>
          </div>
          <div style={styles.donationInfo}>Donation #{donationId}</div>
        </div>
        <div style={styles.connectionStatus}>
          <Circle
            size={10}
            fill={connected ? '#27AE60' : '#E74C3C'}
            color={connected ? '#27AE60' : '#E74C3C'}
          />
          <span style={{ color: connected ? '#27AE60' : '#E74C3C', fontSize: '13px', fontWeight: '500' }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {loading ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <div style={styles.empty}>
            <Droplets size={40} color="#E8E8E8" />
            <p style={styles.emptyText}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={i} style={{ ...styles.messageWrapper, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && <div style={styles.senderAvatar}>U</div>}
                <div style={{
                  ...styles.messageBubble,
                  backgroundColor: isMe ? '#C0392B' : 'white',
                  color: isMe ? 'white' : '#2C3E50',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}>
                  <p style={styles.messageText}>{msg.message}</p>
                  <div style={{ ...styles.messageTime, color: isMe ? 'rgba(255,255,255,0.7)' : '#95A5A6' }}>
                    {new Date(msg.created_at).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <span style={styles.readStatus}>{msg.is_read ? ' ✓✓' : ' ✓'}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        {!connected && <p style={styles.disconnectedMsg}>Not connected. Please refresh the page.</p>}
        <div style={styles.inputBox}>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Enter to send)"
            style={styles.input}
            rows={1}
          />
          <button
            style={{ ...styles.sendBtn, backgroundColor: newMessage.trim() && connected ? '#C0392B' : '#E8E8E8' }}
            onClick={handleSend}
            disabled={!newMessage.trim() || !connected}
          >
            <Send size={18} color={newMessage.trim() && connected ? 'white' : '#95A5A6'} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F2F3F4' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F2F3F4', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2C3E50' },
  headerLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerTitle: { fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#2C3E50' },
  donationInfo: { backgroundColor: '#FADBD8', color: '#C0392B', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
  connectionStatus: { display: 'flex', alignItems: 'center', gap: '6px' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  loading: { textAlign: 'center', color: '#7F8C8D', padding: '40px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px', color: '#7F8C8D' },
  emptyText: { fontSize: '15px', color: '#7F8C8D' },
  messageWrapper: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  senderAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FADBD8', color: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  messageBubble: { maxWidth: '65%', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  messageText: { fontSize: '15px', lineHeight: '1.5', marginBottom: '4px' },
  messageTime: { fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' },
  readStatus: { fontSize: '12px' },
  inputContainer: { padding: '16px 24px', backgroundColor: 'white', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' },
  inputBox: { display: 'flex', alignItems: 'flex-end', gap: '12px' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid #E8E8E8', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', resize: 'none', backgroundColor: '#F9F9F9', color: '#2C3E50', outline: 'none' },
  sendBtn: { width: '48px', height: '48px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  disconnectedMsg: { color: '#E74C3C', fontSize: '13px', marginBottom: '8px', textAlign: 'center' },
};

export default Chat;
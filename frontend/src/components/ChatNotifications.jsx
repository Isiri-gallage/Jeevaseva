import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import { useChatSocket } from '../context/ChatSocketContext';

/**
 * Turns incoming chat messages into toasts.
 *
 * Renders nothing — it exists purely to bridge the socket to the notification
 * layer. Kept separate from ChatSocketProvider so the provider has no dependency
 * on the router or the toast library, which keeps it testable in isolation.
 */
const ChatNotifications = ({ user }) => {
  const { subscribe } = useChatSocket();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return undefined;

    return subscribe((payload) => {
      // Errors are surfaced by whichever view triggered them.
      if (payload.error) return;

      // Never notify about our own message echoing back.
      if (payload.sender_id === user.id) return;

      const path = payload.kidney_match_id != null
        ? `/chat/kidney/${payload.kidney_match_id}`
        : `/chat/${payload.donation_id}`;

      // Already reading this thread? The message appears in the transcript;
      // a toast on top of it would be noise.
      if (location.pathname === path) return;

      const sender = payload.sender_name || 'Someone';
      const preview = payload.message.length > 60
        ? `${payload.message.slice(0, 60)}…`
        : payload.message;

      toast(
        (t) => (
          <span
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer', display: 'block' }}
            onClick={() => { toast.dismiss(t.id); navigate(path); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                toast.dismiss(t.id);
                navigate(path);
              }
            }}
          >
            <strong style={{ display: 'block', marginBottom: 2 }}>{sender}</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>{preview}</span>
          </span>
        ),
        {
          icon: <MessageSquare size={18} color="var(--color-accent)" />,
          duration: 6000,
          // Keyed by conversation so a burst of messages from one person
          // replaces the previous toast instead of stacking five of them.
          id: `chat-${payload.kidney_match_id ?? payload.donation_id}`,
        }
      );
    });
  }, [subscribe, user, navigate, location.pathname]);

  return null;
};

export default ChatNotifications;


// 🔁 Chat Enhancements (Typing Indicator, Seen Logic, File Preview)
import { listenToTyping } from '@/lib/firestore/chat/listenToTyping'
import { setTypingStatus } from '@/lib/firestore/chat/setTypingStatus'
import { markMessagesAsSeen } from '@/lib/firestore/chat/markMessagesAsSeen'

const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const [isTyping, setTyping] = useState(false);

useEffect(() => {
  if (!user?.uid) return;
  const unsubscribe = listenToTyping(bookingId, (usersTyping) => {
    setTyping(usersTyping.filter((id) => id !== user?.uid).length > 0);
  });

  markMessagesAsSeen(bookingId, user.uid);

  return () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    unsubscribe();
  };
}, [bookingId, user?.uid]);

const handleTyping = () => {
  if (!user?.uid) return;
  setTypingStatus(bookingId, user.uid, true);
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    setTypingStatus(bookingId, user.uid, false);
  }, 1500);
};

// 🖼️ File preview + Typing indicator (insert inside your message render map)
{messages.map((msg) => (
  <div key={msg.id} className="mb-2">
    {msg.mediaUrl && (
      msg.mediaUrl.endsWith('.mp3') ? (
        <audio controls src={msg.mediaUrl} />
      ) : (
        <img src={msg.mediaUrl} className="w-32 rounded" />
      )
    )}
    <p>{msg.content}</p>
  </div>
))}

{isTyping && <p className="text-xs italic text-gray-400">They’re typing...</p>}

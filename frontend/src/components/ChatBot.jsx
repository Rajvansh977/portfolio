import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, ChevronDown } from 'lucide-react';

const SUGGESTIONS = [
  'What stack does Rajvansh use?',
  'Tell me about his projects',
  'Is he available for hire?',
  'What is he best at?',
  'Give me a MERN stack overview',
  'How can I contact him?',
];

const TypingDots = () => (
  <div className="cb-typing">
    <span /><span /><span />
  </div>
);

export default function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **Raj.AI** — Rajvansh's personal assistant. Ask me anything about his skills, projects, or availability. 🚀",
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || 'Sorry, something went wrong.';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Simple markdown bold renderer
  const renderContent = (text) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <>
      {/* ── Floating button ── */}
      <div className="cb-float">
        {unread > 0 && <span className="cb-badge">{unread}</span>}
        <button className="cb-trigger" onClick={() => setOpen(o => !o)} title="Chat with Raj.AI">
          {open
            ? <ChevronDown size={22} />
            : <img src="/bot.png" alt="Raj.AI" style={{ width: 32, height: 32 }} />
          }
        </button>
      </div>

      {/* ── Chat window ── */}
      <div className={`cb-window ${open ? 'cb-open' : ''}`}>

        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-left">
            <div className="cb-avatar">
              <img src="/bot.png" alt="Raj.AI" />
              <span className="cb-online" />
            </div>
            <div>
              <div className="cb-name">Raj.AI</div>
              <div className="cb-status">Rajvansh's Personal Assistant</div>
            </div>
          </div>
          <button className="cb-close" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cb-msg ${msg.role === 'user' ? 'cb-msg-user' : 'cb-msg-bot'}`}>
              {msg.role === 'assistant' && (
                <div className="cb-msg-avatar"><Bot size={14} /></div>
              )}
              <div className="cb-bubble">
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="cb-msg cb-msg-bot">
              <div className="cb-msg-avatar"><Bot size={14} /></div>
              <div className="cb-bubble"><TypingDots /></div>
            </div>
          )}

          {/* Suggestions — show only at start */}
          {messages.length === 1 && !loading && (
            <div className="cb-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="cb-suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="cb-input-wrap">
          <textarea
            ref={inputRef}
            className="cb-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="cb-send"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            {loading ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
          </button>
        </div>

      </div>
    </>
  );
}

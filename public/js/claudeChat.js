// claudeChat.js - Claude API integration for Tutor.AI

export const useClaudeChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message, context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context.additionalInfo,
          subject: context.subject || 'General',
          grade: context.grade || '10'
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      return {
        response: data.response,
        usage: data.usage // For cost tracking
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};

// Example usage in component
export default function ChatInterface() {
  const { sendMessage, loading, error } = useClaudeChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await sendMessage(input, {
        subject: 'Mathematics',
        grade: '10',
        additionalInfo: 'CBSE curriculum'
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: result.response,
        usage: result.usage 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setInput('');

    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
            {msg.usage && (
              <small className="usage-info">
                Tokens: {msg.usage.input_tokens + msg.usage.output_tokens}
              </small>
            )}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your question..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}
    </div>
  );
}

// Usage tracking for cost monitoring
export const logUsage = (usage) => {
  console.log('Claude Usage:', {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    estimated_cost: (usage.input_tokens * 0.000003) + (usage.output_tokens * 0.000015)
  });
}; 

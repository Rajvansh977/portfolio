import React, { useState } from 'react';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not connect to server. Please try again.');
    }
  };

  return (
    <form className="terminal-form" onSubmit={handleSubmit}>
      <div className="terminal-header">[ SECURE TRANSMISSION PROTOCOL ]</div>

      <div className="form-group">
        <label htmlFor="name">USER_ID:</label>
        <input
          type="text" id="name" name="name"
          value={form.name} onChange={handleChange}
          required maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">EMAIL_ADDR:</label>
        <input
          type="email" id="email" name="email"
          value={form.email} onChange={handleChange}
          required maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject">SUBJECT:</label>
        <input
          type="text" id="subject" name="subject"
          value={form.subject} onChange={handleChange}
          required maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">MESSAGE_BODY:</label>
        <textarea
          id="message" name="message" rows="5"
          value={form.message} onChange={handleChange}
          required maxLength={2000}
        />
      </div>

      {/* Status feedback */}
      {status === 'success' && (
        <div style={{
          padding: '12px', marginBottom: '16px',
          background: 'rgba(39, 174, 96, 0.15)',
          border: '1px solid #27ae60',
          color: '#27ae60', fontSize: '0.9rem',
          fontFamily: 'Courier New, monospace',
        }}>
          ✅ Message transmitted successfully! Check your inbox for a confirmation.
        </div>
      )}

      {status === 'error' && (
        <div style={{
          padding: '12px', marginBottom: '16px',
          background: 'rgba(231, 76, 60, 0.15)',
          border: '1px solid #e74c3c',
          color: '#e74c3c', fontSize: '0.9rem',
          fontFamily: 'Courier New, monospace',
        }}>
          ❌ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={status === 'loading'}
        style={{ opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? '⏳ TRANSMITTING...' : 'TRANSMIT DATA'}
      </button>
    </form>
  );
};

export default ContactForm;

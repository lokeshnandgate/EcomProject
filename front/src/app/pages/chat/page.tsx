'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './../../redux/store/store';
import { sendMessage } from './../../redux/chat/action';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const error = useSelector((state: RootState) => state.chat.error);
  const dispatch = useDispatch();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      dispatch(sendMessage(input) as any);
      setInput('');
      setShowEmoji(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <header className="bg-blue-600 text-white px-6 py-4 shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-semibold">💬 UrbanCart Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow max-w-xs w-fit">
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </main>

      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => setInput((prev) => prev + emoji.native)}
            theme="light"
          />
        </div>
      )}

      <footer className="bg-white border-t p-4 sticky bottom-0 flex items-center gap-2 shadow-inner">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-xl px-3 py-1 rounded-full hover:bg-gray-200 transition"
        >
          😊
        </button>
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </footer>

      {error && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow">
          {error}
        </div>
      )}
    </div>
  );
}

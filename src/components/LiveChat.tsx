import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Paperclip, Image, FileText, MessageSquare, Bot } from 'lucide-react';
import type { ChatMessage, MessageType } from '@/shared/types';
import Dialog from './Dialog';
import ErrorBoundary from './ErrorBoundary';

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

function LiveChatContent({ isOpen, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]); // Track created object URLs

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup file URLs on unmount or when component closes
  useEffect(() => {
    return () => {
      fileUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  const fetchChatHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, fetchChatHistory]);

  const sendMessage = useCallback(async (content: string, type: MessageType = 'text', fileUrl?: string, fileName?: string) => {
    if (!content.trim() && !fileUrl) return;

    const message: Partial<ChatMessage> = {
      content: content.trim(),
      type,
      file_url: fileUrl,
      file_name: fileName,
      is_from_user: true,
      created_at: new Date().toISOString(),
    };

    // Optimistically add message
    setMessages(prev => [...prev, message as ChatMessage]);
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        // Update the message with the saved data
        setMessages(prev => 
          prev.map(m => 
            m.created_at === message.created_at ? savedMessage : m
          )
        );

        // Simulate agent response
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const agentResponse: ChatMessage = {
              id: `agent-${Date.now()}`,
              user_id: 'current-user',
              agent_id: 'support-agent',
              type: 'text',
              content: 'Thank you for your message. A support agent will respond shortly.',
              created_at: new Date().toISOString(),
              is_from_user: false,
            };
            setMessages(prev => [...prev, agentResponse]);
            setIsTyping(false);
          }, 2000);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(m => m.created_at !== message.created_at));
    }
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file type (image, PDF, or text)');
      return;
    }

    try {
      // Simulate file upload
      const fileUrl = URL.createObjectURL(file);
      setFileUrls(prev => [...prev, fileUrl]); // Track the URL for cleanup
      const messageContent = file.type.startsWith('image/') ? '[Image]' : `[File: ${file.name}]`;
      
      await sendMessage(messageContent, file.type.startsWith('image/') ? 'file' : 'file', fileUrl, file.name);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Live Chat Support">
      <div className="flex flex-col h-full max-w-2xl h-[600px]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-600">Online</span>
          </div>
          <div className="text-sm text-slate-500">
            Support available 24/7
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.is_from_user
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.is_from_user && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      {message.type === 'file' && message.file_name ? (
                        <div className="flex items-center space-x-2">
                          {getFileIcon(message.file_name)}
                          <span className="text-sm font-medium">{message.file_name}</span>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.is_from_user ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                maxLength={500}
              />
            </div>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            className="hidden"
            accept="image/*,.pdf,.txt"
          />
          <div className="text-xs text-slate-500 mt-1">
            {newMessage.length}/500 characters
          </div>
        </form>
      </div>
    </Dialog>
  );
}

export default function LiveChat(props: LiveChatProps) {
  return (
    <ErrorBoundary>
      <LiveChatContent {...props} />
    </ErrorBoundary>
  );
} 
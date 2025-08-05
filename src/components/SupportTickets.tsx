import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { SupportTicket, TicketStatus, TicketPriority } from '@/shared/types';
import Dialog from './Dialog';
import ErrorBoundary from './ErrorBoundary';
import { FormField, Input, Select, Textarea } from './FormField';

interface SupportTicketsProps {
  isOpen: boolean;
  onClose: () => void;
}

function SupportTicketsContent({ isOpen, onClose }: SupportTicketsProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'resolved'>('all');

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, fetchTickets]);

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'open') return ['open', 'in_progress'].includes(ticket.status);
    if (activeTab === 'resolved') return ['resolved', 'closed'].includes(ticket.status);
    return true;
  });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Support Tickets">
      <div className="max-w-4xl max-h-[600px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'open'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'resolved'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                {activeTab === 'open' 
                  ? 'No open tickets'
                  : activeTab === 'resolved'
                  ? 'No resolved tickets'
                  : 'No tickets yet'
                }
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span>#{ticket.id}</span>
                      <span className="capitalize">{ticket.category}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span>{ticket.messages.length} messages</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-500 capitalize">{ticket.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <CreateTicketForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={(newTicket) => {
            setTickets(prev => [newTicket, ...prev]);
            setShowCreateForm(false);
          }}
        />
      )}

      {/* Ticket Detail View */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={(updatedTicket) => {
            setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            setSelectedTicket(updatedTicket);
          }}
        />
      )}
    </Dialog>
  );
}

// Create Ticket Form Component
function CreateTicketForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: (ticket: SupportTicket) => void }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTicket = await response.json();
        onSuccess(newTicket);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setErrors({ submit: 'Failed to create ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={true} onClose={onClose} title="Create New Ticket">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Subject"
            error={errors.subject}
            required
          >
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              error={!!errors.subject}
            />
          </FormField>

          <FormField
            label="Category"
            required
          >
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={[
                { value: 'technical', label: 'Technical Issue' },
                { value: 'billing', label: 'Billing & Payments' },
                { value: 'account', label: 'Account Management' },
                { value: 'transaction', label: 'Transaction Issue' },
                { value: 'general', label: 'General Inquiry' },
              ]}
            />
          </FormField>

          <FormField
            label="Priority"
            required
          >
            <Select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </FormField>

          <FormField
            label="Description"
            error={errors.description}
            required
          >
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide detailed information about your issue..."
              rows={4}
              error={!!errors.description}
            />
          </FormField>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

// Ticket Detail Component
function TicketDetail({ 
  ticket, 
  onClose, 
  onUpdate 
}: { 
  ticket: SupportTicket; 
  onClose: () => void; 
  onUpdate: (ticket: SupportTicket) => void;
}) {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        const updatedTicket = {
          ...ticket,
          messages: [...ticket.messages, message],
        };
        onUpdate(updatedTicket);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={true} onClose={onClose} title={`Ticket #${ticket.id}`}>
      <div className="max-w-2xl space-y-4">
        {/* Ticket Info */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 mb-2">{ticket.subject}</h3>
          <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Category: {ticket.category}</span>
            <span>Priority: {ticket.priority}</span>
            <span>Status: {ticket.status}</span>
            <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.is_from_user
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.is_from_user ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <form onSubmit={sendMessage} className="border-t border-slate-200 pt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
} 

export default function SupportTickets(props: SupportTicketsProps) {
  return (
    <ErrorBoundary>
      <SupportTicketsContent {...props} />
    </ErrorBoundary>
  );
} 
import { useState, useEffect, useCallback } from 'react';
import { Search, HelpCircle, ThumbsUp, ThumbsDown, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import type { FAQ } from '@/shared/types';
import Dialog from './Dialog';
import ErrorBoundary from './ErrorBoundary';

interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
}

function FAQContent({ isOpen, onClose }: FAQProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Questions', icon: BookOpen },
    { id: 'account', name: 'Account Management', icon: HelpCircle },
    { id: 'payments', name: 'Payments & Transactions', icon: HelpCircle },
    { id: 'security', name: 'Security & Privacy', icon: HelpCircle },
    { id: 'technical', name: 'Technical Support', icon: HelpCircle },
    { id: 'billing', name: 'Billing & Fees', icon: HelpCircle },
  ];

  const fetchFAQs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
        setFilteredFaqs(data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFAQs();
    }
  }, [isOpen, fetchFAQs]);

  // Filter FAQs based on search query and category
  useEffect(() => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredFaqs(filtered);
  }, [faqs, searchQuery, selectedCategory]);

  const toggleFaq = (faqId: string) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  const handleVote = async (faqId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/faq/${faqId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful: isHelpful }),
      });

      if (response.ok) {
        // Update the FAQ with new vote counts
        setFaqs(prev => prev.map(faq => {
          if (faq.id === faqId) {
            return {
              ...faq,
              helpful_count: isHelpful ? faq.helpful_count + 1 : faq.helpful_count,
              not_helpful_count: !isHelpful ? faq.not_helpful_count + 1 : faq.not_helpful_count,
            };
          }
          return faq;
        }));
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Frequently Asked Questions">
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading FAQs...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No questions found matching your criteria'
                  : 'No FAQs available'
                }
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div key={faq.id} className="border border-slate-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <h3 className="font-medium text-slate-900 pr-4">{faq.question}</h3>
                  {expandedFaqs.has(faq.id) ? (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedFaqs.has(faq.id) && (
                  <div className="px-4 pb-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-slate-700 mb-3">{faq.answer}</p>
                    </div>
                    
                    {/* Tags */}
                    {faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Voting */}
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>Was this helpful?</span>
                      <button
                        onClick={() => handleVote(faq.id, true)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{faq.helpful_count}</span>
                      </button>
                      <button
                        onClick={() => handleVote(faq.id, false)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{faq.not_helpful_count}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="border-t border-slate-200 pt-4">
          <div className="text-center">
            <p className="text-slate-600 mb-2">
              Can't find what you're looking for?
            </p>
            <button
              onClick={() => {
                onClose();
                // This would typically open the support ticket form
                // For now, we'll just show an alert
                alert('Please use the Support Tickets feature to create a new ticket.');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default function FAQ(props: FAQProps) {
  return (
    <ErrorBoundary>
      <FAQContent {...props} />
    </ErrorBoundary>
  );
} 
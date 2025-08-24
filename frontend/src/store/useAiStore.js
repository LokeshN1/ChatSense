import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

// Zustand store for all AI-related actions
export const useAiStore = create((set, get) => ({
  summary: null,
  isSummarizing: false,
  queryResult: null,
  isQuerying: false,
  followUpSuggestions: [],
  isGeneratingFollowUp: false,
  replySuggestions: [],
  isGeneratingReply: false,
  refinedMessages: [],
  isRefining: false,

  // 1. Analyze chat (summary)
  analyzeChat: async (otherPersonId) => {
    const { authUser } = useAuthStore.getState();
    set({ isSummarizing: true, summary: null });
    try {
      const res = await axiosInstance.post('/ai/person-analyze', {
        currentUserId: authUser._id,
        otherPersonId,
      });
      set({ summary: res.data });
      toast.success('Chat analysis generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze chat');
    } finally {
      set({ isSummarizing: false });
    }
  },

  // 2. Query chat
  queryChat: async (otherPersonId, query) => {
    const { authUser } = useAuthStore.getState();
    set({ isQuerying: true, queryResult: null });
    try {
      const res = await axiosInstance.post('/ai/person-query', {
        currentUserId: authUser._id,
        otherPersonId,
        query,
      });
      set({ queryResult: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get answer from AI');
    } finally {
      set({ isQuerying: false });
    }
  },

  // 3. Generate follow-up suggestions
  generateFollowUp: async (otherPersonId) => {
    const { authUser } = useAuthStore.getState();
    set({ isGeneratingFollowUp: true, followUpSuggestions: [] });
    try {
      const res = await axiosInstance.post('/ai/generate-follow-up', {
        currentUserId: authUser._id,
        otherPersonId,
      });
      set({ followUpSuggestions: res.data.suggestions });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate follow-up suggestions');
    } finally {
      set({ isGeneratingFollowUp: false });
    }
  },

  // 4. Generate reply suggestions
  generateReply: async (otherPersonId) => {
    const { authUser } = useAuthStore.getState();
    set({ isGeneratingReply: true, replySuggestions: [] });
    try {
      const res = await axiosInstance.post('/ai/generate-reply', {
        currentUserId: authUser._id,
        otherPersonId,
      });
      set({ replySuggestions: res.data.replies });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate reply suggestions');
    } finally {
      set({ isGeneratingReply: false });
    }
  },

  // 5. Refine user message
  refineMessage: async (userDraft, tone) => {
    set({ isRefining: true, refinedMessages: [] });
    try {
      const res = await axiosInstance.post('/ai/refine-message', {
        userDraft,
        tone,
      });
      set({ refinedMessages: res.data.refined_messages });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refine message');
    } finally {
      set({ isRefining: false });
    }
  },

  clearSummary: () => set({ summary: null }),
  clearQueryResult: () => set({ queryResult: null }),
  clearFollowUpSuggestions: () => set({ followUpSuggestions: [] }),
  clearReplySuggestions: () => set({ replySuggestions: [] }),
  clearRefinedMessages: () => set({ refinedMessages: [] }),
}));

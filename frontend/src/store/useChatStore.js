import {create} from "zustand";
import toast from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    summary: null,
    isSummarizing: false,
    queryResult: null,
    isQuerying: false,
  
    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isUsersLoading: false });
      }
    },
  
    getMessages: async (userId) => {
      set({ isMessagesLoading: true });
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        set({ isMessagesLoading: false });
      }
    },
    sendMessage: async (messageData) => {
      const { selectedUser, messages } = get();
      try {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        set({ messages: [...messages, res.data] });
      } catch (error)  {
        toast.error(error.response.data.message);
      }
    },

    subscribeToMessages:(userId) =>{
      const {selectedUser} = get();
      if(!selectedUser) return;
      
      const socket = useAuthStore.getState().socket;  // it will fetch the value of socket from useAuthStore.js file

      socket.on("newMessage", (newMessage)=>{
        const isMessageSentFromSelectedUser = newMessage.senderId !== selectedUser._id;

        if(isMessageSentFromSelectedUser) return;
        set({
          messages : [...get().messages, newMessage],   // add new message to the end of previously sent messages
        });
      });
    },

    unsubscribeFromMessages:()=>{
      const socket = useAuthStore.getState().socket;
      socket.off("newMessage");
    },

    setSelectedUser: (user) => {
      set({ selectedUser: user, summary: null, queryResult: null });
    },
    
summarizeChat: async () => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    set({ isSummarizing: true, summary: null });
    try {
        const res = await axiosInstance.post("/ai/person-analyze", {
            currentUserId: authUser._id,
            otherPersonId: selectedUser._id,
        });
        console.log("Summary response:", res.data);
        // Set the entire response, not just analysis
        set({ summary: res.data });
        toast.success("Summary generated successfully!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to generate summary");
    } finally {
        set({ isSummarizing: false });
    }
},


    queryChat: async (query) => {
        const { selectedUser } = get();
        const { authUser } = useAuthStore.getState();
        set({ isQuerying: true, queryResult: null });
        try {
            const res = await axiosInstance.post("/ai/person-query", {
                currentUserId: authUser._id,
                otherPersonId: selectedUser._id,
                query,
            });
            set({ queryResult: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to get answer from AI");
        } finally {
            set({ isQuerying: false });
        }
    },

    clearSummary: () => {
        set({ summary: null });
    },

    clearQueryResult: () => {
        set({ queryResult: null });
    },
}));
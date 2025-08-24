import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useAiStore } from "./useAiStore"; // Import the AI store

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
  
    getUsers: async () => {
      set({ isUsersLoading: true });
      try {
        const res = await axiosInstance.get("/messages/users");
        set({ users: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } finally {
        set({ isUsersLoading: false });
      }
    },
  
    getMessages: async (userId) => {
      set({ isMessagesLoading: true, messages: [] }); // Clear previous messages before fetching new ones
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch messages");
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
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },

    subscribeToMessages:() =>{
      const {selectedUser} = get();
      if(!selectedUser) return;
      
      const socket = useAuthStore.getState().socket;

      socket.on("newMessage", (newMessage)=>{
        if (newMessage.senderId === get().selectedUser?._id || newMessage.receiverId === get().selectedUser?._id) {
            set({ messages : [...get().messages, newMessage] });
        }
      });
    },

    unsubscribeFromMessages:()=>{
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.off("newMessage");
      }
    },

    setSelectedUser: (user) => {
      const { selectedUser: currentSelectedUser } = get();

      if (currentSelectedUser?._id === user?._id) {
        return;
      }

      set({ selectedUser: user });
      const {
        clearFollowUpSuggestions,
        clearReplySuggestions,
        clearRefinedMessages,
      } = useAiStore.getState();
      clearFollowUpSuggestions();
      clearReplySuggestions();
      clearRefinedMessages();
    },
}));
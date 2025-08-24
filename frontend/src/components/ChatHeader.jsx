import { BrainCircuit, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import AiModal from "./AiModel";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className='p-4 border-b border-base-300 flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        <div className='avatar'>
          <div className='w-12 h-12 rounded-full relative'>
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>
        <div>
          <h3 className='font-bold text-lg'>{selectedUser.fullName}</h3>
          <p
            className={`text-sm ${
              onlineUsers.includes(selectedUser._id)
                ? "text-green-500"
                : "text-zinc-400"
            }`}
          >
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          className='btn btn-sm btn-ghost'
          onClick={() => setShowAiModal(true)}
        >
          <BrainCircuit className='w-5 h-5' />
          Ask AI
        </button>
        <button
          className='btn btn-sm btn-circle btn-ghost'
          onClick={() => setSelectedUser(null)}
        >
          <X />
        </button>
      </div>
      {showAiModal && <AiModal closeModal={() => setShowAiModal(false)} />}
    </div>
  );
};
export default ChatHeader;
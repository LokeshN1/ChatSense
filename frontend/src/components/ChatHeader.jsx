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
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-ghost" onClick={() => setShowAiModal(true)}>
                <BrainCircuit className="size-5"/>
                Ask AI
            </button>
            {/* Close button */}
            <button onClick={() => setSelectedUser(null)}>
                <X />
            </button>
        </div>
      </div>
      {showAiModal && <AiModal closeModal={() => setShowAiModal(false)}/>}
    </div>
  );
};
export default ChatHeader;
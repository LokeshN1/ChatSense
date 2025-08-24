import { useChatStore } from "../store/useChatStore";
import { ChatContainer } from "../components/ChatContainer";
import { NoChatSelected } from "../components/NoChatSelected";
import { Sidebar } from "../components/Sidebar";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className='h-screen flex pt-16'>
      {" "}
      {/* Added pt-16 to offset the navbar */}
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;
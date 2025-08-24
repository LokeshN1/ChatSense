import { MessageSquare } from "lucide-react";

export const NoChatSelected = () => {
  return (
    <div className='w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-200'>
      <div className='max-w-md text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center'>
            <MessageSquare className='w-10 h-10 text-primary' />
          </div>
        </div>
        <h2 className='text-3xl font-bold'>Welcome to Chat Sense!</h2>
        <p className='text-base-content/70'>
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
};
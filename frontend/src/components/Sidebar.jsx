import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

export const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className='h-full w-24 lg:w-80 border-r border-base-300 flex flex-col'>
      <div className='p-4 border-b border-base-300'>
        <div className='flex items-center gap-2'>
          <Users className='w-6 h-6' />
          <span className='font-semibold hidden lg:block'>Contacts</span>
        </div>
        <div className='mt-4 hidden lg:flex items-center gap-2'>
          <label className='cursor-pointer flex items-center gap-2'>
            <input
              type='checkbox'
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className='checkbox checkbox-sm checkbox-primary'
            />
            <span className='text-sm'>Online only</span>
          </label>
          <span className='text-xs text-zinc-500'>
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className='overflow-y-auto flex-1 py-2'>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-4
              hover:bg-base-200 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-200" : ""}
            `}
          >
            <div className='relative'>
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className='w-12 h-12 object-cover rounded-full'
              />
              {onlineUsers.includes(user._id) && (
                <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100' />
              )}
            </div>
            <div className='hidden lg:block text-left'>
              <div className='font-semibold'>{user.fullName}</div>
              <div
                className={`text-sm ${
                  onlineUsers.includes(user._id)
                    ? "text-green-500"
                    : "text-zinc-400"
                }`}
              >
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className='text-center text-zinc-500 py-4'>No users found</div>
        )}
      </div>
    </aside>
  );
};
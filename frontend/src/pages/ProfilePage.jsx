import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, CheckCircle, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = React.useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className='h-max pt-20 bg-base-200'>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-base-100 rounded-xl p-8 shadow-xl space-y-8'>
          <div className='text-center border-b border-base-300 pb-6'>
            <h1 className='text-3xl font-bold'>Your Profile</h1>
            <p className='mt-2 text-base-content/70'>
              Manage your personal information
            </p>
          </div>

          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt='Profile'
                className='w-36 h-36 rounded-full object-cover border-4 border-primary'
              />
              <label
                htmlFor='avatar-upload'
                className={`
                  absolute bottom-1 right-1 
                  bg-primary hover:bg-primary-focus
                  p-3 rounded-full cursor-pointer 
                  transition-all duration-300
                  ${
                    isUpdatingProfile
                      ? "animate-pulse pointer-events-none"
                      : ""
                  }
                `}
              >
                <Camera className='w-5 h-5 text-primary-content' />
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className='text-sm text-zinc-500'>
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera to update"}
            </p>
          </div>

          <div className='space-y-6'>
            <div className='flex items-center gap-4 bg-base-200 p-4 rounded-lg'>
              <User className='w-6 h-6 text-primary' />
              <div>
                <p className='text-sm text-zinc-400'>Full Name</p>
                <p className='text-lg font-semibold'>{authUser?.fullName}</p>
              </div>
            </div>

            <div className='flex items-center gap-4 bg-base-200 p-4 rounded-lg'>
              <Mail className='w-6 h-6 text-primary' />
              <div>
                <p className='text-sm text-zinc-400'>Email Address</p>
                <p className='text-lg font-semibold'>{authUser?.email}</p>
              </div>
            </div>
          </div>

          <div className='mt-6 bg-base-200 rounded-xl p-6'>
            <h2 className='text-lg font-semibold mb-4'>Account Information</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between py-2 border-b border-base-300'>
                <span className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4' /> Member Since
                </span>
                <span className='font-medium'>
                  {authUser.createdAt?.split("T")[0]}
                </span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' /> Account Status
                </span>
                <span className='font-medium text-green-500'>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
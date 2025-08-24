import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80'>
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          <Link
            to='/'
            className='flex items-center'
          >
            <img
              src='/logo.svg'
              width={250} height={50}
              alt='ChatSense AI'
            />
          </Link>

          <div className='flex items-center gap-4'>
            {authUser && (
              <>
                <Link to={"/profile"} className='btn btn-ghost btn-sm gap-2'>
                  <User className='w-5 h-5' />
                  <span className='hidden sm:inline'>Profile</span>
                </Link>

                <button
                  className='btn btn-ghost btn-sm gap-2'
                  onClick={logout}
                >
                  <LogOut className='w-5 h-5' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
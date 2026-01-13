import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, HelpCircle, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { NeoButton } from './NeoButton';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface HeaderProps {
  onSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch(val);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="relative bg-gradient-to-b from-black via-gray-700 to-gray-400 border-b-[4px] border-black pb-12 pt-4 px-4 md:px-8">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div
          onClick={() => navigate('/')}
          className="bg-white border-2 border-black px-4 py-1 flex items-center gap-2 shadow-neo cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <span className="font-mono font-bold text-lg text-black tracking-tighter">Baban's Shop</span>
        </div>

        <div className="flex gap-3 items-center">
          <NeoButton className="p-2" variant="primary"><HelpCircle size={20} /></NeoButton>
          <NeoButton className="px-3 py-1 text-sm" variant="primary">
            <Globe size={16} /> ENGLISH
          </NeoButton>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="bg-black text-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 px-3"
              >
                <User size={20} />
                <span className="font-bold hidden md:inline">{currentUser.displayName}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-neo z-50">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 font-bold border-b-2 border-black"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 font-bold border-b-2 border-black"
                    >
                      <ShieldCheck size={16} />
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-100 flex items-center gap-2 font-bold text-red-600"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NeoButton
                className="px-4 py-2 text-sm"
                variant="primary"
                onClick={() => navigate('/login')}
              >
                LOGIN
              </NeoButton>
              <NeoButton
                className="px-4 py-2 text-sm"
                variant="black"
                onClick={() => navigate('/register')}
              >
                REGISTER
              </NeoButton>
            </>
          )}
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">

        {/* Main Title - Explicit Black with White Shadow for contrast against gradient */}
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[4px_4px_0px_#FFD700] mb-2 tracking-tighter uppercase italic">
          Baban's Shop
        </h1>

        <div className="bg-white border-4 border-black px-4 py-1 shadow-neo-lg rotate-[-2deg] mb-10">
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-widest uppercase">
            Exclusive
          </h2>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2 relative">
          <div className="flex items-center h-16 md:h-20">
            <div className="pl-4 pr-2 text-black">
              <Search size={32} />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search exclusive items..."
              className="w-full h-full p-2 font-mono text-black text-xl md:text-2xl outline-none placeholder:text-gray-800 bg-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
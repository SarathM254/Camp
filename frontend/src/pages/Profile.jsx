import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit, Shield, LogOut, Check, X } from 'lucide-react';

const AVATAR_SEEDS = [
  'Adrian', 'Vivian', 'Wyatt', 'Luis', 'Jack',
  'Kimberly', 'Brooklynn', 'Mason', 'Riley', 'Liam', 'Sadie', 'Ryan'
];

export const Profile = () => {
  const { user, logout, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [selectedAvatar, setSelectedAvatar] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setSelectedAvatar(user.avatarSeed || 'Adrian');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A70D6]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/login');
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateProfile(editName, selectedAvatar);
    if (res.success) {
      setIsEditMode(false);
    } else {
      alert(res.error || 'Failed to update profile');
    }
    setIsSaving(false);
  };

  const getAvatarUrl = (seed) => `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}`;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* User Info Container */}
      <div className="bg-[#1c1c1c] rounded-xl p-6 sm:p-8 text-white shadow-lg border border-[#2a2a2a]">
        
        {/* Avatar Display */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-4 border-[#2a2a2a] relative">
            {user.isSuperAdmin ? (
              <img src="/campuz.png" alt="Super Admin" className="w-full h-full object-contain bg-black p-2" />
            ) : (
              <img src={getAvatarUrl(isEditMode ? selectedAvatar : (user.avatarSeed || 'Adrian'))} alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        {isEditMode ? (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-[#333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#6A70D6] transition"
              />
            </div>
            {!user.isSuperAdmin && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Choose Avatar</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {AVATAR_SEEDS.map(seed => (
                    <button
                      key={seed}
                      onClick={() => setSelectedAvatar(seed)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${selectedAvatar === seed ? 'border-[#6A70D6] scale-105' : 'border-transparent hover:border-gray-500'}`}
                    >
                      <img src={getAvatarUrl(seed)} alt={seed} className="w-full h-full bg-slate-800 object-cover" />
                      {selectedAvatar === seed && (
                        <div className="absolute inset-0 bg-[#6A70D6]/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsEditMode(false)}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-white py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-[#6A70D6] hover:bg-[#5a60c6] disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Username</div>
              <div className="text-xl sm:text-2xl font-medium">{user.name || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
              <div className="text-xl sm:text-2xl font-medium">{user.email || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</div>
              <div className="text-sm font-medium">
                {user.isSuperAdmin ? 'Super Admin' : user.isAdmin ? 'Admin' : 'Student'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      {!isEditMode && (
        <div className="space-y-3">
          <button 
            onClick={() => setIsEditMode(true)}
            className="w-full bg-[#6A70D6] hover:bg-[#5a60c6] text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors shadow-md"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
          {user.isSuperAdmin && (
            <button 
              onClick={handleAdminClick}
              className="w-full bg-[#ffb703] hover:bg-[#faa307] text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors shadow-md">
              <Shield className="w-4 h-4" /> Admin Panel
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full bg-[#e74c3c] hover:bg-[#c0392b] text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors shadow-md">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

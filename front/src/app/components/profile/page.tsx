"use client";


import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store/store';
import { useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/store/store';
import { fetchUserProfile, updateUserProfile } from '@/app/redux/profile/action';
import Image from 'next/image';
export default function ProfilePage() {
  const dispatch: AppDispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state: RootState) => state.profile);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    about: '',
    contact: '',
    businessType: '',
    location: '',
    address: '',
  });

  useEffect(() => {
    if (!userInfo) {
      // Replace `userId` with the actual user id, or fetch it from the store or context
      dispatch(fetchUserProfile('userId'));
    } else {
      setFormData(userInfo);
    }
  }, [userInfo, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            {formData.avatar ? (
              <Image
                src={formData.avatar}
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-[100px] h-[100px] bg-white/20 rounded-full flex items-center justify-center text-white text-sm">
                No Avatar
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-3 text-sm"
            />
          </div>

          {/* The rest of your form fields go here */}

          {/* <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 font-semibold rounded-lg transition"
          >
            Save Changes
          </button> */}
        </form>
      </div>
    </main>
  );
}

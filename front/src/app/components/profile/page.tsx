'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchUserProfile, fetchBusinessProfile } from '../../redux/profile/action';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileViewPage() {
  const dispatch = useAppDispatch();
  const { user, business, loading, error } = useAppSelector((state) => state.profile);

  const [userType, setUserType] = useState<'user' | 'business' | null>(null);
  const [_id, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedBusinessUser = sessionStorage.getItem('businessInfo');
    const storedUser = sessionStorage.getItem('userInfo');

    if (storedBusinessUser) {
      const parsed = JSON.parse(storedBusinessUser);
      const user = parsed?.user || parsed;
      if (user?.userType === 'businessUser' && user?._id) {
        setUserType('business');
        setUserId(user._id);
        dispatch(fetchBusinessProfile(user._id));
      }
    }

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const user = parsed?.user || parsed;
      if (user?.userType === 'User' && user?._id) {
        setUserType('user');
        setUserId(user._id);
        dispatch(fetchUserProfile(user._id));
      }
    }
  }, [dispatch]);

  const profile = userType === 'business' ? business : user;

  if (loading) return <p className="text-center mt-10 text-blue-400 animate-pulse">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">Error: {error}</p>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0c3fc] via-[#8ec5fc] to-[#a1c4fd] flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white/30 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 text-gray-900 relative">
        
        {/* Back to Dashboard */}
        <Link href="/dashboard">
          <button className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg hover:brightness-110 hover:scale-105 transition duration-200">
            ← 
          </button>
        </Link>

        {/* Edit Profile Button */}
        <Link href="/components/profile/editprofile">
          <button className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:brightness-110 hover:scale-105 transition duration-200">
            Edit Profile
          </button>
        </Link>

        {/* Profile Info */}
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src={profile.profilePic || '/default-avatar.png'}
            width={120}
            height={120}
            className="rounded-full border-4 border-white shadow-lg mb-4"
            alt="Profile Picture"
          />
          <h2 className="text-3xl font-bold">{profile.username}</h2>
          <p className="text-gray-700">{profile.email}</p>
          {profile.contactNumber && <p className="text-gray-600">{profile.contactNumber}</p>}
        </div>

        <div className="space-y-6 text-gray-800">
          {userType === 'business' && (
            <div>
              <h3 className="font-semibold text-lg">Business Type</h3>
              <p>{profile.businessType || 'N/A'}</p>
            </div>
          )}
          {profile.locationUrl && (
            <div>
              <h3 className="font-semibold text-lg">Location URL</h3>
              <a
                href={profile.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 hover:text-blue-900 transition"
              >
                {profile.locationUrl}
              </a>
            </div>
          )}
          {profile.address && (
            <div>
              <h3 className="font-semibold text-lg">Address</h3>
              <p>{profile.address}</p>
            </div>
          )}
          {profile.about && (
            <div>
              <h3 className="font-semibold text-lg">About</h3>
              <p className="whitespace-pre-wrap">{profile.about}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

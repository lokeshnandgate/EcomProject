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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedBusinessUser = sessionStorage.getItem('businessInfo');
    const storedUser = sessionStorage.getItem('userInfo');

    if (storedBusinessUser) {
      const parsed = JSON.parse(storedBusinessUser);
      const { _id, userType } = parsed.user;
      if (userType === 'businessUser') {
        setUserType('business');
        setUserId(_id);
        dispatch(fetchBusinessProfile(_id));
      }
    }

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const { _id, userType } = parsed.user;
      if (userType === 'customerUser') {
        setUserType('user');
        setUserId(_id);
        dispatch(fetchUserProfile(_id));
      }
    }
  }, [dispatch]);

  const profile = userType === 'business' ? business : user;

  if (loading) return <p className="text-center mt-10 text-blue-500 animate-pulse">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-xl rounded-3xl mt-10 border border-gray-200 relative">
      {/* Edit Button */}
      <Link href="/components/profile/editprofile">
        <button className="absolute top-6 right-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Edit Profile
        </button>
      </Link>

      <div className="flex flex-col items-center text-center">
        <Image
          src={profile.profilePic || '/default-avatar.png'}
          width={120}
          height={120}
          className="rounded-full border shadow mb-4"
          alt="Profile Picture"
        />
        <h2 className="text-3xl font-semibold text-blue-800 mb-2">{profile.username}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <p className="text-gray-600">{profile.contactNumber}</p>
      </div>

      <div className="mt-8 space-y-4">
        {userType === 'business' && (
          <div>
            <h3 className="text-lg font-medium">Business Type:</h3>
            <p className="text-gray-700">{profile.businessType || 'N/A'}</p>
          </div>
        )}

        {profile.locationUrl && (
          <div>
            <h3 className="text-lg font-medium">Location URL:</h3>
            <a href={profile.locationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {profile.locationUrl}
            </a>
          </div>
        )}

        {profile.address && (
          <div>
            <h3 className="text-lg font-medium">Address:</h3>
            <p className="text-gray-700">{profile.address}</p>
          </div>
        )}

        {profile.about && (
          <div>
            <h3 className="text-lg font-medium">About:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.about}</p>
          </div>
        )}
      </div>
    </div>
  );
}
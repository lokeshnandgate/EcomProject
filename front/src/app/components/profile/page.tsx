"use client";
import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store/store';
import {  fetchUserProfile,
  fetchBusinessProfile,
  clearProfile} from '../../redux/profile/slice';
import { RootState } from '../../redux/store/store';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    // Get profile from the API when the page is mounted
    const userId = 'user_id_here';  // Replace with the actual user ID
    const businessId = 'business_id_here';  // Replace with the actual business ID

    if (profile && 'businessType' in profile) {
      dispatch(fetchBusinessProfile(businessId));
    } else {
      dispatch(fetchUserProfile(userId));
    }

    return () => {
      dispatch(clearProfile()); // Clean up profile data when the component is unmounted
    };
  }, [dispatch, profile]);

  if (loading) return <div>Loading...</div>;

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Profile</h1>
      <div>
        <img src={profile?.profilePicture || '/default-profile.png'} alt="Profile Picture" />
        <h2>{profile?.username}</h2>
        <p>Email: {profile?.email}</p>
        {profile?.contactNumber && <p>Contact: {profile?.contactNumber}</p>}
        {profile && 'businessType' in profile && <p>Business Type: {profile.businessType}</p>}
        {profile?.locationUrl && <p>Location: <a href={profile.locationUrl}>{profile.locationUrl}</a></p>}
        {profile?.address && <p>Address: {profile?.address}</p>}
        {profile?.about && <p>About: {profile?.about}</p>}
        <button onClick={() => window.location.href = '/profile/edit'}>Edit Profile</button>
      </div>
    </div>
  );
};

export default ProfilePage;

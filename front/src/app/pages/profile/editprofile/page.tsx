'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import {
  fetchUserProfile,
  updateUserProfile,
  fetchBusinessProfile,
  updateBusinessProfile,
} from '../../../redux/profile/action';
import Image from 'next/image';

export default function EditProfilePage() {
  const dispatch = useAppDispatch();
  const { user, business, loading, error } = useAppSelector((state) => state.profile);

  const [formData, setFormData] = useState<any>({});
  const [previewImage, setPreviewImage] = useState<string>('');
  const [userType, setUserType] = useState<'user' | 'business' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    if (userType === 'user' && user) {
      setFormData(user);
      setPreviewImage(user.profilePic || '');
    }
    if (userType === 'business' && business) {
      setFormData(business);
      setPreviewImage(business.profilePic || '');
    }
  }, [user, business, userType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setFormData((prev: any) => ({ ...prev, profilePic: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const submitData = {
      id: userId,
      username: formData.username,
      email: formData.email,
      contactNumber: formData.contactNumber,
      locationUrl: formData.locationUrl,
      address: formData.address,
      about: formData.about,
      profilePic: formData.profilePic,
      ...(userType === 'business' && { businessType: formData.businessType }),
    };

    if (userType === 'business') {
      await dispatch(updateBusinessProfile(submitData));
    } else {
      await dispatch(updateUserProfile(submitData));
    }

    window.location.href = '/pages/profile';
  };

  if (loading) return <p className="text-center mt-10 text-blue-300 animate-pulse">Loading your profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0c3fc] via-[#8ec5fc] to-[#a1c4fd] flex justify-center items-center p-6">
      <div className="w-full max-w-3xl bg-white/30 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 text-gray-900">
        <h1 className="text-3xl font-bold text-center mb-8">Edit Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <Image
              src={previewImage || '/default-avatar.png'}
              width={100}
              height={100}
              className="rounded-full object-cover border-4 border-white shadow-md"
              alt="Profile"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username || ''}
              onChange={handleInputChange}
            />
            <input
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
            <input
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber || ''}
              onChange={handleInputChange}
            />
            <input
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              name="locationUrl"
              placeholder="Location URL"
              value={formData.locationUrl || ''}
              onChange={handleInputChange}
            />

            {userType === 'business' && (
              <select
                name="businessType"
                value={formData.businessType || ''}
                onChange={handleInputChange}
                className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Business Type</option>
                <option value="onlineProductMarketplace">🛍 Online Product Marketplace</option>
                <option value="foodDelivery">🍽 Food Delivery & Table Booking</option>
                <option value="hotelBooking">🏨 Hotel & Room Booking</option>
                <option value="salonSpaBooking">💇‍♀️ Salon & Spa Booking</option>
                <option value="groceryDelivery">🛒 Grocery & Essentials Delivery</option>
                <option value="eventTicketBooking">🎫 Event Ticket Booking</option>
                <option value="rentalMarketplace">🚗 Rental Marketplace</option>
                <option value="digitalProductsStore">💾 Digital Products Store</option>
                <option value="hyperlocalFarmDelivery">🌿 Hyperlocal Farm/Food Delivery</option>
              </select>
            )}

            <input
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address || ''}
              onChange={handleInputChange}
            />
            <textarea
              className="bg-white/60 text-gray-800 border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400 col-span-2"
              name="about"
              placeholder="About"
              rows={3}
              value={formData.about || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:brightness-110 hover:scale-105 transition duration-200"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

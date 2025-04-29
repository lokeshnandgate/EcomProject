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

export default function ProfilePage() {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
      setFormData((prev: any) => ({ ...prev, profilePic: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    const submitData: any = {
      id: userId,
      username: formData.username,
      email: formData.email,
      contactNumber: formData.contactNumber,
      locationUrl: formData.locationUrl,
      address: formData.address,
      about: formData.about,
    };

    if (userType === 'business') {
      submitData.businessType = formData.businessType;
      await dispatch(updateBusinessProfile(submitData));
    } else if (userType === 'user') {
      await dispatch(updateUserProfile(submitData));
    }
  };

  if (loading) return <p className="text-center mt-10 text-blue-500 animate-pulse">Loading your profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-xl rounded-3xl mt-10 border border-blue-100">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-10">Edit Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <Image
            src={previewImage || '/default-avatar.png'}
            width={120}
            height={120}
            className="rounded-full border shadow"
            alt="Profile Picture"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-3" />
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Location URL</label>
            <input
              type="text"
              name="locationUrl"
              value={formData.locationUrl || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          {userType === 'business' && (
            <div className="mb-5">
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Business Type</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType || ''}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
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
            </div>
          )}

          <div>
            <label className="block font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium">About</label>
            <textarea
              name="about"
              rows={4}
              value={formData.about || ''}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
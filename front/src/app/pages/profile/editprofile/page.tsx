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
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiInfo, 
  FiCamera, FiSave, FiEdit2, FiGlobe, FiBriefcase 
} from 'react-icons/fi';
import { 
  FaStore, FaHotel, FaUtensils, FaTicketAlt, FaCar, 
  FaShoppingBag, FaUserTie, FaUserCircle 
} from 'react-icons/fa';
import { GiFarmer, GiSellCard } from 'react-icons/gi';
import { MdComputer, MdOutlineSpa, MdBusiness } from 'react-icons/md';
import { BsBuilding, BsShopWindow } from 'react-icons/bs';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-purple-700 flex items-center justify-center">
          <svg className="animate-pulse w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Loading your profile...
        </p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center border-2 border-red-200">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2 flex items-center justify-center">
          <FiInfo className="mr-2" /> Error Loading Profile
        </h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center mx-auto"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 flex justify-center items-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-lg p-6 md:p-10 rounded-2xl shadow-2xl border-2 border-white/80">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-full mb-4">
            {userType === 'business' ? (
              <MdBusiness className="text-3xl" />
            ) : (
              <FaUserCircle className="text-3xl" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {userType === 'business' ? 'Edit Profile' : 'Edit Your Profile'}
          </h1>
          <p className="text-gray-600 flex items-center justify-center">
            <FiEdit2 className="mr-2" />
            Update your information to keep your profile fresh and engaging
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl relative ring-4 ring-purple-200/50">
                <Image
                  src={previewImage || '/default-avatar.png'}
                  fill
                  className="object-cover"
                  alt="Profile"
                />
              </div>
              <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group-hover:opacity-100">
                <FiCamera className="text-xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-500">
                <FiUser className="text-lg" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-sm hover:shadow-md"
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                <FiMail className="text-lg" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Contact Number */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-500">
                <FiPhone className="text-lg" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-sm hover:shadow-md"
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Location URL */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                <FiMapPin className="text-lg" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm hover:shadow-md"
                type="text"
                name="locationUrl"
                placeholder="Location URL"
                value={formData.locationUrl || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Business Type Dropdown */}
            {userType === 'business' && (
              <div className="relative col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                  <FaStore className="text-lg" />
                </div>
                <select
                  name="businessType"
                  value={formData.businessType || ''}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm hover:shadow-md"
                >
                  <option value="">Select Business Type</option>
                  <option value="onlineProductMarketplace">Online Product Marketplace</option>
                  <option value="foodDelivery">Food Delivery & Table Booking</option>
                  <option value="hotelBooking">Hotel & Room Booking</option>
                  <option value="salonSpaBooking">Salon & Spa Booking</option>
                  <option value="groceryDelivery">Grocery & Essentials Delivery</option>
                  <option value="eventTicketBooking">Event Ticket Booking</option>
                  <option value="rentalMarketplace">Rental Marketplace</option>
                  <option value="digitalProductsStore">Digital Products Store</option>
                  <option value="hyperlocalFarmDelivery">Hyperlocal Farm/Food Delivery</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="relative col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                <FiHome className="text-lg" />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-sm hover:shadow-md"
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* About */}
            <div className="relative col-span-2">
              <div className="absolute top-3 left-3 text-teal-500">
                <FiInfo className="text-lg" />
              </div>
              <textarea
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-sm hover:shadow-md min-h-[120px]"
                name="about"
                placeholder="Tell us about yourself..."
                rows={3}
                value={formData.about || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              <FiSave className="mr-2 text-xl" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// app/business-register/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store/store';
import { registerUser } from '@/app/redux/businessreg/action';

export default function BusinessRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.businessRegister // Correct slice name
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    captcha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      username: '',
      email: '',
      captcha: '',
    };

    if (formData.username.length < 6) {
      newErrors.username = 'Username must be at least 6 characters.';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!captchaChecked) {
      newErrors.captcha = 'Please complete the CAPTCHA.';
    }

    if (newErrors.username || newErrors.email || newErrors.captcha) {
      setFormErrors(newErrors);
      return;
    }

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.businessType
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      alert('Business registration successful!');
      router.push('/login');
    } catch (err: any) {
      alert(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage or replace with appropriate logic
    if (token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-800 via-purple-800 to-blue-700">
      <div className="w-full max-w-md p-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Create Your Business Account</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-white text-sm mb-4">Registering...</p>}
        {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-md bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your username"
              required
            />
            {formErrors.username && <p className="text-red-400 text-sm mt-1">{formErrors.username}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-md bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your email"
              required
            />
            {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
            <div className="relative">
              <input
                type={formData.showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded-md bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, showPassword: !formData.showPassword })
                }
                className="absolute inset-y-0 right-3 flex items-center text-white text-sm"
              >
                {formData.showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">Confirm Password</label>
            <div className="relative">
              <input
                type={formData.showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full mt-2 p-3 rounded-md bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, showConfirmPassword: !formData.showConfirmPassword })
                }
                className="absolute inset-y-0 right-3 flex items-center text-white text-sm"
              >
                {formData.showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="businessType" className="block text-sm font-medium text-white">Business Type</label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-md bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

          <div className="flex items-center mt-4 space-x-3">
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="accent-green-500 w-5 h-5"
            />
            <label className="text-white text-sm">I’m not a robot</label>
          </div>
          {formErrors.captcha && <p className="text-red-400 text-sm mt-1">{formErrors.captcha}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-50"
            >
              ✅ Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

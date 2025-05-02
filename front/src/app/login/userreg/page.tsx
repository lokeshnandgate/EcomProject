// app/user-register/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store/store';
import { registerUser } from '@/app/redux/userreg/action';

export default function UserRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, userInfo } = useSelector((state: RootState) => state.user); // Correct slice name

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    captcha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      !formData.confirmPassword
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await dispatch(registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })).unwrap();
      alert('User registration successful!');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-900 px-6 py-16">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20 text-white">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-white drop-shadow-md">
          Create User Account
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-white text-sm mb-4">Registering...</p>}
        {userInfo && <p className="text-green-500 text-sm mb-4">Registration successful!</p>}

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
              className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              ✅ Create Account
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Already have an account? <span className="font-semibold">Log in</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
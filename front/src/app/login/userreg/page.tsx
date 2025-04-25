'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store/store';
import { registerUser } from '@/app/redux/userreg/action';

export default function UserRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const { loading, error, userInfo } = useSelector((state: RootState) => state.register);

  const handleRegister = () => {
    if (!captchaChecked) {
      alert('Please verify the captcha before proceeding.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (username.length < 6) {
      alert('Username must be at least 6 characters.');
      return;
    }

    if (!email.includes('@')) {
      alert('Invalid email format.');
      return;
    }

    dispatch(registerUser({ username, email, password }));
  };

  useEffect(() => {
    if (userInfo) {
      alert('Registration successful!');
      router.push('/login');
    }
  }, [userInfo, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-900 to-blue-900 px-6 py-16">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20 text-white">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-white drop-shadow-md">
          Create User Account
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
            />
            {username.length > 0 && username.length < 6 && (
              <p className="text-red-500 text-sm mt-1">
                Username must be at least 6 characters long.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
            />
            {email.length > 0 && !email.includes('@') && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid email address containing "@".
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Create Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300"
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
              />
              <button
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300"
              >
                {confirmPasswordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="accent-green-400 w-5 h-5"
            />
            <label className="text-sm">I’m not a robot</label>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-medium mt-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => router.push('/login')}
              className="bg-red-600 hover:bg-red-700 py-2 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-red-400"
            >
              ⬅ Back
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 py-2 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-emerald-400"
            >
              {loading ? 'Creating...' : '✅ Create'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
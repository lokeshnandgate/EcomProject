'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store/store';
import { loginUser, loginBusiness } from '../redux/login/action';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'user' | 'business'>('user');

  const userState = useSelector((state: RootState) => state.user);
  const businessState = useSelector((state: RootState) => state.business);

  const currentState = userType === 'user' ? userState : businessState;

  // ✅ Updated handleLogin function
  const handleLogin = () => {
    if (!identifier || !password) return;

    const payload = { identifier, password, userType };

    if (userType === 'user') {
      dispatch(loginUser(payload));
    } else {
      dispatch(loginBusiness(payload));
    }
  };

  // Redirect after successful login
  useEffect(() => {
    if (userState.userInfo) {
      router.push('/dashboard');
    }
    if (businessState.businessInfo) {
      router.push('/dashboard');
    }
  }, [userState.userInfo, businessState.businessInfo, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 px-4 py-12">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-white/20 text-white animate-fade-in">
        <h1 className="text-4xl font-bold text-center mb-8 tracking-wide">Welcome</h1>

        <p className="text-center text-sm text-gray-300 mb-6">
          Please log in using your username or email and password.
        </p>

        {currentState.error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-sm">
            {currentState.error}
          </div>
        )}

        {/* User Type Selector */}
        <div className="mb-5 flex space-x-4">
          <button
            onClick={() => setUserType('user')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              userType === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => setUserType('business')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              userType === 'business'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Business Login
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">
            {userType === 'business' ? 'Business Username or Email' : 'Username or Email'}
          </label>
          <input
            type="text"
            placeholder={
              userType === 'business'
                ? 'Enter your business email'
                : 'Enter your username or email'
            }
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={currentState.loading}
          className={`w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 py-3 rounded-xl font-semibold transition duration-300 shadow-md ${
            currentState.loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {currentState.loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-8 grid gap-4">
          <button
            onClick={() => router.push('/login/userreg')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 py-3 rounded-xl font-semibold transition duration-300 shadow-md"
          >
            Create User Account
          </button>
          <button
            onClick={() => router.push('/login/businessreg')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 py-3 rounded-xl font-semibold transition duration-300 shadow-md"
          >
            Create Business Account
          </button>
        </div>
      </div>
    </main>
  );
}

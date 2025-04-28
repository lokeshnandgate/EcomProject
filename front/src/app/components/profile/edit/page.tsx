'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
    about: '',
    contact: '',
    businessType: '',
    location: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated Profile:', formData);
    alert('Profile updated!');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center">
            {formData.avatar ? (
              <Image
                src={formData.avatar}
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-[100px] h-[100px] bg-white/20 rounded-full flex items-center justify-center text-white text-sm">
                No Avatar
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
                placeholder="Phone or social link"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Business Type</label>
              <input
              type="text"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
              placeholder="e.g., Restaurant, Retail, IT Services"
              />
            </div>

            {formData.businessType && (
              <button
              onClick={() => alert('Add Product functionality not implemented yet')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition duration-200"
              >
              + Add Product
              </button>
            )}

            <div>
              <label className="block mb-1 text-sm font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
                placeholder="Full address"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">About</label>
            <textarea
              name="about"
              rows={4}
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell us about yourself or your business..."
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 placeholder-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 font-semibold rounded-lg transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}

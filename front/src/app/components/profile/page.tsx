'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store/store';
import Image from 'next/image';

export default function ProfilePage() {
  const { userInfo } = useSelector((state: RootState) => state.register); // for normal users
  const { userInfo: businessInfo } = useSelector((state: RootState) => state.businessUser); // for business

  const isBusiness = !!businessInfo;
  const profileData = isBusiness ? businessInfo : userInfo;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    businessType: '',
    profilePicture: '',
    location: '',
    about: '',
    address: '',
    contact: '',
    showPassword: false,
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        password: '',
        businessType: profileData.businessType || '',
        profilePicture: profileData.profilePicture || '',
        location: profileData.location || '',
        about: profileData.about || '',
        address: profileData.address || '',
        contact: profileData.contact || '',
        showPassword: false,
      });
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert('Profile updated successfully! (Mock action)');
    // Submit formData to the backend
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-800 py-16 px-4 flex justify-center items-center">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl max-w-3xl w-full text-white shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 drop-shadow">Profile Settings</h1>

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
            {formData.profilePicture ? (
              <Image src={formData.profilePicture} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-white/60 text-xl">No Image</div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
        </div>

        <div className="grid gap-6">
          <InputField label="Username" name="username" value={formData.username} onChange={handleChange} />
          <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={formData.showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Update password"
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-white/70"
              >
                {formData.showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {isBusiness && (
            <>
              <SelectField
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                options={[
                  '🛍 Online Product Marketplace',
                  '🍽 Food Delivery & Table Booking',
                  '🏨 Hotel & Room Booking',
                  '💇‍♀️ Salon & Spa Booking',
                  '🛒 Grocery & Essentials Delivery',
                  '🎫 Event Ticket Booking',
                  '🚗 Rental Marketplace',
                  '💾 Digital Products Store',
                  '🌿 Hyperlocal Farm/Food Delivery',
                ]}
              />
              <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />
              <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
            </>
          )}

          <TextAreaField label="About" name="about" value={formData.about} onChange={handleChange} />
          <InputField label="Contact" name="contact" value={formData.contact} onChange={handleChange} />
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg font-semibold shadow-md"
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={`Write about your ${label.toLowerCase()}`}
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">Select {label}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option.replace(/[^a-z]/gi, '')}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

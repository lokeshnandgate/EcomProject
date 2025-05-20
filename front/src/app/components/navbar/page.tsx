// src/app/components/navbar/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  const fetchCurrentUser = useCallback(() => {
    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
      const userInfo = sessionStorage.getItem('userInfo');
      const businessInfo = sessionStorage.getItem('businessInfo');

      if (userInfo) {
        return JSON.parse(userInfo);
      } else if (businessInfo) {
        return JSON.parse(businessInfo);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    setCurrentUserProfile(fetchCurrentUser());

    const handleProfileUpdate = () => {
      console.log('Profile updated event received, re-fetching user profile...');
      setCurrentUserProfile(fetchCurrentUser());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchCurrentUser]);

  const handleAddToCart = () => {
    router.push('/pages/addtocart');
  };

  const handleChat = () => {
    router.push('/pages/chat');
  };

  const gotoprofile = () => {
    const id = currentUserProfile?._id;
    if (id) {
      router.push(`/pages/profile/${id}`);
    } else {
      console.warn('No user or business info found to navigate to profile.');
    }
  };

  const handleLogout = async () => {
    const confirmLogout = confirm('Do you want to logout?');
    if (!confirmLogout) return;

    const token = sessionStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';

    // Perform client-side cleanup first
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('businessInfo');
    sessionStorage.removeItem('token');
    setCurrentUserProfile(null);

    // Attempt server logout if token exists
    if (token && API_URL) {
      try {
        await axios.post(`${API_URL}/api/logout`, {}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Log the error but continue with the logout process
        console.warn('Logout API call failed (proceeding with client-side cleanup):', error);
      }
    }

    router.push('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    try {
      const response = await axios.get(`${API_URL}/api/products?search=${query}`);
      setSearchResults(response.data || []);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn('No products found for the search query.');
      } else {
        console.error('Search error:', error);
      }
      setSearchResults([]);
    }
  };

  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title">UrbanCart</h1>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products..."
            className="search-input"
          />

          <div className="icons-container">
            <button onClick={handleChat} className="icon-button">
              <img src="/chat.svg" alt="Chat" />
            </button>

            <button onClick={gotoprofile} className="icon-button">
              <img
                src={currentUserProfile?.profilePic || '/default-profile.png'}
                alt="Profile"
                className="profile-image"
              />
            </button>

            <div className="dropdown">
              <button onClick={toggleDropdown} className="dropdown-button">
                ⋮
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={handleAddToCart} className="dropdown-item">
                    Add to Cart
                  </button>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((product) => (
            <div key={product._id} className="search-result-item" onClick={() => router.push(`/pages/product/${product._id}`)}>
              <img src={product.image} alt={product.title} className="result-image" />
              <div>
                <h4>{product.title}</h4>
                <p>₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #ddd;
          gap: 15px;
          position: relative;
          z-index: 1000;
        }
        .navbar-title {
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        }
        .search-input {
          flex-grow: 1;
          max-width: 300px;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: #0070f3;
        }
        .icons-container {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .icon-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-button img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ccc;
          padding: 4px;
          background: white;
          object-fit: cover;
          transition: transform 0.2s;
        }
        .icon-button:hover img {
          transform: scale(1.05);
        }
        .profile-image {
          object-fit: cover;
        }
        .dropdown {
          position: relative;
        }
        .dropdown-button {
          background-color: transparent;
          color: inherit;
          border: none;
          padding: 0;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .dropdown-button:hover {
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 150px;
          overflow: hidden;
        }
        .dropdown-item {
          padding: 10px 16px;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
          display: block;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        .dropdown-item:hover {
          background-color: #f5f5f5;
        }
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 8px 8px;
          max-height: 400px;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 999;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #eee;
          gap: 15px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .search-result-item:hover {
          background-color: #f9f9f9;
        }
        .search-result-item:last-child {
          border-bottom: none;
        }
        .result-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #eee;
        }
      `}</style>
    </>
  );
};

export default Navbar;
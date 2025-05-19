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

    if (!API_URL) {
      console.error('API base URL is not defined. Please check your environment variables.');
      alert('Logout failed: API configuration error.');
      return; // Stop execution if API_URL is critical and missing
    }

    if (token) {
      try {
        const response = await axios.post(`${API_URL}/api/logout`, {}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          console.log('Logout successful (backend confirmed)');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.error('Logout endpoint not found (404). Ensure `/api/logout` is implemented and API URL is correct on the server.');
            alert('Logout failed: Server endpoint not found. Please contact support.');
          } else {
            console.error(`Logout error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            alert(`Logout failed: ${error.response?.data?.message || 'Server error.'}`);
          }
        } else {
          console.error('Unexpected error during logout:', error);
          alert('Logout failed due to an unexpected error. Please try again.');
        }
      }
    } else {
      console.warn('No token found in session storage. Proceeding with client-side logout only.');
    }

    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('businessInfo');
    sessionStorage.removeItem('token');
    setCurrentUserProfile(null);
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
            <button onClick={() => router.push('/pages/chat')} className="icon-button">
              <img src="/chat.svg" alt="Chat" />
            </button>

            <button onClick={gotoprofile} className="icon-button">
              <img
                src={currentUserProfile?.profilePic || '/default-profile.png'}
                alt="Profile"
              />
            </button>

            <div className="dropdown">
              <button onClick={toggleDropdown} className="dropdown-button" style={{ backgroundColor: 'transparent', color: 'inherit', border: 'none', padding: 0, fontSize: '24px', cursor: 'pointer' }}>
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
            <div key={product._id} className="search-result-item">
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
        }
        .navbar-title {
          font-size: 18px;
          font-weight: bold;
        }
        .search-input {
          flex-grow: 1;
          max-width: 300px;
          padding: 6px 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
        }
        .icons-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .icon-button img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ccc;
          padding: 4px;
          background: white;
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
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 120px;
        }
        .dropdown-item {
          padding: 10px;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
          display: block;
        }
        .dropdown-item:hover {
          background-color: #f0f0f0;
        }

        .search-results {
          background-color: #fffce8;
          padding: 10px 20px;
          border-top: 1px solid #ddd;
          max-height: 300px;
          overflow-y: auto;
          position: absolute;
          width: 100%;
          box-sizing: border-box;
          z-index: 999;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          gap: 12px;
        }
        .search-result-item:last-child {
          border-bottom: none;
        }

        .result-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
      `}</style>
    </>
  );
};

export default Navbar;
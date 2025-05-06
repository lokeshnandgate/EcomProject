'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleAddToCart = () => {
    router.push('/pages/addtocart');
  };

  const handleChat = () => {
    router.push('/pages/chat');
  };

  const handleLogout = async () => {
    const confirmLogout = confirm('Do you want to logout?');
    if (!confirmLogout) return;

    const token = sessionStorage.getItem('token');
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

    if (token) {
      try {
        await axios.post(`${API_URL}/api/logout`, {}, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('businessInfo');
    sessionStorage.removeItem('token');
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

          <button onClick={() => router.push('/pages/profile')} className="icon-button">
            <img src="/profile.svg" alt="Profile" />
          </button>

          <div className="dropdown">
            <button onClick={toggleDropdown} className="dropdown-button">
              ▼
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
        .icon-button img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #ccc;
          padding: 4px;
          background: white;
          cursor: pointer;
        }
        .dropdown {
          position: relative;
        }
        .dropdown-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
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
        }
        .dropdown-item {
          padding: 10px;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
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
        }

        .search-result-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          gap: 12px;
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

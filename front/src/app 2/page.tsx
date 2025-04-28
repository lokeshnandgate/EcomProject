'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-900 to-blue-700 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
            Welcome to Your All-in-One Service Hub!
          </h1>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto">
            From food to fashion, digital downloads to destination stays — everything you need is right here. Browse, book, buy, and relax as we bring the best of services to your fingertips.
          </p>
        </div>

        <div className="space-y-8 max-w-3xl mx-auto">
          {[
            {
              title: 'Online Product Marketplace🛍 ',
              desc: 'Discover an ever-growing selection of goods in our marketplace. Whether it’s electronics, fashion, or handmade crafts, shop confidently with trusted vendors and smooth delivery.'
            },
            {
              title: '🍽 Food Delivery & Table Booking',
              desc: 'Craving your favorite meal or planning a dinner out? Order from local restaurants or reserve your table in advance — hassle-free and instant.'
            },
            {
              title: '🏨 Hotel & Room Booking',
              desc: 'Book comfortable stays at the best prices. From boutique hotels to beachfront resorts, enjoy instant confirmation and exclusive deals.'
            },
            {
              title: '💇‍♀️ Salon & Spa Booking',
              desc: 'Pamper yourself with spa treatments, salon visits, and wellness sessions. Book your time slot easily and skip the wait.'
            },
            {
              title: '🛒 Grocery & Essentials Delivery',
              desc: 'Shop groceries, household items, and daily needs from local stores and get them delivered to your doorstep quickly and safely.'
            },
            {
              title: '🎫 Event Ticket Booking',
              desc: 'Secure your spot at concerts, workshops, or sports events. Browse listings, pick seats, and get e-tickets instantly.'
            },
            {
              title: '🚗 Rental Marketplace',
              desc: 'Rent cars, bikes, tools, or even party supplies. A flexible and cost-effective way to get what you need when you need it.'
            },
            {
              title: '💾 Digital Products Store',
              desc: 'Download eBooks, software, design assets, and more. A secure platform for instant access to digital content.'
            },
            {
              title: '🌿 Hyperlocal Farm/Food Delivery',
              desc: 'Get fresh produce, dairy, and organic items straight from nearby farms. Support local growers while enjoying peak freshness.'
            }
          ].map((item, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-semibold text-green-300 border-l-4 pl-3 border-green-400">
                {item.title}
              </h2>
              <p className="text-gray-100 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
            <div className="relative group">
              <button
              onClick={() => router.push('/login')}
              className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300"
              >
              Get Started
              </button>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded-md px-3 py-2 shadow-lg">
              Create a new account or log in
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const [destination, setDestination] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!destination.trim()) return;
    router.push(`/trip?destination=${encodeURIComponent(destination)}`);
  };

  const destinations = ['Tokyo', 'Rome', 'Marrakech', 'Rio', 'Bangkok', 'Accra', 'Lisbon'];

  return (
    <main style={{ minHeight: '100vh', background: '#F5F0E8', color: '#1C1917' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '20px', fontWeight: 900 }}>
          Bacon<span style={{ color: '#E8573A' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px', color: '#8C7B6E' }}>
          <span style={{ cursor: 'pointer' }}>Explore</span>
          <span style={{ cursor: 'pointer' }}>How it works</span>
          <span style={{ cursor: 'pointer' }}>About</span>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 48px' }}>

        {/* Top label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', color: '#E8573A', textTransform: 'uppercase', marginBottom: '32px' }}
        >
          AI Travel Planner
        </motion.p>

        {/* Big headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: '40px', maxWidth: '700px' }}
        >
          Where do you<br />
          want to go<span style={{ color: '#E8573A' }}>?</span>
        </motion.h1>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'flex', gap: '12px', marginBottom: '20px', maxWidth: '600px' }}
        >
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 5 days in Tokyo, food & culture..."
            style={{
              flex: 1,
              background: 'white',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              color: '#1C1917',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: '#E8573A',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Plan trip →
          </button>
        </motion.div>

        {/* Destination tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '80px' }}
        >
          <span style={{ fontSize: '12px', color: '#8C7B6E', paddingTop: '6px', marginRight: '4px' }}>Try:</span>
          {destinations.map((d) => (
            <button
              key={d}
              onClick={() => setDestination(d)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '100px',
                padding: '5px 14px',
                fontSize: '12px',
                color: '#8C7B6E',
                cursor: 'pointer',
              }}
            >
              {d}
            </button>
          ))}
        </motion.div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '48px' }}>

          {/* How it works — horizontal */}
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', color: '#8C7B6E', textTransform: 'uppercase', marginBottom: '32px' }}>
            How it works
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
            {[
              { num: '01', title: 'Describe your trip', desc: 'Tell us your destination, duration, and what you love doing.' },
              { num: '02', title: 'AI builds your plan', desc: 'GPT-4 generates a full day-by-day itinerary in seconds.' },
              { num: '03', title: 'Explore on the map', desc: 'Every activity is pinned on an interactive map you can explore.' },
            ].map((step) => (
              <div key={step.num}>
                <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', fontWeight: 900, color: '#E8573A', opacity: 0.3, marginBottom: '12px', lineHeight: 1 }}>
                  {step.num}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1917', marginBottom: '8px' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#8C7B6E', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
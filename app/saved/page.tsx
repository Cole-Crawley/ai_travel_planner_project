'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SavedTrip } from '@/types';

const CATEGORY_DOTS: Record<string, string> = {
  Culture:    '#6366F1',
  Food:       '#F97316',
  Nature:     '#22C55E',
  Shopping:   '#A855F7',
  Adventure:  '#F43F5E',
  Relaxation: '#0EA5E9',
};

function getTripAccentColor(destination: string): string {
  // Deterministic colour from destination name — gives each card a distinct tint
  const palette = ['#E8573A', '#0D9488', '#7C5CBF', '#C2853B', '#2563EB', '#B45309'];
  let hash = 0;
  for (let i = 0; i < destination.length; i++) hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function SavedPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTrips(JSON.parse(localStorage.getItem('savedTrips') || '[]'));
  }, []);

  const deleteTrip = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      const updated = trips.filter(t => t.id !== id);
      setTrips(updated);
      localStorage.setItem('savedTrips', JSON.stringify(updated));
      setDeletingId(null);
    }, 350);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F5F0E8', color: '#1C1917' }}>

      {/* Header */}
      <div style={{ padding: '32px 48px 0', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: '13px', color: '#E8573A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '40px', opacity: 0.9 }}>
          ← Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#B0A090', textTransform: 'uppercase', marginBottom: '8px' }}>
              Your collection
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '52px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
              My trips
            </h1>
          </div>
          {trips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '100px', padding: '10px 20px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#E8573A', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>{trips.length}</span>
              <span style={{ fontSize: '13px', color: '#8C7B6E' }}>{trips.length === 1 ? 'itinerary saved' : 'itineraries saved'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px 80px' }}>
        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '100px 0 80px' }}
          >
            {/* Decorative compass */}
            <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.5 }}>🧭</div>
            <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: '#1C1917' }}>
              No trips yet
            </p>
            <p style={{ fontSize: '14px', color: '#A09080', marginBottom: '32px', maxWidth: '280px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Plan your first itinerary and it will appear here
            </p>
            <Link
              href="/"
              style={{ display: 'inline-block', background: '#E8573A', color: 'white', padding: '13px 28px', borderRadius: '100px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, letterSpacing: '0.01em' }}
            >
              Plan a trip
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {trips.map((trip, i) => {
                const accent = getTripAccentColor(trip.destination);
                const isDeleting = deletingId === trip.id;
                const totalActivities = trip.itinerary.days.reduce((sum, d) => sum + d.activities.length, 0);

                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -12 : 0, scale: isDeleting ? 0.97 : 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: isDeleting ? 0.3 : 0.4, delay: isDeleting ? 0 : i * 0.07 }}
                    style={{
                      background: 'white',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                      position: 'relative',
                    }}
                  >
                    {/* Accent stripe */}
                    <div style={{ height: '4px', background: accent, width: '100%' }} />

                    <div style={{ padding: '28px 32px 24px' }}>

                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                          <h2 style={{
                            fontFamily: 'var(--font-playfair), serif',
                            fontSize: '28px',
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            marginBottom: '6px',
                            color: '#1C1917',
                          }}>
                            {trip.destination}
                          </h2>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#A09080' }}>Saved {trip.savedAt}</span>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D0C8C0' }} />
                            <span style={{ fontSize: '12px', color: '#A09080' }}>{trip.itinerary.duration} days</span>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D0C8C0' }} />
                            <span style={{ fontSize: '12px', color: '#A09080' }}>{totalActivities} activities</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTrip(trip.id)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '100px',
                            color: '#A09080',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '6px 14px',
                            transition: 'all 0.15s',
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => {
                            (e.target as HTMLElement).style.background = '#FFF0EE';
                            (e.target as HTMLElement).style.color = '#E8573A';
                            (e.target as HTMLElement).style.borderColor = 'rgba(232,87,58,0.2)';
                          }}
                          onMouseLeave={e => {
                            (e.target as HTMLElement).style.background = 'none';
                            (e.target as HTMLElement).style.color = '#A09080';
                            (e.target as HTMLElement).style.borderColor = 'rgba(0,0,0,0.08)';
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      {/* Day timeline */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {trip.itinerary.days.slice(0, 4).map((day, di) => {
                            const isLast = di === Math.min(trip.itinerary.days.length, 4) - 1 && trip.itinerary.days.length <= 4;
                            return (
                              <div key={day.day} style={{ display: 'flex', gap: '0', position: 'relative' }}>

                                {/* Timeline spine */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px', flexShrink: 0 }}>
                                  <div style={{
                                    width: '8px', height: '8px',
                                    borderRadius: '50%',
                                    background: accent,
                                    flexShrink: 0,
                                    marginTop: '14px',
                                    opacity: 0.7 + (0.3 * (1 - di / 4)),
                                  }} />
                                  {!isLast && (
                                    <div style={{ width: '1px', flex: 1, background: 'rgba(0,0,0,0.07)', minHeight: '16px' }} />
                                  )}
                                </div>

                                {/* Content */}
                                <div style={{ paddingBottom: isLast ? 0 : '10px', paddingTop: '10px', flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                                      Day {day.day}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1C1917' }}>{day.theme}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {day.activities.map((a, ai) => (
                                      <span key={ai} style={{
                                        fontSize: '11px',
                                        color: '#8C7B6E',
                                        background: '#F5F0EB',
                                        padding: '2px 9px',
                                        borderRadius: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}>
                                        {a.category && (
                                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: CATEGORY_DOTS[a.category] || '#C0B8B0', flexShrink: 0 }} />
                                        )}
                                        {a.title}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {trip.itinerary.days.length > 4 && (
                            <div style={{ display: 'flex', gap: '0' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px', flexShrink: 0, paddingTop: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D0C8C0' }} />
                              </div>
                              <div style={{ paddingTop: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#A09080', fontStyle: 'italic' }}>
                                  + {trip.itinerary.days.length - 4} more days
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Link
                          href={'/trip?destination=' + encodeURIComponent(trip.itinerary.destination) + '&saved=' + trip.id}
                          style={{
                            background: accent,
                            color: 'white',
                            padding: '11px 24px',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            letterSpacing: '0.01em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          View & edit →
                        </Link>
                        <span style={{ fontSize: '12px', color: '#B0A090' }}>Opens the full itinerary</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

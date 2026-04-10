'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { TripItinerary, Activity, SavedTrip } from '@/types';

import ActivityCard from '@/components/ActivityCard';
import { motion, AnimatePresence } from 'framer-motion';

// MapLibre GL is only imported client-side — it references browser APIs
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

/** MapLibre expects [lng, lat]. AI often returns [lat, lng]. Detect and fix. */
function normalizeLngLat(coords: [number, number]): [number, number] {
  const [a, b] = coords;
  if (Math.abs(a) > 90 && Math.abs(b) <= 180) return [b, a];
  return [a, b];
}

/** Guard against malformed saved/API data — ensure every day has an activities array. */
function sanitiseItinerary(data: TripItinerary): TripItinerary {
  return {
    ...data,
    days: (data.days ?? []).map(day => ({
      ...day,
      activities: Array.isArray(day.activities) ? day.activities : [],
    })),
  };
}

function TripPageInner() {
  const searchParams = useSearchParams();
  const destination  = searchParams.get('destination') || '';
  const savedId      = searchParams.get('saved') || '';

  const [itinerary,             setItinerary]            = useState<TripItinerary | null>(null);
  const [loading,               setLoading]              = useState(true);
  const [error,                 setError]                = useState('');
  const [activeDay,             setActiveDay]            = useState(0);
  const [alternatives,          setAlternatives]         = useState<string[]>([]);
  const [activityAlts,          setActivityAlts]         = useState<Activity[]>([]);
  const [loadingActAlts,        setLoadingActAlts]       = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<{ dayIndex: number; actIndex: number } | null>(null);
  const [saved,                 setSaved]                = useState(false);
  const [showSaveToast,         setShowSaveToast]        = useState(false);
  const [hoveredActivity,       setHoveredActivity]      = useState<Activity | null>(null);
  const [previewedAlt,          setPreviewedAlt]         = useState<Activity | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!destination) return;

    // ── If coming from saved trips page, load from localStorage — no API call ──
    if (savedId) {
      try {
        const stored: SavedTrip[] = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        const match = stored.find(t => t.id === savedId);
        if (match) {
          const normalised = sanitiseItinerary(match.itinerary);
          setItinerary(normalised);
          setSaved(true);
          fetchAlternatives(normalised.destination);
          setLoading(false);
          return;
        }
      } catch {
        // localStorage read failed — fall through to API
      }
    }

    // ── Fresh generation: parse freeform input then call API ──────────────────
    const daysMatch = destination.match(/\b(\d+)\s*days?\b/i);
    const tripDays  = daysMatch ? Math.min(parseInt(daysMatch[1], 10), 14) : 5;
    const cleanDest = destination
      .replace(/\b\d+\s*days?\b/gi, '')
      .replace(/\b(beach|food|culture|nature|adventure|relaxation|shopping|city|with|type|and|for)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || destination;
    const prefWords = destination.match(/\b(beach|food|culture|nature|adventure|relaxation|shopping|city)\b/gi);
    const prefs     = prefWords ? prefWords.join(', ') : '';

    const fetchItinerary = async () => {
      try {
        const res  = await fetch('/api/itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: cleanDest, days: tripDays, preferences: prefs }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Something went wrong. Please try again.');
          return;
        }
        const normalised = sanitiseItinerary(data as TripItinerary);
        setItinerary(normalised);
        fetchAlternatives(normalised.destination || cleanDest);
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [destination, savedId]);

  const fetchAlternatives = async (dest: string) => {
    try {
      const res  = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest }),
      });
      const data = await res.json();
      setAlternatives(data.alternatives || []);
    } catch (err) { console.error(err); }
  };

  const fetchActivityAlternatives = async (
    activity: Activity,
    theme: string,
    dayIndex: number,
    actIndex: number,
  ) => {
    if (selectedActivityIndex?.dayIndex === dayIndex && selectedActivityIndex?.actIndex === actIndex) {
      setSelectedActivityIndex(null);
      setActivityAlts([]);
      setPreviewedAlt(null);
      return;
    }
    setSelectedActivityIndex({ dayIndex, actIndex });
    setHoveredActivity(activity);
    setPreviewedAlt(null);
    setLoadingActAlts(true);
    try {
      const currentDay = itinerary?.days[dayIndex];
      const res  = await fetch('/api/activity-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: itinerary?.destination,
          currentActivity: activity.title,
          currentCoordinates: activity.coordinates,
          timeSlot: activity.time,
          dayActivities: currentDay?.activities ?? [],
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActivityAlts([]);
        console.warn('[alternatives]', data.message || 'rate limited');
        return;
      }
      setActivityAlts(data.alternatives || []);
    } catch (err) { console.error(err); }
    finally { setLoadingActAlts(false); }
  };

  const replaceActivity = (dayIndex: number, actIndex: number, newActivity: Activity) => {
    if (!itinerary) return;
    const updated = { ...itinerary };
    updated.days  = updated.days.map((day, di) => {
      if (di !== dayIndex) return day;
      const newActivities     = [...day.activities];
      newActivities[actIndex] = { ...newActivity, time: day.activities[actIndex].time };
      return { ...day, activities: newActivities };
    });
    setItinerary(updated);
    setSelectedActivityIndex(null);
    setActivityAlts([]);
    setPreviewedAlt(null);
    setHoveredActivity(newActivity);
  };

  const saveItinerary = () => {
    if (!itinerary) return;
    const existing: SavedTrip[] = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    if (savedId) {
      const updated = existing.map(t =>
        t.id === savedId ? { ...t, itinerary, savedAt: new Date().toLocaleDateString() } : t
      );
      localStorage.setItem('savedTrips', JSON.stringify(updated));
    } else {
      const newTrip: SavedTrip = {
        id: Date.now().toString(),
        destination: itinerary.destination,
        savedAt: new Date().toLocaleDateString(),
        itinerary,
      };
      localStorage.setItem('savedTrips', JSON.stringify([newTrip, ...existing]));
    }
    setSaved(true);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '2.5px solid rgba(232,87,58,0.2)',
        borderTopColor: '#E8573A',
        animation: 'spin 0.75s linear infinite',
        willChange: 'transform',
      }} />
      <p style={{ color: '#6B5C52', fontSize: '14px' }}>Planning your trip to {destination}...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#BF4528', fontSize: '14px' }}>{error}</p>
    </div>
  );

  // ── Derived values ─────────────────────────────────────────────────────────
  const allActivities: Activity[]   = itinerary?.days.flatMap(d => d.activities ?? []) || [];
  const displayedActivities         = activeDay === 0
    ? allActivities
    : (itinerary?.days.find(d => d.day === activeDay)?.activities ?? []);
  const rawCenter                   = allActivities[0]?.coordinates ?? [0, 0];
  const mapCenter: [number, number] = normalizeLngLat(rawCenter as [number, number]);
  const visibleAlts                 = selectedActivityIndex ? activityAlts : [];

  return (
    <main style={{ minHeight: '100vh', color: '#1C1917', background: 'transparent' }}>

      {/* Save toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1C1917', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 500, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            ✓ Trip saved to your collection
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Semi-transparent with backdrop blur */}
      <div style={{ 
        padding: '20px 40px', 
        borderBottom: '1px solid rgba(0,0,0,0.08)', 
        background: 'rgba(245, 240, 232, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'sticky', 
        top: 0, 
        zIndex: 10 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#BF4528', textDecoration: 'none' }}>← Back</Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/saved" style={{ fontSize: '13px', color: '#6B5C52', textDecoration: 'none', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 16px' }}>
              My trips
            </Link>
            <button
              onClick={saveItinerary}
              style={{ fontSize: '13px', fontWeight: 500, color: saved ? '#6B5C52' : 'white', background: saved ? 'white' : '#E8573A', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 20px', cursor: 'pointer' }}
            >
              {saved ? '✓ Saved' : 'Save trip'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '32px', fontWeight: 900, lineHeight: 1.1, marginBottom: '4px' }}>
              {itinerary?.destination}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B5C52' }}>
              {itinerary?.duration} day itinerary ·{' '}
              <span style={{ color: '#BF4528' }}>Click an activity to swap it</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveDay(0)}
              style={{ background: activeDay === 0 ? '#1C1917' : 'white', color: activeDay === 0 ? 'white' : '#6B5C52', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              All
            </button>
            {itinerary?.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                style={{ background: activeDay === day.day ? '#1C1917' : 'white', color: activeDay === day.day ? 'white' : '#6B5C52', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', height: 'calc(100vh - 150px)' }}>

        {/* Left: itinerary */}
        <div style={{ width: '50%', overflowY: 'auto', padding: '24px 32px 80px' }}>
          {itinerary?.days
            .filter(day => activeDay === 0 || day.day === activeDay)
            .map((day, dayIndex) => {
              const realDayIndex = itinerary.days.findIndex(d => d.day === day.day);
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: dayIndex * 0.06 }}
                  style={{ marginBottom: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ background: '#E8573A', color: 'white', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '100px' }}>
                      Day {day.day}
                    </span>
                    <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>{day.theme}</h2>
                  </div>

                  <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    {(day.activities ?? []).map((activity, actIndex) => {
                      const isSelected    = selectedActivityIndex?.dayIndex === realDayIndex && selectedActivityIndex?.actIndex === actIndex;
                      const isHighlighted = hoveredActivity?.title === activity.title;

                      return (
                        <div key={actIndex}>
                          <ActivityCard
                            activity={activity}
                            index={actIndex}
                            isSelected={isSelected}
                            isHighlighted={isHighlighted}
                            onCardClick={() => fetchActivityAlternatives(activity, day.theme, realDayIndex, actIndex)}
                            onMouseEnter={() => setHoveredActivity(activity)}
                          />

                          {/* Swap panel */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden', background: '#FFF5F2', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                              >
                                <div style={{ padding: '12px 20px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B5C52', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                      Swap with an alternative
                                    </p>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#0D9488' }}>
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488', flexShrink: 0 }} />
                                      shown on map
                                    </span>
                                  </div>

                                  {loadingActAlts ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {[1, 2, 3].map(i => (
                                        <div key={i} style={{ height: '72px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px' }} />
                                      ))}
                                    </div>
                                  ) : activityAlts.length === 0 ? (
                                    <div style={{ padding: '16px', background: 'rgba(232,87,58,0.06)', borderRadius: '12px', border: '1px solid rgba(232,87,58,0.12)' }}>
                                      <p style={{ fontSize: '12px', color: '#6B5C52', margin: 0, lineHeight: 1.5 }}>
                                        ⏱ We have hit the AI usage limit. Please try again in a few minutes.
                                      </p>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {activityAlts.map((alt, i) => (
                                        <ActivityCard
                                          key={i}
                                          activity={alt}
                                          index={i}
                                          isSelected={false}
                                          isHighlighted={previewedAlt?.title === alt.title}
                                          onCardClick={() => replaceActivity(realDayIndex, actIndex, alt)}
                                          onMouseEnter={() => setPreviewedAlt(alt)}
                                          onMouseLeave={() => setPreviewedAlt(null)}
                                          showSwapButton
                                          onSwap={() => replaceActivity(realDayIndex, actIndex, alt)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

          {/* Destination alternatives */}
          {alternatives.length > 0 && (
            <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', color: '#6B5C52', textTransform: 'uppercase', marginBottom: '16px' }}>
                You might also like
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {alternatives.map((alt) => (
                  <div
                    key={alt}
                    onClick={() => { window.location.href = '/trip?destination=' + encodeURIComponent(alt); }}
                    style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '12px 18px', color: '#1C1917', fontSize: '13px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    ✦ {alt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: map */}
        <div style={{ width: '50%', padding: '16px 24px 16px 8px' }}>
          <div style={{ 
            height: '100%', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '1px solid rgba(0,0,0,0.08)', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            background: 'white'
          }}>
            <MapView
              activities={displayedActivities}
              center={mapCenter}
              hoveredActivity={hoveredActivity}
              alternativeActivities={visibleAlts}
              previewedAlt={previewedAlt}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TripPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid rgba(232,87,58,0.2)', borderTopColor: '#E8573A', animation: 'spin 0.75s linear infinite', willChange: 'transform' }} />
        <p style={{ color: '#6B5C52', fontSize: '14px' }}>Loading...</p>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    }>
      <TripPageInner />
    </Suspense>
  );
}
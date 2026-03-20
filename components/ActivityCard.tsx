'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '@/types';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onCardClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showSwapButton?: boolean;
  onSwap?: () => void;
}

const categoryConfig: Record<string, { label: string; dot: string }> = {
  Culture:    { label: 'Culture',    dot: '#6366F1' },
  Food:       { label: 'Food',       dot: '#F97316' },
  Nature:     { label: 'Nature',     dot: '#22C55E' },
  Shopping:   { label: 'Shopping',   dot: '#A855F7' },
  Adventure:  { label: 'Adventure',  dot: '#F43F5E' },
  Relaxation: { label: 'Relaxation', dot: '#0EA5E9' },
};

export default function ActivityCard({
  activity,
  index,
  isSelected,
  isHighlighted,
  onCardClick,
  onMouseEnter,
  onMouseLeave,
  showSwapButton,
  onSwap,
}: ActivityCardProps) {
  const cat = categoryConfig[activity.category || ''];

  return (
    <motion.div
      layout
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onCardClick}
      style={{ position: 'relative', cursor: 'pointer' }}
      initial={false}
    >
      {/* Active left bar */}
      <motion.div
        initial={false}
        animate={{
          scaleY: isSelected || isHighlighted ? 1 : 0,
          opacity: isSelected || isHighlighted ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          left: 0,
          top: '12px',
          bottom: '12px',
          width: '3px',
          background: showSwapButton ? '#0D9488' : isSelected ? '#E8573A' : '#C8C0B8',
          borderRadius: '0 3px 3px 0',
          transformOrigin: 'center',
        }}
      />

      {/* Card body */}
      <motion.div
        animate={{
          backgroundColor: isSelected ? '#FFFBF9' : isHighlighted ? '#FAFAF8' : '#ffffff',
        }}
        transition={{ duration: 0.15 }}
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          padding: '16px 20px 16px 24px',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>

          {/* Time column */}
          <div style={{
            width: '42px',
            flexShrink: 0,
            paddingTop: '2px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#BF4528',
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {activity.time}
            </span>
            {/* Index number pill */}
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#7A6B62',
              background: '#F5F0EB',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {index + 1}
            </span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
              <p style={{
                fontSize: '14px',
                fontWeight: 650,
                color: '#1C1917',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}>
                {activity.title}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingTop: '2px' }}>
                {/* Category dot + label */}
                {cat && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: cat.dot,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#7A6B62', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {cat.label}
                    </span>
                  </span>
                )}

                {/* Chevron — only on main itinerary cards */}
                {!showSwapButton && (
                  <motion.svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    animate={{ rotate: isSelected ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ flexShrink: 0, opacity: 0.4 }}
                  >
                    <path d="M2 4L6 8L10 4" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                )}
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '12px',
              color: '#6B5C52',
              lineHeight: 1.6,
              marginBottom: '10px',
              display: '-webkit-box',
              WebkitLineClamp: isSelected ? undefined : 2,
              WebkitBoxOrient: 'vertical',
              overflow: isSelected ? 'visible' : 'hidden',
            }}>
              {activity.description}
            </p>

            {/* Meta chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: showSwapButton ? '10px' : 0 }}>
              <MetaChip icon="📍" label={activity.location} />
              {activity.duration && <MetaChip icon="⏱" label={activity.duration} />}
              {activity.price && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: activity.price === 'Free' ? '#15803D' : '#1C1917',
                  background: activity.price === 'Free' ? '#DCFCE7' : '#F0EBE4',
                  padding: '2px 9px',
                  borderRadius: '100px',
                  letterSpacing: '0.01em',
                }}>
                  {activity.price === 'Free' ? '✓ Free' : activity.price}
                </span>
              )}
            </div>

            {/* Swap button — always visible on alt cards, never needs expand */}
            {showSwapButton && onSwap && (
              <motion.button
                whileHover={{ scale: 1.02, background: '#0F766E' }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); onSwap(); }}
                style={{
                  alignSelf: 'flex-start',
                  background: '#0D9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ fontSize: '10px' }}>⇄</span> Use this instead
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Expanded panel — only for main itinerary cards (tips etc), not alt cards */}
      <AnimatePresence initial={false}>
        {isSelected && !showSwapButton && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', background: '#FFFBF9', borderBottom: '1px solid rgba(232,87,58,0.08)' }}
          >
            <div style={{ padding: '12px 20px 16px 80px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activity.tips && (
                <div style={{
                  background: 'white',
                  border: '1px solid rgba(234,88,12,0.12)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>💡</span>
                  <p style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ fontWeight: 650 }}>Insider tip: </strong>
                    {activity.tips}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      fontSize: '11px',
      color: '#6B5C52',
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      background: '#F5F0EB',
      padding: '2px 8px',
      borderRadius: '100px',
    }}>
      <span style={{ fontSize: '10px' }}>{icon}</span>
      {label}
    </span>
  );
}

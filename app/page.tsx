"use client"

import { CSSProperties, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"

// Spaced out images with absolute positioning - spread across all corners
const floatingImages: {
  url: string
  alt: string
  position: CSSProperties
  img: CSSProperties
  depth: number
  delay: number
}[] = [
  {
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
    alt: "Tokyo mall",
    position: { top: "12%", right: "17%" },
    img: { width: 350, height: 250, transform: "rotate(4deg)", borderRadius: "24px" },
    depth: 1.5,
    delay: 0.3,
  },
  {
    url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop",
    alt: "Santorini",
    position: { bottom: "8%", left: "5%" },
    img: { width: 190, height: 250, transform: "rotate(-6deg)", borderRadius: "20px" },
    depth: 0.8,
    delay: 0.9,
  },
  {
    url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&auto=format&fit=crop",
    alt: "Venice canal",
    position: { top: "12%", left: "25%" },
    img: { width: 300, height: 380, transform: "rotate(-7deg)", borderRadius: "20px" },
    depth: 1.0,
    delay: 0.4,
  },
  {
    url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1000&auto=format&fit=crop",
    alt: "Japan Night Life",
    position: { bottom: "10%", right: "8%" },
    img: { width: 380, height: 240, transform: "rotate(6deg)", borderRadius: "20px" },
    depth: 2.0,
    delay: 0.7,
  },
  {
    url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop",
    alt: "Italian countryside",
    position: { top: "35%", left: "7%" },
    img: { width: 270, height: 250, transform: "rotate(-10deg)", borderRadius: "22px" },
    depth: 1.2,
    delay: 0.6,
  },
  {
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&auto=format&fit=crop",
    alt: "Bali temple",
    position: { top: "40%", right: "8%" },
    img: { width: 180, height: 290, transform: "rotate(8deg)", borderRadius: "18px" },
    depth: 1.8,
    delay: 0.8,
  },
  {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&auto=format&fit=crop",
    alt: "Paris street",
    position: { bottom: "25%", left: "20%" },
    img: { width: 300, height: 190, transform: "rotate(3deg)", borderRadius: "20px" },
    depth: 0.8,
    delay: 0.9,
  },
]

// Clean destination list - no emojis
const rotatingDestinations = ["Tokyo", "Bali", "Rome", "Marrakech", "Lisbon", "Kyoto", "Rio", "Accra"]

// Emoji mapping
const destinationEmojis: Record<string, string> = {
  Tokyo: "🗼",
  Bali: "🌴",
  Rome: "🏛️",
  Marrakech: "🕌",
  Lisbon: "🌊",
  Kyoto: "🌸",
  Rio: "🎉",
  Accra: "✨",
}

const quickDestinations = ["Tokyo", "Rome", "Marrakech", "Rio", "Bangkok", "Accra", "Lisbon"]

// Component to handle rotating text with emoji
const RotatingDestination = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rotatingDestinations.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const currentDest = rotatingDestinations[currentIndex]
  const emoji = destinationEmojis[currentDest]

  return (
    <div className="inline-flex items-center gap-2">
      <motion.span
        className="text-[#E8573A]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        key={currentDest}
      >
        {currentDest}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        key={`emoji-${currentDest}`}
      >
        {emoji}
      </motion.span>
    </div>
  )
}

export default function Home() {
  const [destination, setDestination] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    if (!destination.trim()) return
    router.push(`/trip?destination=${encodeURIComponent(destination)}`)
  }

  return (
    <main style={{ height: "100vh", color: "#1C1917", position: "relative", overflow: "hidden", background: "transparent" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "relative",
          zIndex: 100,
          background: "transparent",
        }}
      >
        <div style={{ fontFamily: "var(--font-playfair), serif", fontSize: "20px", fontWeight: 900 }}>
          Bacon<span style={{ color: "#E8573A" }}>.</span>
        </div>
        <div style={{ display: "flex", gap: "32px", fontSize: "13px", color: "#8C7B6E" }}>
          <span style={{ cursor: "pointer" }}>Explore</span>
          <span style={{ cursor: "pointer" }}>How it works</span>
          <span style={{ cursor: "pointer" }}>About</span>
        </div>
      </nav>

      {/* PARALLAX FLOATING IMAGES LAYER */}
      <Floating sensitivity={-0.4} className="h-full w-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
        {floatingImages.map((img, i) => (
          <FloatingElement 
            key={i} 
            depth={img.depth} 
            className="absolute"
            style={img.position}
          >
            <motion.img
              src={img.url}
              alt={img.alt}
              style={{
                ...img.img,
                objectFit: "cover",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                cursor: "pointer",
                display: "block",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: img.delay, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            />
          </FloatingElement>
        ))}
      </Floating>

      {/* MAIN CONTENT - REMOVED pointerEvents: "none" from parent */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* HERO CONTENT - All elements are clickable now */}
        <div
          className="flex flex-col items-center px-6 text-center relative"
          style={{ maxWidth: "720px", width: "100%" }}
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(232,87,58,0.08)",
              border: "1px solid rgba(232,87,58,0.25)",
              borderRadius: "100px",
              padding: "5px 14px 5px 10px",
              marginBottom: "24px",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E8573A", display: "inline-block" }} />
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#E8573A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              AI Travel Planner
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "clamp(42px, 7vw, 70px)",
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-3px",
              marginBottom: "24px",
              whiteSpace: "pre-wrap",
            }}
          >
            <span>Plan your trip{"\n"}</span>
            <div className="flex items-center justify-center whitespace-pre flex-wrap gap-x-3">
              <span>to </span>
              <RotatingDestination />
            </div>
          </motion.h1>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ width: "100%", maxWidth: "540px", marginBottom: "16px" }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.95)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}
            >
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. 5 days in Tokyo, food & culture..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  padding: "15px 18px",
                  fontSize: "14px",
                  color: "#1C1917",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: "#E8573A",
                  color: "white",
                  border: "none",
                  margin: "6px",
                  borderRadius: "11px",
                  padding: "10px 22px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D04A2E")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#E8573A")}
              >
                Plan trip →
              </button>
            </div>
          </motion.div>

          {/* Quick destination pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginBottom: "32px" }}
          >
            <span style={{ fontSize: "12px", color: "#B0A499" }}>Try:</span>
            {quickDestinations.map((d) => (
              <button
                key={d}
                onClick={() => setDestination(d)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "100px",
                  padding: "5px 14px",
                  fontSize: "12px",
                  color: "#8C7B6E",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1C1917"
                  e.currentTarget.style.color = "#F5F0E8"
                  e.currentTarget.style.borderColor = "#1C1917"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "#8C7B6E"
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"
                }}
              >
                {d}
              </button>
            ))}
          </motion.div>

          {/* HOW IT WORKS SECTION - Integrated without border */}
          <div style={{ maxWidth: "700px", marginTop: "20px", width: "100%" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: "#8C7B6E",
                textTransform: "uppercase",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              How it works
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
              {[
                { num: "01", title: "Describe your trip", desc: "Tell us your destination, duration, and what you love doing." },
                { num: "02", title: "AI builds your plan", desc: "Claude generates a full day-by-day itinerary in seconds." },
                { num: "03", title: "Explore on the map", desc: "Every activity is pinned on an interactive map you can explore." },
              ].map((step) => (
                <div key={step.num}>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), serif",
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#E8573A",
                      opacity: 0.3,
                      marginBottom: "6px",
                      lineHeight: 1,
                    }}
                  >
                    {step.num}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#1C1917", marginBottom: "4px" }}>{step.title}</p>
                  <p style={{ fontSize: "11px", color: "#8C7B6E", lineHeight: 1.4 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
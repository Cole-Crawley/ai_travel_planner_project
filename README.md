# ✈️ AI Travel Planner

[**Live Demo**]([[https://my-url.com](https://aitravelplanner-snowy.vercel.app?_vercel_share=DCc1R0wDgFpwaK17wwoIVLdVVpxLyDtU)])

The trip planning application employs AI technology to create customized travel schedules which show geographical connections between different points of interest and display these schedules through an interactive mapping system that enables users to choose specific activities during their trip. 

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3-orange?style=flat-square)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-green?style=flat-square)

---

## The Problem

Most travel planning tools either generate generic, copy-paste itineraries with no geographic logic, or require hours of manual research to piece together a realistic day-by-day plan. Users face problems because their activities spread throughout the city while their scheduled activities conflict with the business hours of attractions and they cannot find an efficient method to change activities they dislike.

I wanted to build something that felt like having a knowledgeable local friend plan your trip — one that understands that you can't visit a market at 9pm, or realistically cross Tokyo and back in a single morning.

---

## What I Built

The trip planning application allows users to enter a destination or use freeform prompts like *"Bora Bora beach vibes, 7 days"* to receive a complete itinerary which details their activities for each day of their trip.

The system organizes activities based on their respective neighborhoods. The system provides scheduling that reflects actual time requirements by including both opening hours and travel durations and activity lengths. The interactive map displays nodes which users can view by moving their mouse over activities to access their location. The activity swapping feature enables users to click on any activity to view three alternative activities located in nearby areas which appear as teal nodes on the map and which users can swap with a single click. The saved trips collection allows users to access their stored trips across multiple sessions while maintaining instant loading capabilities and ongoing editing functions.

---

## Technical Highlights

### AI with Graceful Degradation
The API uses a fallback chain system which connects three Groq-hosted models (`llama-3.1-8b-instant` → `llama3-8b-8192` → `gemma2-9b-it`) instead of using one main model. The system detects three distinct failure modes which include rate limits (429) and token truncation (finish_reason: length) and malformed JSON. The system detects each failure mode which includes rate limit (429) and token truncation (finish_reason: length) and malformed JSON. 

### Prompt Engineering for Real-World Constraints
The itinerary prompt enforces hard planning rules. The system requires geographic clustering by district and travel time between activities and opening hour awareness and limits users to selecting one category per day and natural morning/afternoon/evening pacing. The activity alternative suggestions system provides users with the current activity coordinates and the corresponding time slot and the entire schedule for that day.  The system ensures that alternatives remain accessible at all times while matching required times and without repeating options.

### Map Interactions Without Re-renders
The system uses **direct DOM mutation** for both marker hover states and `flyTo` animations instead of React state updates. The `HTMLElement` of each marker is maintained in a `Map` ref. On hover, `applyMarkerStyle()` modifies the element directly while executing `map.flyTo()`, which causes no re-renders yet provides immediate results. The system rebuilds markers completely only when data changes through day filter applications or swap commitments or alt panel toggle actions.

### Coordinate Normalisation
The AI consistently returns coordinates as `[latitude, longitude]` but MapLibre GL expects `[longitude, latitude]`. The `normalizeLngLat()` utility detects the swap by checking which value exceeds ±90 (impossible for latitude) and corrects it silently, preventing the `Invalid LngLat` errors that would otherwise crash the map.

### Freeform Input Parsing
The system uses regex to parse destination input before sending it to the API, which extracts trip duration through the pattern `\b(\d+)\s*days?\b` and retrieves lifestyle preferences from the terms `beach`, `food`, `culture`, and additional terms. The system extracts three parameters from the input string `"Tokyo street food culture 10 days"` by converting it into `destination: "Tokyo"`, `days: 10`, `preferences: "food, culture"`.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| AI / LLM | Groq API — LLaMA 3.1 8B, LLaMA 3 8B, Gemma 2 9B |
| Map | MapLibre GL JS + MapTiler |
| Animation | Framer Motion |
| Persistence | localStorage (client-side) |
| Styling | Inline styles + CSS variables |

---

## Key Features

- 🗺️ **Interactive map** — markers update on hover, fly to activity location, alt activities shown as distinct teal nodes
- 🔄 **Activity swapping** — AI suggests 3 contextually aware alternatives per activity, swappable in one click
- 📍 **Geographic coherence** — each day's activities cluster by neighbourhood, ordered as a logical walking route
- 💾 **Saved trips** — full itinerary persisted to localStorage, loads instantly without re-generation
- ⚡ **Resilient AI** — model fallback chain handles rate limits and truncation gracefully
- 📝 **Freeform input** — understands natural language like "14 days in Kyoto, culture and food focus"

---

## Running Locally

```bash
git clone https://github.com/Cole-Crawley/ai_travel_planner_project.git
cd ai_travel_planner_project
npm install
```

Create a `.env.local` file:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

Both keys are free — get them at [console.groq.com](https://console.groq.com) and [maptiler.com](https://www.maptiler.com).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure
```
app/
├── page.tsx                         # Home / search
├── layout.tsx                       # Root layout
├── globals.css                      # Global styles
├── api/
│   ├── itinerary/route.ts           # Generate full trip itinerary
│   ├── activity-alternatives/       # Suggest swaps for a specific activity
│   │   └── route.ts
│   └── alternatives/                # Suggest similar destinations
│       └── route.ts
├── trip/
│   └── page.tsx                     # Itinerary view + map
└── saved/
    └── page.tsx                     # Saved trips collection
components/
├── ui/                              # shadcn/ui primitives (badge, button, card, input)
├── ActivityCard.tsx                 # Individual activity with swap UI
└── MapView.tsx                      # MapLibre map with marker management
types/
└── index.ts                         # Shared TypeScript types (Activity, TripItinerary, SavedTrip)
public/                              # Static assets
```

---
StoryBook (Testing components without the loading)
Activites
---
<img width="1117" height="1120" alt="image" src="https://github.com/user-attachments/assets/8a437032-f3f0-4b09-bf25-f1851a77a43a" />
<img width="1073" height="1027" alt="image" src="https://github.com/user-attachments/assets/15bce140-c729-4a9f-ad8b-9fb1f06beab3" />
<img width="1092" height="747" alt="image" src="https://github.com/user-attachments/assets/8da44572-5aaa-4934-9e26-f08f3d84dcbf" />
<img width="1087" height="1269" alt="image" src="https://github.com/user-attachments/assets/b5112f96-64b8-4762-a46f-35029a6cb0cf" />

---
Saved Trips
---
<img width="973" height="1170" alt="image" src="https://github.com/user-attachments/assets/1b57e281-3d7a-4a35-96e7-85da17130266" />
<img width="968" height="1160" alt="image" src="https://github.com/user-attachments/assets/ac793ff4-e01b-4974-a4e6-34bb579a48b1" />
<img width="977" height="1066" alt="image" src="https://github.com/user-attachments/assets/2decdd4c-deaa-4c0d-a389-2bf94ea51906" />
<img width="975" height="1066" alt="image" src="https://github.com/user-attachments/assets/b8be1255-a8ca-4e1e-8087-7fcdf97b57c6" />

---
Lighthouse Score
---
<img width="528" height="1116" alt="image" src="https://github.com/user-attachments/assets/e042b3a9-c4ea-4119-9f1f-245d522028c4" />

The structured prompt writing method requires users to define real-world limitations, which must be applied throughout their interactive systems. The development of resilient AI pipelines enables systems to manage rate limits and truncation and malformed output without displaying errors to their users. The performance of map markers depends on the comparison between React state updates and direct DOM mutation. The route displays how mapping libraries use coordinate systems while demonstrating safe methods to standardize AI-created geographic information.

---

*Built with Next.js, Groq, and MapLibre GL.*

# BaconAI

**[Try it live](https://aitravelplanner-snowy.vercel.app)**

An AI travel planner. Type a destination, or something looser like "Bora Bora beach vibes, 7 days", and get a day-by-day plan beside a live map. Every stop has a time, how long to allow, roughly what it costs and an insider tip. Don't like one? Open it and swap in one of three nearby alternatives with a single click.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-API-D97757?style=flat-square)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-396CB2?style=flat-square)

---

## The problem

Most trip planners give you one of two things: a wall of text with no sense of where anything is, or a map full of pins with no sense of order. The AI ones are worse, because they happily send you across the city and back before lunch, or to a market that closed hours ago.

I wanted something that felt like a friend who knows the city planning your trip: sensible days, grouped by area, at a pace you'd actually enjoy.

---

## What I built

- **Plans that work on the ground.** Each day is clustered by neighbourhood, respects opening hours and meal times, leaves travel time between stops and keeps a comfortable pace.
- **The map and the list agree.** Numbered pins follow the same order as the itinerary, day filters narrow the map when you want to focus, and hovering a stop flies the map to it.
- **Swap anything.** Opening a stop suggests three nearby alternatives for the same time slot, each with the same details, and "Use this instead" drops it straight into the day.
- **Natural input.** "Tokyo street food culture 10 days" becomes Tokyo, 10 days, food and culture, before the request is even sent.
- **Saved trips.** Trips are kept in the browser and reopen instantly as compact day-by-day timelines, without generating them again.

---

## How the design changed

The interesting part wasn't the AI call. It was using the trip page, writing down what felt wrong and changing it, three times over.

1. **Nothing harsh, nothing cramped.** Buttons were too small, sharp corners felt hostile and the map felt stuck on the side. Bigger hit areas, one consistent corner radius and a map with real width fixed that.
2. **Let the map answer a question.** I made each card open the map on its stop, with a way to close it if it took too much room.
3. **Reversing my own decision.** Opening the map per card turned out worse, because you lost the overview of the day. So every stop is now plotted from the start, and day filters do the narrowing instead.

The look went the same way: from a generic dark hero to a warm, magazine feel with cream paper, charcoal text, one coral accent, Playfair Display for headlines and DM Sans for reading.

---

## Technical highlights

### Map updates without re-renders
Highlighting a stop used to make the map stutter, because every change re-rendered it. Each marker's element is now kept in a ref, and hover styles and `flyTo` animations are applied to it directly. Markers are only rebuilt when the data actually changes, like switching day or committing a swap.

### Fixing the AI's coordinates
The model sometimes returns coordinates as `[latitude, longitude]` when MapLibre expects `[longitude, latitude]`. `normalizeLngLat()` spots the swap (latitude can never be above 90) and quietly corrects it, instead of letting an invalid point crash the map.

### Prompts with real-world rules
The itinerary prompt spells out the planning rules: cluster by district, allow travel time, respect opening hours, keep one theme per day and pace mornings, afternoons and evenings naturally. The alternatives prompt gets the current stop's coordinates, its time slot and the rest of the day, so suggestions stay close by, fit the slot and never repeat.

### Choosing services by cost
Maps moved from Mapbox to MapTiler for its free tier. The AI started on OpenAI, moved to Groq's free models, and now runs on Claude after those models were retired. Knowing what a service will actually cost to run, and letting that shape the product, is part of the job.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI | Claude API |
| Map | MapLibre GL with MapTiler tiles |
| UI | Tailwind, shadcn/ui, Framer Motion |
| Storage | localStorage |
| Testing | Vitest, Playwright, Storybook |

---

## Running it locally

```bash
git clone https://github.com/Cole-Crawley/baconai.git
cd baconai
npm install
```

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=your_claude_key
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key
```

Get a Claude key at [console.anthropic.com](https://console.anthropic.com) and a free MapTiler key at [maptiler.com](https://www.maptiler.com).

```bash
npm run dev          # the app, on http://localhost:3000
npm run storybook    # components on their own, on http://localhost:6006
```

---

## Project structure

```
app/
  page.tsx                          Home and search
  trip/page.tsx                     Itinerary and map
  saved/page.tsx                    Saved trips
  api/
    itinerary/route.ts              Plans the whole trip
    activity-alternatives/route.ts  Suggests swaps for one stop
    alternatives/route.ts           Suggests similar destinations
components/
  ActivityCard.tsx                  One stop, with the swap panel
  MapView.tsx                       MapLibre map and markers
  ui/                               shadcn/ui building blocks
lib/claude.ts                       The one place that talks to Claude
types/index.ts                      Activity, TripItinerary, SavedTrip
stories/                            Storybook stories
```

---

## Screenshots

Activities, built and checked in Storybook without waiting on the AI:

<img width="1117" height="1120" alt="Activity cards in Storybook" src="https://github.com/user-attachments/assets/8a437032-f3f0-4b09-bf25-f1851a77a43a" />
<img width="1073" height="1027" alt="Activity card states" src="https://github.com/user-attachments/assets/15bce140-c729-4a9f-ad8b-9fb1f06beab3" />
<img width="1092" height="747" alt="Activity alternatives" src="https://github.com/user-attachments/assets/8da44572-5aaa-4934-9e26-f08f3d84dcbf" />
<img width="1087" height="1269" alt="Activity details" src="https://github.com/user-attachments/assets/b5112f96-64b8-4762-a46f-35029a6cb0cf" />

Saved trips:

<img width="973" height="1170" alt="Saved trips" src="https://github.com/user-attachments/assets/1b57e281-3d7a-4a35-96e7-85da17130266" />
<img width="968" height="1160" alt="A saved trip" src="https://github.com/user-attachments/assets/ac793ff4-e01b-4974-a4e6-34bb579a48b1" />
<img width="977" height="1066" alt="Saved trip timeline" src="https://github.com/user-attachments/assets/2decdd4c-deaa-4c0d-a389-2bf94ea51906" />
<img width="975" height="1066" alt="Saved trip timeline, continued" src="https://github.com/user-attachments/assets/b8be1255-a8ca-4e1e-8087-7fcdf97b57c6" />

Lighthouse:

<img width="528" height="1116" alt="Lighthouse scores" src="https://github.com/user-attachments/assets/e042b3a9-c4ea-4119-9f1f-245d522028c4" />

*Made by [Cole Crawley](https://colecrawley.com).*

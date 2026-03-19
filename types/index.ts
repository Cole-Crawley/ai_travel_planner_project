export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  coordinates: [number, number];
  duration?: string;
  price?: string;
  category?: string;
  tips?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
}

export interface TripItinerary {
  destination: string;
  duration: number;
  days: ItineraryDay[];
}

export interface SavedTrip {
  id: string;
  destination: string;
  savedAt: string;
  itinerary: TripItinerary;
}
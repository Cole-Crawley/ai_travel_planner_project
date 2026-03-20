import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SavedPage from '../app/saved/page';

const mockTrips = [
  {
    id: '1',
    destination: 'Tokyo, Japan',
    savedAt: '20/03/2026',
    itinerary: {
      destination: 'Tokyo, Japan',
      duration: 5,
      days: [
        {
          day: 1,
          theme: 'Neon Districts & Street Food',
          activities: [
            { title: 'Senso-ji Temple',  time: '09:00', location: 'Asakusa', category: 'Culture',   description: '', coordinates: [139.79, 35.71] },
            { title: 'Tsukiji Market',   time: '12:00', location: 'Tsukiji', category: 'Food',      description: '', coordinates: [139.77, 35.66] },
            { title: 'Shibuya Crossing', time: '19:00', location: 'Shibuya', category: 'Culture',   description: '', coordinates: [139.70, 35.66] },
          ],
        },
        {
          day: 2,
          theme: 'Modern Tokyo',
          activities: [
            { title: 'teamLab Borderless', time: '10:00', location: 'Odaiba', category: 'Adventure', description: '', coordinates: [139.78, 35.62] },
          ],
        },
      ],
    },
  },
  {
    id: '2',
    destination: 'Bali, Indonesia',
    savedAt: '19/03/2026',
    itinerary: {
      destination: 'Bali, Indonesia',
      duration: 7,
      days: [{
        day: 1,
        theme: 'Beach & Temples',
        activities: [
          { title: 'Tanah Lot Temple', time: '08:00', location: 'Tabanan', category: 'Culture', description: '', coordinates: [115.08, -8.62] },
        ],
      }],
    },
  },
  {
    id: '3',
    destination: 'Paris, France',
    savedAt: '18/03/2026',
    itinerary: {
      destination: 'Paris, France',
      duration: 3,
      days: [
        {
          day: 1,
          theme: 'Iconic Paris',
          activities: [
            { title: 'Eiffel Tower',  time: '09:00', location: '7th arrondissement', category: 'Culture', description: '', coordinates: [2.29, 48.85] },
            { title: 'Louvre Museum', time: '14:00', location: '1st arrondissement', category: 'Culture', description: '', coordinates: [2.33, 48.86] },
          ],
        },
      ],
    },
  },
];

const meta: Meta<typeof SavedPage> = {
  title: 'Pages/SavedPage',
  component: SavedPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      // Clear first so each story starts fresh
      localStorage.removeItem('savedTrips');
      return <Story />;
    },
  ],
};
export default meta;
type Story = StoryObj<typeof SavedPage>;

export const WithMultipleTrips: Story = {
  decorators: [(Story) => {
    localStorage.setItem('savedTrips', JSON.stringify(mockTrips));
    return <Story />;
  }],
};

export const SingleTrip: Story = {
  decorators: [(Story) => {
    localStorage.setItem('savedTrips', JSON.stringify([mockTrips[0]]));
    return <Story />;
  }],
};

export const TwoTrips: Story = {
  decorators: [(Story) => {
    localStorage.setItem('savedTrips', JSON.stringify([mockTrips[0], mockTrips[1]]));
    return <Story />;
  }],
};

export const Empty: Story = {
  decorators: [(Story) => {
    localStorage.setItem('savedTrips', JSON.stringify([]));
    return <Story />;
  }],
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ActivityCard from '../components/ActivityCard';

const meta: Meta<typeof ActivityCard> = {
  title: 'Components/ActivityCard',
  component: ActivityCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'parchment',
      values: [
        { name: 'parchment', value: '#F5F0E8' },
        { name: 'white',     value: '#ffffff' },
      ],
    },
  },
};
export default meta;
type Story = StoryObj<typeof ActivityCard>;

const baseActivity = {
  time: '09:00',
  title: 'Visit Senso-ji Temple',
  description: "Tokyo's oldest and most famous temple in the heart of Asakusa.",
  location: 'Asakusa, Tokyo',
  coordinates: [139.7966, 35.7148] as [number, number],
  duration: '1-2 hours',
  price: 'Free',
  category: 'Culture',
  tips: 'Arrive before 8am to beat the crowds.',
};

export const Default: Story = {
  args: {
    activity: baseActivity,
    index: 0,
    isSelected: false,
    isHighlighted: false,
    onCardClick: () => {},
  },
};

export const Selected: Story = {
  args: { ...Default.args, isSelected: true },
};

export const Highlighted: Story = {
  args: { ...Default.args, isHighlighted: true },
};

export const FoodCategory: Story = {
  args: {
    ...Default.args,
    activity: {
      ...baseActivity,
      title: 'Tsukiji Outer Market',
      description: 'World-famous fish market with incredible street food.',
      location: 'Tsukiji, Tokyo',
      category: 'Food',
      price: '¥1,000–¥3,000',
      tips: 'Come hungry — the tamagoyaki is unmissable.',
    },
  },
};

export const NatureActivity: Story = {
  args: {
    ...Default.args,
    activity: {
      ...baseActivity,
      title: 'Shinjuku Gyoen National Garden',
      description: 'One of Tokyo\'s largest parks, blending Japanese and French garden styles.',
      location: 'Shinjuku, Tokyo',
      category: 'Nature',
      price: '$2',
      duration: '2 hours',
    },
  },
};

export const PaidActivity: Story = {
  args: {
    ...Default.args,
    activity: {
      ...baseActivity,
      title: 'teamLab Borderless',
      category: 'Adventure',
      price: '$35',
      duration: '2-3 hours',
    },
  },
};

export const AsAlternative: Story = {
  args: {
    ...Default.args,
    showSwapButton: true,
    onSwap: () => alert('Swapped!'),
    activity: {
      ...baseActivity,
      title: 'Nakamise Shopping Street',
      description: 'A historic shopping street leading to Senso-ji, lined with traditional crafts.',
      category: 'Shopping',
      price: 'Free entry',
    },
  },
};

export const RelaxationCategory: Story = {
  args: {
    ...Default.args,
    activity: {
      ...baseActivity,
      title: 'Odaiba Seaside Park',
      description: 'A waterfront park with stunning views of Rainbow Bridge.',
      location: 'Odaiba, Tokyo',
      category: 'Relaxation',
      price: 'Free',
      duration: '1 hour',
    },
  },
};

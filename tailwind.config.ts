import type { Config } from 'tailwindcss'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

interface PluginAPI {
  addBase: (base: Record<string, Record<string, string>>) => void
  theme: (path: string) => Record<string, string>
}

const config: Config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      colors: {
        cream: "#F5F0E8",
        orange: "#E8573A",
        "orange-dark": "#D04A2E",
      },
    },
  },
  plugins: [addVariablesForColors],
}

// This plugin adds each Tailwind color as a global CSS variable
function addVariablesForColors({ addBase, theme }: PluginAPI) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config
# 🌏 React Globe Vietnam

A stunning, interactive 3D globe component built with React Three Fiber. Features Vietnam as the central hub with accurate geographic borders, connection lines to major world cities, and beautiful visual effects.

![Globe Preview](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop)

## ✨ Features

- 🗺️ **Accurate Geography** - TopoJSON-based land detection with precise country borders
- 🇻🇳 **Vietnam Highlighted** - Enhanced visibility with accurate borders including Hoàng Sa & Trường Sa islands
- 🌐 **Global Connections** - Animated connection lines to 18+ major world cities
- 🎨 **Customizable** - Easy to configure colors, sizes, and behavior
- ⚡ **Optimized Performance** - Web Worker for heavy computations, precomputed positions
- 📱 **Responsive** - Works on all screen sizes
- 🎮 **Interactive** - Drag to rotate, scroll to zoom, auto-rotate when idle

## 🚀 Quick Start

### Installation

```bash
# Clone or download the source
git clone https://github.com/your-username/react-globe-vietnam.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Basic Usage

```tsx
import { GlobeScene } from './components/Globe/GlobeScene';

function App() {
  return (
    <div className="w-full h-screen">
      <GlobeScene />
    </div>
  );
}
```

### As a Section Component

```tsx
import { GlobeScene } from './components/Globe/GlobeScene';

function LandingPage() {
  return (
    <section className="relative h-[600px]">
      <GlobeScene className="absolute inset-0" />
      <div className="relative z-10 text-center pt-20">
        <h2>Global Reach</h2>
        <p>Connected to the world from Vietnam</p>
      </div>
    </section>
  );
}
```

## 📦 Package Contents

```
src/
├── components/
│   └── Globe/
│       ├── GlobeScene.tsx      # Main container component
│       ├── Globe.tsx           # Globe mesh with dot rendering
│       ├── ConnectionLines.tsx # Animated city connections
│       └── VietnamMarker.tsx   # Highlight marker for Vietnam
├── hooks/
│   ├── useGlobeWorker.ts       # Web Worker integration
│   └── usePrecomputedGlobePositions.ts
├── workers/
│   └── globeWorker.ts          # Background computation
├── lib/
│   ├── globeUtils.ts           # Coordinates & config
│   └── polygonUtils.ts         # Geo utilities
public/
├── land-50m.json               # World geography data
├── countries-50m.json          # Country borders
├── globe-positions-world.bin   # Precomputed positions
└── globe-positions-vn.bin      # Vietnam positions
```

## ⚙️ Configuration

### Globe Settings

Edit `src/lib/globeUtils.ts`:

```typescript
export const GLOBE_CONFIG = {
  radius: 2,              // Globe size
  dotColor: '#00ffff',    // World dot color
  lineColor: '#a020f0',   // Connection line color
  highlightColor: '#ffffff',
  backgroundColor: '#050510',
  dotSize: 0.025,
};
```

### Focus Country

Change the center focus by modifying:

```typescript
export const VIETNAM_COORDS = {
  lat: 14.0583,
  lon: 108.2772,
};
```

### World Cities

Add or remove connection destinations:

```typescript
export const WORLD_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  // Add more cities...
];
```

## 🎨 Customization

### Colors

The globe uses a dark tech-inspired theme:
- Background: `#050510`
- World dots: `#00aaaa` (cyan, 65% opacity)
- Vietnam dots: `#00ffff` (bright cyan)
- Connection lines: `#8844ff` (purple)

### Component Props

```tsx
interface GlobeSceneProps {
  className?: string;  // Additional CSS classes
}
```

## 🛠️ Dependencies

```json
{
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.122.0",
  "three": "^0.182.0",
  "topojson-client": "^3.1.0",
  "react": "^18.3.1"
}
```

## 📋 Requirements

- Node.js 18+
- React 18.x
- Modern browser with WebGL support

## 🔧 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder, ready for deployment.

## 📄 License

**Commercial License** - This component is sold under a commercial license.

✅ Allowed:
- Use in unlimited personal projects
- Use in unlimited commercial projects
- Modify the source code
- Create derivative works

❌ Not Allowed:
- Resell or redistribute the source code
- Share license with others
- Remove copyright notices

## 🆘 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Join our community](https://discord.gg/your-server)
- 📖 Docs: [Full documentation](https://your-docs-site.com)

## 🔄 Updates

License holders receive:
- Free updates for 1 year
- Bug fixes and security patches
- New features and improvements

---

Made with ❤️ for the global developer community

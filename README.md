# 🎡 Mela Chaloge — 3D Indian Mela Experience
> *An interactive, immersive 3D Dussehra & Diwali festival fair in your browser.*
---
> DEMO - Open [[http://localhost:5173](http://localhost:5173)](https://t1adi.github.io/Dussehra-mela/) in your web browser
---

## 🌟 Overview

**Mela Chaloge** is a rich, interactive 3D web experience that transports players into the nostalgic sights, sounds, and joyous energy of a traditional Indian nighttime fair (*Mela*).

Step through the grand glowing **Pravesh Dwar** (Entrance Gate), walk along bustling avenues lit by dangling fairy lights and earthen diyas, savor steaming street food, test your aim at fairground games, soar above the fair on the **Giant Ferris Wheel**, watch the heroic **Ram Leela**, and ignite the spectacular **Ravana Dahan** finale with fireworks!

---

## ✨ Core Features & Highlights

### 1. 🪔 3D Mela Environment & Atmosphere
- **Grand Entrance Gate (*Pravesh Dwar*)**: Majestic carved red and saffron pillars, golden Kalash finials, illuminated double-sided Hindi and English signage (*"मेरा DUSSEHRA MELA"* & *"Mela chaloge mere sath? ♥"*), draped marigold (*genda phool*) garlands, and hanging paper *kandils* (lanterns).
- **Festival Lighting & Skies**: Deep twilight night sky with sparkling stars, a glowing crescent moon, atmospheric amber fog, and catenary drooping strings of multi-colored fairy lights.
- **Lively Animated Visitors (NPCs)**: Traditional visitors wearing festive Kurtas, Sarees, and Turbans strolling along the avenues, chatting at food stalls, cheering, and enjoying the fair.
- **Detailed Interactive Stalls**: Bamboo-and-timber kiosks with scalloped striped *shamiyana* canopies, brass kettles, balloon backdrops, and glowing signboards.

### 2. 🚶 Third-Person Character Controller
- **Festive Avatar**: Stylized low-poly Indian avatar wearing a festive kurta, Nehru waistcoat, traditional dhoti, and royal pagri (turban) with golden kalgi.
- **Movement & Physics**:
  - **Desktop**: `W`, `A`, `S`, `D` or Arrow keys to walk, `Shift` to sprint, and smooth procedural leg/arm swing animations.
  - **Mouse Orbit**: Drag anywhere to smoothly orbit the camera 360° around your character.
  - **Mobile Touch Controls**: Dual-touch layout featuring a virtual analog joystick on the bottom-left and contextual Action/Interact buttons on the bottom-right.
  - **Collision Boundaries**: Solid collision detection against stall counters, boundary fences, pillars, and attraction platforms.
  - **Contextual HUD**: Proximity halo and glowing prompt (*"Press [E] or Tap to Interact"*) whenever approaching any stall or landmark.

### 3. 🎯 Playable Mini-Games & Stalls
- 🎯 **Gubbare Wala (Balloon Shooting)**: Aim with crosshairs at floating balloons. Tap/click to throw darts. Realistic pop audio, burst particles, combo streaks, and token rewards!
- ⭕ **Chhalla Phenko (Ring Toss)**: Aim angle and power oscillation meters. Toss rings in parabolic arcs over golden prize bottles and brass diyas to score points.
- 🍲 **Chaat & Mithai Corner**: Interactive street food menu featuring crisp *Desi Ghee Jalebis*, tangy *Golgappe (Pani Puri)*, spiced *Samosas*, *Kulhad Masala Chai*, and *Matka Malai Kulfi*. Includes authentic desi vendor dialogues, crunch SFX, and snack collection into your bag.
- 🪀 **Desi Khilone (Traditional Toys)**: Interactive 3D toy showroom! Spin the wooden *Lattu*, make the *Kathputli* puppet dance, spin the wind *Phirki*, and play rhythmic beats on the miniature *Dholak*.
- 🏮 **Mela Haat (Souvenirs & Handicrafts)**: Collect cultural keepsakes including carved brass peacock diyas, royal Rajasthani turbans, embroidered door torans, and glass bangles.
- 🎡 **Aakash Jhula (Giant Ferris Wheel)**: Approach and board a gondola! Switches into an aerial rotating 360° scenic ride camera hovering 18 meters above the lit-up fairgrounds with photography snapshot mode.
- 🎭 **Ram Leela Rangmanch**: Watch an enactment of Lord Rama, Lakshmana, and Hanumanji on an ornate golden-pillared stage with sacred conch shell (*shankha*) fanfares, temple bells, and dramatic dialogue.

### 4. 🔥 The Grand Dussehra Finale: Ravana Dahan
- Walk up to the sacred finale platform facing the **10-headed effigy of Ravana (Dashanana)** adorned with crowns, royal armor, and weapons.
- **Multi-phase cinematic event**:
  1. **Phase 1 (Vedic Countdown)**: *"दीप जले · मन के अंधेरे मिटें - 3, 2, 1..."* accompanied by temple bell chimes.
  2. **Phase 2 (Agni Baan)**: Lord Rama unleashes a blazing fiery arrow that streaks across the mela sky leaving a trail of sparks.
  3. **Phase 3 (Effigy Combustion)**: The arrow pierces Ravana's navel; chain-reaction cracker bursts and golden flame particle systems erupt (*"बुराई पर अच्छाई की जीत - Jai Shri Ram!"*).
  4. **Phase 4 (Grand Sky Fireworks)**: Dazzling multi-colored fireworks fountains and aerial bursts fill the night sky while the crowd roars in celebration. Unlocks the prestigious *Vijaya Dashami Golden Medal* in your festival bag!

### 5. 🎵 Procedural Web Audio Sound Engine
- **Zero External Audio Dependencies**: Generates 100% of music and effects dynamically in-browser via the Web Audio API. Never fails due to missing files or network drops.
- **Authentic Melodies**: Procedural Bansuri (Indian Flute) raga melodies (Raga Bhupali) accompanied by a calming Tanpura drone.
- **Full SFX Suite**: Balloon pops, ring toss whooshes and crystal bell hits, snack crunches, conch shell horn, temple ghanta bells, whistling rocket launches, thunderous firework rumbles, and crowd cheers.

### 6. 🌐 Bilingual & Responsive HUD
- **English & हिन्दी**: Instant one-click language toggle across all dialogues, stall names, quests, and menus.
- **Mini-Map / Radar**: Real-time rotating directional compass showing stall locations and player position.
- **Quest Tracker**: 7 progressive festival objectives with token rewards.
- **Festival Bag (Inventory)**: Inspect collected snacks, toys, handicrafts, and medals.
- **Quality Settings**: Presets for Low, Medium, and High graphics (shadows, antialiasing, DPR) to ensure 60 FPS on mobile and laptops.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 5 + TypeScript
- **3D Graphics**: Three.js + `@react-three/fiber` + `@react-three/drei`
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (with LocalStorage state persistence)
- **Audio**: Web Audio API (procedural synthesis)
- **Effects**: canvas-confetti

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 3. Build for Production
```bash
npm run build
```
This compiles TypeScript and outputs an optimized bundle into the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/):
   - Click **Add New Project** and select your repository.
   - Framework Preset: **Vite**
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Click **Deploy**. Your 3D Mela experience will be live worldwide in seconds!

---

## 🎮 Controls Quick Reference

| Action | Desktop | Mobile / Touch |
| :--- | :--- | :--- |
| **Walk** | `W`, `A`, `S`, `D` or `Arrow Keys` | Virtual Joystick (Bottom Left) |
| **Sprint** | `Shift` | Joystick to edge |
| **Look / Orbit** | Click & Drag Mouse | Drag anywhere on screen |
| **Interact / Open Stall** | `E` or `Space` or `Enter` | Tap onscreen Prompt Button |
| **Close Modal** | `Escape` or `✕` Button | Tap `✕` Button |
| **Toggle Language** | Click `EN / हिन्दी` in top bar | Tap `EN / हिन्दी` in top bar |
| **Mute / Unmute** | Click Speaker icon in top bar | Tap Speaker icon in top bar |

---

## 📜 License
Created for celebration and cultural appreciation. Free to explore and share!

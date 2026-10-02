# LearnForge Frontend (`LearnFront`)

This is the React + Vite + TypeScript frontend application for **LearnForge**, an AI-powered personalized tutoring and adaptive learning platform.

---

## 🔗 Repositories

- **Frontend Repository (`LearnFront`)**: [https://github.com/Adarsh-griffin/FodgeLearnFront.git](https://github.com/Adarsh-griffin/FodgeLearnFront.git)
- **Backend Repository (`LearnBack`)**: [https://github.com/Adarsh-griffin/FordgeLearnBE.git](https://github.com/Adarsh-griffin/FordgeLearnBE.git)

---

## 🛠️ Tech Stack

- **React 18 & TypeScript**: Component-driven architecture and strict type safety.
- **Vite**: Ultra-fast build tool and development server.
- **TailwindCSS**: Custom glassmorphism, responsive UI tokens, and dynamic styling.
- **Three.js & GLTFLoader**: Real-time client-side 3D talking avatar rendering (`face9.glb`).
- **Web Audio API**: Real-time RMS waveform amplitude calculation for procedural lip-syncing.
- **Clerk Auth (`@clerk/react`)**: User authentication and session management.
- **Lucide React**: Modern iconography.

---

## ⚙️ Environment Setup

Create a `.env` file in the root of `LearnFront/`:

```env
# Clerk Auth Publishable Key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YXdhaXRlZC1oYWdmaXNoLTgwMDMuY2xlcmsuYWNjb3VudHMuZGV2JA

# Backend Flask API URL
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🚀 Installation & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173` or `http://localhost:8080`.

3. **Production Build**:
   ```bash
   npm run build
   ```
   Outputs static assets to `./dist/spa`.

---

## 🌐 Deployment (Render Static Site)

- **Runtime**: Static
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist/spa`
- **Rewrite Rules**: `/*` -> `/index.html` (SPA routing fallback)
- **Environment Variables**:
  - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
  - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`

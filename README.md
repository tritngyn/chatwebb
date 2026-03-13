# 💬 ChatApp - AI Chat Interface

A modern, highly optimized frontend chatbot web application built with React, TypeScript, and Vite. This project demonstrates advanced frontend architecture, state persistence, and seamless AI integration using Groq's LLMs. 

---

## ✨ Technical Highlights

Built with performance and user experience in mind, this project highlights several advanced technical implementations designed to impress at the code level:

- **🤖 AI Integration via Groq REST API**
  A reactive chatbot system powered by Groq's ultrafast LLMs. It includes custom context windowing to maintain conversation history effectively, alongside dynamic, persona-based prompt engineering.
- **⚡ Data Control & Performance**
  Engineered for snappy, 60fps interactions. Features optimized rendering through lazy loading of message histories, strict dependency arrays, advanced memoization strategies (`useCallback`, `useMemo`), and tightly controlled React re-renders.
- **🔄 Robust State Management**
  Efficiently handles complex chat states including unread badges, active messaging threads, and cross-tab synchronization using optimistic UI updates for a seamless user experience.
- **🎭 Automated Interactive Showcase**
  Includes a custom introductory sequence where AI personas (e.g., tech figures) automatically send messages shortly after the app loads, immediately demonstrating the system's real-time capabilities to reviewers.
- **🎨 Premium UI/UX & Animations**
  Fully responsive, mobile-first design with comprehensive Dark/Light mode support. Integrates smooth, physics-based micro-animations and transitions powered by Framer Motion to deliver a premium feel.

## 🚀 Technical Stack

- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **AI/API Integration:** Groq SDK
- **Icons:** FontAwesome
- **Code Quality:** ESLint, TypeScript-ESLint

## 📂 Architecture Overview

The application follows a scalable, modular directory structure ensuring separation of concerns:
- **`src/components/`**: Reusable, isolated UI components (`ChatWindow`, `ChatList`, `Sidebar`, etc.).
- **`src/context/`**: Global state management (e.g., `ChatContext`) avoiding prop-drilling and keeping the component tree clean.
- **`src/hooks/`**: Custom React hooks encapsulating complex UI logic and side effects.
- **`src/utils/`**: Helper functions for data formatting, local storage management, and API calls.

## 🛠️ Getting Started

Follow these instructions to run the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd chatapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=your_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```


---
*Developed by Nguyen Cao Triet
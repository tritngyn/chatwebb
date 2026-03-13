# ChatApp — React + TypeScript Frontend

A feature-rich chat application built with React 19, TypeScript (strict mode), Tailwind CSS v4, and Framer Motion. Designed to demonstrate professional frontend architecture and stand-out UI/UX patterns.

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | React 19 + Vite 7                         |
| Language   | TypeScript (strict, verbatimModuleSyntax) |
| Styling    | Tailwind CSS v4 + custom CSS              |
| Animations | Framer Motion                             |
| Icons      | FontAwesome (React)                       |
| Testing    | Vitest + React Testing Library            |
| State      | React Context API + Custom Hooks          |

## Architecture Decisions

### Why React Context API over Redux?

For this application's scale, **Context API** provides the right balance:

- **No extra dependency** — built into React, zero bundle cost
- **Sufficient scope** — the app has a single global data flow (rooms, messages, navigation, dark mode) without deeply nested or high-frequency updates that would require Redux's selector optimizations
- **Custom hooks as the abstraction layer** — all business logic lives in `useChatData()`, keeping components thin and testable. Swapping to Redux/Zustand later would only require changing the hook internals, not the component code

### Project Structure

```
src/
├── context/          # ChatContext + ChatProvider (global state)
├── hooks/            # useChatData — all chat logic extracted here
├── components/       # UI components (Sidebar, ChatList, ChatWindow, Calendar)
├── types/            # TypeScript interfaces & utility types
├── mockdata.ts       # Seed data for rooms & messages
├── __tests__/        # Unit tests for hooks
└── main.tsx          # App entry with ChatProvider wrapper
```

## Stand-out Features

### 1. Separation of Concerns — Custom Hooks

All localStorage access, message manipulation, and room management are extracted into `useChatData()`. **Zero business logic in components** — they only consume context and render UI.

### 2. Global State via Context API

No prop drilling. `ChatProvider` wraps the app and exposes navigation, dark mode, rooms, messages, and all mutations through `useChatContext()`.

### 3. Cross-tab Synchronization

Uses `window.addEventListener('storage', ...)` to detect localStorage changes from other tabs. When a message is sent in Tab A, it **instantly appears** in Tab B without page reload.

### 4. Optimistic UI with Network Simulation

When sending a message:

1. The message appears **immediately** with `status: "sending"` and an italic "Sending..." label
2. After a simulated 500ms network delay, the status flips to `"sent"`
3. The active room is pushed to the top of the chat list

### 5. Emoji Reactions

Each message bubble has a hover-activated emoji picker (👍 ❤️ 😂 😮 😢 🙏). Reactions toggle on/off and persist to localStorage.

### 6. Framer Motion Micro-interactions

- **Stagger effect**: Chat list items slide in sequentially on load (`delay: index * 0.05`)
- **Spring effect**: Message bubbles bounce up with `type: "spring", stiffness: 300, damping: 25`
- **Animated modals**: Calendar event modals scale in/out with AnimatePresence

### 7. Custom Invisible Scrollbar

Scrollbar is transparent by default and only reveals a thin thumb on hover — matching the minimal design aesthetic. Supports dark mode.

### 8. Calendar Page

Full month-view calendar (inspired by Google Calendar) with:

- Month navigation (Today / Prev / Next)
- Click-to-create events with title, date, time range, color picker, and description
- Event chips displayed on the calendar grid
- Click event → detail popup with Edit/Delete
- All events persisted to localStorage

### 9. Dark Mode

Toggle between light and dark themes. Preference saved to localStorage and applied via Tailwind's `dark:` variant.

### 10. Strict TypeScript

- `strict: true` in tsconfig
- All interfaces defined in `types/types.tsx`
- Utility types used (`Pick`, `Omit`)
- **No `any` usage** anywhere in the codebase

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npx vitest run

# Build for production
npm run build
```

## Testing

Unit tests cover the core `useChatData` hook:

- Room initialization and selection
- Optimistic message sending (status: "sending")
- Emoji reaction toggle (add/remove)
- Empty message guard

```bash
npx vitest run
```

      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },

},
])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````

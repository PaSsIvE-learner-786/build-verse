# BuildVerse

BuildVerse is a STEM education platform for learning robotics, microcontrollers, and electronics through interactive workshops, projects, and competitions. It provides curated component tutorials, hands-on project guides, and personalized dashboards for students, parents, mentors, and administrators.

## Features

- **Component Library** – Browse 29+ microcontroller boards with specifications, pinouts, code examples, and tutorials
- **Project Templates** – Step-by-step guides for building smart irrigation systems, IoT locks, drones, and AI-powered robots
- **Workshop Registration** – Auto-generated registration IDs, real-time seat tracking, and automatic student account creation
- **Multi-Role Dashboards** – Student progress tracking, parent billing/reporting, mentor grading, and admin analytics
- **Competition Arena** – Challenges with leaderboards, XP rewards, and daily streak tracking
- **Membership Plans** – Flexible pricing tiers (Explorer/Innovator/Builder) with monthly/annual billing options
- **Animated UI** – Canvas particle effects, infinite image carousel, and smooth transitions

## Tech Stack

- **Frontend** – Vanilla JavaScript, HTML5, CSS3
- **SPA Routing** – Client-side navigation (13 pages, no page reloads)
- **Backend** – Firebase (Authentication, Firestore, Cloud Storage)
- **Visualization** – Canvas API for particle animations
- **Real-time Sync** – Firebase REST APIs

## Installation & Run

1. Clone or extract the project folder
2. Update Firebase configuration in `app.js` with your credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     // ... other config
   };
   ```
3. Create Firestore collections: `registrations`, `workshops`, `users`, `submissions`
4. Open `index.html` in a browser or serve locally:
   ```bash
   npx http-server
   ```

## Project Structure

```
build-verse/
├── index.html           # Main HTML template (13 page views)
├── app.js               # Core application logic (1,940 lines)
│   ├── SPA Router (13 pages)
│   ├── Canvas Particle System
│   ├── Component Database (29 boards)
│   ├── Project Database (4 templates)
│   ├── Workshop Registration
│   ├── Billing & Membership
│   ├── Dashboard Portals
│   └── Firebase Integration
├── styles.css           # Global styling & responsive design
└── assets/              # Images (workshop events)
```

## Responsive Design

- **Mobile** – Hamburger navigation, touch-optimized modals, single-column layouts
- **Tablet** – 2-column grids, expanded sidebars, optimized touch targets
- **Desktop** – Full multi-column layouts, hover interactions, sidebar dashboards

All views scale fluidly with CSS media queries and flexbox layouts.

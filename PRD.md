# Product Requirements Document (PRD)
## Magical Trivia Quest (PWA Edition)

---

## 1. Product Overview

**Magical Trivia Quest** is a Progressive Web App (PWA) trivia game themed around the Disney, Marvel, Star Wars, Pixar, and Zelda universes. It is designed for offline play and features a skill tree progression system, XP, and difficulty/lives mechanics. The app is static and requires no backend after deployment.

---

## 2. Goals & Objectives

- Deliver an engaging, fandom-themed trivia experience.
- Support full offline play via PWA technologies.
- Provide meaningful progression via XP and a skill tree system.
- Ensure fast, reliable, and secure gameplay with no server dependency post-deploy.
- Make the app installable and accessible on both desktop and mobile devices.

---

## 3. Target Users

- Fans of Disney, Marvel, Star Wars, Pixar, and Zelda franchises.
- Trivia enthusiasts.
- Users seeking offline-capable, installable web games.

---

## 4. Features

### 4.1 Core Gameplay
- Answer trivia questions from multiple fandoms.
- Earn XP for correct answers.
- Progression through levels with increasing difficulty.
- Lives system: incorrect answers reduce available lives.

### 4.2 Progression & Skill Tree
- Skill tree to unlock and upgrade abilities using XP.
- Skills provide gameplay enhancements or bonuses.

### 4.3 Offline Support & PWA
- Full functionality offline after initial load/install.
- Service Worker for caching assets and data.
- Installable via browser prompt (manifest and icons provided).

### 4.4 Data & Storage
- All question data stored locally in JSON files.
- Player progress, skills, XP, and state stored via browser Local Storage.

### 4.5 Theming & UI
- Themed UI for different fandoms (Disney, Marvel, Star Wars, Pixar, Zelda).
- Responsive design for desktop and mobile.

### 4.6 No Backend Required
- All logic and data are client-side.
- No server or API dependency after deployment.

---

## 5. Technical Requirements

### 5.1 Tech Stack
- HTML5, CSS3, JavaScript (ES6+)
- Service Workers for offline/PWA support
- Local Storage for persistent client-side data
- Python scripts for data preparation (not runtime)
- Hosted on GitHub Pages

### 5.2 Directory Structure

| Directory/File         | Purpose                                                      |
|-----------------------|--------------------------------------------------------------|
| `index.html`          | Main HTML entry point                                        |
| `js/`                 | All core game/application logic                              |
| `css/`                | App styling and theming                                      |
| `assets/`             | Images, icons, and static assets                             |
| `data/`               | JSON files containing trivia questions                       |
| `python-scripts/`     | Python scripts for generating question data                  |
| `service-worker.js`   | PWA offline support                                          |
| `manifest.json`       | Web app manifest (PWA metadata and icons)                    |
| `README.md`           | Project overview and setup instructions                      |
| `DEPLOYMENT.md`       | Deployment instructions                                      |
| `.github/`, `.git/`   | Version control and GitHub automation                        |
| `tests/`              | Test scripts and resources                                   |

### 5.3 Data Models

- **Questions:** JSON files, organized by level and theme.
  - Fields: question text, possible answers, correct answer, metadata.
- **Player State:** XP, lives, unlocked skills, and progress (Local Storage).
- **Skill Tree:** Defined in JS, managed via dedicated modules.

### 5.4 Main JavaScript Modules

| File                   | Responsibility                                              |
|------------------------|------------------------------------------------------------|
| `app.js`               | Main app initialization and orchestration                  |
| `game.js`              | Core game logic (game loop, state management)              |
| `questions.js`         | Loading and managing question data                         |
| `skill-definitions.js` | Skill tree structure and definitions                       |
| `skill-tree.js`        | Skill tree logic                                           |
| `skill-tree-ui.js`     | Skill tree UI rendering and interactivity                  |
| `skill-tree-adapter.js`| Adapts skill tree logic to UI or storage                   |
| `storage.js`           | Local Storage abstraction/utilities                        |
| `button-handler.js`    | UI button event logic                                      |
| `disney-effects.js`    | Theming/special effects for Disney-related content         |
| `debug.js`             | Debugging utilities                                        |

---

## 6. User Experience

- **Onboarding:** User visits the web app, can install to home screen for full PWA experience.
- **Gameplay:** User selects or is presented questions, answers them, earns XP, and unlocks skills.
- **Progression:** User advances through levels, faces increasing difficulty, and manages lives.
- **Offline:** All features work offline after initial load/install.

---

## 7. Testing & Quality

- All major functionality must be covered by thorough tests.
- Mock data is only used for testing, never in production.
- Tests are located in `/tests/`.
- Manual and automated testing to be performed for all new features.

---

## 8. Deployment

- Source code is pushed to GitHub and deployed via GitHub Pages.
- No server-side deployment or environment variables required.
- Local development via `python3 -m http.server 8080`.

---

## 9. Legal & Compliance

- Not affiliated with or endorsed by Disney, Marvel, Lucasfilm, or Nintendo.
- For personal, non-commercial use only.

---

## 10. Risks & System-wide Considerations

- Changes to question formats or data models require updates to both data and logic.
- Skill tree changes must be reflected in both logic and UI.
- Updates to service worker or manifest can impact offline/PWA behavior.
- Adding new themes/fandoms involves new data, potential theming, and UI updates.

---

## 11. Success Metrics

- App is fully functional offline after install.
- All core gameplay and progression features work as described.
- No critical bugs or data loss in player progress.
- Responsive and visually appealing on both desktop and mobile.
- All major functionality is thoroughly tested.

---

## 12. Out of Scope

- No monetization or in-app purchases.
- No user accounts or server-side persistence.
- No analytics or tracking.

---

## 13. Appendix

- **Deployment Instructions:** See `DEPLOYMENT.md` for details.
- **Development Notes:** See `README.md` for setup and local dev instructions.

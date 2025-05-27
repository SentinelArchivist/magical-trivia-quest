# Magical Trivia Quest (PWA Edition)

A trivia game Progressive Web App (PWA) themed around the Disney, Marvel, and Star Wars universes. Players test their knowledge across these fandoms, earning Experience Points (XP) for correct answers to unlock skills in a skill tree.

## Features

- Progressive Web App with offline functionality
- Trivia questions about Disney, Marvel, and Star Wars universes
- XP system and skill tree for progression
- Lives system and difficulty scaling
- Locally stored question bank
- No internet connection required once installed

## Technical Stack

- HTML5, CSS3, JavaScript (ES6+)
- Service Workers for offline capabilities
- Local Storage for game data
- Python scripts for question data preparation

## Live Demo

The game is hosted on GitHub Pages and can be accessed at: `https://[your-github-username].github.io/magical-trivia-quest/`

## Usage

1. Visit the web application URL
2. Add to home screen for the full PWA experience
3. Play offline, anytime

## Deployment

### GitHub Pages Setup

1. Push the repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[your-github-username]/magical-trivia-quest.git
   git push -u origin main
   ```

2. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Set Source to "main" branch and folder to "/ (root)"
   - Click Save

3. Your app will be available at `https://[your-github-username].github.io/magical-trivia-quest/`

### Updating the App

To push updates to the live site:

```bash
git add .
git commit -m "Update description"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes within a few minutes.

## Local Development

To run the app locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.

## Legal Note

This application is not affiliated with, endorsed by, or connected to The Walt Disney Company, Marvel Entertainment, Lucasfilm Ltd., or any of their subsidiaries or affiliates. The application is for personal use only and will not be monetized or widely distributed.

## Development

This project was developed with a $0 budget, utilizing free and open-source tools.

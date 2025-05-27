// Main application entry point
import { initGame, startNewGame, pauseGame, resumeGame, restartGame } from './game.js';
import { initSkillTree, showSkillTree } from './skill-tree.js';
import { getSettings, saveSettings, resetAllProgress } from './storage.js';

// DOM elements - Screens
const startScreen = document.getElementById('start-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const skillTreeScreen = document.getElementById('skill-tree-screen');
const settingsScreen = document.getElementById('settings-screen');

// DOM elements - Buttons
const startGameBtn = document.getElementById('start-game');
const skillTreeBtn = document.getElementById('skill-tree-btn');
const settingsBtn = document.getElementById('settings-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartRunBtn = document.getElementById('restart-run-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');
const goSkillTreeBtn = document.getElementById('go-skill-tree-btn');
const restartGameBtn = document.getElementById('restart-game-btn');
const backFromSkillBtn = document.getElementById('back-from-skill-btn');
const backFromSettingsBtn = document.getElementById('back-from-settings-btn');
const resetProgressBtn = document.getElementById('reset-progress-btn');

// DOM elements - Settings
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');
const themeSelect = document.getElementById('theme-select');

// DOM elements - PWA Install
const pwaInstallPrompt = document.getElementById('pwa-install-prompt');
const installBtn = document.getElementById('install-btn');

// Store the deferred prompt event
let deferredPrompt;

// Show active screen, hide others
function showScreen(screenToShow) {
    // Hide all screens
    const screens = [startScreen, gameplayScreen, pauseScreen, gameOverScreen, skillTreeScreen, settingsScreen];
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    screenToShow.classList.add('active');
}

// Initialize the application
function initApp() {
    // Apply saved settings
    applySettings();
    
    // Initialize game components
    initGame();
    initSkillTree();
    
    // Add event listeners for buttons
    startGameBtn.addEventListener('click', () => {
        startNewGame();
        showScreen(gameplayScreen);
    });
    
    skillTreeBtn.addEventListener('click', () => {
        showSkillTree();
        showScreen(skillTreeScreen);
    });
    
    settingsBtn.addEventListener('click', () => {
        showScreen(settingsScreen);
    });
    
    pauseBtn.addEventListener('click', () => {
        pauseGame();
        showScreen(pauseScreen);
    });
    
    resumeBtn.addEventListener('click', () => {
        resumeGame();
        showScreen(gameplayScreen);
    });
    
    restartRunBtn.addEventListener('click', () => {
        restartGame();
        showScreen(gameplayScreen);
    });
    
    mainMenuBtn.addEventListener('click', () => {
        showScreen(startScreen);
    });
    
    goSkillTreeBtn.addEventListener('click', () => {
        showSkillTree();
        showScreen(skillTreeScreen);
    });
    
    restartGameBtn.addEventListener('click', () => {
        startNewGame();
        showScreen(gameplayScreen);
    });
    
    backFromSkillBtn.addEventListener('click', () => {
        showScreen(startScreen);
    });
    
    backFromSettingsBtn.addEventListener('click', () => {
        // Save settings when going back
        saveSettingsFromUI();
        showScreen(startScreen);
    });
    
    resetProgressBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            resetAllProgress();
            // Instead of reloading the page, reinitialize the app components
            // This ensures offline functionality remains intact
            initGame();
            initSkillTree();
            applySettings();
            // Navigate back to start screen
            showScreen(startScreen);
            // Show a notification that progress was reset
            showNotification('Progress reset successfully!');
        }
    });
    
    // Add event listeners for settings changes
    soundToggle.addEventListener('change', saveSettingsFromUI);
    musicToggle.addEventListener('change', saveSettingsFromUI);
    themeSelect.addEventListener('change', saveSettingsFromUI);
    
    // Check for PWA installability
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI to show the install button
        pwaInstallPrompt.style.display = 'block';
    });
    
    // Add event listener for install button
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the installation prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // Clear the saved prompt
        deferredPrompt = null;
        // Hide the install button
        pwaInstallPrompt.style.display = 'none';
    });
    
    // Hide install prompt if app is already installed
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        pwaInstallPrompt.style.display = 'none';
    });
    
    // Listen for messages from the service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'GAME_STATE_REFRESHED') {
                console.log('Received game state refreshed message from service worker');
                // The game state has been refreshed, no need to reload the page
                // This ensures offline functionality remains intact
            }
        });
    }
}

// Apply settings from storage
function applySettings() {
    const settings = getSettings();
    
    // Apply sound settings
    soundToggle.checked = settings.sound;
    musicToggle.checked = settings.music;
    
    // Apply theme
    themeSelect.value = settings.theme;
    document.documentElement.setAttribute('data-theme', settings.theme);
}

// Save settings from UI
function saveSettingsFromUI() {
    const settings = {
        sound: soundToggle.checked,
        music: musicToggle.checked,
        theme: themeSelect.value
    };
    
    saveSettings(settings);
    
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', settings.theme);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Show a notification to the user
function showNotification(message, duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.remove('fade-out');
    notification.style.display = 'block';
    
    // Hide after duration
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500); // Match with the CSS animation duration
    }, duration);
}

// Export functions needed by other modules
export { showScreen, showNotification };

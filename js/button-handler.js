// Direct button handler to fix button functionality
// This is a non-module script that runs after all modules are loaded
(function() {
    console.log('Button handler initializing...');
    
    // Ensure DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM content loaded, setting up button handlers');
        setupButtonHandlers();
    });

    // If DOM is already loaded, run immediately
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        console.log('DOM already ready, setting up button handlers immediately');
        setupButtonHandlers();
    }
    
    function setupButtonHandlers() {
        // Start screen buttons
        const startGameBtn = document.getElementById('start-game');
        const skillTreeBtn = document.getElementById('skill-tree-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        // Screens
        const startScreen = document.getElementById('start-screen');
        const gameplayScreen = document.getElementById('gameplay-screen');
        const skillTreeScreen = document.getElementById('skill-tree-screen');
        const settingsScreen = document.getElementById('settings-screen');
        
        // Check if elements exist
        if (!startGameBtn || !skillTreeBtn || !settingsBtn) {
            console.error('Could not find one or more main menu buttons');
            return;
        }
        
        // Add direct event listeners to buttons
        startGameBtn.onclick = function() {
            console.log('Start game button clicked');
            
            // Call the module functions directly via window
            if (typeof window.startGame === 'function') {
                window.startGame();
            } else {
                // Fallback if module function isn't available
                window.showScreen(gameplayScreen);
            }
        };
        
        skillTreeBtn.onclick = function() {
            console.log('Skill tree button clicked');
            window.showScreen(skillTreeScreen);
        };
        
        settingsBtn.onclick = function() {
            console.log('Settings button clicked');
            window.showScreen(settingsScreen);
        };
        
        // Back buttons
        const backFromSkillBtn = document.getElementById('back-from-skill-btn');
        if (backFromSkillBtn) {
            backFromSkillBtn.onclick = function() {
                window.showScreen(startScreen);
            };
        }
        
        const backFromSettingsBtn = document.getElementById('back-from-settings-btn');
        if (backFromSettingsBtn) {
            backFromSettingsBtn.onclick = function() {
                window.showScreen(startScreen);
            };
        }
        
        console.log('Button handlers set up successfully');
    }
})();

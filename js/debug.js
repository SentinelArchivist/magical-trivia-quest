// Debug script to help identify why buttons aren't working
console.log('=== DEBUG SCRIPT LOADED ===');

// Check for console errors
console.error = (function(originalError) {
    return function(message) {
        console.log('%c ERROR: ' + message, 'background: #ffcccb; color: red; font-weight: bold;');
        originalError.apply(console, arguments);
    };
})(console.error);

// Check if DOM is loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, adding event listener');
    document.addEventListener('DOMContentLoaded', initDebug);
} else {
    console.log('DOM already loaded, running debug immediately');
    initDebug();
}

function initDebug() {
    console.log('Running debug initialization');
    
    // Log all important DOM elements
    const elements = {
        startGameBtn: document.getElementById('start-game'),
        skillTreeBtn: document.getElementById('skill-tree-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        screens: {
            startScreen: document.getElementById('start-screen'),
            gameplayScreen: document.getElementById('gameplay-screen'),
            skillTreeScreen: document.getElementById('skill-tree-screen'),
            settingsScreen: document.getElementById('settings-screen')
        }
    };
    
    console.log('DOM Elements:', elements);
    
    // Test event listeners directly
    if (elements.startGameBtn) {
        console.log('Adding debug event listener to start button');
        elements.startGameBtn.addEventListener('click', function() {
            console.log('DEBUG: Start button clicked via debug listener');
        });
    }
    
    // Check for JS errors
    const originalConsoleError = console.error;
    console.error = function() {
        console.log('ERROR DETECTED:', ...arguments);
        originalConsoleError.apply(console, arguments);
    };
    
    // Log window events
    window.addEventListener('error', function(event) {
        console.log('WINDOW ERROR:', event.message, 'at', event.filename, ':', event.lineno);
    });
}

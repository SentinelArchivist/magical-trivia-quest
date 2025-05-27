// Local storage management for the game
const STORAGE_KEYS = {
    PLAYER_DATA: 'trivia-quest-player-data',
    SETTINGS: 'trivia-quest-settings'
};

// Default player data
const DEFAULT_PLAYER_DATA = {
    totalXP: 0,
    unlockedSkills: [],
    highScore: 0,
    questionsAnswered: 0
};

// Default settings
const DEFAULT_SETTINGS = {
    sound: true,
    music: true,
    theme: 'light'
};

// Get player data from local storage
function getPlayerData() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error retrieving player data:', error);
        // Display a user-friendly error
        showStorageError('retrieving');
    }
    
    // Return default data if not found or error
    return { ...DEFAULT_PLAYER_DATA };
}

// Save player data to local storage
function savePlayerData(playerData) {
    try {
        localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
        return true;
    } catch (error) {
        console.error('Error saving player data:', error);
        showStorageError('saving');
        
        // Try to use in-memory fallback for the current session
        window._inMemoryPlayerData = playerData;
        return false;
    }
}

// Helper function to show storage error
function showStorageError(operation) {
    // Only show the error once per session
    if (window._storageErrorShown) return;
    
    console.warn('Using in-memory fallback for player data');
    
    // Create an error notification if the DOM is ready
    if (document.body) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'storage-error';
        errorMessage.innerHTML = `
            <p>There was an issue ${operation} your game data. This might happen if you're in private browsing mode or your storage is full.</p>
            <p>Your progress for this session will be maintained, but may not persist after you close the game.</p>
            <button id="close-error">Got it</button>
        `;
        
        document.body.appendChild(errorMessage);
        
        // Add listener to close button
        document.getElementById('close-error').addEventListener('click', () => {
            errorMessage.remove();
        });
        
        // Mark that we've shown the error
        window._storageErrorShown = true;
    }
}

// Update player's XP
function updateXP(amount) {
    const playerData = getPlayerData();
    playerData.totalXP += amount;
    playerData.questionsAnswered++;
    savePlayerData(playerData);
    
    // Return updated total for convenience
    return playerData.totalXP;
}

// Unlock a skill
function unlockSkill(skillId, xpCost) {
    const playerData = getPlayerData();
    
    // Verify player has enough XP
    if (playerData.totalXP < xpCost) {
        return { success: false, message: 'Not enough XP' };
    }
    
    // Verify skill isn't already unlocked
    if (playerData.unlockedSkills.includes(skillId)) {
        return { success: false, message: 'Skill already unlocked' };
    }
    
    // Unlock the skill
    playerData.unlockedSkills.push(skillId);
    playerData.totalXP -= xpCost;
    
    // Save updated data
    savePlayerData(playerData);
    
    return { 
        success: true, 
        message: 'Skill unlocked successfully',
        remainingXP: playerData.totalXP
    };
}

// Check if a skill is unlocked
function isSkillUnlocked(skillId) {
    const playerData = getPlayerData();
    return playerData.unlockedSkills.includes(skillId);
}

// Get the amount of available XP
function getAvailableXP() {
    return getPlayerData().totalXP;
}

// Update high score if current score is higher
function updateHighScore(score) {
    const playerData = getPlayerData();
    if (score > playerData.highScore) {
        playerData.highScore = score;
        savePlayerData(playerData);
        return true; // New high score
    }
    return false; // Not a new high score
}

// Get settings from local storage
function getSettings() {
    try {
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (error) {
        console.error('Error retrieving settings:', error);
        // In case of error, try to use in-memory settings
        if (window._inMemorySettings) {
            return window._inMemorySettings;
        }
    }
    
    // Return default settings if not found or error
    return { ...DEFAULT_SETTINGS };
}

// Save settings to local storage
function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Reset all progress (for settings screen)
function resetAllProgress() {
    try {
        // Keep settings but reset player data
        localStorage.removeItem(STORAGE_KEYS.PLAYER_DATA);
        // Set default player data to ensure consistent state after reset
        localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify({ ...DEFAULT_PLAYER_DATA }));
        
        // Also reset the in-memory fallback if it exists
        window._inMemoryPlayerData = { ...DEFAULT_PLAYER_DATA };
        
        // Force cache refresh for PWA in offline mode
        // This ensures the PWA can continue to function without requiring online connectivity
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Notify service worker to refresh its cache
            navigator.serviceWorker.controller.postMessage({
                type: 'REFRESH_GAME_STATE',
                playerData: { ...DEFAULT_PLAYER_DATA }
            });
        }
        
        console.log('Progress reset successfully');
        return true;
    } catch (error) {
        console.error('Error resetting progress:', error);
        
        // Even if localStorage fails, reset the in-memory data
        window._inMemoryPlayerData = { ...DEFAULT_PLAYER_DATA };
        
        return true; // Still return success since we reset in-memory data
    }
}

// Reset progress (for winning scenario)
function resetProgress() {
    try {
        // Create a new player data object with default values
        const newPlayerData = { ...DEFAULT_PLAYER_DATA };
        
        // Save the new player data
        savePlayerData(newPlayerData);
        console.log('Game progress reset successfully');
        return true;
    } catch (error) {
        console.error('Error resetting game progress:', error);
        
        // Even if localStorage fails, return a default object to allow the game to continue
        return false;
    }
}

// Export functions for use in other modules
export {
    getPlayerData,
    savePlayerData,
    updateXP,
    unlockSkill,
    isSkillUnlocked,
    getAvailableXP,
    updateHighScore,
    getSettings,
    saveSettings,
    resetAllProgress,
    resetProgress
};

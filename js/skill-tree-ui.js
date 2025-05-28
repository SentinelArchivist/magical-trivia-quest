// Skill tree UI management
import { getAvailableXP, isSkillUnlocked, unlockSkill } from './storage.js';
import { SKILL_TREE, getSkill } from './skill-definitions.js';

// DOM elements
const availableXpElement = document.getElementById('available-xp');
const skillInfoPanel = document.getElementById('skill-info-panel');
const branch1Element = document.getElementById('branch-1').querySelector('.skill-nodes');
const branch2Element = document.getElementById('branch-2').querySelector('.skill-nodes');
const branch3Element = document.getElementById('branch-3').querySelector('.skill-nodes');

/**
 * Initialize the skill tree UI
 */
function initSkillTree() {
    console.log('Initializing skill tree UI');
    
    // Clear existing nodes
    branch1Element.innerHTML = '';
    branch2Element.innerHTML = '';
    branch3Element.innerHTML = '';
    
    // Create and add nodes for each branch
    Object.values(SKILL_TREE).forEach(skill => {
        const node = createSkillNode(skill);
        
        // Add to appropriate branch
        if (skill.branch === 1) {
            branch1Element.appendChild(node);
        } else if (skill.branch === 2) {
            branch2Element.appendChild(node);
        } else if (skill.branch === 3) {
            branch3Element.appendChild(node);
        }
    });
    
    // Update XP display
    updateXPDisplay();
}

/**
 * Show the skill tree and update its UI
 */
function showSkillTree() {
    console.log('Showing skill tree UI');
    
    // Clear existing nodes
    branch1Element.innerHTML = '';
    branch2Element.innerHTML = '';
    branch3Element.innerHTML = '';
    
    // Create and add nodes for each branch
    Object.values(SKILL_TREE).forEach(skill => {
        const node = createSkillNode(skill);
        
        // Add to appropriate branch
        if (skill.branch === 1) {
            branch1Element.appendChild(node);
        } else if (skill.branch === 2) {
            branch2Element.appendChild(node);
        } else if (skill.branch === 3) {
            branch3Element.appendChild(node);
        }
    });
    
    // Update XP display
    updateXPDisplay();
    
    // Clear skill info panel
    skillInfoPanel.innerHTML = '';
}

/**
 * Update the XP display
 */
function updateXPDisplay() {
    availableXpElement.textContent = getAvailableXP();
}

/**
 * Create a skill node element
 * @param {Object} skill - The skill data
 * @returns {HTMLElement} - The created node element
 */
function createSkillNode(skill) {
    const isUnlocked = isSkillUnlocked(skill.id);
    const isLocked = !isUnlocked;
    const currentXP = getAvailableXP();
    const hasEnoughXP = currentXP >= skill.xpCost;
    const prerequisitesMet = checkPrerequisites(skill.prerequisites);
    
    // Create node element
    const node = document.createElement('div');
    node.className = 'skill-node';
    if (isUnlocked) {
        node.classList.add('unlocked');
    } else if (!prerequisitesMet || !hasEnoughXP) {
        node.classList.add('locked');
    }
    
    // Create content
    const nodeName = document.createElement('h4');
    nodeName.textContent = skill.name;
    
    const nodeCost = document.createElement('div');
    nodeCost.className = 'skill-cost';
    nodeCost.textContent = isUnlocked ? 'UNLOCKED' : `${skill.xpCost} XP`;
    
    // Add content to node
    node.appendChild(nodeName);
    node.appendChild(nodeCost);
    
    // Add click event
    node.addEventListener('click', () => {
        showSkillInfo(skill);
    });
    
    return node;
}

/**
 * Show skill information and unlock button
 * @param {Object} skill - The skill data
 */
function showSkillInfo(skill) {
    const isUnlocked = isSkillUnlocked(skill.id);
    const currentXP = getAvailableXP();
    const hasEnoughXP = currentXP >= skill.xpCost;
    const prerequisitesMet = checkPrerequisites(skill.prerequisites);
    const canUnlock = !isUnlocked && hasEnoughXP && prerequisitesMet;
    
    // Clear previous content
    skillInfoPanel.innerHTML = '';
    
    // Create info elements
    const title = document.createElement('h3');
    title.textContent = skill.name;
    
    const description = document.createElement('p');
    description.textContent = skill.description;
    
    const costInfo = document.createElement('p');
    costInfo.textContent = isUnlocked ? 'Unlocked' : `Cost: ${skill.xpCost} XP`;
    
    const statusInfo = document.createElement('p');
    if (isUnlocked) {
        statusInfo.textContent = 'Status: Unlocked';
        statusInfo.className = 'status-unlocked';
    } else {
        statusInfo.textContent = canUnlock ? 'Status: Available to unlock' : 'Status: Locked';
        statusInfo.className = canUnlock ? 'status-available' : 'status-locked';
    }
    
    // Create unlock button if applicable
    const unlockButton = document.createElement('button');
    unlockButton.className = 'btn primary-btn';
    unlockButton.textContent = 'Unlock Skill';
    unlockButton.disabled = !canUnlock;
    
    if (!prerequisitesMet) {
        const prereqMessage = document.createElement('p');
        prereqMessage.className = 'prereq-message';
        prereqMessage.textContent = 'Prerequisites not met';
        skillInfoPanel.appendChild(prereqMessage);
    }
    
    // Add click event for unlock button
    unlockButton.addEventListener('click', () => {
        const result = unlockSkill(skill.id, skill.xpCost);
        if (result.success) {
            // Update UI
            showSkillTree();
            showSkillInfo(skill);
        } else {
            alert(result.message);
        }
    });
    
    // Add elements to panel
    skillInfoPanel.appendChild(title);
    skillInfoPanel.appendChild(description);
    skillInfoPanel.appendChild(costInfo);
    skillInfoPanel.appendChild(statusInfo);
    
    if (!isUnlocked) {
        skillInfoPanel.appendChild(unlockButton);
    }
    
    // Show the panel
    skillInfoPanel.style.display = 'block';
}

/**
 * Check if all prerequisites are met for a skill
 * @param {Array} prerequisites - Array of prerequisite skill IDs
 * @returns {boolean} - Whether all prerequisites are met
 */
function checkPrerequisites(prerequisites) {
    if (!prerequisites || prerequisites.length === 0) {
        return true;
    }
    
    return prerequisites.every(prereq => isSkillUnlocked(prereq));
}

// Export functions for use in other modules
export { 
    initSkillTree, 
    showSkillTree, 
    updateXPDisplay
};

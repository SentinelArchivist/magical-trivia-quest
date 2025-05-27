// Skill tree management
import { getAvailableXP, isSkillUnlocked, unlockSkill } from './storage.js';

// DOM elements
const availableXpElement = document.getElementById('available-xp');
const skillInfoPanel = document.getElementById('skill-info-panel');
const branch1Element = document.getElementById('branch-1').querySelector('.skill-nodes');
const branch2Element = document.getElementById('branch-2').querySelector('.skill-nodes');
const branch3Element = document.getElementById('branch-3').querySelector('.skill-nodes');

// Skill tree definition
const SKILL_TREE = {
    // Branch 1: Survivalist
    extraLife: {
        id: 'extraLife',
        name: 'Extra Life Prep',
        branch: 1,
        tier: 1,
        description: 'Start each game with an extra life.',
        xpCost: 100,
        prerequisites: [],
        isActive: false
    },
    secondWind: {
        id: 'secondWind',
        name: 'Second Wind',
        branch: 1,
        tier: 2,
        description: 'Once per game, survive your first incorrect answer without losing a life.',
        xpCost: 250,
        prerequisites: ['extraLife'],
        isActive: false
    },
    resilience: {
        id: 'resilience',
        name: 'Resilience',
        branch: 1,
        tier: 3,
        description: 'Gain a 20% chance to preserve a life when answering incorrectly.',
        xpCost: 500,
        prerequisites: ['secondWind'],
        isActive: false
    },
    lifeVessel: {
        id: 'lifeVessel',
        name: 'Life Vessel',
        branch: 1,
        tier: 4,
        description: 'Increase your maximum lives by 1 (stacks with Extra Life).',
        xpCost: 750,
        prerequisites: ['resilience'],
        isActive: false
    },
    rechargeStation: {
        id: 'rechargeStation',
        name: 'Recharge Station',
        branch: 1,
        tier: 5,
        description: 'After answering 10 questions correctly, gain one life (up to your maximum).',
        xpCost: 1000,
        prerequisites: ['lifeVessel'],
        isActive: false
    },
    safetyNet: {
        id: 'safetyNet',
        name: 'Safety Net',
        branch: 1,
        tier: 6,
        description: 'When you would lose your last life, survive with 1 HP instead (once per game).',
        xpCost: 1250,
        prerequisites: ['rechargeStation'],
        isActive: false
    },
    quickRecovery: {
        id: 'quickRecovery',
        name: 'Quick Recovery',
        branch: 1,
        tier: 7,
        description: 'After losing a level due to an incorrect answer, only need 3 correct answers to advance again.',
        xpCost: 1500,
        prerequisites: ['safetyNet'],
        isActive: false
    },
    battleScars: {
        id: 'battleScars',
        name: 'Battle Scars',
        branch: 1,
        tier: 8,
        description: 'Each time you lose a life, gain a 10% XP bonus (up to 30%).',
        xpCost: 1750,
        prerequisites: ['quickRecovery'],
        isActive: false
    },
    enduranceTraining: {
        id: 'enduranceTraining',
        name: 'Endurance Training',
        branch: 1,
        tier: 9,
        description: 'Reduce the penalty for wrong answers - you no longer lose a level for the first incorrect answer.',
        xpCost: 2000,
        prerequisites: ['battleScars'],
        isActive: false
    },
    ironWill: {
        id: 'ironWill',
        name: 'Iron Will',
        branch: 1,
        tier: 10,
        description: 'After reaching level 5, you cannot be demoted below level 4.',
        xpCost: 2500,
        prerequisites: ['enduranceTraining'],
        isActive: false
    },
    phoenixRising: {
        id: 'phoenixRising',
        name: 'Phoenix Rising',
        branch: 1,
        tier: 11,
        description: 'Once per game, if you lose all lives, continue with 1 life (but lose your current level progress).',
        xpCost: 3000,
        prerequisites: ['ironWill'],
        isActive: false
    },
    immortality: {
        id: 'immortality',
        name: 'Immortality',
        branch: 1,
        tier: 12,
        description: 'Start each game with 5 lives (regardless of other bonuses).',
        xpCost: 5000,
        prerequisites: ['phoenixRising'],
        isActive: false
    },
    
    // Branch 2: Scholar's Intuition
    fiftyFifty: {
        id: 'fiftyFifty',
        name: '50/50 Chance',
        branch: 2,
        tier: 1,
        description: 'Once per game, remove half of the incorrect answers from a multiple-choice question.',
        xpCost: 150,
        prerequisites: [],
        isActive: true
    },
    difficultyBypass: {
        id: 'difficultyBypass',
        name: 'Difficulty Bypass',
        branch: 2,
        tier: 2,
        description: 'Your next question will be one difficulty level lower than normal.',
        xpCost: 300,
        prerequisites: ['fiftyFifty'],
        isActive: false
    },
    categoryInsight: {
        id: 'categoryInsight',
        name: 'Category Insight',
        branch: 2,
        tier: 3,
        description: 'Once per game, get a hint for the current question.',
        xpCost: 450,
        prerequisites: ['difficultyBypass'],
        isActive: true
    },
    knowledgeExpansion: {
        id: 'knowledgeExpansion',
        name: 'Knowledge Expansion',
        branch: 2,
        tier: 4,
        description: 'Permanently unlock one random question from each difficulty tier for your question bank.',
        xpCost: 700,
        prerequisites: ['categoryInsight'],
        isActive: false
    },
    universalScholar: {
        id: 'universalScholar',
        name: 'Universal Scholar',
        branch: 2,
        tier: 5,
        description: 'Gain a 15% XP bonus for questions outside your strongest universe.',
        xpCost: 900,
        prerequisites: ['knowledgeExpansion'],
        isActive: false
    },
    timeExtension: {
        id: 'timeExtension',
        name: 'Time Extension',
        branch: 2,
        tier: 6,
        description: 'Once per game, skip a question without penalty.',
        xpCost: 1200,
        prerequisites: ['universalScholar'],
        isActive: true
    },
    twinAnswer: {
        id: 'twinAnswer',
        name: 'Twin Answer',
        branch: 2,
        tier: 7,
        description: 'Once per game, get a second chance after answering incorrectly.',
        xpCost: 1400,
        prerequisites: ['timeExtension'],
        isActive: true
    },
    insightfulPattern: {
        id: 'insightfulPattern',
        name: 'Insightful Pattern',
        branch: 2,
        tier: 8,
        description: 'After answering 3 questions from the same universe, gain insight into the next question.',
        xpCost: 1600,
        prerequisites: ['twinAnswer'],
        isActive: false
    },
    knowledgeTransfer: {
        id: 'knowledgeTransfer',
        name: 'Knowledge Transfer',
        branch: 2,
        tier: 9,
        description: 'After reaching level 4 or 5, questions from lower levels award 50% more XP.',
        xpCost: 1800,
        prerequisites: ['insightfulPattern'],
        isActive: false
    },
    criticalThinking: {
        id: 'criticalThinking',
        name: 'Critical Thinking',
        branch: 2,
        tier: 10,
        description: '10% chance to automatically answer a question correctly (excluding level 5 questions).',
        xpCost: 2200,
        prerequisites: ['knowledgeTransfer'],
        isActive: false
    },
    questionMaster: {
        id: 'questionMaster',
        name: 'Question Master',
        branch: 2,
        tier: 11,
        description: 'Reduce the number of correct answers needed to advance a level from 5 to 4.',
        xpCost: 2800,
        prerequisites: ['criticalThinking'],
        isActive: false
    },
    omniscience: {
        id: 'omniscience',
        name: 'Omniscience',
        branch: 2,
        tier: 12,
        description: 'Once per game, automatically reveal the correct answer to a level 5 question.',
        xpCost: 5000,
        prerequisites: ['questionMaster'],
        isActive: true
    },
    
    // Branch 3: XP Magnifier
    learningCurve: {
        id: 'learningCurve',
        name: 'Learning Curve',
        branch: 3,
        tier: 1,
        description: 'Earn 20% more XP for each correct answer.',
        xpCost: 200,
        prerequisites: [],
        isActive: false
    },
    streakBonus: {
        id: 'streakBonus',
        name: 'Streak Bonus',
        branch: 3,
        tier: 2,
        description: 'After answering 3 questions correctly in a row, earn 50% more XP.',
        xpCost: 350,
        prerequisites: ['learningCurve'],
        isActive: false
    },
    masterScholar: {
        id: 'masterScholar',
        name: 'Master Scholar',
        branch: 3,
        tier: 3,
        description: 'Hard and Very Hard questions award double XP.',
        xpCost: 600,
        prerequisites: ['streakBonus'],
        isActive: false
    },
    startingBonus: {
        id: 'startingBonus',
        name: 'Starting Bonus',
        branch: 3,
        tier: 4,
        description: 'Start each new game with 50 bonus XP.',
        xpCost: 800,
        prerequisites: ['masterScholar'],
        isActive: false
    },
    efficientLearner: {
        id: 'efficientLearner',
        name: 'Efficient Learner',
        branch: 3,
        tier: 5,
        description: 'Every 10th correct answer awards double XP.',
        xpCost: 1100,
        prerequisites: ['startingBonus'],
        isActive: false
    },
    universeExpert: {
        id: 'universeExpert',
        name: 'Universe Expert',
        branch: 3,
        tier: 6,
        description: 'Select a universe at the start of each game. Questions from that universe give 25% more XP.',
        xpCost: 1300,
        prerequisites: ['efficientLearner'],
        isActive: false
    },
    wisdomOfTheAges: {
        id: 'wisdomOfTheAges',
        name: 'Wisdom of the Ages',
        branch: 3,
        tier: 7,
        description: 'Your base XP gain increases by 5% for every 1000 XP you have accumulated (up to 25%).',
        xpCost: 1500,
        prerequisites: ['universeExpert'],
        isActive: false
    },
    knowledgeRetention: {
        id: 'knowledgeRetention',
        name: 'Knowledge Retention',
        branch: 3,
        tier: 8,
        description: 'After completing a game, retain 10% of the XP you would normally lose when resetting progress.',
        xpCost: 1700,
        prerequisites: ['wisdomOfTheAges'],
        isActive: false
    },
    questionRush: {
        id: 'questionRush',
        name: 'Question Rush',
        branch: 3,
        tier: 9,
        description: 'After answering 15 questions in a game, all further questions award 30% more XP.',
        xpCost: 1900,
        prerequisites: ['knowledgeRetention'],
        isActive: false
    },
    legacyKnowledge: {
        id: 'legacyKnowledge',
        name: 'Legacy Knowledge',
        branch: 3,
        tier: 10,
        description: 'Each new game inherits 5% of the XP earned in your previous game.',
        xpCost: 2300,
        prerequisites: ['questionRush'],
        isActive: false
    },
    epicQuest: {
        id: 'epicQuest',
        name: 'Epic Quest',
        branch: 3,
        tier: 11,
        description: 'Reaching level 5 without losing a life grants a 100% XP bonus for all level 5 questions.',
        xpCost: 2700,
        prerequisites: ['legacyKnowledge'],
        isActive: false
    },
    xpOverflow: {
        id: 'xpOverflow',
        name: 'XP Overflow',
        branch: 3,
        tier: 12,
        description: 'After winning a game, earn triple XP for all questions in your next game.',
        xpCost: 5000,
        prerequisites: ['epicQuest'],
        isActive: false
    }
};

// Initialize the skill tree UI
function initSkillTree() {
    console.log('Initializing skill tree');
}

// Show the skill tree and update its UI
function showSkillTree() {
    // Update available XP display
    updateXPDisplay();
    
    // Clear existing skill nodes
    branch1Element.innerHTML = '';
    branch2Element.innerHTML = '';
    branch3Element.innerHTML = '';
    
    // Create skill nodes for each branch
    Object.values(SKILL_TREE).forEach(skill => {
        // Create skill node element
        const skillNode = createSkillNode(skill);
        
        // Add to appropriate branch
        if (skill.branch === 1) {
            branch1Element.appendChild(skillNode);
        } else if (skill.branch === 2) {
            branch2Element.appendChild(skillNode);
        } else if (skill.branch === 3) {
            branch3Element.appendChild(skillNode);
        }
    });
}

// Update the XP display
function updateXPDisplay() {
    availableXpElement.textContent = getAvailableXP();
}

// Create a skill node element
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

// Show skill information and unlock button
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

// Check if all prerequisites are met for a skill
function checkPrerequisites(prerequisites) {
    if (!prerequisites || prerequisites.length === 0) {
        return true;
    }
    
    return prerequisites.every(prereq => isSkillUnlocked(prereq));
}

// Get a list of all unlocked skills
function getUnlockedSkills() {
    return Object.values(SKILL_TREE).filter(skill => isSkillUnlocked(skill.id));
}

// Check if a specific skill is unlocked
function hasSkill(skillId) {
    return isSkillUnlocked(skillId);
}

// Export functions for use in other modules
export { 
    initSkillTree, 
    showSkillTree, 
    getUnlockedSkills, 
    hasSkill 
};

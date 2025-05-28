// Skill tree definitions
// Contains all skill definitions and metadata

/**
 * Skill tree definition object
 * Structure for each skill:
 * - id: Unique identifier
 * - name: Display name
 * - branch: Which branch the skill belongs to (1-3)
 * - tier: Position within branch (1-12)
 * - description: What the skill does
 * - xpCost: Cost to unlock
 * - prerequisites: Array of skill IDs required to unlock
 * - isActive: Whether the skill needs to be manually activated or is passive
 */
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
        description: 'Start with maximum lives and your lives cannot drop below 1.',
        xpCost: 4000,
        prerequisites: ['phoenixRising'],
        isActive: false
    },
    
    // Branch 2: Strategic
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
        isActive: true
    },
    categoryInsight: {
        id: 'categoryInsight',
        name: 'Category Insight',
        branch: 2,
        tier: 3,
        description: 'Once per game, get a hint about the correct answer.',
        xpCost: 450,
        prerequisites: ['difficultyBypass'],
        isActive: true
    },
    knowledgeExpansion: {
        id: 'knowledgeExpansion',
        name: 'Knowledge Expansion',
        branch: 2,
        tier: 4,
        description: 'Increases the chance of getting questions from your least-answered universes.',
        xpCost: 600,
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
    questionPreview: {
        id: 'questionPreview',
        name: 'Question Preview',
        branch: 2,
        tier: 7,
        description: 'See the difficulty level of the next question before it appears.',
        xpCost: 1350,
        prerequisites: ['timeExtension'],
        isActive: false
    },
    insightfulPattern: {
        id: 'insightfulPattern',
        name: 'Insightful Pattern',
        branch: 2,
        tier: 8,
        description: 'After answering a question correctly, the next question is more likely to be from the same universe.',
        xpCost: 1600,
        prerequisites: ['questionPreview'],
        isActive: false
    },
    masteryRewards: {
        id: 'masteryRewards',
        name: 'Mastery Rewards',
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
        prerequisites: ['masteryRewards'],
        isActive: false
    },
    intuition: {
        id: 'intuition',
        name: 'Intuition',
        branch: 2,
        tier: 11,
        description: 'Once per game, get a second chance to answer a question if you get it wrong.',
        xpCost: 2800,
        prerequisites: ['criticalThinking'],
        isActive: true
    },
    omniscience: {
        id: 'omniscience',
        name: 'Omniscience',
        branch: 2,
        tier: 12,
        description: 'Level 5 questions have one fewer incorrect answer option.',
        xpCost: 3500,
        prerequisites: ['intuition'],
        isActive: false
    },
    
    // Branch 3: Experience
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
    quickStudy: {
        id: 'quickStudy',
        name: 'Quick Study',
        branch: 3,
        tier: 3,
        description: 'First 5 questions in each game award 25% more XP.',
        xpCost: 550,
        prerequisites: ['streakBonus'],
        isActive: false
    },
    startingBonus: {
        id: 'startingBonus',
        name: 'Starting Bonus',
        branch: 3,
        tier: 4,
        description: 'Start each game with a small XP bonus.',
        xpCost: 800,
        prerequisites: ['quickStudy'],
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
        isActive: true
    },
    difficultyBonus: {
        id: 'difficultyBonus',
        name: 'Difficulty Bonus',
        branch: 3,
        tier: 7,
        description: 'Level 4 and 5 questions award 40% more XP.',
        xpCost: 1450,
        prerequisites: ['universeExpert'],
        isActive: false
    },
    knowledgeRetention: {
        id: 'knowledgeRetention',
        name: 'Knowledge Retention',
        branch: 3,
        tier: 8,
        description: 'Each question you answer correctly permanently increases XP gained from that universe by 2% (up to 20%).',
        xpCost: 1700,
        prerequisites: ['difficultyBonus'],
        isActive: false
    },
    experienceSurge: {
        id: 'experienceSurge',
        name: 'Experience Surge',
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
        prerequisites: ['experienceSurge'],
        isActive: false
    },
    epicQuest: {
        id: 'epicQuest',
        name: 'Epic Quest',
        branch: 3,
        tier: 11,
        description: 'Defeating level 5 grants double XP for that question.',
        xpCost: 3200,
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

// Function to categorize skills by their type (passive vs active)
function categorizeSkills() {
    const passiveSkills = [];
    const activeSkills = [];
    
    Object.values(SKILL_TREE).forEach(skill => {
        if (skill.isActive) {
            activeSkills.push(skill.id);
        } else {
            passiveSkills.push(skill.id);
        }
    });
    
    return { passiveSkills, activeSkills };
}

// Get a skill by its ID
function getSkill(skillId) {
    return SKILL_TREE[skillId];
}

// Get all skills
function getAllSkills() {
    return Object.values(SKILL_TREE);
}

// Export functions and constants
export {
    SKILL_TREE,
    categorizeSkills,
    getSkill,
    getAllSkills
};

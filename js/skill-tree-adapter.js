// Skill tree adapter - solves circular dependency issues
// This file imports from both skill-definitions.js and skill-tree.js
// and provides a clean API for the rest of the application

import { SKILL_TREE, getSkill, getAllSkills, categorizeSkills } from './skill-definitions.js';
import { getUnlockedSkills, hasSkill, isPassiveSkill, isActiveSkill, getActiveUnlockedSkills } from './skill-tree.js';
import { initSkillTree, showSkillTree, updateXPDisplay } from './skill-tree-ui.js';

// Export all functions needed by other modules
export {
    // From skill-definitions.js
    SKILL_TREE,
    getSkill,
    getAllSkills,
    categorizeSkills,
    
    // From skill-tree.js
    getUnlockedSkills,
    hasSkill,
    isPassiveSkill,
    isActiveSkill,
    getActiveUnlockedSkills,
    
    // From skill-tree-ui.js
    initSkillTree,
    showSkillTree,
    updateXPDisplay
};

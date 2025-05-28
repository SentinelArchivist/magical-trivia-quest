// Skill tree management - main entry point
// This file connects the skill definitions and provides skill-related utilities

import { isSkillUnlocked } from './storage.js';
import { SKILL_TREE, getSkill, getAllSkills, categorizeSkills } from './skill-definitions.js';

// Store skill categories
const { passiveSkills, activeSkills } = categorizeSkills();

/**
 * Get a list of all unlocked skills
 * @returns {Array} - List of unlocked skill objects
 */
function getUnlockedSkills() {
    return getAllSkills().filter(skill => isSkillUnlocked(skill.id));
}

/**
 * Check if a specific skill is unlocked
 * @param {string} skillId - ID of the skill to check
 * @returns {boolean} - Whether the skill is unlocked
 */
function hasSkill(skillId) {
    return isSkillUnlocked(skillId);
}

/**
 * Get active skills that can be manually triggered
 * @returns {Array} - List of active skill objects that are unlocked
 */
function getActiveUnlockedSkills() {
    return getUnlockedSkills().filter(skill => skill.isActive);
}

/**
 * Check if a skill is passive (automatically applied)
 * @param {string} skillId - ID of the skill to check
 * @returns {boolean} - Whether the skill is passive
 */
function isPassiveSkill(skillId) {
    const skill = getSkill(skillId);
    return skill && !skill.isActive;
}

/**
 * Check if a skill is active (manually triggered)
 * @param {string} skillId - ID of the skill to check
 * @returns {boolean} - Whether the skill is active
 */
function isActiveSkill(skillId) {
    const skill = getSkill(skillId);
    return skill && skill.isActive;
}

// Export functions for use in other modules
export { 
    getUnlockedSkills, 
    hasSkill,
    getActiveUnlockedSkills,
    isPassiveSkill,
    isActiveSkill,
    passiveSkills,
    activeSkills
};

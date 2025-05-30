// Test for 50-50 skill logic in Magical Trivia Quest
// This test assumes a simple test harness or can be run in browser console for manual verification

import { displayQuestion } from '../js/game.js';

function mockQuestion() {
    return {
        questionText: 'What is the capital of France?',
        questionType: 'MultipleChoice',
        options: ['Paris', 'London', 'Berlin', 'Rome'],
        correctAnswer: 'Paris',
        universe: 'Test',
        difficulty: 2
    };
}

global.currentGameState = {
    skillEffects: { fiftyFiftyActive: true },
    usedSkills: {},
    lives: 3,
    maxLives: 3
};

global.answersContainer = { innerHTML: '', appendChild: () => {} };
global.questionText = { textContent: '' };
global.universeIndicator = { textContent: '', className: '', classList: { add: () => {} } };

global.createAnswerButton = (option) => option;
global.showNotification = () => {};
global.shuffleArray = (arr) => arr;

test('50-50 skill reduces options to 2 (correct + one incorrect)', () => {
    const question = mockQuestion();
    let renderedOptions = [];
    global.answersContainer.appendChild = (btn) => { renderedOptions.push(btn); };
    displayQuestion(question);
    // Should only show 2 options, one of which is the correct answer
    expect(renderedOptions.length).toBe(2);
    expect(renderedOptions).toContain('Paris');
    // Should contain only one incorrect
    const incorrects = renderedOptions.filter(opt => opt !== 'Paris');
    expect(incorrects.length).toBe(1);
});

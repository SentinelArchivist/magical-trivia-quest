// Core game logic
import { getQuestionPool, getQuestionsByDifficulty, getQuestionsByDifficultyExact } from './questions.js';
import { getPlayerData, savePlayerData, updateXP, resetProgress } from './storage.js';
import { showScreen } from './app.js';
import { getUnlockedSkills, hasSkill } from './skill-tree.js';

// DOM elements
const livesDisplay = document.getElementById('lives-display');
const scoreDisplay = document.getElementById('score-display');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const universeIndicator = document.getElementById('universe-indicator');
const gameplayScreen = document.getElementById('gameplay-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const questionsAnswered = document.getElementById('questions-answered');
const xpEarned = document.getElementById('xp-earned');
const activeSkillsContainer = document.getElementById('active-skills-container');

// Create elements for win screen
const winScreen = document.createElement('div');
winScreen.id = 'win-screen';
winScreen.className = 'screen';
winScreen.innerHTML = `
    <h2>Congratulations! You Won!</h2>
    <div class="results-container">
        <p>You've successfully completed all level 5 questions!</p>
        <p>Questions Answered: <span id="win-questions-answered">0</span></p>
        <p>XP Earned: <span id="win-xp-earned">0</span></p>
    </div>
    <div class="button-container">
        <button id="new-game-btn" class="btn primary-btn">Start New Game</button>
        <button id="win-skill-tree-btn" class="btn secondary-btn">Visit Skill Tree</button>
    </div>
`;

// Add win screen to the app
document.getElementById('app').appendChild(winScreen);

// Get new DOM elements
const winQuestionsAnswered = document.getElementById('win-questions-answered');
const winXpEarned = document.getElementById('win-xp-earned');
const newGameBtn = document.getElementById('new-game-btn');
const winSkillTreeBtn = document.getElementById('win-skill-tree-btn');

// Add event listeners
newGameBtn.addEventListener('click', () => {
    resetProgress();
    startNewGame();
    showScreen(gameplayScreen);
});

winSkillTreeBtn.addEventListener('click', () => {
    showSkillTree();
    showScreen(skillTreeScreen);
});

// Game state
let currentGameState = {
    lives: 3,
    score: 0,
    xpEarned: 0,
    currentQuestion: null,
    questionNumber: 0,
    answeredCorrectly: 0,
    answeredQuestions: [], // Track IDs of answered questions
    correctSequence: 0,    // Track sequence of correct answers within current level
    currentLevel: 1,       // Current difficulty level (1-5)
    usedSkills: {}
};

// Track level 5 questions for winning condition
let allLevel5Questions = [];
let answeredLevel5Correctly = [];

// Initialize game components
function initGame() {
    // Nothing to initialize here, as we'll reset everything when starting a new game
    console.log('Game initialized');
}

// Start a new game
function startNewGame() {
    // Reset game state
    currentGameState = {
        lives: 3,
        score: 0,
        xpEarned: 0,
        currentQuestion: null,
        questionNumber: 0,
        answeredCorrectly: 0,
        answeredQuestions: [], // Track answered questions
        correctSequence: 0,    // Track sequence of correct answers within current level
        currentLevel: 1,       // Start at level 1
        usedSkills: {}
    };
    
    // Get all level 5 questions for winning condition
    allLevel5Questions = getQuestionsByDifficultyExact(5);
    answeredLevel5Correctly = [];
    
    // Apply "Extra Life" skill if unlocked
    if (hasSkill('extraLife')) {
        currentGameState.lives++;
    }
    
    // Update UI
    updateLivesDisplay();
    updateScoreDisplay();
    updateLevelIndicator();
    
    // Load first question
    loadNextQuestion();
    
    // Set up active skills
    setupActiveSkills();
}

// Load the next question based on current difficulty level
function loadNextQuestion() {
    // Increment question counter
    currentGameState.questionNumber++;
    
    // Use the current level from the game state
    let difficultyTier = currentGameState.currentLevel;
    
    // Check if player has "Difficulty Bypass" skill
    if (hasSkill('difficultyBypass') && !currentGameState.usedSkills.difficultyBypass) {
        difficultyTier = Math.max(1, difficultyTier - 1);
        currentGameState.usedSkills.difficultyBypass = true;
        setupActiveSkills(); // Update UI to reflect used skill
    }
    
    // Get questions for the EXACT current difficulty level
    let eligibleQuestions = getQuestionsByDifficultyExact(difficultyTier);
    
    // Filter out questions that have already been answered in this game session
    eligibleQuestions = eligibleQuestions.filter(question => {
        // Generate a unique ID for the question based on its content
        const questionId = question.questionText + '-' + question.correctAnswer;
        return !currentGameState.answeredQuestions.includes(questionId);
    });
    
    // If no questions available at this level, handle it
    if (eligibleQuestions.length === 0) {
        console.error(`No more unanswered questions available for difficulty level ${difficultyTier}`);
        
        // Check if we're at level 5 and have answered all questions correctly
        if (difficultyTier === 5 && answeredLevel5Correctly.length === allLevel5Questions.length && allLevel5Questions.length > 0) {
            // Player has won!
            winGame();
            return;
        } else {
            questionText.textContent = `No more questions available for difficulty level ${difficultyTier}. Try resetting your progress or a different level.`;
            return;
        }
    }
    
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * eligibleQuestions.length);
    currentGameState.currentQuestion = eligibleQuestions[randomIndex];
    
    // Display the question
    displayQuestion(currentGameState.currentQuestion);
}

// Display the current question
function displayQuestion(question) {
    // Update universe indicator
    universeIndicator.textContent = question.universe;
    universeIndicator.className = 'universe-indicator';
    universeIndicator.classList.add(`universe-${question.universe.toLowerCase()}`);
    
    // Set question text
    questionText.textContent = question.questionText;
    
    // Clear previous answers
    answersContainer.innerHTML = '';
    
    // Add answers based on question type
    if (question.questionType === 'TrueFalse') {
        // True/False question
        const trueButton = createAnswerButton('True');
        const falseButton = createAnswerButton('False');
        
        answersContainer.appendChild(trueButton);
        answersContainer.appendChild(falseButton);
    } else if (question.questionType === 'MultipleChoice') {
        // Multiple choice question
        answersContainer.classList.add('multiple-choice');
        
        // Shuffle options
        const options = [...question.options];
        shuffleArray(options);
        
        // Check if 50/50 skill is active
        if (hasSkill('fiftyFifty') && !currentGameState.usedSkills.fiftyFifty) {
            // Remove two incorrect options
            const incorrectOptions = options.filter(option => option !== question.correctAnswer);
            shuffleArray(incorrectOptions);
            
            // Keep only one incorrect option
            const optionsToShow = [question.correctAnswer, incorrectOptions[0]];
            shuffleArray(optionsToShow);
            
            // Create buttons for remaining options
            optionsToShow.forEach(option => {
                const optionButton = createAnswerButton(option);
                answersContainer.appendChild(optionButton);
            });
            
            // Mark skill as used
            currentGameState.usedSkills.fiftyFifty = true;
            
            // Update active skills UI
            setupActiveSkills();
        } else {
            // Create buttons for all options
            options.forEach(option => {
                const optionButton = createAnswerButton(option);
                answersContainer.appendChild(optionButton);
            });
        }
    }
}

// Create an answer button with event listener
function createAnswerButton(answerText) {
    const button = document.createElement('div');
    button.className = 'answer-option';
    button.textContent = answerText;
    
    // Add click event
    button.addEventListener('click', () => handleAnswer(answerText));
    
    return button;
}

// Handle player's answer
function handleAnswer(selectedAnswer) {
    const currentQuestion = currentGameState.currentQuestion;
    const correctAnswer = currentQuestion.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Show correct/incorrect visual feedback
    const answerButtons = document.querySelectorAll('.answer-option');
    answerButtons.forEach(button => {
        // Disable all buttons
        button.style.pointerEvents = 'none';
        
        if (button.textContent === correctAnswer) {
            button.classList.add('correct');
        } else if (button.textContent === selectedAnswer && !isCorrect) {
            button.classList.add('incorrect');
        }
    });
    
    // Process answer after a short delay
    setTimeout(() => {
        if (isCorrect) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }
    }, 1500);
}

// Handle correct answer
function handleCorrectAnswer() {
    // Get a unique ID for the current question
    const questionId = currentGameState.currentQuestion.questionText + '-' + currentGameState.currentQuestion.correctAnswer;
    
    // Add to answered questions list to prevent repeats
    currentGameState.answeredQuestions.push(questionId);
    
    // Increment score and answered correctly counter
    currentGameState.score += 10;
    currentGameState.answeredCorrectly++;
    
    // Increment correct sequence for this level
    currentGameState.correctSequence++;
    
    // If this is a level 5 question, track it for the win condition
    if (currentGameState.currentQuestion.difficultyTier === 5) {
        answeredLevel5Correctly.push(questionId);
        
        // Check for win condition - all level 5 questions answered correctly
        if (answeredLevel5Correctly.length === allLevel5Questions.length && allLevel5Questions.length > 0) {
            // Calculate final XP and score before winning
            calculateXP();
            winGame();
            return;
        }
    }
    
    // Check if player should advance to next level (after 5 correct answers)
    if (currentGameState.correctSequence >= 5 && currentGameState.currentLevel < 5) {
        currentGameState.currentLevel++;
        currentGameState.correctSequence = 0; // Reset sequence for new level
        updateLevelIndicator();
    }
    
    // Calculate XP based on question difficulty
    calculateXP();
    
    // Update UI
    updateScoreDisplay();
    
    // Load next question
    loadNextQuestion();
}

// Calculate and add XP for correct answers
function calculateXP() {
    let xpAmount = currentGameState.currentQuestion.difficultyTier * 10;
    
    // Apply XP bonuses from skills
    if (hasSkill('learningCurve')) {
        xpAmount = Math.floor(xpAmount * 1.2); // 20% XP bonus
    }
    
    // Add streak bonus if applicable
    if (hasSkill('streakBonus') && currentGameState.answeredCorrectly >= 3) {
        xpAmount = Math.floor(xpAmount * 1.5); // 50% bonus for streaks of 3+
    }
    
    // Add master scholar bonus for hard questions
    if (hasSkill('masterScholar') && (currentGameState.currentQuestion.difficultyTier >= 4)) {
        xpAmount = Math.floor(xpAmount * 2); // Double XP for hard and very hard questions
    }
    
    // Add XP to current game total
    currentGameState.xpEarned += xpAmount;
}

// Handle incorrect answer
function handleIncorrectAnswer() {
    // Get a unique ID for the current question
    const questionId = currentGameState.currentQuestion.questionText + '-' + currentGameState.currentQuestion.correctAnswer;
    
    // Add to answered questions list to prevent repeats
    currentGameState.answeredQuestions.push(questionId);
    
    // Check for Second Wind skill (avoid losing a life on first wrong answer)
    if (hasSkill('secondWind') && !currentGameState.usedSkills.secondWind) {
        currentGameState.usedSkills.secondWind = true;
        setupActiveSkills();
        loadNextQuestion();
        return;
    }
    
    // Check for resilience skill - chance to preserve a life
    if (hasSkill('resilience') && Math.random() < 0.2) { // 20% chance
        // Show a notification that resilience saved a life
        showNotification('Resilience skill activated! No life lost.');
        // Continue to next question without losing a life
        loadNextQuestion();
        return;
    }
    
    // Lose a life
    currentGameState.lives--;
    
    // Update UI
    updateLivesDisplay();
    
    // Reset correct sequence
    currentGameState.correctSequence = 0;
    
    // Demote player to a lower difficulty level (if not already at level 1)
    if (currentGameState.currentLevel > 1) {
        currentGameState.currentLevel--;
        updateLevelIndicator();
    }
    
    // Check for game over
    if (currentGameState.lives <= 0) {
        endGame();
    } else {
        // Continue to next question
        loadNextQuestion();
    }
}

// End the game
function endGame() {
    // Update game over screen with results
    questionsAnswered.textContent = currentGameState.answeredCorrectly;
    xpEarned.textContent = currentGameState.xpEarned;
    
    // Add XP to player's total
    updateXP(currentGameState.xpEarned);
    
    // Show game over screen
    showScreen(gameOverScreen);
}

// Update lives display
function updateLivesDisplay() {
    livesDisplay.innerHTML = '';
    
    for (let i = 0; i < currentGameState.lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = 'life';
        livesDisplay.appendChild(lifeIcon);
    }
}

// Update score display
function updateScoreDisplay() {
    scoreDisplay.textContent = currentGameState.score;
}

// Set up active skills
function setupActiveSkills() {
    // Clear current active skills
    activeSkillsContainer.innerHTML = '';
    
    // Get unlocked skills
    const unlockedSkills = getUnlockedSkills();
    
    // Add buttons for active skills
    unlockedSkills.forEach(skill => {
        // Only show active skills (ones that can be triggered)
        if (skill.isActive && !currentGameState.usedSkills[skill.id]) {
            const skillButton = document.createElement('button');
            skillButton.className = 'skill-button';
            skillButton.textContent = skill.name;
            skillButton.addEventListener('click', () => activateSkill(skill.id));
            activeSkillsContainer.appendChild(skillButton);
        }
    });
}

// Activate a skill
function activateSkill(skillId) {
    // Mark skill as used
    currentGameState.usedSkills[skillId] = true;
    
    // Apply skill effect
    switch (skillId) {
        case 'fiftyFifty':
            // Effect applied when displaying question
            loadNextQuestion(); // Reload current question with 50/50 applied
            break;
        case 'categoryInsight':
            // Provide a hint about the correct answer
            alert('Hint: The correct answer is related to ' + 
                  getHintForQuestion(currentGameState.currentQuestion));
            break;
        default:
            console.log('Skill activated:', skillId);
    }
    
    // Update active skills UI
    setupActiveSkills();
}

// Get hint for a question (for Category Insight skill)
function getHintForQuestion(question) {
    // This would be more sophisticated in a real implementation
    return question.universe + ' lore';
}

// Pause the game
function pauseGame() {
    // Just show pause screen (actual pausing handled by app.js)
}

// Resume the game
function resumeGame() {
    // Just show gameplay screen (actual resuming handled by app.js)
}

// Restart the game
function restartGame() {
    startNewGame();
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Show a temporary notification message
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    gameplayScreen.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2500);
}

// Update the UI to show current level
function updateLevelIndicator() {
    // Create level indicator if it doesn't exist
    if (!document.getElementById('level-indicator')) {
        const levelIndicator = document.createElement('div');
        levelIndicator.id = 'level-indicator';
        levelIndicator.className = 'level-indicator';
        document.querySelector('.game-header').appendChild(levelIndicator);
    }
    
    const levelIndicator = document.getElementById('level-indicator');
    levelIndicator.textContent = `Level: ${currentGameState.currentLevel}`;
}

// Handle winning the game
function winGame() {
    // Update win screen with results
    winQuestionsAnswered.textContent = currentGameState.answeredCorrectly;
    winXpEarned.textContent = currentGameState.xpEarned;
    
    // Add XP to player's total
    updateXP(currentGameState.xpEarned);
    
    // Show win screen
    showScreen(winScreen);
}

// Export functions needed by other modules
export { 
    initGame, 
    startNewGame, 
    pauseGame, 
    resumeGame, 
    restartGame
};

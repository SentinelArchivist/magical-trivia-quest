// Core game logic
import { getQuestionPool, getQuestionsByDifficulty, getQuestionsByDifficultyExact } from './questions.js';
import { getPlayerData, savePlayerData, updateXP, resetProgress } from './storage.js';
import { showScreen } from './app.js';
import { getUnlockedSkills, hasSkill, isPassiveSkill, isActiveSkill, getActiveUnlockedSkills } from './skill-tree-adapter.js';

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
    maxLives: 3,
    score: 0,
    xpEarned: 0,
    currentQuestion: null,
    questionNumber: 0,
    answeredCorrectly: 0,
    answeredQuestions: [], // Track IDs of answered questions
    correctSequence: 0,    // Track sequence of correct answers within current level
    currentLevel: 1,       // Current difficulty level (1-5)
    usedSkills: {},
    skillEffects: {}       // Store active effects and counters for skills
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
        maxLives: 3,
        score: 0,
        xpEarned: 0,
        currentQuestion: null,
        questionNumber: 0,
        answeredCorrectly: 0,
        answeredQuestions: [], // Track answered questions
        correctSequence: 0,    // Track sequence of correct answers within current level
        currentLevel: 1,       // Start at level 1
        usedSkills: {},
        skillEffects: {}
    };
    
    // Get all level 5 questions for winning condition
    allLevel5Questions = getQuestionsByDifficultyExact(5);
    answeredLevel5Correctly = [];
    
    // Apply passive skills for game start
    applyPassiveSkills('gameStart');
    
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
    
    // Create selection data object for skill effects to modify
    const selectionData = {
        currentLevel: currentGameState.currentLevel,
        difficultyTier: currentGameState.currentLevel, // Initial tier matches current level
        favorLeastAnswered: false,                    // Prioritize universes with fewer answered questions
        favoredUniverse: null,                        // Universe to prioritize if possible
        preventRepeat: true                           // Prevent repeated questions
    };
    
    // Apply passive skills that affect question selection
    applyPassiveSkills('questionSelection', selectionData);
    
    // Check if difficultyBypass active skill was used
    if (currentGameState.skillEffects.difficultyBypassActive) {
        selectionData.difficultyTier = Math.max(1, selectionData.difficultyTier - 1);
        delete currentGameState.skillEffects.difficultyBypassActive;
        showNotification(`Difficulty Bypass activated: Using level ${selectionData.difficultyTier} question`);
    }
    
    // Get questions for the specified difficulty tier
    let eligibleQuestions = getQuestionsByDifficultyExact(selectionData.difficultyTier);
    
    // Filter out questions that have already been answered in this game session if needed
    if (selectionData.preventRepeat) {
        eligibleQuestions = eligibleQuestions.filter(question => {
            // Generate a unique ID for the question based on its content
            const questionId = question.questionText + '-' + question.correctAnswer;
            return !currentGameState.answeredQuestions.includes(questionId);
        });
    }
    
    // If we have a favored universe and there are questions from that universe, prioritize them
    if (selectionData.favoredUniverse && eligibleQuestions.some(q => q.universe === selectionData.favoredUniverse)) {
        const favoredQuestions = eligibleQuestions.filter(q => q.universe === selectionData.favoredUniverse);
        
        // 70% chance to pick from favored universe if available
        if (favoredQuestions.length > 0 && Math.random() < 0.7) {
            eligibleQuestions = favoredQuestions;
        }
    }
    
    // Apply favor least answered universes logic if enabled
    if (selectionData.favorLeastAnswered && eligibleQuestions.length > 3) {
        // Count questions answered by universe
        const universeAnswerCounts = {};
        
        // Count previously answered questions by universe
        currentGameState.answeredQuestions.forEach(questionId => {
            // Extract universe from question ID (if stored in state)
            const question = getQuestionByUniqueId(questionId);
            if (question && question.universe) {
                universeAnswerCounts[question.universe] = (universeAnswerCounts[question.universe] || 0) + 1;
            }
        });
        
        // Group questions by universe
        const questionsByUniverse = {};
        eligibleQuestions.forEach(question => {
            if (!questionsByUniverse[question.universe]) {
                questionsByUniverse[question.universe] = [];
            }
            questionsByUniverse[question.universe].push(question);
        });
        
        // Find universes with fewest answered questions
        const universes = Object.keys(questionsByUniverse);
        universes.sort((a, b) => (universeAnswerCounts[a] || 0) - (universeAnswerCounts[b] || 0));
        
        // 60% chance to pick from least answered universe
        if (universes.length > 0 && Math.random() < 0.6) {
            eligibleQuestions = questionsByUniverse[universes[0]];
        }
    }
    
    // If no questions available at this level, handle it
    if (eligibleQuestions.length === 0) {
        console.error(`No more unanswered questions available for difficulty level ${selectionData.difficultyTier}`);
        
        // Check if we're at level 5 and have answered all questions correctly
        if (selectionData.difficultyTier === 5 && answeredLevel5Correctly.length === allLevel5Questions.length && allLevel5Questions.length > 0) {
            // Player has won!
            winGame();
            return;
        } else {
            questionText.textContent = `No more questions available for difficulty level ${selectionData.difficultyTier}. Try resetting your progress or a different level.`;
            return;
        }
    }
    
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * eligibleQuestions.length);
    currentGameState.currentQuestion = eligibleQuestions[randomIndex];
    
    // Trigger question loaded event for skills
    const questionData = { question: currentGameState.currentQuestion };
    applyPassiveSkills('questionLoaded', questionData);
    
    // Display the question
    displayQuestion(currentGameState.currentQuestion);
}

// Display the current question
function displayQuestion(question) {
    // Create data object for skill effects to modify
    const displayData = {
        question: question,
        reduceOptions: false,         // Indicates if incorrect options should be reduced
        highlightCategory: false,     // Indicates if category should be highlighted
        categoryInfo: null            // Additional category information
    };
    
    // Apply passive skills that affect question display
    applyPassiveSkills('questionDisplay', displayData);
    
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
        
        let optionsToShow = [...options];
        
        // Check if 50/50 skill is active for this question
        if (currentGameState.skillEffects.fiftyFiftyActive) {
            // Remove half of incorrect options
            const incorrectOptions = options.filter(option => option !== question.correctAnswer);
            shuffleArray(incorrectOptions);
            
            // Determine how many incorrect options to keep (at least 1)
            const incorrectToKeep = Math.max(1, Math.floor(incorrectOptions.length / 2));
            const keptIncorrect = incorrectOptions.slice(0, incorrectToKeep);
            
            // Final options to show
            optionsToShow = [question.correctAnswer, ...keptIncorrect];
            shuffleArray(optionsToShow);
            
            // Reset the effect after use
            delete currentGameState.skillEffects.fiftyFiftyActive;
            
            showNotification('50/50 Chance skill: Half of incorrect options removed');
        } 
        // Check for omniscience skill effect on level 5 questions
        else if (displayData.reduceOptions && question.difficulty === 5) {
            // Remove one incorrect option for level 5 questions
            const incorrectOptions = options.filter(option => option !== question.correctAnswer);
            shuffleArray(incorrectOptions);
            
            // Keep all but one incorrect option
            const keptIncorrect = incorrectOptions.slice(0, incorrectOptions.length - 1);
            
            // Final options to show
            optionsToShow = [question.correctAnswer, ...keptIncorrect];
            shuffleArray(optionsToShow);
            
            showNotification('Omniscience skill: One incorrect option removed');
        }
        
        // Create buttons for options to show
        optionsToShow.forEach(option => {
            const optionButton = createAnswerButton(option);
            answersContainer.appendChild(optionButton);
        });
    }
    
    // Display category information if applicable
    if (displayData.highlightCategory && displayData.categoryInfo) {
        const categoryHint = document.createElement('div');
        categoryHint.className = 'category-hint';
        categoryHint.textContent = displayData.categoryInfo;
        answersContainer.appendChild(categoryHint);
    }
    
    // Check for Critical Thinking auto-correct
    if (currentGameState.skillEffects.autoCorrect) {
        // Automatically select correct answer after a short delay
        setTimeout(() => {
            handleAnswer(question.correctAnswer);
            delete currentGameState.skillEffects.autoCorrect;
        }, 1000);
        
        showNotification('Critical Thinking skill: Auto-correct activated!'); 
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
    // Base XP based on difficulty level
    const baseXP = currentGameState.currentLevel * 10;
    
    // Create XP calculation data object for skills to modify
    const xpData = {
        question: currentGameState.currentQuestion,
        baseXP: baseXP,
        bonusMultiplier: 1.0,
        xpMultiplier: 1.0,
        universe: currentGameState.currentQuestion.universe
    };
    
    // Apply passive skills that affect XP calculation
    applyPassiveSkills('xpCalculation', xpData);
    
    // Check if universe expert skill is active
    if (currentGameState.skillEffects.favoredUniverse === xpData.universe) {
        xpData.bonusMultiplier *= 1.25; // 25% bonus for favored universe
        showNotification(`Universe Expert bonus: +25% XP for ${xpData.universe} question`);
    }
    
    // Apply battle scars bonus if active
    if (currentGameState.skillEffects.battleScarsBonus) {
        xpData.bonusMultiplier *= (1 + currentGameState.skillEffects.battleScarsBonus);
    }
    
    // Check if xpOverflow is active (triple XP after winning)
    if (currentGameState.skillEffects.xpOverflowActive) {
        xpData.bonusMultiplier *= 3.0;
    }
    
    // Check for insightBoost skill (double XP for next correct answer)
    if (currentGameState.skillEffects.insightBoostActive) {
        xpData.xpMultiplier *= 2.0;
        delete currentGameState.skillEffects.insightBoostActive; // Use once and reset
        showNotification('Insight Boost activated: Double XP!');
    }
    
    // Check for knowledgeSurge skill (triple XP for next 3 questions)
    if (currentGameState.skillEffects.knowledgeSurgeCounter > 0) {
        xpData.xpMultiplier *= 3.0;
        currentGameState.skillEffects.knowledgeSurgeCounter--;
        showNotification(`Knowledge Surge active: Triple XP! (${currentGameState.skillEffects.knowledgeSurgeCounter} questions remaining)`);
    }
    
    // Check for next question bonus from efficient learner
    if (currentGameState.skillEffects.nextQuestionXPMultiplier) {
        xpData.xpMultiplier *= currentGameState.skillEffects.nextQuestionXPMultiplier;
        // Reset after use
        delete currentGameState.skillEffects.nextQuestionXPMultiplier;
    }
    
    // Calculate total XP with all bonuses
    const totalXP = Math.round(baseXP * xpData.bonusMultiplier * xpData.xpMultiplier);
    
    // Add XP to current game total
    currentGameState.xpEarned += totalXP;
    
    // Also add XP to player's persistent total
    // This is XP earned from answering a question correctly
    updateXP(totalXP, true);
    
    return totalXP;
}

// Handle incorrect answer
function handleIncorrectAnswer() {
    // Get a unique ID for the current question
    const questionId = currentGameState.currentQuestion.questionText + '-' + currentGameState.currentQuestion.correctAnswer;
    
    // Add to answered questions list to prevent repeats
    currentGameState.answeredQuestions.push(questionId);
    
    // Create event data for skill effects
    const eventData = {
        preventLevelDemotion: false,
        preventGameOver: false
    };
    
    // Apply skills for incorrect answer event
    applyPassiveSkills('incorrectAnswer', eventData);
    
    // Check for intuition skill (second chance on wrong answer)
    if (currentGameState.skillEffects.intuitionActive) {
        delete currentGameState.skillEffects.intuitionActive;
        showNotification('Intuition skill activated: Try again!');
        return; // Don't lose a life, just try again
    }
    
    // Lose a life
    currentGameState.lives--;
    
    // Update UI
    updateLivesDisplay();
    
    // Reset correct sequence
    currentGameState.correctSequence = 0;
    
    // Demote player to a lower difficulty level unless prevented by a skill
    if (currentGameState.currentLevel > 1 && !eventData.preventLevelDemotion) {
        currentGameState.currentLevel--;
        updateLevelIndicator();
        
        // Trigger level demotion event for skills
        applyPassiveSkills('levelDemotion');
    }
    
    // Check for game over
    if (currentGameState.lives <= 0) {
        // Check if any skills prevent game over
        if (!eventData.preventGameOver) {
            endGame();
        } else {
            loadNextQuestion();
        }
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
    
    // XP has already been added to the player's total during gameplay
    // in the calculateXP function, so we don't need to add it again here
    
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
    // Clear existing active skills
    activeSkillsContainer.innerHTML = '';
    
    // Get unlocked skills
    const activeSkills = getActiveUnlockedSkills();
    
    // Add buttons for active skills
    activeSkills.forEach(skill => {
        // Only show active skills that haven't been used yet
        if (!currentGameState.usedSkills[skill.id]) {
            const skillButton = document.createElement('button');
            skillButton.className = 'skill-button';
            skillButton.textContent = skill.name;
            skillButton.addEventListener('click', () => activateSkill(skill.id));
            activeSkillsContainer.appendChild(skillButton);
        }
    });
}

/**
 * Apply passive skills based on game events
 * @param {string} eventType - Type of game event triggering skill check
 * @param {Object} eventData - Additional data related to the event
 */
function applyPassiveSkills(eventType, eventData = {}) {
    // Check each unlocked passive skill
    const unlockedSkills = getUnlockedSkills().filter(skill => !skill.isActive);
    
    unlockedSkills.forEach(skill => {
        // Skip if skill doesn't apply to this event type
        const handlers = PASSIVE_SKILL_HANDLERS[skill.id];
        if (!handlers || !handlers[eventType]) return;
        
        // Apply the skill effect
        handlers[eventType](eventData);
    });
}

/**
 * Handlers for passive skills based on event type
 */
const PASSIVE_SKILL_HANDLERS = {
    // Branch 1: Survivalist skills
    extraLife: {
        gameStart: () => {
            currentGameState.lives++;
            updateLivesDisplay();
            showNotification('Extra Life skill activated: +1 life');
        }
    },
    secondWind: {
        incorrectAnswer: (data) => {
            // Only applies once per game
            if (!currentGameState.skillEffects.secondWindUsed) {
                currentGameState.skillEffects.secondWindUsed = true;
                currentGameState.lives++; // Restore the life just lost
                updateLivesDisplay();
                showNotification('Second Wind skill activated: Life preserved');
                return true; // Indicate the skill was applied
            }
            return false;
        }
    },
    resilience: {
        incorrectAnswer: () => {
            // 20% chance to preserve a life
            if (Math.random() < 0.2) {
                currentGameState.lives++; // Restore the life just lost
                updateLivesDisplay();
                showNotification('Resilience skill activated: Life preserved');
                return true;
            }
            return false;
        }
    },
    lifeVessel: {
        gameStart: () => {
            currentGameState.maxLives++;
            currentGameState.lives++;
            updateLivesDisplay();
            showNotification('Life Vessel skill activated: Maximum lives increased');
        }
    },
    rechargeStation: {
        correctAnswer: () => {
            // Track correct answers
            if (!currentGameState.skillEffects.rechargeCounter) {
                currentGameState.skillEffects.rechargeCounter = 0;
            }
            
            currentGameState.skillEffects.rechargeCounter++;
            
            // Every 10 correct answers, gain a life
            if (currentGameState.skillEffects.rechargeCounter >= 10) {
                if (currentGameState.lives < currentGameState.maxLives) {
                    currentGameState.lives++;
                    updateLivesDisplay();
                    showNotification('Recharge Station skill activated: +1 life');
                }
                currentGameState.skillEffects.rechargeCounter = 0;
            }
        }
    },
    safetyNet: {
        incorrectAnswer: (data) => {
            // When player would lose their last life
            if (currentGameState.lives === 0 && !currentGameState.skillEffects.safetyNetUsed) {
                currentGameState.lives = 1;
                currentGameState.skillEffects.safetyNetUsed = true;
                updateLivesDisplay();
                showNotification('Safety Net skill activated: Survived with 1 life');
                return true;
            }
            return false;
        }
    },
    quickRecovery: {
        levelDemotion: () => {
            // After level demotion, only need 3 correct answers to advance
            currentGameState.skillEffects.quickRecoveryActive = true;
            showNotification('Quick Recovery skill activated: Faster level advancement');
        }
    },
    battleScars: {
        incorrectAnswer: () => {
            // Each life loss grants 10% XP bonus (up to 30%)
            if (!currentGameState.skillEffects.battleScarsBonus) {
                currentGameState.skillEffects.battleScarsBonus = 0;
            }
            
            if (currentGameState.skillEffects.battleScarsBonus < 0.3) {
                currentGameState.skillEffects.battleScarsBonus += 0.1;
                showNotification(`Battle Scars skill activated: +10% XP bonus (total: ${Math.round(currentGameState.skillEffects.battleScarsBonus * 100)}%)`);
            }
        }
    },
    enduranceTraining: {
        incorrectAnswer: (data) => {
            // Prevent level demotion on first incorrect answer
            if (!currentGameState.skillEffects.enduranceTrainingUsed) {
                currentGameState.skillEffects.enduranceTrainingUsed = true;
                data.preventLevelDemotion = true;
                showNotification('Endurance Training skill activated: Level preserved');
                return true;
            }
            return false;
        }
    },
    ironWill: {
        levelCheck: (data) => {
            // After reaching level 5, cannot be demoted below level 4
            if (data.newLevel < 4 && currentGameState.skillEffects.reachedLevel5) {
                data.newLevel = 4;
                showNotification('Iron Will skill activated: Cannot go below level 4');
            }
            
            // Record if player has reached level 5
            if (data.currentLevel === 5) {
                currentGameState.skillEffects.reachedLevel5 = true;
            }
        }
    },
    phoenixRising: {
        gameOver: (data) => {
            // Once per game, if you lose all lives, continue with 1 life
            if (!currentGameState.skillEffects.phoenixRisingUsed) {
                currentGameState.skillEffects.phoenixRisingUsed = true;
                currentGameState.lives = 1;
                // Reset current level progress
                currentGameState.correctSequence = 0;
                updateLivesDisplay();
                data.preventGameOver = true;
                showNotification('Phoenix Rising skill activated: Reborn with 1 life!');
                return true;
            }
            return false;
        }
    },
    immortality: {
        gameStart: () => {
            // Start with maximum lives
            currentGameState.lives = currentGameState.maxLives;
            updateLivesDisplay();
        },
        incorrectAnswer: (data) => {
            // Lives cannot drop below 1
            if (currentGameState.lives === 0) {
                currentGameState.lives = 1;
                updateLivesDisplay();
                showNotification('Immortality skill activated: Preserved last life');
                return true;
            }
            return false;
        }
    },
    
    // Branch 2: Strategic skills
    knowledgeExpansion: {
        questionSelection: (data) => {
            // Increases chance of getting questions from least-answered universes
            data.favorLeastAnswered = true;
        }
    },
    universalScholar: {
        xpCalculation: (data) => {
            // 15% XP bonus for questions outside strongest universe
            if (data.universe !== currentGameState.skillEffects.strongestUniverse) {
                data.bonusMultiplier *= 1.15;
                showNotification('Universal Scholar skill activated: +15% XP');
            }
        }
    },
    questionPreview: {
        questionLoaded: (data) => {
            // Show the difficulty level of the next question
            showNotification(`Next question difficulty: Level ${data.question.difficulty}`);
        }
    },
    insightfulPattern: {
        correctAnswer: (data) => {
            // Next question more likely to be from same universe
            currentGameState.skillEffects.favoredUniverse = data.question.universe;
        }
    },
    masteryRewards: {
        xpCalculation: (data) => {
            // After reaching level 4 or 5, questions from lower levels give 50% more XP
            if (currentGameState.currentLevel >= 4 && data.question.difficulty < currentGameState.currentLevel) {
                data.bonusMultiplier *= 1.5;
                showNotification('Mastery Rewards skill activated: +50% XP for lower level question');
            }
        }
    },
    criticalThinking: {
        questionLoaded: (data) => {
            // 10% chance to automatically answer correctly (excluding level 5 questions)
            if (data.question.difficulty < 5 && Math.random() < 0.1) {
                currentGameState.skillEffects.autoCorrect = true;
                showNotification('Critical Thinking skill activated: Auto-correct');
            }
        }
    },
    omniscience: {
        questionDisplay: (data) => {
            // Level 5 questions have one fewer incorrect answer option
            if (data.question.difficulty === 5) {
                data.reduceOptions = true;
            }
        }
    },
    
    // Branch 3: Experience skills
    learningCurve: {
        xpCalculation: (data) => {
            // 20% more XP for each correct answer
            data.bonusMultiplier *= 1.2;
            showNotification('Learning Curve skill activated: +20% XP');
        }
    },
    streakBonus: {
        xpCalculation: (data) => {
            // After 3 correct answers in a row, earn 50% more XP
            if (currentGameState.skillEffects.correctStreak >= 3) {
                data.bonusMultiplier *= 1.5;
                showNotification('Streak Bonus skill activated: +50% XP');
            }
        },
        correctAnswer: () => {
            // Track correct streak
            if (!currentGameState.skillEffects.correctStreak) {
                currentGameState.skillEffects.correctStreak = 0;
            }
            currentGameState.skillEffects.correctStreak++;
        },
        incorrectAnswer: () => {
            // Reset streak on incorrect answer
            currentGameState.skillEffects.correctStreak = 0;
        }
    },
    quickStudy: {
        xpCalculation: (data) => {
            // First 5 questions award 25% more XP
            if (currentGameState.questionNumber <= 5) {
                data.bonusMultiplier *= 1.25;
                showNotification('Quick Study skill activated: +25% XP');
            }
        }
    },
    startingBonus: {
        gameStart: () => {
            // Start with a small XP bonus - consistent with per-question XP (10 per level)
            const bonusXP = 10;
            currentGameState.xpEarned += bonusXP;
            // This XP is not from answering a question
            updateXP(bonusXP, false);
            showNotification(`Starting Bonus skill activated: +${bonusXP} XP`);
        }
    },
    efficientLearner: {
        correctAnswer: (data) => {
            // Track correct answers
            if (!currentGameState.skillEffects.efficientLearnerCounter) {
                currentGameState.skillEffects.efficientLearnerCounter = 0;
            }
            
            currentGameState.skillEffects.efficientLearnerCounter++;
            
            // Every 10th correct answer awards double XP
            if (currentGameState.skillEffects.efficientLearnerCounter % 10 === 0) {
                data.nextQuestionXPMultiplier = 2;
                showNotification('Efficient Learner skill activated: Next question double XP!');
            }
        }
    },
    difficultyBonus: {
        xpCalculation: (data) => {
            // Level 4 and 5 questions award 40% more XP
            if (data.question.difficulty >= 4) {
                data.bonusMultiplier *= 1.4;
                showNotification('Difficulty Bonus skill activated: +40% XP');
            }
        }
    },
    knowledgeRetention: {
        correctAnswer: (data) => {
            // Each question answered correctly increases XP from that universe by 2% (up to 20%)
            const universe = data.question.universe;
            if (!currentGameState.skillEffects.universeBonus) {
                currentGameState.skillEffects.universeBonus = {};
            }
            
            if (!currentGameState.skillEffects.universeBonus[universe]) {
                currentGameState.skillEffects.universeBonus[universe] = 0;
            }
            
            if (currentGameState.skillEffects.universeBonus[universe] < 0.2) {
                currentGameState.skillEffects.universeBonus[universe] += 0.02;
                showNotification(`Knowledge Retention skill activated: +2% XP for ${universe} universe (total: ${Math.round(currentGameState.skillEffects.universeBonus[universe] * 100)}%)`);
            }
        },
        xpCalculation: (data) => {
            // Apply universe-specific XP bonus
            const universe = data.question.universe;
            if (currentGameState.skillEffects.universeBonus && currentGameState.skillEffects.universeBonus[universe]) {
                data.bonusMultiplier *= (1 + currentGameState.skillEffects.universeBonus[universe]);
            }
        }
    },
    experienceSurge: {
        xpCalculation: (data) => {
            // After answering 15 questions in a game, all further questions award 30% more XP
            if (currentGameState.questionNumber > 15) {
                data.bonusMultiplier *= 1.3;
                showNotification('Experience Surge skill activated: +30% XP');
            }
        }
    },
    legacyKnowledge: {
        gameStart: () => {
            // Inherit 5% of XP from previous game
            if (currentGameState.skillEffects.previousGameXP) {
                // Calculate bonus XP but cap it at a reasonable amount
                const bonusXP = Math.min(Math.round(currentGameState.skillEffects.previousGameXP * 0.05), 50);
                if (bonusXP > 0) {
                    // Add XP to in-game counter AND player's persistent total with a single update
                    // This avoids double-counting
                    currentGameState.xpEarned += bonusXP;
                    // This XP is not from answering a question
                    updateXP(bonusXP, false);
                    showNotification(`Legacy Knowledge skill activated: +${bonusXP} XP from previous game`);
                }
            }
        },
        gameEnd: (data) => {
            // Store XP earned for next game
            currentGameState.skillEffects.previousGameXP = currentGameState.xpEarned;
        }
    },
    epicQuest: {
        correctAnswer: (data) => {
            // Defeating level 5 grants double XP for that question
            if (data.question.difficulty === 5) {
                data.xpMultiplier *= 2;
                showNotification('Epic Quest skill activated: Double XP for level 5 question!');
            }
        }
    },
    xpOverflow: {
        gameStart: () => {
            // After winning, earn triple XP for all questions in next game
            if (currentGameState.skillEffects.wonPreviousGame) {
                currentGameState.skillEffects.xpOverflowActive = true;
                showNotification('XP Overflow skill activated: Triple XP for this game!');
            }
        },
        xpCalculation: (data) => {
            // Apply triple XP if active
            if (currentGameState.skillEffects.xpOverflowActive) {
                data.bonusMultiplier *= 3;
            }
        },
        gameWin: () => {
            // Mark that player won for next game
            currentGameState.skillEffects.wonPreviousGame = true;
        }
    }
};

// Activate a skill
function activateSkill(skillId) {
    // Mark skill as used
    currentGameState.usedSkills[skillId] = true;
    
    // Apply skill effect
    switch (skillId) {
        // Branch 1: Survivalist skills - active versions
        case 'healthPotion':
            // Restore 1 life (up to max)
            if (currentGameState.lives < currentGameState.maxLives) {
                currentGameState.lives++;
                updateLivesDisplay();
                showNotification('Health Potion skill activated: +1 life');
            } else {
                showNotification('Health Potion skill activated, but your lives are already at maximum!');
            }
            break;
            
        // Branch 2: Strategic skills - active versions
        case 'fiftyFifty':
            // Mark 50/50 skill as active: the next question display will reduce options to exactly 2 (correct + one incorrect)
            currentGameState.skillEffects.fiftyFiftyActive = true;
            showNotification('50/50 Chance skill activated! Select your answer from two options.');
            // Do NOT call loadNextQuestion(); do not skip or reload the question.
            break;
            
        case 'difficultyBypass':
            // Next question one difficulty level lower
            currentGameState.skillEffects.difficultyBypassActive = true;
            loadNextQuestion();
            showNotification('Difficulty Bypass skill activated: Next question will be easier');
            break;
            
        case 'categoryInsight':
            // Provide a hint about the correct answer
            const hint = getHintForQuestion(currentGameState.currentQuestion);
            showNotification(`Hint: The correct answer is related to ${hint}`);
            break;
            
        case 'timeExtension':
            // Skip question without penalty
            loadNextQuestion();
            showNotification('Time Extension skill activated: Question skipped');
            break;
            
        case 'intuition':
            // Get a second chance on next wrong answer
            currentGameState.skillEffects.intuitionActive = true;
            showNotification('Intuition skill activated: You will get a second chance on your next wrong answer');
            break;
        
        case 'strategicRetreat':
            // Skip current question but drop one difficulty level
            if (currentGameState.currentLevel > 1) {
                currentGameState.currentLevel--;
                updateLevelIndicator();
            }
            loadNextQuestion();
            showNotification('Strategic Retreat skill activated: Question skipped, difficulty lowered');
            break;
            
        // Branch 3: Experience skills - active versions
        case 'universeExpert':
            // Show universe selection dialog
            showUniverseSelectionDialog();
            break;
            
        case 'insightBoost':
            // Next correct answer gives double XP
            currentGameState.skillEffects.insightBoostActive = true;
            showNotification('Insight Boost skill activated: Next correct answer gives double XP');
            break;
            
        case 'knowledgeSurge':
            // Triple XP for next 3 questions
            currentGameState.skillEffects.knowledgeSurgeCounter = 3;
            showNotification('Knowledge Surge skill activated: Triple XP for next 3 questions');
            break;
            
        default:
            console.log('Skill activated:', skillId);
            showNotification(`${skillId} skill activated!`);
    }
    
    // Update active skills UI
    setupActiveSkills();
}

// Get hint for a question (for Category Insight skill)
function getHintForQuestion(question) {
    // More sophisticated hints based on universe
    switch(question.universe) {
        case 'Disney':
            return 'Disney animation and characters';
        case 'Marvel':
            return 'Marvel superheroes and villains';
        case 'StarWars':
            return 'Star Wars galaxy and characters';
        case 'Pixar':
            return 'Pixar animated films and characters';
        case 'Zelda':
            return 'Legend of Zelda games and lore';
        default:
            return question.universe + ' lore';
    }
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

// Find a question by its unique ID
function getQuestionByUniqueId(questionId) {
    // Get all questions
    const allQuestions = getQuestionPool();
    
    // Find question matching the ID
    return allQuestions.find(question => {
        const id = question.questionText + '-' + question.correctAnswer;
        return id === questionId;
    });
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

/**
 * Show universe selection dialog for the universeExpert skill
 */
function showUniverseSelectionDialog() {
    // Get all available universes from questions
    const questions = getQuestionPool();
    const universes = [...new Set(questions.map(q => q.universe))];
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'universe-selection-dialog';
    dialog.innerHTML = `
        <h3>Select Favorite Universe</h3>
        <p>Questions from your selected universe will give 25% more XP.</p>
        <div class="universe-options"></div>
    `;
    
    const optionsContainer = dialog.querySelector('.universe-options');
    
    // Add universe options
    universes.forEach(universe => {
        const button = document.createElement('button');
        button.className = 'universe-option';
        button.textContent = universe;
        button.addEventListener('click', () => {
            // Set selected universe
            currentGameState.skillEffects.favoredUniverse = universe;
            showNotification(`Universe Expert skill activated: ${universe} universe selected (+25% XP)`);
            dialog.remove();
        });
        optionsContainer.appendChild(button);
    });
    
    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        dialog.remove();
        // Don't mark skill as used if cancelled
        delete currentGameState.usedSkills['universeExpert'];
        setupActiveSkills();
    });
    optionsContainer.appendChild(cancelButton);
    
    // Add to game screen
    gameplayScreen.appendChild(dialog);
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
    
    // XP already added during gameplay in calculateXP function
    // Do not add XP again here to prevent double-counting
    
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

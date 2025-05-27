// Questions management module
let questionPool = [];

// List of question files to load
const QUESTION_FILES = [
    'data/questions.json',            // Original questions file
    'data/questions_level1.json',     // Level 1 questions
    'data/questions_level2.json',     // Level 2 questions
    'data/questions_level3.json',     // Level 3 questions
    'data/questions_level4.json',     // Level 4 questions
    'data/questions_level5.json'      // Level 5 questions
];

// Load questions from all JSON files
async function loadQuestions() {
    try {
        questionPool = [];
        let loadedFiles = 0;
        let failedFiles = 0;
        
        // Load each file sequentially
        for (const file of QUESTION_FILES) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const questions = await response.json();
                    questionPool = [...questionPool, ...questions];
                    loadedFiles++;
                    console.log(`Loaded ${questions.length} questions from ${file}`);
                } else {
                    failedFiles++;
                    console.warn(`Failed to load questions from ${file}: ${response.status}`);
                }
            } catch (error) {
                failedFiles++;
                console.warn(`Error loading questions from ${file}:`, error);
            }
        }
        
        console.log(`Loaded ${questionPool.length} questions from ${loadedFiles} files (${failedFiles} files failed to load)`);
        
        // If no files loaded, use fallback questions
        if (questionPool.length === 0) {
            questionPool = getFallbackQuestions();
            console.log(`Using ${questionPool.length} fallback questions`);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error loading questions:', error);
        // Use fallback questions if available
        questionPool = getFallbackQuestions();
        console.log(`Using ${questionPool.length} fallback questions`);
        return false;
    }
}

// Get all available questions
function getQuestionPool() {
    // If questions haven't been loaded yet, load them
    if (questionPool.length === 0) {
        loadQuestions();
    }
    return questionPool;
}

// Get questions filtered by difficulty tier (tier and below)
function getQuestionsByDifficulty(maxTier) {
    // If questions haven't been loaded yet, load them
    if (questionPool.length === 0) {
        loadQuestions();
    }
    
    // Filter questions by difficulty tier
    return questionPool.filter(question => question.difficultyTier <= maxTier);
}

// Get questions filtered by EXACT difficulty tier
function getQuestionsByDifficultyExact(exactTier) {
    // If questions haven't been loaded yet, load them
    if (questionPool.length === 0) {
        loadQuestions();
    }
    
    // Filter questions by exact difficulty tier
    return questionPool.filter(question => question.difficultyTier === exactTier);
}

// Get questions filtered by universe
function getQuestionsByUniverse(universe) {
    // If questions haven't been loaded yet, load them
    if (questionPool.length === 0) {
        loadQuestions();
    }
    
    // Filter questions by universe
    return questionPool.filter(question => question.universe === universe);
}

// Fallback questions in case the JSON file fails to load
function getFallbackQuestions() {
    return [
        {
            questionText: "Mickey Mouse's first appearance was in the 1928 short film 'Steamboat Willie'.",
            questionType: "TrueFalse",
            correctAnswer: "True",
            universe: "Disney",
            difficultyTier: 1
        },
        {
            questionText: "What is the name of Tony Stark's AI assistant in the Iron Man films?",
            questionType: "MultipleChoice",
            options: ["JARVIS", "ALFRED", "FRIDAY", "ULTRON"],
            correctAnswer: "JARVIS",
            universe: "Marvel",
            difficultyTier: 1
        },
        {
            questionText: "Who is Luke Skywalker's father?",
            questionType: "MultipleChoice",
            options: ["Obi-Wan Kenobi", "Darth Vader", "Emperor Palpatine", "Yoda"],
            correctAnswer: "Darth Vader",
            universe: "StarWars",
            difficultyTier: 1
        },
        {
            questionText: "The Disney movie 'Frozen' is based on 'The Snow Queen' by Hans Christian Andersen.",
            questionType: "TrueFalse",
            correctAnswer: "True",
            universe: "Disney",
            difficultyTier: 2
        },
        {
            questionText: "Which Infinity Stone was housed in the Tesseract?",
            questionType: "MultipleChoice",
            options: ["Mind Stone", "Space Stone", "Reality Stone", "Time Stone"],
            correctAnswer: "Space Stone",
            universe: "Marvel",
            difficultyTier: 2
        },
        {
            questionText: "What species is Chewbacca?",
            questionType: "MultipleChoice",
            options: ["Wookiee", "Ewok", "Gungan", "Twi'lek"],
            correctAnswer: "Wookiee",
            universe: "StarWars",
            difficultyTier: 2
        },
        {
            questionText: "Walt Disney's first animated feature film was 'Snow White and the Seven Dwarfs'.",
            questionType: "TrueFalse",
            correctAnswer: "True",
            universe: "Disney",
            difficultyTier: 3
        },
        {
            questionText: "What is the name of Thor's hammer?",
            questionType: "MultipleChoice",
            options: ["Mjolnir", "Stormbreaker", "Gungnir", "Hofund"],
            correctAnswer: "Mjolnir",
            universe: "Marvel",
            difficultyTier: 3
        },
        {
            questionText: "Which planet was destroyed by the Death Star in 'Star Wars: A New Hope'?",
            questionType: "MultipleChoice",
            options: ["Tatooine", "Alderaan", "Naboo", "Hoth"],
            correctAnswer: "Alderaan",
            universe: "StarWars",
            difficultyTier: 3
        },
        {
            questionText: "The original voice of Mickey Mouse was Walt Disney himself.",
            questionType: "TrueFalse",
            correctAnswer: "True",
            universe: "Disney",
            difficultyTier: 4
        },
        {
            questionText: "Which of these characters was NOT snapped away by Thanos in 'Avengers: Infinity War'?",
            questionType: "MultipleChoice",
            options: ["Black Panther", "Doctor Strange", "Rocket", "Spider-Man"],
            correctAnswer: "Rocket",
            universe: "Marvel",
            difficultyTier: 4
        },
        {
            questionText: "Who was the Jedi that first discovered Anakin Skywalker on Tatooine?",
            questionType: "MultipleChoice",
            options: ["Obi-Wan Kenobi", "Qui-Gon Jinn", "Mace Windu", "Yoda"],
            correctAnswer: "Qui-Gon Jinn",
            universe: "StarWars",
            difficultyTier: 4
        },
        {
            questionText: "The song 'Let It Go' from Frozen was originally written for a villain.",
            questionType: "TrueFalse",
            correctAnswer: "True",
            universe: "Disney",
            difficultyTier: 5
        },
        {
            questionText: "In which year was the first Iron Man movie released, launching the Marvel Cinematic Universe?",
            questionType: "MultipleChoice",
            options: ["2005", "2008", "2010", "2012"],
            correctAnswer: "2008",
            universe: "Marvel",
            difficultyTier: 5
        },
        {
            questionText: "What is the name of the planet where Yoda went into exile?",
            questionType: "MultipleChoice",
            options: ["Dagobah", "Mustafar", "Kashyyyk", "Coruscant"],
            correctAnswer: "Dagobah",
            universe: "StarWars",
            difficultyTier: 5
        }
    ];
}

// Initialize the module (pre-load questions)
loadQuestions();

// Export functions for use in other modules
export { 
    loadQuestions, 
    getQuestionPool, 
    getQuestionsByDifficulty, 
    getQuestionsByDifficultyExact,
    getQuestionsByUniverse 
};

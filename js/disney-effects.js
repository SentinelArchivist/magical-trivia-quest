// Disney Magical Effects
document.addEventListener('DOMContentLoaded', function() {
    // Add pixie dust effect on mouse movement
    createPixieDustEffect();
    
    // Add magical transitions between screens
    enhanceScreenTransitions();
    
    // Apply Disney font styling to all headings
    applyDisneyFontStyling();
});

// Create pixie dust effect that follows the mouse
function createPixieDustEffect() {
    const body = document.body;
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        // Only create particles occasionally
        if (Math.random() < 0.1) {
            createPixieDustParticle(lastMouseX, lastMouseY);
        }
    });
    
    // Create pixie dust on button clicks
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', (e) => {
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    createPixieDustParticle(
                        e.target.offsetLeft + Math.random() * e.target.offsetWidth,
                        e.target.offsetTop + Math.random() * e.target.offsetHeight
                    );
                }, i * 50);
            }
        });
    });
    
    // Create a pixie dust particle
    function createPixieDustParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'pixie-dust';
        
        // Set random size
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Set random color
        const colors = ['#ffd54f', '#4b6de8', '#7171e8', '#e74c3c', '#4eb84e'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Set position
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        // Set random movement
        const tx = (Math.random() - 0.5) * 100;
        const ty = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        // Add to body
        document.body.appendChild(particle);
        
        // Trigger animation
        setTimeout(() => {
            particle.style.animation = 'pixie-dust 1s forwards';
            
            // Remove after animation
            setTimeout(() => {
                document.body.removeChild(particle);
            }, 1000);
        }, 10);
    }
}

// Enhance screen transitions with magical effects
function enhanceScreenTransitions() {
    // The original showScreen function is in app.js, we'll add a class for animation
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(screen => {
        screen.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && screen.classList.contains('active')) {
                screen.classList.add('magical-appear');
                
                // Create sparkle effects inside the screen
                for (let i = 0; i < 5; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.style.left = `${Math.random() * 100}%`;
                    sparkle.style.top = `${Math.random() * 100}%`;
                    sparkle.style.animationDelay = `${Math.random() * 2}s`;
                    
                    screen.appendChild(sparkle);
                    
                    // Remove after animation
                    setTimeout(() => {
                        screen.removeChild(sparkle);
                    }, 4000);
                }
            }
        });
    });
}

// Apply Disney font styling to headings
function applyDisneyFontStyling() {
    // Add styling to all headings
    const headings = document.querySelectorAll('h2, h3');
    
    headings.forEach(heading => {
        if (!heading.classList.contains('disney-font')) {
            heading.classList.add('disney-font');
        }
    });
}

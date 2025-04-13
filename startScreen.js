// Animation variables
let titleSize = 120;
let titlePulse = 0;
let bgParticles = [];
const NUM_PARTICLES = 100;

const symbols = ['0', '1', '#', '%', '&', '*', '+', '?', '!', '^', '~', '>', '<', '=', '|', '/', '\\', '(', ')', '{', '}', '[', ']', ':', ';'];

let startButton = { x: 400, y: 400, width: 200, height: 60 };
let glitchTimer = 0;
let glitchActive = false;
let driftOffsetX = 0;
let driftOffsetY = 0;

// Button properties
// Initialize particles for background animation
function setupStartScreen() {
    // Create background particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
        bgParticles.push({
            x: random(width),
            y: random(height),
            size: random(12, 24), // Bigger for legibility
            speedX: random(-0.5, 0.5),
            speedY: random(-0.5, 0.5),
            char: random(symbols),
            color: color(
                random(50, 100),
                random(100, 170),
                random(150, 255),
                random(100, 200)
            )
        });
    }

    startButton = { x: width / 2 - 200, y: height * 3 / 4 - 40, width: 400, height: 60 };
}


// Draw the start screen
function drawStartScreen() {
    // Gradient background
    background(20, 25, 40);

    // Handle glitch timing
    if (frameCount % 80 === 0 && random() < 0.6) {
        glitchActive = true;
        glitchTimer = 10; // glitch lasts ~10 frames
    }

    if (glitchTimer > 0) {
        glitchTimer--;
    } else {
        glitchActive = false;
    }

    // Draw animated particles
    updateAndDrawParticles();

    // Draw title with pulsing effect
    titlePulse += 0.05;
    let pulseSize = titleSize + sin(titlePulse) * 3;

    textAlign(LEFT, CENTER);
    textSize(pulseSize);

    // Shadow for text
    const baseText = "CONTROL FLOW ";
    if (glitchActive) {
        glitchText = baseText.split('').map(ch => {
            return random() < 0.3 ? String.fromCharCode(33 + floor(random(94))) : ch;
        }).join('');
    } else {
        // Occasionally show blinking cursor
        glitchText = (Math.floor(frameCount / 30) % 2 === 0) ? "CONTROL FLOW_" : baseText;
    }

    // Slowly drifting shadow position
    driftOffsetX = sin(frameCount * 0.01) * 2;
    driftOffsetY = cos(frameCount * 0.01) * 2;

    fill(0, 0, 80, 100);
    textAlign(LEFT, CENTER);
    textSize(pulseSize);
    text(glitchText, width / 2 - textWidth(glitchText) / 2 + driftOffsetX, 200 + driftOffsetY);

    // Draw gradient text centered by offsetting by half its width
    drawGradientText(glitchText, width / 2 - textWidth(glitchText) / 2, 200, glitchActive);


    // Subtitle
    textSize(20);
    fill(180, 210, 255);
    text("Master the Art of Programming", width / 2, 270);

    // Draw decorative code brackets
    drawCodeBrackets();

    // Start button
    drawButton(startButton, ">> START()", isMouseOver(startButton), glitchActive);

    // Version info
    textSize(12);
    textAlign(RIGHT, BOTTOM);
    fill(150);
    text("v1.0.0", width - 20, height - 20);

    // Reset text alignment
    textAlign(LEFT, BASELINE);
}

// Update and draw background particles
function updateAndDrawParticles() {
    for (let particle of bgParticles) {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen edges
        if (particle.x < -3 * particle.size) particle.x = width;
        if (particle.x > width + 3 * particle.size) particle.x = 0;
        if (particle.y < -3 * particle.size) particle.y = height;
        if (particle.y > height + 3 * particle.size) particle.y = 0;

        // scale particle size when further from center
        let distFromCenter = dist(particle.x, particle.y, width / 2, height / 2);
        let maxDist = dist(width / 2, height / 2, 0, 0);
        let scaleFactor = map(distFromCenter, 0, maxDist, 0.1, 3);
        let size = particle.size * scaleFactor;
        // Draw particle
        noStroke();
        fill(particle.color);
        // ellipse(particle.x, particle.y, particle.size);
        textSize(size);
        fill(particle.color);

        text(particle.char, particle.x, particle.y);

        if (glitchActive) {
            particle.char = random(symbols)
        }
    }
}

// Draw title with gradient effect
function drawGradientText(txt, x, y, glitch = false) {
    let colors = [
        color(60, 120, 255),  // Blue
        color(100, 180, 255), // Light Blue
        color(140, 200, 255)  // Cyan
    ];

    push();
    textAlign(LEFT, CENTER);

    for (let i = 0; i < colors.length; i++) {
        let amt = i / (colors.length - 1);
        let yOffset = -10 + 10 * amt;

        // Slight horizontal offset if glitching
        let xOffset = glitch ? random(-3, 3) : 0;

        fill(colors[i]);
        text(txt, x + xOffset, y + yOffset);
    }

    // Add glow or glitchy outline
    if (glitch) {
        drawingContext.shadowBlur = 150;
        fill(random(200, 255), random(50, 150), 255);
        text(txt, x + random(-2, 2), y + random(-2, 2));
    } else {
        drawingContext.shadowBlur = 250;
        drawingContext.shadowColor = color(100, 180, 255, 150);
        fill(200, 230, 255);
        text(txt, x, y);
        drawingContext.shadowBlur = 0;
    }

    pop();
}


// Draw decorative code brackets
function drawCodeBrackets() {
    textSize(100);
    fill(80, 100, 150, 100);
    text("{", 200, height / 4 * 3);
    text("}", width - 200, height / 4 * 3);

    // Draw control flow symbols
    // textSize(24);
    // fill(60, 100, 150);
    // text("if()", 200, 300);
    // text("while()", width - 250, 300);
    // text("for()", 180, 400);
    // text("switch()", width - 230, 400);
}

// Helper function to draw a button
function drawButton(btn, label, isHovered, glitch) {
    // Button shadow
    if (glitch) {
        fill(random(200, 255), random(50, 150), 255);
    } else {
        fill(20, 20, 40, 150);
    }
    rect(btn.x + 5, btn.y + 5, btn.width, btn.height, 8);

    // Button background
    if (isHovered) {
        // Gradient when hovered
        const gradient = drawingContext.createLinearGradient(
            btn.x, btn.y,
            btn.x + btn.width, btn.y + btn.height
        );
        gradient.addColorStop(0, color(80, 120, 200));
        gradient.addColorStop(1, color(60, 80, 180));
        drawingContext.fillStyle = gradient;
    } else {
        fill(60, 80, 160);
    }

    rect(btn.x, btn.y, btn.width, btn.height, 8);

    // Button border
    if (isHovered) {
        strokeWeight(6);
        stroke(150, 200, 255);
    } else {
        strokeWeight(4);
        stroke(100, 150, 200);
    }
    rect(btn.x, btn.y, btn.width, btn.height, 8);

    // Button text
    noStroke();
    if (glitch) {
        fill(random(200, 255), random(50, 150), 255);
    } else {
        if (isHovered) {
            fill(255);
        } else {
            fill(220);
        }
    }
    textAlign(CENTER, CENTER);
    textSize(24);
    text(label, btn.x + btn.width / 2, btn.y + btn.height / 2);
}

// Check if mouse is over a button
function isMouseOver(btn) {
    return mouseX > btn.x &&
        mouseX < btn.x + btn.width &&
        mouseY > btn.y &&
        mouseY < btn.y + btn.height;
}

// Modified mousePressed function
function handleStartMousePress() {
    if (isMouseOver(startButton)) {
        // gameplay setup
        // Initialize problem manager with default problems
        problemManager = ProblemManager.setProblems();

        // Load or create user
        currentUser = User.load() || new User('user1', 'Player 1');

        // shop = Shop.initializeDefaultShop();
        setupShopSystem()

        const firstProblem = problemManager.getProblem(problemManager.problemOrder[0]);
        loadNextProblem(firstProblem);


        currentState = "GAMEPLAY";
        return;
    }
}
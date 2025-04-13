// Animation variables
let titleSize = 60;
let titlePulse = 0;
let bgParticles = [];
const NUM_PARTICLES = 50;
let startButton = { x: 400, y: 400, width: 200, height: 60 };
// Button properties
// Initialize particles for background animation
function setupStartScreen() {
    // Create background particles
    for (let i = 0; i < NUM_PARTICLES; i++) {
        bgParticles.push({
            x: random(width),
            y: random(height),
            size: random(3, 8),
            speedX: random(-0.5, 0.5),
            speedY: random(-0.5, 0.5),
            color: color(
                random(50, 100),
                random(100, 170),
                random(150, 255),
                random(100, 200)
            )
        });
    }
}


// Draw the start screen
function drawStartScreen() {
    // Gradient background
    background(20, 25, 40);

    // Draw animated particles
    updateAndDrawParticles();

    // Draw title with pulsing effect
    titlePulse += 0.05;
    let pulseSize = titleSize + sin(titlePulse) * 5;

    textAlign(CENTER, CENTER);
    textSize(pulseSize);

    // Shadow for text
    fill(0, 0, 80, 100);
    text("CONTROL FLOW", width / 2 + 5, 150 + 5);

    // Main title with gradient
    drawGradientText("CONTROL FLOW", width / 2, 150);

    // Subtitle
    textSize(20);
    fill(180, 210, 255);
    text("Master the Art of Programming", width / 2, 220);

    // Draw decorative code brackets
    drawCodeBrackets();

    // Start button
    drawButton(startButton, "START", isMouseOver(startButton));

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
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Draw particle
        noStroke();
        fill(particle.color);
        ellipse(particle.x, particle.y, particle.size);
    }
}

// Draw title with gradient effect
function drawGradientText(txt, x, y) {
    let colors = [
        color(60, 120, 255),  // Blue
        color(100, 180, 255), // Light Blue
        color(140, 200, 255)  // Cyan
    ];

    // Create gradient effect manually
    push();
    textAlign(CENTER, CENTER);

    for (let i = 0; i < colors.length; i++) {
        let amt = i / (colors.length - 1);
        let yOffset = -10 + 10 * amt;

        fill(colors[i]);
        text(txt, x, y + yOffset); // Using txt parameter instead of text
    }

    // Add glow effect
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(100, 180, 255, 150);
    fill(200, 230, 255);
    text(txt, x, y); // Using txt parameter instead of text
    drawingContext.shadowBlur = 0;

    pop();
}

// Draw decorative code brackets
function drawCodeBrackets() {
    textSize(80);
    fill(80, 100, 150, 100);
    text("{", 150, height / 2);
    text("}", width - 150, height / 2);

    // Draw control flow symbols
    textSize(24);
    fill(60, 100, 150);
    text("if()", 200, 300);
    text("while()", width - 250, 300);
    text("for()", 180, 400);
    text("switch()", width - 230, 400);
}

// Helper function to draw a button
function drawButton(btn, label, isHovered) {
    // Button shadow
    fill(20, 20, 40, 150);
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
        strokeWeight(2);
        stroke(150, 200, 255);
    } else {
        strokeWeight(1);
        stroke(100, 150, 200);
    }
    rect(btn.x, btn.y, btn.width, btn.height, 8);

    // Button text
    noStroke();
    if (isHovered) {
        fill(255);
    } else {
        fill(220);
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
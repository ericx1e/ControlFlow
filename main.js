const NUM_LINES = 40;
const LINE_HEIGHT = 52;
const CODE_X = 100;
const CODE_Y_START = 130;
const TITLE_Y_START = 25;
const CODE_WIDTH = 900;
const SIDEBAR_X = CODE_X + CODE_WIDTH + 50; // Dont really need this lol
const SIDEBAR_BLOCK_SPACING = 80;
const BUTTON_WIDTH = 80;
const BUTTON_HEIGHT = 30;
const BUTTON_Y_START = 500;
const BUTTON_SPACING_Y = 40;
const SHOP_Y_START = 700

let currentState = "START_SCREEN"; // or "GAMEPLAY"

let blocks = []; // Array of length NUM_LINES to hold blocks, Null if empty
let allBlocks = [];
let draggingBlock = null;
let ghostIndex = -1;
let compoundHover = null;
let title = ""
let desc = ""
let target = 0
let showPopup = false;
let popupType = ""; // "success" or "failure"
let popupTimer = 0;
let popupDuration = 2000; // milliseconds for failure popup
let shopRefreshCost = 2; // Cost to refresh the shop
let allPossibleItems = []; // Will hold all possible shop items
let shopSize = 3; // Number of items shown in the shop at once
let shopItems = [];
let playerCoins = 0;
let problemNumber = 1
let loseSound;
let successSound;
let selectSound;
let clickSound;
let glitchSound;
let coinSound;
let backgroundMusic;
let played = false

let transitionActive = false;
let transitionType = ""; // "fade", "problem", etc.
let transitionProgress = 0;
let transitionDuration = 30; // frames
let transitionCallback = null;
let transitionStartTime = 0;

let cursorTrail = []; // holds { x, y, char, alpha, size }
const cursorSymbols = ['x', '+', '-', '=', '*', '/', '0', '1', '!', '(', ')', '<', '>'];

// Function to start a transition
function startTransition(type, callback) {
    transitionActive = true;
    transitionType = type;
    transitionProgress = 0;
    transitionCallback = callback;
    transitionStartTime = millis();
}

function drawTransitionOverlay() {
    let alpha;

    if (transitionType === "fade") {
        // Simple fade transition (0 -> 255 -> 0)
        alpha = transitionProgress < 0.5
            ? map(transitionProgress, 0, 0.5, 0, 255)
            : map(transitionProgress, 0.5, 1, 255, 0);

        // Draw semi-transparent overlay
        fill(0, alpha);
        noStroke();
        rect(0, 0, width, height);
    }
    else if (transitionType === "problem") {
        // Problem transition - slide in and out
        alpha = transitionProgress < 0.5
            ? map(transitionProgress, 0, 0.5, 0, 220)
            : map(transitionProgress, 0.5, 1, 220, 0);

        // Draw overlay with gradient
        noStroke();
        fill(20, 30, 50, alpha);
        rect(0, 0, width, height);

        // Add some visual flair - animated code lines
        stroke(60, 120, 200, alpha * 0.3);
        strokeWeight(2);

        for (let i = 0; i < 15; i++) {
            const y = (height / 15) * i;
            const xOffset = sin(frameCount * 0.05 + i * 0.5) * 100;
            const lineLength = map(noise(i * 0.1, frameCount * 0.01), 0, 1, width * 0.3, width * 0.7);

            line(xOffset, y, xOffset + lineLength, y);
        }
    }
}

function preload() {
    loseSound = loadSound('sounds/vine-boom.mp3');
    successSound = loadSound('sounds/success.mp3');
    clickSound = loadSound('sounds/buttonsound.mp3');
    selectSound = loadSound('sounds/select.mp3');
    glitchSound = loadSound('sounds/glitch.mp3');
    coinSound = loadSound('sounds/coin.mp3');
    backgroundMusic = loadSound('sounds/music.mp3');
}
// Function to generate a new random shop
function refreshShop() {
    // Mark all currently displayed items as not purchased for now
    // (alternatively, you could save purchased state if you want)
    shopItems = [];

    // Create a pool of items that aren't already in player's inventory
    let availableItems = allPossibleItems.filter(item =>
        !currentUser.purchasedItems?.includes(item.id)
    );

    // If we don't have enough items, add some that are already purchased
    // but mark them as purchased
    if (availableItems.length < shopSize) {
        const purchasedItems = allPossibleItems.filter(item =>
            currentUser.purchasedItems?.includes(item.id)
        ).map(item => ({ ...item, purchased: true }));

        // Fill remaining slots with purchased items
        while (availableItems.length + shopItems.length < shopSize && purchasedItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * purchasedItems.length);
            shopItems.push(purchasedItems[randomIndex]);
            purchasedItems.splice(randomIndex, 1);
        }
    }

    // Weight selection by rarity
    const rarityWeights = {
        'common': 75,
        'uncommon': 20,
        'rare': 5
    };

    // Select random items based on rarity weights until we have enough
    while (shopItems.length < shopSize && availableItems.length > 0) {
        // Decide which rarity to pick
        const rand = Math.random() * 100;
        let targetRarity;

        if (rand < rarityWeights.common) {
            targetRarity = 'common';
        } else if (rand < rarityWeights.common + rarityWeights.uncommon) {
            targetRarity = 'uncommon';
        } else {
            targetRarity = 'rare';
        }

        // Get items of that rarity
        const itemsOfRarity = availableItems.filter(item => item.rarity === targetRarity);

        if (itemsOfRarity.length > 0) {
            // Pick a random item of the chosen rarity
            const randomIndex = Math.floor(Math.random() * itemsOfRarity.length);
            const selectedItem = itemsOfRarity[randomIndex];

            // Add to shop and remove from available pool
            shopItems.push({ ...selectedItem, purchased: false });
            availableItems = availableItems.filter(item => item.id !== selectedItem.id);
        } else {
            // If no items of the target rarity, just pick any available item
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const selectedItem = availableItems[randomIndex];

            shopItems.push({ ...selectedItem, purchased: false });
            availableItems = availableItems.filter(item => item.id !== selectedItem.id);
        }
    }
}

function setup() {
    let canvas = createCanvas(1440, 900);
    canvas.position(0, 0);
    textSize(16);
    textFont('monospace');
    backgroundMusic.setVolume(0.5);
    backgroundMusic.loop();
    noCursor();

    setupStartScreen();
}

// Modified draw function to use the game state
function draw() {
    if (transitionActive) {
        // Update transition progress
        const elapsedTime = millis() - transitionStartTime;
        transitionProgress = min(1, elapsedTime / (transitionDuration * 16.67)); // Convert frames to milliseconds (assuming 60fps)

        // Execute callback at halfway point (when screen is fully obscured)
        if (transitionProgress >= 0.5 && transitionCallback) {
            transitionCallback();
            transitionCallback = null;
        }

        // End transition when complete
        if (transitionProgress >= 1) {
            transitionActive = false;
        }
    }

    switch (currentState) {
        case "START_SCREEN":
            drawStartScreen();
            break;
        case "GAMEPLAY":
            background(30);
            drawCodeLines();
            drawTarget();
            drawSidebar();
            drawBlocks();
            drawShop();

            if (draggingBlock) {
                draggingBlock.x = mouseX + draggingBlock.offsetX;
                draggingBlock.y = mouseY + draggingBlock.offsetY;
                draggingBlock.draw(true);
            }

            drawPopup()

            if (popupParticles.length > 0) {
                for (let i = popupParticles.length - 1; i >= 0; i--) {
                    let p = popupParticles[i];
                    p.update();
                    p.draw();
                    if (!p.isAlive()) popupParticles.splice(i, 1);
                }
            }
            break;
    }
    if (transitionActive) {
        drawTransitionOverlay();
    }

    // Limit total trail length
    // if (cursorTrail.length > 10) cursorTrail.shift();

    // // Draw the trail
    // for (let i = 0; i < cursorTrail.length; i++) {
    //     let p = cursorTrail[i];
    //     let baseColor = mouseIsPressed
    //         ? color(80, 170, 200, p.alpha)   // Click color (e.g., pink-red)
    //         : color(100, 255, 200, p.alpha);  // Default color (e.g., green-cyan)

    //     fill(baseColor);
    //     textSize(p.size);
    //     textAlign(CENTER, CENTER);
    //     text(p.char, p.x, p.y);
    //     p.alpha -= 25; // fade out
    //     // p.size--;
    // }
    push();
    // Cursor follows mouse
    translate(mouseX, mouseY);

    let baseColor = mouseIsPressed
        ? color(80, 170, 200)   // Click color (e.g., pink-red)
        : color(100, 255, 200);  // Default color (e.g., green-cyan)

    // Glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(100, 255, 200, 200);

    // Cursor shape (stylized arrow or caret)
    fill(baseColor);
    noStroke();
    beginShape();
    vertex(0, 0);
    vertex(12, 6);
    vertex(6, 12);
    vertex(0, 0);
    endShape(CLOSE);

    pop();
}

// function mouseMoved() {
//     if (pmouseX - mouseX + pmouseY - mouseY > 2) {
//         cursorTrail.push({
//             x: mouseX,
//             y: mouseY,
//             char: random(cursorSymbols),
//             alpha: 255,
//             size: random(7, 13)
//         });
//     }
// }

// function mouseDragged() {
//     mouseMoved();
// }

function drawCodeLines() {
    // Constants for the shifted layout - all scaled by 1.5x
    const LINE_NUMBER_WIDTH = 90; // Scaled up from 60
    const CODE_AREA_START = 0; // Scaled up from 5
    const CODE_CONTENT_START = CODE_X;

    // Code area background with a subtle gradient
    noStroke();
    fill(35, 40, 55); // Base color
    rect(CODE_AREA_START, CODE_Y_START - 60, CODE_WIDTH + 135, NUM_LINES * LINE_HEIGHT + 90, 12); // Scaled up from 40, 90, 60, 8

    // Add a subtle inner shadow at the top
    fill(25, 30, 45, 100);
    rect(CODE_AREA_START, CODE_Y_START - 60, CODE_WIDTH + 135, 18, 12, 12, 0, 0); // Scaled up from 40, 90, 12, 8, 8

    // Line number area with different background
    fill(30, 35, 50);
    rect(CODE_AREA_START, CODE_Y_START - 60, LINE_NUMBER_WIDTH, NUM_LINES * LINE_HEIGHT + 90, 12, 0, 0, 12); // Scaled up from 40, 60, 8, 8

    // Add a small heading for the function
    fill(80, 180, 255);
    textSize(24); // Scaled up from 16
    textStyle(BOLD);
    textAlign(LEFT, BASELINE);
    text("function solution()", CODE_AREA_START + LINE_NUMBER_WIDTH + 15, CODE_Y_START - 15); // Scaled up from 10, 10
    textStyle(NORMAL);

    // Vertical separator line between line numbers and code
    stroke(60, 70, 90);
    strokeWeight(3); // Scaled up from 2
    line(CODE_AREA_START + LINE_NUMBER_WIDTH, CODE_Y_START - 45, CODE_AREA_START + LINE_NUMBER_WIDTH, CODE_Y_START + NUM_LINES * LINE_HEIGHT + 15); // Scaled up from 30, 10
    noStroke();

    ghostIndex = -1;
    compoundHover = null;

    let currentY = CODE_Y_START;
    let currentLine = 0;

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (!block) continue;
        let span = block.getHeightInLines();

        // Set block position - adjust to new layout
        // block.x = CODE_CONTENT_START;
        // block.y = currentY;

        // Compound hover highlight
        if (block instanceof CompoundBlock && block.canAcceptChild(mouseX, mouseY)) {
            compoundHover = findDeepestCompoundHover(blocks, mouseX, mouseY);
            ghostIndex = -1;
        } else if (ghostIndex === -1 && block.contains(mouseX, mouseY) && !block.isLocked) {
            if (draggingBlock instanceof HeaderBlock) {
                if (blocks[i] instanceof CompoundBlock && blocks[i].canAcceptHeader(mouseX, mouseY, draggingBlock)) {
                    ghostIndex = i;
                }
            } else {
                ghostIndex = i;
            }
        }

        // Draw line numbers with improved styling
        stroke(100);
        fill(160, 180, 220);
        textSize(19.5); // Scaled up from 13

        for (let j = 0; j < span; j++) {
            // Draw line itself with subtle alternating background
            if ((currentLine % 2) === 0) {
                noStroke();
                fill(40, 45, 60, 90);
                rect(CODE_CONTENT_START, currentY + j * LINE_HEIGHT, CODE_WIDTH, LINE_HEIGHT);
            }

            // Draw horizontal separator lines (thinner and more subtle)
            stroke(60, 70, 90, 50);
            strokeWeight(1.5); // Scaled up from 1
            line(CODE_AREA_START, currentY + j * LINE_HEIGHT, CODE_CONTENT_START + CODE_WIDTH, currentY + j * LINE_HEIGHT);

            // Draw line numbers with better alignment
            noStroke();
            fill(150, 160, 190);
            textAlign(RIGHT);
            textSize(19.5);
            text(`${currentLine + 1}`, CODE_AREA_START + LINE_NUMBER_WIDTH - 7.5, currentY + j * LINE_HEIGHT + 27); // Scaled up from 5, 18
            textAlign(LEFT);
            currentLine++;
        }

        block.x = lerp(block.x, CODE_CONTENT_START, 0.1);
        block.y = lerp(block.y, currentY, 0.1);
        block.draw();

        currentY += LINE_HEIGHT * span;
    }

    // One more line for the last block
    // stroke(60, 70, 90, 150);
    // strokeWeight(1.5); // Scaled up from 1
    // fill(150, 160, 190);
    // if (blocks.length > 0) {
    //     line(CODE_AREA_START, currentY, CODE_CONTENT_START + CODE_WIDTH, currentY);
    //     noStroke();
    //     textAlign(RIGHT);
    //     text(`${currentLine + 1}`, CODE_AREA_START + LINE_NUMBER_WIDTH - 7.5, currentY + 27); // Scaled up from 5, 18
    //     textAlign(LEFT);
    // }

    // Add subtle grid markers on empty lines
    // stroke(60, 70, 90, 80);
    // strokeWeight(1.5); // Scaled up from 1
    // for (let i = currentLine; i < NUM_LINES; i++) {
    //     // Alternating background for empty lines
    //     if ((i % 2) === 0) {
    //         noStroke();
    //         fill(40, 45, 60, 90);
    //         rect(CODE_CONTENT_START, CODE_Y_START + i * LINE_HEIGHT, CODE_WIDTH, LINE_HEIGHT);
    //     }

    //     // Grid lines
    //     stroke(60, 70, 90, 80);
    //     line(CODE_AREA_START, CODE_Y_START + i * LINE_HEIGHT, CODE_CONTENT_START + CODE_WIDTH, CODE_Y_START + i * LINE_HEIGHT);

    //     // Line numbers for empty lines
    //     noStroke();
    //     fill(110, 120, 150); // Dimmer color for empty lines
    //     textAlign(RIGHT);
    //     text(`${i + 1}`, CODE_AREA_START + LINE_NUMBER_WIDTH - 7.5, CODE_Y_START + i * LINE_HEIGHT + 27); // Scaled up from 5, 18
    //     textAlign(LEFT);
    // }

    // Draw ghost block placement indicator
    if (ghostIndex === -1 && draggingBlock && !(draggingBlock instanceof HeaderBlock)) {
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i] === null) {
                ghostIndex = i;
                break;
            } else {
                i += blocks[i].getHeightInLines() - 1; // Increment by lines block spans
            }
        }
    }

    // Reset styling
    noStroke();
    textSize(24); // Scaled up from 16
}

function findDeepestCompoundHover(blockList, mx, my) {
    for (let block of blockList) {
        if (!block) continue;

        if (block instanceof CompoundBlock) {
            // Check nested children first
            const nested = block instanceof IfElseBlock
                ? findDeepestCompoundHover([...block.ifSection.children, ...block.elseSection.children], mx, my)
                : findDeepestCompoundHover(block.children, mx, my);

            if (nested) return nested;

            if (block.canAcceptChild(mx, my)) {
                return block;
            }
        }
    }
    return null;
}

function drawSidebar() {
    // Constants for sidebar layout
    const SIDEBAR_WIDTH = width - CODE_X - CODE_WIDTH;
    const SIDEBAR_PADDING = 25;
    const SECTION_MARGIN = 15;
    const BLOCK_MARGIN = 10;
    const HEADER_SIZE = 22;
    const SIDEBAR_TITLE_Y = 35;

    // Sidebar background with subtle gradient
    noStroke();
    fill(40, 42, 58);
    rect(CODE_X + CODE_WIDTH, 0, SIDEBAR_WIDTH, height);

    // Add a subtle top header bar
    fill(30, 32, 48);
    rect(CODE_X + CODE_WIDTH, 0, SIDEBAR_WIDTH, 60);

    // Title with icon
    fill(255);
    textSize(HEADER_SIZE);
    textAlign(LEFT, CENTER);
    text("🧩 Available Blocks", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, SIDEBAR_TITLE_Y);
    textSize(16);

    // Divider line
    // stroke(70, 72, 88);
    // strokeWeight(2);
    // line(
    //     CODE_X + CODE_WIDTH + SIDEBAR_PADDING,
    //     SIDEBAR_TITLE_Y + SECTION_MARGIN,
    //     width - SIDEBAR_PADDING,
    //     SIDEBAR_TITLE_Y + SECTION_MARGIN
    // );
    noStroke();

    // Footer section with helpful info
    const footerY = height - 80;

    // Footer background
    fill(30, 32, 48);
    rect(CODE_X + CODE_WIDTH, footerY, SIDEBAR_WIDTH, 80);

    // Footer content
    fill(160, 160, 190);
    textSize(14);
    text("Drag blocks into your code →", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, footerY + 25);
    text("Drag into compound blocks to nest", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, footerY + 45);
    text("Hit run when you are confident in your solution!", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, footerY + 65);

    // Reset alignment
    textAlign(LEFT, BASELINE);
}

// Refresh button
const refreshButtonY = SHOP_Y_START + 10;
const refreshButtonWidth = 200;
const refreshButtonHeight = 30;
const SHOP_WIDTH = 800;
const refreshButtonX = SHOP_WIDTH / 2 - refreshButtonWidth / 2;


// define run button location to be right of the shop
const runButtonY = 800;
const runButtonWidth = 120;
const runButtonHeight = 50;
const runButtonX = (SHOP_WIDTH + CODE_X + CODE_WIDTH) / 2 - runButtonWidth / 2;


// Draw shop items in a grid
const itemsPerRow = 3;
// const itemWidth = 210;
const itemHeight = 130;
const padding = 15;
const itemWidth = (SHOP_WIDTH - 2 * padding - (itemsPerRow - 1) * padding) / 3;

// Update drawShop to include the refresh button
function drawShop() {
    noStroke();

    // Drop shadow
    fill(30, 30, 30, 150);
    rect(0 + 5, SHOP_Y_START + 5, SHOP_WIDTH, height - SHOP_Y_START - 2, 10);
    // Shop background
    fill(40, 40, 50);
    rect(0, SHOP_Y_START, SHOP_WIDTH, height - SHOP_Y_START);

    // Shop header
    fill(60, 60, 70);
    rect(0, SHOP_Y_START, SHOP_WIDTH, 50, 10, 10, 0, 0);

    fill(255);
    textSize(24);
    text("SHOP", 20, SHOP_Y_START + 35);

    // Show coins
    fill(255, 215, 0);
    textAlign(RIGHT);
    text(`${playerCoins} coins`, SHOP_WIDTH - 20, SHOP_Y_START + 35);
    textAlign(LEFT);

    // Close button
    // const closeButtonX = 650;
    // const closeButtonY = SHOP_Y_START + 10;
    // const closeButtonSize = 30;

    // fill(80, 60, 60);
    // if (mouseX > closeButtonX && mouseX < closeButtonX + closeButtonSize &&
    //     mouseY > closeButtonY && mouseY < closeButtonY + closeButtonSize) {
    //     fill(120, 60, 60); // Highlight on hover
    // }
    // rect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, 5);

    // fill(255);
    // textAlign(CENTER, CENTER);
    // text("X", closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2);
    // textAlign(LEFT, BASELINE);

    // Button shadow
    fill(30, 30, 30, 150);
    rect(refreshButtonX + 2, refreshButtonY + 2, refreshButtonWidth, refreshButtonHeight, 5);

    // Button background
    if (playerCoins >= shopRefreshCost) {
        fill(80, 120, 160);
        if (mouseX > refreshButtonX && mouseX < refreshButtonX + refreshButtonWidth &&
            mouseY > refreshButtonY && mouseY < refreshButtonY + refreshButtonHeight) {
            fill(100, 150, 200); // Highlight on hover
        }
    } else {
        fill(80, 80, 80); // Disabled
    }
    rect(refreshButtonX, refreshButtonY, refreshButtonWidth, refreshButtonHeight, 5);

    // Button text
    fill(255);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(`Refresh    `, refreshButtonX + 20, refreshButtonY + refreshButtonHeight / 2);
    fill(255, 215, 0);
    textAlign(RIGHT, CENTER);
    text(shopRefreshCost + ' coins', refreshButtonX + refreshButtonWidth - 20, refreshButtonY + refreshButtonHeight / 2);
    textAlign(LEFT, BASELINE);

    for (let i = 0; i < shopItems.length; i++) {
        const item = shopItems[i];
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;

        const x = padding + col * (itemWidth + padding);
        const y = SHOP_Y_START + 60 + row * (itemHeight + padding);

        // Item background based on rarity
        if (item.purchased) {
            fill(70, 100, 70); // Green tint for purchased items
        } else if (playerCoins >= item.price) {
            // Use color based on rarity
            if (item.rarity === 'rare') {
                fill(90, 60, 120); // Purple for rare
            } else if (item.rarity === 'uncommon') {
                fill(60, 80, 120); // Blue for uncommon
            } else {
                fill(60, 60, 80); // Grey-blue for common
            }
        } else {
            fill(60, 60, 60); // Can't afford
        }
        rect(x, y, itemWidth, itemHeight, 8);

        // Rarity indicator
        if (!item.purchased) {
            if (item.rarity === 'rare') {
                fill(200, 120, 255);
                text("★★★", x + itemWidth - 50, y + 20);
            } else if (item.rarity === 'uncommon') {
                fill(120, 180, 255);
                text("★★", x + itemWidth - 40, y + 20);
            } else {
                fill(180, 180, 180);
                text("★", x + itemWidth - 20, y + 20);
            }
        }

        // Item name
        fill(255);
        textSize(18);
        text(item.name, x + 10, y + 25);

        // Item description
        textSize(14);
        fill(200);
        text(item.description, x + 10, y + 50, itemWidth - 20, 40);

        // Price or purchased status
        if (item.purchased) {
            fill(120, 255, 120);
            text("Purchased", x + 10, y + itemHeight - 15);
        } else {
            fill(255, 215, 0);
            text(`${item.price} coins`, x + 10, y + itemHeight - 15);

            // Buy button
            const buttonWidth = 60;
            const buttonHeight = 30;
            const buttonX = x + itemWidth - buttonWidth - 10;
            const buttonY = y + itemHeight - buttonHeight - 10;

            // Button shadow
            fill(30, 30, 30, 150);
            rect(buttonX + 2, buttonY + 2, buttonWidth, buttonHeight, 5);

            // Button background
            if (playerCoins >= item.price) {
                fill(100, 100, 170);
                if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
                    mouseY > buttonY && mouseY < buttonY + buttonHeight) {
                    fill(120, 120, 200); // Highlight on hover
                    if (mouseIsPressed) {
                        fill(80, 80, 150); // Darker when pressed
                    }
                }
            } else {
                fill(60, 60, 60); // Can't afford
            }

            // Item name
            fill(255);
            textSize(18);
            text(item.name, x + 10, y + 25);

            // Item description
            textSize(14);
            fill(200);
            text(item.description, x + 10, y + 50, itemWidth - 20, 40);

            // Price or purchased status
            if (item.purchased) {
                fill(120, 255, 120);
                text("Purchased", x + 10, y + itemHeight - 15);
            } else {
                fill(255, 215, 0);
                text(`${item.price} coins`, x + 10, y + itemHeight - 15);

                // Buy button
                // const buttonWidth = 60;
                // const buttonHeight = 30;
                // const buttonX = x + itemWidth - buttonWidth - 10;
                // const buttonY = y + itemHeight - buttonHeight - 10;

                // Button shadow
                fill(30, 30, 30, 150);
                rect(buttonX + 2, buttonY + 2, buttonWidth, buttonHeight, 5);

                // Button background
                if (playerCoins >= item.price) {
                    fill(100, 100, 170);
                    if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
                        mouseY > buttonY && mouseY < buttonY + buttonHeight) {
                        fill(120, 120, 200); // Highlight on hover
                        if (mouseIsPressed) {
                            fill(80, 80, 150); // Darker when pressed
                        }
                    }
                } else {
                    fill(80, 80, 80); // Disabled
                }
                rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

                // Button text
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("Buy", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
                textAlign(LEFT, BASELINE);
            }
        }
        // draw run button
        // Button shadow
        fill(10, 10, 10, 150);
        rect(runButtonX + 5, runButtonY + 5, runButtonWidth, runButtonHeight, 10);
        // Highlight on hover
        fill(80, 200, 140);
        if (mouseX > runButtonX && mouseX < runButtonX + runButtonWidth &&
            mouseY > runButtonY && mouseY < runButtonY + runButtonHeight) {
            fill(100, 220, 160); // Highlight on hover
        }
        rect(runButtonX, runButtonY, runButtonWidth, runButtonHeight, 10);

        // Button text
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("▶ Run", runButtonX + runButtonWidth / 2, runButtonY + runButtonHeight / 2);
        textAlign(LEFT, BASELINE);
    }
}

function drawTarget() {
    // Create a header background
    textAlign(LEFT, TOP);
    fill(50, 55, 80);
    rect(0, 0, width, TITLE_Y_START + 60);

    // Add some visual flair - subtle gradient or line
    fill(40, 45, 70);
    rect(0, TITLE_Y_START + 58, width, 4);

    // Draw problem title with improved styling
    fill(255);
    textSize(24);
    text("Level " + problemNumber + ": " + title, CODE_X, TITLE_Y_START - 5);

    // Draw target value info with more prominence
    textSize(20);
    fill(255, 220, 150);
    text(`Target: x = ${target}`, CODE_X, TITLE_Y_START + 30);

    // Add description if available
    if (desc) {
        textSize(14);
        fill(200, 200, 200);
        text(desc, CODE_X + 500, TITLE_Y_START - 5, 400, 40);
    }

    // Reset text size
    textSize(16);
}

function drawBlocks() {
    for (let block of allBlocks) {
        if (block) block.draw();
    }

    // Handle ghost indicators for compound blocks
    if (compoundHover && draggingBlock) {
        fill(255, 255, 100, 50);
        stroke(255, 255, 0, 100 + 80 * sin(frameCount * 0.1));
        strokeWeight(2);

        if (compoundHover instanceof IfElseBlock) {
            // Determine if mouse is hovering over if or else section
            const ifTop = compoundHover.ifSection.y;
            const ifHeight = compoundHover.ifSection.getHeightInLines() * LINE_HEIGHT + 10;
            const elseTop = compoundHover.elseSection.y;
            const elseHeight = compoundHover.elseSection.getHeightInLines() * LINE_HEIGHT + 10;

            if (mouseY > ifTop && mouseY < ifTop + ifHeight) {
                // Pulsing effect for if section
                rect(compoundHover.ifSection.x, ifTop, 240, ifHeight, 6);
            } else if (mouseY > elseTop && mouseY < elseTop + elseHeight) {
                // Pulsing effect for else section
                rect(compoundHover.elseSection.x, elseTop, 240, elseHeight, 6);
            }
        } else {
            // Regular compound block highlight with pulsing effect
            rect(
                compoundHover.x + 20,
                compoundHover.y + compoundHover.h,
                compoundHover.w - 40,
                (compoundHover.getHeightInLines() - 1) * LINE_HEIGHT + 10,
                6
            );
        }
        noStroke();
    }
    // Handle ghost indicators for header insertion
    else if (draggingBlock instanceof HeaderBlock && ghostIndex !== -1) {
        const targetBlock = blocks[ghostIndex];
        if (targetBlock instanceof CompoundBlock && targetBlock.canAcceptHeader(mouseX, mouseY, draggingBlock)) {
            // Highlight header insertion area
            stroke(100, 200, 255);
            strokeWeight(2);
            fill(100, 200, 255, 40);

            // Calculate where the header would go based on the type of header
            let headerX = targetBlock.x;
            if (targetBlock instanceof ForLoopBlock) {
                // Determine which part of the for loop to highlight
                if (draggingBlock instanceof InitBlock) {
                    headerX += textWidth("for (") + 10;
                } else if (draggingBlock instanceof ConditionBlock) {
                    const init = targetBlock.getHeaderBlock(InitBlock);
                    headerX += textWidth("for (") + 10;
                    if (init) headerX += init.w + textWidth(";") + 5;
                    else headerX += textWidth("?;") + 5;
                } else if (draggingBlock instanceof IncBlock) {
                    const init = targetBlock.getHeaderBlock(InitBlock);
                    const cond = targetBlock.getHeaderBlock(ConditionBlock);
                    headerX += textWidth("for (") + 10;
                    if (init) headerX += init.w + textWidth(";") + 5;
                    else headerX += textWidth("?;") + 5;
                    if (cond) headerX += cond.w + textWidth(";") + 5;
                    else headerX += textWidth("?;") + 5;
                }
            } else {
                // For other compound blocks like While or IfElse
                headerX += textWidth(targetBlock instanceof WhileBlock ? "while (" : "if (") + 10;
            }

            // Pulsing effect for header
            const pulseAmount = sin(frameCount * 0.1) * 0.5 + 0.5;
            strokeWeight(2 + pulseAmount * 2);
            rect(headerX, targetBlock.y + 2, draggingBlock.w, draggingBlock.h, 5);
            strokeWeight(1);
            noStroke();
        }
    }
    // Handle ghost indicators for line insertion 
    else if (ghostIndex !== -1 && mouseX < CODE_X + CODE_WIDTH && mouseY < CODE_Y_START + NUM_LINES * LINE_HEIGHT && draggingBlock) {
        let gy = CODE_Y_START + ghostIndex * LINE_HEIGHT;

        // Add basic ghost background
        noStroke();
        fill(255, 255, 255, 50);
        rect(CODE_X, gy, draggingBlock.w, draggingBlock.h, 5);

        // Add a pulsing effect
        const pulseAmount = sin(frameCount * 0.1) * 0.5 + 0.5;
        stroke(100, 200, 255, 150 * pulseAmount);
        strokeWeight(2);
        noFill();
        rect(CODE_X, gy, draggingBlock.w, draggingBlock.h, 5);

        // Add "insert here" indicator
        // fill(100, 200, 255, 150);
        // noStroke();
        // beginShape();
        // const arrowX = CODE_X - 15;
        // const arrowY = gy + draggingBlock.h / 2;
        // vertex(arrowX, arrowY - 10);
        // vertex(arrowX + 12, arrowY);
        // vertex(arrowX, arrowY + 10);
        // endShape(CLOSE);
    }
}

// Modify findDeepestCompoundHover to provide a more accurate hover target
function findDeepestCompoundHover(blockList, mx, my) {
    // Track the deepest valid hover target
    let deepestHover = null;
    let deepestLevel = -1;
    let currentLevel = 0;

    // Helper function to search recursively through nested structures
    function searchBlocks(blocks, level) {
        for (let block of blocks) {
            if (!block) continue;

            if (block instanceof CompoundBlock) {
                // First check if this compound block accepts the child
                if (block.canAcceptChild(mx, my)) {
                    // If it's deeper than our current target, update
                    if (level > deepestLevel) {
                        deepestLevel = level;
                        deepestHover = block;
                    }
                }

                // Then check children recursively
                if (block instanceof IfElseBlock) {
                    searchBlocks([...block.ifSection.children, ...block.elseSection.children], level + 1);
                } else {
                    searchBlocks(block.children, level + 1);
                }
            }
        }
    }

    // Start the search
    searchBlocks(blockList, 0);
    return deepestHover;
}


// Modify mousePressed to properly handle headers in nested compound blocks
function findCompoundBlockContaining(targetBlock, blockList) {
    for (let block of blockList) {
        if (!block) continue;

        // If this is a compound block, check its headers first
        if (block instanceof CompoundBlock) {
            for (let [key, headerBlock] of Object.entries(block.header)) {
                if (headerBlock === targetBlock) {
                    return block;
                }
            }

            // If it's an if-else block, check both sections
            if (block instanceof IfElseBlock) {
                if (block.ifSection.children.includes(targetBlock) ||
                    block.elseSection.children.includes(targetBlock)) {
                    return block;
                }

                // Recursively check deeper in if section
                const ifResult = findCompoundBlockContaining(targetBlock, block.ifSection.children);
                if (ifResult) return ifResult;

                // Recursively check deeper in else section
                const elseResult = findCompoundBlockContaining(targetBlock, block.elseSection.children);
                if (elseResult) return elseResult;
            }
            // Regular compound block
            else if (block.children) {
                if (block.children.includes(targetBlock)) {
                    return block;
                }

                // Recursively check children
                const result = findCompoundBlockContaining(targetBlock, block.children);
                if (result) return result;
            }
        }
    }

    return null;
}

function mouseReleased() {
    if (!draggingBlock) return;

    // Check for compound block drop targets
    if (compoundHover && draggingBlock && !(draggingBlock instanceof HeaderBlock)) {
        compoundHover.addChild(draggingBlock);
        draggingBlock = null;
        clickSound.play();
        return;
    }

    // Handle header insertion for both top-level and nested compound blocks
    if (draggingBlock instanceof HeaderBlock) {
        // First check at the top level
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block instanceof CompoundBlock && block.canAcceptHeader(mouseX, mouseY, draggingBlock)) {
                block.acceptHeader(draggingBlock);
                draggingBlock = null;
                clickSound.play();
                return;
            }
        }

        // Then check for nested compound blocks in a recursive manner
        const findAndAttachToNestedCompound = (blockList) => {
            for (let block of blockList) {
                if (!block) continue;

                if (block instanceof CompoundBlock && block.canAcceptHeader(mouseX, mouseY, draggingBlock)) {
                    block.acceptHeader(draggingBlock);
                    draggingBlock = null;
                    clickSound.play();
                    return true;
                }

                // If this is a compound block, check its children recursively
                if (block instanceof CompoundBlock) {
                    if (block instanceof IfElseBlock) {
                        // Check both sections
                        if (findAndAttachToNestedCompound(block.ifSection.children)) return true;
                        if (findAndAttachToNestedCompound(block.elseSection.children)) return true;
                    } else if (block.children) {
                        if (findAndAttachToNestedCompound(block.children)) return true;
                    }
                }
            }
            return false;
        };

        // Search through all blocks recursively
        if (findAndAttachToNestedCompound(blocks)) {
            return; // Successfully attached to a nested compound block
        }
    }

    // The rest of your existing mouseReleased code for other cases
    if (ghostIndex !== -1 && mouseX < CODE_X + CODE_WIDTH && mouseY < CODE_Y_START + NUM_LINES * LINE_HEIGHT) {
        if (!(draggingBlock instanceof HeaderBlock)) {
            blocks.splice(ghostIndex, 0, draggingBlock);
            blocks = blocks.slice(0, NUM_LINES);
            shiftBlocksUp();
        }
        clickSound.play();
    } else {
        // Drop in sidebar if not placed in code area
        if (!allBlocks.includes(draggingBlock)) {
            allBlocks.push(draggingBlock);
        }
    }

    draggingBlock = null;
}

// Add this function to draw the popup
let popupButtonX = 1440 / 2 - 75;
let popupButtonY = 0;
let popupButtonWidth = 150;
let popupButtonHeight = 50;

function drawPopup() {
    if (!showPopup) return;

    // Overlay background
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    // Popup container
    let popupWidth = 400;
    let popupHeight = popupType === "success" ? 250 : 150;
    let popupX = width / 2 - popupWidth / 2;
    let popupY = height / 2 - popupHeight / 2;
    popupButtonY = popupY + 150;

    // Shadow
    fill(30, 30, 30, 200);
    rect(popupX + 5, popupY + 5, popupWidth, popupHeight, 10);

    // Main popup
    if (popupType === "success") {
        fill(70, 120, 60); // Green for success
    } else {
        fill(150, 60, 60); // Red for failure
    }
    rect(popupX, popupY, popupWidth, popupHeight, 10);

    // Text
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);

    if (popupType === "success") {
        text("Level Complete!", width / 2, popupY + 50);

        // Next level button
        // let popupButtonX = width / 2 - 75;
        // let popupButtonY = popupY + 150;
        // let popupButtonWidth = 150;
        // let popupButtonHeight = 50;

        // Button shadow
        fill(30, 30, 30, 200);
        rect(popupButtonX + 3, popupButtonY + 3, popupButtonWidth, popupButtonHeight, 5);

        // Button background
        fill(100, 170, 80);
        if (mouseX > popupButtonX && mouseX < popupButtonX + popupButtonWidth &&
            mouseY > popupButtonY && mouseY < popupButtonY + popupButtonHeight) {
            fill(120, 200, 100); // Highlight on hover
            if (mouseIsPressed) {
                fill(80, 140, 60); // Darker when pressed
            }
        }
        rect(popupButtonX, popupButtonY, popupButtonWidth, popupButtonHeight, 5);

        // Button text
        fill(255);
        textSize(18);
        text("Next Level", width / 2, popupButtonY + 25);
        fill(255, 215, 0);
        text("+" + coinsEarnedThisRound + " coins (+1 interest per 5)", width / 2, popupY + 100);
    } else {
        text("You Lose!!", width / 2, popupY + 75);

        // Auto-hide failure popup after duration
        if (millis() - popupTimer > popupDuration) {
            problemManager = ProblemManager.setProblems();
            const firstProblem = problemManager.getProblem(problemManager.problemOrder[0]);
            loadNextProblem(firstProblem);
            // currentUser.currentProblem = problemManager.problemOrder[0]
            // console.log(currentUser.currentProblem)
            // loadNextProblem(problemManager.getProblem(currentUser.currentProblem));
            problemNumber = 1
            refreshShop();
            playerCoins = 0
            showPopup = false;
        }
    }

    // Reset text alignment for other text
    textAlign(LEFT, BASELINE);
    textSize(16);
}

function mousePressed() {
    switch (currentState) {
        case "START_SCREEN":
            handleStartMousePress();
        case "GAMEPLAY":
            // Your existing gameplay mousePressed logic
            handleGamePlayMousePress();
            break;
    }
}

function handleGamePlayMousePress() {
    // Check if clicking on the next level button in success popup
    if (showPopup && popupType === "success") {
        // let popupButtonX = width / 2 - 75;
        // let popupButtonY = height / 2 - 200 / 2 + 100;
        // let popupButtonWidth = 150;
        // let popupButtonHeight = 50;

        if (mouseX > popupButtonX && mouseX < popupButtonX + popupButtonWidth &&
            mouseY > popupButtonY && mouseY < popupButtonY + popupButtonHeight) {
            // Hide popup and load next level
            showPopup = false;
            const nextProblem = problemManager.getNextProblem(currentUser.currentProblem);
            if (nextProblem) {
                loadNextProblem(nextProblem);
                problemNumber += 1
                selectSound.play();
            } else {
                console.log("Congratulations! You've completed all problems!");
                // Could show a game completion popup here
            }
            return; // Return early to prevent other interactions while popup is active
        }
    }

    // Only allow other interactions if popup is not showing
    if (showPopup) return;

    // Handle shop refresh button
    if (mouseX > refreshButtonX && mouseX < refreshButtonX + refreshButtonWidth &&
        mouseY > refreshButtonY && mouseY < refreshButtonY + refreshButtonHeight &&
        playerCoins >= shopRefreshCost) {
        // Subtract the refresh cost
        playerCoins -= shopRefreshCost;
        currentUser.coins = playerCoins;
        currentUser.save();

        // Generate new shop items
        refreshShop();
        coinSound.play();
        return;
    }

    for (let i = 0; i < shopItems.length; i++) {
        const item = shopItems[i];
        if (item.purchased) continue; // Skip purchased items

        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;

        const x = padding + col * (itemWidth + padding);
        const y = SHOP_Y_START + 60 + row * (itemHeight + padding);

        const buttonWidth = 60;
        const buttonHeight = 30;
        const buttonX = x + itemWidth - buttonWidth - 10;
        const buttonY = y + itemHeight - buttonHeight - 10;

        if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && mouseY < buttonY + buttonHeight &&
            playerCoins >= item.price) {

            // Purchase the item
            playerCoins -= item.price;
            item.purchased = true;

            // Add the block to available blocks
            const newBlock = item.block();
            // give new block random position in sidebar
            newBlock.x = random(CODE_X + CODE_WIDTH + 50, width - 50);
            newBlock.y = random(100, height - 150);
            allBlocks.push(newBlock);

            // Save the purchase to user data
            // currentUser.purchasedItems = currentUser.purchasedItems || [];
            // currentUser.purchasedItems.push(item.id);
            // currentUser.coins = playerCoins;
            // currentUser.save();

            // selectSound.play();
            coinSound.play();
            return;
        }
    }

    // check if run button is pressed
    if (mouseX > runButtonX && mouseX < runButtonX + runButtonWidth &&
        mouseY > runButtonY && mouseY < runButtonY + runButtonHeight) {
        selectSound.play();
        runCode();
    }

    const targetBlock = findBlockAt(mouseX, mouseY, blocks.concat(allBlocks));

    if (targetBlock && !targetBlock.isLocked) {
        draggingBlock = targetBlock;
        draggingBlock.offsetX = targetBlock.x - mouseX;
        draggingBlock.offsetY = targetBlock.y - mouseY;
        selectSound.play();
        promoteBlock(draggingBlock);
        removeBlock(draggingBlock);
    }
}

// Call this function when setting up your game
function setupShopSystem() {
    // Initialize the full pool of possible items
    initializeItemPool();

    // Generate the initial shop items
    refreshShop();

    // Add a shop button to your buttons
    // This is already handled in the updated mousePressed function
}

// Update findBlockAt to handle headers in nested blocks
function findBlockAt(mx, my, blockList) {
    for (let i = blockList.length - 1; i >= 0; i--) {
        let block = blockList[i];
        if (!block) continue;

        if (block instanceof CompoundBlock) {
            // Check headers
            for (let key in block.header) {
                let h = block.header[key];
                if (h && h.contains(mx, my)) return h;
            }

            // If this is an if-else block, check both sections
            if (block instanceof IfElseBlock) {
                // Check if section children
                const ifResult = findBlockAt(mx, my, block.ifSection.children);
                if (ifResult) return ifResult;

                // Check else section children
                const elseResult = findBlockAt(mx, my, block.elseSection.children);
                if (elseResult) return elseResult;
            }
            // Regular compound block
            else if (block.children) {
                // Check children
                const childResult = findBlockAt(mx, my, block.children);
                if (childResult) return childResult;
            }
        }

        // Check the block itself
        if (block.contains(mx, my)) return block;
    }

    return null;
}

// Bring targetBlock to top of its layer
function promoteBlock(block) {
    // allBlocks
    const idx1 = allBlocks.indexOf(block);
    if (idx1 !== -1) {
        allBlocks.splice(idx1, 1);
        allBlocks.push(block);
        return;
    }

    // top-level blocks[]
    const idx2 = blocks.indexOf(block);
    if (idx2 !== -1) {
        blocks.splice(idx2, 1);
        blocks.push(block);
        return;
    }

    // children of compound blocks
    for (let b of blocks) {
        if (b instanceof CompoundBlock) {
            // children
            const list = b instanceof IfElseBlock
                ? [...b.ifSection.children, ...b.elseSection.children]
                : b.children;

            const idx = list.indexOf(block);
            if (idx !== -1) {
                list.splice(idx, 1);
                list.push(block);
                return;
            }

            // header
            for (let [key, headerBlock] of Object.entries(b.header)) {
                if (headerBlock === block) {
                    delete b.header[key];
                    b.header[key] = block; // re-add to end
                    return;
                }
            }
        }
    }
}

function shiftBlocksUp() {
    const newBlocks = [];
    for (let b of blocks) {
        if (b) {
            newBlocks.push(b);
            const span = b.getHeightInLines();
            for (let i = 1; i < span; i++) newBlocks.push(null);
        }
    }
    while (newBlocks.length < NUM_LINES) newBlocks.push(null);
    blocks = newBlocks.slice(0, NUM_LINES);
}

function removeBlock(target) {
    // Remove from top-level function blocks
    const idx = blocks.indexOf(target);
    if (idx !== -1) {
        blocks.splice(idx, 1);
        shiftBlocksUp();
        return;
    }

    for (let block of blocks) {
        if (block instanceof CompoundBlock) {
            for (let [key, headerBlock] of Object.entries(block.header)) {
                if (headerBlock === target) {
                    delete block.header[key];
                    return;
                }
            }
        }
    }

    // Search recursively through all compound blocks
    for (let block of blocks) {
        if (recursiveRemove(target, block)) return;
    }

    // If not found, check allBlocks

    // If the block is a child or header of a sidebar compound block
    for (let block of allBlocks) {
        if (block instanceof CompoundBlock) {
            // Check headers
            for (let [key, headerBlock] of Object.entries(block.header)) {
                if (headerBlock === target) {
                    // Remove the reference but preserve the block
                    delete block.header[key];

                    // Add as standalone block if not already being handled by draggingBlock
                    if (!draggingBlock || draggingBlock !== target) {
                        // This should not happen normally, but just in case
                        allBlocks.push(target);
                    }
                    return;
                }
            }

            // Check children for IfElseBlock
            if (block instanceof IfElseBlock) {
                const ifIdx = block.ifSection.children.indexOf(target);
                if (ifIdx !== -1) {
                    block.ifSection.children.splice(ifIdx, 1);

                    // Add as standalone block if not already being handled by draggingBlock
                    if (!draggingBlock || draggingBlock !== target) {
                        // This should not happen normally, but just in case
                        allBlocks.push(target);
                    }
                    return;
                }

                const elseIdx = block.elseSection.children.indexOf(target);
                if (elseIdx !== -1) {
                    block.elseSection.children.splice(elseIdx, 1);

                    // Add as standalone block if not already being handled by draggingBlock
                    if (!draggingBlock || draggingBlock !== target) {
                        // This should not happen normally, but just in case
                        allBlocks.push(target);
                    }
                    return;
                }
            }
            // Check children for other compound blocks
            else if (block.children) {
                const childIdx = block.children.indexOf(target);
                if (childIdx !== -1) {
                    block.children.splice(childIdx, 1);

                    // Add as standalone block if not already being handled by draggingBlock
                    if (!draggingBlock || draggingBlock !== target) {
                        // This should not happen normally, but just in case
                        allBlocks.push(target);
                    }
                    return;
                }
            }
        }
    }
}

function recursiveRemove(target, parentBlock) {
    if (!(parentBlock instanceof CompoundBlock)) return false;

    // Check for header blocks first
    for (let [key, headerBlock] of Object.entries(parentBlock.header)) {
        if (headerBlock === target) {
            delete parentBlock.header[key];
            return true;
        }
    }

    // Handle different children containers based on block type
    const childContainers = parentBlock instanceof IfElseBlock
        ? [parentBlock.ifSection.children, parentBlock.elseSection.children]
        : [parentBlock.children];

    // Check each child container
    for (let container of childContainers) {
        const idx = container.indexOf(target);
        if (idx !== -1) {
            container.splice(idx, 1);
            return true;
        }

        // Recursively check children that are compound blocks
        for (let child of container) {
            if (child instanceof CompoundBlock) {
                if (recursiveRemove(target, child)) {
                    return true;
                }
            }
        }
    }

    return false;
}

/*
function recursiveRemove(target, parentBlock) {
    if (!(parentBlock instanceof CompoundBlock)) return false;

    const children = parentBlock instanceof IfElseBlock
        ? [parentBlock.ifSection.children, parentBlock.elseSection.children]
        : [parentBlock.children];

    for (let [key, block] of Object.entries(parentBlock.header)) {
        if (block === target) {
            delete parentBlock.header[key];
            return true;
        }
    }

    for (let list of children) {
        const idx = list.indexOf(target);
        if (idx !== -1) {
            list.splice(idx, 1);
            return true;
        }

        // Check deeper nesting
        for (let child of list) {
            if (recursiveRemove(target, child)) return true;
        }
    }

    return false;
}
*/

function flattenBlocks(arr) {
    return arr.reduce((flat, b) => {
        if (b instanceof CompoundBlock) {
            return flat.concat(b, b.children);
        } else {
            return b ? flat.concat(b) : flat;
        }
    }, []);
}

let coinsEarnedThisRound = 0;
let popupParticles = [];

class PopupParticle {
    constructor(x, y, isGood) {
        this.x = x;
        this.y = y;
        this.vx = random(-5, 5);
        this.vy = random(-8, -2);
        this.alpha = 255;
        this.size = random(10, 20);
        this.color = color(random(180, 255), random(180, 255), random(50, 150));
        this.isGood = isGood;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.alpha -= 2;
    }

    draw() {
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.alpha);
        // ellipse(this.x, this.y, this.size);
        textSize(this.size);
        textAlign(CENTER, CENTER);
        if (this.isGood) {
            text('🤩', this.x, this.y);
        } else {
            text('😭', this.x, this.y);
        }
    }

    isAlive() {
        return this.alpha > 0;
    }
}


function runCode() {
    const problem = problemManager.getProblem(currentUser.currentProblem);
    const result = currentUser.submitSolution(blocks, problem);

    console.log("Final x:", result.result);

    if (result.isCorrect) {
        // Handle problem completion
        console.log("Problem solved!");
        showPopup = true;
        popupType = "success";
        coinsEarnedThisRound = 5 + Math.floor(playerCoins / 5);
        successSound.play()

        // Trigger burst of particles
        for (let i = 0; i < 60; i++) {
            popupParticles.push(new PopupParticle(width / 2, height / 2, true));
        }

        // Save progress
        // currentUser.save();

        // Offer to move to the next problem
        // const nextProblem = problemManager.getNextProblem(currentUser.currentProblem);
        // if (nextProblem) {
        //     // TODO: Show completion dialog and offer next problem
        //     loadShop();
        //     loadNextProblem(nextProblem);
        // } else {
        //     // TODO: Show game completion
        //     console.log("Congratulations! You've completed all problems!");
        // }
    } else {
        showPopup = true;
        popupType = "failure";
        popupTimer = millis(); // Start timer for auto-hide
        console.log(`Attempt ${result.attemptsMade}: Not quite right. Try again!`);
        // Trigger burst of particles
        for (let i = 0; i < 60; i++) {
            popupParticles.push(new PopupParticle(width / 2, height / 2, false));
        }
        loseSound.play();
    }
}

function loadNextProblem(nextProblem, transition = true) {
    function load() {
        // Start the next problem
        const gameState = currentUser.startProblem(nextProblem);

        // Reset blocks array
        blocks = [];
        let firstBlock = new CodeBlock("let x = " + gameState.problem.initialValue + ";", CODE_X, CODE_Y_START, true)
        blocks.push(firstBlock);

        // Update available blocks
        allBlocks = gameState.availableBlocks;

        title = gameState.problem.title;
        desc = gameState.problem.description;
        target = gameState.problem.targetValue;

        // Fill the rest with nulls
        while (blocks.length < NUM_LINES) {
            blocks.push(null);
        }

        // Make sure blocks are properly arranged
        shiftBlocksUp();
        refreshShop();

        // Gain 10 gold, extra 1 per 5 interest
        playerCoins += 5 + Math.floor(playerCoins / 5);
    }

    if (transition) {
        startTransition("problem", function () {
            load();
        });
    } else {
        load();
    }
}

// Function to load the shop between problems
function loadShop() {
    let contents = shop.contents;
    console.log(contents['forblock']);
    // Insert code to draw shop
}

function saveLayout() {
    const layout = blocks.map(b => b ? b.serialize() : null);
    // localStorage.setItem("codeLayout", JSON.stringify(layout));
    // console.log("Layout saved.");
    return JSON.stringify(layout);
}

function loadLayout() {
    const saved = JSON.parse(localStorage.getItem("codeLayout"));
    if (saved) {
        blocks = saved.map(item => deserialize(item));
        shiftBlocksUp();
        console.log("Layout loaded.");
    }
}

// Utility function for factorial block
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

function keyPressed() {
    if (key == 'm') {
        // mute music
        console.log(backgroundMusic)
        if (backgroundMusic.isPlaying()) {
            backgroundMusic.stop();
        } else {
            backgroundMusic.play();
        }
    }
}
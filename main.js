// p5.js Game: Balatro-inspired Code Roguelike
// Features: Drag-and-drop code blocks, Compound loops, Dynamic layout, Save/load, Interpreter
// import { Problem, User, ProblemManager } from './states.js';

const NUM_LINES = 40;
const LINE_HEIGHT = 35;
const CODE_X = 100;
const CODE_Y_START = 100;
const TITLE_Y_START = 50
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
let shopRefreshCost = 3; // Cost to refresh the shop
let allPossibleItems = []; // Will hold all possible shop items
let shopSize = 3; // Number of items shown in the shop at once
let shopItems = [];
let playerCoins = 0;
let problemNumber = 1

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

    setupStartScreen();
}

// Modified draw function to use the game state
function draw() {
    switch (currentState) {
        case "START_SCREEN":
            drawStartScreen();
            break;
        case "GAMEPLAY":
            background(30);
            drawCodeLines();
            drawSidebar();
            drawBlocks();
            drawTarget();
            drawShop();

            if (draggingBlock) {
                draggingBlock.x = mouseX + draggingBlock.offsetX;
                draggingBlock.y = mouseY + draggingBlock.offsetY;
                draggingBlock.draw(true);
            }

            drawPopup()
            break;
    }
}

function drawCodeLines() {
    fill(255);
    textSize(16);
    text("Function: f(x)", CODE_X, CODE_Y_START - 10);

    noFill();
    stroke(255);

    ghostIndex = -1;
    compoundHover = null;

    let currentY = CODE_Y_START;
    let currentLine = 0;

    // for (let i = blocks.length - 1; i >= 0; i--) { // Iterate backwards to draw overlapping blocks properly
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (!block) continue;
        let span = block.getHeightInLines();

        // Set block position
        block.x = CODE_X;
        block.y = currentY;
        block.draw();

        // Compound hover highlight
        if (block instanceof CompoundBlock && block.canAcceptChild(mouseX, mouseY)) {
            // compoundHover = block;
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

        // Draw line numbers for span
        stroke(100);
        fill(100);
        for (let j = 0; j < span; j++) {
            line(40, currentY + j * LINE_HEIGHT, CODE_X + CODE_WIDTH, currentY + j * LINE_HEIGHT);
            noStroke();
            text(`${currentLine + 1}:`, 50, currentY + j * LINE_HEIGHT - 10);
            currentLine++;
        }

        currentY += LINE_HEIGHT * span;
    }
    // One more line for the last block
    stroke(100);
    fill(100);
    if (blocks.length > 0) {
        line(40, currentY, CODE_X + CODE_WIDTH, currentY);
        noStroke();
        text(`${currentLine + 1}:`, 50, currentY - 10);
    }

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
    const SIDEBAR_PADDING = 20;
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
    stroke(70, 72, 88);
    strokeWeight(2);
    line(
        CODE_X + CODE_WIDTH + SIDEBAR_PADDING,
        SIDEBAR_TITLE_Y + SECTION_MARGIN,
        width - SIDEBAR_PADDING,
        SIDEBAR_TITLE_Y + SECTION_MARGIN
    );
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
    text("Drag compound blocks to nest them", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, footerY + 45);
    text("Right-click to see block details", CODE_X + CODE_WIDTH + SIDEBAR_PADDING, footerY + 65);

    // Reset alignment
    textAlign(LEFT, BASELINE);
}

// Refresh button
const refreshButtonY = SHOP_Y_START + 10;
const refreshButtonWidth = 110;
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
    // Shop background
    fill(40, 40, 50);
    rect(0, SHOP_Y_START, SHOP_WIDTH, height - SHOP_Y_START);

    // Shop header
    fill(60, 60, 70);
    rect(0, SHOP_Y_START, SHOP_WIDTH, 50);

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
    textAlign(CENTER, CENTER);
    text(`Refresh   `, refreshButtonX + refreshButtonWidth / 2, refreshButtonY + refreshButtonHeight / 2);
    fill(255, 215, 0);
    text(shopRefreshCost, refreshButtonX + refreshButtonWidth - 20, refreshButtonY + refreshButtonHeight / 2);
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


    // Draw problem title
    fill(255);
    textSize(20);
    text("Level " + problemNumber + ": " + title, CODE_X, TITLE_Y_START - 15);


    // Draw target value info
    textSize(20);
    fill(255, 220, 150);
    text(`Target: ${target}`, CODE_X, TITLE_Y_START + 10);

    // Reset text size
    textSize(16);
}

function drawBlocks() {
    for (let block of allBlocks) {
        if (block) block.draw();
    }
    if (compoundHover && draggingBlock) {
        fill(255, 255, 0, 50);

        if (compoundHover instanceof IfElseBlock) {
            // Determine if mouse is hovering over if or else section
            const ifTop = compoundHover.ifSection.y;
            const ifHeight = compoundHover.ifSection.getHeightInLines() * LINE_HEIGHT + 10;
            const elseTop = compoundHover.elseSection.y;
            const elseHeight = compoundHover.elseSection.getHeightInLines() * LINE_HEIGHT + 10;

            if (mouseY > ifTop && mouseY < ifTop + ifHeight) {
                rect(compoundHover.ifSection.x, ifTop, 240, ifHeight, 6);
            } else if (mouseY > elseTop && mouseY < elseTop + elseHeight) {
                rect(compoundHover.elseSection.x, elseTop, 240, elseHeight, 6);
            }
        } else {
            rect(
                compoundHover.x + 20,
                compoundHover.y + compoundHover.h,
                compoundHover.w - 40,
                (compoundHover.getHeightInLines() - 1) * LINE_HEIGHT + 10,
                6
            );
        }
    } else if (ghostIndex !== -1 && mouseX < CODE_X + CODE_WIDTH && mouseY < CODE_Y_START + NUM_LINES * LINE_HEIGHT && draggingBlock) {
        let gy = CODE_Y_START + ghostIndex * LINE_HEIGHT;
        noStroke();
        fill(255, 255, 255, 50);
        rect(CODE_X, gy, 300, 30);
    }
}

// Add this function to draw the popup
function drawPopup() {
    if (!showPopup) return;

    // Overlay background
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);

    // Popup container
    let popupWidth = 400;
    let popupHeight = popupType === "success" ? 200 : 150;
    let popupX = width / 2 - popupWidth / 2;
    let popupY = height / 2 - popupHeight / 2;

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
        let buttonX = width / 2 - 75;
        let buttonY = popupY + 100;
        let buttonWidth = 150;
        let buttonHeight = 50;

        // Button shadow
        fill(30, 30, 30, 200);
        rect(buttonX + 3, buttonY + 3, buttonWidth, buttonHeight, 5);

        // Button background
        fill(100, 170, 80);
        if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && mouseY < buttonY + buttonHeight) {
            fill(120, 200, 100); // Highlight on hover
            if (mouseIsPressed) {
                fill(80, 140, 60); // Darker when pressed
            }
        }
        rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

        // Button text
        fill(255);
        textSize(18);
        text("Next Level", width / 2, buttonY + 25);
    } else {
        text("Try Again!", width / 2, popupY + 75);

        // Auto-hide failure popup after duration
        if (millis() - popupTimer > popupDuration) {
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
        let buttonX = width / 2 - 75;
        let buttonY = height / 2 - 200 / 2 + 100;
        let buttonWidth = 150;
        let buttonHeight = 50;

        if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && mouseY < buttonY + buttonHeight) {
            // Hide popup and load next level
            showPopup = false;
            const nextProblem = problemManager.getNextProblem(currentUser.currentProblem);
            if (nextProblem) {
                loadNextProblem(nextProblem);
                problemNumber += 1
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

            return;
        }
    }

    // check if run button is pressed
    if (mouseX > runButtonX && mouseX < runButtonX + runButtonWidth &&
        mouseY > runButtonY && mouseY < runButtonY + runButtonHeight) {
        runCode();
    }

    const targetBlock = findBlockAt(mouseX, mouseY, blocks.concat(allBlocks));

    if (targetBlock && !targetBlock.isLocked) {
        draggingBlock = targetBlock;
        draggingBlock.offsetX = targetBlock.x - mouseX;
        draggingBlock.offsetY = targetBlock.y - mouseY;
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

function findBlockAt(mx, my, blockList) {
    for (let i = blockList.length - 1; i >= 0; i--) {
        let block = blockList[i];

        if (!block) continue;

        if (block instanceof CompoundBlock) {
            for (let key in block.header) {
                let h = block.header[key];
                if (h.contains(mx, my)) return h;
            }

            const children = block instanceof IfElseBlock
                ? [...block.ifSection.children, ...block.elseSection.children]
                : block.children;

            const childMatch = findBlockAt(mx, my, children);
            if (childMatch) return childMatch;
        }

        if (block.contains(mx, my)) return block;
    }

    return null;
}

// Bring targetBlock to top of its layer
function promoteBlock(block) {
    // 1. allBlocks
    const idx1 = allBlocks.indexOf(block);
    if (idx1 !== -1) {
        allBlocks.splice(idx1, 1);
        allBlocks.push(block);
        return;
    }

    // 2. top-level blocks[]
    const idx2 = blocks.indexOf(block);
    if (idx2 !== -1) {
        blocks.splice(idx2, 1);
        blocks.push(block);
        return;
    }

    // 3. children of compound blocks
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

function mouseReleased() {
    if (!draggingBlock) return;

    for (let b of blocks) {
        // if (b instanceof CompoundBlock && b.canAcceptChild(mouseX, mouseY)) {
        //     b.addChild(draggingBlock);
        //     draggingBlock = null;
        //     return;
        // }
        if (compoundHover) {
            compoundHover.addChild(draggingBlock);
            draggingBlock = null;
            return;
        }
    }
    if (compoundHover && draggingBlock) {
        compoundHover.addChild(draggingBlock);
        draggingBlock = null;
        return;
    }

    // Drop in sidebar
    // if (mouseX > SIDEBAR_X) {
    //     // Make sure it's not already in the sidebar
    //     if (!allBlocks.includes(draggingBlock)) {
    //         allBlocks.push(draggingBlock);
    //         removeBlock(draggingBlock); // Remove from code area or child
    //     }
    //     draggingBlock = null;
    //     return;
    // }

    // Drop in code area
    if (ghostIndex !== -1 && mouseX < CODE_X + CODE_WIDTH && mouseY < CODE_Y_START + NUM_LINES * LINE_HEIGHT) {
        if (!(draggingBlock instanceof HeaderBlock)) {
            blocks.splice(ghostIndex, 0, draggingBlock);
            blocks = blocks.slice(0, NUM_LINES);
            shiftBlocksUp();
        } else {
            if (blocks[ghostIndex] instanceof CompoundBlock && blocks[ghostIndex].canAcceptHeader(mouseX, mouseY, draggingBlock)) {
                blocks[ghostIndex].acceptHeader(draggingBlock);
            }
        }
    }

    draggingBlock = null;
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
}

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

function flattenBlocks(arr) {
    return arr.reduce((flat, b) => {
        if (b instanceof CompoundBlock) {
            return flat.concat(b, b.children);
        } else {
            return b ? flat.concat(b) : flat;
        }
    }, []);
}

// function runCode() {
//     let x = 1;
//     for (let b of blocks) {
//         if (b) x = b.evaluate(x);
//     }
//     console.log("Final x:", x);
// }

function runCode() {
    const problem = problemManager.getProblem(currentUser.currentProblem);
    const result = currentUser.submitSolution(blocks, problem);

    console.log("Final x:", result.result);

    if (result.isCorrect) {
        // Handle problem completion
        console.log("Problem solved!");
        showPopup = true;
        // Gain 10 gold, extra 1 per 5 interest
        playerCoins += 10 + Math.floor(playerCoins / 5);
        popupType = "success";

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
    }
}

// Function to load the next problem
function loadNextProblem(nextProblem) {
    // Start the next problem
    const gameState = currentUser.startProblem(nextProblem);

    // Reset blocks array
    blocks = [];
    refreshShop();
    blocks.push(new CodeBlock("x = " + gameState.problem.initialValue + ";", CODE_X, CODE_Y_START, true));
    // blocks.push(...gameState.blocks);

    // Update available blocks
    console.log(gameState.availableBlocks)
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


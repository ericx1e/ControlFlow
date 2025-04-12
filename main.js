// p5.js Game: Balatro-inspired Code Roguelike
// Features: Drag-and-drop code blocks, Compound loops, Dynamic layout, Save/load, Interpreter
// import { Problem, User, ProblemManager } from './states.js';

const NUM_LINES = 40;
const LINE_HEIGHT = 35;
const CODE_X = 100;
const CODE_Y_START = 100;
const TITLE_Y_START = 50
const CODE_WIDTH = 600;
const SIDEBAR_X = 820; // Dont really need this lol
const SIDEBAR_BLOCK_SPACING = 80;
const BUTTON_WIDTH = 80;
const BUTTON_HEIGHT = 30;
const BUTTON_Y_START = 500;
const BUTTON_SPACING_Y = 40;
const SHOP_Y_START = 400

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
let shopSize = 6; // Number of items shown in the shop at once
let shopItems = [
    {
      id: 'for_loop',
      name: 'For Loop',
      description: 'A classic for loop block',
      price: 5,
      purchased: false,
      block: () => new ForLoopBlock(0, 0)
    },
    {
      id: 'while_loop',
      name: 'While Loop',
      description: 'Loop while a condition is true',
      price: 7,
      purchased: false,
      block: () => new WhileBlock(0, 0)
    },
    {
      id: 'if_else',
      name: 'If-Else Block',
      description: 'Branch based on conditions',
      price: 10,
      purchased: false,
      block: () => new IfElseBlock(0, 0)
    },
    {
      id: 'inc_by_5',
      name: 'Increment +5',
      description: 'Increment by 5 in loops',
      price: 3,
      purchased: false,
      block: () => new IncBlock(5, 0, 0)
    },
    {
      id: 'dec_by_2',
      name: 'Decrement -2',
      description: 'Decrement by 2 in loops',
      price: 3,
      purchased: false,
      block: () => new IncBlock(-2, 0, 0)
    },
    {
      id: 'code_mult5',
      name: 'Multiply x5',
      description: 'Multiply value by 5',
      price: 6,
      purchased: false,
      block: () => new CodeBlock("x *= 5;", 0, 0)
    }
];
let playerCoins = 10000000;

function initializeItemPool() {
    // Basic operations
    allPossibleItems = [
      {
        id: 'for_loop',
        name: 'For Loop',
        description: 'A classic for loop block',
        price: 5,
        rarity: 'common',
        block: () => new ForLoopBlock(0, 0)
      },
      {
        id: 'while_loop',
        name: 'While Loop',
        description: 'Loop while a condition is true',
        price: 7,
        rarity: 'uncommon',
        block: () => new WhileBlock(0, 0)
      },
      {
        id: 'if_else',
        name: 'If-Else Block',
        description: 'Branch based on conditions',
        price: 10,
        rarity: 'uncommon',
        block: () => new IfElseBlock(0, 0)
      },
      // Math operations
      {
        id: 'add_1',
        name: 'Add 1',
        description: 'Increment value by 1',
        price: 2,
        rarity: 'common',
        block: () => new CodeBlock("x += 1;", 0, 0)
      },
      {
        id: 'add_2',
        name: 'Add 2',
        description: 'Increment value by 2',
        price: 3,
        rarity: 'common',
        block: () => new CodeBlock("x += 2;", 0, 0)
      },
      {
        id: 'add_5',
        name: 'Add 5',
        description: 'Increment value by 5',
        price: 4,
        rarity: 'common',
        block: () => new CodeBlock("x += 5;", 0, 0)
      },
      {
        id: 'add_10',
        name: 'Add 10',
        description: 'Increment value by 10',
        price: 6,
        rarity: 'uncommon',
        block: () => new CodeBlock("x += 10;", 0, 0)
      },
      {
        id: 'sub_1',
        name: 'Subtract 1',
        description: 'Decrement value by 1',
        price: 2,
        rarity: 'common',
        block: () => new CodeBlock("x -= 1;", 0, 0)
      },
      {
        id: 'sub_3',
        name: 'Subtract 3',
        description: 'Decrement value by 3',
        price: 3, 
        rarity: 'common',
        block: () => new CodeBlock("x -= 3;", 0, 0)
      },
      {
        id: 'mult_2',
        name: 'Multiply ×2',
        description: 'Multiply value by 2',
        price: 4,
        rarity: 'common',
        block: () => new CodeBlock("x *= 2;", 0, 0)
      },
      {
        id: 'mult_3',
        name: 'Multiply ×3',
        description: 'Multiply value by 3',
        price: 5,
        rarity: 'uncommon',
        block: () => new CodeBlock("x *= 3;", 0, 0)
      },
      {
        id: 'mult_5',
        name: 'Multiply ×5',
        description: 'Multiply value by 5',
        price: 6,
        rarity: 'uncommon',
        block: () => new CodeBlock("x *= 5;", 0, 0)
      },
      {
        id: 'div_2',
        name: 'Divide ÷2',
        description: 'Divide value by 2',
        price: 4,
        rarity: 'common',
        block: () => new CodeBlock("x /= 2;", 0, 0)
      },
      {
        id: 'div_3',
        name: 'Divide ÷3',
        description: 'Divide value by 3',
        price: 5,
        rarity: 'uncommon',
        block: () => new CodeBlock("x /= 3;", 0, 0)
      },
      {
        id: 'square',
        name: 'Square',
        description: 'Square the value',
        price: 7,
        rarity: 'uncommon',
        block: () => new CodeBlock("x = x * x;", 0, 0)
      },
      {
        id: 'mod_2',
        name: 'Modulo 2',
        description: 'Remainder when divided by 2',
        price: 5,
        rarity: 'uncommon',
        block: () => new CodeBlock("x = x % 2;", 0, 0)
      },
      // Loop components
      {
        id: 'inc_by_1',
        name: 'Increment +1',
        description: 'Increment by 1 in loops',
        price: 2,
        rarity: 'common',
        block: () => new IncBlock(1, 0, 0)
      },
      {
        id: 'inc_by_2',
        name: 'Increment +2',
        description: 'Increment by 2 in loops',
        price: 3,
        rarity: 'common',
        block: () => new IncBlock(2, 0, 0)
      },
      {
        id: 'inc_by_5',
        name: 'Increment +5',
        description: 'Increment by 5 in loops',
        price: 3,
        rarity: 'uncommon',
        block: () => new IncBlock(5, 0, 0)
      },
      {
        id: 'dec_by_1',
        name: 'Decrement -1',
        description: 'Decrement by 1 in loops',
        price: 2,
        rarity: 'common',
        block: () => new IncBlock(-1, 0, 0)
      },
      {
        id: 'dec_by_2',
        name: 'Decrement -2',
        description: 'Decrement by 2 in loops',
        price: 3,
        rarity: 'uncommon',
        block: () => new IncBlock(-2, 0, 0)
      },
      // Conditions
      {
        id: 'cond_less_10',
        name: 'x < 10',
        description: 'True when x less than 10',
        price: 3,
        rarity: 'common',
        block: () => new ConditionBlock("x < 10", 0, 0)
      },
      {
        id: 'cond_less_20',
        name: 'x < 20',
        description: 'True when x less than 20',
        price: 3,
        rarity: 'common',
        block: () => new ConditionBlock("x < 20", 0, 0)
      },
      {
        id: 'cond_greater_5',
        name: 'x > 5',
        description: 'True when x greater than 5',
        price: 3,
        rarity: 'common',
        block: () => new ConditionBlock("x > 5", 0, 0)
      },
      {
        id: 'cond_greater_50',
        name: 'x > 50',
        description: 'True when x greater than 50',
        price: 4,
        rarity: 'uncommon',
        block: () => new ConditionBlock("x > 50", 0, 0)
      },
      {
        id: 'cond_equal_0',
        name: 'x === 0',
        description: 'True when x equals 0',
        price: 4,
        rarity: 'uncommon',
        block: () => new ConditionBlock("x === 0", 0, 0)
      },
      {
        id: 'cond_mod2_0',
        name: 'x % 2 === 0',
        description: 'True when x is even',
        price: 5,
        rarity: 'uncommon',
        block: () => new ConditionBlock("x % 2 === 0", 0, 0)
      },
      // Initializers
      {
        id: 'init_0',
        name: 'let i = 0',
        description: 'Initialize loop at 0',
        price: 2,
        rarity: 'common',
        block: () => new InitBlock(0, 0, 0)
      },
      {
        id: 'init_1',
        name: 'let i = 1',
        description: 'Initialize loop at 1',
        price: 2,
        rarity: 'common',
        block: () => new InitBlock(1, 0, 0)
      },
      {
        id: 'init_5',
        name: 'let i = 5',
        description: 'Initialize loop at 5',
        price: 3,
        rarity: 'uncommon',
        block: () => new InitBlock(5, 0, 0)
      },
      {
        id: 'init_10',
        name: 'let i = 10',
        description: 'Initialize loop at 10',
        price: 3,
        rarity: 'uncommon',
        block: () => new InitBlock(10, 0, 0)
      },
      // Special operations (rare)
      {
        id: 'double_squared',
        name: 'Double Squared',
        description: 'Square the value then double it',
        price: 8,
        rarity: 'rare',
        block: () => new CodeBlock("x = x * x * 2;", 0, 0)
      },
      {
        id: 'flip_sign',
        name: 'Flip Sign',
        description: 'Change value to its opposite',
        price: 6,
        rarity: 'rare',
        block: () => new CodeBlock("x = -x;", 0, 0)
      },
      {
        id: 'power_of_2',
        name: 'Power of 2',
        description: 'Raise 2 to the power of x',
        price: 10,
        rarity: 'rare',
        block: () => new CodeBlock("x = Math.pow(2, x);", 0, 0)
      },
      {
        id: 'factorial',
        name: 'Factorial',
        description: 'Calculate x! (if x <= 12)',
        price: 12,
        rarity: 'rare',
        block: () => new CodeBlock("x = x > 12 ? x : factorial(x);", 0, 0)
      }
    ];
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
      ).map(item => ({...item, purchased: true}));
      
      // Fill remaining slots with purchased items
      while (availableItems.length + shopItems.length < shopSize && purchasedItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * purchasedItems.length);
        shopItems.push(purchasedItems[randomIndex]);
        purchasedItems.splice(randomIndex, 1);
      }
    }
    
    // Weight selection by rarity
    const rarityWeights = {
      'common': 60,
      'uncommon': 30,
      'rare': 10
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
        shopItems.push({...selectedItem, purchased: false});
        availableItems = availableItems.filter(item => item.id !== selectedItem.id);
      } else {
        // If no items of the target rarity, just pick any available item
        const randomIndex = Math.floor(Math.random() * availableItems.length);
        const selectedItem = availableItems[randomIndex];
        
        shopItems.push({...selectedItem, purchased: false});
        availableItems = availableItems.filter(item => item.id !== selectedItem.id);
      }
    }
}

function setup() {
    createCanvas(1000, 600);
    textSize(16);
    textFont('monospace');
    // Initialize problem manager with default problems
    problemManager = ProblemManager.setProblems();

    // Load or create user
    currentUser = User.load() || new User('user1', 'Player 1');

    shop = Shop.initializeDefaultShop();

    // Start the first problem if no current problem
    // if (!currentUser.currentProblem) {
    const firstProblem = problemManager.getProblem(problemManager.problemOrder[0]);
    loadNextProblem(firstProblem);
    // }
    // const problem = problemManager.getProblem(currentUser.currentProblem);
    // const gameState = currentUser.startProblem(problem)
    // // Set up game state
    // blocks.push(new CodeBlock("x = " + gameState.problem.initialValue, CODE_X, CODE_Y_START, true))
    // blocks.push(...gameState.blocks);
    // allBlocks = gameState.availableBlocks;

    // if (!blocks || blocks.length === 0) {
    //     for (let i = 0; i < NUM_LINES; i++) blocks.push(null);
    // }
    // for (let i = 0; i < NUM_LINES; i++) blocks.push(null);
    // allBlocks.push(new CodeBlock("x += 1;", SIDEBAR_X, 100));
    // allBlocks.push(new CodeBlock("x *= 2;", SIDEBAR_X, 100 + SIDEBAR_BLOCK_SPACING));
    // allBlocks.push(new ForLoopBlock(SIDEBAR_X, 100 + 2 * SIDEBAR_BLOCK_SPACING));
    // allBlocks.push(new CodeBlock("x += 1;", SIDEBAR_X, 100 + 3 * SIDEBAR_BLOCK_SPACING));
    // allBlocks.push(new IfElseBlock(CODE_X + CODE_WIDTH + 10, 100 + 4 * SIDEBAR_BLOCK_SPACING));
    // allBlocks.push(new WhileBlock(CODE_X + CODE_WIDTH + 10, 100 + 5 * SIDEBAR_BLOCK_SPACING));
    // allBlocks.push(new PrintBlock(CODE_X + CODE_WIDTH + 10, 100 + 6 * SIDEBAR_BLOCK_SPACING));

}

function draw() {
    background(30);
    drawCodeLines();
    drawSidebar();
    drawBlocks();
    drawButtons();
    drawTarget();
    drawShop();

    if (draggingBlock) {
        draggingBlock.x = mouseX + draggingBlock.offsetX;
        draggingBlock.y = mouseY + draggingBlock.offsetY;
        draggingBlock.draw(true);
    }

    drawPopup()
}

function drawCodeLines() {
    fill(255);
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
    fill(50, 50, 50, 150);
    // rect(SIDEBAR_X, 0, 200, height);
    rect(CODE_X + CODE_WIDTH, 0, width - CODE_X - CODE_WIDTH, height);
    fill(255);
    noStroke();
    text("Available Blocks", SIDEBAR_X, 50);
}

// Update drawShop to include the refresh button
function drawShop() {
    // Shop background
    fill(40, 40, 50);
    rect(0, SHOP_Y_START, 700, height - SHOP_Y_START);
    
    // Shop header
    fill(60, 60, 70);
    rect(0, SHOP_Y_START, 700, 50);
    
    fill(255);
    textSize(24);
    text("SHOP", 20, SHOP_Y_START + 35);
    
    // Show coins
    fill(255, 215, 0);
    textAlign(RIGHT);
    text(`${playerCoins} coins`, 680, SHOP_Y_START + 35);
    textAlign(LEFT);
    
    // Close button
    const closeButtonX = 650;
    const closeButtonY = SHOP_Y_START + 10;
    const closeButtonSize = 30;
    
    fill(80, 60, 60);
    if (mouseX > closeButtonX && mouseX < closeButtonX + closeButtonSize &&
        mouseY > closeButtonY && mouseY < closeButtonY + closeButtonSize) {
      fill(120, 60, 60); // Highlight on hover
    }
    rect(closeButtonX, closeButtonY, closeButtonSize, closeButtonSize, 5);
    
    fill(255);
    textAlign(CENTER, CENTER);
    text("X", closeButtonX + closeButtonSize/2, closeButtonY + closeButtonSize/2);
    textAlign(LEFT, BASELINE);
    
    // Refresh button
    const refreshButtonX = 550;
    const refreshButtonY = SHOP_Y_START + 10; 
    const refreshButtonWidth = 80;
    const refreshButtonHeight = 30;
    
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
    text(`Refresh (${shopRefreshCost})`, refreshButtonX + refreshButtonWidth/2, refreshButtonY + refreshButtonHeight/2);
    textAlign(LEFT, BASELINE);
    
    // Draw shop items in a grid
    const itemsPerRow = 3;
    const itemWidth = 210;
    const itemHeight = 130;
    const padding = 15;
    
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
          fill(80, 80, 80); // Disabled
        }
        rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
        
        // Button text
        fill(255);
        textSize(14);
        textAlign(CENTER, CENTER);
        text("Buy", buttonX + buttonWidth/2, buttonY + buttonHeight/2);
        textAlign(LEFT, BASELINE);
      }
    }
}

function drawTarget() {
    
    
    // Draw problem title
    fill(255);
    textSize(20);
    text(title, CODE_X  , TITLE_Y_START - 15);
    
    
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

function drawButtons() {
    fill(50);
    noStroke();
    rect(SIDEBAR_X, BUTTON_Y_START, BUTTON_WIDTH, BUTTON_HEIGHT);
    // rect(SIDEBAR_X + 90, BUTTON_Y_START, BUTTON_WIDTH, BUTTON_HEIGHT);
    fill(255);
    text("Run", SIDEBAR_X + 20, BUTTON_Y_START + 20);
    // text("Save", SIDEBAR_X + 110, BUTTON_Y_START + 20);
    // rect(SIDEBAR_X, BUTTON_Y_START + BUTTON_SPACING_Y, BUTTON_WIDTH, BUTTON_HEIGHT);
    // text("Load", SIDEBAR_X + 20, BUTTON_Y_START + BUTTON_SPACING_Y + 20);
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
        } else {
            console.log("Congratulations! You've completed all problems!");
            // Could show a game completion popup here
        }
        return; // Return early to prevent other interactions while popup is active
        }
    }

    const closeButtonX = 650;
    const closeButtonY = SHOP_Y_START + 10;
    const closeButtonSize = 30;
    
    if (mouseX > closeButtonX && mouseX < closeButtonX + closeButtonSize &&
        mouseY > closeButtonY && mouseY < closeButtonY + closeButtonSize) {
      showShop = false;
      return;
    }

     // Handle shop refresh button
    const refreshButtonX = 550;
    const refreshButtonY = SHOP_Y_START + 10; 
    const refreshButtonWidth = 80;
    const refreshButtonHeight = 30;
    
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
    
    // Handle shop item buy buttons
    const itemsPerRow = 3;
    const itemWidth = 210;
    const itemHeight = 130;
    const padding = 15;
    
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
        allBlocks.push(newBlock);
        
        // Save the purchase to user data
        currentUser.purchasedItems = currentUser.purchasedItems || [];
        currentUser.purchasedItems.push(item.id);
        currentUser.coins = playerCoins;
        currentUser.save();
        
        return;
      }
    }
    
    // // If we clicked somewhere in the shop but not on a button, return
    // // to prevent other interactions while shop is open
    // if (mouseY > SHOP_Y_START) {
    //   return;
    // }
    
    // Only allow other interactions if popup is not showing
    if (showPopup) return;
    
    if (mouseX > SIDEBAR_X && mouseX < SIDEBAR_X + BUTTON_WIDTH &&
        mouseY > BUTTON_Y_START && mouseY < BUTTON_Y_START + BUTTON_HEIGHT)
        return runCode();

    const targetBlock = findBlockAt(mouseX, mouseY, blocks.concat(allBlocks));

    if (targetBlock && !targetBlock.isLocked) {
        draggingBlock = targetBlock;
        draggingBlock.offsetX = targetBlock.x - mouseX;
        draggingBlock.offsetY = targetBlock.y - mouseY;
        promoteBlock(draggingBlock);
        removeBlock(draggingBlock);
    }
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
        popupType = "success";

        // Save progress
        currentUser.save();

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
    blocks.push(new CodeBlock("x = " + gameState.problem.initialValue, CODE_X, CODE_Y_START, true));
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

class CodeBlock {
    constructor(text, x, y, isLocked = false) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.w = textWidth(text) + 20;
        this.h = 30;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isLocked = isLocked
    }

    contains(mx, my) {
        return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
    }

    draw(isDragging = false) {
        noStroke();
        // Drop shadow
        fill(50, 50, 50, 150);
        rect(this.x + 3, this.y + 3, this.w, this.h, 6);
        // Main block
        if (this.isLocked) {
            fill('#664'); // Different color for locked blocks
        } else {
            fill(isDragging ? '#557' : '#446');
        }
        rect(this.x, this.y, this.w, this.h, 6);
        fill(255);
        text(this.text, this.x + 10, this.y + 20);

    }

    evaluate(x) {
        try {
            return new Function("x", `${this.text}; return x;`)(x);
        } catch (e) {
            console.error("Error in block:", this.text);
            return x;
        }
    }

    getHeightInLines() {
        return 1;
    }

    serialize() {
        return { type: "code", text: this.text };
    }
}

class CompoundBlock extends CodeBlock {
    constructor(text, x, y) {
        super(text, x, y, false);
        this.children = [];
        this.header = {};
    }

    addChild(block) {
        this.children.push(block);
    }

    canAcceptChild(mx, my) {
        const childAreaTop = this.y + this.h;
        let childrenLineHeight = this.getHeightInLines() - 1;
        // for (let child of this.children) {
        //     childrenLineHeight += child.getHeightInLines();
        // }
        const childAreaBottom = childAreaTop + (this.getHeightInLines() - 1) * LINE_HEIGHT + 10;
        return (
            mx > this.x + 20 &&
            mx < this.x + this.w - 20 &&
            my > childAreaTop &&
            my < childAreaBottom
        );
    }

    getHeightInLines() {
        return 1 + this.children.reduce((sum, c) => sum + c.getHeightInLines(), 0);
    }

    addHeaderBlock(block) {
        const typeName = block.constructor.name;
        this.header[typeName] = block;
    }

    getHeaderBlock(type) {
        return this.header[type.name] || null;
    }

    hasHeaderBlock(type) {
        return !!this.getHeaderBlock(type);
    }

    removeHeaderBlock(block) {
        const typeName = block.constructor.name;
        if (this.header[typeName] === block) {
            delete this.header[typeName];
        }
    }

    canAcceptHeader(mx, my) {
        return mx > this.x && mx < this.x + this.w &&
            my > this.y && my < this.y + this.h &&
            !this.hasHeaderBlock(ConditionBlock); // allow only one condition
    }

    acceptHeader(block) {
        if (block instanceof ConditionBlock && !this.hasHeaderBlock(ConditionBlock)) {
            this.addHeaderBlock(block);
            return true;
        }

        return false;
    }

    draw(isDragging = false) {
        // First: calculate dynamic width based on children
        let baseWidth = max(textWidth(this.text) + 40, this.baseWidth); // base for header
        let maxWidth = 0;

        const allChildren = this instanceof IfElseBlock
            ? [...this.ifSection.children, ...this.elseSection.children]
            : this.children;

        for (let child of allChildren) {
            const childWidth = 40 + child.w;
            if (childWidth > maxWidth) {
                maxWidth = childWidth;
            }
        }

        let headerWidth = baseWidth;
        for (let key in this.header) {
            let h = this.header[key];
            headerWidth += h.w;
        }
        if (headerWidth > maxWidth) {
            maxWidth = headerWidth;
        }

        this.w = max(baseWidth, maxWidth + 10); // set width with padding

        // Now draw block shell
        noStroke();
        fill(50, 50, 50, 150);
        rect(this.x + 3, this.y + 3, this.w, this.h, 6);

        fill(isDragging ? '#966' : '#855');
        rect(this.x, this.y, this.w, this.h, 6);

        // fill(255);
        // text(this.text, this.x + 10, this.y + 20);
        if (!(this instanceof ForLoopBlock)) {
            if (this.hasHeaderBlock(ConditionBlock)) {
                const condBlock = this.getHeaderBlock(ConditionBlock);
                fill(255);
                text(`${this.text.split("(")[0]}(`, this.x + 10, this.y + 20);
                condBlock.x = this.x + textWidth(`${this.text.split("(")[0]}(`) + 10;
                condBlock.y = this.y + 2;
                condBlock.draw();
                text(`)`, condBlock.x + condBlock.w + 5, this.y + 20);
            } else {
                fill(255);
                text(`${this.text} (?)`, this.x + 10, this.y + 20);
            }
        }

        // Child container background
        fill(50, 50, 50, 150);
        let childHeight = this.getHeightInLines() - 1;
        rect(this.x + 20, this.y + this.h, this.w - 20, childHeight * LINE_HEIGHT + 10, 6);

        // Draw children
        let childY = this.y + this.h + 5;
        for (let child of allChildren) {
            child.x = this.x + 30;
            child.y = childY;
            child.draw();
            childY += child.getHeightInLines() * LINE_HEIGHT;
        }
    }

    evaluate(x) {
        for (let child of this.children) {
            x = child.evaluate(x);
        }
        return x;
    }
}

class HeaderBlock extends CodeBlock {
    constructor(text, x, y) {
        super(text, x, y);
        this.w = textWidth(text) + 20;
        this.h = 25;
    }

    draw(isDragging = false) {
        noStroke();
        fill(50, 50, 50, 150);
        rect(this.x + 3, this.y + 3, this.w, this.h, 6);
        fill(isDragging ? '#6a6' : '#4b4');
        rect(this.x, this.y, this.w, this.h, 6);
        fill(255);
        text(this.text, this.x + 10, this.y + 20);
    }

    isHeaderOnly() {
        return true;
    }
}

class ForLoopBlock extends CompoundBlock {
    constructor(x, y) {
        super("for (", x, y);
        // this.init = "let i = 0";
        // this.cond = "i < 3";
        // this.inc = "i++";
        this.body = this.children;
        this.baseWidth = 170;
    }

    canAcceptHeader(mx, my, block) {
        return mx > this.x && mx < this.x + this.w &&
            my > this.y && my < this.y + this.h &&
            (
                (block instanceof InitBlock && !this.hasHeaderBlock(InitBlock)) ||
                (block instanceof ConditionBlock && !this.hasHeaderBlock(ConditionBlock)) ||
                (block instanceof IncBlock && !this.hasHeaderBlock(IncBlock))
            );
    }

    acceptHeader(block) {
        if (
            (block instanceof InitBlock && !this.hasHeaderBlock(InitBlock)) ||
            (block instanceof ConditionBlock && !this.hasHeaderBlock(ConditionBlock)) ||
            (block instanceof IncBlock && !this.hasHeaderBlock(IncBlock))
        ) {
            this.addHeaderBlock(block);
            return true;
        }
        return false;
    }

    draw(isDragging = false) {
        super.draw(isDragging);
        fill(255);
        text("for (", this.x + 10, this.y + 20);

        let offset = this.x + textWidth("for (") + 10;

        const init = this.getHeaderBlock(InitBlock);
        if (init) {
            init.x = offset;
            init.y = this.y + 2;
            init.draw();
            offset += init.w + 10;
        } else {
            text("?", offset, this.y + 20);
            offset += 20;
        }

        text(";", offset, this.y + 20);
        offset += 15;

        const cond = this.getHeaderBlock(ConditionBlock);
        if (cond) {
            cond.x = offset;
            cond.y = this.y + 2;
            cond.draw();
            offset += cond.w + 10;
        } else {
            text("?", offset, this.y + 20);
            offset += 20;
        }

        text(";", offset, this.y + 20);
        offset += 15;

        const inc = this.getHeaderBlock(IncBlock);
        if (inc) {
            inc.x = offset;
            inc.y = this.y + 2;
            inc.draw();
            offset += inc.w + 10;
        } else {
            text("?", offset, this.y + 20);
            offset += 20;
        }

        text(")", offset, this.y + 20);
    }

    evaluate(x) {
        try {
            // let bodyCode = this.children.map(b => b.text).join("\n");
            //let bodyCode = this.children.map(b => b.text?.trim?.() || "// empty").filter(Boolean).join("\n");
            //return new Function("x", `${this.init}; while(${this.cond}) { ${bodyCode}; ${this.inc}; } return x;`)(x);

            const initBlock = this.getHeaderBlock(InitBlock);
            const condBlock = this.getHeaderBlock(ConditionBlock);
            const incBlock = this.getHeaderBlock(IncBlock);

            if (!initBlock || !condBlock || !incBlock) {
                console.warn("Missing header blocks in for-loop");
                return x;
            }

            for (let i = initBlock.value; eval(condBlock.text); i += incBlock.value) {
                // console.log(i);
                for (let child of this.children) {
                    x = child.evaluate(x);
                }
            }
            return x;
        } catch (e) {
            console.error("Loop Error:", e);
            return x;
        }
    }

    serialize() {
        return {
            type: "for",
            init: this.init,
            cond: this.cond,
            inc: this.inc,
            body: this.children.map(b => b.serialize())
        };
    }
}

class IfElseBlock extends CompoundBlock {
    constructor(x, y) {
        super("if (...) { } else { }", x, y);
        // this.cond = "x % 2 === 0";
        this.ifSection = new SectionBlock("if", x, y + 35);
        this.elseSection = new SectionBlock("else", x, y + 100);
        this.baseWidth = 280;
    }

    canAcceptChild(mx, my) {
        return this.ifSection.canAcceptChild(mx, my) || this.elseSection.canAcceptChild(mx, my);
    }

    addChild(block) {
        if (this.ifSection.canAcceptChild(mouseX, mouseY)) {
            this.ifSection.addChild(block);
        } else {
            this.elseSection.addChild(block);
        }
    }

    getHeightInLines() {
        return 2 + this.ifSection.getHeightInLines() + this.elseSection.getHeightInLines();
    }

    canAcceptHeader(mx, my, block) {
        return mx > this.x && mx < this.x + this.w &&
            my > this.y && my < this.y + this.h &&
            block instanceof ConditionBlock &&
            !this.hasHeaderBlock(ConditionBlock);
    }

    acceptHeader(block) {
        if (block instanceof ConditionBlock && !this.hasHeaderBlock(ConditionBlock)) {
            this.addHeaderBlock(block);
            return true;
        }
        return false;
    }

    draw(isDragging = false) {
        noStroke();

        // Draw IF container
        fill(50, 50, 50, 150);
        rect(this.x + 3, this.y + 3, this.w, this.h, 6);
        fill(isDragging ? '#559' : '#458');
        rect(this.x, this.y, this.w, this.h, 6);

        // Draw IF header
        fill(255);
        let offset = this.x + 10;
        text("if (", offset, this.y + 20);
        offset += textWidth("if (");

        const condBlock = this.getHeaderBlock(ConditionBlock);
        if (condBlock) {
            condBlock.x = offset;
            condBlock.y = this.y + 2;
            condBlock.draw();
            offset += condBlock.w + 5;
        } else {
            text("?", offset, this.y + 20);
            offset += 20;
        }

        text(") {", offset, this.y + 20);

        // IF section
        this.ifSection.x = this.x + 20;
        this.ifSection.y = this.y + this.h;
        this.ifSection.draw();

        // ELSE block header
        const elseY = this.ifSection.y + this.ifSection.getHeightInLines() * LINE_HEIGHT + 10;
        fill(30);
        rect(this.x, elseY, this.w, this.h, 6);
        fill(255);
        text("else {", this.x + 10, elseY + 20);

        // ELSE section
        this.elseSection.x = this.x + 20;
        this.elseSection.y = elseY + this.h;
        this.elseSection.draw();
    }


    evaluate(x) {
        try {
            const condBlock = this.getHeaderBlock(ConditionBlock);
            if (!condBlock) {
                console.warn("Missing ConditionBlock in if/else block");
                return x;
            }

            const conditionMet = condBlock.evaluateCondition(x);
            const section = conditionMet ? this.ifSection : this.elseSection;

            for (let child of section.children) {
                x = child.evaluate(x);
            }
        } catch (e) {
            console.error("IfElseBlock Error:", e);
        }
        return x;
    }

    serialize() {
        return {
            type: "ifelse",
            cond: this.cond,
            ifBody: this.ifSection.children.map(b => b.serialize()),
            elseBody: this.elseSection.children.map(b => b.serialize())
        };
    }
}

class SectionBlock {
    constructor(label, x, y) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.children = [];
    }

    canAcceptChild(mx, my) {
        const top = this.y;
        const bottom = top + this.getHeightInLines() * LINE_HEIGHT + 10;
        return mx > this.x && mx < this.x + 240 && my > top && my < bottom;
    }

    addChild(block) {
        this.children.push(block);
    }

    getHeightInLines() {
        return 0 + this.children.reduce((sum, c) => sum + c.getHeightInLines(), 0);
    }

    draw() {
        fill(70);
        // text(this.label, this.x + 5, this.y + 15);
        fill(50, 50, 50, 150);
        rect(this.x, this.y, 240, this.getHeightInLines() * LINE_HEIGHT + 10, 6);

        let childY = this.y + 10;
        for (let child of this.children) {
            child.x = this.x + 10;
            child.y = childY;
            child.draw();
            childY += child.getHeightInLines() * LINE_HEIGHT;
        }
    }
}

class WhileBlock extends CompoundBlock {
    constructor(x, y) {
        super("while", x, y);
        // this.cond = "x < 10";
        this.condBlock = null;  // holds the ConditionBlock instance
        // this.text = `while (${this.cond})`;
        this.baseWidth = 110;
    }

    evaluate_cond(x) {
        const parts = this.cond.trim().split(/\s+/);
        let cond = parts[0];
        let val = parts[1];
        return eval(`x ${cond} ${val}`);
    }

    evaluate(x) {
        try {
            //if (this.children.length === 0) return x; // Avoid infinite loop
            //while (new Function("x", `return ${this.cond}`)(x)) {
            //for (let child of this.children) x = child.evaluate(x);
            //}

            const condBlock = this.getHeaderBlock(ConditionBlock);

            if (!condBlock) {
                console.warn("Missing header blocks in while-loop");
                return x;
            }

            let maxIterations = 10000;
            let count = 0;

            while (condBlock.evaluateCondition(x) && count++ < maxIterations) {
                // console.log(x)
                for (let child of this.children) {
                    x = child.evaluate(x);
                }
            }

            if (count >= maxIterations) {
                console.warn("Max iterations reached")
            }

            return x;
        } catch (e) {
            console.error("While Error:", e);
        }
        return x;
    }

    serialize() {
        return {
            type: "while",
            cond: this.cond,
            body: this.children.map(b => b.serialize())
        };
    }
}

class PrintBlock extends CodeBlock {
    constructor(x, y) {
        super("print(x);", x, y);
        this.w = 120;
    }

    evaluate(x) {
        console.log("PrintBlock:", x);
        return x;
    }

    serialize() {
        return { type: "print" };
    }
}

class ConditionBlock extends HeaderBlock {
    constructor(text, x, y) {
        super(text, x, y);
    }

    evaluateCondition(x) {
        try {
            return new Function("x", `return (${this.text});`)(x);
        } catch (e) {
            console.error("ConditionBlock Error:", e, "text:", this.text);
            return false;
        }
    }

    serialize() {
        return { type: "cond", text: this.text };
    }
}


function deserialize(obj) {
    if (!obj) return null;
    if (obj.type === "code") return new CodeBlock(obj.text, CODE_X, CODE_Y_START);
    if (obj.type === "print") return new PrintBlock(CODE_X, CODE_Y_START);
    if (obj.type === "while") {
        const w = new WhileBlock(CODE_X, CODE_Y_START);
        w.cond = obj.cond;
        w.children = obj.body.map(deserialize);
        return w;
    }
    if (obj.type === "ifelse") {
        const ie = new IfElseBlock(CODE_X, CODE_Y_START);
        ie.cond = obj.cond;
        ie.ifChildren = obj.ifBody.map(deserialize);
        ie.elseChildren = obj.elseBody.map(deserialize);
        return ie;
    }
    if (obj.type === "for") {
        const loop = new ForLoopBlock(CODE_X, CODE_Y_START);
        loop.init = obj.init;
        loop.cond = obj.cond;
        loop.inc = obj.inc;
        loop.children = obj.body.map(deserialize);
        return loop;
    }
    return null;
}

class InitBlock extends HeaderBlock {
    constructor(value, x, y) {
        super(`let i = ${value}`, x, y);
        this.value = value;
    }

    getValue() {

    }

    serialize() {
        return { type: "init", text: this.text };
    }
}

class IncBlock extends HeaderBlock {
    constructor(value, x, y) {
        if (value >= 0) {
            super(`i += ${value}`, x, y);
        } else {
            super(`i -= ${-value}`, x, y);
        }
        this.value = value
    }

    serialize() {
        return { type: "inc", text: this.text };
    }
}


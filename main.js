// p5.js Game: Balatro-inspired Code Roguelike
// Features: Drag-and-drop code blocks, Compound loops, Dynamic layout, Save/load, Interpreter
// import { Problem, User, ProblemManager } from './states.js';

const NUM_LINES = 40;
const LINE_HEIGHT = 35;
const CODE_X = 100;
const CODE_Y_START = 50;
const CODE_WIDTH = 600;
const SIDEBAR_X = 820; // Dont really need this lol
const SIDEBAR_BLOCK_SPACING = 80;
const BUTTON_WIDTH = 80;
const BUTTON_HEIGHT = 30;
const BUTTON_Y_START = 500;
const BUTTON_SPACING_Y = 40;

let blocks = []; // Array of length NUM_LINES to hold blocks, Null if empty
let allBlocks = [];
let draggingBlock = null;
let ghostIndex = -1;
let compoundHover = null;

function setup() {
    createCanvas(1000, 600);
    textSize(16);
    textFont('monospace');
    // Initialize problem manager with default problems
    problemManager = ProblemManager.createDefaultProblems();

    // Load or create user
    currentUser = User.load() || new User('user1', 'Player 1');
    console.log(currentUser.currentProblem)

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

    if (draggingBlock) {
        draggingBlock.x = mouseX + draggingBlock.offsetX;
        draggingBlock.y = mouseY + draggingBlock.offsetY;
        draggingBlock.draw(true);
    }
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
        } else if (ghostIndex === -1 && block.contains(mouseX, mouseY)) {
            ghostIndex = i;
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

    if (ghostIndex === -1 && draggingBlock) {
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

function drawBlocks() {
    for (let block of allBlocks) {
        if (block) block.draw();
    }
    if (compoundHover && draggingBlock) {
        fill(255, 255, 0, 50);
        rect(
            compoundHover.x + 20,
            compoundHover.y + compoundHover.h,
            compoundHover.w - 40,
            (compoundHover.getHeightInLines() - 1) * LINE_HEIGHT + 10,
            6
        );
    } else if (ghostIndex !== -1 && mouseX < CODE_X + CODE_WIDTH && mouseY < CODE_Y_START + NUM_LINES * LINE_HEIGHT) {
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

function mousePressed() {
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

        // Save progress
        currentUser.save();

        // Offer to move to the next problem
        const nextProblem = problemManager.getNextProblem(currentUser.currentProblem);
        if (nextProblem) {
            // TODO: Show completion dialog and offer next problem
            loadNextProblem(nextProblem);
        } else {
            // TODO: Show game completion
            console.log("Congratulations! You've completed all problems!");
        }
    } else {
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

    // Fill the rest with nulls
    while (blocks.length < NUM_LINES) {
        blocks.push(null);
    }

    // Make sure blocks are properly arranged
    shiftBlocksUp();
}

// Function to load the shop between problems
function loadShop() {
    console.log("nothing yet");
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
                console.log(i);
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
        this.cond = "x % 2 === 0";
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
        return 1 + this.ifSection.getHeightInLines() + this.elseSection.getHeightInLines();
    }

    draw(isDragging = false) {
        noStroke();
        fill(50, 50, 50, 150);
        rect(this.x + 3, this.y + 3, this.w, this.h, 6);
        fill(isDragging ? '#559' : '#458');
        rect(this.x, this.y, this.w, this.h, 6);
        fill(255);
        text(this.text, this.x + 10, this.y + 20);

        this.ifSection.x = this.x + 20;
        this.ifSection.y = this.y + this.h;
        this.ifSection.draw();

        this.elseSection.x = this.x + 20;
        this.elseSection.y = this.ifSection.y + this.ifSection.getHeightInLines() * LINE_HEIGHT + 10;
        this.elseSection.draw();
    }

    evaluate_cond(x) {
        try {
            // Replace all occurrences of 'x' with the actual value
            const conditionWithX = this.cond.replace(/\bx\b/g, x);

            // Use eval to evaluate the condition directly
            return eval(conditionWithX);
        } catch (e) {
            console.error("Error evaluating condition:", e, "Condition:", this.cond);
            return false;
        }
    }

    evaluate(x) {
        try {
            const condVal = new Function("x", `return ${this.cond};`)(x);
            const section = condVal ? this.ifSection : this.elseSection;
            for (let child of section.children) {
                x = child.evaluate(x);
            }
        } catch (e) {
            console.error("IfElse Error:", e);
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
        const top = this.y + 20;
        const bottom = top + this.getHeightInLines() * LINE_HEIGHT + 30;
        return mx > this.x && mx < this.x + 240 && my > top && my < bottom;
    }

    addChild(block) {
        this.children.push(block);
    }

    getHeightInLines() {
        return 1 + this.children.reduce((sum, c) => sum + c.getHeightInLines(), 0);
    }

    draw() {
        fill(70);
        text(this.label, this.x + 5, this.y + 15);
        fill(50, 50, 50, 150);
        rect(this.x, this.y + 20, 240, this.getHeightInLines() * LINE_HEIGHT + 10, 6);

        let childY = this.y + 30;
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
            while (this.evaluate_cond(x)) {
                for (let child of this.children) {
                    x = child.evaluate(x);
                }
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


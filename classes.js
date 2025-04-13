class CodeBlock {
    constructor(text, x, y, isLocked = false) {
        this.text = text;
        this.x = x;
        this.y = y;
        textSize(21); // Scaled up from 14
        this.w = textWidth(text + '  ');
        this.h = 45; // Scaled up from 30
        this.offsetX = 0;
        this.offsetY = 0;
        this.isLocked = isLocked
    }

    contains(mx, my) {
        return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
    }

    draw(isDragging = false) {
        // this.w = textWidth(text + '    ');
        noStroke();
        // Drop shadow
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.y + 4.5, this.w, this.h, 9); // Scaled up shadow offset and corner radius
        // Main block
        if (this.isLocked) {
            fill('#664'); // Different color for locked blocks
        } else {
            fill(isDragging ? '#558' : '#447');
        }
        rect(this.x, this.y, this.w, this.h, 9); // Scaled up corner radius
        fill(255);
        textSize(21); // Scaled up from 14
        text(this.text, this.x + 15, this.y + 30); // Scaled up from 10, 20
    }

    evaluate(x) {
        // remove let keyword
        try {
            return new Function("x", `${this.text.replace(/let\s+/g, "")}; return x;`)(x);
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
        const childAreaBottom = childAreaTop + (this.getHeightInLines() - 1) * LINE_HEIGHT + 15; // Scaled up from 10
        return (
            mx > this.x + 30 && // Scaled up from 20
            mx < this.x + this.w - 30 && // Scaled up from 20
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
        textSize(21); // Scaled up from 14
        // First: calculate dynamic width based on children
        let baseWidth = max(textWidth(this.text) + 60, this.baseWidth); // base for header, scaled up from 40
        let maxWidth = 0;

        const allChildren = this instanceof IfElseBlock
            ? [...this.ifSection.children, ...this.elseSection.children]
            : this.children;

        for (let child of allChildren) {
            const childWidth = 60 + child.w; // Scaled up from 40
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

        this.w = lerp(this.w, max(baseWidth, maxWidth + 15), 0.1); // set width with padding, scaled up from 10

        // Now draw block shell
        noStroke();
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.y + 4.5, this.w, this.h, 9); // Scaled up from 3, 3, 6

        fill(isDragging ? '#966' : '#855');
        rect(this.x, this.y, this.w, this.h, 9); // Scaled up from 6

        // fill(255);
        // text(this.text, this.x + 10, this.y + 20);
        if (!(this instanceof ForLoopBlock)) {
            if (this.hasHeaderBlock(ConditionBlock)) {
                const condBlock = this.getHeaderBlock(ConditionBlock);
                fill(255);
                text(`${this.text.split("(")[0]}(`, this.x + 15, this.y + 30); // Scaled up from 10, 20
                // condBlock.x = this.x + textWidth(`${this.text.split("(")[0]}(`) + 15; // Scaled up from 10
                // condBlock.y = this.y + 0; // Scaled up from 2
                condBlock.x = lerp(condBlock.x, this.x + textWidth(`${this.text.split("(")[0]}(`) + 15, 0.1);
                condBlock.y = lerp(condBlock.y, this.y + 0, 0.1);
                condBlock.draw();
                text(`)`, condBlock.x + condBlock.w + 7.5, this.y + 30); // Scaled up from 5, 20
            } else {
                fill(255);
                text(`${this.text} (?)`, this.x + 15, this.y + 30); // Scaled up from 10, 20
            }
        }

        // Child container background
        // fill(50, 50, 50, 150);
        if (this instanceof ForLoopBlock) {
            // For loops get a blue-green tint
            fill(40, 60, 70, 200);
            stroke(70, 130, 180, 100); // Steel blue outline
        } else if (this instanceof WhileBlock) {
            // While loops get a purple tint
            fill(50, 40, 70, 200);
            stroke(120, 80, 160, 100); // Purple outline
        } else if (this instanceof IfElseBlock) {
            // If blocks get a warm tint
            fill(60, 45, 50, 200);
            stroke(160, 100, 80, 100); // Warm orange-brown outline
        } else {
            // Default color for other compound blocks
            fill(45, 50, 65, 200);
            stroke(80, 100, 140, 100); // Blue-grey outline
        }
        strokeWeight(1.5);
        let childHeight = this.getHeightInLines() - 1;
        rect(this.x + 30, this.y + this.h, this.w - 30, childHeight * LINE_HEIGHT + 15, 9); // Scaled up from 20, 10, 6
        noStroke();

        // Draw children
        let childY = this.y + this.h + 7.5; // Scaled up from 5
        for (let child of allChildren) {
            // child.x = this.x + 45; // Scaled up from 30
            // child.y = childY;
            child.x = lerp(child.x, this.x + 45, 0.1);
            child.y = lerp(child.y, childY, 0.1);
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
        textSize(19.5); // Scaled up from 13
        super(text, x, y);
        this.w = textWidth(text + '  ');
        this.h = 37.5; // Scaled up from 25
    }

    draw(isDragging = false) {
        textSize(19.5); // Scaled up from 13
        noStroke();
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.y + 4.5, this.w, this.h, 9); // Scaled up from 3, 3, 6
        fill(isDragging ? '#595' : '#494');
        rect(this.x, this.y, this.w, this.h, 9); // Scaled up from 6
        fill(255);
        text(this.text, this.x + 15, this.y + 25.5); // Scaled up from 10, 17
    }

    isHeaderOnly() {
        return true;
    }
}

let loopVariables = {};  // To track loop variables by name

class ForLoopBlock extends CompoundBlock {
    constructor(x, y) {
        super("for (", x, y);
        // this.init = "let i = 0";
        // this.cond = "i < 3";
        // this.inc = "i++";
        this.body = this.children;
        this.baseWidth = 255; // Scaled up from 170
        this.h = 37.5; // Scaled up from 25
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
        text("for (", this.x + 15, this.y + 24); // Scaled up from 10, 20

        let offset = this.x + textWidth("for (") + 15; // Scaled up from 10

        const init = this.getHeaderBlock(InitBlock);
        if (init) {
            // init.x = offset;
            // init.y = this.y; // Scaled up from 2
            init.x = lerp(init.x, offset, 0.1);
            init.y = lerp(init.y, this.y, 0.1);
            init.draw();
            offset += init.w + 15; // Scaled up from 10
        } else {
            text("?", offset, this.y + 24); // Scaled up from 20
            offset += 30; // Scaled up from 20
        }

        text(";", offset, this.y + 24); // Scaled up from 20
        offset += 22.5; // Scaled up from 15

        const cond = this.getHeaderBlock(ConditionBlock);
        if (cond) {
            // cond.x = offset;
            // cond.y = this.y; // Scaled up from 2
            cond.x = lerp(cond.x, offset, 0.1);
            cond.y = lerp(cond.y, this.y, 0.1);
            cond.draw();
            offset += cond.w + 15; // Scaled up from 10
        } else {
            text("?", offset, this.y + 24); // Scaled up from 20
            offset += 30; // Scaled up from 20
        }

        text(";", offset, this.y + 24); // Scaled up from 20
        offset += 22.5; // Scaled up from 15

        const inc = this.getHeaderBlock(IncBlock);
        if (inc) {
            // inc.x = offset;
            // inc.y = this.y; // Scaled up from 2
            inc.x = lerp(inc.x, offset, 0.1);
            inc.y = lerp(inc.y, this.y, 0.1);
            inc.draw();
            offset += inc.w + 15; // Scaled up from 10
        } else {
            text("?", offset, this.y + 24);
            offset += 30;
        }

        text(")", offset, this.y + 24); // Scaled up from 20
    }

    evaluate(x) {
        try {
            const initBlock = this.getHeaderBlock(InitBlock);
            const condBlock = this.getHeaderBlock(ConditionBlock);
            const incBlock = this.getHeaderBlock(IncBlock);

            if (!initBlock || !condBlock || !incBlock) {
                console.warn("Missing header blocks in for-loop");
                return x;
            }

            // Extract variable name from init block (assuming format "let X = Y")
            const varNameMatch = initBlock.text.match(/let\s+([a-zA-Z0-9_]+)\s*=/);
            const varName = varNameMatch ? varNameMatch[1] : "i";

            let result = x;

            // Start the loop
            for (let i = initBlock.value; eval(condBlock.text); i += incBlock.value) {
                // Store the loop variable in global object
                loopVariables[varName] = i;

                // Evaluate children with the loop variable context
                for (let child of this.children) {
                    let prevVal = result;
                    result = child.evaluate(result);

                    // Check if a break was triggered
                    if (result === "BREAK") {
                        // Return current values and exit loop
                        delete loopVariables[varName]; // Clean up
                        return prevVal;
                    }
                }
            }

            // Clean up the loop variable when done
            delete loopVariables[varName];

            return result;
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

// Create a simple x += i block
class AddIBlock extends CodeBlock {
    constructor(x, y) {
        super("x += i;", x, y);
        this.w = 150; // Scaled up from 100
        this.color = color(100, 160, 220);
    }

    evaluate(x) {
        // Get the i value from loop variables if available
        if ('i' in loopVariables) {
            return x + loopVariables['i'];
        } else {
            console.warn("Loop variable 'i' not found. Using 0 instead.");
            return x; // If not in a loop, don't change x
        }
    }

    serialize() {
        return {
            type: "AddIBlock",
            x: this.x,
            y: this.y,
            isLocked: this.isLocked
        };
    }
}

class IfElseBlock extends CompoundBlock {
    constructor(x, y) {
        super("if (...) { } else { }", x, y);
        // this.cond = "x % 2 === 0";
        this.ifSection = new SectionBlock("if", x, y + 52.5); // Scaled up from 35
        this.elseSection = new SectionBlock("else", x, y + 150); // Scaled up from 100
        this.baseWidth = 420; // Scaled up from 280
        this.h = 37.5; // Scaled up from 25
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
        textSize(21); // Scaled up from 14

        // Draw IF container
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.y + 4.5, this.w, this.h, 9); // Scaled up from 3, 3, 6
        fill(isDragging ? '#559' : '#458');
        rect(this.x, this.y, this.w, this.h, 9); // Scaled up from 6

        // Draw IF header
        fill(255);
        let offset = this.x + 15; // Scaled up from 10
        text("if (", offset, this.y + 24); // Scaled up from 16
        offset += textWidth("if (");

        const condBlock = this.getHeaderBlock(ConditionBlock);
        if (condBlock) {
            // condBlock.x = offset;
            // condBlock.y = this.y; // Scaled up from 2
            condBlock.x = lerp(condBlock.x, offset, 0.1);
            condBlock.y = lerp(condBlock.y, this.y, 0.1);
            condBlock.draw();
            offset += condBlock.w + 7.5; // Scaled up from 5
        } else {
            text("?", offset, this.y + 24); // Scaled up from 16
            offset += 30; // Scaled up from 20
        }

        text(")", offset, this.y + 24); // Scaled up from 15

        // IF section
        this.ifSection.x = this.x + 30; // Scaled up from 20
        this.ifSection.y = this.y + this.h;
        this.ifSection.draw();

        // Draw ELSE container
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.ifSection.y + this.ifSection.getHeightInLines() * LINE_HEIGHT + 15, this.w, this.h, 9); // Scaled up from 3, 10, 6

        // ELSE block header
        const elseY = this.ifSection.y + this.ifSection.getHeightInLines() * LINE_HEIGHT + 15; // Scaled up from 10
        fill(isDragging ? '#559' : '#458');
        rect(this.x, elseY, this.w, this.h, 9); // Scaled up from 6
        fill(255);
        text("else", this.x + 15, elseY + 24); // Scaled up from 10, 16

        // ELSE section
        this.elseSection.x = this.x + 30; // Scaled up from 20
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
        const bottom = top + this.getHeightInLines() * LINE_HEIGHT + 15; // Scaled up from 10
        return mx > this.x && mx < this.x + 360 && my > top && my < bottom; // Scaled up from 240
    }

    addChild(block) {
        this.children.push(block);
    }

    getHeightInLines() {
        return 0 + this.children.reduce((sum, c) => sum + c.getHeightInLines(), 0);
    }

    draw() {
        // Use a slightly different color for if/else sections
        if (this.label === "if") {
            fill(70, 55, 60, 200); // Warmer color for if
            stroke(160, 100, 80, 70);
        } else if (this.label === "else") {
            fill(60, 55, 70, 200); // Slightly purple for else
            stroke(140, 100, 120, 70);
        } else {
            fill(50, 55, 65, 200); // Default section color
            stroke(80, 100, 140, 70);
        }
        textSize(21); // Scaled up from 14
        // text(this.label, this.x + 5, this.y + 15);
        strokeWeight(1.5);
        rect(this.x, this.y, 360, this.getHeightInLines() * LINE_HEIGHT + 15, 9); // Scaled up from 240, 10, 6
        noStroke();

        let childY = this.y + 15; // Scaled up from 10
        for (let child of this.children) {
            // child.x = this.x + 15; // Scaled up from 10
            // child.y = childY;
            child.x = lerp(child.x, this.x + 15, 0.1);
            child.y = lerp(child.y, childY, 0.1);
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
        this.baseWidth = 165; // Scaled up from 110
    }

    evaluate_cond(x) {
        const parts = this.cond.trim().split(/\s+/);
        let cond = parts[0];
        let val = parts[1];
        return eval(`x ${cond} ${val}`);
    }

    evaluate(x) {
        try {
            const condBlock = this.getHeaderBlock(ConditionBlock);

            if (!condBlock) {
                console.warn("Missing condition block in while-loop");
                return x;
            }

            let maxIterations = 10000;
            let count = 0;
            let result = x;

            while (condBlock.evaluateCondition(result) && count++ < maxIterations) {
                for (let child of this.children) {
                    let prevVal = result;
                    result = child.evaluate(result);

                    // Check for break
                    if (result === "BREAK") {
                        return prevVal; // Exit loop if break is encountered
                    }
                }
            }

            if (count >= maxIterations) {
                console.warn("Max iterations reached");
            }

            return result;
        } catch (e) {
            console.error("While Error:", e);
            return x;
        }
    }

    serialize() {
        return {
            type: "while",
            cond: this.cond,
            body: this.children.map(b => b.serialize())
        };
    }
}

class BreakBlock extends CodeBlock {
    constructor(x, y) {
        super("break;", x, y);
        this.w = 150; // Scaled up from 100
        this.color = color(200, 100, 70);
    }

    draw(isDragging = false) {
        textSize(21); // Scaled up from 14
        // Drop shadow
        fill(50, 50, 50, 150);
        rect(this.x + 4.5, this.y + 4.5, this.w, this.h, 9); // Scaled up from 3, 3, 6

        // Main block
        fill(this.isLocked ? '#865' : (isDragging ? '#a65' : this.color));
        rect(this.x, this.y, this.w, this.h, 9); // Scaled up from 6

        fill(255);
        textAlign(CENTER, CENTER);
        text(this.text, this.x + this.w / 2, this.y + this.h / 2);
        textAlign(LEFT, BASELINE);
    }

    evaluate(x) {
        // Simply return the special "BREAK" signal
        return "BREAK";
    }

    serialize() {
        return {
            type: "BreakBlock",
            x: this.x,
            y: this.y,
            isLocked: this.isLocked
        };
    }
}

class PrintBlock extends CodeBlock {
    constructor(x, y) {
        super("print(x);", x, y);
        this.w = 180; // Scaled up from 120
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
            // Create a function that has access to both x and loopVariables
            // This allows conditions to reference the loop variable i
            return new Function("x", "loopVariables",
                `const i = loopVariables.i; // Make i available if it exists
             return (${this.text});`
            )(x, loopVariables);
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

// Note: LINE_HEIGHT constant should also be scaled by 1.5x
// Add this at the top of your code, assuming it was previously defined:
// const LINE_HEIGHT = 30; // Scaled up from 20 (assuming original was 20)
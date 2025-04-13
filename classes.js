
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
        textSize(14);
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
        textSize(14);
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
        textSize(13);
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


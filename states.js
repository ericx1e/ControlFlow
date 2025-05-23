/**
 * Problem class - represents a programming challenge with predefined code blocks
 * and an inventory of available blocks
 */
class Problem {
  constructor(id, title, description, initialValue = 1, targetValue = null) {
    this.id = id;                      // Unique identifier for the problem
    this.title = title;                // Title of the problem
    this.description = description;    // Problem description
    this.initialValue = initialValue;  // Starting value for x
    this.targetValue = targetValue;    // Target value for x (goal)
    this.predefinedBlocks = [];        // Pre-placed blocks in the code area
    this.availableBlocks = [];         // Blocks available in the inventory
    this.maxBlockCounts = {};          // Limits on how many of each block can be used
    this.attemptsMade = 0;             // Number of solution attempts
    this.completionCriteria = null;    // Function that determines if problem is solved
  }

  /**
   * Add a block to the predefined blocks (starting blocks)
   * @param {CodeBlock} block - Block to add to the predefined blocks
   */
  addPredefinedBlock(block) {
    this.predefinedBlocks.push(block);
    return this;
  }

  /**
   * Add a block to the available inventory
   * @param {CodeBlock} block - Block to add to inventory
   * @param {number} maxCount - Maximum number of this block that can be used (null for unlimited)
   */
  addAvailableBlock(block, maxCount = null) {
    this.availableBlocks.push(block);
    if (maxCount !== null) {
      this.maxBlockCounts[block.constructor.name] = maxCount;
    }
    return this;
  }

  /**
   * Set a custom completion criteria
   * @param {Function} criteriaFn - Function(x) that returns true if problem is solved
   */
  setCompletionCriteria(criteriaFn) {
    this.completionCriteria = criteriaFn;
    return this;
  }

  /**
   * Check if a solution meets the completion criteria
   * @param {number} result - The result of evaluating the code
   * @returns {boolean} Whether the solution is correct
   */
  checkSolution(result) {
    this.attemptsMade++;

    // If custom criteria is set, use that
    if (this.completionCriteria) {
      return this.completionCriteria(result);
    }

    // Otherwise, check if result matches target value (round to 3 decimal places)
    return this.targetValue !== null && result.toFixed(3) === this.targetValue.toFixed(3);
  }

  /**
   * Create a fresh copy of the problem for the user to work with
   * @returns {Object} The initial state for this problem
   */
  initialize() {
    // Create deep copies of blocks to avoid modifying the originals
    const predefinedBlocks = this.predefinedBlocks.map(block => {
      // return deserialize(block.serialize());
      return block;
    });

    const availableBlocks = this.availableBlocks.map(block => {
      // return deserialize(block.serialize());
      return block;
    });

    return {
      id: this.id,
      title: this.title,
      description: this.description,
      initialValue: this.initialValue,
      targetValue: this.targetValue,
      predefinedBlocks,
      availableBlocks,
      maxBlockCounts: { ...this.maxBlockCounts }
    };
  }

  /**
   * Create a JSON representation of the problem
   * @returns {Object} JSON object representing the problem
   */
  serialize() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      initialValue: this.initialValue,
      targetValue: this.targetValue,
      predefinedBlocks: this.predefinedBlocks.map(b => b.serialize()),
      availableBlocks: this.availableBlocks.map(b => b.serialize()),
      maxBlockCounts: this.maxBlockCounts
    };
  }

  /**
   * Create a Problem from a serialized object
   * @param {Object} data - Serialized problem data
   * @returns {Problem} Reconstructed Problem object
   */
  static deserialize(data) {
    const problem = new Problem(
      data.id,
      data.title,
      data.description,
      data.initialValue,
      data.targetValue
    );

    problem.predefinedBlocks = data.predefinedBlocks.map(b => deserialize(b));
    problem.availableBlocks = data.availableBlocks.map(b => deserialize(b));
    problem.maxBlockCounts = data.maxBlockCounts || {};

    return problem;
  }
}

/**
 * User class - represents a player with their progress and inventory
 */
class User {
  constructor(id, name) {
    this.id = id;                  // Unique identifier
    this.name = name;              // User name
    this.inventory = {};           // Block types and quantities
    this.completedProblems = {};   // Problems solved with their scores
    this.currentProblem = null;    // Current problem the user is working on
    this.currentBlocks = [];       // Current blocks in the code area
    this.score = 0;                // Overall score
  }

  /**
   * Add a block type to user's inventory
   * @param {string} blockType - Type of block to add
   * @param {number} quantity - Quantity to add
   */
  addToInventory(blockType, quantity = 1) {
    if (!this.inventory[blockType]) {
      this.inventory[blockType] = 0;
    }
    this.inventory[blockType] += quantity;
  }

  /**
   * Remove a block from user's inventory
   * @param {string} blockType - Type of block to remove
   * @param {number} quantity - Quantity to remove
   * @returns {boolean} Whether the removal was successful
   */
  removeFromInventory(blockType, quantity = 1) {
    if (!this.inventory[blockType] || this.inventory[blockType] < quantity) {
      return false;
    }
    this.inventory[blockType] -= quantity;
    return true;
  }

  /**
   * Start a new problem
   * @param {Problem} problem - The problem to start
   */
  startProblem(problem) {
    const initialState = problem.initialize();
    this.currentProblem = initialState.id;
    this.currentBlocks = initialState.predefinedBlocks;

    // Set up code blocks array with nulls for empty spaces
    const blocks = [];
    for (let i = 0; i < NUM_LINES; i++) blocks.push(null);

    // Place predefined blocks
    let lineIndex = 0;
    for (const block of initialState.predefinedBlocks) {
      blocks[lineIndex] = block;
      lineIndex += block.getHeightInLines();
    }

    return {
      problem: initialState,
      blocks: blocks,
      availableBlocks: initialState.availableBlocks
    };
  }

  /**
   * Submit a solution for the current problem
   * @param {Array} blocks - The blocks in the code area
   * @param {Problem} problem - The problem being solved
   * @returns {Object} Result of the submission
   */
  submitSolution(blocks, problem) {
    // Run the code
    let x = problem.initialValue;
    for (let block of blocks) {
      if (block) x = block.evaluate(x);
    }

    const isCorrect = problem.checkSolution(x);

    if (isCorrect) {
      // Calculate score (could be based on number of blocks, attempt count, etc.)
      const score = 100 - problem.attemptsMade * 10;

      // Record completion
      this.completedProblems[problem.id] = {
        completed: true,
        //   score: Math.max(score, 10),  // Minimum score of 10
        //   solution: saveLayout(blocks)
      };

      this.score += score;
    }

    return {
      result: x,
      isCorrect,
      attemptsMade: problem.attemptsMade
    };
  }

  /**
   * Save user data to local storage
   */
  save() {
    localStorage.setItem('userData', JSON.stringify(this.serialize()));
  }

  /**
   * Create a JSON representation of the user
   * @returns {Object} JSON object representing the user
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      inventory: this.inventory,
      completedProblems: this.completedProblems,
      currentProblem: this.currentProblem,
      currentBlocks: this.currentBlocks.map(b => b ? b.serialize() : null),
      score: this.score
    };
  }

  /**
   * Create a User from a serialized object
   * @param {Object} data - Serialized user data
   * @returns {User} Reconstructed User object
   */
  static load() {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;

    return User.deserialize(JSON.parse(userData));
  }

  static deserialize(data) {
    const user = new User(data.id, data.name);
    user.inventory = data.inventory || {};
    user.completedProblems = data.completedProblems || {};
    user.currentProblem = data.currentProblem;
    user.currentBlocks = (data.currentBlocks || []).map(b => deserialize(b));
    user.score = data.score || 0;

    return user;
  }
}

/**
 * ProblemManager - manages the set of problems available in the game
 */
class ProblemManager {
  constructor() {
    this.problems = {};
    this.problemOrder = [];
  }

  /**
   * Add a problem to the manager
   * @param {Problem} problem - Problem to add
   */
  addProblem(problem) {
    this.problems[problem.id] = problem;
    this.problemOrder.push(problem.id);
  }

  /**
   * Get a problem by ID
   * @param {string} id - Problem ID
   * @returns {Problem} The requested problem
   */
  getProblem(id) {
    return this.problems[id];
  }

  /**
   * Get the next problem in sequence
   * @param {string} currentId - Current problem ID
   * @returns {Problem} The next problem
   */
  getNextProblem(currentId) {
    const currentIndex = this.problemOrder.indexOf(currentId);
    if (currentIndex < 0 || currentIndex >= this.problemOrder.length - 1) {
      return null;
    }

    const nextId = this.problemOrder[currentIndex + 1];
    return this.problems[nextId];
  }

  //   /**
  //    * Create a set of predefined problems for the game
  //    * @returns {ProblemManager} Populated problem manager
  //    */
  //   static createDefaultProblems() {
  //     const manager = new ProblemManager();

  //     // Problem 1: Double the input to reach 8
  //     const problem1 = new Problem(
  //       'p1',
  //       'Double Trouble',
  //       'Make the function return 8 by doubling the input value.',
  //       4,  // initial value
  //       8   // target value
  //     );
  //     problem1.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));

  //     // Test blocks
  //     problem1.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START + 40));
  //     problem1.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START + 40));
  //     problem1.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 40));
  //     problem1.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 80));
  //     problem1.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
  //     problem1.addAvailableBlock(new ConditionBlock('i < 10', SIDEBAR_X, CODE_Y_START + 160));
  //     problem1.addAvailableBlock(new ConditionBlock('i <= 5', SIDEBAR_X, CODE_Y_START + 180));
  //     problem1.addAvailableBlock(new ConditionBlock('i <= 5', SIDEBAR_X, CODE_Y_START + 200));
  //     problem1.addAvailableBlock(new ConditionBlock('x < 5', SIDEBAR_X, CODE_Y_START + 220));
  //     problem1.addAvailableBlock(new IfElseBlock('x < 5', SIDEBAR_X, CODE_Y_START + 220));
  //     problem1.addAvailableBlock(new PrintBlock(SIDEBAR_X, CODE_Y_START + 220));


  //     manager.addProblem(problem1);

  //     // Problem 2: Reach 10 with addition and multiplication
  //     const problem2 = new Problem(
  //       'p2',
  //       'Perfect 10',
  //       'Starting with x = 2, reach exactly 10 using addition and multiplication operations.',
  //       2,  // initial value
  //       8  // target value
  //     );
  //     problem2.addAvailableBlock(new CodeBlock("x += 2;", SIDEBAR_X, CODE_Y_START));
  //     problem2.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START + 40));
  //     manager.addProblem(problem2);

  //     // Problem 3: Use a for loop to calculate 2^4
  //     const problem3 = new Problem(
  //       'p3',
  //       'Power Up',
  //       'Starting with x = 1, use a for loop to calculate 2^4 (2 to the power of 4).',
  //       1,  // initial value
  //       16  // target value
  //     );
  //     problem3.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
  //     problem3.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
  //     manager.addProblem(problem3);

  //     // Problem 4: Use if-else to handle odd/even numbers
  //     const problem4 = new Problem(
  //       'p4',
  //       'Odd or Even',
  //       'If the input is even, multiply it by 2. If it\'s odd, add 1 to it first, then multiply by 2.',
  //       5,  // initial value
  //       12  // target value
  //     );
  //     problem4.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START));
  //     problem4.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START));
  //     problem4.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
  //     manager.addProblem(problem4);

  //     // Problem 5: Use a while loop to divide by 2 until below 10
  //     const problem5 = new Problem(
  //       'p5',
  //       'Halving Time',
  //       'Use a while loop to divide x by 2 until it\'s less than 10.',
  //       80,  // initial value
  //       5   // target value
  //     );
  //     problem5.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START));
  //     problem5.addAvailableBlock(new CodeBlock("x /= 2;", SIDEBAR_X, CODE_Y_START));
  //     manager.addProblem(problem5);

  //     return manager;
  //   }

  /**
   * Create a set of predefined problems based on the specifications
   * @returns {ProblemManager} Populated problem manager
   */
  static setProblems() {
    const manager = new ProblemManager();

    // Problem 1: Simple Addition (Fully Solvable)
    const problem1 = new Problem(
      'p1',
      'Simple Addition',
      'Add 1 to the input value to reach the target.',
      1,  // initial value
      2   // target value
    );
    problem1.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START));
    // problem1.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START + 40));
    // problem1.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START + 40));
    // problem1.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 40));
    // problem1.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 80));
    // problem1.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    // problem1.addAvailableBlock(new ConditionBlock('i < 10', SIDEBAR_X, CODE_Y_START + 160));
    // problem1.addAvailableBlock(new ConditionBlock('i <= 5', SIDEBAR_X, CODE_Y_START + 180));
    // problem1.addAvailableBlock(new ConditionBlock('x <= 5', SIDEBAR_X, CODE_Y_START + 200));
    manager.addProblem(problem1);

    // Problem 2: Doubling Up (Fully Solvable)
    const problem2 = new Problem(
      'p2',
      'Doubling Up',
      'Double the input value to reach the target.',
      5,  // initial value
      10  // target value
    );
    problem2.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
    manager.addProblem(problem2);

    // Problem 3: Basic Loop (Fully Solvable)
    const problem3 = new Problem(
      'p3',
      'Basic Loop',
      'Use a for loop to add 5 to the value.',
      4,  // initial value
      9   // target value
    );
    problem3.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem3.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 40));
    problem3.addAvailableBlock(new ConditionBlock("i < 2", SIDEBAR_X, CODE_Y_START + 80));
    problem3.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem3.addAvailableBlock(new CodeBlock("x += 2;", SIDEBAR_X, CODE_Y_START + 160));
    problem3.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START + 200));
    manager.addProblem(problem3);

    // Problem 4: Conditional Logic (Fully Solvable)
    const problem4 = new Problem(
      'p4',
      'Conditional Logic',
      'Use if-else logic to check if the value is even or odd.',
      4,    // initial value
      8     // target value (double if even)
    );
    problem4.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START));
    problem4.addAvailableBlock(new ConditionBlock("x % 2 === 0", SIDEBAR_X, CODE_Y_START + 40));
    problem4.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START + 80));
    problem4.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START + 120));
    manager.addProblem(problem4);

    // Problem 5: Triple Sum (Fully Solvable)
    const problem5 = new Problem(
      'p5',
      'Triple Sum',
      'Add the same value three times using a loop.',
      10,    // initial value
      25     // target value (10 + 5 + 5 + 5 = 25)
    );
    problem5.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem5.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 40));
    problem5.addAvailableBlock(new ConditionBlock("i < 3", SIDEBAR_X, CODE_Y_START + 80));
    problem5.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem5.addAvailableBlock(new CodeBlock("x += 5;", SIDEBAR_X, CODE_Y_START + 160));
    manager.addProblem(problem5);

    // Problem 6: Division Challenge (Missing a key block)
    // Player needs to buy a division block from the shop
    const problem6 = new Problem(
      'p6',
      'Division Challenge',
      'Divide the input value to reach the target. You might need to visit the shop.',
      100,  // initial value
      5     // target value
    );
    problem6.addAvailableBlock(new CodeBlock("x -= 20;", SIDEBAR_X, CODE_Y_START));
    problem6.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START + 40));
    problem6.addAvailableBlock(new CodeBlock("x += 5;", SIDEBAR_X, CODE_Y_START + 80));
    // Missing: x /= 20 or similar division operation
    manager.addProblem(problem6);

    // Problem 7: Triangle Numbers
    const problem7 = new Problem(
      'p7',
      'Triangle Numbers',
      'Use loops to calculate the 6th triangle number (sum of 1 to 6).',
      0,    // initial value
      21    // target value (1+2+3+4+5+6=21)
    );
    problem7.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem7.addAvailableBlock(new InitBlock(1, SIDEBAR_X, CODE_Y_START + 40));
    problem7.addAvailableBlock(new ConditionBlock("i <= 6", SIDEBAR_X, CODE_Y_START + 80));
    problem7.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem7.addAvailableBlock(new AddIBlock(SIDEBAR_X, CODE_Y_START + 160));
    manager.addProblem(problem7);

    // Problem 8: Odd Even Counter
    const problem8 = new Problem(
      'p8',
      'Odd Even Counter',
      'Use a single loop to add 1 for each even number from 1-10.',
      0,     // initial value
      5      // target value (5 even numbers)
    );
    problem8.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem8.addAvailableBlock(new InitBlock(1, SIDEBAR_X, CODE_Y_START + 40));
    problem8.addAvailableBlock(new ConditionBlock("i <= 10", SIDEBAR_X, CODE_Y_START + 80));
    problem8.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem8.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 160));
    problem8.addAvailableBlock(new ConditionBlock("i % 2 === 0", SIDEBAR_X, CODE_Y_START + 200));
    problem8.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START + 240));
    manager.addProblem(problem8);

    // Problem 9: FizzBuzz Simplified
    const problem9 = new Problem(
      'p9',
      'FizzBuzz Simplified',
      'Count from 1-15. Add 2 for multiples of 3, subtract 1 for multiples of 5.',
      0,     // initial value
      8      // target value (2+2+2-1+2)
    );
    problem9.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem9.addAvailableBlock(new InitBlock(1, SIDEBAR_X, CODE_Y_START + 40));
    problem9.addAvailableBlock(new ConditionBlock("i <= 15", SIDEBAR_X, CODE_Y_START + 80));
    problem9.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem9.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 160));
    problem9.addAvailableBlock(new ConditionBlock("i % 3 === 0", SIDEBAR_X, CODE_Y_START + 200));
    problem9.addAvailableBlock(new CodeBlock("x += 2;", SIDEBAR_X, CODE_Y_START + 240));
    problem9.addAvailableBlock(new ConditionBlock("i % 5 === 0", SIDEBAR_X, CODE_Y_START + 280));
    problem9.addAvailableBlock(new CodeBlock("x -= 1;", SIDEBAR_X, CODE_Y_START + 320));
    manager.addProblem(problem9);

    // Problem 10: Loop Breaking
    const problem10 = new Problem(
      'p10',
      'Loop Breaking',
      'Use a specially crafted loop that adds up to exactly the target. Be careful!',
      0,     // initial value
      10     // target value
    );
    problem10.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
    problem10.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 40));
    problem10.addAvailableBlock(new ConditionBlock("i < 10", SIDEBAR_X, CODE_Y_START + 80));
    problem10.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 120));
    problem10.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START + 160));
    problem10.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 200));
    problem10.addAvailableBlock(new ConditionBlock("x >= 10", SIDEBAR_X, CODE_Y_START + 240));
    // Special "break" block - this is a unique concept for this problem
    problem10.addAvailableBlock(new BreakBlock(SIDEBAR_X, CODE_Y_START + 320));
    manager.addProblem(problem10);

    // Problem 11: Collatz Steps
    const problem11 = new Problem(
      'p11',
      'Collatz Steps',
      'Apply Collatz operations to reach 1: If even, divide by 2; if odd, multiply by 3 and add 1.',
      6,     // initial value 
      1      // target value
    );
    problem11.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START));
    problem11.addAvailableBlock(new ConditionBlock("x > 1", SIDEBAR_X, CODE_Y_START + 40));
    problem11.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 80));
    problem11.addAvailableBlock(new ConditionBlock("x % 2 === 0", SIDEBAR_X, CODE_Y_START + 120));
    problem11.addAvailableBlock(new CodeBlock("x = x / 2;", SIDEBAR_X, CODE_Y_START + 160));
    problem11.addAvailableBlock(new CodeBlock("x = 3 * x + 1;", SIDEBAR_X, CODE_Y_START + 200));
    manager.addProblem(problem11);

    // Problem 12: Pi Approximation
    const problem12 = new Problem(
      'p12',
      'Pi Approximation',
      'Transform the value to create a famous approximation of π. Visit the shop for division!',
      0,    // initial value
      3.14, // target value (approximately π)
    );
    problem12.addAvailableBlock(new CodeBlock("x = 0;", SIDEBAR_X, CODE_Y_START)); // Reset in case they mess up
    problem12.addAvailableBlock(new CodeBlock("x -= 42;", SIDEBAR_X, CODE_Y_START + 40)); // Distraction
    problem12.addAvailableBlock(new CodeBlock("x *= 3;", SIDEBAR_X, CODE_Y_START + 80)); // Distraction
    problem12.addAvailableBlock(new CodeBlock("x /= 100;", SIDEBAR_X, CODE_Y_START + 120)); // Distraction
    problem12.addAvailableBlock(new CodeBlock("x += 100;", SIDEBAR_X, CODE_Y_START + 160)); // Distraction
    manager.addProblem(problem12);

    // Problem 13: The Answer to Everything
    const problem13 = new Problem(
      'p13',
      'The Answer to Everything',
      'According to "The Hitchhiker\'s Guide to the Galaxy", what is the answer to life, the universe, and everything?',
      0,    // initial value
      42      // target value
    );
    problem13.addAvailableBlock(new CodeBlock("x += 80;", SIDEBAR_X, CODE_Y_START));
    problem13.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START + 40));
    problem13.addAvailableBlock(new CodeBlock("x /= 4;", SIDEBAR_X, CODE_Y_START + 80));
    // Missing: x = Math.abs(x) - must be purchased from shop
    manager.addProblem(problem13);

    // Problem 14: Devil's Number
    const problem14 = new Problem(
      'p14',
      'Devil\'s Number',
      'Turn the lucky number 777 into the devil\'s number 666.',
      777,    // initial value
      666     // target value
    );
    problem14.addAvailableBlock(new CodeBlock("x -= 100;", SIDEBAR_X, CODE_Y_START));
    problem14.addAvailableBlock(new CodeBlock("x -= 10;", SIDEBAR_X, CODE_Y_START + 40));
    problem14.addAvailableBlock(new CodeBlock("x -= 5;", SIDEBAR_X, CODE_Y_START + 80));
    // Intentionally missing x -= 1 or similar to make the precise adjustment
    manager.addProblem(problem14);

    // Problem 15: Binary Millennium
    const problem15 = new Problem(
      'p15',
      'Binary Millennium',
      'Create the binary millennium (2^10 = 1024), often mistaken for exactly 1000 in computing.',
      1,      // initial value
      1024    // target value
    );
    problem15.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START)); // Can double repeatedly
    problem15.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START + 40));
    problem15.addAvailableBlock(new InitBlock(0, SIDEBAR_X, CODE_Y_START + 80));
    problem15.addAvailableBlock(new ConditionBlock("i < 5", SIDEBAR_X, CODE_Y_START + 120)); // Not enough iterations
    problem15.addAvailableBlock(new IncBlock(1, SIDEBAR_X, CODE_Y_START + 160));
    // Missing: Math.pow(2, 10) or a loop that goes to 10 iterations
    manager.addProblem(problem15);

    // Problem 16: Golden Ratio
    const problem16 = new Problem(
      'p16',
      'Golden Ratio',
      'Calculate the golden ratio (φ ≈ 1.618), one of mathematics\' most beautiful numbers. (Automatically round to 3 decimal places)',
      1,      // initial value
      1.618   // target value
    );
    problem16.addAvailableBlock(new CodeBlock("x += 0.5;", SIDEBAR_X, CODE_Y_START));
    problem16.addAvailableBlock(new CodeBlock("x += 0.1;", SIDEBAR_X, CODE_Y_START + 40));
    problem16.addAvailableBlock(new CodeBlock("x += 0.018;", SIDEBAR_X, CODE_Y_START + 80));
    problem16.addAvailableBlock(new CodeBlock("x = Math.sqrt(x);", SIDEBAR_X, CODE_Y_START + 80));
    // Missing: x = (1 + Math.sqrt(5)) / 2 - needs square root from shop
    manager.addProblem(problem16);

    // Problem 17: Perfect Temperature
    const problem17 = new Problem(
      'p17',
      'Perfect Temperature',
      'Convert a hot summer day of 86°F to a comfortable Celsius temperature.',
      86,     // initial value (°F)
      30      // target value (°C)
    );
    problem17.addAvailableBlock(new CodeBlock("x -= 32;", SIDEBAR_X, CODE_Y_START));
    problem17.addAvailableBlock(new CodeBlock("x += 32;", SIDEBAR_X, CODE_Y_START + 40));
    problem17.addAvailableBlock(new CodeBlock("x *= 9;", SIDEBAR_X, CODE_Y_START + 80));
    problem17.addAvailableBlock(new CodeBlock("x /= 9;", SIDEBAR_X, CODE_Y_START + 120));
    // Missing: x *= 5/9 or similar - needs multiplication by fraction from shop
    manager.addProblem(problem17);

    // Problem 18: Perfect Square
    const problem18 = new Problem(
      'p18',
      'Perfect Square',
      'Find the number that, when squared, equals 256. A perfect square problem!',
      256,    // initial value
      16      // target value (√256 = 16)
    );
    problem18.addAvailableBlock(new CodeBlock("x /= 16;", SIDEBAR_X, CODE_Y_START));
    problem18.addAvailableBlock(new CodeBlock("x /= 4;", SIDEBAR_X, CODE_Y_START + 40));
    problem18.addAvailableBlock(new CodeBlock("x *= 4;", SIDEBAR_X, CODE_Y_START + 80));
    // Missing: x = Math.sqrt(x) - needs square root from shop
    manager.addProblem(problem18);

    // Problem 19: Lunar Calendar
    const problem19 = new Problem(
      'p19',
      'Lunar Calendar',
      'Calculate how many days are in 13 lunar months (29.5 days each). Round to a whole number.',
      13,     // initial value (months)
      384     // target value (29.5 * 13 = 383.5, rounded to 384)
    );
    problem19.addAvailableBlock(new CodeBlock("x *= 29;", SIDEBAR_X, CODE_Y_START));
    problem19.addAvailableBlock(new CodeBlock("x += 4;", SIDEBAR_X, CODE_Y_START + 40));
    problem19.addAvailableBlock(new CodeBlock("x += 0.5;", SIDEBAR_X, CODE_Y_START + 80));
    // Missing: Math.round(x) or similar rounding operation from shop
    manager.addProblem(problem19);

    // Problem 20: Tax Calculator
    const problem20 = new Problem(
      'p20',
      'Tax Calculator',
      'Calculate 8.25% sales tax on a $120 purchase and add it to the total.',
      120,    // initial value (purchase amount)
      129.90  // target value (120 + 9.90 tax)
    );
    problem20.addAvailableBlock(new CodeBlock("x += 9;", SIDEBAR_X, CODE_Y_START));
    problem20.addAvailableBlock(new CodeBlock("x += 0.9;", SIDEBAR_X, CODE_Y_START + 40));
    problem20.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START + 80));
    problem20.addAvailableBlock(new ConditionBlock("x < 129.9", SIDEBAR_X, CODE_Y_START + 120));
    problem20.addAvailableBlock(new CodeBlock("x += 0.1;", SIDEBAR_X, CODE_Y_START + 160));
    // Missing: x *= 1.0825 or x += x * 0.0825 - requires shop purchase
    manager.addProblem(problem20);

    // Problem 21: Palindrome Detector
    const problem21 = new Problem(
      'p21',
      'Palindrome Detector',
      'Determine if 12321 is a palindrome (reads the same forwards and backwards). 1 for yes, 0 for no.',
      12321,  // initial value
      1       // target value (yes, it's a palindrome)
    );
    problem21.addAvailableBlock(new CodeBlock("x = 0;", SIDEBAR_X, CODE_Y_START)); // Set to "no"
    problem21.addAvailableBlock(new CodeBlock("x = 1;", SIDEBAR_X, CODE_Y_START + 40)); // Set to "yes"
    problem21.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 80));
    problem21.addAvailableBlock(new ConditionBlock("x === 12321", SIDEBAR_X, CODE_Y_START + 120));
    // Missing: String reverse and compare operation needed from shop
    manager.addProblem(problem21);

    // Problem 22: Unlucky Floor
    const problem22 = new Problem(
      'p22',
      'Unlucky Floor',
      'Many buildings skip the 13th floor due to superstition. Convert actual floor 14 to displayed floor 13.',
      14,     // initial value (actual floor)
      13      // target value (displayed floor)
    );
    problem22.addAvailableBlock(new CodeBlock("x = 13;", SIDEBAR_X, CODE_Y_START)); // Direct solution (too easy)
    problem22.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START + 40));
    problem22.addAvailableBlock(new ConditionBlock("x > 13", SIDEBAR_X, CODE_Y_START + 80));
    problem22.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START + 120)); // Wrong direction
    // Missing: x -= 1 block (must be purchased from shop)
    manager.addProblem(problem22);

    return manager;
  }

  /**
 * Load problems from the JSON file and populate the problem manager
 * @returns {Promise<ProblemManager>} Populated problem manager
 */
  static loadProblemsFromJSON() {
    return new Promise((resolve, reject) => {
      // Create a new problem manager
      const manager = new ProblemManager();

      // Fetch the problems.json file
      fetch('problems.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Process each problem in the JSON
          data.problems.forEach(problemData => {
            // Create a new problem
            const problem = new Problem(
              problemData.id,
              problemData.title,
              problemData.description,
              problemData.initialValue,
              problemData.targetValue
            );


            // Add available blocks
            if (problemData.availableBlocks) {
              problemData.availableBlocks.forEach(blockData => {
                let block = createBlockFromData(blockData);
                if (block) {
                  problem.addAvailableBlock(block);
                }
              });
            }

            console.log(problem)

            // Add the problem to the manager
            manager.addProblem(problem);
          });

          // Resolve the promise with the populated manager
          resolve(manager);
        })
        .catch(error => {
          console.error('Error loading problems:', error);
          // If error occurs, create default problems instead
          const defaultManager = ProblemManager.createDefaultProblems();
          resolve(defaultManager);
        });
    });
  }


}

/**
   * Create a block object from JSON data
   * @param {Object} blockData - Block data from JSON
   * @returns {CodeBlock|ForLoopBlock|WhileBlock|IfElseBlock} The created block
   */
function createBlockFromData(blockData) {
  let block;

  switch (blockData.type) {
    case 'code':
      block = new CodeBlock(blockData.text, SIDEBAR_X, CODE_Y_START);
      break;

    case 'for':
      block = new ForLoopBlock(SIDEBAR_X, CODE_Y_START);

      // Add header blocks if specified
      if (blockData.headerBlocks) {
        if (blockData.headerBlocks.InitBlock) {
          const initBlock = new InitBlock(
            blockData.headerBlocks.InitBlock.text,
            0, 0
          );
          block.addHeaderBlock(initBlock);
        }

        if (blockData.headerBlocks.ConditionBlock) {
          const condBlock = new ConditionBlock(
            blockData.headerBlocks.ConditionBlock.text,
            0, 0
          );
          block.addHeaderBlock(condBlock);
        }

        if (blockData.headerBlocks.IncBlock) {
          const incBlock = new IncBlock(
            blockData.headerBlocks.IncBlock.text,
            0, 0
          );
          block.addHeaderBlock(incBlock);
        }
      }
      break;

    case 'while':
      block = new WhileBlock(SIDEBAR_X, CODE_Y_START);

      // Add condition block if specified
      if (blockData.headerBlocks && blockData.headerBlocks.ConditionBlock) {
        const condBlock = new ConditionBlock(
          blockData.headerBlocks.ConditionBlock.text,
          0, 0
        );
        block.addHeaderBlock(condBlock);
      }
      break;

    case 'ifelse':
      block = new IfElseBlock(SIDEBAR_X, CODE_Y_START);

      // Set condition if specified
      if (blockData.headerBlocks && blockData.headerBlocks.ConditionBlock) {
        const condBlock = new ConditionBlock(
          blockData.headerBlocks.ConditionBlock.text,
          0, 0
        );
        block.addHeaderBlock(condBlock);
      }
      break;

    case 'print':
      block = new PrintBlock(SIDEBAR_X, CODE_Y_START);
      break;

    // Header blocks for compound blocks
    case 'condition':
      block = new ConditionBlock(blockData.text, SIDEBAR_X, CODE_Y_START);
      break;

    case 'init':
      block = new InitBlock(blockData.text, SIDEBAR_X, CODE_Y_START);
      break;

    case 'inc':
      block = new IncBlock(blockData.text, SIDEBAR_X, CODE_Y_START);
      break;

    default:
      console.error('Unknown block type:', blockData.type);
      return null;
  }

  // Add any additional properties
  if (blockData.isLocked !== undefined) block.isLocked = blockData.isLocked;

  return block;
}

// Helper function to save layout for just the given blocks
function saveLayout(blocks) {
  return JSON.stringify(blocks.map(b => b ? b.serialize() : null));
}

// window.Problem = Problem;
// window.User = User;
// window.ProblemManager = ProblemManager;

class Shop {

  constructor(contents) {
    // Map productType to price
    this.contents = contents;
  }

  // Buy the item. return -1 on failure, remaining points on success
  buy(score, productType, quantity = 1) {
    if (!contents[productType] || score < quantity * contents[productType]) {
      return -1;
    }

    return score - quantity * contents[productType]
  }

  static initializeDefaultShop() {
    const defaultShop = new Shop();
    let defaultContents = { 'forblock': 5 };
    defaultShop.contents = defaultContents;
    return defaultShop;
  }
}
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
      
      // Otherwise, check if result matches target value
      return this.targetValue !== null && result === this.targetValue;
    }
  
    /**
     * Create a fresh copy of the problem for the user to work with
     * @returns {Object} The initial state for this problem
     */
    initialize() {
      // Create deep copies of blocks to avoid modifying the originals
      const predefinedBlocks = this.predefinedBlocks.map(block => {
        return deserialize(block.serialize());
      });
      
      const availableBlocks = this.availableBlocks.map(block => {
        return deserialize(block.serialize());
      });
      
      return {
        id: this.id,
        title: this.title,
        description: this.description,
        initialValue: this.initialValue,
        predefinedBlocks,
        availableBlocks,
        maxBlockCounts: {...this.maxBlockCounts}
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
          score: Math.max(score, 10),  // Minimum score of 10
          solution: saveLayout(blocks)
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
  
    /**
     * Create a set of predefined problems for the game
     * @returns {ProblemManager} Populated problem manager
     */
    static createDefaultProblems() {
      const manager = new ProblemManager();
      
      // Problem 1: Double the input to reach 8
      const problem1 = new Problem(
        'p1',
        'Double Trouble',
        'Make the function return 8 by doubling the input value.',
        4,  // initial value
        8   // target value
      );
      problem1.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
      manager.addProblem(problem1);
      
      // Problem 2: Reach 10 with addition and multiplication
      const problem2 = new Problem(
        'p2',
        'Perfect 10',
        'Starting with x = 2, reach exactly 10 using addition and multiplication operations.',
        2,  // initial value
        8  // target value
      );
      problem2.addAvailableBlock(new CodeBlock("x += 2;", SIDEBAR_X, CODE_Y_START));
      problem2.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
      manager.addProblem(problem2);
      
      // Problem 3: Use a for loop to calculate 2^4
      const problem3 = new Problem(
        'p3',
        'Power Up',
        'Starting with x = 1, use a for loop to calculate 2^4 (2 to the power of 4).',
        1,  // initial value
        16  // target value
      );
      problem3.addAvailableBlock(new ForLoopBlock(SIDEBAR_X, CODE_Y_START));
      problem3.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
      manager.addProblem(problem3);
      
      // Problem 4: Use if-else to handle odd/even numbers
      const problem4 = new Problem(
        'p4',
        'Odd or Even',
        'If the input is even, multiply it by 2. If it\'s odd, add 1 to it first, then multiply by 2.',
        5,  // initial value
        12  // target value
      );
      problem4.addAvailableBlock(new IfElseBlock(SIDEBAR_X, CODE_Y_START));
      problem4.addAvailableBlock(new CodeBlock("x += 1;", SIDEBAR_X, CODE_Y_START));
      problem4.addAvailableBlock(new CodeBlock("x *= 2;", SIDEBAR_X, CODE_Y_START));
      manager.addProblem(problem4);
      
      // Problem 5: Use a while loop to divide by 2 until below 10
      const problem5 = new Problem(
        'p5',
        'Halving Time',
        'Use a while loop to divide x by 2 until it\'s less than 10.',
        80,  // initial value
        5   // target value
      );
      problem5.addAvailableBlock(new WhileBlock(SIDEBAR_X, CODE_Y_START));
      problem5.addAvailableBlock(new CodeBlock("x /= 2;", SIDEBAR_X, CODE_Y_START));
      manager.addProblem(problem5);
      
      return manager;
    }
  }
  
  // Helper function to save layout for just the given blocks
  function saveLayout(blocks) {
    return JSON.stringify(blocks.map(b => b ? b.serialize() : null));
  }

// window.Problem = Problem;
// window.User = User;
// window.ProblemManager = ProblemManager;
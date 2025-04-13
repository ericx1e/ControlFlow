
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


function initializeItemPool() {
    // Basic operations
    allPossibleItems = [
        {
            id: 'for_loop',
            name: 'For Loop',
            description: 'A classic for loop block.',
            price: 5,
            rarity: 'common',
            block: () => new ForLoopBlock(0, 0)
        },
        {
            id: 'while_loop',
            name: 'While Loop',
            description: 'Loop while a condition is true',
            price: 7,
            rarity: 'common',
            block: () => new WhileBlock(0, 0)
        },

        {
            id: 'for_loop',
            name: 'For Loop',
            description: 'A classic for loop block.',
            price: 5,
            rarity: 'common',
            block: () => new ForLoopBlock(0, 0)
        },
        {
            id: 'while_loop',
            name: 'While Loop',
            description: 'Loop while a condition is true',
            price: 7,
            rarity: 'common',
            block: () => new WhileBlock(0, 0)
        },
        {
            id: 'for_loop',
            name: 'For Loop',
            description: 'A classic for loop block.',
            price: 5,
            rarity: 'common',
            block: () => new ForLoopBlock(0, 0)
        },
        {
            id: 'while_loop',
            name: 'While Loop',
            description: 'Loop while a condition is true',
            price: 7,
            rarity: 'common',
            block: () => new WhileBlock(0, 0)
        },
        {
            id: 'for_loop',
            name: 'For Loop',
            description: 'A classic for loop block.',
            price: 5,
            rarity: 'common',
            block: () => new ForLoopBlock(0, 0)
        },
        {
            id: 'while_loop',
            name: 'While Loop',
            description: 'Loop while a condition is true',
            price: 7,
            rarity: 'common',
            block: () => new WhileBlock(0, 0)
        },
        {
            id: 'for_loop',
            name: 'For Loop',
            description: 'A classic for loop block.',
            price: 5,
            rarity: 'common',
            block: () => new ForLoopBlock(0, 0)
        },
        {
            id: 'while_loop',
            name: 'While Loop',
            description: 'Loop while a condition is true',
            price: 7,
            rarity: 'common',
            block: () => new WhileBlock(0, 0)
        },
        {
            id: 'if_else',
            name: 'If-Else Block',
            description: 'Branch based on conditions',
            price: 10,
            rarity: 'common',
            block: () => new IfElseBlock(0, 0)
        },
        {
            id: 'cond_i_less_5',
            name: 'i < 5',
            description: 'True when loop variable i is less than 5',
            price: 3,
            rarity: 'common',
            block: () => new ConditionBlock("i < 5", 0, 0)
        },
        {
            id: 'cond_i_less_10',
            name: 'i < 10',
            description: 'True when loop variable i is less than 10',
            price: 3,
            rarity: 'common',
            block: () => new ConditionBlock("i < 10", 0, 0)
        },
        {
            id: 'cond_i_equal_5',
            name: 'i === 5',
            description: 'True when loop variable i equals 5',
            price: 4,
            rarity: 'common',
            block: () => new ConditionBlock("i === 5", 0, 0)
        },
        {
            id: 'cond_i_even',
            name: 'i % 2 === 0',
            description: 'True when loop variable i is even',
            price: 5,
            rarity: 'uncommon',
            block: () => new ConditionBlock("i % 2 === 0", 0, 0)
        },
        {
            id: 'cond_i_odd',
            name: 'i % 2 === 1',
            description: 'True when loop variable i is odd',
            price: 5,
            rarity: 'uncommon',
            block: () => new ConditionBlock("i % 2 === 1", 0, 0)
        },
        {
            id: 'cond_i_div3',
            name: 'i % 3 === 0',
            description: 'True when loop variable i is divisible by 3',
            price: 5,
            rarity: 'uncommon',
            block: () => new ConditionBlock("i % 3 === 0", 0, 0)
        },
        {
            id: 'cond_i_x_equal',
            name: 'i === x',
            description: 'True when loop variable i equals x',
            price: 6,
            rarity: 'uncommon',
            block: () => new ConditionBlock("i === x", 0, 0)
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
            id: 'div_5',
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
        // Conditions
        {
            id: 'cond_less_5',
            name: 'x < 5',
            description: 'True when x less than 5',
            price: 3,
            rarity: 'common',
            block: () => new ConditionBlock("x < 5", 0, 0)
        },
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
            rarity: 'uncommom',
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
        },
        {
            id: 'add_i',
            name: 'Add i Value',
            description: 'Add loop variable i to x',
            price: 5,
            rarity: 'uncommon',
            block: () => new AddIBlock(0, 0)
        },
        {
            id: 'break_block',
            name: 'Break Block',
            description: 'Break out of the current loop',
            price: 6,
            rarity: 'uncommon',
            block: () => new BreakBlock(0, 0)
        },
        // Additional math operations
        {
            id: 'abs_x',
            name: 'Absolute Value',
            description: 'Get the absolute value of x',
            price: 7,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.abs(x);", 0, 0)
        },
        {
            id: 'sqrt_x',
            name: 'Square Root',
            description: 'Calculate the square root of x',
            price: 9,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.sqrt(x);", 0, 0)
        },
        {
            id: 'floor_x',
            name: 'Floor Value',
            description: 'Round x down to the nearest integer',
            price: 6,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.floor(x);", 0, 0)
        },
        {
            id: 'ceil_x',
            name: 'Ceiling Value',
            description: 'Round x up to the nearest integer',
            price: 6,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.ceil(x);", 0, 0)
        },
        {
            id: 'round_x',
            name: 'Round Value',
            description: 'Round x to the nearest integer',
            price: 6,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.round(x);", 0, 0)
        },
        {
            id: 'truncate_x',
            name: 'Truncate Decimals',
            description: 'Remove decimal part from x',
            price: 5,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = parseInt(x);", 0, 0)
        },
        {
            id: 'mod_3',
            name: 'Modulo 3',
            description: 'Remainder when divided by 3',
            price: 5,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = x % 3;", 0, 0)
        },
        {
            id: 'mod_5',
            name: 'Modulo 5',
            description: 'Remainder when divided by 5',
            price: 5,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = x % 5;", 0, 0)
        },
        {
            id: 'mod_10',
            name: 'Modulo 10',
            description: 'Remainder when divided by 10 (last digit)',
            price: 5,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = x % 10;", 0, 0)
        },
        {
            id: 'add_fraction',
            name: 'Add 0.5',
            description: 'Add 0.5 to the value',
            price: 3,
            rarity: 'common',
            block: () => new CodeBlock("x += 0.5;", 0, 0)
        },
        {
            id: 'mul_fraction',
            name: 'Multiply by 0.5',
            description: 'Multiply value by 0.5 (half)',
            price: 4,
            rarity: 'common',
            block: () => new CodeBlock("x *= 0.5;", 0, 0)
        },
        {
            id: 'to_power_2',
            name: 'Power of 2',
            description: 'Square the value (x²)',
            price: 8,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.pow(x, 2);", 0, 0)
        },
        {
            id: 'to_power_3',
            name: 'Power of 3',
            description: 'Cube the value (x³)',
            price: 10,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.pow(x, 3);", 0, 0)
        },
        {
            id: 'cube_root',
            name: 'Cube Root',
            description: 'Calculate the cube root of x',
            price: 11,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.cbrt(x);", 0, 0)
        },
        {
            id: 'exp_x',
            name: 'Exponential',
            description: 'Calculate e raised to the power of x',
            price: 12,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.exp(x);", 0, 0)
        },

        // Additional conditionals
        {
            id: 'cond_equal_10',
            name: 'x === 10',
            description: 'True when x equals 10',
            price: 4,
            rarity: 'common',
            block: () => new ConditionBlock("x === 10", 0, 0)
        },
        {
            id: 'cond_mod3_0',
            name: 'x % 3 === 0',
            description: 'True when x is divisible by 3',
            price: 5,
            rarity: 'uncommon',
            block: () => new ConditionBlock("x % 3 === 0", 0, 0)
        },
        {
            id: 'cond_mod5_0',
            name: 'x % 5 === 0',
            description: 'True when x is divisible by 5',
            price: 5,
            rarity: 'uncommon',
            block: () => new ConditionBlock("x % 5 === 0", 0, 0)
        },
        {
            id: 'cond_x_positive',
            name: 'x > 0',
            description: 'True when x is positive',
            price: 3,
            rarity: 'common',
            block: () => new ConditionBlock("x > 0", 0, 0)
        },
        {
            id: 'cond_x_negative',
            name: 'x < 0',
            description: 'True when x is negative',
            price: 3,
            rarity: 'common',
            block: () => new ConditionBlock("x < 0", 0, 0)
        },
        {
            id: 'cond_x_decimal',
            name: 'x !== Math.floor(x)',
            description: 'True when x has a decimal part',
            price: 6,
            rarity: 'uncommon',
            block: () => new ConditionBlock("x !== Math.floor(x)", 0, 0)
        },
        {
            id: 'cond_x_int',
            name: 'x === Math.floor(x)',
            description: 'True when x is an integer',
            price: 6,
            rarity: 'uncommon',
            block: () => new ConditionBlock("x === Math.floor(x)", 0, 0)
        },
        {
            id: 'cond_between_10_20',
            name: '10 < x && x < 20',
            description: 'True when x is between 10 and 20',
            price: 7,
            rarity: 'uncommon',
            block: () => new ConditionBlock("10 < x && x < 20", 0, 0)
        },

        // Specialized math operations
        {
            id: 'sign_x',
            name: 'Sign of x',
            description: 'Get the sign of x (-1, 0, or 1)',
            price: 7,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.sign(x);", 0, 0)
        },
        {
            id: 'max_with_10',
            name: 'Maximum with 10',
            description: 'Get the maximum between x and 10',
            price: 8,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.max(x, 10);", 0, 0)
        },
        {
            id: 'min_with_10',
            name: 'Minimum with 10',
            description: 'Get the minimum between x and 10',
            price: 8,
            rarity: 'uncommon',
            block: () => new CodeBlock("x = Math.min(x, 10);", 0, 0)
        },
        {
            id: 'sum_of_digits',
            name: 'Sum of Digits',
            description: 'Calculate sum of digits in x (works best for integers)',
            price: 15,
            rarity: 'rare',
            block: () => new CodeBlock("x = String(x).split('').reduce((sum, digit) => sum + Number(digit), 0);", 0, 0)
        },
        {
            id: 'reverse_digits',
            name: 'Reverse Digits',
            description: 'Reverse the digits of x (works best for integers)',
            price: 15,
            rarity: 'rare',
            block: () => new CodeBlock("x = Number(String(Math.abs(Math.floor(x))).split('').reverse().join('')) * Math.sign(x);", 0, 0)
        },
        {
            id: 'log10_x',
            name: 'Log Base 10',
            description: 'Calculate log base 10 of x',
            price: 12,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.log10(x);", 0, 0)
        },
        {
            id: 'log2_x',
            name: 'Log Base 2',
            description: 'Calculate log base 2 of x',
            price: 12,
            rarity: 'rare',
            block: () => new CodeBlock("x = Math.log2(x);", 0, 0)
        }
    ];
}

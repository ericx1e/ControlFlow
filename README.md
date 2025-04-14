## [Play NOW](https://ericx1e.github.io/ControlFlow/)

### Inspiration
Control Flow was inspired by Balatro, a roguelike card game that resembles poker. We thought it would be fun and challenging to incorporate programming puzzles into this style of game, something that's never been done before!

### What it does
Control Flow is a roguelike programming puzzle game where players solve coding challenges by dragging and combining code blocks. Players progress through increasingly difficult levels, earning coins to purchase new code blocks from a randomized shop. Control Flow turns code blocks into limited resource and will have you code tracing like never before! The game has no one solution for many of the problems--it is up to the user to construct a strategy and use their reasoning abilities to advance.

### How we built it
We built Control Flow using p5.js for the graphics and interactions. The game features a custom block-based programming language with a visual editor that allows dragging, dropping, and nesting of code snippets completely from scratch. We implemented a roguelike progression system that generates problems with varying difficulty, alongside a shop system that offers randomly selected code blocks. The game evaluates solutions by parsing and executing the assembled code blocks against test cases to determine if the player reached the target value.

### Challenges we ran into
The biggest challenge was building the evaluator. We basically invented our own interpreted programming language that gets executed as javascript. We dealt with challenges having to do with scope, variables, (nested) loops, etc..

Creating our custom code block editor was also a huge challenge, as it was built completely from scratch with only the p5js core library. We ran into big problems with how to represent nesting and headers, and how to customize the arguments to loops and conditionals. We are beyond proud of how well it turn out.

It was difficult to create engaging problems that were not trivial, possible to solve, and, most importantly, fun. We had to make our system highly scalable to be able to hot-swap different kinds of problems quickly! We built this game with scalability in mind, and we are excited to continue adding more features that add a fun twist to how you think about code.

### Accomplishments that we're proud of
We are super proud of taking a vague idea into a polished game that looks great and is super fun to play, all from scratch. We are also proud of making a super tight stack with no unneeded database, restAPI, or bloaty frameworks like react. Additionally, the game is available for anyone to play right now!!

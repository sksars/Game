// Complete catalog of 32 original HTML5 games with editorial instructions and control profiles

export const CATEGORIES = [
  { id: 'all', label: 'All Games' },
  { id: 'Arcade', label: 'Arcade & Action' },
  { id: 'Puzzle', label: 'Puzzle & Logic' },
  { id: 'Board', label: 'Board & Card' },
  { id: 'Brain', label: 'Word & Brain' },
  { id: 'Reflex', label: 'Reflex & Casual' }
];

export const GAME_CATALOG = [
  // --- ARCADE & ACTION (8) ---
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    glyph: 'S',
    accent: 'linear-gradient(135deg, #0f766e, #059669)',
    controlsLabel: 'Swipe, D-Pad & Arrows',
    hasDpad: true,
    actionLabel: 'Pause',
    shortDesc: 'Guide the growing serpent across the grid, collect energy orbs, and avoid colliding with walls or your own tail.',
    howToPlay: [
      'Use Arrow Keys, WASD, swipe gestures on the canvas, or the on-screen D-Pad to steer.',
      'Each orb collected adds 10 points and extends your snake length.',
      'Golden bonus orbs appear briefly for +30 extra points.'
    ],
    tips: 'Plan wide loops around the outer perimeter once your snake grows past 15 segments so you never trap yourself.'
  },
  {
    id: 'breakout',
    title: 'Brick Breaker',
    category: 'Arcade',
    glyph: 'B',
    accent: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    controlsLabel: 'Drag, D-Pad & Arrows',
    hasDpad: true,
    actionLabel: 'Launch',
    shortDesc: 'Deflect the kinetic ball with your paddle to shatter layered brick formations and clear each stage.',
    howToPlay: [
      'Drag anywhere on the playfield, move your mouse, or press Left/Right keys to steer the paddle.',
      'Tap Launch or Space to release the ball from the paddle.',
      'Clear all bricks before running out of your 3 lives.'
    ],
    tips: 'Strike the ball near the outer edges of the paddle to create sharper diagonal angles and reach behind top rows.'
  },
  {
    id: 'space-defender',
    title: 'Space Defender',
    category: 'Arcade',
    glyph: 'V',
    accent: 'linear-gradient(135deg, #1e293b, #334155)',
    controlsLabel: 'Drag, D-Pad & Fire',
    hasDpad: true,
    actionLabel: 'Fire',
    shortDesc: 'Command an orbital interceptor against descending alien squadrons across escalating waves.',
    howToPlay: [
      'Move left and right using Arrow Keys, touch drag, or the D-Pad.',
      'Auto-fire is enabled during active play, or tap Fire / Space for rapid bursts.',
      'Clear all invaders in each wave before they breach your defense line.'
    ],
    tips: 'Focus on eliminating outer columns first to slow down how quickly the enemy formation drops toward your ship.'
  },
  {
    id: 'flappy',
    title: 'Flappy Glide',
    category: 'Arcade',
    glyph: 'F',
    accent: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
    controlsLabel: 'Tap, Click & Space',
    hasDpad: false,
    actionLabel: 'Flap',
    shortDesc: 'Time rhythmic wing flaps to thread your glider cleanly through narrow vertical pipe gaps.',
    howToPlay: [
      'Tap anywhere on the game stage, click, or press Space / Up Arrow to flap upward.',
      'Gravity pulls your glider down between taps.',
      'Score 1 point for every column pair you pass.'
    ],
    tips: 'Use short, steady taps just below the midpoint of the next opening rather than panicking near the top pipe.'
  },
  {
    id: 'dino',
    title: 'Dino Dash',
    category: 'Arcade',
    glyph: 'D',
    accent: 'linear-gradient(135deg, #b45309, #d97706)',
    controlsLabel: 'Tap, D-Pad & Space',
    hasDpad: true,
    actionLabel: 'Jump',
    shortDesc: 'Sprint across an endless desert horizon, leaping over cacti clusters and ducking under low flyers.',
    howToPlay: [
      'Tap the screen, press Up/Space, or tap Jump to leap over ground obstacles.',
      'Hold Down Arrow or D-Pad Down to duck beneath high-flying drones.',
      'Speed steadily increases every 100 meters.'
    ],
    tips: 'Trigger your jump slightly earlier as speed climbs so you land cleanly before the next cactus pair.'
  },
  {
    id: 'asteroids',
    title: 'Asteroids Drift',
    category: 'Arcade',
    glyph: 'A',
    accent: 'linear-gradient(135deg, #312e81, #4338ca)',
    controlsLabel: 'D-Pad, Keys & Fire',
    hasDpad: true,
    actionLabel: 'Fire',
    shortDesc: 'Pilot a zero-gravity thruster craft, blast drifting boulders into smaller fragments, and survive the belt.',
    howToPlay: [
      'Use Left/Right to rotate your ship and Up to fire your main thrusters.',
      'Press Space or Fire to shoot plasma bolts.',
      'Large asteroids split into two medium rocks, then small fast shards.'
    ],
    tips: 'Pulse your thrusters gently instead of holding forward continuously so you maintain tight rotational control.'
  },
  {
    id: 'dodge-rain',
    title: 'Dodge Rain',
    category: 'Arcade',
    glyph: 'R',
    accent: 'linear-gradient(135deg, #991b1b, #dc2626)',
    controlsLabel: 'Drag, D-Pad & Arrows',
    hasDpad: true,
    actionLabel: 'Dash',
    shortDesc: 'Weave left and right through falling meteor showers while grabbing luminous star shards for bonus points.',
    howToPlay: [
      'Slide your finger across the stage or press Left/Right to steer your runner.',
      'Collect gold star shards (+25 pts) while surviving longer (+1 pt per tick).',
      'One direct meteor hit ends the run.'
    ],
    tips: 'Stay near the center third of the arena so you always have escape lanes on both sides.'
  },
  {
    id: 'pong',
    title: 'Paddle Pong',
    category: 'Arcade',
    glyph: 'P',
    accent: 'linear-gradient(135deg, #0f172a, #1e293b)',
    controlsLabel: 'Drag, D-Pad & Arrows',
    hasDpad: true,
    actionLabel: 'Serve',
    shortDesc: 'Classic head-to-head table tennis against a reactive CPU paddle. First player to 7 points wins the match.',
    howToPlay: [
      'Move your left paddle up and down using touch drag, mouse, Up/Down keys, or D-Pad.',
      'Return the ball past the opponent paddle on the right to score.',
      'Rally speed increases slightly with every consecutive hit.'
    ],
    tips: 'Strike the ball while moving your paddle vertically to add sharper angles that stretch the CPU reach.'
  },

  // --- PUZZLE & LOGIC (8) ---
  {
    id: 'game-2048',
    title: '2048 Slide',
    category: 'Puzzle',
    glyph: '2',
    accent: 'linear-gradient(135deg, #c2410c, #ea580c)',
    controlsLabel: 'Swipe, D-Pad & Arrows',
    hasDpad: true,
    actionLabel: 'Undo',
    shortDesc: 'Slide numbered tiles across a 4x4 grid to merge matching powers of two until you forge the 2048 tile.',
    howToPlay: [
      'Swipe in any direction, use Arrow Keys, or tap the D-Pad to shift all tiles.',
      'Matching tiles collide and combine into double their value.',
      'Use Undo once per turn if you make a misstep.'
    ],
    tips: 'Keep your highest-value tile anchored in one corner and build a descending chain along that edge.'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Puzzle',
    glyph: 'M',
    accent: 'linear-gradient(135deg, #334155, #475569)',
    controlsLabel: 'Tap & Flag Mode',
    hasDpad: false,
    actionLabel: 'Flag',
    shortDesc: 'Uncover safe squares using numerical proximity clues while flagging hidden mines across a 9x9 tactical board.',
    howToPlay: [
      'Tap any tile to reveal it; your first click is always guaranteed safe.',
      'Numbers show how many mines touch that square across all 8 neighbors.',
      'Switch to Flag Mode (or right-click on desktop) to mark suspected mines.'
    ],
    tips: 'Look for corner "1" clues touching a single unrevealed square — that square is always a guaranteed mine.'
  },
  {
    id: 'tetris',
    title: 'Block Stacker',
    category: 'Puzzle',
    glyph: 'T',
    accent: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    controlsLabel: 'D-Pad, Keys & Rotate',
    hasDpad: true,
    actionLabel: 'Rotate',
    shortDesc: 'Rotate and fit falling geometric tetrominoes into solid horizontal rows to clear lines and climb levels.',
    howToPlay: [
      'Move pieces Left/Right, press Down to soft-drop, or tap Rotate (Up/Space) to turn.',
      'Complete full horizontal rows to clear them and earn combo points.',
      'Clearing 4 lines at once scores a massive 800-point bonus.'
    ],
    tips: 'Keep one vertical column open along the side wall so long I-pieces can clear multiple rows cleanly.'
  },
  {
    id: 'sliding15',
    title: 'Sliding 15 Puzzle',
    category: 'Puzzle',
    glyph: '15',
    accent: 'linear-gradient(135deg, #0369a1, #0284c7)',
    controlsLabel: 'Tap Tiles & Arrows',
    hasDpad: true,
    actionLabel: 'Shuffle',
    shortDesc: 'Rearrange 15 numbered tiles into ascending order inside a 4x4 frame using the single empty slot.',
    howToPlay: [
      'Tap any tile adjacent to the empty gap to slide it into place.',
      'Order tiles 1 through 15 from top-left to bottom-right.',
      'Try to solve the board in as few moves as possible.'
    ],
    tips: 'Solve the top row (1–4) and left column (5, 9, 13) completely before working on the remaining 3x3 subgrid.'
  },
  {
    id: 'lights-out',
    title: 'Lights Out',
    category: 'Puzzle',
    glyph: 'L',
    accent: 'linear-gradient(135deg, #b45309, #f59e0b)',
    controlsLabel: 'Tap Grid Cells',
    hasDpad: false,
    actionLabel: 'Reset',
    shortDesc: 'Toggle glowing cells on a 5x5 grid where every tap flips the target tile and its four orthogonal neighbors.',
    howToPlay: [
      'Tap any cell to flip its state plus the tiles directly above, below, left, and right.',
      'Turn every single light off to advance to the next puzzle level.',
      'Every generated level is mathematically guaranteed solvable.'
    ],
    tips: 'Work row-by-row from top to bottom: tap the tile directly below each remaining lit cell in the row above.'
  },
  {
    id: 'sudoku',
    title: 'Sudoku Mini',
    category: 'Puzzle',
    glyph: '9',
    accent: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    controlsLabel: 'Tap Cell & Keypad',
    hasDpad: false,
    actionLabel: 'Hint',
    shortDesc: 'Fill the 6x6 logical grid so every row, column, and 2x3 box contains the digits 1 through 6 exactly once.',
    howToPlay: [
      'Tap an empty white cell on the board to select it.',
      'Use the number pad below (or keyboard 1–6) to place a digit.',
      'Use Check or Hint whenever you want to verify your progress.'
    ],
    tips: 'Scan rows and 2x3 boxes that already contain 4 or 5 digits first to lock in easy single candidates.'
  },
  {
    id: 'pipes',
    title: 'Pipe Connect',
    category: 'Puzzle',
    glyph: 'C',
    accent: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    controlsLabel: 'Tap Tiles to Rotate',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Rotate elbow and straight pipeline segments to route pressurized water from the source valve to the exit drain.',
    howToPlay: [
      'Tap any pipe tile to rotate it 90 degrees clockwise.',
      'Live blue water flows automatically through all connected segments from the top-left inlet.',
      'Reach the bottom-right outlet to clear the level and earn points.'
    ],
    tips: 'Work backward from the exit drain as well as forward from the inlet to spot forced corner turns immediately.'
  },
  {
    id: 'color-flood',
    title: 'Color Flood',
    category: 'Puzzle',
    glyph: 'G',
    accent: 'linear-gradient(135deg, #be185d, #ec4899)',
    controlsLabel: 'Tap Color Swatches',
    hasDpad: false,
    actionLabel: 'Reset',
    shortDesc: 'Unify the entire 10x10 mosaic into a single color within 22 moves by expanding from the top-left corner.',
    howToPlay: [
      'Your territory begins at the top-left tile.',
      'Tap one of the 6 color swatches below the board to flood your territory into that color.',
      'All touching squares of the chosen color merge into your region.'
    ],
    tips: 'Prioritize colors that border the largest clusters along your current perimeter rather than isolated single tiles.'
  },

  // --- BOARD & CARD (6) ---
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe Pro',
    category: 'Board',
    glyph: 'X',
    accent: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    controlsLabel: 'Tap Squares',
    hasDpad: false,
    actionLabel: 'Mode',
    shortDesc: 'Classic 3x3 strategy against a smart tactical bot or in local two-player pass-and-play mode.',
    howToPlay: [
      'Tap any open square to place your X mark.',
      'Line up 3 identical marks horizontally, vertically, or diagonally.',
      'Toggle between Solo vs AI and 2-Player Local anytime.'
    ],
    tips: 'Claim the center square first or occupy opposite corners to create double-threat forks.'
  },
  {
    id: 'connect4',
    title: 'Connect Four',
    category: 'Board',
    glyph: '4',
    accent: 'linear-gradient(135deg, #b91c1c, #ef4444)',
    controlsLabel: 'Tap Column',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Drop colored discs into a 7x6 vertical rack to connect four in a row while blocking your opponent.',
    howToPlay: [
      'Tap any column on the board to drop your red disc to the lowest open slot.',
      'The AI responds with yellow discs automatically.',
      'First side to connect 4 discs in any line wins.'
    ],
    tips: 'Control the center column early because almost every winning horizontal and diagonal line passes through it.'
  },
  {
    id: 'reversi',
    title: 'Reversi Othello',
    category: 'Board',
    glyph: 'O',
    accent: 'linear-gradient(135deg, #166534, #15803d)',
    controlsLabel: 'Tap Highlighted Moves',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Flank opponent discs on an 8x8 felt board to flip them to your color and dominate the final count.',
    howToPlay: [
      'Valid moves are marked with subtle target dots on the green board.',
      'Place a dark disc so opponent white discs sit trapped between two of yours.',
      'The player with the most discs when the board fills wins.'
    ],
    tips: 'Corners can never be flipped back — fight to secure corner squares and avoid placing next to empty corners.'
  },
  {
    id: 'checkers',
    title: 'Checkers',
    category: 'Board',
    glyph: 'K',
    accent: 'linear-gradient(135deg, #78350f, #92400e)',
    controlsLabel: 'Tap Piece & Target',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Classic 8x8 diagonal draughts with forced captures, king promotions, and a reactive AI challenger.',
    howToPlay: [
      'Tap one of your red pieces to highlight legal diagonal moves.',
      'Jump diagonally over opponent pieces to capture them.',
      'Reach the far row to promote a piece into a King that moves backward too.'
    ],
    tips: 'Keep your back-row guard pieces anchored as long as possible to stop opponent pieces from crowning.'
  },
  {
    id: 'memory',
    title: 'Memory Match',
    category: 'Board',
    glyph: 'M',
    accent: 'linear-gradient(135deg, #0f766e, #0d9488)',
    controlsLabel: 'Tap Cards',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Flip pairs of crisp illustrated symbol cards to clear the 4x4 deck with minimal turns and rising combo streaks.',
    howToPlay: [
      'Tap any face-down card to reveal its geometric symbol.',
      'Match two identical cards to lock them face-up and score streak points.',
      'Clear all 8 pairs to complete the deck.'
    ],
    tips: 'Open cards systematically row by row during your first four turns to map locations quickly.'
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21',
    category: 'Board',
    glyph: '21',
    accent: 'linear-gradient(135deg, #14532d, #166534)',
    controlsLabel: 'Tap Hit / Stand',
    hasDpad: false,
    actionLabel: 'Deal',
    shortDesc: 'Friendly virtual-points Blackjack against the dealer. Build your score toward 21 without busting — zero real-money wagering.',
    howToPlay: [
      'Choose a virtual point stake and tap Deal to draw two cards.',
      'Tap Hit to draw another card or Stand to hold your total.',
      'Beat the dealer hand without exceeding 21. Points are purely virtual.'
    ],
    tips: 'Stand on 17 or higher, and consider hitting when the dealer shows a 7 through Ace and your hand is 12–16.'
  },

  // --- WORD & BRAIN (5) ---
  {
    id: 'wordguess',
    title: 'Word Guess',
    category: 'Brain',
    glyph: 'W',
    accent: 'linear-gradient(135deg, #15803d, #16a34a)',
    controlsLabel: 'On-Screen Keyboard',
    hasDpad: false,
    actionLabel: 'New',
    shortDesc: 'Deduce the hidden 5-letter English word within 6 attempts using color-coded letter feedback.',
    howToPlay: [
      'Type or tap letters on the on-screen keyboard and press Enter to submit a 5-letter word.',
      'Green means right letter in the right spot; Amber means right letter in the wrong spot.',
      'Solve within 6 rows to keep your win streak alive.'
    ],
    tips: 'Start with vowel-rich words like CRANE, SLATE, or AUDIO to narrow down common letters quickly.'
  },
  {
    id: 'math-blitz',
    title: 'Math Blitz',
    category: 'Brain',
    glyph: '+',
    accent: 'linear-gradient(135deg, #1e40af, #2563eb)',
    controlsLabel: 'Tap Answer Choice',
    hasDpad: false,
    actionLabel: 'Start',
    shortDesc: 'Solve fast-paced addition, subtraction, and multiplication prompts in 45 seconds to stack streak multipliers.',
    howToPlay: [
      'Read the arithmetic equation at the top of the card.',
      'Tap the correct answer among the four large buttons or press keys 1–4.',
      'Consecutive correct answers build bonus multiplier points.'
    ],
    tips: 'Check the last digit of multiplication questions first to eliminate wrong choices in under a second.'
  },
  {
    id: 'simon',
    title: 'Simon Echo',
    category: 'Brain',
    glyph: 'E',
    accent: 'linear-gradient(135deg, #0369a1, #2563eb)',
    controlsLabel: 'Tap Color Pads',
    hasDpad: false,
    actionLabel: 'Start',
    shortDesc: 'Watch and listen to the four-tone light sequence, then echo back the growing pattern without a single slip.',
    howToPlay: [
      'Press Start and observe the sequence of illuminated color pads.',
      'Tap the pads in the exact same order.',
      'Each completed round adds one new step to the chain.'
    ],
    tips: 'Group long patterns into rhythm chunks of three or four beats in your head.'
  },
  {
    id: 'scramble',
    title: 'Scramble Solver',
    category: 'Brain',
    glyph: 'Z',
    accent: 'linear-gradient(135deg, #7c2d12, #c2410c)',
    controlsLabel: 'Tap Letters & Hint',
    hasDpad: false,
    actionLabel: 'Hint',
    shortDesc: 'Unscramble shuffled letter tiles to reconstruct everyday words and climb through endless vocabulary rounds.',
    howToPlay: [
      'Tap scrambled letter tiles in order to place them into the answer slots.',
      'Tap a placed letter to send it back, or use Hint to lock in one letter.',
      'Solve as many words as possible in a row.'
    ],
    tips: 'Look for common prefixes (RE-, UN-) and suffixes (-ING, -TION, -ER) to spot the root structure.'
  },
  {
    id: 'trivia',
    title: 'Trivia Quiz',
    category: 'Brain',
    glyph: '?',
    accent: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
    controlsLabel: 'Tap Multiple Choice',
    hasDpad: false,
    actionLabel: 'Next',
    shortDesc: 'Test your general knowledge across science, geography, history, and technology with instant explanations.',
    howToPlay: [
      'Read each 10-question round prompt carefully.',
      'Tap one of the four answer choices to see immediate feedback and a short explanation.',
      'Aim for 10/10 to set a personal best score.'
    ],
    tips: 'Eliminate two clearly out-of-context dates or units first when tackling science and history questions.'
  },

  // --- REFLEX & CASUAL (5) ---
  {
    id: 'reaction',
    title: 'Reaction Timer',
    category: 'Reflex',
    glyph: '⚡',
    accent: 'linear-gradient(135deg, #047857, #10b981)',
    controlsLabel: 'Tap When Green',
    hasDpad: false,
    actionLabel: 'Go',
    lowerIsBetter: true,
    shortDesc: 'Measure your visual response latency in milliseconds across a 5-round reflex benchmark.',
    howToPlay: [
      'Tap the pad to start waiting for the signal.',
      'Hold steady while the stage is Slate/Amber — tap immediately when it turns Emerald Green!',
      'Complete 5 rounds to record your average millisecond score.'
    ],
    tips: 'Focus your gaze softly on the center text rather than hovering tensely; tapping early resets the round.'
  },
  {
    id: 'whack',
    title: 'Mole Whack',
    category: 'Reflex',
    glyph: 'H',
    accent: 'linear-gradient(135deg, #854d0e, #ca8a04)',
    controlsLabel: 'Tap Pop-Up Targets',
    hasDpad: false,
    actionLabel: 'Start',
    shortDesc: 'Tap cheeky burrow critters and golden bonus stars across a 3x3 garden grid while avoiding hazard bombs.',
    howToPlay: [
      'Tap moles (+10 pts) and gold stars (+25 pts) as soon as they pop up.',
      'Avoid tapping red hazard bombs (-20 pts).',
      'Score as many points as possible in 30 seconds.'
    ],
    tips: 'Keep your thumb or cursor centered over the middle burrow so every outer tile is one short hop away.'
  },
  {
    id: 'aim',
    title: 'Aim Trainer',
    category: 'Reflex',
    glyph: '◎',
    accent: 'linear-gradient(135deg, #be123c, #e11d48)',
    controlsLabel: 'Tap Moving Targets',
    hasDpad: false,
    actionLabel: 'Start',
    shortDesc: 'Sharpen your pointer precision and touch accuracy by hitting 25 targets cleanly before time runs out.',
    howToPlay: [
      'Tap Start and hit each bullseye target as fast and accurately as possible.',
      'Center bullseyes grant extra precision points.',
      'Track your final accuracy percentage and total score.'
    ],
    tips: 'Prioritize clean accuracy over frantic clicking — missed taps lower your final bonus.'
  },
  {
    id: 'tower-stack',
    title: 'Tower Stack',
    category: 'Reflex',
    glyph: '▓',
    accent: 'linear-gradient(135deg, #0f766e, #0284c7)',
    controlsLabel: 'Tap Anywhere / Space',
    hasDpad: false,
    actionLabel: 'Drop',
    shortDesc: 'Drop gliding architectural slabs directly onto the foundation below. Any overhanging edge slices away!',
    howToPlay: [
      'Tap the canvas or press Space when the moving block aligns with the block underneath.',
      'Perfectly aligned drops keep full width and award combo bonuses.',
      'The game ends when your overhang misses the stack completely.'
    ],
    tips: 'Watch the left edge of the block beneath rather than the center to time near-perfect drops.'
  },
  {
    id: 'stroop',
    title: 'Color Match',
    category: 'Reflex',
    glyph: '◈',
    accent: 'linear-gradient(135deg, #4338ca, #2563eb)',
    controlsLabel: 'Tap Match / Mismatch',
    hasDpad: false,
    actionLabel: 'Start',
    shortDesc: 'Beat the Stroop effect! Decide quickly whether the word meaning matches the ink color shown on screen.',
    howToPlay: [
      'Compare the word text (e.g., BLUE) against the ink color used to draw it.',
      'Tap YES if the meaning and ink color match, or NO if they differ.',
      'Build streaks during the 40-second sprint.'
    ],
    tips: 'Defocus slightly on the letters and judge the color first before reading the word.'
  }
];

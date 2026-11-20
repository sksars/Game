# PlayGrid Arcade — Pure HTML, CSS & Vanilla JS Game Hub

PlayGrid Arcade is a lightweight, zero-framework browser game portal built with pure **HTML5, CSS3, and Vanilla JavaScript (ES Modules)** — no TypeScript or build step required for hosting. It includes **32 original playable games** with responsive layouts, mobile-friendly touch controls, synthesized Web Audio effects, local high-score saving, and **Google AdSense policy-ready structure**.

## Included Features
- **32 Complete Playable Games** across 5 categories:
  - **Arcade & Action (8):** Neon Snake, Brick Breaker, Space Defender, Flappy Glide, Dino Dash, Asteroids Drift, Dodge Rain, Paddle Pong
  - **Puzzle & Logic (8):** 2048 Slide, Minesweeper, Block Stacker, Sliding 15 Puzzle, Lights Out, Sudoku Mini, Pipe Connect, Color Flood
  - **Board & Card (6):** Tic-Tac-Toe Pro, Connect Four, Reversi, Checkers, Memory Match, Blackjack 21 (virtual points only)
  - **Word & Brain (5):** Word Guess, Math Blitz, Simon Echo, Scramble Solver, Trivia Quiz
  - **Reflex & Casual (5):** Reaction Timer, Mole Whack, Aim Trainer, Tower Stack, Color Match
- **Mobile-First Controls:** Touch swipe support, 44px+ hit targets, `touch-action: none` game stages, and an ergonomic on-screen D-Pad + Action controller.
- **Google AdSense Readiness:**
  - Dedicated legal pages (`about.html`, `privacy.html`, `terms.html`, `contact.html`, `disclaimer.html`)
  - `ads.txt`, `robots.txt`, and `sitemap.xml` templates
  - Clearly labeled `Advertisement` slots separated from active game controls to prevent accidental clicks
  - GDPR/ePrivacy cookie notice banner
  - Rich editorial game guides, controls breakdowns, and strategy tips on every game page

## Direct GitHub Pages Deployment (No Build Required)
1. Push this repository to GitHub.
2. Open your repository **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` (or `master`) and folder `/ (root)`, then click **Save**.
5. Your game hub will be live at `https://<your-username>.github.io/<repo-name>/`.

## Google AdSense Setup Checklist
1. Open `ads.txt` and replace `pub-0000000000000000` with your AdSense Publisher ID.
2. Add your `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>` tag inside `<head>` in `index.html` and the legal `.html` pages.
3. Replace the `.ad-slot-box` placeholders in `index.html` with your `<ins class="adsbygoogle">` units.
4. Update the canonical domain URLs inside `sitemap.xml` and `robots.txt` to match your live domain.
5. Update the contact email in `contact.html` and `privacy.html` to your real domain email address.

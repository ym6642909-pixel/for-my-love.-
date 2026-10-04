# The Museum of Unspoken Feelings

A cinematic, responsive, multi-file romantic experience created for Dacia.

## Run locally
1. Extract the project folder.
2. Open `index.html` in a modern browser.
3. For best results, use a local static server (for example, VS Code Live Server).

No build step, framework, backend, API key, or external image assets are required. Google Fonts are optional; system fallbacks are included. Ambient sound is generated locally after the visitor taps **SOUND OFF**.

## Project structure
- `index.html` — experience scenes and accessible controls
- `css/style.css` — responsive visual design and animations
- `js/main.js` — scene navigation, gallery modal, choices, and ending
- `js/audio.js` — optional ambient audio

## Personalize
Edit the text in `index.html` to make the gallery observations and letter more personal. The three ending responses are in `js/main.js` (`answers`). Keep the ending respectful and pressure-free.

## Notes
The response buttons display an on-page response only; they do not send data or notify anyone. The site works as a static project and can be hosted on GitHub Pages or any static web host.

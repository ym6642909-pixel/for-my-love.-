"use strict";

/*
 * El Cofre que Aún No Abrimos
 * Main controller
 */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


const state = {
    scene: "intro",
    opened: false,
    discovered: new Set(),
    currentRelic: null,
    typingTimer: null
};


const STORAGE_KEY = "dacia-love-story-progress";

const sceneLabels = {
    intro: "Introducción",
    letter: "Carta",
    items: "Recuerdos",
    relic: "Detalle del recuerdo",
    secret: "Secreto",
    confession: "Confesión",
    message: "Mensaje para Dacia",
    future: "El futuro",
    ending: "Final"
};


const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   STORAGE
========================================================= */

function saveProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                opened: state.opened,
                discovered: [...state.discovered]
            })
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.", error);
    }
}


function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const data = JSON.parse(saved);

        state.opened = Boolean(data.opened);

        if (Array.isArray(data.discovered)) {
            state.discovered = new Set(data.discovered);
        }

    } catch (error) {
        console.warn("No se pudo recuperar el progreso.", error);
    }
}


function clearProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn("No se pudo borrar el progreso.", error);
    }
}


/* =========================================================
   ACCESSIBILITY
========================================================= */

const Accessibility = {

    announce(message, alert = false) {
        const target = alert
            ? $("#srAlert")
            : $("#srStatus");

        if (!target) return;

        target.textContent = "";

        window.setTimeout(() => {
            target.textContent = message;
        }, 20);
    },


    getFocusable(container) {
        if (!container) return [];

        return $$(
            [
                "a[href]",
                "button:not([disabled])",
                "input:not([disabled])",
                "select:not([disabled])",
                "textarea:not([disabled])",
                "[tabindex]:not([tabindex='-1'])"
            ].join(","),
            container
        ).filter(element => {
            const style = window.getComputedStyle(element);

            return (
                style.display !== "none" &&
                style.visibility !== "hidden"
            );
        });
    },


    updateSceneAccessibility(sceneName) {
        $$(".scene").forEach(scene => {
            const active =
                scene.dataset.scene === sceneName;

            scene.classList.toggle("is-active", active);

            scene.setAttribute(
                "aria-hidden",
                active ? "false" : "true"
            );

            if ("inert" in scene) {
                scene.inert = !active;
            } else if (active) {
                scene.removeAttribute("inert");
            } else {
                scene.setAttribute("inert", "");
            }
        });
    },


    focusScene(sceneName) {
        const scene = $(
            `.scene[data-scene="${sceneName}"]`
        );

        if (!scene) return;

        const heading = scene.querySelector(
            "h1, h2, h3"
        );

        const focusTarget =
            heading ||
            scene.querySelector("button, a");

        if (!focusTarget) {
            scene.focus({
                preventScroll: true
            });

            return;
        }

        if (
            focusTarget.tagName !== "BUTTON" &&
            focusTarget.tagName !== "A" &&
            !focusTarget.hasAttribute("tabindex")
        ) {
            focusTarget.setAttribute(
                "tabindex",
                "-1"
            );
        }

        window.setTimeout(() => {
            try {
                focusTarget.focus({
                    preventScroll: true
                });
            } catch {
                focusTarget.focus();
            }
        }, reducedMotion ? 0 : 120);
    },


    announceScene(sceneName) {
        const label =
            sceneLabels[sceneName] ||
            sceneName;

        this.announce(
            `Escena: ${label}.`
        );
    },


    trapFocus(event) {
        if (event.key !== "Tab") {
            return;
        }

        const activeScene = $(
            `.scene[data-scene="${state.scene}"]`
        );

        if (!activeScene) {
            return;
        }

        const focusable =
            this.getFocusable(activeScene);

        if (!focusable.length) {
            return;
        }

        const first = focusable[0];
        const last =
            focusable[focusable.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();

        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

};


/* =========================================================
   BACKGROUND
========================================================= */

function createStars() {
    const container = $("#stars");

    if (!container) return;

    const fragment =
        document.createDocumentFragment();

    const amount =
        window.innerWidth < 600
            ? 55
            : 95;

    for (let i = 0; i < amount; i++) {
        const star =
            document.createElement("span");

        star.className = "star";

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.animationDelay =
            `${Math.random() * 5}s`;

        star.style.animationDuration =
            `${3 + Math.random() * 5}s`;

        const size =
            1 + Math.random() * 2;

        star.style.width =
            `${size}px`;

        star.style.height =
            `${size}px`;

        fragment.appendChild(star);
    }

    container.appendChild(fragment);
}


function createParticles() {
    const container = $("#particles");

    if (!container) return;

    const fragment =
        document.createDocumentFragment();

    const amount =
        window.innerWidth < 600
            ? 16
            : 28;

    for (let i = 0; i < amount; i++) {
        const particle =
            document.createElement("span");

        particle.className = "particle";

        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;

        particle.style.animationDelay =
            `${Math.random() * 8}s`;

        particle.style.animationDuration =
            `${7 + Math.random() * 9}s`;

        fragment.appendChild(particle);
    }

    container.appendChild(fragment);
}


/* =========================================================
   SCENE MANAGEMENT
========================================================= */

function showScene(sceneName, options = {}) {
    if (!SCENES.includes(sceneName)) {
        console.warn(
            `Escena desconocida: ${sceneName}`
        );
        return;
    }

    if (state.typingTimer) {
        window.clearTimeout(
            state.typingTimer
        );

        state.typingTimer = null;
    }

    const previousScene = state.scene;

    state.scene = sceneName;

    document.body.dataset.scene =
        sceneName;

    Accessibility.updateSceneAccessibility(
        sceneName
    );

    const progress = $("#progressBar");

    if (progress) {
        progress.setAttribute(
            "aria-valuenow",
            String(
                Math.min(
                    state.discovered.size,
                    5
                )
            )
        );
    }

    if (!options.silent) {
        Accessibility.announceScene(
            sceneName
        );
    }

    if (previousScene !== sceneName) {
        AudioEngine.transition();
    }

    if (!options.skipScroll) {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion
                ? "auto"
                : "smooth"
        });
    }

    window.setTimeout(() => {
        Accessibility.focusScene(
            sceneName
        );
    }, reducedMotion ? 0 : 80);
}


/* =========================================================
   TYPING EFFECT
========================================================= */

function typeText(element, text, speed = 28) {
    if (!element) return;

    if (state.typingTimer) {
        window.clearTimeout(
            state.typingTimer
        );

        state.typingTimer = null;
    }

    element.setAttribute(
        "aria-label",
        text
    );

    if (
        reducedMotion ||
        speed <= 0
    ) {
        element.textContent = text;
        return;
    }

    element.textContent = "";

    let index = 0;

    function write() {
        element.textContent =
            text.slice(0, index);

        index++;

        if (index <= text.length) {
            state.typingTimer =
                window.setTimeout(
                    write,
                    speed
                );
        } else {
            state.typingTimer = null;
        }
    }

    write();
}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress() {
    const count =
        state.discovered.size;

    const progressBar =
        $("#progressBar");

    const progressText =
        $("#progressText");

    const itemsHint =
        $("#itemsHint");

    if (progressBar) {
        progressBar.setAttribute(
            "aria-valuenow",
            String(Math.min(count, 5))
        );

        progressBar.setAttribute(
            "aria-valuetext",
            `${Math.min(count, 5)} de 5 recuerdos descubiertos`
        );

        const percent =
            Math.min(
                (count / 5) * 100,
                100
            );

        progressBar.style.setProperty(
            "--progress",
            `${percent}%`
        );
    }

    if (progressText) {
        progressText.textContent =
            `${Math.min(count, 5)} / 5`;
    }

    const secretCard = $(
        '.relic[data-relic="secret"]'
    );

    const unlocked =
        state.discovered.size >= 4 ||
        state.discovered.has("secret");

    if (secretCard) {
        secretCard.classList.toggle(
            "is-unlocked",
            unlocked
        );

        secretCard.setAttribute(
            "aria-disabled",
            unlocked ? "false" : "true"
        );

        const button =
            secretCard.querySelector("button");

        if (button) {
            button.disabled = !unlocked;
        }
    }

    if (itemsHint) {
        if (unlocked && !state.discovered.has("secret")) {
            itemsHint.textContent =
                "Cuatro recuerdos han despertado. Hay uno que todavía guarda un secreto.";
        } else if (
            state.discovered.has("secret")
        ) {
            itemsHint.textContent =
                "El cofre está abierto por completo.";
        } else {
            const remaining =
                4 - state.discovered.size;

            itemsHint.textContent =
                remaining === 1
                    ? "Falta un recuerdo para revelar el secreto."
                    : `Todavía quedan ${remaining} recuerdos por descubrir.`;
        }
    }

    $$("[data-relic]").forEach(card => {
        const key =
            card.dataset.relic;

        const discovered =
            state.discovered.has(key);

        card.classList.toggle(
            "is-discovered",
            discovered
        );

        card.setAttribute(
            "aria-pressed",
            discovered ? "true" : "false"
        );
    });
}


/* =========================================================
   RELICS
========================================================= */

function openRelic(relicKey) {
    if (!RELICS[relicKey]) {
        return;
    }

    if (
        relicKey === "secret" &&
        state.discovered.size < 4 &&
        !state.discovered.has("secret")
    ) {
        Accessibility.announce(
            "El secreto todavía está cerrado."
        );

        AudioEngine.click();

        return;
    }

    const relic =
        RELICS[relicKey];

    state.currentRelic =
        relicKey;

    const icon =
        $("#relicIcon");

    const eyebrow =
        $("#relicEyebrow");

    const title =
        $("#relicTitle");

    const body =
        $("#relicBody");

    const action =
        $("#relicAction");

    if (icon) {
        icon.textContent =
            relic.icon;
    }

    if (eyebrow) {
        eyebrow.textContent =
            relic.eyebrow;
    }

    if (title) {
        title.textContent =
            relic.title;
    }

    if (body) {
        typeText(
            body,
            relic.body,
            20
        );
    }

    if (action) {
        action.textContent =
            relic.action;

        action.dataset.relicAction =
            relicKey;
    }

    const mapVisual =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (mapVisual) {
        mapVisual.hidden =
            relicKey !== "distance";
    }

    if (wave) {
        wave.hidden =
            relicKey !== "voice";
    }

    showScene("relic");

    AudioEngine.reveal();
}


/* =========================================================
   DISCOVER RELIC
========================================================= */

function discoverRelic(relicKey) {
    if (!RELICS[relicKey]) {
        return;
    }

    if (!state.discovered.has(relicKey)) {
        state.discovered.add(relicKey);

        saveProgress();
        updateProgress();

        Accessibility.announce(
            `${RELICS[relicKey].eyebrow}: descubierto.`
        );
    }

    AudioEngine.reveal();
}


/* =========================================================
   OPEN CHEST
========================================================= */

function openChest() {
    if (state.opened) {
        showScene("letter");
        return;
    }

    state.opened = true;

    saveProgress();

    AudioEngine.unlock();
    AudioEngine.open();

    showScene("letter");

    Accessibility.announce(
        "El cofre se ha abierto."
    );
}


/* =========================================================
   RELIC ACTION
========================================================= */

function handleRelicAction() {
    const relicKey =
        state.currentRelic;

    if (!relicKey ||
        !RELICS[relicKey]) {
        return;
    }

    const mapVisual =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (relicKey === "distance") {
        if (mapVisual) {
            mapVisual.hidden = false;
            mapVisual.classList.add(
                "is-revealed"
            );
        }

        discoverRelic(relicKey);

    } else if (relicKey === "voice") {
        if (wave) {
            wave.hidden = false;
            wave.classList.add(
                "is-playing"
            );
        }

        discoverRelic(relicKey);

    } else {
        discoverRelic(relicKey);
    }

    const action =
        $("#relicAction");

    if (action) {
        action.textContent =
            RELICS[relicKey].nextText;
    }

    window.setTimeout(() => {
        showScene("items");
    }, reducedMotion ? 120 : 650);
}


/* =========================================================
   SECRET
========================================================= */

function openSecret() {
    if (
        state.discovered.size < 4 &&
        !state.discovered.has("secret")
    ) {
        Accessibility.announce(
            "El secreto todavía no puede abrirse."
        );

        return;
    }

    state.currentRelic =
        "secret";

    showScene("secret");

    AudioEngine.open();

    const secretText =
        $("#secretText");

    if (secretText) {
        typeText(
            secretText,
            RELICS.secret.body,
            26
        );
    }
}


function revealSecret() {
    discoverRelic("secret");

    AudioEngine.reveal();

    showScene("confession");
}


/* =========================================================
   SOUND
========================================================= */

function updateSoundButton() {
    const button =
        $("#soundBtn");

    if (!button) return;

    const enabled =
        AudioEngine.isEnabled();

    button.setAttribute(
        "aria-pressed",
        enabled ? "true" : "false"
    );

    button.setAttribute(
        "aria-label",
        enabled
            ? "Desactivar sonido"
            : "Activar sonido"
    );

    const label =
        button.querySelector(
            ".sound-label"
        );

    if (label) {
        label.textContent =
            enabled
                ? "SONIDO"
                : "SONIDO OFF";
    }
}


function toggleSound() {
    AudioEngine.unlock();

    AudioEngine.setEnabled(
        !AudioEngine.isEnabled()
    );

    updateSoundButton();

    Accessibility.announce(
        AudioEngine.isEnabled()
            ? "Sonido activado."
            : "Sonido desactivado."
    );
}


/* =========================================================
   RESTART
========================================================= */

function restartStory() {
    clearProgress();

    state.scene = "intro";
    state.opened = false;
    state.discovered.clear();
    state.currentRelic = null;

    updateProgress();

    $$(".relic").forEach(card => {
        card.classList.remove(
            "is-discovered"
        );
    });

    const mapVisual =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (mapVisual) {
        mapVisual.hidden = true;
        mapVisual.classList.remove(
            "is-revealed"
        );
    }

    if (wave) {
        wave.hidden = true;
        wave.classList.remove(
            "is-playing"
        );
    }

    showScene(
        "intro",
        {
            skipScroll: false
        }
    );

    AudioEngine.click();

    Accessibility.announce(
        "La historia ha comenzado de nuevo."
    );
}


/* =========================================================
   EVENT HANDLERS
========================================================= */

function bindEvents() {

    const openChestButton =
        $("#openChest");

    if (openChestButton) {
        openChestButton.addEventListener(
            "click",
            openChest
        );
    }


    $$("[data-next]").forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const next =
                    button.dataset.next;

                if (!next) return;

                AudioEngine.click();

                showScene(next);
            }
        );
    });


    $$(".relic").forEach(card => {
        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "button"
                    )
                ) {
                    return;
                }

                const relicKey =
                    card.dataset.relic;

                if (!relicKey) return;

                if (relicKey === "secret") {
                    openSecret();
                    return;
                }

                openRelic(relicKey);
            }
        );


        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                event.preventDefault();

                const relicKey =
                    card.dataset.relic;

                if (!relicKey) return;

                if (relicKey === "secret") {
                    openSecret();
                    return;
                }

                openRelic(relicKey);
            }
        );
    });


    const backItems =
        $("#backItems");

    if (backItems) {
        backItems.addEventListener(
            "click",
            () => {
                AudioEngine.click();
                showScene("items");
            }
        );
    }


    const relicAction =
        $("#relicAction");

    if (relicAction) {
        relicAction.addEventListener(
            "click",
            handleRelicAction
        );
    }


    const discoverSecretButton =
        $("#discoverSecret");

    if (discoverSecretButton) {
        discoverSecretButton.addEventListener(
            "click",
            revealSecret
        );
    }


    const finalButton =
        $("#finalBtn");

    if (finalButton) {
        finalButton.addEventListener(
            "click",
            () => {
                AudioEngine.reveal();
                showScene("message");
            }
        );
    }


    const soundButton =
        $("#soundBtn");

    if (soundButton) {
        soundButton.addEventListener(
            "click",
            toggleSound
        );
    }


    const restartButton =
        $("#restartBtn");

    if (restartButton) {
        restartButton.addEventListener(
            "click",
            restartStory
        );
    }


    const restartStoryButton =
        $("#restartStory");

    if (restartStoryButton) {
        restartStoryButton.addEventListener(
            "click",
            restartStory
        );
    }


    const finalButton2 =
        $("#finalBtn");

    if (finalButton2) {
        finalButton2.addEventListener(
            "click",
            () => {
                AudioEngine.transition();
            }
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            Accessibility.trapFocus(
                event
            );

            if (
                event.key === "Escape"
            ) {
                if (
                    state.scene === "relic" ||
                    state.scene === "secret"
                ) {
                    AudioEngine.click();
                    showScene("items");
                }
            }
        }
    );


    /*
     * The first interaction unlocks Web Audio
     * on browsers that block autoplay.
     */
    document.addEventListener(
        "pointerdown",
        () => {
            AudioEngine.unlock();
        },
        {
            once: true,
            passive: true
        }
    );


    /*
     * Small parallax effect.
     * Disabled when reduced motion is enabled.
     */
    if (!reducedMotion) {
        window.addEventListener(
            "pointermove",
            event => {

                const x =
                    (event.clientX /
                        window.innerWidth -
                        0.5) * 2;

                const y =
                    (event.clientY /
                        window.innerHeight -
                        0.5) * 2;

                document.documentElement
                    .style.setProperty(
                        "--mouse-x",
                        `${x * 8}px`
                    );

                document.documentElement
                    .style.setProperty(
                        "--mouse-y",
                        `${y * 8}px`
                    );
            },
            {
                passive: true
            }
        );
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {

    createStars();
    createParticles();

    loadProgress();

    updateProgress();

    updateSoundButton();

    Accessibility.updateSceneAccessibility(
        "intro"
    );

    document.body.dataset.scene =
        "intro";

    /*
     * Restore previously discovered cards.
     */
    $$(".relic").forEach(card => {
        const key =
            card.dataset.relic;

        if (
            key &&
            state.discovered.has(key)
        ) {
            card.classList.add(
                "is-discovered"
            );
        }
    });

    /*
     * Restore the last opened state
     * without automatically skipping
     * the introduction.
     */
    if (state.opened) {
        Accessibility.announce(
            "Puedes continuar explorando la historia."
        );
    }

    /*
     * Hide loader.
     */
    const loader =
        $("#loader");

    if (loader) {
        window.setTimeout(
            () => {
                loader.classList.add(
                    "is-hidden"
                );

                window.setTimeout(
                    () => {
                        loader.remove();
                    },
                    reducedMotion ? 0 : 700
                );
            },
            reducedMotion ? 0 : 500
        );
    }

    /*
     * Start in the intro scene.
     */
    showScene(
        "intro",
        {
            silent: true,
            skipScroll: true
        }
    );
}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initialize,
        {
            once: true
        }
    );
} else {
    initialize();
              }

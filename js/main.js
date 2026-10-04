"use strict";

/*
 * El Cofre que Aún No Abrimos
 * main.js — corrected version
 */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


/* =========================================================
   STATE
========================================================= */

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

const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================================
   SAFE STORAGE
========================================================= */

function saveProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                opened: state.opened,
                discovered: Array.from(state.discovered)
            })
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.", error);
    }
}


function loadProgress() {
    try {
        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) return;

        const data = JSON.parse(raw);

        if (data && typeof data === "object") {
            state.opened =
                Boolean(data.opened);

            if (Array.isArray(data.discovered)) {
                state.discovered =
                    new Set(data.discovered);
            }
        }

    } catch (error) {
        console.warn("No se pudo cargar el progreso.", error);
    }
}


function resetProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn("No se pudo borrar el progreso.", error);
    }
}


/* =========================================================
   ACCESSIBILITY
========================================================= */

function announce(message, alert = false) {
    const target = alert
        ? $("#srAlert")
        : $("#srStatus");

    if (!target) return;

    target.textContent = "";

    window.setTimeout(() => {
        target.textContent = message;
    }, 20);
}


function getFocusable(container) {
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
        const style =
            window.getComputedStyle(element);

        return (
            style.display !== "none" &&
            style.visibility !== "hidden"
        );
    });
}


function updateSceneAccessibility(sceneName) {
    $$(".scene").forEach(scene => {
        const isActive =
            scene.dataset.scene === sceneName;

        scene.classList.toggle(
            "is-active",
            isActive
        );

        scene.setAttribute(
            "aria-hidden",
            isActive ? "false" : "true"
        );

        /*
         * IMPORTANT:
         * Do not use inert in a way that prevents
         * the active scene from receiving focus.
         */
        if (isActive) {
            scene.removeAttribute("inert");

            if ("inert" in scene) {
                scene.inert = false;
            }
        } else {
            scene.setAttribute("inert", "");

            if ("inert" in scene) {
                scene.inert = true;
            }
        }
    });
}


function focusScene(sceneName) {
    const scene =
        $(`.scene[data-scene="${sceneName}"]`);

    if (!scene) return;

    const heading =
        scene.querySelector("h1, h2, h3");

    const target =
        heading ||
        scene.querySelector(
            "button:not([disabled]), a[href]"
        );

    if (!target) return;

    if (
        target.tagName !== "BUTTON" &&
        target.tagName !== "A"
    ) {
        target.setAttribute(
            "tabindex",
            "-1"
        );
    }

    window.setTimeout(() => {
        try {
            target.focus({
                preventScroll: true
            });
        } catch {
            target.focus();
        }
    }, prefersReducedMotion ? 0 : 120);
}


function trapFocus(event) {
    if (event.key !== "Tab") return;

    const activeScene =
        $(`.scene[data-scene="${state.scene}"]`);

    if (!activeScene) return;

    const focusable =
        getFocusable(activeScene);

    if (!focusable.length) return;

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


/* =========================================================
   BACKGROUND
========================================================= */

function createStars() {
    const container = $("#stars");

    if (!container) return;

    container.innerHTML = "";

    const amount =
        window.innerWidth <= 600
            ? 55
            : 95;

    const fragment =
        document.createDocumentFragment();

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

        star.setAttribute(
            "aria-hidden",
            "true"
        );

        fragment.appendChild(star);
    }

    container.appendChild(fragment);
}


function createParticles() {
    const container = $("#particles");

    if (!container) return;

    container.innerHTML = "";

    const amount =
        window.innerWidth <= 600
            ? 16
            : 28;

    const fragment =
        document.createDocumentFragment();

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

        particle.setAttribute(
            "aria-hidden",
            "true"
        );

        fragment.appendChild(particle);
    }

    container.appendChild(fragment);
}


/* =========================================================
   SCENE NAVIGATION
========================================================= */

function showScene(sceneName, options = {}) {
    const scene =
        $(`.scene[data-scene="${sceneName}"]`);

    if (!scene) {
        console.error(
            `No existe la escena: ${sceneName}`
        );
        return false;
    }

    if (state.typingTimer) {
        clearTimeout(state.typingTimer);
        state.typingTimer = null;
    }

    const oldScene = state.scene;

    state.scene = sceneName;

    document.body.dataset.scene =
        sceneName;

    /*
     * This is the critical part:
     * explicitly activate the requested scene.
     */
    $$(".scene").forEach(item => {
        const active =
            item === scene;

        item.classList.toggle(
            "is-active",
            active
        );

        item.setAttribute(
            "aria-hidden",
            active ? "false" : "true"
        );

        if ("inert" in item) {
            item.inert = !active;
        }

        if (active) {
            item.removeAttribute("inert");
        } else {
            item.setAttribute(
                "inert",
                ""
            );
        }
    });

    /*
     * Force the scene to be visible even if the
     * previous CSS implementation used another
     * visibility mechanism.
     */
    scene.style.visibility = "visible";
    scene.style.pointerEvents = "auto";
    scene.style.opacity = "1";

    $$(".scene").forEach(item => {
        if (item !== scene) {
            item.style.pointerEvents = "none";
        }
    });

    updateProgress();

    if (!options.silent) {
        announce(
            `Escena: ${
                sceneLabels[sceneName] ||
                sceneName
            }.`
        );
    }

    if (
        oldScene !== sceneName &&
        typeof AudioEngine !== "undefined"
    ) {
        AudioEngine.transition();
    }

    if (!options.noScroll) {
        window.scrollTo({
            top: 0,
            behavior:
                prefersReducedMotion
                    ? "auto"
                    : "smooth"
        });
    }

    if (!options.noFocus) {
        focusScene(sceneName);
    }

    return true;
}


/* =========================================================
   TEXT EFFECT
========================================================= */

function typeText(
    element,
    text,
    speed = 25
) {
    if (!element) return;

    if (state.typingTimer) {
        clearTimeout(state.typingTimer);
        state.typingTimer = null;
    }

    element.setAttribute(
        "aria-label",
        text
    );

    if (
        prefersReducedMotion ||
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

    const visibleCount =
        Math.min(count, 5);

    if (progressBar) {
        progressBar.setAttribute(
            "aria-valuenow",
            String(visibleCount)
        );

        progressBar.setAttribute(
            "aria-valuemin",
            "0"
        );

        progressBar.setAttribute(
            "aria-valuemax",
            "5"
        );

        progressBar.setAttribute(
            "aria-valuetext",
            `${visibleCount} de 5 recuerdos descubiertos`
        );

        progressBar.style.setProperty(
            "--progress",
            `${(visibleCount / 5) * 100}%`
        );
    }

    if (progressText) {
        progressText.textContent =
            `${visibleCount} / 5`;
    }

    $$(".relic").forEach(card => {
        const key =
            card.dataset.relic;

        const discovered =
            state.discovered.has(key);

        card.classList.toggle(
            "is-discovered",
            discovered
        );

        if (key === "secret") {
            const unlocked =
                count >= 4 ||
                state.discovered.has("secret");

            card.classList.toggle(
                "is-unlocked",
                unlocked
            );

            card.setAttribute(
                "aria-disabled",
                unlocked
                    ? "false"
                    : "true"
            );

            const button =
                card.querySelector("button");

            if (button) {
                button.disabled =
                    !unlocked;
            }
        }
    });

    if (itemsHint) {
        if (state.discovered.has("secret")) {
            itemsHint.textContent =
                "El cofre está abierto por completo.";

        } else if (count >= 4) {
            itemsHint.textContent =
                "Cuatro recuerdos han despertado. El último guarda un secreto.";

        } else {
            const remaining =
                4 - count;

            itemsHint.textContent =
                remaining === 1
                    ? "Falta un recuerdo para revelar el secreto."
                    : `Todavía quedan ${remaining} recuerdos por descubrir.`;
        }
    }
}


/* =========================================================
   RELICS
========================================================= */

function openRelic(relicKey) {
    if (
        typeof RELICS === "undefined" ||
        !RELICS[relicKey]
    ) {
        console.error(
            "Relic no encontrada:",
            relicKey
        );
        return;
    }

    if (
        relicKey === "secret" &&
        state.discovered.size < 4 &&
        !state.discovered.has("secret")
    ) {
        announce(
            "El secreto todavía está cerrado.",
            true
        );

        if (typeof AudioEngine !== "undefined") {
            AudioEngine.click();
        }

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
            18
        );
    }

    if (action) {
        action.textContent =
            relic.action;

        action.dataset.relicAction =
            relicKey;

        action.disabled = false;
    }

    const map =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (map) {
        map.hidden =
            relicKey !== "distance";

        map.classList.remove(
            "is-revealed"
        );
    }

    if (wave) {
        wave.hidden =
            relicKey !== "voice";

        wave.classList.remove(
            "is-playing"
        );
    }

    showScene("relic");

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.reveal();
    }
}


/* =========================================================
   DISCOVER RELIC
========================================================= */

function discoverRelic(relicKey) {
    if (
        typeof RELICS === "undefined" ||
        !RELICS[relicKey]
    ) {
        return;
    }

    if (!state.discovered.has(relicKey)) {
        state.discovered.add(relicKey);

        saveProgress();
        updateProgress();

        announce(
            `${RELICS[relicKey].eyebrow}: descubierto.`
        );
    }

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.reveal();
    }
}


/* =========================================================
   INTRO
========================================================= */

function openChest() {
    state.opened = true;

    saveProgress();

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.unlock();
        AudioEngine.open();
    }

    showScene("letter");

    announce(
        "El cofre se ha abierto."
    );
}


/* =========================================================
   RELIC ACTION
========================================================= */

function handleRelicAction() {
    const relicKey =
        state.currentRelic;

    if (
        !relicKey ||
        typeof RELICS === "undefined" ||
        !RELICS[relicKey]
    ) {
        return;
    }

    const map =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (relicKey === "distance") {
        if (map) {
            map.hidden = false;

            window.setTimeout(() => {
                map.classList.add(
                    "is-revealed"
                );
            }, 30);
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

    const button =
        $("#relicAction");

    if (button) {
        button.textContent =
            RELICS[relicKey].nextText;
    }

    window.setTimeout(
        () => {
            showScene("items");
        },
        prefersReducedMotion
            ? 100
            : 700
    );
}


/* =========================================================
   SECRET
========================================================= */

function openSecret() {
    if (
        state.discovered.size < 4 &&
        !state.discovered.has("secret")
    ) {
        announce(
            "El secreto todavía no puede abrirse.",
            true
        );

        if (typeof AudioEngine !== "undefined") {
            AudioEngine.click();
        }

        return;
    }

    state.currentRelic =
        "secret";

    showScene("secret");

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.open();
    }

    const text =
        $("#secretText");

    if (text) {
        typeText(
            text,
            RELICS.secret.body,
            25
        );
    }
}


function revealSecret() {
    discoverRelic("secret");

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.reveal();
    }

    showScene("confession");
}


/* =========================================================
   SOUND
========================================================= */

function updateSoundButton() {
    const button =
        $("#soundBtn");

    if (!button) return;

    if (
        typeof AudioEngine === "undefined"
    ) {
        return;
    }

    const enabled =
        AudioEngine.isEnabled();

    button.setAttribute(
        "aria-pressed",
        enabled
            ? "true"
            : "false"
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
    if (
        typeof AudioEngine === "undefined"
    ) {
        return;
    }

    AudioEngine.unlock();

    AudioEngine.setEnabled(
        !AudioEngine.isEnabled()
    );

    updateSoundButton();

    announce(
        AudioEngine.isEnabled()
            ? "Sonido activado."
            : "Sonido desactivado."
    );
}


/* =========================================================
   RESTART
========================================================= */

function restartStory() {
    resetProgress();

    state.scene = "intro";
    state.opened = false;
    state.discovered.clear();
    state.currentRelic = null;

    if (state.typingTimer) {
        clearTimeout(state.typingTimer);
        state.typingTimer = null;
    }

    updateProgress();

    const map =
        $("#mapVisual");

    const wave =
        $("#wave");

    if (map) {
        map.hidden = true;
        map.classList.remove(
            "is-revealed"
        );
    }

    if (wave) {
        wave.hidden = true;
        wave.classList.remove(
            "is-playing"
        );
    }

    if (typeof AudioEngine !== "undefined") {
        AudioEngine.click();
    }

    showScene(
        "intro"
    );

    announce(
        "La historia ha comenzado de nuevo."
    );
}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    /*
     * Open chest
     */
    const openChestButton =
        $("#openChest");

    if (openChestButton) {
        openChestButton.addEventListener(
            "click",
            openChest
        );
    }


    /*
     * Generic next buttons
     */
    $$("[data-next]").forEach(button => {

        button.addEventListener(
            "click",
            () => {
                const next =
                    button.dataset.next;

                if (!next) return;

                if (typeof AudioEngine !== "undefined") {
                    AudioEngine.click();
                }

                showScene(next);
            }
        );

    });


    /*
     * Relic cards
     */
    $$(".relic").forEach(card => {

        card.setAttribute(
            "tabindex",
            "0"
        );

        card.setAttribute(
            "role",
            "button"
        );

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest("button")
                ) {
                    return;
                }

                const key =
                    card.dataset.relic;

                if (!key) return;

                if (key === "secret") {
                    openSecret();
                } else {
                    openRelic(key);
                }
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

                const key =
                    card.dataset.relic;

                if (!key) return;

                if (key === "secret") {
                    openSecret();
                } else {
                    openRelic(key);
                }
            }
        );

    });


    /*
     * Back to relics
     */
    const backItems =
        $("#backItems");

    if (backItems) {
        backItems.addEventListener(
            "click",
            () => {

                if (typeof AudioEngine !== "undefined") {
                    AudioEngine.click();
                }

                showScene("items");
            }
        );
    }


    /*
     * Relic action
     */
    const relicAction =
        $("#relicAction");

    if (relicAction) {
        relicAction.addEventListener(
            "click",
            handleRelicAction
        );
    }


    /*
     * Secret
     */
    const discoverSecretButton =
        $("#discoverSecret");

    if (discoverSecretButton) {
        discoverSecretButton.addEventListener(
            "click",
            revealSecret
        );
    }


    /*
     * Confession -> message
     */
    const finalButton =
        $("#finalBtn");

    if (finalButton) {
        finalButton.addEventListener(
            "click",
            () => {

                if (typeof AudioEngine !== "undefined") {
                    AudioEngine.reveal();
                }

                showScene("message");
            }
        );
    }


    /*
     * Message -> future
     *
     * If the HTML uses data-next="future",
     * the generic handler above handles it.
     */
    const futureButtons =
        $$('[data-next="future"]');

    futureButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                showScene("future");
            }
        );
    });


    /*
     * Future -> ending
     */
    const endingButtons =
        $$('[data-next="ending"]');

    endingButtons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                showScene("ending");
            }
        );
    });


    /*
     * Sound
     */
    const soundButton =
        $("#soundBtn");

    if (soundButton) {
        soundButton.addEventListener(
            "click",
            toggleSound
        );
    }


    /*
     * Restart from top bar
     */
    const restartButton =
        $("#restartBtn");

    if (restartButton) {
        restartButton.addEventListener(
            "click",
            restartStory
        );
    }


    /*
     * Restart from ending
     */
    const restartStoryButton =
        $("#restartStory");

    if (restartStoryButton) {
        restartStoryButton.addEventListener(
            "click",
            restartStory
        );
    }


    /*
     * Keyboard accessibility
     */
    document.addEventListener(
        "keydown",
        event => {

            trapFocus(event);

            if (event.key === "Escape") {

                if (
                    state.scene === "relic" ||
                    state.scene === "secret"
                ) {

                    if (typeof AudioEngine !== "undefined") {
                        AudioEngine.click();
                    }

                    showScene("items");
                }
            }
        }
    );


    /*
     * Unlock Web Audio after user interaction
     */
    document.addEventListener(
        "pointerdown",
        () => {

            if (
                typeof AudioEngine !== "undefined"
            ) {
                AudioEngine.unlock();
            }

        },
        {
            once: true,
            passive: true
        }
    );


    /*
     * Subtle mouse parallax
     */
    if (!prefersReducedMotion) {

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

                document.documentElement.style.setProperty(
                    "--mouse-x",
                    `${x * 8}px`
                );

                document.documentElement.style.setProperty(
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
   LOADER
========================================================= */

function hideLoader() {
    const loader =
        $("#loader");

    if (!loader) return;

    loader.classList.add(
        "is-hidden"
    );

    window.setTimeout(
        () => {
            if (loader.parentNode) {
                loader.remove();
            }
        },
        prefersReducedMotion
            ? 0
            : 800
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {

    loadProgress();

    createStars();
    createParticles();

    bindEvents();

    updateProgress();
    updateSoundButton();

    /*
     * Explicitly initialize every scene.
     */
    $$(".scene").forEach(scene => {

        const active =
            scene.dataset.scene === "intro";

        scene.classList.toggle(
            "is-active",
            active
        );

        scene.setAttribute(
            "aria-hidden",
            active ? "false" : "true"
        );

        if ("inert" in scene) {
            scene.inert = !active;
        }

        if (active) {
            scene.removeAttribute("inert");
            scene.style.visibility =
                "visible";
            scene.style.pointerEvents =
                "auto";
            scene.style.opacity = "1";
        } else {
            scene.setAttribute(
                "inert",
                ""
            );
            scene.style.pointerEvents =
                "none";
        }
    });

    state.scene = "intro";

    document.body.dataset.scene =
        "intro";

    hideLoader();

    window.setTimeout(() => {
        focusScene("intro");
    }, prefersReducedMotion ? 0 : 150);
}


/* =========================================================
   START
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

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];


const state = {

  scene: "intro",

  opened: false,

  discovered: new Set(),

  currentRelic: null,

  typingTimer: null

};


/* ==========================================
   ACCESSIBILITY
   ========================================== */

const Accessibility = (() => {

  const sceneLabels = {

    intro: "Introducción",

    letter: "La carta",

    items: "Las piezas del cofre",

    relic: "Pieza descubierta",

    secret: "El secreto",

    confession: "Una confesión",

    message: "Un mensaje para Dacia",

    future: "El futuro",

    ending: "Final"

  };


  function announce(
    message,
    assertive = false
  ) {

    const element = document.getElementById(
      assertive
        ? "srAlert"
        : "srStatus"
    );

    if (!element) return;

    element.textContent = "";

    requestAnimationFrame(() => {

      element.textContent =
        message;

    });

  }


  function getFocusable(container) {

    if (!container) return [];

    return [
      ...container.querySelectorAll(`
        a[href],
        button:not([disabled]),
        input:not([disabled]),
        select:not([disabled]),
        textarea:not([disabled]),
        [tabindex]:not([tabindex="-1"])
      `)
    ].filter(element => {

      const style =
        window.getComputedStyle(element);

      return (
        style.display !== "none" &&
        style.visibility !== "hidden"
      );

    });

  }


  function updateSceneAccessibility(
    sceneName
  ) {

    $$(".scene").forEach(scene => {

      const active =
        scene.id === `scene-${sceneName}`;

      scene.setAttribute(
        "aria-hidden",
        String(!active)
      );

      if (active) {

        scene.removeAttribute(
          "inert"
        );

      } else {

        scene.setAttribute(
          "inert",
          ""
        );

      }

    });

  }


  function focusScene(sceneName) {

    const scene =
      document.getElementById(
        `scene-${sceneName}`
      );

    if (!scene) return;

    const target =
      scene.querySelector(
        "[data-scene-heading]"
      ) ||
      scene.querySelector(
        "h1, h2, h3"
      ) ||
      scene.querySelector(
        "button, a"
      );

    if (!target) return;

    requestAnimationFrame(() => {

      target.setAttribute(
        "tabindex",
        "-1"
      );

      target.focus({
        preventScroll: true
      });

    });

  }


  function trapFocus(event) {

    const activeScene =
      document.querySelector(
        ".scene.active"
      );

    if (!activeScene) return;

    const focusable =
      getFocusable(activeScene);

    if (!focusable.length) return;

    if (event.key !== "Tab") return;

    const first =
      focusable[0];

    const last =
      focusable[focusable.length - 1];


    if (
      event.shiftKey &&
      document.activeElement === first
    ) {

      event.preventDefault();

      last.focus();

    }

    else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {

      event.preventDefault();

      first.focus();

    }

  }


  return {

    announce,

    updateSceneAccessibility,

    focusScene,

    trapFocus,

    announceScene(sceneName) {

      announce(
        sceneLabels[sceneName] ||
        "Nueva escena"
      );

    }

  };

})();


/* ==========================================
   PARTICLES
   ========================================== */

function createStars() {

  const particles =
    document.getElementById(
      "particles"
    );

  if (!particles) return;

  for (
    let i = 0;
    i < 34;
    i++
  ) {

    const star =
      document.createElement("span");

    star.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      width:${1 + Math.random() * 2}px;
      height:${1 + Math.random() * 2}px;
      border-radius:50%;
      background:#F3DFA5;
      opacity:${.12 + Math.random() * .45};
      animation:
        twinkle
        ${2 + Math.random() * 4}s
        ease-in-out
        infinite
        ${Math.random() * 3}s;
    `;

    particles.appendChild(star);

  }

  const style =
    document.createElement("style");

  style.textContent = `
    @keyframes twinkle {
      50% {
        opacity: .05;
        transform: scale(.5);
      }
    }
  `;

  document.head.appendChild(style);

}

createStars();


/* ==========================================
   SCENE NAVIGATION
   ========================================== */

function showScene(name) {

  state.scene = name;

  $$(".scene").forEach(scene => {

    const active =
      scene.id === `scene-${name}`;

    scene.classList.toggle(
      "active",
      active
    );

    scene.setAttribute(
      "aria-hidden",
      String(!active)
    );

    if (active) {

      scene.removeAttribute(
        "inert"
      );

    } else {

      scene.setAttribute(
        "inert",
        ""
      );

    }

  });


  window.scrollTo({

    top: 0,

    behavior:
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth"

  });


  localStorage.setItem(
    "daciaScene",
    name
  );


  setTimeout(() => {

    Accessibility
      .updateSceneAccessibility(
        name
      );

    Accessibility
      .announceScene(name);

    Accessibility
      .focusScene(name);

  }, 50);

}


/* ==========================================
   TYPING
   ========================================== */

function typeText(
  element,
  text,
  speed = 38,
  done
) {

  if (!element) return;

  clearInterval(
    state.typingTimer
  );

  element.textContent = "";

  element.setAttribute(
    "aria-label",
    text
  );


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  if (reducedMotion) {

    element.textContent =
      text;

    if (done) done();

    return;

  }


  let index = 0;


  state.typingTimer =
    setInterval(() => {

      element.textContent +=
        text[index++];

      if (
        index >= text.length
      ) {

        clearInterval(
          state.typingTimer
        );

        if (done) done();

      }

    }, speed);

}


/* ==========================================
   PROGRESS
   ========================================== */

function updateProgress() {

  const count =
    state.discovered.size;


  const bar =
    document.getElementById(
      "progressBar"
    );


  if (bar) {

    const percentage =
      count / 4 * 100;

    bar.style.width =
      percentage + "%";

    bar.parentElement
      .setAttribute(
        "aria-valuenow",
        String(count)
      );

    bar.parentElement
      .setAttribute(
        "aria-valuetext",
        `${count} de 4 piezas descubiertas`
      );

  }


  const secret =
    document.querySelector(
      ".secret-relic"
    );


  if (secret) {

    if (count >= 4) {

      secret.disabled = false;

      secret.removeAttribute(
        "aria-disabled"
      );

      secret.setAttribute(
        "tabindex",
        "0"
      );

      const small =
        secret.querySelector(
          "small"
        );

      if (small) {
        small.textContent =
          "listo";
      }

    } else {

      secret.disabled = true;

      secret.setAttribute(
        "aria-disabled",
        "true"
      );

      secret.setAttribute(
        "tabindex",
        "-1"
      );

    }

  }


  const hint =
    document.getElementById(
      "itemsHint"
    );


  if (hint) {

    hint.textContent =
      count >= 4

        ? "Las cuatro piezas han sido descubiertas. El secreto te espera."

        : `Descubre las cuatro primeras piezas. ${count} de 4.`;

  }


  localStorage.setItem(
    "daciaRelics",
    JSON.stringify(
      [...state.discovered]
    )
  );

}


/* ==========================================
   OPEN RELIC
   ========================================== */

function openRelic(key) {

  const data =
    RELICS[key];

  if (!data) return;

  state.currentRelic =
    key;


  const visual =
    document.getElementById(
      "relicVisual"
    );

  const eyebrow =
    document.getElementById(
      "relicEyebrow"
    );

  const title =
    document.getElementById(
      "relicTitle"
    );

  const body =
    document.getElementById(
      "relicBody"
    );

  const action =
    document.getElementById(
      "relicAction"
    );

  const map =
    document.getElementById(
      "mapVisual"
    );

  const wave =
    document.getElementById(
      "wave"
    );


  if (visual) {

    visual.textContent =
      data.icon;

    visual.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  if (eyebrow) {

    eyebrow.textContent =
      data.eyebrow;

  }


  if (title) {

    title.textContent =
      data.title;

  }


  if (body) {

    body.textContent =
      data.body;

  }


  if (action) {

    action.textContent =
      data.action;

    action.dataset.key =
      key;

    action.setAttribute(
      "aria-label",
      `${data.action}: ${data.title}`
    );

  }


  if (map) {

    map.hidden =
      key !== "distance";

    map.setAttribute(
      "aria-hidden",
      String(
        key !== "distance"
      )
    );

  }


  if (wave) {

    wave.hidden =
      key !== "voice";

    wave.setAttribute(
      "aria-hidden",
      String(
        key !== "voice"
      )
    );

  }


  showScene("relic");

  AudioEngine.reveal();


  Accessibility.announce(
    `${data.eyebrow}. ${data.title} ${data.body}`
  );

}


/* ==========================================
   OPEN CHEST
   ========================================== */

const openChest =
  document.getElementById(
    "openChest"
  );


if (openChest) {

  openChest.addEventListener(
    "click",
    () => {

      AudioEngine.unlock();

      AudioEngine.open();

      state.opened = true;


      const lid =
        document.querySelector(
          ".chest-lid"
        );


      if (lid) {

        lid.style.transform =
          "rotateX(-115deg) translateY(-8px)";

      }


      setTimeout(() => {

        showScene(
          "letter"
        );

        typeText(
          document.getElementById(
            "letterText"
          ),
          "Antes de conocerte, mi mundo era mucho más silencioso. Y entonces apareciste tú.",
          42
        );

      }, 900);

    }
  );

}


/* ==========================================
   GENERIC NEXT BUTTONS
   ========================================== */

$$("[data-next]").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        AudioEngine.unlock();

        AudioEngine.click();

        showScene(
          button.dataset.next
        );

      }
    );

  }
);


/* ==========================================
   RELICS
   ========================================== */

$$(".relic").forEach(
  relic => {

    relic.addEventListener(
      "click",
      () => {

        if (relic.disabled) return;

        AudioEngine.unlock();

        AudioEngine.click();

        const key =
          relic.dataset.relic;


        if (key === "secret") {

          showScene(
            "secret"
          );

          return;

        }


        state.discovered.add(
          key
        );

        updateProgress();

        openRelic(key);

      }
    );


    relic.addEventListener(
      "keydown",
      event => {

        if (relic.disabled) return;

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          relic.click();

        }

      }
    );

  }
);


/* ==========================================
   BACK
   ========================================== */

const backItems =
  document.getElementById(
    "backItems"
  );


if (backItems) {

  backItems.addEventListener(
    "click",
    () => {

      AudioEngine.click();

      showScene(
        "items"
      );

    }
  );

}


/* ==========================================
   RELIC ACTION
   ========================================== */

const relicAction =
  document.getElementById(
    "relicAction"
  );


if (relicAction) {

  relicAction.addEventListener(
    "click",
    () => {

      const key =
        relicAction.dataset.key;

      if (!key) return;

      AudioEngine.click();


      if (key === "voice") {

        AudioEngine.unlock();

        relicAction.textContent =
          "REPRODUCIENDO...";

        setTimeout(() => {

          relicAction.textContent =
            "GUARDAR";

        }, 900);

      } else {

        relicAction.textContent =
          RELICS[key].nextText;

      }


      setTimeout(() => {

        showScene(
          "items"
        );

      }, 700);

    }
  );

}


/* ==========================================
   SECRET
   ========================================== */

const discoverSecret =
  document.getElementById(
    "discoverSecret"
  );


if (discoverSecret) {

  discoverSecret.addEventListener(
    "click",
    () => {

      AudioEngine.unlock();

      AudioEngine.reveal();

      showScene(
        "confession"
      );


      const line =
        document.getElementById(
          "confessionLine"
        );

      const final =
        document.getElementById(
          "confessionFinal"
        );


      if (final) {
        final.hidden = true;
      }

      if (line) {
        line.hidden = false;
      }


      typeText(
        line,
        "Dacia...",
        110,
        () => {

          setTimeout(() => {

            if (line) {
              line.hidden = true;
            }

            if (final) {
              final.hidden = false;
            }

            AudioEngine.reveal();

            Accessibility.announce(
              "Me gustas."
            );

          }, 1100);

        }
      );

    }
  );

}


/* ==========================================
   SOUND
   ========================================== */

const soundBtn =
  document.getElementById(
    "soundBtn"
  );


if (soundBtn) {

  soundBtn.addEventListener(
    "click",
    () => {

      const next =
        !AudioEngine.isEnabled();

      AudioEngine.setEnabled(
        next
      );


      soundBtn.setAttribute(
        "aria-pressed",
        String(next)
      );


      const text =
        soundBtn.querySelector(
          "span"
        );


      if (text) {
        text.textContent =
          next ? "ON" : "OFF";
      }


      Accessibility.announce(
        next
          ? "Sonido activado."
          : "Sonido desactivado."
      );

    }
  );

}


/* ==========================================
   RESTART
   ========================================== */

function restart() {

  localStorage.removeItem(
    "daciaScene"
  );

  localStorage.removeItem(
    "daciaRelics"
  );


  state.discovered =
    new Set();

  state.opened =
    false;


  updateProgress();


  const lid =
    document.querySelector(
      ".chest-lid"
    );


  if (lid) {
    lid.style.transform =
      "";
  }


  showScene(
    "intro"
  );

}


const restartBtn =
  document.getElementById(
    "restartBtn"
  );


if (restartBtn) {

  restartBtn.addEventListener(
    "click",
    restart
  );

}


const restartStory =
  document.getElementById(
    "restartStory"
  );


if (restartStory) {

  restartStory.addEventListener(
    "click",
    restart
  );

}


/* ==========================================
   FINAL
   ========================================== */

const finalBtn =
  document.getElementById(
    "finalBtn"
  );


if (finalBtn) {

  finalBtn.addEventListener(
    "click",
    () => {

      AudioEngine.unlock();

      AudioEngine.reveal();

      showScene(
        "ending"
      );

    }
  );

}


/* ==========================================
   KEYBOARD
   ========================================== */

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
        state.scene !== "intro" &&
        state.scene !== "items"
      ) {

        showScene(
          "items"
        );

        Accessibility.announce(
          "Has vuelto a las piezas del cofre."
        );

      }

    }

  }
);


/* ==========================================
   AUDIO UNLOCK
   ========================================== */

window.addEventListener(
  "pointerdown",
  () => {

    AudioEngine.unlock();

  },
  { once: true }
);


/* ==========================================
   REDUCED MOTION
   ========================================== */

const reducedMotionQuery =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );


function handleMotionPreference() {

  document.documentElement
    .classList.toggle(
      "reduced-motion",
      reducedMotionQuery.matches
    );

}


handleMotionPreference();


if (
  reducedMotionQuery.addEventListener
) {

  reducedMotionQuery.addEventListener(
    "change",
    handleMotionPreference
  );

}


/* ==========================================
   INITIALIZE
   ========================================== */

window.addEventListener(
  "load",
  () => {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "daciaRelics"
        ) || "[]"
      );


    state.discovered =
      new Set(saved);


    updateProgress();


    $$(".scene").forEach(
      scene => {

        const active =
          scene.classList.contains(
            "active"
          );

        scene.setAttribute(
          "aria-hidden",
          String(!active)
        );

        if (!active) {

          scene.setAttribute(
            "inert",
            ""
          );

        }

      }
    );


    setTimeout(() => {

      const loader =
        document.getElementById(
          "loader"
        );

      if (loader) {
        loader.classList.add(
          "done"
        );
      }

    }, 900);

  }
);

"use strict";

/*
 * El Cofre que Aún No Abrimos
 * Ambient Web Audio engine
 *
 * No external audio file is required.
 * The browser may require a user interaction before audio starts.
 */

const AudioEngine = (() => {

    let ctx = null;
    let master = null;
    let ambientGain = null;
    let ambientStarted = false;

    let enabled = true;
    let initialized = false;

    function init() {
        if (initialized) return;

        initialized = true;

        try {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                console.warn("Web Audio API no disponible.");
                return;
            }

            ctx = new AudioContext();

            master = ctx.createGain();
            master.gain.value = enabled ? 0.035 : 0;

            master.connect(ctx.destination);

            ambientGain = ctx.createGain();
            ambientGain.gain.value = 0.15;

            ambientGain.connect(master);

        } catch (error) {
            console.warn(
                "No fue posible inicializar el audio:",
                error
            );

            ctx = null;
            master = null;
            ambientGain = null;
        }
    }


    function startAmbient() {
        if (ambientStarted) return;

        init();

        if (!ctx || !ambientGain) {
            return;
        }

        try {

            /*
             * Very soft ambient drone.
             * It is intentionally subtle and contains no lyrics.
             */

            const oscillatorA = ctx.createOscillator();
            const oscillatorB = ctx.createOscillator();

            const gainA = ctx.createGain();
            const gainB = ctx.createGain();

            oscillatorA.type = "sine";
            oscillatorB.type = "sine";

            oscillatorA.frequency.value = 110;
            oscillatorB.frequency.value = 164.81;

            gainA.gain.value = 0.012;
            gainB.gain.value = 0.006;

            oscillatorA.connect(gainA);
            oscillatorB.connect(gainB);

            gainA.connect(ambientGain);
            gainB.connect(ambientGain);

            oscillatorA.start();
            oscillatorB.start();

            ambientStarted = true;

        } catch (error) {
            console.warn(
                "No fue posible iniciar el ambiente sonoro:",
                error
            );
        }
    }


    function unlock() {

        init();

        if (!ctx) {
            return;
        }

        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        if (enabled) {
            startAmbient();
        }
    }


    function tone(
        frequency = 440,
        duration = 0.12,
        type = "sine",
        volume = 0.09
    ) {

        if (!enabled) {
            return;
        }

        init();

        if (!ctx || !master) {
            return;
        }

        try {

            if (ctx.state === "suspended") {
                ctx.resume().catch(() => {});
            }

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(
                frequency,
                ctx.currentTime
            );

            const now = ctx.currentTime;

            gain.gain.setValueAtTime(
                0.0001,
                now
            );

            gain.gain.exponentialRampToValueAtTime(
                Math.max(volume, 0.001),
                now + 0.015
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + duration
            );

            oscillator.connect(gain);
            gain.connect(master);

            oscillator.start(now);

            oscillator.stop(
                now + duration + 0.03
            );

        } catch (error) {
            console.warn(
                "No fue posible reproducir el tono:",
                error
            );
        }
    }


    function click() {
        tone(
            520,
            0.08,
            "sine",
            0.055
        );
    }


    function open() {

        tone(
            220,
            0.22,
            "triangle",
            0.07
        );

        window.setTimeout(() => {

            tone(
                330,
                0.30,
                "sine",
                0.065
            );

        }, 90);
    }


    function reveal() {

        tone(
            660,
            0.18,
            "sine",
            0.07
        );

        window.setTimeout(() => {

            tone(
                880,
                0.35,
                "sine",
                0.06
            );

        }, 90);
    }


    function transition() {

        tone(
            440,
            0.16,
            "sine",
            0.05
        );

        window.setTimeout(() => {

            tone(
                554.37,
                0.22,
                "sine",
                0.045
            );

        }, 80);
    }


    function setEnabled(value) {

        enabled = Boolean(value);

        init();

        if (!master) {
            return;
        }

        master.gain.cancelScheduledValues(
            ctx.currentTime
        );

        master.gain.setTargetAtTime(
            enabled ? 0.035 : 0,
            ctx.currentTime,
            0.04
        );

        if (enabled) {
            unlock();
        }
    }


    function isEnabled() {
        return enabled;
    }


    return {
        init,
        unlock,
        click,
        open,
        reveal,
        transition,
        setEnabled,
        isEnabled
    };

})();

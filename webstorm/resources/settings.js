"use strict";
console.clear();
const IS_MOBILE = window.innerWidth <= 640, IS_DESKTOP = window.innerWidth > 800,
    IS_HEADER = IS_DESKTOP && window.innerHeight < 300, IS_HIGH_END_DEVICE = (() => {
        let a = navigator.hardwareConcurrency;
        if (!a) return !1;
        let b = window.innerWidth <= 1024 ? 4 : 8;
        return a >= b
    })(), MAX_WIDTH = 7680, MAX_HEIGHT = 4320, GRAVITY = .9;
let simSpeed = 1;

function getDefaultScaleFactor() {
    return IS_MOBILE ? .9 : IS_HEADER ? .75 : 1
}

let stageW, stageH, quality = 1, isLowQuality = !1, isNormalQuality = !0, isHighQuality = !1;
const QUALITY_LOW = 1, QUALITY_NORMAL = 2, QUALITY_HIGH = 3, SKY_LIGHT_NONE = 0, SKY_LIGHT_DIM = 1,
    SKY_LIGHT_NORMAL = 2,
    COLOR = {Red: "#ff0043", Green: "#14fc56", Blue: "#1e7fff", Purple: "#e60aff", Gold: "#ffbf36", White: "#ffffff"},
    INVISIBLE = "_INVISIBLE_", PI_2 = 2 * Math.PI, PI_HALF = .5 * Math.PI, trailsStage = new Stage("trails-canvas"),
    mainStage = new Stage("main-canvas"), stages = [trailsStage, mainStage];

function fullscreenEnabled() {
    return fscreen.fullscreenEnabled
}

function isFullscreen() {
    return !!fscreen.fullscreenElement
}

function toggleFullscreen() {
    fullscreenEnabled() && (isFullscreen() ? fscreen.exitFullscreen() : fscreen.requestFullscreen(document.documentElement))
}

fscreen.addEventListener("fullscreenchange", () => {
    store.setState({fullscreen: isFullscreen()})
});
const store = {
    _listeners: new Set,
    _dispatch(a) {
        this._listeners.forEach(b => b(this.state, a))
    },
    state: {
        paused: !0,
        soundEnabled: !0,
        menuOpen: !1,
        openHelpTopic: null,
        fullscreen: isFullscreen(),
        config: {
            quality: String(IS_HIGH_END_DEVICE ? 3 : 2),
            shell: "Random",
            size: IS_DESKTOP ? "3" : IS_HEADER ? "1.2" : "2",
            autoLaunch: !0,
            finale: !0,
            skyLighting: "2",
            hideControls: IS_HEADER,
            longExposure: !1,
            scaleFactor: getDefaultScaleFactor()
        }
    },
    setState(a) {
        let b = this.state;
        this.state = Object.assign({}, this.state, a), this._dispatch(b), this.persist()
    },
    subscribe(a) {
        return this._listeners.add(a), () => this._listeners.remove(a)
    },
    load() {
        let d = localStorage.getItem("cm_fireworks_data");
        if (d) {
            let {schemaVersion: g, data: a} = JSON.parse(d), b = this.state.config;
            switch (g) {
                case"1.1":
                    b.quality = a.quality, b.size = a.size, b.skyLighting = a.skyLighting;
                    break;
                case"1.2":
                    b.quality = a.quality, b.size = a.size, b.skyLighting = a.skyLighting, b.scaleFactor = a.scaleFactor;
                    break;
                default:
                    throw new Error("version switch should be exhaustive")
            }
        } else if ("1" === localStorage.getItem("schemaVersion")) {
            let e;
            try {
                let f = localStorage.getItem("configSize");
                e = "string" == typeof f && JSON.parse(f)
            } catch (h) {
                console.error(h);
                return
            }
            let c = parseInt(e, 10);
            c >= 0 && c <= 4 && (this.state.config.size = String(c))
        }
    },
    persist() {
        let a = this.state.config;
        localStorage.setItem("cm_fireworks_data", JSON.stringify({
            schemaVersion: "1.2",
            data: {quality: a.quality, size: a.size, skyLighting: a.skyLighting, scaleFactor: a.scaleFactor}
        }))
    }
};

function togglePause(b) {
    let c = store.state.paused, a;
    a = "boolean" == typeof b ? b : !c, c !== a && store.setState({paused: a})
}

function toggleSound(a) {
    "boolean" == typeof a ? store.setState({soundEnabled: a}) : store.setState({soundEnabled: !store.state.soundEnabled})
}

function toggleMenu(a) {
    "boolean" == typeof a ? store.setState({menuOpen: a}) : store.setState({menuOpen: !store.state.menuOpen})
}

function updateConfig(a) {
    a = a || getConfigFromDOM(), store.setState({config: Object.assign({}, store.state.config, a)}), configDidUpdate()
}

function configDidUpdate() {
    store.state.config, isLowQuality = 1 === (quality = qualitySelector()), isNormalQuality = 2 === quality, isHighQuality = 3 === quality, 0 === skyLightingSelector() && (appNodes.canvasContainer.style.backgroundColor = "#000"), Spark.drawWidth = 3 === quality ? .75 : 1
}

IS_HEADER || store.load();
const isRunning = (a = store.state) => !a.paused && !a.menuOpen,
    soundEnabledSelector = (a = store.state) => a.soundEnabled,
    canPlaySoundSelector = (a = store.state) => isRunning(a) && soundEnabledSelector(a),
    qualitySelector = () => +store.state.config.quality, shellNameSelector = () => store.state.config.shell,
    shellSizeSelector = () => +store.state.config.size, finaleSelector = () => store.state.config.finale,
    skyLightingSelector = () => +store.state.config.skyLighting,
    scaleFactorSelector = () => store.state.config.scaleFactor, helpContent = {
        shellType: {
            header: "\u70DF\u82B1\u7C7B\u578B",
            body: "\u4F60\u8981\u653E\u7684\u70DF\u82B1\u7684\u7C7B\u578B\uFF0C\u9009\u62E9\u201C\u968F\u673A\uFF08Random\uFF09\u201D\u53EF\u4EE5\u83B7\u5F97\u975E\u5E38\u597D\u7684\u4F53\u9A8C\uFF01"
        },
        shellSize: {
            header: "\u70DF\u82B1\u5927\u5C0F",
            body: "\u70DF\u82B1\u8D8A\u5927\u7EFD\u653E\u8303\u56F4\u5C31\u8D8A\u5927\uFF0C\u4F46\u662F\u70DF\u82B1\u8D8A\u5927\uFF0C\u8BBE\u5907\u6240\u9700\u7684\u6027\u80FD\u4E5F\u4F1A\u589E\u591A\uFF0C\u5927\u7684\u70DF\u82B1\u53EF\u80FD\u5BFC\u81F4\u4F60\u7684\u8BBE\u5907\u5361\u987F\u3002"
        },
        quality: {
            header: "\u753B\u8D28",
            body: "\u5982\u679C\u52A8\u753B\u8FD0\u884C\u4E0D\u6D41\u7545\uFF0C\u4F60\u53EF\u4EE5\u8BD5\u8BD5\u964D\u4F4E\u753B\u8D28\u3002\u753B\u8D28\u8D8A\u9AD8\uFF0C\u70DF\u82B1\u7EFD\u653E\u540E\u7684\u706B\u82B1\u6570\u91CF\u5C31\u8D8A\u591A\uFF0C\u4F46\u9AD8\u753B\u8D28\u53EF\u80FD\u5BFC\u81F4\u4F60\u7684\u8BBE\u5907\u5361\u987F\u3002"
        },
        skyLighting: {
            header: "\u7167\u4EAE\u5929\u7A7A",
            body: "\u70DF\u82B1\u7206\u70B8\u65F6\uFF0C\u80CC\u666F\u4F1A\u88AB\u7167\u4EAE\u3002\u5982\u679C\u4F60\u7684\u5C4F\u5E55\u770B\u8D77\u6765\u592A\u4EAE\u4E86\uFF0C\u53EF\u4EE5\u628A\u5B83\u6539\u6210\u201C\u6697\u201D\u6216\u8005\u201C\u4E0D\u201D\u3002"
        },
        scaleFactor: {
            header: "\u7F29\u653E",
            body: "\u4F7F\u4F60\u4E0E\u70DF\u82B1\u79BB\u5F97\u66F4\u8FD1\u6216\u66F4\u8FDC\u3002\u5BF9\u4E8E\u8F83\u5927\u7684\u70DF\u82B1\uFF0C\u4F60\u53EF\u4EE5\u9009\u62E9\u66F4\u5C0F\u7684\u7F29\u653E\u503C\uFF0C\u5C24\u5176\u662F\u5728\u624B\u673A\u6216\u5E73\u677F\u7535\u8111\u4E0A\u3002"
        },
        autoLaunch: {
            header: "\u81EA\u52A8\u653E\u70DF\u82B1",
            body: "\u5F00\u542F\u540E\u4F60\u5C31\u53EF\u4EE5\u5750\u5728\u4F60\u7684\u8BBE\u5907\u5C4F\u5E55\u524D\u9762\u6B23\u8D4F\u70DF\u82B1\u4E86\uFF0C\u4F60\u4E5F\u53EF\u4EE5\u5173\u95ED\u5B83\uFF0C\u4F46\u5173\u95ED\u540E\u4F60\u5C31\u53EA\u80FD\u901A\u8FC7\u70B9\u51FB\u5C4F\u5E55\u7684\u65B9\u5F0F\u6765\u653E\u70DF\u82B1\u3002"
        },
        finaleMode: {
            header: "\u540C\u65F6\u653E\u66F4\u591A\u7684\u70DF\u82B1",
            body: "\u53EF\u4EE5\u5728\u540C\u4E00\u65F6\u95F4\u81EA\u52A8\u653E\u51FA\u66F4\u591A\u7684\u70DF\u82B1\uFF08\u4F46\u9700\u8981\u5F00\u542F\u5148\u5F00\u542F\u201C\u81EA\u52A8\u653E\u70DF\u82B1\u201D\uFF09\u3002"
        },
        hideControls: {
            header: "\u9690\u85CF\u63A7\u5236\u6309\u94AE",
            body: "\u9690\u85CF\u5C4F\u5E55\u9876\u90E8\u7684\u6309\u94AE\u3002\u5982\u679C\u4F60\u8981\u622A\u56FE\uFF0C\u6216\u8005\u9700\u8981\u4E00\u4E2A\u65E0\u7F1D\u7684\u4F53\u9A8C\uFF0C\u4F60\u5C31\u53EF\u4EE5\u5C06\u6309\u94AE\u9690\u85CF\uFF0C\u9690\u85CF\u6309\u94AE\u540E\u4F60\u4ECD\u7136\u53EF\u4EE5\u5728\u53F3\u4E0A\u89D2\u6253\u5F00\u8BBE\u7F6E\u3002"
        },
        fullscreen: {header: "\u5168\u5C4F", body: "\u5207\u6362\u81F3\u5168\u5C4F\u6A21\u5F0F"},
        longExposure: {
            header: "\u4FDD\u7559\u70DF\u82B1\u7684\u706B\u82B1",
            body: "\u53EF\u4EE5\u4FDD\u7559\u70DF\u82B1\u7559\u4E0B\u7684\u706B\u82B1"
        }
    }, nodeKeyToHelpKey = {
        shellTypeLabel: "shellType",
        shellSizeLabel: "shellSize",
        qualityLabel: "quality",
        skyLightingLabel: "skyLighting",
        scaleFactorLabel: "scaleFactor",
        autoLaunchLabel: "autoLaunch",
        finaleModeLabel: "finaleMode",
        hideControlsLabel: "hideControls",
        fullscreenLabel: "fullscreen",
        longExposureLabel: "longExposure"
    }, appNodes = {
        stageContainer: ".stage-container",
        canvasContainer: ".canvas-container",
        controls: ".controls",
        menu: ".menu",
        menuInnerWrap: ".menu__inner-wrap",
        pauseBtn: ".pause-btn",
        pauseBtnSVG: ".pause-btn use",
        soundBtn: ".sound-btn",
        soundBtnSVG: ".sound-btn use",
        shellType: ".shell-type",
        shellTypeLabel: ".shell-type-label",
        shellSize: ".shell-size",
        shellSizeLabel: ".shell-size-label",
        quality: ".quality-ui",
        qualityLabel: ".quality-ui-label",
        skyLighting: ".sky-lighting",
        skyLightingLabel: ".sky-lighting-label",
        scaleFactor: ".scaleFactor",
        scaleFactorLabel: ".scaleFactor-label",
        autoLaunch: ".auto-launch",
        autoLaunchLabel: ".auto-launch-label",
        finaleModeFormOption: ".form-option--finale-mode",
        finaleMode: ".finale-mode",
        finaleModeLabel: ".finale-mode-label",
        hideControls: ".hide-controls",
        hideControlsLabel: ".hide-controls-label",
        fullscreenFormOption: ".form-option--fullscreen",
        fullscreen: ".fullscreen",
        fullscreenLabel: ".fullscreen-label",
        longExposure: ".long-exposure",
        longExposureLabel: ".long-exposure-label",
        helpModal: ".help-modal",
        helpModalOverlay: ".help-modal__overlay",
        helpModalHeader: ".help-modal__header",
        helpModalBody: ".help-modal__body",
        helpModalCloseBtn: ".help-modal__close-btn"
    };

function renderApp(a) {
    let b = `#icon-${a.paused ? "play" : "pause"}`, c = `#icon-sound-${soundEnabledSelector() ? "on" : "off"}`;
    if (appNodes.pauseBtnSVG.setAttribute("href", b), appNodes.pauseBtnSVG.setAttribute("xlink:href", b), appNodes.soundBtnSVG.setAttribute("href", c), appNodes.soundBtnSVG.setAttribute("xlink:href", c), appNodes.controls.classList.toggle("hide", a.menuOpen || a.config.hideControls), appNodes.canvasContainer.classList.toggle("blur", a.menuOpen), appNodes.menu.classList.toggle("hide", !a.menuOpen), appNodes.finaleModeFormOption.style.opacity = a.config.autoLaunch ? 1 : .32, appNodes.quality.value = a.config.quality, appNodes.shellType.value = a.config.shell, appNodes.shellSize.value = a.config.size, appNodes.autoLaunch.checked = a.config.autoLaunch, appNodes.finaleMode.checked = a.config.finale, appNodes.skyLighting.value = a.config.skyLighting, appNodes.hideControls.checked = a.config.hideControls, appNodes.fullscreen.checked = a.fullscreen, appNodes.longExposure.checked = a.config.longExposure, appNodes.scaleFactor.value = a.config.scaleFactor.toFixed(2), appNodes.menuInnerWrap.style.opacity = a.openHelpTopic ? .12 : 1, appNodes.helpModal.classList.toggle("active", !!a.openHelpTopic), a.openHelpTopic) {
        let {header: d, body: e} = helpContent[a.openHelpTopic];
        appNodes.helpModalHeader.textContent = d, appNodes.helpModalBody.textContent = e
    }
}

function handleStateChange(b, c) {
    let a = canPlaySoundSelector(b), d = canPlaySoundSelector(c);
    a !== d && (a ? soundManager.resumeAll() : soundManager.pauseAll())
}

function getConfigFromDOM() {
    return {
        quality: appNodes.quality.value,
        shell: appNodes.shellType.value,
        size: appNodes.shellSize.value,
        autoLaunch: appNodes.autoLaunch.checked,
        finale: appNodes.finaleMode.checked,
        skyLighting: appNodes.skyLighting.value,
        longExposure: appNodes.longExposure.checked,
        hideControls: appNodes.hideControls.checked,
        scaleFactor: parseFloat(appNodes.scaleFactor.value)
    }
}

Object.keys(appNodes).forEach(a => {
    appNodes[a] = document.querySelector(appNodes[a])
}), fullscreenEnabled() || appNodes.fullscreenFormOption.classList.add("remove"), store.subscribe(renderApp), store.subscribe(handleStateChange);
const updateConfigNoEvent = () => updateConfig();
appNodes.quality.addEventListener("input", updateConfigNoEvent), appNodes.shellType.addEventListener("input", updateConfigNoEvent), appNodes.shellSize.addEventListener("input", updateConfigNoEvent), appNodes.autoLaunch.addEventListener("click", () => setTimeout(updateConfig, 0)), appNodes.finaleMode.addEventListener("click", () => setTimeout(updateConfig, 0)), appNodes.skyLighting.addEventListener("input", updateConfigNoEvent), appNodes.longExposure.addEventListener("click", () => setTimeout(updateConfig, 0)), appNodes.hideControls.addEventListener("click", () => setTimeout(updateConfig, 0)), appNodes.fullscreen.addEventListener("click", () => setTimeout(toggleFullscreen, 0)), appNodes.scaleFactor.addEventListener("input", () => {
    updateConfig(), handleResize()
}), Object.keys(nodeKeyToHelpKey).forEach(a => {
    let b = nodeKeyToHelpKey[a];
    appNodes[a].addEventListener("click", () => {
        store.setState({openHelpTopic: b})
    })
}), appNodes.helpModalCloseBtn.addEventListener("click", () => {
    store.setState({openHelpTopic: null})
}), appNodes.helpModalOverlay.addEventListener("click", () => {
    store.setState({openHelpTopic: null})
});
const COLOR_NAMES = Object.keys(COLOR), COLOR_CODES = COLOR_NAMES.map(a => COLOR[a]),
    COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE],
    COLOR_CODE_INDEXES = COLOR_CODES_W_INVIS.reduce((a, b, c) => (a[b] = c, a), {}), COLOR_TUPLES = {};

function randomColorSimple() {
    return COLOR_CODES[Math.random() * COLOR_CODES.length | 0]
}

COLOR_CODES.forEach(a => {
    COLOR_TUPLES[a] = {
        r: parseInt(a.substr(1, 2), 16),
        g: parseInt(a.substr(3, 2), 16),
        b: parseInt(a.substr(5, 2), 16)
    }
});
let lastColor;

function randomColor(b) {
    let d = b && b.notSame, c = b && b.notColor, e = b && b.limitWhite, a = randomColorSimple();
    if (e && a === COLOR.White && .6 > Math.random() && (a = randomColorSimple()), d) for (; a === lastColor;) a = randomColorSimple(); else if (c) for (; a === c;) a = randomColorSimple();
    return lastColor = a, a
}

function whiteOrGold() {
    return .5 > Math.random() ? COLOR.Gold : COLOR.White
}

function makePistilColor(a) {
    return a === COLOR.White || a === COLOR.Gold ? randomColor({notColor: a}) : whiteOrGold()
}

const crysanthemumShell = (b = 1) => {
    let f = .25 > Math.random(), c = .72 > Math.random(),
        a = c ? randomColor({limitWhite: !0}) : [randomColor(), randomColor({notSame: !0})],
        d = c && .42 > Math.random(), g = d && makePistilColor(a),
        h = c && (.2 > Math.random() || a === COLOR.White) ? g || randomColor({notColor: a, limitWhite: !0}) : null,
        i = !d && a !== COLOR.White && .42 > Math.random(), e = f ? 1.1 : 1.25;
    return isLowQuality && (e *= .8), isHighQuality && (e = 1.2), {
        shellSize: b,
        spreadSize: 300 + 100 * b,
        starLife: 900 + 200 * b,
        starDensity: e,
        color: a,
        secondColor: h,
        glitter: f ? "light" : "",
        glitterColor: whiteOrGold(),
        pistil: d,
        pistilColor: g,
        streamers: i
    }
}, ghostShell = (c = 1) => {
    let a = crysanthemumShell(c);
    a.starLife *= 1.5;
    let b = randomColor({notColor: COLOR.White});
    a.streamers = !0;
    let d = .42 > Math.random();
    return d && makePistilColor(b), a.color = INVISIBLE, a.secondColor = b, a.glitter = "", a
}, strobeShell = (a = 1) => {
    let b = randomColor({limitWhite: !0});
    return {
        shellSize: a,
        spreadSize: 280 + 92 * a,
        starLife: 1100 + 200 * a,
        starLifeVariation: .4,
        starDensity: 1.1,
        color: b,
        glitter: "light",
        glitterColor: COLOR.White,
        strobe: !0,
        strobeColor: .5 > Math.random() ? COLOR.White : null,
        pistil: .5 > Math.random(),
        pistilColor: makePistilColor(b)
    }
}, palmShell = (a = 1) => {
    let c = randomColor(), b = .5 > Math.random();
    return {
        shellSize: a,
        color: c,
        spreadSize: 250 + 75 * a,
        starDensity: b ? .15 : .4,
        starLife: 1800 + 200 * a,
        glitter: b ? "thick" : "heavy"
    }
}, ringShell = (a = 1) => {
    let b = randomColor(), c = .75 > Math.random();
    return {
        shellSize: a,
        ring: !0,
        color: b,
        spreadSize: 300 + 100 * a,
        starLife: 900 + 200 * a,
        starCount: 2.2 * PI_2 * (a + 1),
        pistil: c,
        pistilColor: makePistilColor(b),
        glitter: c ? "" : "light",
        glitterColor: b === COLOR.Gold ? COLOR.Gold : COLOR.White,
        streamers: .3 > Math.random()
    }
}, crossetteShell = (a = 1) => {
    let b = randomColor({limitWhite: !0});
    return {
        shellSize: a,
        spreadSize: 300 + 100 * a,
        starLife: 750 + 160 * a,
        starLifeVariation: .4,
        starDensity: .85,
        color: b,
        crossette: !0,
        pistil: .5 > Math.random(),
        pistilColor: makePistilColor(b)
    }
}, floralShell = (a = 1) => ({
    shellSize: a,
    spreadSize: 300 + 120 * a,
    starDensity: .12,
    starLife: 500 + 50 * a,
    starLifeVariation: .5,
    color: .65 > Math.random() ? "random" : .15 > Math.random() ? randomColor() : [randomColor(), randomColor({notSame: !0})],
    floral: !0
}), fallingLeavesShell = (a = 1) => ({
    shellSize: a,
    color: INVISIBLE,
    spreadSize: 300 + 120 * a,
    starDensity: .12,
    starLife: 500 + 50 * a,
    starLifeVariation: .5,
    glitter: "medium",
    glitterColor: COLOR.Gold,
    fallingLeaves: !0
}), willowShell = (a = 1) => ({
    shellSize: a,
    spreadSize: 300 + 100 * a,
    starDensity: .6,
    starLife: 3e3 + 300 * a,
    glitter: "willow",
    glitterColor: COLOR.Gold,
    color: INVISIBLE
}), crackleShell = (a = 1) => {
    let b = .75 > Math.random() ? COLOR.Gold : randomColor();
    return {
        shellSize: a,
        spreadSize: 380 + 75 * a,
        starDensity: isLowQuality ? .65 : 1,
        starLife: 600 + 100 * a,
        starLifeVariation: .32,
        glitter: "light",
        glitterColor: COLOR.Gold,
        color: b,
        crackle: !0,
        pistil: .65 > Math.random(),
        pistilColor: makePistilColor(b)
    }
}, horsetailShell = (a = 1) => {
    let b = randomColor();
    return {
        shellSize: a,
        horsetail: !0,
        color: b,
        spreadSize: 250 + 38 * a,
        starDensity: .9,
        starLife: 2500 + 300 * a,
        glitter: "medium",
        glitterColor: .5 > Math.random() ? whiteOrGold() : b,
        strobe: b === COLOR.White
    }
};

function randomShellName() {
    return .5 > Math.random() ? "Crysanthemum" : shellNames[Math.random() * (shellNames.length - 1) + 1 | 0]
}

function randomShell(a) {
    return IS_HEADER ? randomFastShell()(a) : shellTypes[randomShellName()](a)
}

function shellFromConfig(a) {
    return shellTypes[shellNameSelector()](a)
}

const fastShellBlacklist = ["Falling Leaves", "Floral", "Willow"];

function randomFastShell() {
    let b = "Random" === shellNameSelector(), a = b ? randomShellName() : shellNameSelector();
    if (b) for (; fastShellBlacklist.includes(a);) a = randomShellName();
    return shellTypes[a]
}

const shellTypes = {
    Random: randomShell,
    Crackle: crackleShell,
    Crossette: crossetteShell,
    Crysanthemum: crysanthemumShell,
    "Falling Leaves": fallingLeavesShell,
    Floral: floralShell,
    Ghost: ghostShell,
    "Horse Tail": horsetailShell,
    Palm: palmShell,
    Ring: ringShell,
    Strobe: strobeShell,
    Willow: willowShell
}, shellNames = Object.keys(shellTypes);

function init() {
    function a(a, b) {
        a.innerHTML = b.reduce((b, a) => b += `<option value="${a.value}">${a.label}</option>`, "")
    }

    document.querySelector(".loading-init").remove(), appNodes.stageContainer.classList.remove("remove");
    let b = "";
    shellNames.forEach(a => b += `<option value="${a}">${a}</option>`), appNodes.shellType.innerHTML = b, b = "", ['3"', '4"', '6"', '8"', '12"', '16"'].forEach((a, c) => b += `<option value="${c}">${a}</option>`), appNodes.shellSize.innerHTML = b, a(appNodes.quality, [{
        label: "\u4F4E",
        value: 1
    }, {label: "\u6B63\u5E38", value: 2}, {label: "\u9AD8", value: 3}]), a(appNodes.skyLighting, [{
        label: "\u4E0D",
        value: 0
    }, {label: "\u6697", value: 1}, {
        label: "\u6B63\u5E38",
        value: 2
    }]), a(appNodes.scaleFactor, [.5, .62, .75, .9, 1, 1.5, 2].map(a => ({
        value: a.toFixed(2),
        label: `${100 * a}%`
    }))), togglePause(!1), renderApp(store.state), configDidUpdate()
}

function fitShellPositionInBoundsH(a) {
    return .64 * a + .18
}

function fitShellPositionInBoundsV(a) {
    return .75 * a
}

function getRandomShellPositionH() {
    return fitShellPositionInBoundsH(Math.random())
}

function getRandomShellPositionV() {
    return fitShellPositionInBoundsV(Math.random())
}

function getRandomShellSize() {
    let b = shellSizeSelector(), a = Math.min(2.5, b), c = Math.random() * a, d = 0 === a ? Math.random() : 1 - c / a,
        e = Math.random() * (1 - .65 * d) * .5;
    return {
        size: b - c,
        x: fitShellPositionInBoundsH(.5 > Math.random() ? .5 - e : .5 + e),
        height: fitShellPositionInBoundsV(d)
    }
}

function launchShellFromConfig(a) {
    let b = new Shell(shellFromConfig(shellSizeSelector())), c = mainStage.width, d = mainStage.height;
    b.launch(a ? a.x / c : getRandomShellPositionH(), a ? 1 - a.y / d : getRandomShellPositionV())
}

function seqRandomShell() {
    let a = getRandomShellSize(), b = new Shell(shellFromConfig(a.size));
    b.launch(a.x, a.height);
    let c = b.starLife;
    return b.fallingLeaves && (c = 4600), 900 + 600 * Math.random() + c
}

function seqRandomFastShell() {
    let c = randomFastShell(), a = getRandomShellSize(), b = new Shell(c(a.size));
    return b.launch(a.x, a.height), 900 + 600 * Math.random() + b.starLife
}

function seqTwoRandom() {
    let b = getRandomShellSize(), e = getRandomShellSize(), a = new Shell(shellFromConfig(b.size)),
        c = new Shell(shellFromConfig(e.size)), f = .2 * Math.random() - .1;
    a.launch(.3 + (.2 * Math.random() - .1), b.height), setTimeout(() => {
        c.launch(.7 + f, e.height)
    }, 100);
    let d = Math.max(a.starLife, c.starLife);
    return (a.fallingLeaves || c.fallingLeaves) && (d = 4600), 900 + 600 * Math.random() + d
}

function seqTriple() {
    let b = randomFastShell(), a = shellSizeSelector(), d = Math.max(0, a - 1.25), c = new Shell(b(a));
    return c.launch(.5 + (.08 * Math.random() - .04), .7), setTimeout(() => {
        let a = new Shell(b(d));
        a.launch(.2 + (.08 * Math.random() - .04), .1)
    }, 1e3 + 400 * Math.random()), setTimeout(() => {
        let a = new Shell(b(d));
        a.launch(.8 + (.08 * Math.random() - .04), .1)
    }, 1e3 + 400 * Math.random()), 4e3
}

function seqPyramid() {
    let a = IS_DESKTOP ? 7 : 4, d = shellSizeSelector(), f = Math.max(0, d - 3),
        g = .78 > Math.random() ? crysanthemumShell : ringShell, h = randomShell;

    function i(a, b) {
        let c = "Random" === shellNameSelector(), e = c ? b ? h : g : shellTypes[shellNameSelector()],
            i = new Shell(e(b ? d : f));
        i.launch(a, b ? .75 : .42 * (a <= .5 ? a / .5 : (1 - a) / .5))
    }

    let b = 0, c = 0;
    for (; b <= a;) {
        if (b === a) setTimeout(() => {
            i(.5, !0)
        }, c); else {
            let j = b / a * .5, e = 30 * Math.random() + 30;
            setTimeout(() => {
                i(j, !1)
            }, c), setTimeout(() => {
                i(1 - j, !1)
            }, c + e)
        }
        b++, c += 200
    }
    return 3400 + 250 * a
}

function seqSmallBarrage() {
    seqSmallBarrage.lastCalled = Date.now();
    let b = IS_DESKTOP ? 11 : 5, d = IS_DESKTOP ? 3 : 1, g = Math.max(0, shellSizeSelector() - 2),
        h = .78 > Math.random() ? crysanthemumShell : ringShell, i = randomFastShell();

    function e(a, b) {
        let c = "Random" === shellNameSelector(), d = c ? b ? i : h : shellTypes[shellNameSelector()],
            e = new Shell(d(g));
        e.launch(a, .75 * ((Math.cos(5 * a * Math.PI + PI_HALF) + 1) / 2))
    }

    let a = 0, c = 0;
    for (; a < b;) {
        if (0 === a) e(.5, !1), a += 1; else {
            let j = (a + 1) / b / 2, f = 30 * Math.random() + 30, k = a === d;
            setTimeout(() => {
                e(.5 + j, k)
            }, c), setTimeout(() => {
                e(.5 - j, k)
            }, c + f), a += 2
        }
        c += 200
    }
    return 3400 + 120 * b
}

seqSmallBarrage.cooldown = 15e3, seqSmallBarrage.lastCalled = Date.now();
const sequences = [seqRandomShell, seqTwoRandom, seqTriple, seqPyramid, seqSmallBarrage];
let isFirstSeq = !0;
const finaleCount = 32;
let currentFinaleCount = 0;

function startSequence() {
    if (isFirstSeq) {
        if (isFirstSeq = !1, IS_HEADER) return seqTwoRandom();
        {
            let b = new Shell(crysanthemumShell(shellSizeSelector()));
            return b.launch(.5, .5), 2400
        }
    }
    if (finaleSelector()) return (seqRandomFastShell(), currentFinaleCount < 32) ? (currentFinaleCount++, 170) : (currentFinaleCount = 0, 6e3);
    let a = Math.random();
    return a < .08 && Date.now() - seqSmallBarrage.lastCalled > seqSmallBarrage.cooldown ? seqSmallBarrage() : a < .1 ? seqPyramid() : a < .6 && !IS_HEADER ? seqRandomShell() : a < .8 ? seqTwoRandom() : a < 1 ? seqTriple() : void 0
}

let activePointerCount = 0, isUpdatingSpeed = !1;

function handlePointerStart(a) {
    if (activePointerCount++, a.y < 50) {
        if (a.x < 50) {
            togglePause();
            return
        }
        if (a.x > mainStage.width / 2 - 25 && a.x < mainStage.width / 2 + 25) {
            toggleSound();
            return
        }
        if (a.x > mainStage.width - 50) {
            toggleMenu();
            return
        }
    }
    isRunning() && (updateSpeedFromEvent(a) ? isUpdatingSpeed = !0 : a.onCanvas && launchShellFromConfig(a))
}

function handlePointerEnd(a) {
    activePointerCount--, isUpdatingSpeed = !1
}

function handlePointerMove(a) {
    isRunning() && isUpdatingSpeed && updateSpeedFromEvent(a)
}

function handleKeydown(a) {
    80 === a.keyCode ? togglePause() : 79 === a.keyCode ? toggleMenu() : 27 === a.keyCode && toggleMenu(!1)
}

function handleResize() {
    let a = window.innerWidth, b = window.innerHeight, c = Math.min(a, 7680), d = a <= 420 ? b : Math.min(b, 4320);
    appNodes.stageContainer.style.width = c + "px", appNodes.stageContainer.style.height = d + "px", stages.forEach(a => a.resize(c, d));
    let e = scaleFactorSelector();
    stageW = c / e, stageH = d / e
}

mainStage.addEventListener("pointerstart", handlePointerStart), mainStage.addEventListener("pointerend", handlePointerEnd), mainStage.addEventListener("pointermove", handlePointerMove), window.addEventListener("keydown", handleKeydown), handleResize(), window.addEventListener("resize", handleResize);
let currentFrame = 0, speedBarOpacity = 0, autoLaunchTime = 0;

function updateSpeedFromEvent(a) {
    if (isUpdatingSpeed || a.y >= mainStage.height - 44) {
        let b = 16, c = (a.x - b) / (mainStage.width - 2 * b);
        return simSpeed = Math.min(Math.max(c, 0), 1), speedBarOpacity = 1, !0
    }
    return !1
}

function updateGlobals(a, b) {
    currentFrame++, !isUpdatingSpeed && (speedBarOpacity -= b / 30) < 0 && (speedBarOpacity = 0), store.state.config.autoLaunch && (autoLaunchTime -= a) <= 0 && (autoLaunchTime = 1.25 * startSequence())
}

function update(d, b) {
    if (!isRunning()) return;
    let c = d * simSpeed, a = simSpeed * b;
    updateGlobals(c, b);
    let e = 1 - (1 - Star.airDrag) * a, f = 1 - (1 - Star.airDragHeavy) * a, g = 1 - (1 - Spark.airDrag) * a,
        h = c / 1e3 * .9;
    COLOR_CODES_W_INVIS.forEach(m => {
        let j = Star.active[m];
        for (let i = j.length - 1; i >= 0; i -= 1) {
            let b = j[i];
            if (b.updateFrame !== currentFrame) {
                if (b.updateFrame = currentFrame, b.life -= c, b.life <= 0) j.splice(i, 1), Star.returnInstance(b); else {
                    let n = Math.pow(b.life / b.fullLife, .5), o = 1 - n;
                    if (b.prevX = b.x, b.prevY = b.y, b.x += b.speedX * a, b.y += b.speedY * a, b.heavy ? (b.speedX *= f, b.speedY *= f) : (b.speedX *= e, b.speedY *= e), b.speedY += h, b.spinRadius && (b.spinAngle += b.spinSpeed * a, b.x += Math.sin(b.spinAngle) * b.spinRadius * a, b.y += Math.cos(b.spinAngle) * b.spinRadius * a), b.sparkFreq) for (b.sparkTimer -= c; b.sparkTimer < 0;) b.sparkTimer += .75 * b.sparkFreq + b.sparkFreq * o * 4, Spark.add(b.x, b.y, b.sparkColor, Math.random() * PI_2, Math.random() * b.sparkSpeed * n, .8 * b.sparkLife + Math.random() * b.sparkLifeVariation * b.sparkLife);
                    b.life < b.transitionTime && (b.secondColor && !b.colorChanged && (b.colorChanged = !0, b.color = b.secondColor, j.splice(i, 1), Star.active[b.secondColor].push(b), b.secondColor === INVISIBLE && (b.sparkFreq = 0)), b.strobe && (b.visible = Math.floor(b.life / b.strobeFreq) % 3 == 0))
                }
            }
        }
        let l = Spark.active[m];
        for (let k = l.length - 1; k >= 0; k -= 1) {
            let d = l[k];
            d.life -= c, d.life <= 0 ? (l.splice(k, 1), Spark.returnInstance(d)) : (d.prevX = d.x, d.prevY = d.y, d.x += d.speedX * a, d.y += d.speedY * a, d.speedX *= g, d.speedY *= g, d.speedY += h)
        }
    }), render(a)
}

function render(i) {
    let {dpr: e} = mainStage, g = stageW, h = stageH, a = trailsStage.ctx, c = mainStage.ctx;
    0 !== skyLightingSelector() && colorSky(i);
    let f = scaleFactorSelector();
    for (a.scale(e * f, e * f), c.scale(e * f, e * f), a.globalCompositeOperation = "source-over", a.fillStyle = `rgba(0, 0, 0, ${store.state.config.longExposure ? .0025 : .175 * i})`, a.fillRect(0, 0, g, h), c.clearRect(0, 0, g, h); BurstFlash.active.length;) {
        let b = BurstFlash.active.pop(), d = a.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
        d.addColorStop(.024, "rgba(255, 255, 255, 1)"), d.addColorStop(.125, "rgba(255, 160, 20, 0.2)"), d.addColorStop(.32, "rgba(255, 140, 20, 0.11)"), d.addColorStop(1, "rgba(255, 120, 20, 0)"), a.fillStyle = d, a.fillRect(b.x - b.radius, b.y - b.radius, 2 * b.radius, 2 * b.radius), BurstFlash.returnInstance(b)
    }
    if (a.globalCompositeOperation = "lighten", a.lineWidth = Star.drawWidth, a.lineCap = isLowQuality ? "square" : "round", c.strokeStyle = "#fff", c.lineWidth = 1, c.beginPath(), COLOR_CODES.forEach(b => {
        let d = Star.active[b];
        a.strokeStyle = b, a.beginPath(), d.forEach(b => {
            b.visible && (a.moveTo(b.x, b.y), a.lineTo(b.prevX, b.prevY), c.moveTo(b.x, b.y), c.lineTo(b.x - 1.6 * b.speedX, b.y - 1.6 * b.speedY))
        }), a.stroke()
    }), c.stroke(), a.lineWidth = Spark.drawWidth, a.lineCap = "butt", COLOR_CODES.forEach(b => {
        let c = Spark.active[b];
        a.strokeStyle = b, a.beginPath(), c.forEach(b => {
            a.moveTo(b.x, b.y), a.lineTo(b.prevX, b.prevY)
        }), a.stroke()
    }), speedBarOpacity) {
        let j = 6;
        c.globalAlpha = speedBarOpacity, c.fillStyle = COLOR.Blue, c.fillRect(0, h - j, g * simSpeed, j), c.globalAlpha = 1
    }
    a.setTransform(1, 0, 0, 1, 0, 0), c.setTransform(1, 0, 0, 1, 0, 0)
}

const currentSkyColor = {r: 0, g: 0, b: 0}, targetSkyColor = {r: 0, g: 0, b: 0};

function colorSky(a) {
    let b = 15 * skyLightingSelector(), e = 0;
    targetSkyColor.r = 0, targetSkyColor.g = 0, targetSkyColor.b = 0, COLOR_CODES.forEach(c => {
        let b = COLOR_TUPLES[c], a = Star.active[c].length;
        e += a, targetSkyColor.r += b.r * a, targetSkyColor.g += b.g * a, targetSkyColor.b += b.b * a
    });
    let c = Math.pow(Math.min(1, e / 500), .3), d = Math.max(1, targetSkyColor.r, targetSkyColor.g, targetSkyColor.b);
    targetSkyColor.r = targetSkyColor.r / d * b * c, targetSkyColor.g = targetSkyColor.g / d * b * c, targetSkyColor.b = targetSkyColor.b / d * b * c, currentSkyColor.r += (targetSkyColor.r - currentSkyColor.r) / 10 * a, currentSkyColor.g += (targetSkyColor.g - currentSkyColor.g) / 10 * a, currentSkyColor.b += (targetSkyColor.b - currentSkyColor.b) / 10 * a, appNodes.canvasContainer.style.backgroundColor = `rgb(${0 | currentSkyColor.r}, ${0 | currentSkyColor.g}, ${0 | currentSkyColor.b})`
}

function createParticleArc(b, f, i, g, h) {
    let a = f / i, c = b + f - .5 * a;
    if (c > b) for (let d = b; d < c; d += a) h(d + Math.random() * a * g); else for (let e = b; e > c; e += a) h(e + Math.random() * a * g)
}

function createBurst(h, i, j = 0, k = PI_2) {
    let d = 2 * (.5 * Math.sqrt(h / Math.PI)) * Math.PI, e = d / 2;
    for (let a = 0; a <= e; a++) {
        let l = a / e * PI_HALF, f = Math.cos(l), g = d * f, m = g * (k / PI_2), b = PI_2 / g,
            n = Math.random() * b + j, o = .33 * b;
        for (let c = 0; c < m; c++) {
            let p = Math.random() * o;
            i(b * c + n + p, f)
        }
    }
}

function crossetteEffect(a) {
    createParticleArc(Math.random() * PI_HALF, PI_2, 4, .5, b => {
        Star.add(a.x, a.y, a.color, b, .6 * Math.random() + .75, 600)
    })
}

function floralEffect(a) {
    createBurst(12 + 6 * quality, (b, c) => {
        Star.add(a.x, a.y, a.color, b, 2.4 * c, 1e3 + 300 * Math.random(), a.speedX, a.speedY)
    }), BurstFlash.add(a.x, a.y, 46), soundManager.playSound("burstSmall")
}

function fallingLeavesEffect(a) {
    createBurst(7, (c, d) => {
        let b = Star.add(a.x, a.y, INVISIBLE, c, 2.4 * d, 2400 + 600 * Math.random(), a.speedX, a.speedY);
        b.sparkColor = COLOR.Gold, b.sparkFreq = 144 / quality, b.sparkSpeed = .28, b.sparkLife = 750, b.sparkLifeVariation = 3.2
    }), BurstFlash.add(a.x, a.y, 46), soundManager.playSound("burstSmall")
}

function crackleEffect(a) {
    createParticleArc(0, PI_2, isHighQuality ? 32 : 16, 1.8, b => {
        Spark.add(a.x, a.y, COLOR.Gold, b, 2.4 * Math.pow(Math.random(), .45), 300 + 200 * Math.random())
    })
}

mainStage.addEventListener("ticker", update);

class Shell {
    constructor(a) {
        if (Object.assign(this, a), this.starLifeVariation = a.starLifeVariation || .125, this.color = a.color || randomColor(), this.glitterColor = a.glitterColor || this.color, !this.starCount) {
            let c = a.starDensity || 1, b = this.spreadSize / 54;
            this.starCount = Math.max(6, b * b * c)
        }
    }

    launch(f, g) {
        let h = stageW, b = stageH, c = b - .45 * b, d = b, e = Math.pow(.04 * (d - (c - g * (c - 50))), .64),
            a = this.comet = Star.add(f * (h - 120) + 60, d, "string" == typeof this.color && "random" !== this.color ? this.color : COLOR.White, Math.PI, e * (this.horsetail ? 1.2 : 1), e * (this.horsetail ? 100 : 400));
        a.heavy = !0, a.spinRadius = MyMath.random(.32, .85), a.sparkFreq = 32 / quality, isHighQuality && (a.sparkFreq = 8), a.sparkLife = 320, a.sparkLifeVariation = 3, ("willow" === this.glitter || this.fallingLeaves) && (a.sparkFreq = 20 / quality, a.sparkSpeed = .5, a.sparkLife = 500), this.color === INVISIBLE && (a.sparkColor = COLOR.Gold), Math.random() > .4 && !this.horsetail && (a.secondColor = INVISIBLE, a.transitionTime = 700 * Math.pow(Math.random(), 1.5) + 500), a.onDeath = a => this.burst(a.x, a.y), soundManager.playSound("lift")
    }

    burst(h, i) {
        let r = this.spreadSize / 96, e, g, a, b, c, d = .25, s = !1;
        this.crossette && (g = a => {
            s || (soundManager.playSound("crackleSmall"), s = !0), crossetteEffect(a)
        }), this.crackle && (g = a => {
            s || (soundManager.playSound("crackle"), s = !0), crackleEffect(a)
        }), this.floral && (g = floralEffect), this.fallingLeaves && (g = fallingLeavesEffect), "light" === this.glitter ? (a = 400, b = .3, c = 300, d = 2) : "medium" === this.glitter ? (a = 200, b = .44, c = 700, d = 2) : "heavy" === this.glitter ? (a = 80, b = .8, c = 1400, d = 2) : "thick" === this.glitter ? (a = 16, b = isHighQuality ? 1.65 : 1.5, c = 1400, d = 3) : "streamer" === this.glitter ? (a = 32, b = 1.05, c = 620, d = 2) : "willow" === this.glitter && (a = 120, b = .34, c = 1400, d = 3.8), a /= quality;
        let f = (j, k) => {
            let l = this.spreadSize / 1800,
                f = Star.add(h, i, e || randomColor(), j, k * r, this.starLife + Math.random() * this.starLife * this.starLifeVariation, this.horsetail ? this.comet && this.comet.speedX : 0, this.horsetail ? this.comet && this.comet.speedY : -l);
            this.secondColor && (f.transitionTime = this.starLife * (.05 * Math.random() + .32), f.secondColor = this.secondColor), this.strobe && (f.transitionTime = this.starLife * (.08 * Math.random() + .46), f.strobe = !0, f.strobeFreq = 20 * Math.random() + 40, this.strobeColor && (f.secondColor = this.strobeColor)), f.onDeath = g, this.glitter && (f.sparkFreq = a, f.sparkSpeed = b, f.sparkLife = c, f.sparkLifeVariation = d, f.sparkColor = this.glitterColor, f.sparkTimer = Math.random() * f.sparkFreq)
        };
        if ("string" == typeof this.color) {
            if (e = "random" === this.color ? null : this.color, this.ring) {
                let t = Math.random() * Math.PI, u = .85 * Math.pow(Math.random(), 2) + .15;
                createParticleArc(0, PI_2, this.starCount, 0, g => {
                    let j = Math.sin(g) * r * u, k = Math.cos(g) * r, l = MyMath.pointDist(0, 0, j, k),
                        m = MyMath.pointAngle(0, 0, j, k) + t,
                        f = Star.add(h, i, e, m, l, this.starLife + Math.random() * this.starLife * this.starLifeVariation);
                    this.glitter && (f.sparkFreq = a, f.sparkSpeed = b, f.sparkLife = c, f.sparkLifeVariation = d, f.sparkColor = this.glitterColor, f.sparkTimer = Math.random() * f.sparkFreq)
                })
            } else createBurst(this.starCount, f)
        } else if (Array.isArray(this.color)) {
            if (.5 > Math.random()) {
                let j = Math.random() * Math.PI, m = j + Math.PI, k = Math.PI;
                e = this.color[0], createBurst(this.starCount, f, j, k), e = this.color[1], createBurst(this.starCount, f, m, k)
            } else e = this.color[0], createBurst(this.starCount / 2, f), e = this.color[1], createBurst(this.starCount / 2, f)
        } else throw new Error("Invalid shell color. Expected string or array of strings, but got: " + this.color);
        if (this.pistil) {
            let n = new Shell({
                spreadSize: .5 * this.spreadSize,
                starLife: .6 * this.starLife,
                starLifeVariation: this.starLifeVariation,
                starDensity: 1.4,
                color: this.pistilColor,
                glitter: "light",
                glitterColor: this.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White
            });
            n.burst(h, i)
        }
        if (this.streamers) {
            let o = new Shell({
                spreadSize: .9 * this.spreadSize,
                starLife: .8 * this.starLife,
                starLifeVariation: this.starLifeVariation,
                starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
                color: COLOR.White,
                glitter: "streamer"
            });
            o.burst(h, i)
        }
        if (BurstFlash.add(h, i, this.spreadSize / 4), this.comet) {
            let l = 2, p = Math.min(l, shellSizeSelector() - this.shellSize), q = (1 - p / l) * .3 + .7;
            soundManager.playSound("burst", q)
        }
    }
}

const BurstFlash = {
    active: [], _pool: [], _new: () => ({}), add(b, c, d) {
        let a = this._pool.pop() || this._new();
        return a.x = b, a.y = c, a.radius = d, this.active.push(a), a
    }, returnInstance(a) {
        this._pool.push(a)
    }
};

function createParticleCollection() {
    let a = {};
    return COLOR_CODES_W_INVIS.forEach(b => {
        a[b] = []
    }), a
}

const Star = {
    drawWidth: 3,
    airDrag: .98,
    airDragHeavy: .992,
    active: createParticleCollection(),
    _pool: [],
    _new: () => ({}),
    add(c, d, b, e, f, g, h, i) {
        let a = this._pool.pop() || this._new();
        return a.visible = !0, a.heavy = !1, a.x = c, a.y = d, a.prevX = c, a.prevY = d, a.color = b, a.speedX = Math.sin(e) * f + (h || 0), a.speedY = Math.cos(e) * f + (i || 0), a.life = g, a.fullLife = g, a.spinAngle = Math.random() * PI_2, a.spinSpeed = .8, a.spinRadius = 0, a.sparkFreq = 0, a.sparkSpeed = 1, a.sparkTimer = 0, a.sparkColor = b, a.sparkLife = 750, a.sparkLifeVariation = .25, a.strobe = !1, this.active[b].push(a), a
    },
    returnInstance(a) {
        a.onDeath && a.onDeath(a), a.onDeath = null, a.secondColor = null, a.transitionTime = 0, a.colorChanged = !1, this._pool.push(a)
    }
}, Spark = {
    drawWidth: 0,
    airDrag: .9,
    active: createParticleCollection(),
    _pool: [],
    _new: () => ({}),
    add(b, c, d, e, f, g) {
        let a = this._pool.pop() || this._new();
        return a.x = b, a.y = c, a.prevX = b, a.prevY = c, a.color = d, a.speedX = Math.sin(e) * f, a.speedY = Math.cos(e) * f, a.life = g, this.active[d].push(a), a
    },
    returnInstance(a) {
        this._pool.push(a)
    }
}, soundManager = {
    baseURL: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/",
    ctx: new (window.AudioContext || window.webkitAudioContext),
    sources: {
        lift: {
            volume: 1,
            playbackRateMin: .85,
            playbackRateMax: .95,
            fileNames: ["lift1.mp3", "lift2.mp3", "lift3.mp3"]
        },
        burst: {volume: 1, playbackRateMin: .8, playbackRateMax: .9, fileNames: ["burst1.mp3", "burst2.mp3"]},
        burstSmall: {
            volume: .25,
            playbackRateMin: .8,
            playbackRateMax: 1,
            fileNames: ["burst-sm-1.mp3", "burst-sm-2.mp3"]
        },
        crackle: {volume: .2, playbackRateMin: 1, playbackRateMax: 1, fileNames: ["crackle1.mp3"]},
        crackleSmall: {volume: .3, playbackRateMin: 1, playbackRateMax: 1, fileNames: ["crackle-sm-1.mp3"]}
    },
    preload() {
        let a = [];

        function c(a) {
            if (a.status >= 200 && a.status < 300) return a;
            let b = new Error(a.statusText);
            throw b.response = a, b
        }

        let b = Object.keys(this.sources);
        return b.forEach(b => {
            let d = this.sources[b], {fileNames: e} = d, f = [];
            e.forEach(d => {
                let e = this.baseURL + d, b = fetch(e).then(c).then(a => a.arrayBuffer()).then(a => new Promise(b => {
                    this.ctx.decodeAudioData(a, b)
                }));
                f.push(b), a.push(b)
            }), Promise.all(f).then(a => {
                d.buffers = a
            })
        }), Promise.all(a)
    },
    pauseAll() {
        this.ctx.suspend()
    },
    resumeAll() {
        this.playSound("lift", 0), setTimeout(() => {
            this.ctx.resume()
        }, 250)
    },
    _lastSmallBurstTime: 0,
    playSound(d, b = 1) {
        if (b = MyMath.clamp(b, 0, 1), !canPlaySoundSelector() || simSpeed < .95) return;
        if ("burstSmall" === d) {
            let f = Date.now();
            if (f - this._lastSmallBurstTime < 20) return;
            this._lastSmallBurstTime = f
        }
        let a = this.sources[d];
        if (!a) throw new Error(`Sound of type "${d}" doesn't exist.`);
        let g = a.volume, h = MyMath.random(a.playbackRateMin, a.playbackRateMax), e = this.ctx.createGain();
        e.gain.value = g * b;
        let i = MyMath.randomChoice(a.buffers), c = this.ctx.createBufferSource();
        c.playbackRate.value = h * (2 - b), c.buffer = i, c.connect(e), e.connect(this.ctx.destination), c.start(0)
    }
};

function setLoadingStatus(a) {
    document.querySelector(".loading-init__status").textContent = a
}

IS_HEADER ? init() : (setLoadingStatus("\u6B63\u5728\u70B9\u71C3\u5BFC\u706B\u7EBF"), setTimeout(() => {
    soundManager.preload().then(init, a => (init(), Promise.reject(a)))
}, 0))
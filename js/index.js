(function () {
  const canvas = document.getElementById("cracktro-canvas");
  const ctx = canvas.getContext("2d");

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 400;

  const STATES = {
    WAIT_CLICK: "WAIT_CLICK",
    INTRO_WAVES: "INTRO_WAVES",
    INTRO_LOGO: "INTRO_LOGO",
    INTRO_TEXT1: "INTRO_TEXT1",
    INTRO_PAUSE1: "INTRO_PAUSE1",
    INTRO_TEXT2: "INTRO_TEXT2",
    INTRO_PAUSE2: "INTRO_PAUSE2",
    RUNNING: "RUNNING",
    OUTRO_WAVES: "OUTRO_WAVES",
    OUTRO_LOGO: "OUTRO_LOGO",
    OUTRO_TEXT1: "OUTRO_TEXT1",
    OUTRO_PAUSE1: "OUTRO_PAUSE1",
    OUTRO_TEXT2: "OUTRO_TEXT2",
    OUTRO_PAUSE2: "OUTRO_PAUSE2",
    END_SCREEN: "END_SCREEN",
  };

  let currentState = STATES.WAIT_CLICK;
  let stateTimer = 0;

  const topWaveY = 110;
  const bottomWaveY = 270;
  const waveAmplitude = 6;
  const waveWavelength = 270;
  let topWavePhase = 0;
  let bottomWavePhase = 0;
  let topWaveReveal = 0;
  let bottomWaveReveal = 0;
  let wavesVisible = true;

  let date = new Date().toJSON();

  const epappImg = new Image();
  epappImg.src = "/assets/images/epapp.png";

  const logoImg = new Image();
  logoImg.src = "/assets/images/logo.png";
  let logoRevealProgress = 0;
  let logoUnloadProgress = 0;
  let logoHue = 0;

  // ==== TRACKS ====
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let introBuffer = null;
  let loopBuffer = null;
  let introSource = null;
  let loopSource = null;

  async function loadAudioBuffer(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  }

  Promise.all([
    loadAudioBuffer("/assets/audio/funky_stars_intro.ogg"),
    loadAudioBuffer("/assets/audio/funky_stars_loop.ogg")
  ]).then(([intro, loop]) => {
    introBuffer = intro;
    loopBuffer = loop;
  }).catch(() => {});

  function playBg() {
    if (!introBuffer || !loopBuffer) return;

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.125;
    gainNode.connect(audioCtx.destination);

    const startTime = audioCtx.currentTime;

    introSource = audioCtx.createBufferSource();
    introSource.buffer = introBuffer;
    introSource.connect(gainNode);
    introSource.start(startTime);

    loopSource = audioCtx.createBufferSource();
    loopSource.buffer = loopBuffer;
    loopSource.loop = true;
    loopSource.connect(gainNode);
    loopSource.start(startTime + introBuffer.duration);
  }
  // ================

  const logoBuffer = document.createElement("canvas");
  const logoCtx = logoBuffer.getContext("2d");

  let line1Opacity = 0;
  let line2Opacity = 0;

  const scrollerList = [
    "WELCOME TO MY BULLSHIT WEBPAGE. HERE I DO THINGS AND STUFF EVEN!",
    "YES I AM A FUCKING FURRY, PULCHRA IS MY WIFE, I LOVE MY MEOWSCARADA!",
    "BE GAY DO CRIMES!",
    "I AM NOT CRACKING ANYTHING... YET.",
    "ALSO TRY PREHISTORIK 2!",
    "LIFE IS MISERABLE, MIGHT AS WELL HAVE SOME FUN WHILE YOU ARE STILL ALIVE.",
    "WOAH!",
    "YOU SHOULD LOVE YOURSELF... NOW!",
  ]

  function constructScrollerText() {
    return scrollerList.join(" ".repeat(32));
  }

  const scrollerText = constructScrollerText();
  const scrollerPeriod = 1000;
  const scrollerY = 98;
  const scrollerAmplitude = 72;
  let scrollerX = 0;
  let scrollerSpeed = 240;
  let scrollerVisible = true;

  let lastTime = performance.now();

  function triggerUserInput() {
    if (currentState === STATES.WAIT_CLICK) {
      currentState = STATES.INTRO_WAVES;
      stateTimer = 0;
    } else if (currentState === STATES.RUNNING) {
      scrollerVisible = false;
      currentState = STATES.OUTRO_WAVES;
      stateTimer = 0;
    }
  }

  window.addEventListener("click", triggerUserInput);
  window.addEventListener("touchstart", triggerUserInput);
  window.addEventListener("keydown", triggerUserInput);

  function getGPUName() {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "Unknown GPU";
    let renderer;
    renderer = gl.getParameter(gl.RENDERER);
    if (!renderer || renderer === "WebKit WebGL") {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
    if (!renderer) return "Unknown GPU";
    return renderer
      .replace(/^ANGLE \([^,]+,\s*/i, "")
      .replace(/\s*\(0x[0-9a-f]+\)/i, "")
      .replace(/\s+Direct3D\d+(?:\s+.*)?$/i, "")
      .replace(/,\s*or similar$/i, "")
      .trim();
  }

  const gpuName = getGPUName()

  function ln(line) {
    return 16 * line;
  }

  function drawStartPrompt() {
    ctx.save();
    ctx.font = "16px 'IBMVGA8', monospace";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    if (epappImg.complete && epappImg.naturalWidth > 0) {
      const padding = 16;
      const maxWidth = 133;
      const aspectRatio = epappImg.naturalHeight / epappImg.naturalWidth;
      const width = maxWidth;
      const height = width * aspectRatio;
      const x = CANVAS_WIDTH - width - padding;
      const y = padding;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(epappImg, x, y, width, height);
    }

    ctx.fillText("PIZ-DOS version 1.33.7", 16, ln(1));
    ctx.fillText("Copyleft 2026 AZ, Inc.", 16, ln(2));

    ctx.fillText("Detected GPU: " + gpuName, 16, ln(4));
    ctx.fillText("Current date and time is: " + date, 16, ln(5));

    ctx.fillText("C:\\>WIN\\WIN.EXE", 16, ln(7))
    ctx.fillText("Illegal command: WIN\\WIN.EXE", 16, ln(8))

    ctx.fillText("C:\\>DIR", 16, ln(10))
    ctx.fillText("Directory if C:\\.", 16, ln(11))
    ctx.fillText("PORN     <DIR>                   01-01-2000 12:34", 16, ln(12))
    ctx.fillText("SECRET   <DIR>                   01-01-2000 12:34", 16, ln(13))
    ctx.fillText("COMMAND   COM             80,085 01-01-2000 12:34", 16, ln(14))
    ctx.fillText("WEBPAGE   COM              5,124 01-10-2026 22:25", 16, ln(15))
    ctx.fillText("    2 File(s)             85,209 Bytes", 16, ln(16))
    ctx.fillText("    2 Dir(s)         262,111,744 Bytes free.", 16, ln(17))

    ctx.fillText("C:\\>WEBPAGE.COM", 16, ln(19));
    if (Math.floor(Date.now() / 250) % 2 === 0)ctx.fillText("▁", 16 + ctx.measureText("C:\\>WEBPAGE.COM").width, ln(19));
    ctx.fillStyle = "rgb(63,63,63)";
    ctx.fillText("(click or tap anywhere to enter)", 16, ln(20));
    ctx.restore();
  }

  function drawWave(
    yCenter,
    amplitude,
    wavelength,
    phase,
    revealProgress,
    revealDirection,
  ) {
    if (!wavesVisible || revealProgress <= 0) return;

    ctx.save();
    ctx.beginPath();

    if (revealDirection === "R2L") {
      const startX = CANVAS_WIDTH * (1 - revealProgress);
      ctx.rect(startX, 0, CANVAS_WIDTH - startX, CANVAS_HEIGHT);
    } else {
      const endX = CANVAS_WIDTH * revealProgress;
      ctx.rect(0, 0, endX, CANVAS_HEIGHT);
    }
    ctx.clip();

    ctx.beginPath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);

    for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
      const y = yCenter +
        Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawLogo() {
    if (!logoImg.complete || logoImg.naturalWidth === 0) return;

    if (
      currentState === STATES.WAIT_CLICK ||
      currentState === STATES.INTRO_WAVES ||
      currentState === STATES.OUTRO_TEXT1 ||
      currentState === STATES.OUTRO_PAUSE1 ||
      currentState === STATES.OUTRO_TEXT2 ||
      currentState === STATES.OUTRO_PAUSE2 ||
      currentState === STATES.END_SCREEN
    ) {
      return;
    }

    const targetWidth = 360;
    const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
    const targetHeight = Math.round(targetWidth * aspectRatio);
    const x = Math.round((CANVAS_WIDTH - targetWidth) / 2);
    const y = Math.round((CANVAS_HEIGHT - targetHeight) / 2) - 10;

    logoBuffer.width = targetWidth;
    logoBuffer.height = targetHeight;
    logoCtx.clearRect(0, 0, targetWidth, targetHeight);
    logoCtx.imageSmoothingEnabled = false;
    logoCtx.drawImage(logoImg, 0, 0, targetWidth, targetHeight);

    const isRainbowState = currentState === STATES.RUNNING ||
      currentState === STATES.OUTRO_WAVES ||
      currentState === STATES.OUTRO_LOGO;

    if (isRainbowState) {
      logoCtx.globalCompositeOperation = "source-in";
      logoCtx.fillStyle = `hsl(${logoHue % 360}, 100%, 65%)`;
      logoCtx.fillRect(0, 0, targetWidth, targetHeight);
      logoCtx.globalCompositeOperation = "source-over";
    }

    ctx.save();
    ctx.beginPath();

    if (currentState === STATES.INTRO_LOGO) {
      const revealW = targetWidth * logoRevealProgress;
      ctx.rect(x, y, revealW, targetHeight);
    } else if (currentState === STATES.OUTRO_LOGO) {
      const unloadX = targetWidth * logoUnloadProgress;
      ctx.rect(x + unloadX, y, targetWidth - unloadX, targetHeight);
    } else {
      ctx.rect(x, y, targetWidth, targetHeight);
    }
    ctx.clip();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(logoBuffer, x, y, targetWidth, targetHeight);
    ctx.restore();
  }

  function drawScroller(time) {
    if (!scrollerVisible) return;

    ctx.save();
    ctx.font = "14px 'PressStart2P', monospace";
    ctx.fillStyle = "#ffff00";
    ctx.textBaseline = "middle";

    const charWidth = 14;
    const jumpY = scrollerY - Math.abs(Math.sin(time * (Math.PI / scrollerPeriod))) * scrollerAmplitude;

    for (let i = 0; i < scrollerText.length; i++) {
      const char = scrollerText[i];
      const charX = CANVAS_WIDTH - scrollerX + (i * charWidth);

      if (charX >= -charWidth && charX <= CANVAS_WIDTH + charWidth) {
        ctx.fillText(char, charX, jumpY);
      }
    }
    ctx.restore();
  }

  function drawBottomText() {
    ctx.save();
    ctx.font = "14px 'PressStart2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (line1Opacity > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${line1Opacity})`;
      ctx.fillText("PRESENTS", CANVAS_WIDTH / 2, 325);
    }

    if (line2Opacity > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${line2Opacity})`;
      ctx.fillText("PERSONAL PAGE (C) AZ", CANVAS_WIDTH / 2, 355);
    }

    if (currentState === STATES.RUNNING) {
      ctx.font = "7px 'PressStart2P', monospace";
      ctx.fillStyle = "rgb(63, 63, 63)";
      ctx.fillText("(CLICK ANYWHERE)", CANVAS_WIDTH / 2, 378);
    }
    ctx.restore();
  }

  function update(dt) {
    stateTimer += dt;

    if (currentState === STATES.INTRO_WAVES) {
      topWaveReveal = Math.min(1, stateTimer / 0.8);
      bottomWaveReveal = Math.min(1, stateTimer / 0.8);
      if (stateTimer >= 0.8) {
        currentState = STATES.INTRO_LOGO;
        stateTimer = 0;
      }
    } else if (currentState === STATES.INTRO_LOGO) {
      logoRevealProgress = Math.min(1, stateTimer / 0.75);
      if (stateTimer >= 0.75) {
        currentState = STATES.INTRO_TEXT1;
        stateTimer = 0;
      }
    } else if (currentState === STATES.INTRO_TEXT1) {
      line1Opacity = Math.min(1, stateTimer / 0.25);
      if (stateTimer >= 0.25) {
        currentState = STATES.INTRO_PAUSE1;
        stateTimer = 0;
      }
    } else if (currentState === STATES.INTRO_PAUSE1) {
      line1Opacity = 1;
      if (stateTimer >= 0.25) {
        currentState = STATES.INTRO_TEXT2;
        stateTimer = 0;
      }
    } else if (currentState === STATES.INTRO_TEXT2) {
      line2Opacity = Math.min(1, stateTimer / 0.25);
      if (stateTimer >= 0.25) {
        currentState = STATES.INTRO_PAUSE2;
        stateTimer = 0;
      }
    } else if (currentState === STATES.INTRO_PAUSE2) {
      line2Opacity = 1;
      if (stateTimer >= 0.25) {
        currentState = STATES.RUNNING;
        stateTimer = 0;
        playBg();
      }
    } else if (currentState === STATES.RUNNING) {
      topWavePhase += dt * 8.0;
      bottomWavePhase -= dt * 8.0;
      logoHue = (logoHue + dt * 45) % 360;

      scrollerX += scrollerSpeed * dt;
      const charWidth = 14;
      const totalTextWidth = scrollerText.length * charWidth;
      const loopDistance = totalTextWidth + CANVAS_WIDTH + 160;
      if (scrollerX >= loopDistance) {
        scrollerX = 0;
      }
    } else if (currentState === STATES.OUTRO_WAVES) {
      logoHue = (logoHue + dt * 45) % 360;
      topWaveReveal = Math.max(0, 1 - stateTimer / 0.5);
      bottomWaveReveal = Math.max(0, 1 - stateTimer / 0.5);

      if (stateTimer >= 0.5) {
        wavesVisible = false;
        currentState = STATES.OUTRO_LOGO;
        stateTimer = 0;
      }
    } else if (currentState === STATES.OUTRO_LOGO) {
      logoUnloadProgress = Math.min(1, stateTimer / 0.6);
      if (stateTimer >= 0.6) {
        currentState = STATES.OUTRO_TEXT1;
        stateTimer = 0;
      }
    } else if (currentState === STATES.OUTRO_TEXT1) {
      line1Opacity = Math.max(0, 1 - stateTimer / 0.25);
      if (stateTimer >= 0.25) {
        currentState = STATES.OUTRO_PAUSE1;
        stateTimer = 0;
      }
    } else if (currentState === STATES.OUTRO_PAUSE1) {
      line1Opacity = 0;
      if (stateTimer >= 0.25) {
        currentState = STATES.OUTRO_TEXT2;
        stateTimer = 0;
      }
    } else if (currentState === STATES.OUTRO_TEXT2) {
      line2Opacity = Math.max(0, 1 - stateTimer / 0.25);
      if (stateTimer >= 0.25) {
        currentState = STATES.OUTRO_PAUSE2;
        stateTimer = 0;
      }
    } else if (currentState === STATES.OUTRO_PAUSE2) {
      line2Opacity = 0;
      if (stateTimer >= 0.25) {
        currentState = STATES.END_SCREEN;
        stateTimer = 0;
      }
    }
  }

  function render(timestamp) {
    if (currentState === STATES.END_SCREEN) {
      canvas.style.display = "none";
      return;
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentState === STATES.WAIT_CLICK) {
      drawStartPrompt();
    } else {
      if (scrollerVisible && currentState === STATES.RUNNING) {
        drawScroller(timestamp);
      }
      drawWave(
        topWaveY,
        waveAmplitude,
        waveWavelength,
        topWavePhase,
        topWaveReveal,
        "R2L",
      );
      drawLogo();
      drawWave(
        bottomWaveY,
        waveAmplitude,
        waveWavelength,
        bottomWavePhase,
        bottomWaveReveal,
        "L2R",
      );
      drawBottomText();
    }
  }

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    render(timestamp);

    if (currentState !== STATES.END_SCREEN) {
      requestAnimationFrame(loop);
    }
  }

  requestAnimationFrame(loop);
})();
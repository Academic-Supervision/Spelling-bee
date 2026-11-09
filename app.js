/**
 * Spelling Bee Championship 2026
 * Interactive Dashboard & Real-Time Chroma-Key Stage System
 */

(function () {
  'use strict';

  // --- STATE ---
  let spellers = [];
  let currentSpellerIndex = 0;
  let activeGradeFilter = 'all';
  let searchQuery = '';
  let isWinnerActive = false;
  let isSoundEnabled = true;
  let isStageActive = false;

  // WebGL & Animation state
  let gl = null;
  let webglProgram = null;
  let videoTexture = null;
  let photoTexture = null;
  let animationFrameId = null;
  let activePhotoImg = null;
  let webglActive = false;

  // DOM Elements
  const dashboardView = document.getElementById('dashboardView');
  const stageView = document.getElementById('stageView');
  const dashboardBgVideo = document.getElementById('dashboardBgVideo');
  const spellersContainer = document.getElementById('spellersContainer');
  const spellerSearchInput = document.getElementById('spellerSearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const gradeTabs = document.getElementById('gradeTabs');
  const noResultsState = document.getElementById('noResultsState');

  // Stage DOM Elements
  const stageCanvas = document.getElementById('stageCanvas');
  const webglFrameVideo = document.getElementById('webglFrameVideo');
  const cssFallbackContainer = document.getElementById('cssFallbackContainer');
  const cssFrameVideo = document.getElementById('cssFrameVideo');
  const cssContestantPhoto = document.getElementById('cssContestantPhoto');
  const winnerVideo = document.getElementById('winnerVideo');
  const winnerBanner = document.getElementById('winnerBanner');
  const winnerBannerName = document.getElementById('winnerBannerName');
  const confettiCanvas = document.getElementById('confettiCanvas');

  // Stage Control Panel Elements
  const stageContestantThumb = document.getElementById('stageContestantThumb');
  const stageContestantName = document.getElementById('stageContestantName');
  const stageContestantAr = document.getElementById('stageContestantAr');
  const stageGradeBadge = document.getElementById('stageGradeBadge');
  const stageSectionTag = document.getElementById('stageSectionTag');
  const spellerCounter = document.getElementById('spellerCounter');
  const btnWinner = document.getElementById('btnWinner');
  const btnEnd = document.getElementById('btnEnd');
  const btnPrevSpeller = document.getElementById('btnPrevSpeller');
  const btnNextSpeller = document.getElementById('btnNextSpeller');
  const btnToggleAudio = document.getElementById('btnToggleAudio');
  const audioIcon = document.getElementById('audioIcon');
  const audioLabel = document.getElementById('audioLabel');
  const btnStageFullscreen = document.getElementById('btnStageFullscreen');
  const btnHeaderFullscreen = document.getElementById('btnHeaderFullscreen');

  // --- INITIALIZATION ---
  function init() {
    if (typeof STUDENTS_DATA !== 'undefined' && Array.isArray(STUDENTS_DATA)) {
      spellers = STUDENTS_DATA;
    } else {
      console.error('STUDENTS_DATA not found');
      return;
    }

    initWebGL();
    renderDashboard();
    setupEventListeners();
  }

  // --- DASHBOARD RENDERING ---
  function renderDashboard() {
    spellersContainer.innerHTML = '';

    // Filter by search and grade
    const filtered = spellers.filter(s => {
      const matchesGrade = activeGradeFilter === 'all' || s.grade.toString() === activeGradeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.name.toLowerCase().includes(q) || 
        (s.name_ar && s.name_ar.includes(q)) || 
        s.section.toLowerCase().includes(q) ||
        `grade ${s.grade}`.includes(q);
      return matchesGrade && matchesSearch;
    });

    if (filtered.length === 0) {
      noResultsState.style.display = 'block';
      return;
    } else {
      noResultsState.style.display = 'none';
    }

    // Group filtered spellers by grade (1 to 6)
    const gradesPresent = [];
    if (activeGradeFilter === 'all') {
      for (let g = 1; g <= 6; g++) {
        const gradeList = filtered.filter(s => s.grade === g);
        if (gradeList.length > 0) gradesPresent.push({ grade: g, list: gradeList });
      }
    } else {
      const g = parseInt(activeGradeFilter, 10);
      gradesPresent.push({ grade: g, list: filtered });
    }

    gradesPresent.forEach(group => {
      const block = document.createElement('div');
      block.className = 'grade-group-block';

      // Header for Grade
      const header = document.createElement('div');
      header.className = 'grade-group-header';
      header.innerHTML = `
        <span class="grade-badge-pill">Grade ${group.grade}</span>
        <h2 class="grade-group-title">Grade ${group.grade} Spellers</h2>
        <span class="grade-group-count">${group.list.length} Contestant${group.list.length > 1 ? 's' : ''} (Alphabetical A–Z)</span>
      `;
      block.appendChild(header);

      // Card Grid
      const grid = document.createElement('div');
      grid.className = 'spellers-grid';

      group.list.forEach(speller => {
        const card = document.createElement('div');
        card.className = 'speller-card';
        card.title = `Click to feature ${speller.name} on stage`;
        card.addEventListener('click', () => openStage(speller));

        const arHtml = speller.name_ar ? `<div class="speller-name-ar">${speller.name_ar}</div>` : '';
        const encodedFilePath = encodeURI(speller.file);

        card.innerHTML = `
          <div class="speller-card-photo-box">
            <img class="speller-photo" src="${encodedFilePath}" alt="${speller.name}" loading="lazy" />
            <div class="photo-overlay-gradient"></div>
            <div class="speller-rank-tag">#${speller.id}</div>
            <div class="speller-grade-pill">Grade ${speller.grade}</div>
          </div>
          <div class="speller-card-body">
            <div class="speller-name">${speller.name}</div>
            ${arHtml}
            <div class="speller-meta-row">
              <span class="speller-section-badge">${speller.section}</span>
              <span class="speller-action-cta">
                <span>Stage</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42 5.43 5.43H5v2z"/>
                </svg>
              </span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });

      block.appendChild(grid);
      spellersContainer.appendChild(block);
    });
  }

  // --- STAGE VIEW MANAGEMENT ---
  function openStage(speller) {
    currentSpellerIndex = spellers.findIndex(s => s.id === speller.id);
    if (currentSpellerIndex === -1) currentSpellerIndex = 0;

    isStageActive = true;
    isWinnerActive = false;

    // Pause dashboard background video to save resources
    if (dashboardBgVideo) {
      dashboardBgVideo.pause();
    }

    // Reset winner effects
    resetWinnerEffects();

    // Update Stage UI
    updateStageContestant(spellers[currentSpellerIndex]);

    // Show Stage, hide Dashboard
    dashboardView.style.display = 'none';
    stageView.style.display = 'flex';

    // Start video and rendering
    startStagePlayback();
  }

  function updateStageContestant(speller) {
    const encodedFilePath = encodeURI(speller.file);
    stageContestantThumb.src = encodedFilePath;
    stageContestantName.textContent = speller.name;
    winnerBannerName.textContent = `${speller.name.toUpperCase()} • GRADE ${speller.grade}`;

    if (speller.name_ar) {
      stageContestantAr.textContent = speller.name_ar;
      stageContestantAr.style.display = 'block';
    } else {
      stageContestantAr.textContent = '';
      stageContestantAr.style.display = 'none';
    }

    stageGradeBadge.textContent = `Grade ${speller.grade}`;
    stageSectionTag.textContent = `Class: ${speller.section}`;
    spellerCounter.textContent = `${currentSpellerIndex + 1} of ${spellers.length}`;

    // Update CSS fallback photo
    cssContestantPhoto.src = encodedFilePath;

    // Load photo for WebGL texture
    loadPhotoTexture(encodedFilePath);
  }

  function startStagePlayback() {
    // Attempt WebGL frame video play (MUTED: no music during contestant display)
    webglFrameVideo.currentTime = 0;
    webglFrameVideo.muted = true;
    webglFrameVideo.volume = 0;
    const playPromise = webglFrameVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('WebGL video autoplay blocked/fallback:', err);
      });
    }

    // Also start CSS fallback video (MUTED: no music during contestant display)
    cssFrameVideo.currentTime = 0;
    cssFrameVideo.muted = true;
    cssFrameVideo.volume = 0;
    cssFrameVideo.play().catch(() => {});

    // Start render loop
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(renderStageLoop);
    }
  }

  function endStage() {
    isStageActive = false;
    isWinnerActive = false;

    // Stop videos
    webglFrameVideo.pause();
    webglFrameVideo.currentTime = 0;
    cssFrameVideo.pause();
    cssFrameVideo.currentTime = 0;

    // Stop winner video & effects
    resetWinnerEffects();

    // Cancel animation loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Stop Confetti
    stopConfetti();

    // Resume dashboard background video
    if (dashboardBgVideo) {
      dashboardBgVideo.play().catch(() => {});
    }

    // Transition back to Dashboard cleanly
    stageView.style.display = 'none';
    dashboardView.style.display = 'block';
  }

  // --- WINNER EFFECT TRIGGER ---
  function triggerWinner() {
    if (!isStageActive) return;

    isWinnerActive = true;

    // 1. Play Winner Effect Video over frame video with celebratory audio fanfare
    winnerVideo.currentTime = 0;
    winnerVideo.muted = !isSoundEnabled;
    winnerVideo.volume = 1.0;
    winnerVideo.style.display = 'block';
    winnerVideo.play().catch(err => console.warn('Winner video playback error:', err));

    // When winner video ends, keep it looping or hold last frame
    winnerVideo.onended = () => {
      // Loop or pause
      winnerVideo.currentTime = 0;
      winnerVideo.play().catch(() => {});
    };

    // 2. Show Champion Banner
    winnerBanner.classList.add('show');

    // 3. Launch Confetti celebration particles
    launchConfetti();
  }

  function resetWinnerEffects() {
    isWinnerActive = false;
    winnerVideo.pause();
    winnerVideo.currentTime = 0;
    winnerVideo.style.display = 'none';
    winnerBanner.classList.remove('show');
    stopConfetti();
  }

  // --- WEBGL CHROMA-KEY ENGINE ---
  function initWebGL() {
    try {
      gl = stageCanvas.getContext('webgl', { preserveDrawingBuffer: false, alpha: false }) || 
           stageCanvas.getContext('experimental-webgl');
      
      if (!gl) {
        enableCssFallback();
        return;
      }

      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          // Map [-1, 1] to [0, 1] texture coordinates with inverted Y for WebGL
          v_texCoord = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
        }
      `;

      // Fragment shader with Hollywood-style green screen despill & smooth edge feathering
      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        uniform sampler2D u_photo;
        uniform vec4 u_box; // xMin, yMin, width, height in normalized UV
        varying vec2 v_texCoord;

        void main() {
          vec4 vidColor = texture2D(u_video, v_texCoord);

          // Check if fragment is within the green frame bounding box
          // Frame bounds: x ~ [0.575, 0.875], y ~ [0.155, 0.835]
          bool inFrameBox = (v_texCoord.x >= u_box.x && v_texCoord.x <= (u_box.x + u_box.z) &&
                             v_texCoord.y >= u_box.y && v_texCoord.y <= (u_box.y + u_box.w));

          if (inFrameBox) {
            float r = vidColor.r;
            float g = vidColor.g;
            float b = vidColor.b;

            // Greenness detection
            float maxRB = max(r, b);
            float diff = g - maxRB;

            // Smooth thresholding: 0.07 to 0.22
            float isGreen = clamp((diff - 0.07) / (0.22 - 0.07), 0.0, 1.0);

            if (isGreen > 0.01) {
              // Normalized coords inside frame [0, 1]
              float u = (v_texCoord.x - u_box.x) / u_box.z;
              float v = (v_texCoord.y - u_box.y) / u_box.w;

              // Sample speller portrait photo
              vec4 photoColor = texture2D(u_photo, vec2(u, v));

              // Despill video green spill on frame edge
              vec3 despilledVid = vidColor.rgb;
              if (g > maxRB) {
                despilledVid.g = maxRB;
              }

              // Anti-aliased blend
              gl_FragColor = mix(vec4(despilledVid, 1.0), photoColor, isGreen);
              return;
            }
          }

          gl_FragColor = vidColor;
        }
      `;

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      webglProgram = createProgram(gl, vs, fs);

      // Setup Fullscreen Quad
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]), gl.STATIC_DRAW);

      const aPositionLoc = gl.getAttribLocation(webglProgram, 'a_position');
      gl.enableVertexAttribArray(aPositionLoc);
      gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

      // Create Textures
      videoTexture = createTexture(gl);
      photoTexture = createTexture(gl);

      webglActive = true;
    } catch (e) {
      console.warn('WebGL initialization exception, using CSS fallback:', e);
      enableCssFallback();
    }
  }

  function enableCssFallback() {
    webglActive = false;
    stageCanvas.style.display = 'none';
    cssFallbackContainer.style.display = 'block';
  }

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + err);
    }
    return shader;
  }

  function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Program link error: ' + err);
    }
    return program;
  }

  function createTexture(gl) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  function loadPhotoTexture(url) {
    activePhotoImg = new Image();
    activePhotoImg.crossOrigin = 'anonymous';
    activePhotoImg.onload = () => {
      if (webglActive && gl && photoTexture) {
        try {
          gl.bindTexture(gl.TEXTURE_2D, photoTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, activePhotoImg);
        } catch (e) {
          console.warn('WebGL photo texture failed (CORS/file://), switching to CSS fallback:', e);
          enableCssFallback();
        }
      }
    };
    activePhotoImg.src = url;
  }

  function renderStageLoop() {
    if (!isStageActive) return;

    if (webglActive && gl && webglFrameVideo.readyState >= 2) {
      try {
        // Upload video frame to texture
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webglFrameVideo);

        gl.useProgram(webglProgram);

        // Bind video texture to unit 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.uniform1i(gl.getUniformLocation(webglProgram, 'u_video'), 0);

        // Bind photo texture to unit 1
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, photoTexture);
        gl.uniform1i(gl.getUniformLocation(webglProgram, 'u_photo'), 1);

        // Green Screen inner frame bounds:
        // x: 746/1280 = 0.5828, width: 369/1280 = 0.2883
        // y: 114/720  = 0.1583, height: 481/720 = 0.6681
        gl.uniform4f(gl.getUniformLocation(webglProgram, 'u_box'), 0.5828, 0.1583, 0.2883, 0.6681);

        gl.viewport(0, 0, stageCanvas.width, stageCanvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } catch (err) {
        // If tainted canvas security error occurs (e.g. on file://), fallback immediately
        console.warn('WebGL render error (falling back to CSS):', err);
        enableCssFallback();
      }
    }

    animationFrameId = requestAnimationFrame(renderStageLoop);
  }

  // --- CELEBRATION CONFETTI ENGINE ---
  let confettiParticles = [];
  let confettiAnimId = null;

  function launchConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = 1280;
    confettiCanvas.height = 720;
    confettiParticles = [];

    const colors = ['#ffd700', '#f3e5ab', '#ffb703', '#ffffff', '#e63946', '#2a9d8f'];
    for (let i = 0; i < 150; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -confettiCanvas.height,
        w: Math.random() * 12 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 5 + 3,
        vx: (Math.random() - 0.5) * 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    function drawConfetti() {
      if (!isWinnerActive) return;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      confettiParticles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotSpeed;

        if (p.y > confettiCanvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * confettiCanvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      confettiAnimId = requestAnimationFrame(drawConfetti);
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    confettiAnimId = requestAnimationFrame(drawConfetti);
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  // --- AUDIO TOGGLE ---
  function toggleAudio() {
    isSoundEnabled = !isSoundEnabled;
    // Frame video remains muted at all times as requested
    webglFrameVideo.muted = true;
    webglFrameVideo.volume = 0;
    cssFrameVideo.muted = true;
    cssFrameVideo.volume = 0;

    // Toggle sound for Winner Effect video
    winnerVideo.muted = !isSoundEnabled;

    if (isSoundEnabled) {
      audioIcon.textContent = '🔊';
      audioLabel.textContent = 'Sound ON';
    } else {
      audioIcon.textContent = '🔇';
      audioLabel.textContent = 'Muted';
    }
  }

  // --- FULLSCREEN TOGGLE ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Search Input
    spellerSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      btnClearSearch.style.display = searchQuery ? 'block' : 'none';
      renderDashboard();
    });

    btnClearSearch.addEventListener('click', () => {
      spellerSearchInput.value = '';
      searchQuery = '';
      btnClearSearch.style.display = 'none';
      spellerSearchInput.focus();
      renderDashboard();
    });

    // Grade Tabs
    gradeTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.grade-tab');
      if (!tab) return;
      gradeTabs.querySelectorAll('.grade-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeGradeFilter = tab.dataset.grade;
      renderDashboard();
    });

    // WINNER Button Click
    btnWinner.addEventListener('click', triggerWinner);

    // END Button Click (Returns to Dashboard and clears all effects)
    btnEnd.addEventListener('click', endStage);

    // Previous Speller
    btnPrevSpeller.addEventListener('click', () => {
      if (currentSpellerIndex > 0) {
        currentSpellerIndex--;
      } else {
        currentSpellerIndex = spellers.length - 1;
      }
      resetWinnerEffects();
      updateStageContestant(spellers[currentSpellerIndex]);
    });

    // Next Speller
    btnNextSpeller.addEventListener('click', () => {
      if (currentSpellerIndex < spellers.length - 1) {
        currentSpellerIndex++;
      } else {
        currentSpellerIndex = 0;
      }
      resetWinnerEffects();
      updateStageContestant(spellers[currentSpellerIndex]);
    });

    // Audio & Fullscreen Buttons
    btnToggleAudio.addEventListener('click', toggleAudio);
    btnStageFullscreen.addEventListener('click', toggleFullscreen);
    btnHeaderFullscreen.addEventListener('click', toggleFullscreen);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (isStageActive) {
        if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          triggerWinner();
        } else if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          endStage();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          btnPrevSpeller.click();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          btnNextSpeller.click();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          toggleAudio();
        }
      } else {
        if (e.key === 'f' || e.key === 'F') {
          toggleFullscreen();
        }
      }
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

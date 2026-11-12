/**
 * Spelling Bee Championship 2026
 * Interactive Dashboard, Real-Time Chroma-Key Stage System,
 * and Live Competition Round & Ceremony Manager
 */

(function () {
  'use strict';

  // --- STORAGE & COMPETITION STATE ---
  const COMPETITION_STORAGE_KEY = 'SPELLING_BEE_CHAMPIONSHIP_STATE_2026';

  let allSpellers = [];             // Master catalog of all 68 contestants
  let spellers = [];                // Active spellers for the current round / display
  let currentSpellerIndex = 0;
  let activeGradeFilter = 'all';
  let searchQuery = '';
  let isWinnerActive = false;
  let isSoundEnabled = true;
  let isStageActive = false;

  let competitionState = {
    isActive: false,                // Official competition mode running
    currentRound: 1,                // Current active round (1, 2, 3...)
    activeSpellerIds: [],           // Speller IDs competing in current round (empty = all)
    currentRoundWinners: [],        // Speller IDs marked as winners in current round
    winnersByRound: {},             // Map: { 1: [ids], 2: [ids] }
    isCompleted: false              // Whether rounds complete was triggered
  };

  // WebGL & Animation state
  let gl = null;
  let webglProgram = null;
  let videoTexture = null;
  let photoTexture = null;
  let animationFrameId = null;
  let activePhotoImg = null;
  let webglActive = false;

  // DOM Elements - Main Views
  const dashboardView = document.getElementById('dashboardView');
  const stageView = document.getElementById('stageView');
  const ceremonyView = document.getElementById('ceremonyView');
  const dashboardBgVideo = document.getElementById('dashboardBgVideo');

  // DOM Elements - Dashboard
  const spellersContainer = document.getElementById('spellersContainer');
  const spellerSearchInput = document.getElementById('spellerSearchInput');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const gradeTabs = document.getElementById('gradeTabs');
  const noResultsState = document.getElementById('noResultsState');

  // DOM Elements - Competition Bar
  const competitionControlBar = document.getElementById('competitionControlBar');
  const compInactiveContent = document.getElementById('compInactiveContent');
  const compActiveContent = document.getElementById('compActiveContent');
  const btnStartCompetition = document.getElementById('btnStartCompetition');
  const compRoundDisplay = document.getElementById('compRoundDisplay');
  const compActiveCount = document.getElementById('compActiveCount');
  const compWinnersCount = document.getElementById('compWinnersCount');
  const btnAddRound = document.getElementById('btnAddRound');
  const btnCompleteRounds = document.getElementById('btnCompleteRounds');
  const btnResetCompetition = document.getElementById('btnResetCompetition');

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
  const stageWinnerStatus = document.getElementById('stageWinnerStatus');
  const spellerCounter = document.getElementById('spellerCounter');
  const btnWinner = document.getElementById('btnWinner');
  const btnUndoWinner = document.getElementById('btnUndoWinner');
  const btnEnd = document.getElementById('btnEnd');
  const btnPrevSpeller = document.getElementById('btnPrevSpeller');
  const btnNextSpeller = document.getElementById('btnNextSpeller');
  const btnToggleAudio = document.getElementById('btnToggleAudio');
  const audioIcon = document.getElementById('audioIcon');
  const audioLabel = document.getElementById('audioLabel');
  const btnStageFullscreen = document.getElementById('btnStageFullscreen');
  const btnHeaderFullscreen = document.getElementById('btnHeaderFullscreen');

  // Ceremony View Elements
  const ceremonyChampionsGrid = document.getElementById('ceremonyChampionsGrid');
  const ceremonyConfettiCanvas = document.getElementById('ceremonyConfettiCanvas');
  const btnCeremonyFanfare = document.getElementById('btnCeremonyFanfare');
  const btnCeremonyFullscreen = document.getElementById('btnCeremonyFullscreen');
  const btnCeremonyPrint = document.getElementById('btnCeremonyPrint');
  const btnCeremonyBack = document.getElementById('btnCeremonyBack');

  // Modals & Dialogs
  const modalResetConfirm = document.getElementById('modalResetConfirm');
  const btnCancelReset = document.getElementById('btnCancelReset');
  const btnConfirmReset = document.getElementById('btnConfirmReset');

  const modalAddRoundConfirm = document.getElementById('modalAddRoundConfirm');
  const modalAddRoundMsg = document.getElementById('modalAddRoundMsg');
  const btnCancelAddRound = document.getElementById('btnCancelAddRound');
  const btnConfirmAddRound = document.getElementById('btnConfirmAddRound');

  const modalCompleteConfirm = document.getElementById('modalCompleteConfirm');
  const modalCompleteMsg = document.getElementById('modalCompleteMsg');
  const btnCancelComplete = document.getElementById('btnCancelComplete');
  const btnConfirmComplete = document.getElementById('btnConfirmComplete');

  const modalAlert = document.getElementById('modalAlert');
  const modalAlertTitle = document.getElementById('modalAlertTitle');
  const modalAlertMsg = document.getElementById('modalAlertMsg');
  const modalAlertIcon = document.getElementById('modalAlertIcon');
  const btnAlertOk = document.getElementById('btnAlertOk');

  const toastContainer = document.getElementById('toastContainer');

  // --- INITIALIZATION ---
  function init() {
    if (typeof STUDENTS_DATA !== 'undefined' && Array.isArray(STUDENTS_DATA)) {
      allSpellers = STUDENTS_DATA;
    } else {
      console.error('STUDENTS_DATA not found');
      return;
    }

    loadCompetitionState();
    initWebGL();
    renderDashboard();
    setupEventListeners();

    if (competitionState.isActive) {
      showToast(`تم استئناف المسابقة تلقائياً - الجولة ${competitionState.currentRound}`, '⚡');
    }
  }

  // --- STATE PERSISTENCE ---
  function loadCompetitionState() {
    try {
      const saved = localStorage.getItem(COMPETITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          competitionState = {
            isActive: Boolean(parsed.isActive),
            currentRound: Number(parsed.currentRound) || 1,
            activeSpellerIds: Array.isArray(parsed.activeSpellerIds) ? parsed.activeSpellerIds : [],
            currentRoundWinners: Array.isArray(parsed.currentRoundWinners) ? parsed.currentRoundWinners : [],
            winnersByRound: parsed.winnersByRound && typeof parsed.winnersByRound === 'object' ? parsed.winnersByRound : {},
            isCompleted: Boolean(parsed.isCompleted)
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load competition state from localStorage:', e);
    }
  }

  function saveCompetitionState() {
    try {
      localStorage.setItem(COMPETITION_STORAGE_KEY, JSON.stringify(competitionState));
    } catch (e) {
      console.warn('Failed to save competition state to localStorage:', e);
    }
    updateCompetitionBarUI();
  }

  // Active Spellers Calculation
  function getActiveSpellersForCurrentRound() {
    if (!competitionState.isActive) {
      return allSpellers;
    }
    if (!competitionState.activeSpellerIds || competitionState.activeSpellerIds.length === 0) {
      return allSpellers;
    }
    return allSpellers.filter(s => competitionState.activeSpellerIds.includes(s.id));
  }

  // --- COMPETITION CONTROL BAR UI ---
  function updateCompetitionBarUI() {
    if (!competitionControlBar) return;

    if (!competitionState.isActive) {
      competitionControlBar.className = 'competition-bar inactive';
      if (compInactiveContent) compInactiveContent.style.display = 'flex';
      if (compActiveContent) compActiveContent.style.display = 'none';
    } else {
      competitionControlBar.className = 'competition-bar active';
      if (compInactiveContent) compInactiveContent.style.display = 'none';
      if (compActiveContent) compActiveContent.style.display = 'flex';

      if (compRoundDisplay) compRoundDisplay.textContent = `Round ${competitionState.currentRound}`;
      const activeList = getActiveSpellersForCurrentRound();
      if (compActiveCount) compActiveCount.textContent = activeList.length;
      if (compWinnersCount) compWinnersCount.textContent = competitionState.currentRoundWinners.length;
    }
  }

  // --- DASHBOARD RENDERING ---
  function renderDashboard() {
    spellersContainer.innerHTML = '';

    // Active Spellers for this round
    const roundSpellers = getActiveSpellersForCurrentRound();
    spellers = roundSpellers;

    // Update dynamic statistics & tab counts
    updateGradeTabCounts(roundSpellers);
    updateHeaderStats(roundSpellers);
    updateCompetitionBarUI();

    // Filter by search and grade
    const filtered = roundSpellers.filter(s => {
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
        const isWinner = competitionState.isActive && competitionState.currentRoundWinners.includes(speller.id);
        const card = document.createElement('div');
        card.className = 'speller-card' + (isWinner ? ' is-winner' : '');
        card.title = `Click to feature ${speller.name} on stage`;
        card.addEventListener('click', () => openStage(speller));

        const arHtml = speller.name_ar ? `<div class="speller-name-ar">${speller.name_ar}</div>` : '';
        const encodedFilePath = encodeURI(speller.file);

        const winnerBadgeHtml = isWinner ? `
          <div class="speller-winner-badge">
            <span class="winner-star">⭐</span>
            <span>QUALIFIED</span>
          </div>
        ` : '';

        const cardToggleHtml = competitionState.isActive ? `
          <button class="card-winner-toggle ${isWinner ? 'active' : ''}" data-id="${speller.id}" title="${isWinner ? 'Click to unmark winner / إلغاء الفوز' : 'Click to mark as qualified winner / تسجيل فوز متأهل'}">
            ${isWinner ? '★' : '☆'}
          </button>
        ` : '';

        card.innerHTML = `
          <div class="speller-card-photo-box">
            <img class="speller-photo" src="${encodedFilePath}" alt="${speller.name}" loading="lazy" />
            <div class="photo-overlay-gradient"></div>
            <div class="speller-rank-tag">#${speller.id}</div>
            <div class="speller-grade-pill">Grade ${speller.grade}</div>
            ${winnerBadgeHtml}
            ${cardToggleHtml}
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

        // Direct Star Toggle Button on Card
        const toggleBtn = card.querySelector('.card-winner-toggle');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Do not trigger openStage
            toggleWinner(speller.id);
          });
        }

        grid.appendChild(card);
      });

      block.appendChild(grid);
      spellersContainer.appendChild(block);
    });
  }

  function updateGradeTabCounts(roundSpellers) {
    const allTabCount = gradeTabs.querySelector('.grade-tab[data-grade="all"] .tab-count');
    if (allTabCount) allTabCount.textContent = roundSpellers.length;

    for (let g = 1; g <= 6; g++) {
      const gTabCount = gradeTabs.querySelector(`.grade-tab[data-grade="${g}"] .tab-count`);
      if (gTabCount) {
        const count = roundSpellers.filter(s => s.grade === g).length;
        gTabCount.textContent = count;
      }
    }
  }

  function updateHeaderStats(roundSpellers) {
    const statsPills = document.querySelectorAll('.header-actions .stats-pill');
    if (statsPills.length >= 2) {
      statsPills[0].querySelector('.stats-num').textContent = roundSpellers.length;
      const gradesSet = new Set(roundSpellers.map(s => s.grade));
      statsPills[1].querySelector('.stats-num').textContent = gradesSet.size;
    }
  }

  // --- WINNER RECORDING & TOGGLE ---
  function toggleWinner(spellerId, forceState) {
    if (!competitionState.isActive) {
      competitionState.isActive = true;
      competitionState.currentRound = 1;
      competitionState.activeSpellerIds = allSpellers.map(s => s.id);
    }

    const index = competitionState.currentRoundWinners.indexOf(spellerId);
    let isNowWinner = false;

    if (forceState === true) {
      if (index === -1) {
        competitionState.currentRoundWinners.push(spellerId);
      }
      isNowWinner = true;
    } else if (forceState === false) {
      if (index !== -1) {
        competitionState.currentRoundWinners.splice(index, 1);
      }
      isNowWinner = false;
    } else {
      // Toggle
      if (index === -1) {
        competitionState.currentRoundWinners.push(spellerId);
        isNowWinner = true;
      } else {
        competitionState.currentRoundWinners.splice(index, 1);
        isNowWinner = false;
      }
    }

    saveCompetitionState();

    const targetSpeller = allSpellers.find(s => s.id === spellerId);
    const spellerName = targetSpeller ? targetSpeller.name : `Contestant #${spellerId}`;

    if (isNowWinner) {
      showToast(`⭐ تم تسجيل فوز وتأهل: ${spellerName}`, '⭐');
    } else {
      showToast(`تم إلغاء فوز: ${spellerName}`, '↩');
    }

    // Refresh stage buttons if open
    if (isStageActive && spellers[currentSpellerIndex] && spellers[currentSpellerIndex].id === spellerId) {
      updateStageWinnerStatusDisplay(isNowWinner);
    }

    // Refresh dashboard cards
    if (dashboardView.style.display !== 'none') {
      renderDashboard();
    }
  }

  function updateStageWinnerStatusDisplay(isWinner) {
    if (stageWinnerStatus) {
      stageWinnerStatus.style.display = isWinner ? 'inline-flex' : 'none';
    }
    if (btnUndoWinner) {
      btnUndoWinner.style.display = isWinner ? 'inline-flex' : 'none';
    }
  }

  // --- STAGE VIEW MANAGEMENT ---
  function openStage(speller) {
    currentSpellerIndex = spellers.findIndex(s => s.id === speller.id);
    if (currentSpellerIndex === -1) currentSpellerIndex = 0;

    isStageActive = true;
    isWinnerActive = false;

    if (dashboardBgVideo) {
      dashboardBgVideo.pause();
    }

    resetWinnerEffects();
    updateStageContestant(spellers[currentSpellerIndex]);

    dashboardView.style.display = 'none';
    ceremonyView.style.display = 'none';
    stageView.style.display = 'flex';

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

    // Winner status check on stage
    const isWinner = competitionState.isActive && competitionState.currentRoundWinners.includes(speller.id);
    updateStageWinnerStatusDisplay(isWinner);

    // Update CSS fallback photo
    cssContestantPhoto.src = encodedFilePath;

    // Load photo for WebGL texture
    loadPhotoTexture(encodedFilePath);
  }

  function startStagePlayback() {
    webglFrameVideo.currentTime = 0;
    webglFrameVideo.muted = true;
    webglFrameVideo.volume = 0;
    const playPromise = webglFrameVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('WebGL video autoplay blocked/fallback:', err);
      });
    }

    cssFrameVideo.currentTime = 0;
    cssFrameVideo.muted = true;
    cssFrameVideo.volume = 0;
    cssFrameVideo.play().catch(() => {});

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(renderStageLoop);
    }
  }

  function endStage() {
    isStageActive = false;
    isWinnerActive = false;

    webglFrameVideo.pause();
    webglFrameVideo.currentTime = 0;
    cssFrameVideo.pause();
    cssFrameVideo.currentTime = 0;

    resetWinnerEffects();

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    stopConfetti();

    if (dashboardBgVideo) {
      dashboardBgVideo.play().catch(() => {});
    }

    stageView.style.display = 'none';
    dashboardView.style.display = 'block';

    renderDashboard();
  }

  // --- WINNER EFFECT TRIGGER ---
  function triggerWinner() {
    if (!isStageActive) return;

    isWinnerActive = true;

    // Automatically record winner in the competition state!
    const currentSpeller = spellers[currentSpellerIndex];
    if (currentSpeller) {
      toggleWinner(currentSpeller.id, true);
    }

    // 1. Play Winner Effect Video over frame video with celebratory audio fanfare
    winnerVideo.currentTime = 0;
    winnerVideo.muted = !isSoundEnabled;
    winnerVideo.volume = 1.0;
    winnerVideo.style.display = 'block';
    winnerVideo.play().catch(err => console.warn('Winner video playback error:', err));

    winnerVideo.onended = () => {
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

  // --- COMPETITION ROUND ADVANCEMENT ("ADD ROUND") ---
  function advanceRound() {
    if (!competitionState.isActive) {
      startCompetition();
      return;
    }

    if (competitionState.currentRoundWinners.length === 0) {
      showAlertModal(
        'لم يتم اختيار فائزين بعد!',
        'يرجى تحديد المتأهلين أولاً من خلال الضغط على زر WINNER أثناء عرض المتسابق على المسرح، أو النقر على نجمة الفوز (★) على بطاقته.',
        '⚠️'
      );
      return;
    }

    modalAddRoundMsg.innerHTML = `
      ستبدأ الآن <strong>الجولة ${competitionState.currentRound + 1}</strong> بمشاركة <strong>${competitionState.currentRoundWinners.length}</strong> فائزاً متأهلاً فقط من الجولة الحالية.<br><br>
      <small style="color:var(--text-muted)">سيتم تصفية الشاشة لتعرض حصرياً الطلاب المتأهلين للجولة القادمة.</small>
    `;
    modalAddRoundConfirm.style.display = 'flex';
  }

  function confirmAdvanceRound() {
    modalAddRoundConfirm.style.display = 'none';

    // Save previous round winners to history
    competitionState.winnersByRound[competitionState.currentRound] = [...competitionState.currentRoundWinners];
    
    // Set active contestants for next round to be ONLY the winners of current round!
    competitionState.activeSpellerIds = [...competitionState.currentRoundWinners];
    competitionState.currentRound += 1;
    competitionState.currentRoundWinners = []; // Fresh round winners tracking

    saveCompetitionState();
    renderDashboard();

    showToast(`🌟 بدأت الجولة ${competitionState.currentRound} بمشاركة ${competitionState.activeSpellerIds.length} متسابقاً متأهلاً!`, '🎉');
  }

  // --- COMPETITION COMPLETION ("ROUNDS COMPLETE") ---
  function completeRounds() {
    if (!competitionState.isActive) {
      showAlertModal('المسابقة غير مفعلة', 'يرجى بدء المسابقة أولاً لتسجيل الجولات وتكريم الأبطال.', 'ℹ️');
      return;
    }

    modalCompleteConfirm.style.display = 'flex';
  }

  function confirmCompleteRounds() {
    modalCompleteConfirm.style.display = 'none';

    // Store current winners if any
    if (competitionState.currentRoundWinners.length > 0) {
      competitionState.winnersByRound[competitionState.currentRound] = [...competitionState.currentRoundWinners];
    }

    competitionState.isCompleted = true;
    saveCompetitionState();
    openCeremonyView();
  }

  // --- CEREMONY VIEW & HALL OF CHAMPIONS ---
  function openCeremonyView() {
    dashboardView.style.display = 'none';
    stageView.style.display = 'none';
    ceremonyView.style.display = 'flex';

    if (dashboardBgVideo) dashboardBgVideo.pause();

    // Determine final champions
    let championIds = [];
    if (competitionState.currentRoundWinners && competitionState.currentRoundWinners.length > 0) {
      championIds = competitionState.currentRoundWinners;
    } else {
      const rounds = Object.keys(competitionState.winnersByRound).map(Number).sort((a, b) => b - a);
      if (rounds.length > 0 && competitionState.winnersByRound[rounds[0]].length > 0) {
        championIds = competitionState.winnersByRound[rounds[0]];
      } else if (competitionState.activeSpellerIds && competitionState.activeSpellerIds.length > 0) {
        championIds = competitionState.activeSpellerIds;
      }
    }

    const champions = allSpellers.filter(s => championIds.includes(s.id));
    renderChampionsGallery(champions);

    playCeremonyFanfare();
  }

  function renderChampionsGallery(champions) {
    ceremonyChampionsGrid.innerHTML = '';
    if (champions.length === 0) {
      ceremonyChampionsGrid.innerHTML = `
        <div style="text-align:center; padding: 40px; color: var(--gold-light);">
          <div style="font-size:48px; margin-bottom:12px;">🏆</div>
          <h3 style="font-family:var(--font-heading); font-size:24px;">No Champions Recorded Yet</h3>
          <p style="color:var(--text-muted); margin-top:8px;">يرجى العودة إلى لوحة المسابقة وتحديد الفائزين المتأهلين.</p>
        </div>
      `;
      return;
    }

    champions.forEach(champ => {
      const card = document.createElement('div');
      card.className = 'champion-card';
      const encodedFilePath = encodeURI(champ.file);
      const arHtml = champ.name_ar ? `<div class="champion-name-ar">${champ.name_ar}</div>` : '';

      card.innerHTML = `
        <div class="champion-crown-tag">👑</div>
        <div class="champion-photo-frame">
          <img src="${encodedFilePath}" alt="${champ.name}">
          <div class="champion-ribbon">🏆 CHAMPION 2026</div>
        </div>
        <div class="champion-card-body">
          <div class="champion-name">${champ.name}</div>
          ${arHtml}
          <div class="champion-meta-row">
            <span class="champion-grade-badge">Grade ${champ.grade}</span>
            <span class="champion-section-tag">${champ.section}</span>
          </div>
        </div>
      `;
      ceremonyChampionsGrid.appendChild(card);
    });
  }

  function playCeremonyFanfare() {
    launchCeremonyConfetti();

    // Play triumphant audio from winnerVideo
    winnerVideo.currentTime = 0;
    winnerVideo.muted = !isSoundEnabled;
    winnerVideo.volume = 1.0;
    winnerVideo.play().catch(() => {});
  }

  function closeCeremonyView() {
    stopCeremonyConfetti();
    winnerVideo.pause();
    winnerVideo.currentTime = 0;
    ceremonyView.style.display = 'none';
    dashboardView.style.display = 'block';

    if (dashboardBgVideo) {
      dashboardBgVideo.play().catch(() => {});
    }

    renderDashboard();
  }

  // --- RESET COMPETITION ---
  function resetCompetition() {
    modalResetConfirm.style.display = 'flex';
  }

  function confirmResetCompetition() {
    modalResetConfirm.style.display = 'none';
    try {
      localStorage.removeItem(COMPETITION_STORAGE_KEY);
    } catch (e) {}

    competitionState = {
      isActive: false,
      currentRound: 1,
      activeSpellerIds: [],
      currentRoundWinners: [],
      winnersByRound: {},
      isCompleted: false
    };

    spellers = allSpellers;
    renderDashboard();

    showToast('🔄 تمت إعادة ضبط المسابقة بنجاح واستعادة جميع الطلاب (68 متسابقاً)', '🔄');
  }

  // --- START COMPETITION MODE ---
  function startCompetition() {
    competitionState.isActive = true;
    competitionState.currentRound = 1;
    competitionState.activeSpellerIds = allSpellers.map(s => s.id);
    competitionState.currentRoundWinners = [];
    competitionState.winnersByRound = {};
    competitionState.isCompleted = false;

    saveCompetitionState();
    renderDashboard();

    showToast('🎯 تم تفعيل وضع المسابقة الرسمي - الجولة الأولى (Round 1)', '🚀');
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
          v_texCoord = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
        }
      `;

      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        uniform sampler2D u_photo;
        uniform vec4 u_box;
        varying vec2 v_texCoord;

        void main() {
          vec4 vidColor = texture2D(u_video, v_texCoord);

          bool inFrameBox = (v_texCoord.x >= u_box.x && v_texCoord.x <= (u_box.x + u_box.z) &&
                             v_texCoord.y >= u_box.y && v_texCoord.y <= (u_box.y + u_box.w));

          if (inFrameBox) {
            float r = vidColor.r;
            float g = vidColor.g;
            float b = vidColor.b;

            float maxRB = max(r, b);
            float diff = g - maxRB;

            float isGreen = clamp((diff - 0.07) / (0.22 - 0.07), 0.0, 1.0);

            if (isGreen > 0.01) {
              float u = (v_texCoord.x - u_box.x) / u_box.z;
              float v = (v_texCoord.y - u_box.y) / u_box.w;

              vec4 photoColor = texture2D(u_photo, vec2(u, v));

              vec3 despilledVid = vidColor.rgb;
              if (g > maxRB) {
                despilledVid.g = maxRB;
              }

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
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webglFrameVideo);

        gl.useProgram(webglProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.uniform1i(gl.getUniformLocation(webglProgram, 'u_video'), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, photoTexture);
        gl.uniform1i(gl.getUniformLocation(webglProgram, 'u_photo'), 1);

        gl.uniform4f(gl.getUniformLocation(webglProgram, 'u_box'), 0.5828, 0.1583, 0.2883, 0.6681);

        gl.viewport(0, 0, stageCanvas.width, stageCanvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } catch (err) {
        console.warn('WebGL render error (falling back to CSS):', err);
        enableCssFallback();
      }
    }

    animationFrameId = requestAnimationFrame(renderStageLoop);
  }

  // --- CELEBRATION CONFETTI ENGINE (STAGE) ---
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

  // --- CELEBRATION CONFETTI ENGINE (CEREMONY) ---
  let ceremonyConfettiAnimId = null;
  let ceremonyParticles = [];

  function launchCeremonyConfetti() {
    if (!ceremonyConfettiCanvas) return;
    const ctx = ceremonyConfettiCanvas.getContext('2d');
    ceremonyConfettiCanvas.width = window.innerWidth;
    ceremonyConfettiCanvas.height = window.innerHeight;
    ceremonyParticles = [];

    const colors = ['#ffd700', '#f3e5ab', '#ffb703', '#ffffff', '#e63946', '#10b981', '#3b82f6'];
    for (let i = 0; i < 200; i++) {
      ceremonyParticles.push({
        x: Math.random() * ceremonyConfettiCanvas.width,
        y: Math.random() * -ceremonyConfettiCanvas.height,
        w: Math.random() * 14 + 6,
        h: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 5 + 3,
        vx: (Math.random() - 0.5) * 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    function drawCeremony() {
      ctx.clearRect(0, 0, ceremonyConfettiCanvas.width, ceremonyConfettiCanvas.height);
      ceremonyParticles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotSpeed;

        if (p.y > ceremonyConfettiCanvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * ceremonyConfettiCanvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      ceremonyConfettiAnimId = requestAnimationFrame(drawCeremony);
    }

    if (ceremonyConfettiAnimId) cancelAnimationFrame(ceremonyConfettiAnimId);
    ceremonyConfettiAnimId = requestAnimationFrame(drawCeremony);
  }

  function stopCeremonyConfetti() {
    if (ceremonyConfettiAnimId) {
      cancelAnimationFrame(ceremonyConfettiAnimId);
      ceremonyConfettiAnimId = null;
    }
    if (ceremonyConfettiCanvas) {
      const ctx = ceremonyConfettiCanvas.getContext('2d');
      ctx.clearRect(0, 0, ceremonyConfettiCanvas.width, ceremonyConfettiCanvas.height);
    }
  }

  // --- AUDIO TOGGLE ---
  function toggleAudio() {
    isSoundEnabled = !isSoundEnabled;

    webglFrameVideo.muted = true;
    webglFrameVideo.volume = 0;
    cssFrameVideo.muted = true;
    cssFrameVideo.volume = 0;

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

  // --- MODALS & TOAST HELPERS ---
  function showToast(message, icon = '✨') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:18px;">${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
  }

  function showAlertModal(title, message, icon = 'ℹ️') {
    if (modalAlertTitle) modalAlertTitle.textContent = title;
    if (modalAlertMsg) modalAlertMsg.textContent = message;
    if (modalAlertIcon) modalAlertIcon.textContent = icon;
    if (modalAlert) modalAlert.style.display = 'flex';
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

    // Competition Mode Controls
    if (btnStartCompetition) {
      btnStartCompetition.addEventListener('click', startCompetition);
    }

    if (btnAddRound) {
      btnAddRound.addEventListener('click', advanceRound);
    }

    if (btnCompleteRounds) {
      btnCompleteRounds.addEventListener('click', completeRounds);
    }

    if (btnResetCompetition) {
      btnResetCompetition.addEventListener('click', resetCompetition);
    }

    // Modal Action Listeners
    if (btnCancelReset) {
      btnCancelReset.addEventListener('click', () => { modalResetConfirm.style.display = 'none'; });
    }
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', confirmResetCompetition);
    }

    if (btnCancelAddRound) {
      btnCancelAddRound.addEventListener('click', () => { modalAddRoundConfirm.style.display = 'none'; });
    }
    if (btnConfirmAddRound) {
      btnConfirmAddRound.addEventListener('click', confirmAdvanceRound);
    }

    if (btnCancelComplete) {
      btnCancelComplete.addEventListener('click', () => { modalCompleteConfirm.style.display = 'none'; });
    }
    if (btnConfirmComplete) {
      btnConfirmComplete.addEventListener('click', confirmCompleteRounds);
    }

    if (btnAlertOk) {
      btnAlertOk.addEventListener('click', () => { modalAlert.style.display = 'none'; });
    }

    // WINNER Button Click
    btnWinner.addEventListener('click', triggerWinner);

    // UNDO Winner Button Click (on stage)
    if (btnUndoWinner) {
      btnUndoWinner.addEventListener('click', () => {
        const currentSpeller = spellers[currentSpellerIndex];
        if (currentSpeller) {
          toggleWinner(currentSpeller.id, false);
          resetWinnerEffects();
        }
      });
    }

    // END Button Click
    btnEnd.addEventListener('click', endStage);

    // Prev / Next Speller on Stage
    btnPrevSpeller.addEventListener('click', () => {
      if (currentSpellerIndex > 0) {
        currentSpellerIndex--;
      } else {
        currentSpellerIndex = spellers.length - 1;
      }
      resetWinnerEffects();
      updateStageContestant(spellers[currentSpellerIndex]);
    });

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

    // Floating Scroll to Top Button
    const btnScrollToTop = document.getElementById('btnScrollToTop');
    if (btnScrollToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 280) {
          btnScrollToTop.classList.add('visible');
        } else {
          btnScrollToTop.classList.remove('visible');
        }
      }, { passive: true });

      btnScrollToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Ceremony Actions
    if (btnCeremonyFanfare) {
      btnCeremonyFanfare.addEventListener('click', playCeremonyFanfare);
    }
    if (btnCeremonyFullscreen) {
      btnCeremonyFullscreen.addEventListener('click', toggleFullscreen);
    }
    if (btnCeremonyPrint) {
      btnCeremonyPrint.addEventListener('click', () => { window.print(); });
    }
    if (btnCeremonyBack) {
      btnCeremonyBack.addEventListener('click', closeCeremonyView);
    }

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
      } else if (ceremonyView && ceremonyView.style.display !== 'none') {
        if (e.key === 'Escape') {
          closeCeremonyView();
        } else if (e.key === 'f' || e.key === 'F') {
          toggleFullscreen();
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

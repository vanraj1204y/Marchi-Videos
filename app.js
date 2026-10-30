/**
 * Chili Agro Farm (ચીલી એગ્રો ફાર્મ)
 * Clean Direct Video Showcase Controller (No Filters - All Videos Displayed)
 */

// Application State
const state = {
  lang: 'gu', // default Gujarati
  viewMode: 'standard',
  currentVideoIndex: -1,
  videos: [],
  isLooping: false,
  autoPlayNext: true
};

// Gujarati Number Converter
function toGuNum(num) {
  const mapping = {'0':'૦', '1':'૧', '2':'૨', '3':'૩', '4':'૪', '5':'૫', '6':'૬', '7':'૭', '8':'૮', '9':'૯'};
  return String(num).split('').map(ch => mapping[ch] || ch).join('');
}

// Localization Dictionary
const i18n = {
  gu: {
    brandName: "Chili Agro Farm",
    brandTagline: "ચીલી એગ્રો ફાર્મ • ખેતર વિડિયો ગેલેરી",
    btnFarmInfo: "ફાર્મ વિશે",
    heroPill: "🌱 આધુનિક ટપક સિંચાઈ પદ્ધતિ અને ખેતર દર્શન",
    heroHeading: "Chili Agro Farm: વાવણીથી સમૃદ્ધ લણણી સુધીનું જીવંત દર્શન",
    heroDesc: "ખેતરથી સીધા કેમેરાની નજરે: લીલા અને લાલ મરચાંના છોડની રોપણી, ફૂલ, ફાલ અને ભરપૂર ઉત્પાદનના તમામ ઓરિજિનલ ખેતર વિડિયોનું જીવંત દર્શન.",
    lblVideos: "કુલ ખેતર વિડિયો",
    valCrop: "તીખાં લીલાં મરચાં",
    lblCrop: "હાઇબ્રિડ અને દેશી જાત",
    lblFast: "ઝડપી લોડિંગ",
    lblHd: "સ્પષ્ટ HD ગુણવત્તા",
    btnPlayAll: "બધા વિડિયો ક્રમશઃ જુઓ",
    btnDownload: "ડાઉનલોડ",
    
    infoModalTitle: "Chili Agro Farm વિશે માહિતી",
    lblFarmCrop: "મુખ્ય પાક",
    lblFarmIrrigation: "સિંચાઈ પદ્ધતિ",
    lblFarmSeason: "પાક મોસમ",
    lblFarmSoil: "જમીનનો પ્રકાર",
    
    bnavHome: "મુખપૃષ્ઠ",
    bnavReels: "રીલ્સ",
    bnavPlayAll: "પ્લે ઓલ",
    bnavInfo: "ફાર્મ માહિતી",
    
    footerQuote: "🌿 આપણી ધરતી, આપણી મહેનત, આપણાં સમૃદ્ધ મરચાં 🌶️",
    footerDesc: "Chili Agro Farm (ચીલી એગ્રો ફાર્મ) - ખેતીની વાસ્તવિક પ્રગતિને વિશ્વ સમક્ષ પ્રસ્તુત કરતી ઓનલાઇન ડિજિટલ વિડિયો ગેલેરી.",
    footerCopyright: "Chili Agro Farm • સર્વ હક્ક સુરક્ષિત © ૨૦૨૬"
  },
  en: {
    brandName: "Chili Agro Farm",
    brandTagline: "Chili Agro Farm • Farm Video Gallery",
    btnFarmInfo: "About Farm",
    heroPill: "🌱 Advanced Drip Irrigation & Farm Showcase",
    heroHeading: "Chili Agro Farm: Sowing to Bountiful Harvest Journey",
    heroDesc: "Direct from the farm fields: Complete visual chronicle of authentic farm videos showcasing chilli plants, flowers, and bumper harvest.",
    lblVideos: "Total Farm Videos",
    valCrop: "Spicy Green Chilli",
    lblCrop: "Hybrid & Native Variety",
    lblFast: "Fast Loading",
    lblHd: "Full HD Quality",
    btnPlayAll: "Play All Sequentially",
    btnDownload: "Download",
    
    infoModalTitle: "About Chili Agro Farm",
    lblFarmCrop: "Primary Crop",
    lblFarmIrrigation: "Irrigation System",
    lblFarmSeason: "Crop Season",
    lblFarmSoil: "Soil Profile",
    
    bnavHome: "Home",
    bnavReels: "Reels",
    bnavPlayAll: "Play All",
    bnavInfo: "Farm Info",
    
    footerQuote: "🌿 Pure Soil, Dedicated Labour, Bountiful Harvest 🌶️",
    footerDesc: "Chili Agro Farm — Digital agriculture showcase sharing real farming progress with the world.",
    footerCopyright: "Chili Agro Farm • All Rights Reserved © 2026"
  }
};

// DOM References
const videoGridEl = document.getElementById('videoGrid');
const statusCounterEl = document.getElementById('statusCounter');
const btnPlayAll = document.getElementById('btnPlayAll');

// Language Buttons
const langGuBtn = document.getElementById('langGu');
const langEnBtn = document.getElementById('langEn');

// Modal Elements
const videoModal = document.getElementById('videoModal');
const modalPlayer = document.getElementById('modalVideoPlayer');
const modalTitle = document.getElementById('modalTitle');
const modalSub = document.getElementById('modalSub');
const modalDate = document.getElementById('modalDate');
const modalDuration = document.getElementById('modalDuration');
const modalSize = document.getElementById('modalSize');
const modalDownload = document.getElementById('modalDownload');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const prevVideoBtn = document.getElementById('prevVideoBtn');
const nextVideoBtn = document.getElementById('nextVideoBtn');
const btnToggleLoop = document.getElementById('btnToggleLoop');
const btnTogglePip = document.getElementById('btnTogglePip');
const btnShareWa = document.getElementById('btnShareWa');

// Farm Info Modal Elements
const farmInfoModal = document.getElementById('farmInfoModal');
const btnOpenFarmInfo = document.getElementById('btnOpenFarmInfo');
const btnCloseFarmInfo = document.getElementById('btnCloseFarmInfo');

// Mobile Bottom Nav Elements
const bnavHome = document.getElementById('bnavHome');
const bnavReels = document.getElementById('bnavReels');
const bnavPlayAll = document.getElementById('bnavPlayAll');
const bnavInfo = document.getElementById('bnavInfo');

// View Mode Buttons
const viewButtons = document.querySelectorAll('.view-btn');

/**
 * Initialize App
 */
function init() {
  if (!window.VIDEOS_DATA || window.VIDEOS_DATA.length === 0) {
    console.error("VIDEOS_DATA missing.");
    return;
  }

  // Load all videos directly from videos_data.js
  state.videos = [...window.VIDEOS_DATA];

  setupEventListeners();
  renderCards();
  updateUIStrings();
}

/**
 * Setup All Event Listeners
 */
function setupEventListeners() {
  // View Mode Toggles
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-view');
      setViewMode(mode);
    });
  });

  // Play All Sequentially
  btnPlayAll.addEventListener('click', () => {
    if (state.videos.length > 0) {
      openModal(0);
    }
  });

  // Language Toggles
  langGuBtn.addEventListener('click', () => switchLanguage('gu'));
  langEnBtn.addEventListener('click', () => switchLanguage('en'));

  // Video Modal Controls
  modalCloseBtn.addEventListener('click', closeModal);
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeModal();
  });

  prevVideoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateVideo(-1);
  });

  nextVideoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateVideo(1);
  });

  // Loop Toggle
  btnToggleLoop.addEventListener('click', () => {
    state.isLooping = !state.isLooping;
    modalPlayer.loop = state.isLooping;
    btnToggleLoop.style.background = state.isLooping ? 'var(--emerald-primary)' : '';
    btnToggleLoop.style.color = state.isLooping ? '#022c16' : '';
  });

  // Picture in Picture
  btnTogglePip.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (modalPlayer.requestPictureInPicture) {
        await modalPlayer.requestPictureInPicture();
      }
    } catch (err) {
      console.log('PiP not supported:', err);
    }
  });

  // When video ends: Auto-play next if not looping
  modalPlayer.addEventListener('ended', () => {
    if (!state.isLooping && state.autoPlayNext) {
      navigateVideo(1);
    }
  });

  // Farm Info Modal
  btnOpenFarmInfo.addEventListener('click', () => farmInfoModal.classList.add('active'));
  btnCloseFarmInfo.addEventListener('click', () => farmInfoModal.classList.remove('active'));
  farmInfoModal.addEventListener('click', (e) => {
    if (e.target === farmInfoModal) farmInfoModal.classList.remove('active');
  });

  // Mobile Bottom Nav
  if (bnavHome) {
    bnavHome.addEventListener('click', () => {
      updateBnavActive(bnavHome);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (bnavReels) {
    bnavReels.addEventListener('click', () => {
      updateBnavActive(bnavReels);
      setViewMode('reels');
      document.getElementById('controlsBar').scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (bnavPlayAll) {
    bnavPlayAll.addEventListener('click', () => {
      updateBnavActive(bnavPlayAll);
      if (state.videos.length > 0) openModal(0);
    });
  }
  if (bnavInfo) {
    bnavInfo.addEventListener('click', () => {
      updateBnavActive(bnavInfo);
      farmInfoModal.classList.add('active');
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!videoModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') navigateVideo(-1);
    else if (e.key === 'ArrowRight') navigateVideo(1);
    else if (e.key === ' ') {
      e.preventDefault();
      modalPlayer.paused ? modalPlayer.play() : modalPlayer.pause();
    }
  });
}

function updateBnavActive(activeItem) {
  document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
  if (activeItem) activeItem.classList.add('active');
}

/**
 * Set View Mode (Standard / Compact / Reels)
 */
function setViewMode(mode) {
  state.viewMode = mode;
  viewButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
  videoGridEl.className = `video-grid ${mode === 'standard' ? '' : mode}`;
}

/**
 * Switch Language
 */
function switchLanguage(lang) {
  state.lang = lang;
  langGuBtn.classList.toggle('active', lang === 'gu');
  langEnBtn.classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang;

  updateUIStrings();
  renderCards();

  if (videoModal.classList.contains('active') && state.currentVideoIndex >= 0) {
    updateModalDetails(state.videos[state.currentVideoIndex]);
  }
}

/**
 * Update UI Localization & Dynamic Count
 */
function updateUIStrings() {
  const isGu = state.lang === 'gu';
  const t = i18n[state.lang];
  const countDisplay = isGu ? toGuNum(state.videos.length) : String(state.videos.length);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  // Dynamic Video Counters
  const valVideosEl = document.querySelector('[data-i18n="valVideos"]');
  if (valVideosEl) {
    valVideosEl.textContent = isGu ? `${countDisplay} વિડિયો` : `${countDisplay} Videos`;
  }

  const allHeadingEl = document.querySelector('[data-i18n="allVideosHeading"]');
  if (allHeadingEl) {
    allHeadingEl.textContent = isGu ? `તમામ ખેતર વિડિયો (${countDisplay})` : `All Farm Videos (${countDisplay})`;
  }
}

/**
 * Render All Video Cards Directly
 */
function renderCards() {
  const isGu = state.lang === 'gu';
  const html = state.videos.map((v, index) => {
    const title = isGu ? v.titleGu : v.titleEn;
    const dateFormatted = isGu ? v.dateFormattedGu : v.dateFormattedEn;

    return `
      <div class="video-card" onclick="openModal(${index})" data-index="${index}">
        <div class="card-media">
          <img src="${v.thumbSrc}" alt="${title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'">
          
          <div class="overlay-top-left">
            <span>HD</span> ${v.width}x${v.height}
          </div>
          
          <div class="overlay-top-right">
            <span class="badge-size">${v.sizeMb}</span>
          </div>

          <div class="overlay-bottom-right">
            ⏱️ ${v.durationFormatted}
          </div>

          <div class="center-play-ring">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>

        <div class="card-info">
          <h3 class="card-title-text">${title}</h3>
          <div class="card-footer-meta">
            <span class="meta-date-txt">📅 ${dateFormatted}</span>
            <span class="meta-aspect-tag">${v.aspect === 'vertical' ? '9:16' : '16:9'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  videoGridEl.innerHTML = html;
}

/**
 * Open Video Modal
 */
window.openModal = function(index) {
  if (index < 0 || index >= state.videos.length) return;
  state.currentVideoIndex = index;
  const video = state.videos[index];

  updateModalDetails(video);
  modalPlayer.src = video.videoSrc;
  modalPlayer.loop = state.isLooping;
  videoModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  modalPlayer.play().catch(e => {
    console.log("Autoplay blocked or waiting:", e);
  });
};

/**
 * Update Modal Content
 */
function updateModalDetails(video) {
  const isGu = state.lang === 'gu';
  const title = isGu ? video.titleGu : video.titleEn;
  const dateFormatted = isGu ? video.dateFormattedGu : video.dateFormattedEn;

  modalTitle.textContent = title;
  modalSub.textContent = `${video.filename} • ${video.width} x ${video.height}`;
  
  modalDate.textContent = `📅 ${dateFormatted}`;
  modalDuration.textContent = `⏱️ ${video.durationFormatted} (${video.durationSec}s)`;
  modalSize.textContent = `💾 ${video.sizeMb}`;

  modalDownload.href = video.videoSrc;
  modalDownload.setAttribute('download', video.filename);

  // WhatsApp Share URL
  const shareText = encodeURIComponent(`🌶️ Chili Agro Farm (ચીલી એગ્રો ફાર્મ) - વિડિયો દર્શન:\n${title}\nતારીખ: ${dateFormatted}`);
  btnShareWa.href = `https://api.whatsapp.com/send?text=${shareText}`;
}

/**
 * Navigate Previous / Next Video
 */
function navigateVideo(direction) {
  const newIndex = state.currentVideoIndex + direction;
  if (newIndex >= 0 && newIndex < state.videos.length) {
    openModal(newIndex);
  } else if (newIndex >= state.videos.length && state.autoPlayNext) {
    openModal(0);
  }
}

/**
 * Close Modal
 */
function closeModal() {
  videoModal.classList.remove('active');
  modalPlayer.pause();
  modalPlayer.src = '';
  document.body.style.overflow = '';
  state.currentVideoIndex = -1;
}

// Start
document.addEventListener('DOMContentLoaded', init);

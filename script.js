const DEFAULT_SOUNDS = [
  {
    id: 'm87',
    title: 'Черная дыра M87 (сонфикация)',
    description: 'Сверхмассивная черная дыра в M87, переведенная в слышимый диапазон.',
    audioUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/audio/sonify4_m87.mp3',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/',
    type: 'Черная дыра',
    icon: 'fa-solid fa-circle-dot',
    tag: 'M87',
    history: [
      { date: '2021', title: 'Публикация', detail: 'Chandra публикует серию sonify4.' },
      { date: 'Этап 2', title: 'Сонфикация', detail: 'Рентгеновские данные переведены в звук.' },
      { date: 'Этап 3', title: 'ИИ-анализ', detail: 'Модель интерпретирует спектр и метаданные.' }
    ],
    facts: ['Объект: M87', 'Тип: сверхмассивный объект', 'Источник: Chandra']
  },
  {
    id: 'tycho',
    title: 'Остаток сверхновой Тихо',
    description: 'Сонфикация рентгеновского излучения остатка сверхновой Tycho.',
    audioUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/audio/sonify4_tycho.mp3',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/',
    type: 'Сверхновая',
    icon: 'fa-solid fa-burst',
    tag: 'Tycho',
    history: [
      { date: '2021', title: 'Публикация', detail: 'Sonify4: визуализация и звук для астрономических объектов.' },
      { date: 'Этап 2', title: 'Сонфикация', detail: 'Данные преобразованы в аудио.' },
      { date: 'Этап 3', title: 'ИИ-анализ', detail: 'ИИ объясняет физику сигнала.' }
    ],
    facts: ['Объект: остаток сверхновой', 'Тип: рентген', 'Источник: Chandra']
  },
  {
    id: 'white-dwarf',
    title: 'Белый карлик (сонфикация)',
    description: 'Сонфикация данных белого карлика, показывающая структурные изменения.',
    audioUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/audio/sonify4_wd2.mp3',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/sonify4/',
    type: 'Белый карлик',
    icon: 'fa-solid fa-star',
    tag: 'WD',
    history: [
      { date: '2021', title: 'Публикация', detail: 'Chandra Sonify4.' },
      { date: 'Этап 2', title: 'Сонфикация', detail: 'Астрономические данные переведены в звук.' },
      { date: 'Этап 3', title: 'ИИ-анализ', detail: 'ИИ помогает прочитать структуру сигнала.' }
    ],
    facts: ['Объект: белый карлик', 'Источник: Chandra', 'Тип: сонфикация']
  },
  {
    id: 'cats-eye',
    title: 'Туманность Кошачий глаз',
    description: 'Сонфикация планетарной туманности Cat’s Eye.',
    audioUrl: 'https://chandra.harvard.edu/photo/2021/sonify3/audio/sonify3_catseye_comp.mp3',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/sonify3/',
    type: 'Туманность',
    icon: 'fa-solid fa-cloud',
    tag: 'Cat\'s Eye',
    history: [
      { date: '2021', title: 'Публикация', detail: 'Chandra Sonify3.' },
      { date: 'Этап 2', title: 'Сонфикация', detail: 'Изображение и спектр переводятся в звук.' },
      { date: 'Этап 3', title: 'ИИ-анализ', detail: 'ИИ делает научный разбор.' }
    ],
    facts: ['Объект: планетарная туманность', 'Источник: Chandra', 'Тип: сонфикация']
  },
  {
    id: 'm51',
    title: 'Галактика M51 (Водоворот)',
    description: 'Сонфикация структуры галактики M51 (Whirlpool).',
    audioUrl: 'https://chandra.harvard.edu/photo/2021/sonify3/audio/sonify3_m51_comp.mp3',
    sourceUrl: 'https://chandra.harvard.edu/photo/2021/sonify3/',
    type: 'Галактика',
    icon: 'fa-solid fa-galaxy',
    tag: 'M51',
    history: [
      { date: '2021', title: 'Публикация', detail: 'Chandra Sonify3.' },
      { date: 'Этап 2', title: 'Сонфикация', detail: 'Форма и интенсивность становятся звуком.' },
      { date: 'Этап 3', title: 'ИИ-анализ', detail: 'ИИ формирует научное объяснение.' }
    ],
    facts: ['Объект: галактика M51', 'Источник: Chandra', 'Тип: сонфикация']
  }
];

const API_BASE = (document.body && document.body.dataset ? document.body.dataset.apiBase : '') || '';
const API_ROOT = API_BASE.trim().replace(/\/$/, '');
const apiUrl = (path) => (API_ROOT ? `${API_ROOT}${path}` : path);

const elements = {
  soundsGrid: document.getElementById('soundsGrid'),
  loadingSounds: document.getElementById('loadingSounds'),
  audioPlayer: document.getElementById('audioPlayer'),
  playBtn: document.getElementById('playBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  stopBtn: document.getElementById('stopBtn'),
  volumeSlider: document.getElementById('volumeSlider'),
  progressBar: document.getElementById('progressBar'),
  currentTimeEl: document.getElementById('currentTime'),
  totalTimeEl: document.getElementById('totalTime'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  aiTranscript: document.getElementById('aiTranscript'),
  aiExplanation: document.getElementById('aiExplanation'),
  aiInsights: document.getElementById('aiInsights'),
  aiStatus: document.getElementById('aiStatus'),
  aiStatusText: document.getElementById('aiStatusText'),
  trackTitle: document.getElementById('trackTitle'),
  trackDesc: document.getElementById('trackDesc'),
  trackType: document.getElementById('trackType'),
  trackSource: document.getElementById('trackSource'),
  trackAudio: document.getElementById('trackAudio'),
  waveCanvas: document.getElementById('waveCanvas'),
  bars: document.getElementById('bars'),
  keyStatus: document.getElementById('keyStatus'),
  nasaGallery: document.getElementById('nasaGallery'),
  featureEnergy: document.getElementById('featureEnergy'),
  featureBand: document.getElementById('featureBand'),
  featurePeak: document.getElementById('featurePeak'),
  jumpToSounds: document.getElementById('jumpToSounds'),
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  searchReset: document.getElementById('searchReset'),
  searchStatus: document.getElementById('searchStatus'),
  historyTimeline: document.getElementById('historyTimeline'),
  historyFacts: document.getElementById('historyFacts')
};

let currentSound = null;
let activeSounds = [...DEFAULT_SOUNDS];
let audioContext = null;
let analyser = null;
let sourceNode = null;
let timeData = null;
let freqData = null;
let bars = [];
let animationId = null;
let lastFeatureUpdate = 0;
let visualizerBlocked = false;
let healthSnapshot = { nasa_api: 'unknown', gemini_api: 'unknown', openai_api: 'unknown' };
let backendAvailable = true;

const BAR_COUNT = 28;

window.addEventListener('DOMContentLoaded', () => {
  loadDefaultSounds();
  setupPlayer();
  setupVisualizer();
  setupSearch();
  loadNasaGallery();
  setupJump();
  checkHealth();
});

function setupJump() {
  if (!elements.jumpToSounds) return;
  elements.jumpToSounds.addEventListener('click', () => {
    document.getElementById('sounds').scrollIntoView({ behavior: 'smooth' });
  });
}

function setupSearch() {
  if (!elements.searchInput) return;

  elements.searchBtn.addEventListener('click', () => {
    runSearch();
  });

  elements.searchReset.addEventListener('click', () => {
    resetSearch();
  });

  elements.searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      runSearch();
    }
  });

  document.querySelectorAll('.chip-btn').forEach(button => {
    button.addEventListener('click', () => {
      const query = button.dataset.query || '';
      elements.searchInput.value = query;
      runSearch(query);
    });
  });
}

async function runSearch(forcedQuery) {
  const query = (forcedQuery || elements.searchInput.value || '').trim();
  if (!query) return;

  setSearchStatus(`Ищу аудио NASA по запросу «${query}»...`);
  elements.searchBtn.disabled = true;

  try {
    const response = await fetch(apiUrl(`/nasa-audio-search?q=${encodeURIComponent(query)}`));
    if (!response.ok) {
      throw new Error('NASA архив недоступен');
    }
    const data = await response.json();
    const items = Array.isArray(data) ? data : data.items;

    if (!items || items.length === 0) {
      setSearchStatus('Ничего не найдено. Попробуйте другой запрос.');
      return;
    }

    activeSounds = items
      .map(mapNasaAudioToSound)
      .filter(sound => sound.audioUrl);

    if (activeSounds.length === 0) {
      setSearchStatus('В результатах нет аудиофайлов.');
      return;
    }

    buildSoundCards(activeSounds);
    setSearchStatus(`Найдено ${activeSounds.length} аудио из архива NASA`);
  } catch (error) {
    setSearchStatus('Ошибка загрузки NASA архива.');
  } finally {
    elements.searchBtn.disabled = false;
  }
}

function resetSearch() {
  activeSounds = [...DEFAULT_SOUNDS];
  buildSoundCards(activeSounds);
  setSearchStatus('Показаны избранные записи Chandra');
}

function setSearchStatus(text) {
  if (elements.searchStatus) {
    elements.searchStatus.textContent = text;
  }
}

function mapNasaAudioToSound(item) {
  const nasaId = item.nasa_id || item.id || `nasa-${Math.random().toString(36).slice(2, 8)}`;
  const dateCreated = item.date_created || item.dateCreated || '';
  const keywords = Array.isArray(item.keywords) ? item.keywords : [];

  const sound = {
    id: nasaId,
    title: item.title || 'NASA аудио',
    description: item.description || 'Запись из архива NASA.',
    audioUrl: normalizeAudioUrl(item.audio_url || item.audioUrl),
    sourceUrl: item.source_url || item.sourceUrl,
    type: item.center ? `NASA · ${item.center}` : 'NASA Audio',
    icon: 'fa-solid fa-satellite-dish',
    tag: item.mission || item.center || 'NASA',
    dateCreated,
    keywords,
    center: item.center || '',
    nasaId
  };

  sound.history = buildHistoryFromMetadata(sound);
  sound.facts = buildFactsFromMetadata(sound);
  return sound;
}

function normalizeAudioUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

function buildHistoryFromMetadata(sound) {
  const year = extractYear(sound.dateCreated);
  const timeline = [];

  timeline.push({
    date: year || 'Этап 1',
    title: 'Архив NASA',
    detail: year
      ? `Запись опубликована в архиве NASA в ${year} году.`
      : 'Запись опубликована в архиве NASA.'
  });
  timeline.push({
    date: 'Этап 2',
    title: 'Сонфикация',
    detail: 'Научные данные переведены в слышимый диапазон.'
  });
  timeline.push({
    date: 'Этап 3',
    title: 'ИИ-анализ',
    detail: 'Модель анализирует спектр, метаданные и текст сигнала.'
  });

  return timeline;
}

function buildFactsFromMetadata(sound) {
  const facts = [];
  const year = extractYear(sound.dateCreated);

  if (sound.nasaId) facts.push(`NASA ID: ${sound.nasaId}`);
  if (sound.center) facts.push(`Центр: ${sound.center}`);
  if (year) facts.push(`Год: ${year}`);
  if (sound.type) facts.push(`Тип: ${sound.type}`);

  const keywordFacts = (sound.keywords || []).slice(0, 4).map(keyword => `#${keyword}`);
  return facts.concat(keywordFacts);
}

function extractYear(dateString) {
  if (!dateString) return '';
  const match = String(dateString).match(/\d{4}/);
  return match ? match[0] : '';
}

function buildSoundCards(sounds) {
  elements.soundsGrid.innerHTML = '';

  sounds.forEach(sound => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'sound-card';
    card.innerHTML = `
      <div class="sound-icon"><i class="${sound.icon}"></i></div>
      <div class="sound-title">${sound.title}</div>
      <div class="sound-desc">${sound.description}</div>
      <div class="sound-tags">
        <span class="tag">${sound.type}</span>
        <span class="tag subtle">${sound.tag}</span>
      </div>
    `;

    card.addEventListener('click', () => selectSound(sound, card));
    elements.soundsGrid.appendChild(card);
  });

  elements.loadingSounds.style.display = 'none';
}

function selectSound(sound, card) {
  currentSound = sound;

  document.querySelectorAll('.sound-card').forEach(item => item.classList.remove('active'));
  card.classList.add('active');

  elements.trackTitle.textContent = sound.title;
  elements.trackDesc.textContent = sound.description;
  elements.trackDesc.dataset.original = sound.description;
  elements.trackType.textContent = `Тип: ${sound.type}`;

  if (sound.sourceUrl) {
    elements.trackSource.href = sound.sourceUrl;
    elements.trackSource.style.display = 'inline-flex';
  } else {
    elements.trackSource.style.display = 'none';
  }

  if (sound.audioUrl && elements.trackAudio) {
    elements.trackAudio.href = buildAudioProxyUrl(sound.audioUrl);
    elements.trackAudio.style.display = 'inline-flex';
  } else if (elements.trackAudio) {
    elements.trackAudio.style.display = 'none';
  }

  if (sound.audioUrl) {
    const safeUrl = buildAudioProxyUrl(sound.audioUrl);
    elements.audioPlayer.src = safeUrl;
    elements.audioPlayer.load();
  }

  elements.playBtn.disabled = !sound.audioUrl;
  elements.pauseBtn.disabled = true;
  elements.stopBtn.disabled = !sound.audioUrl;
  elements.analyzeBtn.disabled = !sound.audioUrl;

  resetProgress();
  updateHistory(sound);
  setAiStatus('Готов к анализу', 'ready');
  renderText(elements.aiTranscript, 'Выберите «Расшифровать сигнал», чтобы получить текст.');
  renderText(elements.aiExplanation, 'ИИ объяснит, что физически происходит в сигнале.');
  elements.aiInsights.innerHTML = '';
}

function updateHistory(sound) {
  const timeline = sound.history || buildHistoryFromMetadata(sound);
  const facts = sound.facts || buildFactsFromMetadata(sound);

  elements.historyTimeline.innerHTML = '';
  timeline.forEach(item => {
    const row = document.createElement('div');
    row.className = 'timeline-item';
    row.innerHTML = `
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-content">
        <h4>${item.title}</h4>
        <p>${item.detail}</p>
      </div>
    `;
    elements.historyTimeline.appendChild(row);
  });

  elements.historyFacts.innerHTML = '';
  if (!facts || facts.length === 0) {
    elements.historyFacts.innerHTML = '<span class="fact-chip">Нет данных</span>';
    return;
  }
  facts.forEach(fact => {
    const chip = document.createElement('span');
    chip.className = 'fact-chip';
    chip.textContent = fact;
    elements.historyFacts.appendChild(chip);
  });
}

function setupPlayer() {
  elements.playBtn.addEventListener('click', async () => {
    try {
      await elements.audioPlayer.play();
      elements.playBtn.disabled = true;
      elements.pauseBtn.disabled = false;
      startVisualizer();
    } catch (error) {
      handlePlaybackError(error);
    }
  });

  elements.pauseBtn.addEventListener('click', () => {
    elements.audioPlayer.pause();
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    stopVisualizer();
  });

  elements.stopBtn.addEventListener('click', () => {
    elements.audioPlayer.pause();
    elements.audioPlayer.currentTime = 0;
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    stopVisualizer();
  });

  elements.volumeSlider.addEventListener('input', (event) => {
    elements.audioPlayer.volume = event.target.value / 100;
  });
  elements.audioPlayer.volume = elements.volumeSlider.value / 100;

  elements.audioPlayer.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(elements.audioPlayer.duration)) {
      elements.progressBar.max = elements.audioPlayer.duration;
      elements.totalTimeEl.textContent = formatTime(elements.audioPlayer.duration);
    }
  });

  elements.audioPlayer.addEventListener('timeupdate', () => {
    elements.progressBar.value = elements.audioPlayer.currentTime;
    elements.currentTimeEl.textContent = formatTime(elements.audioPlayer.currentTime);
  });

  elements.progressBar.addEventListener('input', (event) => {
    elements.audioPlayer.currentTime = event.target.value;
  });

  elements.audioPlayer.addEventListener('ended', () => {
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    stopVisualizer();
  });

  elements.audioPlayer.addEventListener('error', () => {
    const mediaError = elements.audioPlayer.error;
    const message = mediaError ? `Ошибка аудио: код ${mediaError.code}` : 'Ошибка аудио.';
    handlePlaybackError(new Error(message));
  });

  elements.analyzeBtn.addEventListener('click', analyzeCurrentSound);
}

function setupVisualizer() {
  resizeCanvas();
  createBars(BAR_COUNT);
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = elements.waveCanvas.getBoundingClientRect();
  elements.waveCanvas.width = rect.width * dpr;
  elements.waveCanvas.height = rect.height * dpr;
  const ctx = elements.waveCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createBars(count) {
  elements.bars.innerHTML = '';
  bars = [];
  for (let i = 0; i < count; i += 1) {
    const bar = document.createElement('span');
    bar.className = 'bar';
    elements.bars.appendChild(bar);
    bars.push(bar);
  }
}

function startVisualizer() {
  if (visualizerBlocked) {
    return;
  }
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      sourceNode = audioContext.createMediaElementSource(elements.audioPlayer);
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
      timeData = new Uint8Array(analyser.frequencyBinCount);
      freqData = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      visualizerBlocked = true;
      setPlayerNotice('Спектр недоступен из-за ограничений источника. Аудио всё равно должно играть.');
      return;
    }
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (!animationId) {
    animate();
  }
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function animate() {
  const ctx = elements.waveCanvas.getContext('2d');
  animationId = requestAnimationFrame(animate);

  if (!analyser) return;

  analyser.getByteTimeDomainData(timeData);
  analyser.getByteFrequencyData(freqData);

  drawWaveform(ctx, timeData);
  updateBars(freqData);

  const now = performance.now();
  if (now - lastFeatureUpdate > 900) {
    const features = calcFeatures(freqData);
    if (features) {
      updateFeaturePills(features);
    }
    lastFeatureUpdate = now;
  }
}

function drawWaveform(ctx, data) {
  const width = elements.waveCanvas.clientWidth;
  const height = elements.waveCanvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(8, 14, 28, 0.4)';
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(67, 255, 210, 0.8)';
  ctx.beginPath();

  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i += 1) {
    const v = data[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function updateBars(data) {
  const step = Math.floor(data.length / bars.length);
  bars.forEach((bar, index) => {
    const value = data[index * step] || 0;
    const percent = Math.max(10, Math.min(100, (value / 255) * 100));
    bar.style.height = `${percent}%`;
  });
}

function resetProgress() {
  elements.progressBar.value = 0;
  elements.currentTimeEl.textContent = '00:00';
  elements.totalTimeEl.textContent = '00:00';
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function setAiStatus(text, state) {
  elements.aiStatusText.textContent = text;
  elements.aiStatus.classList.remove('ready', 'working', 'error');
  if (state) {
    elements.aiStatus.classList.add(state);
  }
}

function renderText(container, text) {
  container.innerHTML = '';
  if (!text) return;
  const parts = String(text).split(/\n+/).map(part => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    container.textContent = text;
    return;
  }
  parts.forEach(part => {
    const paragraph = document.createElement('p');
    paragraph.textContent = part;
    container.appendChild(paragraph);
  });
}

function appendDisclaimer(container, text) {
  if (!text) return;
  const note = document.createElement('p');
  note.className = 'ai-note';
  note.textContent = text;
  container.appendChild(note);
}

function renderInsights(items) {
  elements.aiInsights.innerHTML = '';
  if (!Array.isArray(items)) return;
  items.slice(0, 4).forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'insight';
    chip.textContent = item;
    elements.aiInsights.appendChild(chip);
  });
}

function calcFeatures(data) {
  if (!data || data.length === 0) return null;
  const total = data.length;
  let sum = 0;
  let peak = 0;

  for (let i = 0; i < total; i += 1) {
    const value = data[i];
    sum += value;
    if (value > peak) peak = value;
  }

  const avg = sum / total;
  const energy = Math.round((avg / 255) * 100);
  const peakPct = Math.round((peak / 255) * 100);

  const third = Math.floor(total / 3);
  const low = averageBand(data, 0, third);
  const mid = averageBand(data, third, third * 2);
  const high = averageBand(data, third * 2, total);

  let band = 'средний';
  if (low >= mid && low >= high) band = 'низкий';
  if (high >= mid && high >= low) band = 'высокий';

  return {
    energy,
    peak: peakPct,
    band,
    low: Math.round((low / 255) * 100),
    mid: Math.round((mid / 255) * 100),
    high: Math.round((high / 255) * 100)
  };
}

function averageBand(data, start, end) {
  let sum = 0;
  let count = 0;
  for (let i = start; i < end; i += 1) {
    sum += data[i];
    count += 1;
  }
  return count ? sum / count : 0;
}

function updateFeaturePills(features) {
  elements.featureEnergy.textContent = `Энергия: ${features.energy}%`;
  elements.featurePeak.textContent = `Пик: ${features.peak}%`;
  elements.featureBand.textContent = `Спектр: ${features.band}`;
}

function collectSignalSnapshot() {
  if (!analyser || !freqData) return null;
  analyser.getByteFrequencyData(freqData);
  return calcFeatures(freqData);
}

async function analyzeCurrentSound() {
  if (!currentSound) {
    alert('Сначала выберите звук из списка.');
    return;
  }

  if (!API_ROOT && backendAvailable === false) {
    setAiStatus('Сервер анализа недоступен', 'error');
    renderText(elements.aiExplanation, 'На хостинге нет backend. Нужен сервер Flask или отдельный API.');
    return;
  }

  if (healthSnapshot.status === 'online' && healthSnapshot.gemini_api !== 'configured') {
    setAiStatus('Gemini API не подключен', 'error');
    renderText(elements.aiExplanation, 'Проверьте переменную GEMINI_API_KEY в .env и перезапустите сервер.');
    return;
  }

  setAiStatus('Анализирую сигнал…', 'working');
  elements.analyzeBtn.disabled = true;
  renderText(elements.aiTranscript, 'ИИ расшифровывает сигнал…');
  renderText(elements.aiExplanation, 'Генерируется научное объяснение…');
  elements.aiInsights.innerHTML = '';

  const payload = {
    sound_name: currentSound.title,
    sound_description: currentSound.description,
    sound_type: currentSound.type,
    sound_source: currentSound.sourceUrl || 'NASA',
    audio_url: currentSound.audioUrl,
    date_created: currentSound.dateCreated,
    center: currentSound.center,
    nasa_id: currentSound.nasaId,
    keywords: currentSound.keywords,
    duration: Number.isFinite(elements.audioPlayer.duration)
      ? Math.round(elements.audioPlayer.duration)
      : null,
    features: collectSignalSnapshot()
  };

  try {
    const response = await fetch(apiUrl('/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch (parseError) {
      data = null;
    }

    if (!response.ok) {
      const serverMessage = data && data.error ? data.error : 'Сервер анализа недоступен';
      throw new Error(serverMessage);
    }

    if (!data) {
      throw new Error('Сервер вернул пустой ответ');
    }

    if (!data.success) {
      throw new Error(data.error || 'Не удалось получить анализ');
    }

    const structured = data.structured || null;
    if (structured) {
      renderText(elements.aiTranscript, structured.transcript || data.analysis);
      renderText(elements.aiExplanation, structured.explanation || data.analysis);
      appendDisclaimer(elements.aiExplanation, structured.disclaimer);
      renderInsights(structured.insights);
    } else {
      renderText(elements.aiTranscript, data.analysis);
      renderText(elements.aiExplanation, data.analysis);
    }

    setAiStatus('Анализ завершен', 'ready');
  } catch (error) {
    const fallbackMessage = error && error.message ? error.message : 'Произошла ошибка анализа.';
    renderText(elements.aiTranscript, 'Произошла ошибка анализа.');
    renderText(elements.aiExplanation, fallbackMessage);
    setAiStatus('Ошибка анализа', 'error');
  } finally {
    elements.analyzeBtn.disabled = false;
  }
}

async function checkHealth() {
  if (!elements.keyStatus) return;
  if (window.location.protocol === 'file:') {
    elements.keyStatus.textContent = 'Откройте сайт через http://localhost:5000';
    healthSnapshot = { status: 'offline' };
    backendAvailable = false;
    return;
  }
  try {
    const response = await fetch(apiUrl('/health'));
    if (!response.ok) throw new Error('server');
    const data = await response.json();
    healthSnapshot = data;
    backendAvailable = true;
    const nasaOk = data.nasa_api === 'configured';
    const geminiOk = data.gemini_api === 'configured';
    const openaiOk = data.openai_api === 'configured';

    if (nasaOk && geminiOk && openaiOk) {
      elements.keyStatus.textContent = 'Ключи NASA, AI и транскрипции подключены';
    } else if (!nasaOk && !geminiOk) {
      elements.keyStatus.textContent = 'Не найдены ключи NASA и AI';
    } else if (!nasaOk) {
      elements.keyStatus.textContent = 'Не найден ключ NASA API';
    } else if (!geminiOk) {
      elements.keyStatus.textContent = 'Не найден ключ AI API';
    } else if (!openaiOk) {
      elements.keyStatus.textContent = 'Транскрипция не настроена';
    } else {
      elements.keyStatus.textContent = 'Ключи подключены';
    }
  } catch (error) {
    elements.keyStatus.textContent = 'Сервер не запущен';
    healthSnapshot = { status: 'offline' };
    backendAvailable = false;
  }
}

async function loadNasaGallery() {
  try {
    const response = await fetch(apiUrl('/nasa-data'));
    if (!response.ok) throw new Error('api');
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(data.error || 'NASA API недоступен');
    }

    elements.nasaGallery.innerHTML = '';
    data.slice(0, 6).forEach(item => {
      const card = document.createElement('div');
      card.className = 'apod-card';

      const media = document.createElement('div');
      media.className = 'apod-media';

      if (item.media_type === 'image') {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.title || 'NASA APOD';
        media.appendChild(img);
      } else {
        media.innerHTML = '<div class="video-label">Видео</div>';
      }

      const info = document.createElement('div');
      info.className = 'apod-info';
      const title = document.createElement('h4');
      title.textContent = item.title || 'NASA APOD';
      const date = document.createElement('p');
      date.textContent = item.date || '';

      info.appendChild(title);
      info.appendChild(date);
      card.appendChild(media);
      card.appendChild(info);
      elements.nasaGallery.appendChild(card);
    });
  } catch (error) {
    elements.nasaGallery.innerHTML = '<div class="gallery-placeholder">Не удалось загрузить NASA APOD.</div>';
  }
}

function buildAudioProxyUrl(url) {
  if (!url) return '';
  if (url.startsWith('/audio-proxy') || url.includes('/audio-proxy?')) return url;
  if (!API_ROOT && backendAvailable === false) {
    return url;
  }
  return apiUrl(`/audio-proxy?url=${encodeURIComponent(url)}`);
}

function handlePlaybackError(error) {
  const message = humanizePlaybackError(error);
  setAiStatus('Ошибка воспроизведения', 'error');
  setPlayerNotice(message);
}

function humanizePlaybackError(error) {
  const mediaError = elements.audioPlayer.error;
  if (mediaError) {
    if (mediaError.code === 2) {
      return 'Сетевая ошибка при загрузке аудио. Попробуйте другой сигнал.';
    }
    if (mediaError.code === 3) {
      return 'Ошибка декодирования. Формат аудио не поддерживается.';
    }
    if (mediaError.code === 4) {
      return 'Источник не поддерживается или недоступен.';
    }
  }
  if (!error) return 'Не удалось запустить воспроизведение.';
  const name = error.name || '';
  if (name === 'NotAllowedError') {
    return 'Браузер заблокировал воспроизведение. Нажмите Play ещё раз.';
  }
  if (name === 'NotSupportedError') {
    return 'Формат аудио не поддерживается. Выберите другой сигнал.';
  }
  return 'Не удалось запустить воспроизведение. Попробуйте другой источник.';
}

function setPlayerNotice(text) {
  const original = elements.trackDesc.dataset.original || elements.trackDesc.textContent;
  elements.trackDesc.textContent = `${original} • ${text}`;
}

function loadDefaultSounds() {
  activeSounds = [...DEFAULT_SOUNDS];
  buildSoundCards(activeSounds);
  setSearchStatus('Показаны избранные записи Chandra');
}

import { SONGS, ALBUMS, readySongs, albumFor, colorForMidi, MIDI_TO_NAME, NAME_TO_MIDI, NOTE_COLORS } from './songs.js';
import { initStreamPanel } from './stream-panel.js';
import { STACK_LINKS } from './hex-bridge.js';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  song: readySongs()[0] || SONGS.find((s) => s.notes?.length) || SONGS[0],
  albumFilter: localStorage.getItem('pb-album') || 'all',
  albumSort: localStorage.getItem('pb-album-sort') || 'order',
  playing: false,
  beat: 0,
  startTime: 0,
  role: localStorage.getItem('pb-role') || 'kid',
  stars: JSON.parse(localStorage.getItem('pb-stars') || '{}'),
  stickers: JSON.parse(localStorage.getItem('pb-stickers') || '[]'),
  cal: JSON.parse(localStorage.getItem('pb-cal') || JSON.stringify({
    startMidi: 48, endMidi: 72, offsetX: 0, keyWidth: 1, flipH: true, flipV: false, brightness: 1,
  })),
  camCal: JSON.parse(localStorage.getItem('pb-cam-cal') || JSON.stringify({
    left: 0.05, top: 0.55, width: 0.9, height: 0.35,
  })),
  customLessons: JSON.parse(localStorage.getItem('pb-lessons') || '[]'),
  grandmaMsg: '',
  tempoMultiplier: parseFloat(localStorage.getItem('pb-speed-mult') || '1'),
  dockFlipH: localStorage.getItem('pb-dock-flip') === '1',
  phoneRotate: localStorage.getItem('pb-phone-rotate') === '1',
  lastGuideMidi: null,
};

let rafId = null;
let wakeLock = null;
let audioCtx = null;
let cameraStream = null;
let streamPanel = null;

const PX_PER_BEAT = 50;
const SCORE_PAD_X = 28;

function beatToX(beat) {
  return SCORE_PAD_X + beat * PX_PER_BEAT;
}

function scoreContentWidth(song) {
  if (!isPlayable(song)) return 320;
  return Math.max(320, beatToX(songDuration(song)) + 48);
}

// ─── DOM ─────────────────────────────────────────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ─── Init ────────────────────────────────────────────────────────────────────
function init() {
  loadSharedLesson();
  renderAlbumControls();
  renderSongList();
  renderNotation(state.song);
  bindTabs();
  bindControls();
  bindCalibration();
  bindShare();
  bindBuilder();
  updateRoleUI();
  updateStickers();
  initLegend();
  updateDockSong(state.song);
  requestAnimationFrame(() => {
    drawMiniKeyboard();
    resizeKeymap();
    resizePianoRoll();
    syncVisuals(0);
  });
  applyDockView();
  detectPhoneLandscape();
  window.addEventListener('resize', () => {
    resizeKeymap();
    resizePianoRoll();
    detectPhoneLandscape();
    renderNotation(state.song);
    syncVisuals(state.beat);
  });

  streamPanel = initStreamPanel(
    () => state,
    () => activeNotesForStream(state.song, state.beat),
    () => $('#camera-overlay'),
  );

  // Prevent sleep during mirror
  document.addEventListener('visibilitychange', () => {
    if (state.playing && document.visibilityState === 'visible') tryWakeLock();
  });
}

// PLACEHOLDER_TRUNCATED_FOR_SIZE
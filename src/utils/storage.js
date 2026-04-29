// ========================================
// BIOHAZARD RENI - Local Storage Manager
// ========================================

const SLOTS_KEY = 'biohazard_reni_save_slots';

let currentSlotId = null;
let currentSlotData = null;

// Initialize or get all 5 slots
export function getSaveSlots() {
  try {
    let slots = JSON.parse(localStorage.getItem(SLOTS_KEY));
    if (!Array.isArray(slots) || slots.length !== 5) {
      slots = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        empty: true,
        points: 0,
        unlocks: ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'],
        date: null,
      }));
    }
    return slots;
  } catch {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      empty: true,
      points: 0,
      unlocks: ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'],
      date: null,
    }));
  }
}

// Load a slot into memory
export function loadSlot(slotId) {
  const slots = getSaveSlots();
  currentSlotId = slotId;
  currentSlotData = slots[slotId - 1];
  // If it's a new game on an empty slot, we initialize it
  if (currentSlotData.empty) {
    currentSlotData.empty = false;
    currentSlotData.points = 0;
    currentSlotData.unlocks = ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'];
    currentSlotData.date = new Date().toISOString();
    saveCurrentSlot();
  }
}

// Start a new game automatically on the best available slot
export function startNewGameAuto() {
  const slots = getSaveSlots();
  // Find first empty slot
  let targetSlot = slots.find(s => s.empty);
  
  // If no empty slot, find the oldest slot
  if (!targetSlot) {
    targetSlot = slots.reduce((oldest, current) => {
      if (!oldest.date) return oldest;
      if (!current.date) return current;
      return new Date(current.date) < new Date(oldest.date) ? current : oldest;
    }, slots[0]);
  }
  
  newGameOnSlot(targetSlot.id);
}

// Create a new game on a slot (overwrites existing)
export function newGameOnSlot(slotId) {
  const slots = getSaveSlots();
  currentSlotId = slotId;
  currentSlotData = {
    id: slotId,
    empty: false,
    points: 0,
    unlocks: ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'],
    date: new Date().toISOString(),
  };
  slots[slotId - 1] = currentSlotData;
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

// Delete a specific slot
export function deleteSlot(slotId) {
  const slots = getSaveSlots();
  slots[slotId - 1] = {
    id: slotId,
    empty: true,
    points: 0,
    unlocks: ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'],
    date: null,
  };
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  if (currentSlotId === slotId) {
    currentSlotId = null;
    currentSlotData = null;
  }
}

// Save current memory to storage (called during typewriter save)
export function saveCurrentSlot() {
  if (!currentSlotId || !currentSlotData) return;
  const slots = getSaveSlots();
  currentSlotData.date = new Date().toISOString();
  slots[currentSlotId - 1] = currentSlotData;
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

// Save current memory to a SPECIFIC slot
export function saveToSlot(slotId) {
  if (!currentSlotData) return;
  const slots = getSaveSlots();
  // We clone the current memory into the new slot
  const newData = {
    ...currentSlotData,
    id: slotId,
    empty: false,
    date: new Date().toISOString()
  };
  slots[slotId - 1] = newData;
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  // Update memory to now be playing on this slot
  currentSlotId = slotId;
  currentSlotData = newData;
}

// --- Points (SP) ---
export function addPoints(amount) {
  if (!currentSlotData) return;
  currentSlotData.points += amount;
  // Note: we don't save to localStorage immediately, it's done at Typewriter
}

export function getPoints() {
  if (!currentSlotData) return 0;
  return currentSlotData.points;
}

export function deductPoints(amount) {
  if (!currentSlotData) return false;
  if (currentSlotData.points >= amount) {
    currentSlotData.points -= amount;
    return true;
  }
  return false;
}

// --- Unlocks ---
export function getUnlockedCharacters() {
  if (!currentSlotData) return ['RENI', 'AKATI', 'SIZUCHUN', 'KUUU'];
  return currentSlotData.unlocks;
}

export function unlockCharacter(id) {
  if (!currentSlotData) return;
  if (!currentSlotData.unlocks.includes(id)) {
    currentSlotData.unlocks.push(id);
  }
}

export function isCharacterUnlocked(id) {
  if (!currentSlotData) return false;
  return currentSlotData.unlocks.includes(id);
}

// High scores can remain global or be removed since it's slot based now.
// For simplicity, we can keep a global score list just for records if needed,
// but since we moved to slot-based, we'll just ignore global scores for now.
export function saveScore(mode, result) {}

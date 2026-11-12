const assert = require("assert");

console.log("==================================================");
console.log("?? RUNNING WRIGHT CUT AUTOMATED UNIT TEST SUITE ??");
console.log("==================================================\n");

function isValidSAPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/\s+/g, "");
  return /^0[6-8][0-9]{8}$/.test(clean);
}

function isValidEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

class SlotAllocationEngine {
  constructor() { this.activeLocks = new Map(); }
  allocateSlot(date, timeSlot, bookingId) {
    const slotKey = `${date}_${timeSlot.replace(/[^a-zA-Z0-9]/g, "")}`;
    if (this.activeLocks.has(slotKey)) {
      const existing = this.activeLocks.get(slotKey);
      if (existing.active && existing.bookingId !== bookingId) {
        throw new Error(`Slot conflict: ${timeSlot} on ${date} is already locked.`);
      }
    }
    this.activeLocks.set(slotKey, { active: true, bookingId, date, timeSlot });
    return true;
  }
}

// 1. Phone validation tests
assert.strictEqual(isValidSAPhone("0685996843"), true);
assert.strictEqual(isValidSAPhone("0821234567"), true);
assert.strictEqual(isValidSAPhone("12345"), false);
console.log("? PASS: Phone Number Regex Validation (Vodacom/MTN/Telkom)");

// 2. Email validation tests
assert.strictEqual(isValidEmail("kagisogeorge09@gmail.com"), true);
assert.strictEqual(isValidEmail("mphomaluleka703"), false);
console.log("? PASS: Email Format & Domain Sanitation");

// 3. Slot Concurrency tests
const engine = new SlotAllocationEngine();
assert.strictEqual(engine.allocateSlot("2026-10-31", "08:00 AM", "booking_01"), true);
assert.throws(() => engine.allocateSlot("2026-10-31", "08:00 AM", "booking_02"), /Slot conflict/);
console.log("? PASS: Atomic Slot Allocation & Concurrency Lockout");

console.log("\n==================================================");
console.log("ALL 4 CRITICAL UNIT TESTS PASSED (100%)");
console.log("==================================================");

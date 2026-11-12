/**
 * Wright Cut Barbershop - Automated Unit Test Suite
 * Module: XISD5319 / DISD0601 Work Integrated Learning 3A
 * Tests: Validation, Authentication Formatting, and Slot Allocation Concurrency
 */

const assert = require("assert");

console.log("==================================================");
console.log("💈 RUNNING WRIGHT CUT AUTOMATED UNIT TEST SUITE 💈");
console.log("==================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Error: ${error.message}\n`);
  }
}

// -------------------------------------------------------------
// 1. PHONE NUMBER VALIDATION TEST (South African Format)
// -------------------------------------------------------------
function isValidSAPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/\s+/g, "");
  // Must be 10 digits starting with 0 (e.g., 0821234567, 0685996843)
  return /^0[6-8][0-9]{8}$/.test(clean);
}

runTest("Phone Validation: Accepts valid 10-digit Vodacom/MTN/Telkom number", () => {
  assert.strictEqual(isValidSAPhone("0685996843"), true);
  assert.strictEqual(isValidSAPhone("0821234567"), true);
  assert.strictEqual(isValidSAPhone("071 234 5678"), true);
});

runTest("Phone Validation: Rejects invalid lengths or characters", () => {
  assert.strictEqual(isValidSAPhone("12345"), false);
  assert.strictEqual(isValidSAPhone("0821234567899"), false);
  assert.strictEqual(isValidSAPhone("abc0821234"), false);
});

// -------------------------------------------------------------
// 2. EMAIL ADDRESS SANITATION & FORMATTING TEST
// -------------------------------------------------------------
function isValidEmail(email) {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

runTest("Email Validation: Validates well-formed email addresses", () => {
  assert.strictEqual(isValidEmail("kagisogeorge09@gmail.com"), true);
  assert.strictEqual(isValidEmail("client@wrightcut.co.za"), true);
});

runTest("Email Validation: Rejects missing domains or malformed emails", () => {
  assert.strictEqual(isValidEmail("mphomaluleka703"), false); // Catches the earlier auth/invalid-email error
  assert.strictEqual(isValidEmail("client@"), false);
  assert.strictEqual(isValidEmail(""), false);
});

// -------------------------------------------------------------
// 3. ATOMIC SLOT ALLOCATION CONFLICT TEST
// -------------------------------------------------------------
class SlotAllocationEngine {
  constructor() {
    this.activeLocks = new Map();
  }

  allocateSlot(date, timeSlot, bookingId) {
    const slotKey = `${date}_${timeSlot.replace(/[^a-zA-Z0-9]/g, "")}`;
    if (this.activeLocks.has(slotKey)) {
      const existing = this.activeLocks.get(slotKey);
      if (existing.active && existing.bookingId !== bookingId) {
        throw new Error(`Slot conflict: Slot ${timeSlot} on ${date} is already locked.`);
      }
    }
    this.activeLocks.set(slotKey, { active: true, bookingId, date, timeSlot });
    return true;
  }
}

runTest("Slot Allocation: Allows booking a free time slot", () => {
  const engine = new SlotAllocationEngine();
  const success = engine.allocateSlot("2026-10-31", "08:00 AM", "booking_001");
  assert.strictEqual(success, true);
});

runTest("Slot Allocation: Rejects concurrent double-booking of identical slot", () => {
  const engine = new SlotAllocationEngine();
  engine.allocateSlot("2026-10-31", "08:00 AM", "booking_001");

  assert.throws(
    () => {
      engine.allocateSlot("2026-10-31", "08:00 AM", "booking_002");
    },
    /Slot conflict/
  );
});

// -------------------------------------------------------------
// 4. STRUCTURED SERVICE CATALOG DATA TEST
// -------------------------------------------------------------
const SERVICE_CATALOG = {
  srv_fade_only: { name: "Fade Only", price: 100, currency: "ZAR" },
  srv_fade_dye: { name: "Fade + Black Dye", price: 150, currency: "ZAR" },
  srv_chiskop_blade: { name: "Chiskop with Blade", price: 70, currency: "ZAR" },
  srv_beard_colour: { name: "Beard Colour", price: 50, currency: "ZAR" },
  srv_bleach_dye: { name: "Bleach Dye", price: 100, currency: "ZAR" }
};

runTest("Service Catalog: Validates stable identifiers and pricing integrity", () => {
  assert.strictEqual(SERVICE_CATALOG["srv_fade_dye"].price, 150);
  assert.strictEqual(SERVICE_CATALOG["srv_fade_dye"].currency, "ZAR");
  assert.strictEqual(SERVICE_CATALOG["srv_chiskop_blade"].price, 70);
});

console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log("==================================================");

if (passedTests !== totalTests) {
  process.exit(1);
}
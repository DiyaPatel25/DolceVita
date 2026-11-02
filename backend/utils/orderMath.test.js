import test from "node:test";
import assert from "node:assert/strict";
import { businessDate, businessDayStart, priceCustomizations, paidAmounts } from "./orderMath.js";

test("business day runs 2 AM to 2 AM India time", () => {
  assert.equal(businessDate("2026-11-01T20:29:59Z"), "2026-11-01"); // 01:59 IST on 2 Nov -> still 1 Nov
  assert.equal(businessDate("2026-11-01T20:30:00Z"), "2026-11-02"); // 02:00 IST on 2 Nov -> 2 Nov
  assert.equal(businessDayStart("2026-11-02").toISOString(), "2026-11-01T20:30:00.000Z");
});

test("add-ons are priced from the menu, not the client", () => {
  const menu = { customizationOptions: { toppings: [{ name: "Biscoff", price: 30 }] } };
  const c = priceCustomizations(menu, { addOnPrice: -999, selectedToppings: [{ name: "Biscoff", price: 0 }, { name: "Fake", price: 5 }] });
  assert.equal(c.addOnPrice, 30);
});

test("split payment adds each part to its own column", () => {
  const paid = { paymentStatus: "Paid", totalAmount: 150 };
  assert.deepEqual(paidAmounts({ ...paid, paymentMethod: "Split", onlineAmount: 50 }), { cash: 100, online: 50 });
  assert.deepEqual(paidAmounts({ ...paid, paymentMethod: "Cash" }), { cash: 150, online: 0 });
  assert.deepEqual(paidAmounts({ ...paid, paymentMethod: "Online Payment" }), { cash: 0, online: 150 });
  assert.deepEqual(paidAmounts({ ...paid, paymentStatus: "Pending", paymentMethod: "Split", onlineAmount: 50 }), { cash: 0, online: 0 });
});

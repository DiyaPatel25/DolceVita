import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("Razorpay keys are missing. Set RAZORPAY_TEST_KEY_ID and RAZORPAY_TEST_KEY_SECRET.");
}

const razorpay = new Razorpay({
  key_id: keyId || "",
  key_secret: keySecret || "",
});

export default razorpay;
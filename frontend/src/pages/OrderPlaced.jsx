import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";
import { STORE } from "../store";

const OrderPlaced = () => {
  const order = useLocation().state?.order;

  return (
    <div className="min-h-[80vh] px-4 py-12" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-md mx-auto text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto text-copper-500" />
        <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-wide">Order placed</h1>

        {order ? (
          <>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Thanks{order.guestName ? `, ${order.guestName}` : ""}. Show this number at the counter.
            </p>
            <p className="mt-6 font-display text-5xl font-semibold tracking-[0.15em] text-copper-500">#{String(order._id).slice(-5).toUpperCase()}</p>

            <div className="mt-8 rounded-2xl border p-5 text-left" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Pickup</p>
              <p className="font-bold">{order.pickupTime || "As soon as possible"}</p>
              {STORE.pickupPoint && <p className="text-sm mt-0.5">{STORE.pickupPoint}</p>}

              <ul className="mt-4 space-y-1.5 border-t pt-4 text-sm" style={{ borderColor: "var(--border-color)" }}>
                {order.items?.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span><span className="font-bold">{i.quantity}×</span> {i.name}</span>
                    <span>₹{(Number(i.price) + (i.customizations?.addOnPrice || 0)) * i.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-4 flex items-baseline justify-between" style={{ borderColor: "var(--border-color)" }}>
                <span className="font-semibold">Pay at the counter</span>
                <span className="text-2xl font-black">₹{order.totalAmount}</span>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Cash or UPI, when you collect.</p>
            </div>
          </>
        ) : (
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Your pickup order is with the stall. If you signed in, you'll find it under My orders.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <a href={`tel:+91${STORE.phones[0]}`} className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-copper-500 text-copper-500 font-bold">
            <Phone size={17} /> Call the stall if plans change
          </a>
          <Link to="/menu" className="px-6 py-3.5 rounded-full bg-copper-500 hover:bg-copper-400 text-chalk font-bold">
            Back to the menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;

import React, { useContext, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Instagram, Calendar, Users, Cake } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919601370361";

const SpecialOrders = () => {
  const { axios } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guests: "",
    itemsOfInterest: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openWhatsAppInquiry = (values) => {
    const text = [
      "Hello Dolce Vita, I would like to place a Special Event Order:",
      `*Name:* ${values.name}`,
      `*Email:* ${values.email}`,
      `*Phone:* ${values.phone || "Not provided"}`,
      `*Event Type:* ${values.eventType}`,
      `*Date:* ${values.eventDate}`,
      `*Guests:* ${values.guests}`,
      `*Items of Interest:* ${values.itemsOfInterest}`,
      `*Additional Details:* ${values.message}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (
      formData.name &&
      formData.email &&
      formData.eventType &&
      formData.eventDate &&
      formData.itemsOfInterest
    ) {
      try {
        setSending(true);
        // We can still use the generic contact/send endpoint if it just sends an email, 
        // or we can just rely on the WhatsApp redirect. Assuming the backend accepts generic fields,
        // we map our specific fields to the subject/message.
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `Special Order: ${formData.eventType} on ${formData.eventDate}`,
          message: `Guests: ${formData.guests}\nItems: ${formData.itemsOfInterest}\nDetails: ${formData.message}`
        };
        
        const { data } = await axios.post("/api/contact/send", payload);

        if (data.success) {
          const submittedInquiry = { ...formData };
          setSubmitted(true);
          setFormData({
            name: "",
            email: "",
            phone: "",
            eventType: "",
            eventDate: "",
            guests: "",
            itemsOfInterest: "",
            message: "",
          });
          openWhatsAppInquiry(submittedInquiry);
          toast.success("WhatsApp opened. Tap send to deliver your order instantly.");
          setTimeout(() => setSubmitted(false), 3000);
        } else {
          toast.error(data.message || "Failed to send your request");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send your request");
      } finally {
        setSending(false);
      }
    } else {
      toast.error("Please fill all required fields (*)");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Premium Hero Section */}
      <div
        className="relative h-80 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#111827]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-3xl glass-panel-dark p-8 rounded-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-orange-400">Special Event Orders</h1>
            <p className="text-lg md:text-xl font-light text-gray-300">
              Birthdays, Anniversaries, Corporate Events — Make it unforgettable with Dolce Vita's premium desserts.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Order Form (Takes up 2 columns) */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Cake className="w-8 h-8 text-orange-500" />
              Request a Custom Order
            </h2>

            {submitted && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Thank you! Your order request has been sent. Opening WhatsApp...
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="+91..."
                />
              </div>

              {/* Event Type */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                >
                  <option value="" disabled className="dark:bg-gray-800">Select Event Type</option>
                  <option value="Birthday" className="dark:bg-gray-800">Birthday</option>
                  <option value="Anniversary" className="dark:bg-gray-800">Anniversary</option>
                  <option value="Corporate Event" className="dark:bg-gray-800">Corporate Event</option>
                  <option value="Wedding" className="dark:bg-gray-800">Wedding</option>
                  <option value="Other" className="dark:bg-gray-800">Other Custom Order</option>
                </select>
              </div>

              {/* Event Date */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Event *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors dark:[color-scheme:dark]"
                />
              </div>

              {/* Guests */}
              <div className="col-span-1">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" /> Estimated Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g. 50"
                  min="1"
                />
              </div>

              {/* Items of Interest */}
              <div className="col-span-full">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Items of Interest *</label>
                <input
                  type="text"
                  name="itemsOfInterest"
                  value={formData.itemsOfInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g. 2 Tier Cheesecake, 50 Tubcakes, Assorted Brownies"
                />
              </div>

              {/* Additional Details */}
              <div className="col-span-full">
                <label className="block font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Additional Details</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Any specific themes, dietary requirements, or special requests..."
                ></textarea>
              </div>

              <div className="col-span-full mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1"
                >
                  <Send className="w-5 h-5" />
                  <span>{sending ? "Processing..." : "Submit Order Request"}</span>
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  After submitting, WhatsApp will open with your order details prefilled for instant confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-xl font-bold mb-6 text-orange-500 border-b border-gray-200 dark:border-gray-800 pb-4">
                Visit Our Stall
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Address</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Bhairavnath road, near ramujilal hall<br />
                      Maninagar, Ahmedabad
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Opening Hours</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Mon - Fri: 11:00 AM - 10:00 PM<br />
                      Sat - Sun: 10:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-gray-200 dark:border-gray-800" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="text-xl font-bold mb-6 text-orange-500 border-b border-gray-200 dark:border-gray-800 pb-4">
                Direct Contact
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-gray-500 text-sm">+91 9601370361</p>
                    <p className="text-gray-500 text-sm">+91 6355651866</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Instagram</h4>
                    <a
                      href="https://www.instagram.com/dolcevita___cakes/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 text-sm hover:text-orange-500 transition-colors"
                    >
                      @dolcevita___cakes
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpecialOrders;

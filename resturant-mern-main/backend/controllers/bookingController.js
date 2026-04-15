import DataAccess from "../config/dataAccess.js";
import { isMongoDBConnected } from "../config/db.js";

// Initialize data access for Booking and User
const bookingDB = new DataAccess('Booking');
const userDB = new DataAccess('User');

export const createBooking = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, phone, numberOfPeople, date, time, note } = req.body;
    if (!name || !phone || !numberOfPeople || !date || !time) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    
    // Check for overlapping bookings
    const existingBookings = await bookingDB.find({ date, time });
    const conflictingBooking = existingBookings.find(booking => booking.status !== "Cancelled");
    
    if (conflictingBooking)
      return res
        .status(400)
        .json({ message: "This time slot is already booked", success: false });
        
    const booking = await bookingDB.create({
      user: id,
      name,
      phone,
      numberOfPeople,
      date,
      time,
      note,
    });
    res
      .status(201)
      .json({ success: true, message: "Table booked successfully", booking });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { id } = req.user;
    let bookings = await bookingDB.find({ user: id });
    
    // Sort by createdAt if available
    if (bookings.length > 0 && bookings[0].createdAt) {
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    res.status(200).json({ bookings, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    let bookings = await bookingDB.find();

    // Handle population based on storage type
    if (isMongoDBConnected()) {
      const Booking = (await import("../models/bookingModel.js")).default;
      bookings = await Booking.find().populate("user", "name email");
    } else {
      // Manual population for local storage
      for (let booking of bookings) {
        if (booking.user) {
          const user = await userDB.findById(booking.user);
          booking.user = user ? { _id: user._id, name: user.name, email: user.email } : null;
        }
      }
    }

    res.status(200).json({ bookings, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const booking = await bookingDB.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    const updatedBooking = await bookingDB.findByIdAndUpdate(bookingId, { status });
    res
      .status(200)
      .json({ success: true, message: "Booking status updated", booking: updatedBooking });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

import DataAccess from "../config/dataAccess.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendWelcomeEmail from "../emailService.js";

// Initialize data access for User
const userDB = new DataAccess('User');

// Generate JWT
const generateToken = (res, payload, cookieName = "token") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite='none'
    sameSite: isProduction ? "none" : "lax", // 'none' required for cross-domain cookies
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    const existingUser = await userDB.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userDB.create({ name, email, password: hashedPassword });
    return res.json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        message: "Please fill all the fields",
        success: false,
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      generateToken(res, { email, role: "admin" }, "adminToken");
      return res.json({
        message: "Admin logged in successfully",
        success: true,
        user: { name: "Admin User", email: adminEmail },
        admin: true
      });
    }

    const user = await userDB.findOne({ email });
    if (!user) {
      return res.json({ message: "User does not exist", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { id: user._id, role: "user" }, "userToken");

    // If this is the user's first successful login, send a welcome email.
    try {
      if (!user.hasBeenWelcomed) {
        const emailSent = await sendWelcomeEmail(user.email, user.name);
        if (emailSent) {
          // mark user as welcomed to avoid duplicate emails
          await userDB.findByIdAndUpdate(user._id, { hasBeenWelcomed: true });
        }
      }
    } catch (err) {
      console.error('Error sending welcome email on login:', err.message);
      // Do not block login on email errors
    }

    res.json({
      message: "User logged in successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

// `adminLogin` deprecated and removed - logic unified inside `loginUser`

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie("userToken");
    res.clearCookie("adminToken");
    return res.json({ message: "User logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userDB.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};

export const isAuth = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === "admin") {
       return res.json({ 
         success: true, 
         user: { name: "Admin", email: process.env.ADMIN_EMAIL },
         admin: true 
       });
    }
    const user = await userDB.findById(id);
    if (!user) return res.json({ success: false, message: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, admin: false });
  } catch (error) {
    return res.json({ message: "Internal server error", success: false });
  }
};

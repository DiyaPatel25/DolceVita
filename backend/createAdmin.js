import bcrypt from "bcryptjs";
import DataAccess from "./config/dataAccess.js";
import dotenv from "dotenv";

dotenv.config();

const userDB = new DataAccess("User");

async function createAdmin() {
  const email = "admin@example.com";
  const password = "admin123";

  try {
    const existingUser = await userDB.findOne({ email });
    if (existingUser) {
      console.log("Admin already exists in DB");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userDB.create({
      name: "Admin",
      email,
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("Successfully created admin in DB");
    
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin();

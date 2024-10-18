import User from "../models/User.js";
import Driver from "../models/Driver.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password, role, pricePerKm, basePrice, vehicleType } =
    req.body;

  console.log("Got signup request:", req.body);

  // Ensure role and required fields are valid
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine whether to create a User or a Driver based on the role
    let user;
    if (role === "user") {
      user = new User({ name, email, password: hashedPassword });
    } else if (role === "driver") {
      if (!vehicleType || !basePrice || !pricePerKm) {
        return res
          .status(400)
          .json({ message: "Please provide vehicle details for the driver" });
      }

      user = new Driver({
        name,
        email,
        password: hashedPassword, // Save hashed password
        vehicleType,
        basePrice: parseFloat(basePrice), // Ensure numbers are stored as numbers
        pricePerKm: parseFloat(pricePerKm),
        available: true, // Mark driver as available
      });
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Save the user (either User or Driver)
    await user.save();
    console.log("New user saved:", user);

    // Create a JWT token for authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiration for security
    });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  const { email, password, role } = req.body;
  console.log("Got request for login:", req.body);

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    let user;
    if (role === "user") {
      user = await User.findOne({ email });
    } else if (role === "driver") {
      user = await Driver.findOneAndUpdate(
        { email },
        { $set: { available: true } }, // Mark driver as available when they log in
        { new: true }
      );
    }

    // Check for user existence
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiration for security
    });

    // Respond with token and user ID
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const User = require("../models/User");
const { generateToken } = require("../services/authService");

const register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ email, password, full_name, phone });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password_hash from response
    delete user.password_hash;

    res.json({
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

module.exports = {
  register,
  login,
};

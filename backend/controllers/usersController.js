const User = require("../Models/User");
const { ROLES, STATUSES } = require("../Models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => u.toPublicJSON()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveSalesUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "Active",
      role: { $in: ["Sales Executive", "Manager"] },
    }).sort({ name: 1 });
    res.json(users.map((u) => u.toPublicJSON()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, mobile, email, role, status, password } = req.body;

    if (!name?.trim() || !mobile?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, mobile, email, and password are required" });
    }
    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` });
    }
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      role: role || "Sales Executive",
      status: status || "Active",
      password,
    });

    res.status(201).json(user.toPublicJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, mobile, email, role, status, password } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (mobile !== undefined) user.mobile = mobile.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role !== undefined) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `Role must be one of: ${ROLES.join(", ")}` });
      }
      user.role = role;
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
      }
      user.status = status;
    }
    if (password) user.password = password;

    await user.save();
    res.json(user.toPublicJSON());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

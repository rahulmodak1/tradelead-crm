const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const JWT_SECRET = process.env.JWT_SECRET || "tradeleadcrm-dev-secret";

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== "Active") {
      return res.status(401).json({ message: "Invalid or inactive user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { authenticate, requireRoles, signToken, JWT_SECRET };

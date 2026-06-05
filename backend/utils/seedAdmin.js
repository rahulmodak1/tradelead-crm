const User = require("../Models/User");

async function seedDefaultAdmin() {
  let admin = await User.findOne({ email: "admin@tradeindia.com" }).select("+password");

  if (!admin) {
    await User.create({
      name: "Admin User",
      email: "admin@tradeindia.com",
      mobile: "9999999999",
      role: "Admin",
      status: "Active",
      password: "admin123",
    });
    console.log("Default admin seeded → admin@tradeindia.com / admin123");
    return;
  }

  const valid = await admin.comparePassword("admin123");
  if (!valid) {
    admin.password = "admin123";
    await admin.save();
    console.log("Default admin password reset → admin@tradeindia.com / admin123");
  }
}

module.exports = { seedDefaultAdmin };

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["Admin", "Manager", "Sales Executive"];
const STATUSES = ["Active", "Inactive"];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: "Sales Executive" },
  status: { type: String, enum: STATUSES, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    name: this.name,
    mobile: this.mobile,
    email: this.email,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema);
module.exports.ROLES = ROLES;
module.exports.STATUSES = STATUSES;

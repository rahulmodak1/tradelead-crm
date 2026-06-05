const express = require("express");
const {
  getUsers,
  getActiveSalesUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const { authenticate, requireRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", requireRoles("Admin", "Manager"), getUsers);
router.get("/assignable", getActiveSalesUsers);
router.post("/", requireRoles("Admin"), createUser);
router.put("/:id", requireRoles("Admin"), updateUser);
router.delete("/:id", requireRoles("Admin"), deleteUser);

module.exports = router;

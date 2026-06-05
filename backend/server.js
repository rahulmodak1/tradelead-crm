const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const leadRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const teamRoutes = require("./routes/team");
const followUpRoutes = require("./routes/followUps");
const quotationRoutes = require("./routes/quotations");
const { seedDefaultAdmin } = require("./utils/seedAdmin");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/quotations", quotationRoutes);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await seedDefaultAdmin();

    console.log("MongoDB Connected Successfully ✅");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.log("MongoDB Connection Error ❌");
    console.log(error.message);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("TradeLead CRM Backend Running Successfully 🚀");
});

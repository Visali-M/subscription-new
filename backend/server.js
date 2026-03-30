const express = require("express");
const dotenv  = require("dotenv");
const cors    = require("cors");
const connectDB = require("./config/db");
const { startRenewalReminder } = require("./utils/cronJob");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/payment",       require("./routes/paymentRoutes"));

app.get("/", (req, res) => res.send("SubTracker API v2.0 running"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong" });
});

startRenewalReminder();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ================= MONGO =================
mongoose.connect("mongodb+srv://HoodStrikeBot:<db_password>@cluster0.giyufvh.mongodb.net/?appName=Cluster0");

// ================= DATABASE =================
const BanSchema = new mongoose.Schema({
  username: String,
  reason: String,
  alts: [String],
  createdAt: { type: Date, default: Date.now }
});

const Ban = mongoose.model("Ban", BanSchema);

// ================= QUEUE =================
let queue = [];

// ================= BAN (PERMANENT) =================
app.post("/ban", async (req, res) => {
  const { username, reason } = req.body;

  await Ban.findOneAndUpdate(
    { username },
    { username, reason },
    { upsert: true }
  );

  queue.push({ type: "ban", username, reason });

  res.json({ ok: true });
});

// ================= UNBAN =================
app.post("/unban", async (req, res) => {
  const { username } = req.body;

  await Ban.deleteOne({ username });

  queue.push({ type: "unban", username });

  res.json({ ok: true });
});

// ================= KICK =================
app.post("/kick", (req, res) => {
  const { username } = req.body;

  queue.push({ type: "kick", username });

  res.json({ ok: true });
});

// ================= CHECK BAN (ROBLOX JOIN CHECK) =================
app.get("/check/:username", async (req, res) => {
  const user = await Ban.findOne({ username: req.params.username });

  if (user) {
    return res.json({
      banned: true,
      reason: user.reason
    });
  }

  res.json({ banned: false });
});

// ================= POLL (FAST SYNC) =================
app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

// ================= START =================
app.get("/", (req, res) => {
  res.send("Hood Strike API Online");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

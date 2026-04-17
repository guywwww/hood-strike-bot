const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Hood Strike API Online");
});

// ================= DATABASE =================
mongoose.connect("mongodb+srv://HoodStrikeBot:<db_password>@cluster0.giyufvh.mongodb.net/?appName=Cluster0");

// ================= BAN SYSTEM =================
const BanSchema = new mongoose.Schema({
  username: String,
  reason: String
});

const Ban = mongoose.model("Ban", BanSchema);

// ================= QUEUE =================
let queue = [];

// ================= BAN =================
app.post("/ban", async (req, res) => {
  try {
    const { username, reason } = req.body;

    await Ban.findOneAndUpdate(
      { username },
      { username, reason },
      { upsert: true }
    );

    queue.push({ type: "ban", username, reason });

    return res.json({ ok: true });
  } catch {
    return res.json({ ok: false });
  }
});

// ================= UNBAN =================
app.post("/unban", async (req, res) => {
  try {
    const { username } = req.body;

    await Ban.deleteOne({ username });

    queue.push({ type: "unban", username });

    return res.json({ ok: true });
  } catch {
    return res.json({ ok: false });
  }
});

// ================= KICK =================
app.post("/kick", (req, res) => {
  const { username } = req.body;

  queue.push({ type: "kick", username });

  return res.json({ ok: true });
});

// ================= GLOBAL =================
app.post("/global", (req, res) => {
  const { message } = req.body;

  queue.push({ type: "global", message });

  return res.json({ ok: true });
});

// ================= POLL =================
app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

// ================= START =================
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

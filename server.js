const express = require("express");
const app = express();

app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Hood Strike API Online");
});

// ================= QUEUE =================
let queue = [];

// ================= BAN =================
app.post("/ban", (req, res) => {
  const { username, reason } = req.body;

  queue.push({
    type: "ban",
    username,
    reason
  });

  res.json({ ok: true });
});

// ================= UNBAN =================
app.post("/unban", (req, res) => {
  const { username } = req.body;

  queue.push({
    type: "unban",
    username
  });

  res.json({ ok: true });
});

// ================= KICK =================
app.post("/kick", (req, res) => {
  const { username } = req.body;

  queue.push({
    type: "kick",
    username
  });

  res.json({ ok: true });
});

// ================= GLOBAL =================
app.post("/global", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ ok: false, error: "No message" });
  }

  queue.push({
    type: "global",
    message
  });

  res.json({ ok: true });
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

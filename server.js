const express = require("express");
const app = express();

app.use(express.json());

let queue = [];

// BAN
app.post("/ban", (req, res) => {
  queue.push({ type: "ban", username: req.body.username });
  res.json({ ok: true });
});

// UNBAN
app.post("/unban", (req, res) => {
  queue.push({ type: "unban", username: req.body.username });
  res.json({ ok: true });
});

// KICK
app.post("/kick", (req, res) => {
  queue.push({ type: "kick", username: req.body.username });
  res.json({ ok: true });
});

// GLOBAL
app.post("/global", (req, res) => {
  queue.push({ type: "global", message: req.body.message });
  res.json({ ok: true });
});

// ROBLOX POLL
app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

// Render requires this port setup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server running on port " + PORT);
});
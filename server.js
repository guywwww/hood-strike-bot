const express = require("express");
const app = express();

app.use(express.json());

// REAL DATABASE (in-memory permanent for Render session)
// If you want FULL persistence later, I can upgrade you to MongoDB
const bans = new Map();

const queue = [];

// ================= BAN =================
app.post("/ban", (req, res) => {
  const { username, reason } = req.body;

  if (!username) return res.json({ ok: false });

  bans.set(username.toLowerCase(), {
    reason: reason || "No reason"
  });

  queue.push({
    type: "ban",
    username,
    reason: reason || "No reason"
  });

  res.json({ ok: true });
});

// ================= UNBAN =================
app.post("/unban", (req, res) => {
  const { username } = req.body;

  if (!username) return res.json({ ok: false });

  bans.delete(username.toLowerCase());

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

// ================= CHECK (REAL PERMANENT BAN CHECK) =================
app.get("/check/:username", (req, res) => {
  const user = req.params.username.toLowerCase();

  if (bans.has(user)) {
    return res.json({
      banned: true,
      reason: bans.get(user).reason
    });
  }

  res.json({ banned: false });
});

// ================= POLL =================
app.get("/poll", (req, res) => {
  res.json(queue.splice(0));
});

// ================= START =================
app.get("/", (req, res) => {
  res.send("Hood Strike API Running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

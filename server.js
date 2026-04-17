const express = require("express");
const app = express();

app.use(express.json());

let queue = [];

app.get("/", (req, res) => {
  res.send("API ONLINE");
});

app.post("/ban", (req, res) => {
  try {
    const { username, reason } = req.body;

    if (!username) return res.json({ ok: false });

    queue.push({
      type: "ban",
      username,
      reason: reason || "No reason"
    });

    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

app.post("/unban", (req, res) => {
  try {
    const { username } = req.body;

    queue.push({
      type: "unban",
      username
    });

    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

app.post("/kick", (req, res) => {
  try {
    const { username } = req.body;

    queue.push({
      type: "kick",
      username
    });

    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

app.get("/check/:username", (req, res) => {
  res.json({ banned: false });
});

app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

const express = require("express");
const app = express();

app.use(express.json());

let queue = [];

app.post("/ban", (req, res) => {
  queue.push({
    type: "ban",
    username: req.body.username,
    reason: req.body.reason || "no reason"
  });
  res.json({ ok: true });
});

app.post("/unban", (req, res) => {
  queue.push({
    type: "unban",
    username: req.body.username
  });
  res.json({ ok: true });
});

app.post("/kick", (req, res) => {
  queue.push({
    type: "kick",
    username: req.body.username
  });
  res.json({ ok: true });
});

app.post("/global", (req, res) => {
  queue.push({
    type: "global",
    message: req.body.message
  });
  res.json({ ok: true });
});

app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

app.listen(process.env.PORT || 3000);

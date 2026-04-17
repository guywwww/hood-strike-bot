const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// CONNECT DATABASE
mongoose.connect("YOUR_MONGO_URI_HERE");

const BanSchema = new mongoose.Schema({
  username: String,
  reason: String
});

const Ban = mongoose.model("Ban", BanSchema);

let queue = [];

/* BAN */
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

/* UNBAN */
app.post("/unban", async (req, res) => {
  await Ban.deleteOne({ username: req.body.username });

  queue.push({ type: "unban", username: req.body.username });

  res.json({ ok: true });
});

/* KICK */
app.post("/kick", (req, res) => {
  queue.push({ type: "kick", username: req.body.username });
  res.json({ ok: true });
});

/* GLOBAL */
app.post("/global", (req, res) => {
  queue.push({ type: "global", message: req.body.message });
  res.json({ ok: true });
});

/* CHECK BAN (PERMANENT) */
app.get("/check-ban/:u", async (req, res) => {
  const ban = await Ban.findOne({ username: req.params.u });

  if (ban) {
    return res.json({
      banned: true,
      reason: ban.reason
    });
  }

  res.json({ banned: false });
});

/* POLL */
app.get("/poll", (req, res) => {
  res.json(queue);
  queue = [];
});

app.listen(process.env.PORT || 3000);

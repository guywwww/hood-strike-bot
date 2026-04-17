const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://HoodStrikeBot:<db_password>@cluster0.giyufvh.mongodb.net/?appName=Cluster0");

const BanSchema = new mongoose.Schema({
  username: String,
  reason: String
});

const Ban = mongoose.model("Ban", BanSchema);

const queue = [];

app.post("/ban", async (req, res) => {
  const { username, reason } = req.body;

  if (!username) return res.json({ ok: false });

  await Ban.findOneAndUpdate(
    { username: username.toLowerCase() },
    { username: username.toLowerCase(), reason: reason || "No reason" },
    { upsert: true }
  );

  queue.push({
    type: "ban",
    username,
    reason: reason || "No reason"
  });

  res.json({ ok: true });
});

app.post("/unban", async (req, res) => {
  const { username } = req.body;

  if (!username) return res.json({ ok: false });

  await Ban.deleteOne({ username: username.toLowerCase() });

  queue.push({
    type: "unban",
    username
  });

  res.json({ ok: true });
});

app.post("/kick", (req, res) => {
  const { username } = req.body;

  queue.push({
    type: "kick",
    username
  });

  res.json({ ok: true });
});

app.get("/check/:username", async (req, res) => {
  const user = await Ban.findOne({
    username: req.params.username.toLowerCase()
  });

  if (user) {
    return res.json({
      banned: true,
      reason: user.reason
    });
  }

  res.json({ banned: false });
});

app.get("/poll", (req, res) => {
  res.json(queue.splice(0));
});

app.get("/", (req, res) => {
  res.send("API ONLINE");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

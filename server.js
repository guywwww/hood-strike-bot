const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO_URI = "mongodb+srv://HoodStrikeBot:Dante69195999@cluster0.giyufvh.mongodb.net/hoodstrike?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PlayerSchema = new mongoose.Schema({
    username: String,
    banned: { type: Boolean, default: false },
    reason: String
});

const Player = mongoose.model("Player", PlayerSchema);

// LIVE ACTION QUEUE (IMPORTANT FIX)
let actions = [];

/*
actions format:
{
  type: "kick" | "ban",
  username: "",
  reason: ""
}
*/

// BAN
app.post("/ban", async (req, res) => {
    const { username, reason } = req.body;

    await Player.findOneAndUpdate(
        { username },
        { username, banned: true, reason },
        { upsert: true }
    );

    actions.push({
        type: "ban",
        username,
        reason
    });

    res.json({ success: true });
});

// UNBAN
app.post("/unban", async (req, res) => {
    const { username } = req.body;

    await Player.findOneAndUpdate(
        { username },
        { banned: false, reason: "" }
    );

    res.json({ success: true });
});

// KICK (NOW FIXED)
app.post("/kick", async (req, res) => {
    const { username } = req.body;

    actions.push({
        type: "kick",
        username
    });

    res.json({ success: true });
});

// CHECK (instant ban check)
app.get("/check/:username", async (req, res) => {
    const user = await Player.findOne({ username: req.params.username });

    if (!user) return res.json({ banned: false });

    res.json({
        banned: user.banned,
        reason: user.reason
    });
});

// ROBLOX POLL SYSTEM (FIXED)
app.get("/poll", (req, res) => {
    const copy = [...actions];
    actions = []; // clear after sending

    res.json(copy);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ================= MONGO CONNECTION =================
const uri = "mongodb+srv://HoodStrikeBot:Dante69195999@cluster0.giyufvh.mongodb.net/hoodstrike?retryWrites=true&w=majority";

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    tls: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo error:", err));

// ================= DATABASE =================
const BanSchema = new mongoose.Schema({
    username: String,
    reason: String
});

const Ban = mongoose.model("Ban", BanSchema);

// ================= CHECK BAN =================
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

// ================= BAN USER =================
app.post("/ban", async (req, res) => {
    const { username, reason } = req.body;

    await Ban.create({ username, reason });

    res.json({ success: true });
});

// ================= UNBAN USER =================
app.post("/unban", async (req, res) => {
    const { username } = req.body;

    await Ban.deleteOne({ username });

    res.json({ success: true });
});

// ================= POLL (for Roblox) =================
let actions = [];

app.get("/poll", (req, res) => {
    res.json(actions);
    actions = [];
});

// ================= ACTION ADDERS =================
app.post("/action/kick", (req, res) => {
    actions.push({ type: "kick", username: req.body.username });
    res.json({ success: true });
});

app.post("/action/ban", (req, res) => {
    actions.push({ type: "ban", username: req.body.username, reason: req.body.reason });
    res.json({ success: true });
});

// ================= START SERVER =================
app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});

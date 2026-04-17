const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const MONGO = "mongodb+srv://HoodStrikeBot:BGydsq3!m33W5A%@cluster0.giyufvh.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO);

const BanSchema = new mongoose.Schema({
    username: String,
    reason: String,
    alts: [String]
});

const Ban = mongoose.model("Ban", BanSchema);

app.post("/ban", async (req, res) => {
    const { username, reason } = req.body;

    let user = await Ban.findOne({ username });

    if (!user) {
        user = new Ban({ username, reason, alts: [] });
    } else {
        user.reason = reason;
    }

    await user.save();
    res.send({ success: true });
});

app.post("/unban", async (req, res) => {
    const { username } = req.body;

    const user = await Ban.findOne({ username });
    if (user) {
        await Ban.deleteMany({
            $or: [
                { username },
                { username: { $in: user.alts } }
            ]
        });
    }

    res.send({ success: true });
});

app.get("/check/:username", async (req, res) => {
    const username = req.params.username;

    const banned = await Ban.findOne({
        $or: [
            { username },
            { alts: username }
        ]
    });

    if (banned) {
        return res.send({
            banned: true,
            reason: banned.reason || "Banned"
        });
    }

    res.send({ banned: false });
});

app.post("/linkalt", async (req, res) => {
    const { main, alt } = req.body;

    const user = await Ban.findOne({ username: main });
    if (user) {
        if (!user.alts.includes(alt)) {
            user.alts.push(alt);
            await user.save();
        }
    }

    res.send({ success: true });
});

app.listen(3000);

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://HoodStrikeBot:Dante69195999@cluster0.giyufvh.mongodb.net/hoodstrike?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("Mongo Error:", err));

const Ban = mongoose.model("Ban", {
    username: String,
    reason: String
});

let actions = [];

app.get("/", (req, res) => {
    res.send("OK");
});

app.post("/ban", async (req, res) => {
    try {
        const { username, reason } = req.body;

        await Ban.findOneAndUpdate(
            { username },
            { username, reason },
            { upsert: true }
        );

        actions.push({ type: "ban", username, reason });

        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.post("/unban", async (req, res) => {
    try {
        const { username } = req.body;

        await Ban.deleteOne({ username });

        actions.push({ type: "unban", username });

        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.post("/kick", (req, res) => {
    const { username } = req.body;

    actions.push({ type: "kick", username });

    res.sendStatus(200);
});

app.get("/check/:username", async (req, res) => {
    try {
        const user = await Ban.findOne({ username: req.params.username });

        if (!user) return res.json({ banned: false });

        res.json({ banned: true, reason: user.reason });
    } catch (e) {
        console.log(e);
        res.json({ banned: false });
    }
});

app.get("/poll", (req, res) => {
    const data = actions;
    actions = [];
    res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));

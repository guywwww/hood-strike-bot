const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("YOUR_MONGODB_URI");

const Ban = mongoose.model("Ban", {
    username: String,
    reason: String
});

let actions = [];

app.post("/ban", async (req, res) => {
    const { username, reason } = req.body;

    await Ban.findOneAndUpdate(
        { username },
        { username, reason },
        { upsert: true }
    );

    actions.push({ type: "ban", username, reason });

    res.sendStatus(200);
});

app.post("/unban", async (req, res) => {
    const { username } = req.body;

    await Ban.deleteOne({ username });

    actions.push({ type: "unban", username });

    res.sendStatus(200);
});

app.post("/kick", (req, res) => {
    const { username } = req.body;

    actions.push({ type: "kick", username });

    res.sendStatus(200);
});

app.get("/check/:username", async (req, res) => {
    const user = await Ban.findOne({ username: req.params.username });

    if (!user) return res.json({ banned: false });

    res.json({ banned: true, reason: user.reason });
});

app.get("/poll", (req, res) => {
    const data = actions;
    actions = [];
    res.json(data);
});

app.listen(3000);

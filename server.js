const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "./db.json";

function load() {
    if (!fs.existsSync(FILE)) return { bans: {}, actions: [] };
    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
    fs.writeFileSync(FILE, JSON.stringify(data));
}

app.post("/ban", (req, res) => {
    const db = load();

    const username = (req.body.username || "").toLowerCase();
    const reason = req.body.reason || "No reason";

    if (!username) return res.status(400).json({ error: "missing username" });

    db.bans[username] = { reason, time: Date.now() };
    db.actions.push({ type: "ban", username, reason });

    save(db);

    res.json({ ok: true });
});

app.post("/unban", (req, res) => {
    const db = load();

    const username = (req.body.username || "").toLowerCase();

    if (!username) return res.status(400).json({ error: "missing username" });

    delete db.bans[username];
    db.actions.push({ type: "unban", username });

    save(db);

    res.json({ ok: true });
});

app.post("/kick", (req, res) => {
    const db = load();

    const username = (req.body.username || "").toLowerCase();

    if (!username) return res.status(400).json({ error: "missing username" });

    db.actions.push({ type: "kick", username });

    save(db);

    res.json({ ok: true });
});

app.get("/check/:username", (req, res) => {
    const db = load();

    const username = req.params.username.toLowerCase();
    const ban = db.bans[username];

    if (!ban) return res.json({ banned: false });

    res.json({ banned: true, reason: ban.reason });
});

app.get("/poll", (req, res) => {
    const db = load();

    const actions = db.actions;
    db.actions = [];

    save(db);

    res.json(actions);
});

app.listen(3000);

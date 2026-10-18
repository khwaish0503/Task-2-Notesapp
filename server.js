const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));


/* ---------- MongoDB Connection ---------- */

mongoose.connect(process.env.MONGODB_URI)
    .then(function () {
        console.log("MongoDB connected successfully!");
    })
    .catch(function (error) {
        console.log("MongoDB connection error:", error);
    });


/* ---------- Note Schema ---------- */

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    date: {
        type: String,
        default: function () {
            return new Date().toLocaleString();
        }
    },
    pinned: {
        type: Boolean,
        default: false
    }
});

const Note = mongoose.model("Note", noteSchema);


/* ---------- Get Notes ---------- */

app.get("/api/notes", async function (req, res) {
    const notes = await Note.find().sort({ pinned: -1 });
    res.json(notes);
});


/* ---------- Add Note ---------- */

app.post("/api/notes", async function (req, res) {

    const newNote = new Note({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category
    });

    const savedNote = await newNote.save();

    res.status(201).json(savedNote);
});


/* ---------- Update Note ---------- */

app.put("/api/notes/:id", async function (req, res) {

    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    note.title = req.body.title;
    note.content = req.body.content;
    note.category = req.body.category;

    if (typeof req.body.pinned === "boolean") {
        note.pinned = req.body.pinned;
    }

    await note.save();

    res.json(note);
});


/* ---------- Pin / Unpin Note ---------- */

app.patch("/api/notes/:id/pin", async function (req, res) {

    const note = await Note.findById(req.params.id);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    note.pinned = !note.pinned;

    await note.save();

    res.json(note);
});


/* ---------- Delete Note ---------- */

app.delete("/api/notes/:id", async function (req, res) {

    const deletedNote = await Note.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    res.json({
        message: "Note deleted successfully"
    });
});


/* ---------- Start Server ---------- */

app.listen(PORT, function () {
    console.log(`Server running at http://localhost:${PORT}`);
});
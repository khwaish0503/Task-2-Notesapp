
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

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

app.get("/api/notes", async function (req, res) {
    try {
        const notes = await Note.find().sort({ pinned: -1 });
        res.json(notes);
    } catch (error) {
        console.error("Get notes error:", error.message);
        res.status(500).json({ message: "Could not load notes" });
    }
});

app.post("/api/notes", async function (req, res) {
    try {
        const newNote = new Note({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Add note error:", error.message);
        res.status(500).json({ message: "Could not save note" });
    }
});

app.put("/api/notes/:id", async function (req, res) {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.title = req.body.title;
        note.content = req.body.content;
        note.category = req.body.category;

        if (typeof req.body.pinned === "boolean") {
            note.pinned = req.body.pinned;
        }

        await note.save();
        res.json(note);
    } catch (error) {
        console.error("Update note error:", error.message);
        res.status(500).json({ message: "Could not update note" });
    }
});

app.patch("/api/notes/:id/pin", async function (req, res) {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        note.pinned = !note.pinned;
        await note.save();

        res.json(note);
    } catch (error) {
        console.error("Pin note error:", error.message);
        res.status(500).json({ message: "Could not pin note" });
    }
});

app.delete("/api/notes/:id", async function (req, res) {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);

        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Delete note error:", error.message);
        res.status(500).json({ message: "Could not delete note" });
    }
});

async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing");
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully!");

        app.listen(PORT, function () {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();

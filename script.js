/* ---------- Pomodoro Timer ---------- */

let timeLeft = 25 * 60;
let timerInterval = null;

const timerDisplay = document.querySelector("#timer");
const timerStatus = document.querySelector("#timerStatus");

const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const resetButton = document.querySelector("#resetButton");

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

startButton.addEventListener("click", function () {
    if (timerInterval !== null) {
        return;
    }

    timerStatus.textContent = "Focus Session";

    timerInterval = setInterval(function () {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimer();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;

            timerStatus.textContent = "Session Complete! ☕";
            timerDisplay.classList.add("timer-done");

            setTimeout(function () {
                timerDisplay.classList.remove("timer-done");
            }, 1000);

            alert("Pomodoro session complete!");
        }
    }, 1000);
});


pauseButton.addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStatus.textContent = "Timer Paused";
});


resetButton.addEventListener("click", function () {
    clearInterval(timerInterval);
    timerInterval = null;

    timeLeft = 25 * 60;
    updateTimer();

    timerStatus.textContent = "Focus Session";
});


updateTimer();


/* ---------- Theme Button ---------- */

const themeButton = document.querySelector("#themeButton");

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "☀️";
    } else {
        themeButton.textContent = "🌙";
    }
});


/* ---------- Notes ---------- */

const noteTitle = document.querySelector("#noteTitle");
const noteContent = document.querySelector("#noteContent");
const noteCategory = document.querySelector("#noteCategory");
const addNoteButton = document.querySelector("#addNoteButton");
const notesContainer = document.querySelector("#notesContainer");
const searchInput = document.querySelector("#searchInput");

let notes = [];


/* ---------- Get Notes ---------- */

async function getNotes() {
    const response = await fetch("/api/notes");
    notes = await response.json();
    displayNotes();
}


/* ---------- Display Notes ---------- */

function displayNotes(notesToDisplay = notes) {

    notesContainer.innerHTML = "";

    if (notesToDisplay.length === 0) {
        notesContainer.innerHTML = "<p>No notes found.</p>";
        return;
    }

    notesToDisplay.forEach(function (note, index) {

        const noteCard = document.createElement("div");

        noteCard.classList.add("note");

        noteCard.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <small>Category: ${note.category}</small>
            <br>
            <small>${note.date}</small>
            <br>

            <button onclick="editNote('${note._id}')">Edit</button>

            <button onclick="deleteNote('${note._id}')">Delete</button>

            <button onclick="pinNote('${note._id}')">
                ${note.pinned ? "📌 Unpin" : "📍 Pin"}
            </button>
        `;

        notesContainer.appendChild(noteCard);

        setTimeout(function () {
            noteCard.classList.add("show-note");
        }, index * 80);
    });
}


/* ---------- Add Note ---------- */

addNoteButton.addEventListener("click", async function () {

    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const category = noteCategory.value;

    if (title === "" || content === "") {
        alert("Please enter both title and note content.");
        return;
    }

    const response = await fetch("/api/notes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            content: content,
            category: category
        })
    });

    const newNote = await response.json();

    notes.unshift(newNote);

    displayNotes();

    noteTitle.value = "";
    noteContent.value = "";
    noteCategory.value = "Study";
});


/* ---------- Edit Note ---------- */

async function editNote(id) {

    const note = notes.find(function (note) {
        return note._id === id;
    });

    if (!note) {
        alert("Note not found.");
        return;
    }

    const newTitle = prompt("Edit note title:", note.title);

    if (newTitle === null) {
        return;
    }

    const newContent = prompt("Edit note:", note.content);

    if (newContent === null) {
        return;
    }

    if (newTitle.trim() === "" || newContent.trim() === "") {
        alert("Title and content cannot be empty.");
        return;
    }

    const response = await fetch(`/api/notes/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: newTitle.trim(),
            content: newContent.trim(),
            category: note.category
        })
    });

    const updatedNote = await response.json();

    const noteIndex = notes.findIndex(function (note) {
        return note._id === id;
    });

    notes[noteIndex] = updatedNote;

    displayNotes();
}


/* ---------- Delete Note ---------- */

async function deleteNote(id) {

    if (!confirm("Are you sure you want to delete this note?")) {
        return;
    }

    await fetch(`/api/notes/${id}`, {
        method: "DELETE"
    });

    notes = notes.filter(function (note) {
        return note._id !== id;
    });

    displayNotes();
}


/* ---------- Pin Note ---------- */

async function pinNote(id) {

    const note = notes.find(function (note) {
        return note._id === id;
    });

    if (!note) {
        return;
    }

    const response = await fetch(`/api/notes/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: note.title,
            content: note.content,
            category: note.category,
            pinned: !note.pinned
        })
    });

    const updatedNote = await response.json();

    const noteIndex = notes.findIndex(function (note) {
        return note._id === id;
    });

    notes[noteIndex] = updatedNote;

    notes.sort(function (a, b) {
        return b.pinned - a.pinned;
    });

    displayNotes();
}


/* ---------- Search Notes ---------- */

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase();

    const filteredNotes = notes.filter(function (note) {

        return (
            note.title.toLowerCase().includes(searchText) ||
            note.content.toLowerCase().includes(searchText) ||
            note.category.toLowerCase().includes(searchText)
        );
    });

    displayNotes(filteredNotes);
});


/* ---------- Load Notes ---------- */

getNotes();
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  validateNote,
  handleValidationErrors,
} = require("../validator/noteValidator");

const {
  createNote,
  getNotes,
  getSingleNote,
  updateNote,
  deleteNote,
  autoSaveNote,
  shareNote,
} = require("../controllers/noteController");

// Create Note Route (Protected)
router.post("/", authMiddleware, validateNote, handleValidationErrors, createNote);

// Get Logged-in User Notes
router.get("/", authMiddleware, getNotes);

router.get("/:id", authMiddleware, getSingleNote);

// Update Note
router.put("/:id", authMiddleware, validateNote, handleValidationErrors, updateNote);

router.put("/autosave/:id", authMiddleware, autoSaveNote);

router.post("/:id/share", authMiddleware, shareNote);

// Delete Note
router.delete("/:id", authMiddleware, deleteNote);

module.exports = router;

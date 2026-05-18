const Note = require("../models/notes");
const User = require("../models/User");

const toId = (value) => value?._id?.toString() || value?.toString();

// Helper: Check if user owns or can collaborate on the note
const checkOwnership = (note, userId) => {
  return toId(note.createdBy) === userId;
};

const checkAccess = (note, userId) => {
  return (
    checkOwnership(note, userId) ||
    note.collaborators.some(
      (collaboratorId) => toId(collaboratorId) === userId
    )
  );
};

// Helper: Send error response
const sendError = (res, status, message) => {
  res.status(status).json({ message });
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sendVersionConflict = (res, note) => {
  res.status(409).json({
    message: "Conflict detected. Please reload the latest note.",
    currentVersion: note.version,
    note,
  });
};

// Create Note
exports.createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Get Logged-in User Notes with Search & Pagination
exports.getNotes = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const query = {
      $or: [{ createdBy: req.user.id }, { collaborators: req.user.id }],
      title: {
        $regex: search,
        $options: "i",
      },
    };

    const notes = await Note.find(query)
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments(query);

    res.status(200).json({
      currentPage: page,
      totalNotes,
      notes,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Get Single Note
exports.getSingleNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (!checkAccess(note, req.user.id)) {
      return sendError(res, 403, "Unauthorized");
    }

    res.status(200).json({ note });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Update Note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, version } = req.body;
    const note = await Note.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("collaborators", "name email");

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (!checkAccess(note, req.user.id)) {
      return sendError(res, 403, "Unauthorized");
    }

    const incomingVersion = Number(version);

    if (!Number.isFinite(incomingVersion) || incomingVersion !== note.version) {
      return sendVersionConflict(res, note);
    }

    note.title = title;
    note.content = content;
    note.version += 1;
    await note.save();

    res.status(200).json({
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (!checkOwnership(note, req.user.id)) {
      return sendError(res, 403, "Unauthorized");
    }

    await note.deleteOne();

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Auto-save Note with Version Control
exports.autoSaveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (!checkAccess(note, req.user.id)) {
      return sendError(res, 401, "Unauthorized");
    }

    const incomingVersion = Number(req.body.version);

    // Reject old or out-of-order updates
    if (!Number.isFinite(incomingVersion) || incomingVersion !== note.version) {
      return sendVersionConflict(res, note);
    }

    note.content = req.body.content;
    note.version += 1;
    await note.save();

    res.status(200).json({
      message: "Note auto-saved",
      note,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

// Share Note with another registered user
exports.shareNote = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Collaborator email is required");
    }

    const note = await Note.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("collaborators", "name email");

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    if (!checkOwnership(note, req.user.id)) {
      return sendError(res, 403, "Only the owner can share this note");
    }

    const collaboratorEmail = email.trim();
    const collaborator = await User.findOne({
      email: {
        $regex: `^${escapeRegex(collaboratorEmail)}$`,
        $options: "i",
      },
    });

    if (!collaborator) {
      return sendError(res, 404, "No registered user found with that email");
    }

    if (collaborator._id.toString() === req.user.id) {
      return sendError(res, 400, "You already own this note");
    }

    const alreadyShared = note.collaborators.some(
      (collaboratorId) =>
        collaboratorId.toString() === collaborator._id.toString()
    );

    if (!alreadyShared) {
      note.collaborators.push(collaborator._id);
      await note.save();
    }

    await note.populate("createdBy", "name email");
    await note.populate("collaborators", "name email");

    res.status(200).json({
      message: alreadyShared
        ? "Note is already shared with this user"
        : "Note shared successfully",
      note,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

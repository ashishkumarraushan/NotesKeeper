const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },

    content: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);
history: [
  {
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    editorName: {
      type: String,
    },

    version: {
      type: Number,
    },

    editedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

module.exports = mongoose.model("Note", noteSchema);

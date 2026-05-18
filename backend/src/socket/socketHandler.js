const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Note = require("../models/notes");

const toId = (value) => value?._id?.toString() || value?.toString();

const canAccessNote = (note, userId) => {
  return (
    toId(note.createdBy) === userId ||
    note.collaborators.some((collaboratorId) => toId(collaboratorId) === userId)
  );
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  const activeUsers = new Map();
  const liveNoteState = new Map();

  const getRoomUsers = (noteId) =>
    Array.from(activeUsers.get(noteId)?.values() || []);

  const leaveNoteRoom = (socket, noteId) => {
    const roomUsers = activeUsers.get(noteId);

    if (!roomUsers) return;

    roomUsers.delete(socket.id);
    socket.leave(noteId);

    if (roomUsers.size === 0) {
      activeUsers.delete(noteId);
      liveNoteState.delete(noteId);
    } else {
      io.to(noteId).emit("active-users", getRoomUsers(noteId));
      socket.to(noteId).emit("user-left", {
        userId: socket.userId,
        userName: socket.userName,
      });
    }
  };

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      socket.userName = decoded.name || decoded.email || "User";
      socket.joinedNoteRooms = new Set();

      next();
    } catch (error) {
      next(new Error(`Authentication failed: ${error.message}`));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-note", async ({ noteId } = {}) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
          socket.emit("socket-error", { message: "Valid note id is required" });
          return;
        }

        const note = await Note.findById(noteId)
          .populate("createdBy", "name email")
          .populate("collaborators", "name email");

        if (!note) {
          socket.emit("socket-error", { message: "Note not found" });
          return;
        }

        if (!canAccessNote(note, socket.userId)) {
          socket.emit("socket-error", {
            message: "Unauthorized access to this note",
          });
          return;
        }

        socket.join(noteId);
        socket.joinedNoteRooms.add(noteId);

        if (!activeUsers.has(noteId)) {
          activeUsers.set(noteId, new Map());
        }

        activeUsers.get(noteId).set(socket.id, {
          socketId: socket.id,
          userId: socket.userId,
          userName: socket.userName,
        });

        socket.emit("joined-note", { note });
        socket.to(noteId).emit("user-joined", {
          userId: socket.userId,
          userName: socket.userName,
        });
        io.to(noteId).emit("active-users", getRoomUsers(noteId));
      } catch (error) {
        socket.emit("socket-error", { message: "Error joining room" });
      }
    });

    socket.on(
      "note-update",
      async ({ noteId, content, version, clientUpdatedAt } = {}) => {
        try {
          if (
            !mongoose.Types.ObjectId.isValid(noteId) ||
            typeof content !== "string"
          ) {
            socket.emit("socket-error", { message: "Invalid note update" });
            return;
          }

          if (!socket.rooms.has(noteId)) {
            socket.emit("socket-error", {
              message: "Not authorized for this note",
            });
            return;
          }

          const incomingUpdatedAt = Number(clientUpdatedAt);
          const incomingVersion = Number(version);
          const currentLiveState = liveNoteState.get(noteId);

          if (
            !Number.isFinite(incomingUpdatedAt) ||
            !Number.isFinite(incomingVersion)
          ) {
            socket.emit("note-conflict", {
              noteId,
              message: "Invalid update ordering data",
            });
            return;
          }

          if (
            currentLiveState &&
            incomingUpdatedAt < currentLiveState.clientUpdatedAt
          ) {
            socket.emit("note-conflict", {
              noteId,
              latestUpdatedAt: currentLiveState.clientUpdatedAt,
              message: "Out-of-order update rejected",
            });
            return;
          }

          const note = await Note.findById(noteId);

          if (!note || !canAccessNote(note, socket.userId)) {
            socket.emit("socket-error", {
              message: "Unauthorized access to this note",
            });
            return;
          }

          if (incomingVersion !== note.version) {
            socket.emit("note-conflict", {
              noteId,
              currentVersion: note.version,
              message: "Stale note version rejected",
            });
            return;
          }

          const updatePayload = {
            _id: noteId,
            noteId,
            content,
            version: note.version,
            clientUpdatedAt: incomingUpdatedAt,
            author: {
              userId: socket.userId,
              userName: socket.userName,
            },
          };

          liveNoteState.set(noteId, {
            clientUpdatedAt: incomingUpdatedAt,
          });

          socket.to(noteId).emit("receive-note", updatePayload);
        } catch (error) {
          socket.emit("socket-error", { message: "Error syncing note update" });
        }
      }
    );

    socket.on("typing", ({ noteId } = {}) => {
      if (!mongoose.Types.ObjectId.isValid(noteId) || !socket.rooms.has(noteId)) {
        return;
      }

      socket.to(noteId).emit("user-typing", {
        noteId,
        userName: socket.userName,
        userId: socket.userId,
      });
    });

    socket.on("leave-note", ({ noteId } = {}) => {
      if (!mongoose.Types.ObjectId.isValid(noteId)) return;
      socket.joinedNoteRooms.delete(noteId);
      leaveNoteRoom(socket, noteId);
    });

    socket.on("disconnect", () => {
      for (const noteId of socket.joinedNoteRooms) {
        leaveNoteRoom(socket, noteId);
      }

      socket.joinedNoteRooms.clear();
    });
  });
};

module.exports = initializeSocket;

const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ["general", "event", "policy", "celebration", "urgent"], default: "general" },
  author: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);

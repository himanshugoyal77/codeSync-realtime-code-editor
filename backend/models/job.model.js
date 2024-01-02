const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ["cpp", "js", "py"],
  },
  filePath: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  output: {
    type: String,
  },
  status: {
    type: String,
    enum: ["error", "running", "success"],
    default: "running",
  },
});

const job = new mongoose.model("Job", JobSchema);

module.exports = job;

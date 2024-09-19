const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moment = require("moment-timezone");
const Evaluation = require("./evaluation");

const quizSchema = new Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chapterSchema = new mongoose.Schema({
  ChapterPhoto: String,
  ChapterTitle: String,
  ChapterVideo: String,
  ChapterContent: [Object],

  Files: [String],
  Quizzs: [quizSchema],
  createdAt: {
    type: String,
    default: () =>
      moment().utcOffset("+01:00").format("YYYY-MM-DD HH:mm:ss [GMT]Z"),
  },
});
module.exports = chapterSchema;

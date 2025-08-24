const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  instCode: String,
  institute: String,
  branchCode: String,
  distCode: String,
  rank: Number,
  category: String,
});

module.exports = mongoose.model("Student", studentSchema);

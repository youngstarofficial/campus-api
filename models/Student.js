const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  instCode: String,
  instituteName: String,
  place: String,
  distCode: String,
  coEducation: String,
  affiliatedTo: String,
  collegeType: String,
  branchCode: String,
  branchName: String,

  ocBoys: Number,
  ocGirls: Number,
  bcABoys: Number,
  bcAGirls: Number,
  bcBBoys: Number,
  bcBGirls: Number,
  bcCBoys: Number,
  bcCGirls: Number,
  bcDBoys: Number,
  bcDGirls: Number,
  bcEBoys: Number,
  bcEGirls: Number,
  scBoys: Number,
  scGirls: Number,
  stBoys: Number,
  stGirls: Number,
  ewsGenOu: Number,
  ewsGirlsOu: Number,

  tuitionFee: String,
});

module.exports = mongoose.model("Student", studentSchema);

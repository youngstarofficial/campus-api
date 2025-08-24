const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Replace with your actual Atlas connection string
const uri = "mongodb+srv://mercysikhinam:Rmr0623@cluster0.iulxagu.mongodb.net/campus?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Atlas Connection Error:", err));

// Schema (flexible to accept any fields in DB)
const studentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model("Student", studentSchema);

// Caste mapping (same as frontend)
const casteFieldMap = {
  "OC Boys": "ocBoys",
  "OC Girls": "ocGirls",
  "BC-A Boys": "bcABoys",
  "BC-A Girls": "bcAGirls",
  "BC-B Boys": "bcBBoys",
  "BC-B Girls": "bcBGirls",
  "BC-C Boys": "bcCBoys",
  "BC-C Girls": "bcCGirls",
  "BC-D Boys": "bcDBoys",
  "BC-D Girls": "bcDGirls",
  "BC-E Boys": "bcEBoys",
  "BC-E Girls": "bcEGirls",
  "SC Boys": "scBoys",
  "SC Girls": "scGirls",
  "ST Boys": "stBoys",
  "ST Girls": "stGirls",
  "EWS GEN OU": "ewsGenOu",
  "EWS Girls OU": "ewsGirlsOu",
};

// ✅ Route: Fetch Students
app.get("/students", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;
    let filter = {};

    if (branch) filter.branchCode = branch.toUpperCase();
    if (district) filter.distCode = district.toUpperCase();

    // ✅ Fix: caste + rank RANGE filtering
    if (caste) {
      const casteField = casteFieldMap[caste];

      if (minRank || maxRank) {
        filter[casteField] = {};
        if (minRank) filter[casteField]["$gte"] = parseInt(minRank);
        if (maxRank) filter[casteField]["$lte"] = parseInt(maxRank);
      } else {
        filter[casteField] = { $exists: true };
      }
    }

    // ✅ Debug logs
    console.log("📌 Filter being applied:", filter);

    const totalDocs = await Student.countDocuments();
    console.log("📌 Total docs in collection:", totalDocs);

    // 👉 If caste selected → sort by caste rank
    const sortField = caste ? casteFieldMap[caste] : "instCode";
    const students = await Student.find(filter).sort({ [sortField]: 1 });

    console.log("📌 After filter:", students.length);

    // ✅ Remove duplicates by instCode + branchCode
    const uniqueStudents = students.filter(
      (s, index, self) =>
        index === self.findIndex(
          (t) => t.instCode === s.instCode && t.branchCode === s.branchCode
        )
    );

    console.log("📌 Unique students:", uniqueStudents.length);

    res.json(uniqueStudents);
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});

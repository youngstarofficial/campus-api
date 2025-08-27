import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Connect MongoDB Atlas
mongoose
  .connect("your-mongo-uri-here", {  // <-- Replace with your Atlas connection string
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "campus",
  })
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Flexible schema
const studentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model("Student", studentSchema, "Students");

// Caste → DB Field Map
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

// Test route
app.get("/test", async (req, res) => {
  const students = await Student.find().limit(5);
  res.json(students);
});

// Students API with sorting
app.get("/students", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;
    let filter = {};
    let sort = {};

    if (branch) filter.branchCode = branch.toUpperCase();
    if (district) filter.distCode = district.toUpperCase();

    if (caste && casteFieldMap[caste]) {
      const field = casteFieldMap[caste];
      let rankCond = {};
      if (minRank) rankCond.$gte = parseInt(minRank);
      if (maxRank) rankCond.$lte = parseInt(maxRank);
      filter[field] = Object.keys(rankCond).length > 0 ? rankCond : { $exists: true };

      // ✅ Sort ascending by caste rank field
      sort[field] = 1;
    } else {
      // ✅ Fallback: sort by institute code alphabetically
      sort.instCode = 1;
    }

    const students = await Student.find(filter).sort(sort).lean();
    res.json(students);
  } catch (err) {
    console.error("❌ Error in /students:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ✅ Load .env for local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "campus", // make sure DB name is correct
  })
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Flexible Schema
const studentSchema = new mongoose.Schema({}, { strict: false });

// ✅ Explicitly use "Students" collection in "campus" DB
const Student = mongoose.model("Student", studentSchema, "Students");

// ✅ Caste → DB Field Map
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

// ✅ API Route
app.get("/students", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;
    let filter = {};

    // 🎯 Branch filter
    if (branch) filter.branchCode = branch.toUpperCase();

    // 🎯 District filter
    if (district) filter.distCode = district.toUpperCase();

    // 🎯 Caste + Rank filter
    if (caste) {
      const casteField = casteFieldMap[caste];
      if (casteField) {
        let rankCondition = {};
        if (minRank) rankCondition.$gte = parseInt(minRank);
        if (maxRank) rankCondition.$lte = parseInt(maxRank);

        // Apply condition if exists, else just check field exists
        filter[casteField] = Object.keys(rankCondition).length > 0 ? rankCondition : { $exists: true };
      }
    }

    console.log("📌 Final Query Filter:", JSON.stringify(filter, null, 2));

    const students = await Student.find(filter).lean();
    res.json(students);
  } catch (err) {
    console.error("❌ Error in /students:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

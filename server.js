import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection
const MONGO_URI =
  "mongodb+srv://mercysikhinam:Rmr2306@cluster0.iulxagu.mongodb.net/campus?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "campus",
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Flexible Schema
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

// ✅ Root route (for Render test)
app.get("/", (req, res) => {
  res.json({ message: "Backend is live!" });
});

// ✅ Students API
app.get("/students", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;
    let filter = {};

    if (branch) filter.branchCode = branch.toUpperCase();
    if (district) filter.distCode = district.toUpperCase();

    if (!caste || !casteFieldMap[caste]) {
      return res.status(400).json({ error: "Invalid caste selection" });
    }

    const casteField = casteFieldMap[caste];

    // 🔹 Build pipeline
    let pipeline = [{ $match: filter }];

    // Convert caste field safely to int
    pipeline.push({
      $addFields: {
        casteRank: {
          $cond: {
            if: { $regexMatch: { input: `$${casteField}`, regex: /^[0-9]+$/ } },
            then: { $toInt: `$${casteField}` },
            else: null,
          },
        },
      },
    });

    // Filter by min/max rank if provided
    let rankMatch = {};
    if (minRank) rankMatch.$gte = parseInt(minRank);
    if (maxRank) rankMatch.$lte = parseInt(maxRank);
    if (Object.keys(rankMatch).length > 0) {
      pipeline.push({ $match: { casteRank: rankMatch } });
    }

    // Sort ascending by casteRank
    pipeline.push({ $sort: { casteRank: 1 } });

    const students = await Student.aggregate(pipeline);

    res.json(students);
  } catch (err) {
    console.error("❌ Error in /students:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test OK" });
});

// ✅ Use Render's dynamic PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

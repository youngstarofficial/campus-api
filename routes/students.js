const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // update if using Atlas
const client = new MongoClient(uri);

router.get("/students", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("yourDB"); // change to your DB name
    const collection = db.collection("students");

    const { branch, caste, district, collegeType, minRank, maxRank } = req.query;

    // Build match filters
    let matchStage = {};
    if (branch && branch !== "All") matchStage.branch = branch;
    if (caste && caste !== "All") matchStage.caste = caste;
    if (district && district !== "All") matchStage.district = district;
    if (collegeType && collegeType !== "All") matchStage.collegeType = collegeType;
    if (minRank) matchStage.rank = { ...matchStage.rank, $gte: parseInt(minRank) };
    if (maxRank) matchStage.rank = { ...matchStage.rank, $lte: parseInt(maxRank) };

    // Aggregation pipeline
    const results = await collection
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              collegeName: "$collegeName",
              branch: "$branch",
              caste: "$caste",
              district: "$district",
            },
            minRank: { $min: "$rank" },
            maxRank: { $max: "$rank" },
          },
        },
        {
          $project: {
            _id: 0,
            collegeName: "$_id.collegeName",
            branch: "$_id.branch",
            caste: "$_id.caste",
            district: "$_id.district",
            minRank: 1,
            maxRank: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;

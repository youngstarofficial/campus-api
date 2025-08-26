const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); // adjust path if needed

// 🔹 Test route – check if Atlas is returning any docs
router.get("/test", async (req, res) => {
  try {
    const docs = await Student.find().limit(5);
    res.json(docs);
  } catch (err) {
    console.error("❌ Test route error:", err);
    res.status(500).send("Error fetching test data");
  }
});

// 🔹 Main students search route
router.get("/", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;

    let filter = {};

    if (branch) filter.branchCode = branch.toUpperCase();
    if (district) filter.distCode = district.toUpperCase();

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

    let pipeline = [{ $match: filter }];

    if (caste && casteFieldMap[caste]) {
      const casteField = `$${casteFieldMap[caste]}`;
      let expr = [];

      if (minRank) expr.push({ $gte: [casteField, parseInt(minRank)] });
      if (maxRank) expr.push({ $lte: [casteField, parseInt(maxRank)] });

      if (expr.length > 0) {
        pipeline.push({
          $match: {
            $expr: { $and: expr },
          },
        });
      }
    }

    // ✅ Deduplication step
    pipeline.push({
      $group: {
        _id: {
          instCode: "$instCode",
          branchCode: "$branchCode",
          distCode: "$distCode",
        },
        instCode: { $first: "$instCode" },
        instituteName: { $first: "$instituteName" },
        branchCode: { $first: "$branchCode" },
        distCode: { $first: "$distCode" },
        ocBoys: { $first: "$ocBoys" },
        ocGirls: { $first: "$ocGirls" },
        bcABoys: { $first: "$bcABoys" },
        bcAGirls: { $first: "$bcAGirls" },
        bcBBoys: { $first: "$bcBBoys" },
        bcBGirls: { $first: "$bcBGirls" },
        bcCBoys: { $first: "$bcCBoys" },
        bcCGirls: { $first: "$bcCGirls" },
        bcDBoys: { $first: "$bcDBoys" },
        bcDGirls: { $first: "$bcDGirls" },
        bcEBoys: { $first: "$bcEBoys" },
        bcEGirls: { $first: "$bcEGirls" },
        scBoys: { $first: "$scBoys" },
        scGirls: { $first: "$scGirls" },
        stBoys: { $first: "$stBoys" },
        stGirls: { $first: "$stGirls" },
        ewsGenOu: { $first: "$ewsGenOu" },
        ewsGirlsOu: { $first: "$ewsGirlsOu" },
      },
    });

    // ✅ Clean instCode for sorting (case-insensitive, no spaces)
    pipeline.push({
      $addFields: {
        sortCode: { $toUpper: { $trim: { input: "$instCode" } } }
      }
    });

    // ✅ Sort by instCode alphabetically
    pipeline.push({
      $sort: { sortCode: 1 }
    });

    console.log("📌 Pipeline:", JSON.stringify(pipeline, null, 2));

    const results = await Student.aggregate(pipeline).limit(200);
    res.json(results);
  } catch (err) {
    console.error("❌ Error in /students route:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;

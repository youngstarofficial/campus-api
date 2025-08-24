// students.js
const express = require("express");
const router = express.Router();
const Student = require("../models/Student"); // adjust path if needed

// 🔹 Main students search route
router.get("/", async (req, res) => {
  try {
    const { branch, district, caste, minRank, maxRank } = req.query;

    let filter = {};

    if (branch) filter.branchCode = branch.toUpperCase();
    if (district) filter.distCode = district.toUpperCase();

    // caste field map
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

    // 🔹 Apply caste + rank filter
    if (caste && casteFieldMap[caste]) {
      const casteField = `$${casteFieldMap[caste]}`;
      let expr = [];

      if (minRank) expr.push({ $gte: [casteField, parseInt(minRank)] });
      if (maxRank) expr.push({ $lte: [casteField, parseInt(maxRank)] });

      if (expr.length > 0) {
        pipeline.push({
          $match: { $expr: { $and: expr } },
        });
      }
    }

    // ✅ Deduplicate by grouping on instCode, instituteName, branchCode, distCode
    pipeline.push({
      $group: {
        _id: {
          instCode: "$instCode",
          instituteName: "$instituteName",
          branchCode: "$branchCode",
          distCode: "$distCode",
        },
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

    // ✅ Flatten back (remove _id nesting)
    pipeline.push({
      $project: {
        _id: 0,
        instCode: "$_id.instCode",
        instituteName: "$_id.instituteName",
        branchCode: "$_id.branchCode",
        distCode: "$_id.distCode",
        ocBoys: 1,
        ocGirls: 1,
        bcABoys: 1,
        bcAGirls: 1,
        bcBBoys: 1,
        bcBGirls: 1,
        bcCBoys: 1,
        bcCGirls: 1,
        bcDBoys: 1,
        bcDGirls: 1,
        bcEBoys: 1,
        bcEGirls: 1,
        scBoys: 1,
        scGirls: 1,
        stBoys: 1,
        stGirls: 1,
        ewsGenOu: 1,
        ewsGirlsOu: 1,
      },
    });

    console.log("📌 Pipeline being applied:", JSON.stringify(pipeline, null, 2));

    const results = await Student.aggregate(pipeline).limit(200);
    res.json(results);
  } catch (err) {
    console.error("❌ Error in /students route:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;

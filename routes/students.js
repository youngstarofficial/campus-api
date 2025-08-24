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

    // ✅ Deduplication: group by key fields
    pipeline.push({
      $group: {
        _id: {
          instCode: "$instCode",
          branchCode: "$branchCode",
          distCode: "$distCode",
        },
        doc: { $first: "$$ROOT" },
      },
    });

    pipeline.push({ $replaceRoot: { newRoot: "$doc" } });

    console.log("📌 Pipeline being applied:", JSON.stringify(pipeline, null, 2));

    const results = await Student.aggregate(pipeline).limit(200);
    res.json(results);
  } catch (err) {
    console.error("❌ Error in /students route:", err);
    res.status(500).send("Server error");
  }
});


module.exports = router;

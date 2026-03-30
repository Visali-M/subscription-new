const express = require("express");
const router  = express.Router();
const {
  getSubscriptions, getSubscriptionById,
  createSubscription, updateSubscription, deleteSubscription,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/",    getSubscriptions);
router.post("/",   createSubscription);
router.get("/:id", getSubscriptionById);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;

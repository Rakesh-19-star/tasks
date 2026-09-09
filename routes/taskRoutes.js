const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getTasks,
    createTask,
    getSingleTask,
    updateTask,
    patchTask,
    deleteTask
} = require("../controller/taskController");


router.get("/", verifyToken, getTasks);

router.post("/", verifyToken, createTask);

router.get("/:taskId", verifyToken, getSingleTask);

router.put("/:taskId", verifyToken, updateTask);

router.patch("/:taskId/status", verifyToken, patchTask);

router.delete("/:taskId", verifyToken, deleteTask);


module.exports = router;
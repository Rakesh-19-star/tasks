const express = require("express");

const router = express.Router();

const db = require("../src/database");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const { error } = require("proc-log");


// ======================================================
// GET ALL USERS
// GET /api/admin/users
// ======================================================

router.get("/users", verifyToken, verifyAdmin, (req, res) => {

    // -----------------------------------------
    // 1. Get pagination values
    // -----------------------------------------

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    const { search = "" } = req.query;


    // -----------------------------------------
    // 2. Calculate offset
    // -----------------------------------------

    const offset = (page - 1) * limit;


    // -----------------------------------------
    // 3. Prepare search value
    // -----------------------------------------

    const searchValue = `%${search}%`;


    // -----------------------------------------
    // 4. Count matching users
    // -----------------------------------------

    const countSql = `
        SELECT COUNT(*) AS totalUsers
        FROM users
        WHERE name LIKE ?
    `;

    db.get(
        countSql,
        [searchValue],
        (error, result) => {

            if (error) {

                console.error(
                    "Error counting users:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to count users"
                });
            }


            const totalUsers = result.totalUsers;

            const totalPages = Math.ceil(
                totalUsers / limit
            );


            // -----------------------------------------
            // 5. Get users
            // -----------------------------------------

            const usersSql = `
                SELECT
                    id,
                    name,
                    email,
                    role,
                    created_at
                FROM users
                WHERE name LIKE ?
                ORDER BY created_at DESC
                LIMIT ?
                OFFSET ?
            `;


            db.all(
                usersSql,
                [searchValue, limit, offset],
                (error, users) => {

                    if (error) {

                        console.error(
                            "Error fetching users:",
                            error.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to fetch users"
                        });
                    }


                    return res.status(200).json({

                        success: true,

                        message: "Users fetched successfully",

                        users: users,

                        pagination: {
                            currentPage: page,
                            limit: limit,
                            totalUsers: totalUsers,
                            totalPages: totalPages
                        }

                    });

                }
            );

        }
    );

});

router.get("/users/:userId/tasks", verifyToken, verifyAdmin, (req, res) => {

    // Get user ID from URL
    const { userId } = req.params;

    const sql = `
        SELECT
            id,
            user_id,
            title,
            description,
            status,
            created_at
        FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [userId], (error, tasks) => {

        if (error) {

            console.error("Error fetching tasks:", error.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch user tasks"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User tasks fetched successfully",
            userId: userId,
            tasks: tasks
        });

    });

});

router.delete("/users/:userId", verifyToken, verifyAdmin, (req, res) => {

    const { userId } = req.params;

    // First check whether the user exists
    const checkUserSql = `
        SELECT id, name, email, role
        FROM users
        WHERE id = ?
    `;

    db.get(checkUserSql, [userId], (error, user) => {

        if (error) {
            console.error(error.message);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Don't allow admin to delete another admin
        if (user.role === "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot be deleted"
            });
        }

        // Delete user's tasks first
        const deleteTasksSql = `
            DELETE FROM tasks
            WHERE user_id = ?
        `;

        db.run(deleteTasksSql, [userId], function (error) {

            if (error) {
                console.error(error.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete user's tasks"
                });
            }

            // Now delete the user
            const deleteUserSql = `
                DELETE FROM users
                WHERE id = ?
            `;

            db.run(deleteUserSql, [userId], function (error) {

                if (error) {
                    console.error(error.message);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to delete user"
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "User deleted successfully",
                    userId: userId,
                    deletedTasks: this.changes
                });

            });

        });

    });

});

router.delete("/tasks/:taskId", verifyToken, verifyAdmin, (req, res) => {

    const { taskId } = req.params;

    // 1. Check whether the task exists
    const checkTaskSql = `
        SELECT id, user_id, title
        FROM tasks
        WHERE id = ?
    `;

    db.get(checkTaskSql, [taskId], (error, task) => {

        if (error) {

            console.error(
                "Error checking task:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        // 2. Task doesn't exist
        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // 3. Delete the task
        const deleteTaskSql = `
            DELETE FROM tasks
            WHERE id = ?
        `;

        db.run(deleteTaskSql, [taskId], function (error) {

            if (error) {

                console.error(
                    "Error deleting task:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete task"
                });
            }

            // 4. Success
            return res.status(200).json({
                success: true,
                message: "Task deleted successfully",
                taskId: taskId,
                task: task.title
            });

        });

    });

});

router.get("/tasks", verifyToken, verifyAdmin, (req, res) => {

    // -----------------------------------------
    // 1. Get query parameters
    // -----------------------------------------

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 5;

    const { status = null } = req.query;


    // -----------------------------------------
    // 2. Calculate OFFSET
    // -----------------------------------------

    const offset = (page - 1) * limit;


    // -----------------------------------------
    // 3. Count total tasks
    // -----------------------------------------

    const countSql = `
        SELECT COUNT(*) AS totalTasks
        FROM tasks
        WHERE (? IS NULL OR status = ?)
    `;


    db.get(
        countSql,
        [status, status],
        (error, result) => {

            if (error) {

                console.error(
                    "Error counting tasks:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to count tasks"
                });
            }


            const totalTasks = result.totalTasks;

            const totalPages = Math.ceil(
                totalTasks / limit
            );


            // -----------------------------------------
            // 4. Get tasks
            // -----------------------------------------

            const tasksSql = `
                SELECT
                    tasks.id AS task_id,
                    tasks.title,
                    tasks.description,
                    tasks.status,
                    tasks.created_at,

                    users.id AS user_id,
                    users.name AS user_name,
                    users.email AS user_email

                FROM tasks

                JOIN users
                ON tasks.user_id = users.id

                WHERE (? IS NULL OR tasks.status = ?)

                ORDER BY tasks.created_at DESC

                LIMIT ?
                OFFSET ?
            `;


            db.all(
                tasksSql,
                [
                    status,
                    status,
                    limit,
                    offset
                ],
                (error, tasks) => {

                    if (error) {

                        console.error(
                            "Error fetching tasks:",
                            error.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to fetch tasks"
                        });
                    }


                    // -----------------------------------------
                    // 5. Send response
                    // -----------------------------------------

                    return res.status(200).json({

                        success: true,

                        message: "Tasks fetched successfully",

                        tasks: tasks,

                        pagination: {
                            currentPage: page,
                            limit: limit,
                            totalTasks: totalTasks,
                            totalPages: totalPages
                        }

                    });

                }
            );

        }
    );

});
module.exports = router;
const db = require("../src/database");

const getTasks = (req, res) => {
  const userId = req.user.userId;

  const sql = `
        SELECT *
        FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

  db.all(sql, [userId], (error, tasks) => {
    if (error) {
      console.error("Error fetching tasks:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks: tasks,
    });
  });
};

const createTask = async (req, res) => {
  const { title, description, status } = req.body;

  const userId = req.user.userId;

  const taskStatus = status || "pending"; //if provided it takes the value of taskstatus or else it get pending satus deafalut

  const sql = `
        INSERT INTO tasks (user_id, title, description, status)
        VALUES (?, ?, ?, ?)
    `;

  db.run(sql, [userId, title, description, taskStatus], function (error) {
    if (error) {
      console.error("Task creation error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to create task",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      taskId: this.lastID,
    });
  });
};

const  getSingleTask=(req,res)=>{
     const { taskId } = req.params;

  const userId = req.user.userId;

  const sql = `
        SELECT *
        FROM tasks
        WHERE id = ?
        AND user_id = ?
    `;

  db.get(sql, [taskId, userId], (error, task) => {
    if (error) {
      console.error("Error fetching task:", error.message);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Single task",
      task: task,
    });
  });
}

const updateTask = (req, res) => {

    const { taskId } = req.params;

    const { title, description, status } = req.body;

    const userId = req.user.userId;

    const sql = `
        UPDATE tasks
        SET
            title = ?,
            description = ?,
            status = ?
        WHERE id = ?
        AND user_id = ?
    `;

    db.run(
        sql,
        [title, description, status, taskId, userId],
        function (error) {

            if (error) {

                console.error(
                    "Error updating task:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update task"
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Task updated successfully",
                taskId: taskId
            });
        }
    );
};

const patchTask=(req,res)=>{
     const { taskId } = req.params;

  const { status } = req.body;

  const userId = req.user.userId;

  const sql = `
        UPDATE tasks
        SET status = ?
        WHERE id = ?
        AND user_id = ?
    `;

  db.run(sql, [status, taskId, userId], function (error) {
    if (error) {
      console.error("Error updating task status:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update task status",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      taskId: taskId,
      status: status,
    });
  });
}

const deleteTask=(req,res)=>{
     const { taskId } = req.params;

  const userId = req.user.userId;

  const sql = `
        DELETE FROM tasks
        WHERE id = ?
        AND user_id = ?
    `;

  db.run(sql, [taskId, userId], function (error) {
    if (error) {
      console.error("Error deleting task:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to delete task",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      taskId: taskId,
    });
  });
}

module.exports = {
  getTasks,createTask,getSingleTask,updateTask,patchTask,deleteTask
};

const API_URL = "https://cftoolbackend.duckdns.org/api/tasks";

class TaskService {
  async getAllTasks() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  async getAllTaskIds() {
    const tasks = await this.getAllTasks();
    return tasks.map((t) => t.taskId);
  }

  async saveTask(taskData) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error("Failed to save task");
    return res.json();
  }

  async updateTask(taskId, updatedData) {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  }

  async deleteTask(taskId) {
    const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
    return res.json();
  }

  async getTaskById(taskId) {
    const res = await fetch(`${API_URL}/${taskId}`);
    if (!res.ok) throw new Error("Task not found");
    return res.json();
  }
}

export default new TaskService();

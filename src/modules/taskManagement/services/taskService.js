// const API_URL = `${process.env.NEXT_PUBLIC_SP}/task-service/api/tasks`;


// class TaskService {
//   constructor() {
//     this.username = "username";
//     this.password = "password";
//   }


//   getAuthHeader() {
//     const token = btoa(`${this.username}:${this.password}`);
//     return { Authorization: `Basic ${token}` };
//   }


//   // ── Tasks ──────────────────────────────────────────────────


//   async getAllTasks() {
//     const res = await fetch(API_URL, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//     });
//     if (!res.ok) throw new Error("Failed to fetch tasks");
//     return res.json();
//   }


//   async getAllTaskIds() {
//     const tasks = await this.getAllTasks();
//     return tasks.map((t) => t.taskId);
//   }


//   async saveTask(taskData, changedBy = "System") {
//     const res = await fetch(`${API_URL}?changedBy=${encodeURIComponent(changedBy)}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//       body: JSON.stringify(taskData),
//     });
//     if (!res.ok) throw new Error("Failed to save task");
//     return res.json();
//   }


//   async updateTask(taskId, updatedData, changedBy = "System") {
//     const res = await fetch(`${API_URL}/${taskId}?changedBy=${encodeURIComponent(changedBy)}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//       body: JSON.stringify(updatedData),
//     });
//     if (!res.ok) throw new Error("Failed to update task");
//     return res.json();
//   }


//   async deleteTask(taskId, changedBy = "System") {
//     const res = await fetch(`${API_URL}/${taskId}?changedBy=${encodeURIComponent(changedBy)}`, {
//       method: "DELETE",
//       headers: { ...this.getAuthHeader() },
//       credentials: "include",
//     });
//     if (!res.ok) throw new Error("Failed to delete task");
//     return res.text();
//   }


//   async getTaskById(taskId) {
//     const res = await fetch(`${API_URL}/${taskId}`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//     });
//     if (!res.ok) throw new Error("Task not found");
//     return res.json();
//   }


//   // ── Logs ───────────────────────────────────────────────────


//   async getTaskLogs(taskId, changeType = null) {
//     const url = changeType
//       ? `${API_URL}/${taskId}/logs?changeType=${changeType}`
//       : `${API_URL}/${taskId}/logs`;
//     const res = await fetch(url, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//     });
//     if (!res.ok) throw new Error("Failed to fetch task logs");
//     return res.json();
//   }


//   // ── SubTasks ───────────────────────────────────────────────


//   async getSubTasks(parentTaskId) {
//     const res = await fetch(`${API_URL}/${parentTaskId}/subtasks`, {
//       method: "GET",
//       headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//       credentials: "include",
//     });
//     if (!res.ok) throw new Error("Failed to fetch subtasks");
//     return res.json();
//   }


//   async createSubTask(parentTaskId, subTaskData, changedBy = "System") {
//     const res = await fetch(
//       `${API_URL}/${parentTaskId}/subtasks?changedBy=${encodeURIComponent(changedBy)}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//         credentials: "include",
//         body: JSON.stringify(subTaskData),
//       }
//     );
//     if (!res.ok) throw new Error("Failed to create subtask");
//     return res.json();
//   }


//   async updateSubTask(parentTaskId, subTaskId, updatedData, changedBy = "System") {
//     const res = await fetch(
//       `${API_URL}/${parentTaskId}/subtasks/${subTaskId}?changedBy=${encodeURIComponent(changedBy)}`,
//       {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
//         credentials: "include",
//         body: JSON.stringify(updatedData),
//       }
//     );
//     if (!res.ok) throw new Error("Failed to update subtask");
//     return res.json();
//   }


//   async deleteSubTask(parentTaskId, subTaskId, changedBy = "System") {
//     const res = await fetch(
//       `${API_URL}/${parentTaskId}/subtasks/${subTaskId}?changedBy=${encodeURIComponent(changedBy)}`,
//       {
//         method: "DELETE",
//         headers: { ...this.getAuthHeader() },
//         credentials: "include",
//       }
//     );
//     if (!res.ok) throw new Error("Failed to delete subtask");
//     return res.text();
//   }
// }


// export default new TaskService();


const API_URL = `${process.env.NEXT_PUBLIC_SP}/task-service/api/tasks`;


class TaskService {
  constructor() {
    this.username = "username";
    this.password = "password";
  }


  getAuthHeader() {
    const token = btoa(`${this.username}:${this.password}`);
    return { Authorization: `Basic ${token}` };
  }


  // ── Tasks ──────────────────────────────────────────────────


  // CHANGED: now accepts optional query params (e.g. { archived: true }) —
  // existing calls with no args keep working exactly as before.
  async getAllTasks(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const url = qs.toString() ? `${API_URL}?${qs.toString()}` : API_URL;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }


  // NEW: convenience wrapper for the Archive/Bin screen
  async getArchivedTasks() {
    return this.getAllTasks({ archived: true });
  }


  async getAllTaskIds() {
    const tasks = await this.getAllTasks();
    return tasks.map((t) => t.taskId);
  }


  async saveTask(taskData, changedBy = "System") {
    const res = await fetch(`${API_URL}?changedBy=${encodeURIComponent(changedBy)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error("Failed to save task");
    return res.json();
  }


  async updateTask(taskId, updatedData, changedBy = "System") {
    const res = await fetch(`${API_URL}/${taskId}?changedBy=${encodeURIComponent(changedBy)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  }


  // NEW: soft-delete — moves a task into the archive/bin
  async archiveTask(taskId, changedBy = "System") {
    const res = await fetch(
      `${API_URL}/${taskId}/archive?changedBy=${encodeURIComponent(changedBy)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to archive task");
    return res.json();
  }


  // NEW: brings a task back out of the archive/bin
  async restoreTask(taskId, changedBy = "System") {
    const res = await fetch(
      `${API_URL}/${taskId}/restore?changedBy=${encodeURIComponent(changedBy)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to restore task");
    return res.json();
  }


  // CHANGED (behavior, not code): this now only succeeds server-side if the
  // task is already archived — see TaskController.deleteTask's new guard.
  // The frontend should only ever call this from the Archive/Bin screen.
  async deleteTask(taskId, changedBy = "System") {
    const res = await fetch(`${API_URL}/${taskId}?changedBy=${encodeURIComponent(changedBy)}`, {
      method: "DELETE",
      headers: { ...this.getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete task");
    return res.text();
  }


  async getTaskById(taskId) {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Task not found");
    return res.json();
  }


  // ── Logs ───────────────────────────────────────────────────


  async getTaskLogs(taskId, changeType = null) {
    const url = changeType
      ? `${API_URL}/${taskId}/logs?changeType=${changeType}`
      : `${API_URL}/${taskId}/logs`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch task logs");
    return res.json();
  }


  // ── SubTasks ───────────────────────────────────────────────


  async getSubTasks(parentTaskId) {
    const res = await fetch(`${API_URL}/${parentTaskId}/subtasks`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch subtasks");
    return res.json();
  }


  async createSubTask(parentTaskId, subTaskData, changedBy = "System") {
    const res = await fetch(
      `${API_URL}/${parentTaskId}/subtasks?changedBy=${encodeURIComponent(changedBy)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
        credentials: "include",
        body: JSON.stringify(subTaskData),
      }
    );
    if (!res.ok) throw new Error("Failed to create subtask");
    return res.json();
  }


  async updateSubTask(parentTaskId, subTaskId, updatedData, changedBy = "System") {
    const res = await fetch(
      `${API_URL}/${parentTaskId}/subtasks/${subTaskId}?changedBy=${encodeURIComponent(changedBy)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...this.getAuthHeader() },
        credentials: "include",
        body: JSON.stringify(updatedData),
      }
    );
    if (!res.ok) throw new Error("Failed to update subtask");
    return res.json();
  }


  async deleteSubTask(parentTaskId, subTaskId, changedBy = "System") {
    const res = await fetch(
      `${API_URL}/${parentTaskId}/subtasks/${subTaskId}?changedBy=${encodeURIComponent(changedBy)}`,
      {
        method: "DELETE",
        headers: { ...this.getAuthHeader() },
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to delete subtask");
    return res.text();
  }
}


export default new TaskService();
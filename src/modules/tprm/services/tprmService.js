// const TPRM_BASE = `${process.env.NEXT_PUBLIC_SP}/tprm-service/api/tprm`;

// class TprmService {

//   // ── FILE SERVING ──────────────────────────────────────────
//   // Converts local file path to a servable URL via backend
//   getFileUrl(path) {
//     if (!path) return null;
//     return `${TPRM_BASE}/questionnaires/files?path=${encodeURIComponent(path)}`;
//   }

//   // ── QUESTIONS ─────────────────────────────────────────────

//   async getQuestions(organization, category = "") {
//     try {
//       let url = `${TPRM_BASE}/questions?organization=${organization}`;
//       if (category) url += `&category=${category}`;
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch questions");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching questions:", err);
//       return [];
//     }
//   }

//   async createQuestion(question, createdBy, organization) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questions?createdBy=${createdBy}&organization=${organization}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(question),
//         }
//       );
//       if (!res.ok) throw new Error("Failed to create question");
//       return await res.json();
//     } catch (err) {
//       console.error("Error creating question:", err);
//       throw err;
//     }
//   }

//   async updateQuestion(id, question, organization) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questions/${id}?organization=${organization}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(question),
//         }
//       );
//       if (!res.ok) throw new Error("Failed to update question");
//       return await res.json();
//     } catch (err) {
//       console.error("Error updating question:", err);
//       throw err;
//     }
//   }

//   async deleteQuestion(id, organization) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questions/${id}?organization=${organization}`,
//         { method: "DELETE" }
//       );
//       if (!res.ok) throw new Error("Failed to delete question");
//       return true;
//     } catch (err) {
//       console.error("Error deleting question:", err);
//       return false;
//     }
//   }

//   async seedQuestions(questions) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questions/seed`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(questions),
//       });
//       if (!res.ok) throw new Error("Failed to seed questions");
//       return await res.json();
//     } catch (err) {
//       console.error("Error seeding questions:", err);
//       throw err;
//     }
//   }

//   // ── QUESTIONNAIRES ────────────────────────────────────────

//   async getQuestionnaires(organization, status = "") {
//     try {
//       let url = `${TPRM_BASE}/questionnaires?organization=${organization}`;
//       if (status) url += `&status=${status}`;
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch questionnaires");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching questionnaires:", err);
//       return [];
//     }
//   }

//   async getQuestionnaire(id) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`);
//       if (!res.ok) throw new Error("Failed to fetch questionnaire");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching questionnaire:", err);
//       return null;
//     }
//   }

//   async createQuestionnaire(data) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to create questionnaire");
//       }
//       return await res.json();
//     } catch (err) {
//       console.error("Error creating questionnaire:", err);
//       throw err;
//     }
//   }

//   async updateQuestionnaire(id, data) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error("Failed to update questionnaire");
//       return await res.json();
//     } catch (err) {
//       console.error("Error updating questionnaire:", err);
//       throw err;
//     }
//   }

//   async sendQuestionnaire(id) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}/send`, {
//         method: "POST",
//       });
//       if (!res.ok) throw new Error("Failed to send questionnaire");
//       return await res.json();
//     } catch (err) {
//       console.error("Error sending questionnaire:", err);
//       throw err;
//     }
//   }

//   async getResponses(id) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}/responses`);
//       if (!res.ok) throw new Error("Failed to fetch responses");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching responses:", err);
//       return [];
//     }
//   }

//   async approveQuestionnaire(id, comment, reviewedBy) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}/approve`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ comment, reviewedBy }),
//       });
//       if (!res.ok) throw new Error("Failed to approve questionnaire");
//       return await res.json();
//     } catch (err) {
//       console.error("Error approving questionnaire:", err);
//       throw err;
//     }
//   }

//   async rejectQuestionnaire(id, comment, reviewedBy) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}/reject`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ comment, reviewedBy }),
//       });
//       if (!res.ok) throw new Error("Failed to reject questionnaire");
//       return await res.json();
//     } catch (err) {
//       console.error("Error rejecting questionnaire:", err);
//       throw err;
//     }
//   }

//   // ── Admin submits per-question Accept/Reject ──────────────
//   async submitReview(questionnaireId, reviewItems, reviewedBy = "") {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/${questionnaireId}/review?reviewedBy=${encodeURIComponent(reviewedBy)}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(reviewItems),
//         }
//       );
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to submit review");
//       }
//       return await res.json();
//     } catch (err) {
//       console.error("Error submitting review:", err);
//       throw err;
//     }
//   }

//   async deleteQuestionnaire(id) {
//     try {
//       const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Failed to delete questionnaire");
//       return true;
//     } catch (err) {
//       console.error("Error deleting questionnaire:", err);
//       return false;
//     }
//   }

//   async getStats(organization) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/stats?organization=${organization}`
//       );
//       if (!res.ok) throw new Error("Failed to fetch stats");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching stats:", err);
//       return { total: 0, draft: 0, sent: 0, submitted: 0, approved: 0, rejected: 0 };
//     }
//   }

//   // ── VENDOR ────────────────────────────────────────────────

//   async getVendorQuestionnaires(vendorId, status = "") {
//     try {
//       let url = `${TPRM_BASE}/questionnaires/vendor/${vendorId}`;
//       if (status) url += `?status=${status}`;
//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch vendor questionnaires");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching vendor questionnaires:", err);
//       return [];
//     }
//   }

//   async getMyResponses(questionnaireId) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/${questionnaireId}/my-responses`
//       );
//       if (!res.ok) throw new Error("Failed to fetch my responses");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching my responses:", err);
//       return [];
//     }
//   }

//   async saveAnswer(questionnaireId, questionId, availability, description, file = null) {
//     try {
//       const formData = new FormData();
//       formData.append("questionId", questionId);
//       if (availability) formData.append("availability", availability);
//       if (description) formData.append("descriptionOfPractice", description);
//       if (file) formData.append("referenceDocument", file);

//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/${questionnaireId}/save-answer`,
//         { method: "POST", body: formData }
//       );
//       if (!res.ok) throw new Error("Failed to save answer");
//       return await res.json();
//     } catch (err) {
//       console.error("Error saving answer:", err);
//       throw err;
//     }
//   }

//   async submitQuestionnaire(questionnaireId) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/${questionnaireId}/submit`,
//         { method: "POST" }
//       );
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to submit questionnaire");
//       }
//       return await res.json();
//     } catch (err) {
//       console.error("Error submitting questionnaire:", err);
//       throw err;
//     }
//   }

//   // ── Vendor resubmits only rejected questions ──────────────
//   async resubmitQuestionnaire(questionnaireId) {
//     try {
//       const res = await fetch(
//         `${TPRM_BASE}/questionnaires/${questionnaireId}/resubmit`,
//         { method: "POST" }
//       );
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to resubmit questionnaire");
//       }
//       return await res.json();
//     } catch (err) {
//       console.error("Error resubmitting questionnaire:", err);
//       throw err;
//     }
//   }
// }

// export default new TprmService();

const TPRM_BASE = `https://api.calvant.com/tprm-service/api/tprm`;

// Basic auth credentials matching your application.properties
const AUTH_HEADER = "Basic " + btoa("username:password");

class TprmService {

  // ── FILE SERVING ──────────────────────────────────────────
  getFileUrl(path) {
    if (!path) return null;
    return `${TPRM_BASE}/questionnaires/files?path=${encodeURIComponent(path)}`;
  }

  // ── QUESTIONS ─────────────────────────────────────────────

  async getQuestions(organization, category = "") {
    try {
      let url = `${TPRM_BASE}/questions?organization=${organization}`;
      if (category) url += `&category=${category}`;
      const res = await fetch(url, {
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to fetch questions");
      return await res.json();
    } catch (err) {
      console.error("Error fetching questions:", err);
      return [];
    }
  }

  async createQuestion(question, createdBy, organization) {
    try {
      const res = await fetch(
        `${TPRM_BASE}/questions?createdBy=${createdBy}&organization=${organization}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": AUTH_HEADER
          },
          body: JSON.stringify(question),
        }
      );
      if (!res.ok) throw new Error("Failed to create question");
      return await res.json();
    } catch (err) {
      console.error("Error creating question:", err);
      throw err;
    }
  }

  async updateQuestion(id, question, organization) {
    try {
      const res = await fetch(
        `${TPRM_BASE}/questions/${id}?organization=${organization}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": AUTH_HEADER
          },
          body: JSON.stringify(question),
        }
      );
      if (!res.ok) throw new Error("Failed to update question");
      return await res.json();
    } catch (err) {
      console.error("Error updating question:", err);
      throw err;
    }
  }

  async deleteQuestion(id, organization) {
    try {
      const res = await fetch(
        `${TPRM_BASE}/questions/${id}?organization=${organization}`,
        {
          method: "DELETE",
          headers: { "Authorization": AUTH_HEADER }
        }
      );
      if (!res.ok) throw new Error("Failed to delete question");
      return true;
    } catch (err) {
      console.error("Error deleting question:", err);
      return false;
    }
  }

  async seedQuestions(questions) {
    try {
      const res = await fetch(`${TPRM_BASE}/questions/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify(questions),
      });
      if (!res.ok) throw new Error("Failed to seed questions");
      return await res.json();
    } catch (err) {
      console.error("Error seeding questions:", err);
      throw err;
    }
  }

  // ── QUESTIONNAIRES ────────────────────────────────────────

  async getQuestionnaires(organization, status = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires?organization=${organization}`;
      if (status) url += `&status=${status}`;
      const res = await fetch(url, {
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to fetch questionnaires");
      return await res.json();
    } catch (err) {
      console.error("Error fetching questionnaires:", err);
      return [];
    }
  }

  async getQuestionnaire(id) {
    try {
      const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`, {
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to fetch questionnaire");
      return await res.json();
    } catch (err) {
      console.error("Error fetching questionnaire:", err);
      return null;
    }
  }

  async createQuestionnaire(data) {
    try {
      const res = await fetch(`${TPRM_BASE}/questionnaires`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create questionnaire");
      }
      return await res.json();
    } catch (err) {
      console.error("Error creating questionnaire:", err);
      throw err;
    }
  }

  async updateQuestionnaire(id, data) {
    try {
      const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update questionnaire");
      return await res.json();
    } catch (err) {
      console.error("Error updating questionnaire:", err);
      throw err;
    }
  }

  // ── SEND (DRAFT → SENT) — notifies vendor ─────────────────
  async sendQuestionnaire(id, adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${id}/send`;
      if (adminEmail) url += `?adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to send questionnaire");
      return await res.json();
    } catch (err) {
      console.error("Error sending questionnaire:", err);
      throw err;
    }
  }

  async getResponses(id) {
    try {
      const res = await fetch(`${TPRM_BASE}/questionnaires/${id}/responses`, {
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return await res.json();
    } catch (err) {
      console.error("Error fetching responses:", err);
      return [];
    }
  }

  // ── APPROVE — notifies vendor ──────────────────────────────
  async approveQuestionnaire(id, comment, reviewedBy, adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${id}/approve`;
      if (adminEmail) url += `?adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify({ comment, reviewedBy }),
      });
      if (!res.ok) throw new Error("Failed to approve questionnaire");
      return await res.json();
    } catch (err) {
      console.error("Error approving questionnaire:", err);
      throw err;
    }
  }

  // ── REJECT — notifies vendor ───────────────────────────────
  async rejectQuestionnaire(id, comment, reviewedBy, adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${id}/reject`;
      if (adminEmail) url += `?adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify({ comment, reviewedBy }),
      });
      if (!res.ok) throw new Error("Failed to reject questionnaire");
      return await res.json();
    } catch (err) {
      console.error("Error rejecting questionnaire:", err);
      throw err;
    }
  }

  // ── REVIEW (SUBMITTED → UNDER_REVIEW) — notifies vendor ───
  async submitReview(questionnaireId, reviewItems, reviewedBy = "", adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${questionnaireId}/review?reviewedBy=${encodeURIComponent(reviewedBy)}`;
      if (adminEmail) url += `&adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": AUTH_HEADER
        },
        body: JSON.stringify(reviewItems),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit review");
      }
      return await res.json();
    } catch (err) {
      console.error("Error submitting review:", err);
      throw err;
    }
  }

  async deleteQuestionnaire(id) {
    try {
      const res = await fetch(`${TPRM_BASE}/questionnaires/${id}`, {
        method: "DELETE",
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to delete questionnaire");
      return true;
    } catch (err) {
      console.error("Error deleting questionnaire:", err);
      return false;
    }
  }

  async getStats(organization) {
    try {
      const res = await fetch(
        `${TPRM_BASE}/questionnaires/stats?organization=${organization}`,
        { headers: { "Authorization": AUTH_HEADER } }
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    } catch (err) {
      console.error("Error fetching stats:", err);
      return { total: 0, draft: 0, sent: 0, submitted: 0, approved: 0, rejected: 0 };
    }
  }

  // ── VENDOR ────────────────────────────────────────────────

  async getVendorQuestionnaires(vendorId, status = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/vendor/${vendorId}`;
      if (status) url += `?status=${status}`;
      const res = await fetch(url, {
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) throw new Error("Failed to fetch vendor questionnaires");
      return await res.json();
    } catch (err) {
      console.error("Error fetching vendor questionnaires:", err);
      return [];
    }
  }

  async getMyResponses(questionnaireId) {
    try {
      const res = await fetch(
        `${TPRM_BASE}/questionnaires/${questionnaireId}/my-responses`,
        { headers: { "Authorization": AUTH_HEADER } }
      );
      if (!res.ok) throw new Error("Failed to fetch my responses");
      return await res.json();
    } catch (err) {
      console.error("Error fetching my responses:", err);
      return [];
    }
  }

  async saveAnswer(questionnaireId, questionId, availability, description, file = null) {
    try {
      const formData = new FormData();
      formData.append("questionId", questionId);
      if (availability) formData.append("availability", availability);
      if (description)  formData.append("descriptionOfPractice", description);
      if (file)         formData.append("referenceDocument", file);

      const res = await fetch(
        `${TPRM_BASE}/questionnaires/${questionnaireId}/save-answer`,
        {
          method: "POST",
          headers: { "Authorization": AUTH_HEADER },
          body: formData
        }
      );
      if (!res.ok) throw new Error("Failed to save answer");
      return await res.json();
    } catch (err) {
      console.error("Error saving answer:", err);
      throw err;
    }
  }

  // ── SUBMIT (SENT → SUBMITTED) — notifies admin ─────────────
  async submitQuestionnaire(questionnaireId, adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${questionnaireId}/submit`;
      if (adminEmail) url += `?adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit questionnaire");
      }
      return await res.json();
    } catch (err) {
      console.error("Error submitting questionnaire:", err);
      throw err;
    }
  }

  // ── RESUBMIT (UNDER_REVIEW → RESUBMITTED) — notifies admin ─
  async resubmitQuestionnaire(questionnaireId, adminEmail = "") {
    try {
      let url = `${TPRM_BASE}/questionnaires/${questionnaireId}/resubmit`;
      if (adminEmail) url += `?adminEmail=${encodeURIComponent(adminEmail)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Authorization": AUTH_HEADER }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to resubmit questionnaire");
      }
      return await res.json();
    } catch (err) {
      console.error("Error resubmitting questionnaire:", err);
      throw err;
    }
  }
}

export default new TprmService();
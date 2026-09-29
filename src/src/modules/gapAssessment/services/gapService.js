const API_URL = "https://cftoolbackend.duckdns.org/api/gaps";

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Request failed");
  }
  return res.json();
}

const gapService = {
  uploadFile: async (file) => {
    if (!file) throw new Error("No file provided");
    console.log("Uploading file:", file.name, file.size);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload response:", data);
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data.url;
    } catch (err) {
      console.error("Upload failed:", err);
      throw err;
    }
  },

  saveEntry: async (entry) => {
    try {
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      return await res.json();
    } catch (err) {
      console.error("Save entry failed", err);
      throw err;
    }
  },

  getGaps: async () => {
    try {
      const res = await fetch(`${API_URL}`);
      return await res.json();
    } catch (err) {
      console.error("Fetching gaps failed", err);
      return [];
    }
  },

  updateEntry: async (id, update) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      return await res.json();
    } catch (err) {
      console.error("Update entry failed", err);
      throw err;
    }
  },

  deleteDocumentByUrl(url, field) {
    return request(`${API_URL}/by-url`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, field }),
    });
  },
};

export default gapService;

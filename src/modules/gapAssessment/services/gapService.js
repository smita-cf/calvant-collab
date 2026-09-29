const API_URL = `${process.env.NEXT_PUBLIC_SP}/gap-service/api/gaps`;

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = text;
  }

  if (!res.ok) {
    throw new Error(json?.message || json || "Request failed");
  }

  return json;
}

const gapService = {
  // ---------- FILE UPLOAD ----------
  uploadFile: async (file) => {
    if (!file) throw new Error("No file provided");

    const formData = new FormData();
    formData.append("file", file);

    return request(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  },

  // ---------- CREATE NEW GAP ----------
  saveEntry: async (entry) => {
    return request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  },

  // ---------- GET ALL GAPS ----------
  getGaps: async () => {
    return request(API_URL);
  },

  // ---------- UPDATE GAP ----------
  updateEntry: async (id, update) => {
    return request(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
  },

  // ---------- DELETE FILE BY URL FROM DOC FIELD ----------
  deleteDocumentByUrl: async (url, field) => {
    return request(`${API_URL}/by-url`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, field }),
    });
  },
};

export default gapService;

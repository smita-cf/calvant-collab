// Talks to support-service via the gateway. Matches the pattern used by the
// admin panel's supportApi.js, but hits the customer-facing endpoints
// (/api/support-tickets — not /api/admin/support-tickets). Visibility rule
// (enforced server-side): a regular user sees only tickets they raised;
// root/super_admin see every ticket raised within their organization.

const SUPPORT_URL = `${process.env.NEXT_PUBLIC_SP}/support-service`;
const BASE = `${SUPPORT_URL}/api/support-tickets`;

const getToken = () =>
  (typeof window !== "undefined" && sessionStorage.getItem("token")) || "";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const jsonHeaders = () => ({
  ...authHeaders(),
  "Content-Type": "application/json",
});

const handle = async (res) => {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch (_) {
      // no JSON body
    }
    throw new Error(message);
  }
  return res.json();
};

// Any attachments (files can be anything — screenshots, logs, PDFs...) push
// the request into multipart/form-data instead of plain JSON. The backend
// stores each file as a blob embedded in the ticket's message, so there's
// no separate upload step — it all goes up in the one request.
const buildFormData = (fields, files) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  (files || []).forEach((file) => form.append("attachments", file));
  return form;
};

class SupportService {
  // ── List all tickets visible to the current user ──
  async listTickets() {
    const res = await fetch(BASE, { headers: authHeaders() });
    return handle(res);
  }

  // ── Get a single ticket (with its full message thread) ──
  async getTicket(id) {
    const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
    return handle(res);
  }

  // ── Raise a new ticket (files optional — an array of File objects) ──
  async createTicket({ subject, description, category, priority, files }) {
    if (files && files.length > 0) {
      const res = await fetch(BASE, {
        method: "POST",
        headers: authHeaders(), // no Content-Type — browser sets the multipart boundary
        body: buildFormData({ subject, description, category, priority }, files),
      });
      return handle(res);
    }
    const res = await fetch(BASE, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ subject, description, category, priority }),
    });
    return handle(res);
  }

  // ── Reply on an existing ticket (files optional) ──
  async replyToTicket(id, message, files) {
    if (files && files.length > 0) {
      const res = await fetch(`${BASE}/${id}/reply`, {
        method: "POST",
        headers: authHeaders(),
        body: buildFormData({ message }, files),
      });
      return handle(res);
    }
    const res = await fetch(`${BASE}/${id}/reply`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ message }),
    });
    return handle(res);
  }

  // ── Download/view a single attachment ──
  attachmentUrl(ticketId, attachmentId) {
    return `${BASE}/${ticketId}/attachments/${attachmentId}`;
  }

  async downloadAttachment(ticketId, attachmentId, fileName) {
    const res = await fetch(this.attachmentUrl(ticketId, attachmentId), {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to download attachment (${res.status})`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "attachment";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new SupportService();

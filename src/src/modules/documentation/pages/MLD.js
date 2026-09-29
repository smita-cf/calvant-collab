import ReMLDact, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import gapService from "../../gapAssessment/services/gapService";
import { Trash2, UploadCloud, Calendar } from "lucide-react";

const MLD = () => {
  const history = useHistory();
  const user = JSON.parse(sessionStorage.getItem("user")); // get current user info

  // original states
  const [documents, setDocuments] = useState([]);
  const [soas, setSoas] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [hasUploaded, setHasUploaded] = useState({});
  const [uploading, setUploading] = useState({});

  const [currentPageSoA, setCurrentPageSoA] = useState(1);
  const [currentPageDocs, setCurrentPageDocs] = useState(1);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const itemsPerPage = 3; // keep as original

  // additional states
  const [uploadedCounts, setUploadedCounts] = useState({}); // { soaId: number }

  // Separate controls for Upload section (SoA)
  const [soaSearch, setSoaSearch] = useState("");
  const [soaSort, setSoaSort] = useState("date_newest"); // date_newest | date_oldest | name

  // Separate controls for Documents section
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date_newest"); // date_newest | date_oldest | name

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = (await documentationService.getDocuments()) || [];
        setDocuments(docs || []);
        console.log("📄 Documents fetched from API:", docs);

        const soaList = (await documentationService.getSoAEntries()) || [];
        setSoas(Array.isArray(soaList) ? soaList : []);
        console.log("📘 SoA entries fetched:", soaList);

        // compute counts per soa
        const counts = {};
        (Array.isArray(soaList) ? soaList : []).forEach((s) => {
          counts[s.id] = 0;
        });
        (Array.isArray(docs) ? docs : []).forEach((d) => {
          const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
          if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
        });
        setUploadedCounts(counts);
      } catch (error) {
        console.error("Error loading data:", error);
        setDocuments([]);
        setSoas([]);
        setUploadedCounts({});
      }
    };
    fetchData();
  }, []);

  // Modified preview click handler to open modal with iframe
  const handlePreviewClick = (soa) => {
    const doc = documents.find((d) => String(d.soaId) === String(soa.id));
    if (doc) {
      const baseUrl = "https://cftoolbackend.duckdns.org";
      const filePath = doc.url.startsWith("/") ? doc.url : `/${doc.url}`;
      const encodedPath = encodeURI(filePath);
      const fullUrl = baseUrl + encodedPath;
      setPreviewUrl(fullUrl);
      setPreviewModalOpen(true);
    } else {
      alert("No document uploaded to preview.");
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
  };

  // keep original behavior: accept FileList or single File
  const handleFileChange = (soaId, fileOrFiles) => {
    if (!fileOrFiles) {
      setSelectedFiles((prev) => ({ ...prev, [soaId]: null }));
      return;
    }
    let file = fileOrFiles;
    if (file instanceof FileList || Array.isArray(file)) file = file[0];
    setSelectedFiles((prev) => ({ ...prev, [soaId]: file }));
  };

  const handleFileSelect = (event, refId) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({
        ...prev,
        [refId]: file,
      }));
      setHasUploaded((prev) => ({
        ...prev,
        [refId]: false, // 👈 reset to show "Upload"
      }));
    }
  };

  // NEW: single-button upload that opens file picker and auto-uploads
  const handleSingleButtonUpload = async (soaId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        setUploading((prev) => ({ ...prev, [soaId]: true }));

        const uploadedDoc = await documentationService.uploadDocument({
          file,
          soaId,
          controlId: "",
          uploaderName: user?.name ?? "Unknown",
          departmentName: user?.department?.name ?? "N/A",
        });

        try {
          const docId = uploadedDoc?.id ?? uploadedDoc?._id ?? null;
          if (docId) {
            await gapService.createGap(docId, { status: "Open" });
            console.log("Gap entry created for docId:", docId);
          } else {
            console.warn(
              "No document ID returned from upload, gap not created."
            );
          }
        } catch (gapErr) {
          console.error("Failed to create gap entry:", gapErr);
        }

        alert("Document uploaded successfully");

        // refresh documents and counts
        const docs = (await documentationService.getDocuments()) || [];
        setDocuments(docs || []);
        const counts = {};
        (soas || []).forEach((s) => (counts[s.id] = 0));
        (docs || []).forEach((d) => {
          const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
          if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
        });
        setUploadedCounts(counts);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Error uploading document");
      } finally {
        setUploading((prev) => ({ ...prev, [soaId]: false }));
      }
    };
    input.click();
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await documentationService.deleteDocument(docId);
      const updatedDocs = documents.filter(
        (doc) => doc.id !== docId && doc._id !== docId
      );
      setDocuments(updatedDocs);
      // recompute counts
      const counts = {};
      (soas || []).forEach((s) => (counts[s.id] = 0));
      (updatedDocs || []).forEach((d) => {
        const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
        if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
      });
      setUploadedCounts(counts);
      alert("Document deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting document");
    }
  };

  const handleDeleteForSoA = async (soaId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete the uploaded document(s) for this SoA?"
      )
    )
      return;

    try {
      const linkedDocs = documents.filter(
        (doc) => String(doc.soaId) === String(soaId)
      );

      for (const doc of linkedDocs) {
        await documentationService.deleteDocument(doc.id);
      }

      // Remove deleted docs from state to update UI immediately
      const updatedDocs = documents.filter((doc) => !linkedDocs.includes(doc));
      setDocuments(updatedDocs);

      // Recompute uploaded counts
      const counts = {};
      (soas || []).forEach((s) => (counts[s.id] = 0));
      (updatedDocs || []).forEach((d) => {
        const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
        if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
      });
      setUploadedCounts(counts);

      // Optionally clear selected files for this SoA
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[soaId];
        return copy;
      });

      alert("Uploaded document(s) deleted. You can now upload new ones.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting documents");
    }
  };

  // Preview logic unchanged
  const BACKEND_BASE_URL = "https://cftoolbackend.duckdns.org";
  // or for local development: http://localhost:5000 or wherever your API serves files

  // const handlePreviewClick = (soa) => {
  //   const doc = documents.find((d) => String(d.soaId) === String(soa.id));
  //   if (doc) {
  //     const baseUrl = "https://cftoolbackend.duckdns.org";
  //     const filePath = doc.url.startsWith("/") ? doc.url : `/${doc.url}`;
  //     const encodedPath = encodeURI(filePath);
  //     const fullUrl = baseUrl + encodedPath;
  //     window.open(fullUrl, "_blank");
  //   } else {
  //     alert("No document uploaded to preview.");
  //   }
  // };

  // helper for uploaded count
  const getUploadedCount = (soaId) => uploadedCounts[soaId] ?? 0;

  // robust download: try to fetch as blob and force download, fallback to opening URL
  const handleDownload = async (doc) => {
    const url = doc.url ?? doc.fileUrl ?? doc.downloadUrl ?? doc.path ?? null;
    const filename = (doc.name ?? doc.title ?? "document").replace(/\s+/g, "_");
    if (!url) {
      alert("No download URL available for this document.");
      return;
    }
    try {
      const response = await fetch(url, { method: "GET", mode: "cors" });
      if (!response.ok) throw new Error("Network response not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Blob download failed, falling back to open URL:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ---------------- SEARCH & SORT (frontend only) ----------------

  const filteredAndSortedSoas = useMemo(() => {
    let list = Array.isArray(soas) ? [...soas] : [];
    if (soaSearch && soaSearch.trim() !== "") {
      const q = soaSearch.trim().toLowerCase();
      list = list.filter((s) => {
        const ref = Array.isArray(s.documentRef)
          ? s.documentRef.join(" ")
          : s.documentRef ?? "";
        return ref.toString().toLowerCase().includes(q);
      });
    }
    if (soaSort === "date_newest" || soaSort === "date_oldest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return soaSort === "date_newest" ? bd - ad : ad - bd;
      });
    } else if (soaSort === "name") {
      list.sort((a, b) => {
        const an = (
          Array.isArray(a.documentRef)
            ? a.documentRef.join(", ")
            : a.documentRef ?? ""
        ).toLowerCase();
        const bn = (
          Array.isArray(b.documentRef)
            ? b.documentRef.join(", ")
            : b.documentRef ?? ""
        ).toLowerCase();
        return an.localeCompare(bn);
      });
    }
    return list;
  }, [soas, soaSearch, soaSort]);

  const filteredAndSortedDocs = useMemo(() => {
    let list = Array.isArray(documents) ? [...documents] : [];
    if (docSearch && docSearch.trim() !== "") {
      const q = docSearch.trim().toLowerCase();
      list = list.filter((d) =>
        ((d.name ?? d.title ?? "") + "").toLowerCase().includes(q)
      );
    }
    if (docSort === "name") {
      list.sort((a, b) => {
        const an = (a.name ?? a.title ?? "").toString().toLowerCase();
        const bn = (b.name ?? b.title ?? "").toString().toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (docSort === "date_newest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    } else if (docSort === "date_oldest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ad - bd;
      });
    }
    return list;
  }, [documents, docSearch, docSort]);

  // pagination using filtered lists
  const currentSoAs = filteredAndSortedSoas;

  const totalPagesSoA = Math.max(
    1,
    Math.ceil(filteredAndSortedSoas.length / itemsPerPage)
  );

  const indexOfLastDoc = currentPageDocs * itemsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - itemsPerPage;
  const currentDocuments = filteredAndSortedDocs.slice(
    indexOfFirstDoc,
    indexOfLastDoc
  );
  const totalPagesDocs = Math.max(
    1,
    Math.ceil(filteredAndSortedDocs.length / itemsPerPage)
  );

  // styles
  const backBtnStyle = {
    position: "fixed",
    top: "40px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,95,204,0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const paginationButtonStyle = {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    margin: "0 4px",
    cursor: "pointer",
    fontWeight: "600",
    backgroundColor: "white",
    color: "#007bff",
    userSelect: "none",
    transition: "all 0.2s ease",
  };

  const activePageStyle = {
    backgroundColor: "#007bff",
    color: "white",
    cursor: "default",
  };
  const disabledButtonStyle = {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
    cursor: "not-allowed",
    border: "1px solid #dee2e6",
  };

  // small helper for responsive table container
  const tableContainerStyle = { width: "100%", overflowX: "auto" };

  return (
    <div
      style={{ padding: "10px", maxWidth: "1200px", margin: "5px auto 20px" }}
    >
      <style>
        {`
          @media (max-width: 880px) {
            .controls-row { flex-direction: column; gap: 10px; align-items: stretch; }
            .controls-left { width: 100%; display: flex; gap: 8px; flex-wrap: wrap; }
            .controls-right { width: 100%; text-align: left; margin-top: 6px; }
            .upload-input { max-width: 100% !important; flex: 1 1 auto; }
            .soa-upload-row { flex-direction: column; gap: 8px; align-items: stretch; }
            .soa-actions { justify-content: flex-start; }
            .small-count { margin-left: 6px !important; }
            table { font-size: 14px; }
          }

          @media (min-width: 881px) {
            .controls-row { flex-direction: row; }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <button
        style={backBtnStyle}
        onClick={() => history.push("/documentation")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0046a3";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#005FCC";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 5px 20px rgba(102,126,234,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
        }}
      >
        <h1
          style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700" }}
        >
          📚 Master List of Documents
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.95, marginBottom: "12px" }}>
          Upload and manage your documents per SoA
        </p>
        <div
          style={{
            display: "flex",
            gap: "30px",
            fontSize: "14px",
            opacity: 0.95,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>Total SoA Entries:</span>{" "}
            {soas.length}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Documents Uploaded:</span>{" "}
            {documents.length}
          </div>
        </div>
      </div>

      <div
        className="controls-row"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
          justifyContent: "space-between",
        }}
      >
        <div
          className="controls-left"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Search Document Ref..."
            value={soaSearch}
            onChange={(e) => {
              setSoaSearch(e.target.value);
              setCurrentPageSoA(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              minWidth: "220px",
            }}
          />

          <select
            value={soaSort}
            onChange={(e) => setSoaSort(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            <option value="date_newest">Date (Newest)</option>
            <option value="date_oldest">Date (Oldest)</option>
            <option value="name">Name (A → Z)</option>
          </select>
        </div>

        <div
          className="controls-right"
          style={{ color: "#666", fontSize: "14px" }}
        >
          Showing {filteredAndSortedSoas.length} upload entries
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
          border: "1px solid #e9ecef",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            marginBottom: "16px",
            fontSize: "18px",
            borderBottom: "3px solid #667eea",
            paddingBottom: "8px",
          }}
        >
          📤 Upload Documents
        </h2>

        <div style={tableContainerStyle}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "4%",
                  }}
                >
                  {/* Empty for row index */}
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "25%",
                  }}
                >
                  Document Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "15%",
                  }}
                >
                  Dept Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "15%",
                  }}
                >
                  Own Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "12%",
                  }}
                >
                  Approval Date
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "12%",
                  }}
                >
                  Next Approval Date
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "10%",
                  }}
                >
                  Upload File
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "7%",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSoAs.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "18px",
                      color: "#7f8c8d",
                    }}
                  >
                    No SoA entries found
                  </td>
                </tr>
              ) : (
                currentSoAs.map((soa, idx) => {
                  const soaId = soa.id;
                  const count = getUploadedCount(soaId);
                  const hasUploaded = count > 0;
                  const doc = documents.find(
                    (d) => String(d.soaId) === String(soa.id)
                  );

                  const approvalDate = doc?.approvalDate
                    ? new Date(doc.approvalDate).toISOString().split("T")[0]
                    : "—";
                  const nextApprovalDate = doc?.nextApprovalDate
                    ? new Date(doc.nextApprovalDate).toISOString().split("T")[0]
                    : "—";

                  const handleApprove = async () => {
                    if (!doc) return;

                    const today = new Date();
                    const nextDate = new Date();
                    nextDate.setDate(today.getDate() + 365);

                    try {
                      const updatedDoc =
                        await documentationService.updateApprovalDate(
                          doc.id,
                          today.toISOString(),
                          nextDate.toISOString()
                        );
                      setDocuments((prevDocs) =>
                        prevDocs.map((d) => (d.id === doc.id ? updatedDoc : d))
                      );
                      alert("Document approved!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to approve document");
                    }
                  };

                  return (
                    <tr
                      key={soaId}
                      style={{ borderBottom: "1px solid #f1f1f1" }}
                    >
                      {/* Row Index */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                          textAlign: "center",
                          userSelect: "none",
                          fontWeight: "600",
                        }}
                      >
                        {idx + 1}
                      </td>

                      {/* Document Name */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#3498db",
                          verticalAlign: "middle",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handlePreviewClick(soa)}
                      >
                        {Array.isArray(soa.documentRef)
                          ? soa.documentRef.join(", ")
                          : soa.documentRef ?? "—"}
                      </td>

                      {/* Dept Name */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          color: hasUploaded ? "#2c3e50" : "#aaaaaa",
                          fontWeight: "600",
                        }}
                      >
                        {hasUploaded ? doc?.departmentName ?? "—" : "—"}
                      </td>

                      {/* Own Name */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          color: hasUploaded ? "#2c3e50" : "#aaaaaa",
                          fontWeight: "600",
                        }}
                      >
                        {hasUploaded ? doc?.uploaderName ?? "—" : "—"}
                      </td>

                      {/* Approval Date */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {hasUploaded ? approvalDate : "—"}
                      </td>

                      {/* Next Approval Date */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          fontWeight: "600",
                          color: hasUploaded ? "#2c3e50" : "#aaaaaa",
                        }}
                      >
                        {hasUploaded ? nextApprovalDate : "—"}
                      </td>
{/* Upload File */}
<td
  style={{
    padding: "12px 14px",
    textAlign: "center",
    verticalAlign: "middle",
  }}
>
  <button
    onClick={() => handleSingleButtonUpload(soa.id)}
    disabled={uploading[soa.id]}
    style={{
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      background: "#3498db",
      color: "white",
      cursor: uploading[soa.id] ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      fontWeight: 600,
      minWidth: "80px",
    }}
    title="Upload document"
  >
    {uploading[soa.id] ? (
      "Uploading..."
    ) : getUploadedCount(soa.id) > 0 ? (
      <span
        style={{
          marginLeft: 6,
          color: "#27ae60",
          fontWeight: "700",
          userSelect: "none",
          fontSize: "18px",
        }}
        aria-label="Uploaded"
        role="img"
      >
        ✅
      </span>
    ) : (
      <>
        <UploadCloud size={16} /> Upload
      </>
    )}
  </button>
</td>



                      {/* Approve Button */}
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {hasUploaded ? (
                          <button
                            onClick={handleApprove}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#27ae60",
                              color: "white",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              fontWeight: 600,
                            }}
                            title="Approve document"
                          >
                            <Calendar size={16} /> Approve
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        style={{ textAlign: "center", verticalAlign: "middle" }}
                      >
                        {hasUploaded ? (
                          <button
                            onClick={() => handleDeleteForSoA(soa.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#e74c3c",
                              color: "white",
                              cursor: "pointer",
                            }}
                            title="Delete document"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPagesSoA > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: 12,
            }}
          ></div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "30px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => history.push("/documentation/soa")}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #3498db, #2980b9)",
            color: "white",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.3)";
          }}
          title="Go to SoA"
        >
          SOA
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => history.push("/gap-assessment/new")}
          style={{
            padding: "12px 25px",
            borderRadius: "50px",
            background: "linear-gradient(45deg, #27ae60, #2ecc71)",
            color: "white",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
          }}
          title="Go to MLD"
        >
          🚀 Go to Gap Assessment
        </button>
      </div>
      {previewModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={closePreviewModal} // close modal when background clicked
        >
          <div
            style={{
              position: "relative",
              width: "80%",
              height: "80%",
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when iframe clicked
          >
            <button
              onClick={closePreviewModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                background: "#e74c3c",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>

            <iframe
              src={previewUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MLD;
import React, { useEffect, useState, useMemo, useCallback } from "react";
//import { FileText, useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import documentationService from "../services/documentationService";
import { FileText,  Trash2, UploadCloud, Calendar, Check  } from "lucide-react";
import { DOCUMENT_MAPPING } from "../constants";
import Modal from "../../../components/navigations/Modal";

import Joyride, { STATUS } from "react-joyride";

const MLD = () => {
  const router = useRouter();
  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();

  // Global modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    showCancel: false,
  });
  const [docVersions, setDocVersions] = useState({});

  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    docId: null,
    comment: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setShowButtons(false);
      } else {
        // Scrolling up
        setShowButtons(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const [joyrideRun, setJoyrideRun] = useState(false);
  const joyrideSteps = [
    {
      target: "#mld-header",
      content:
        "This is your Master List of Documents. You can upload and manage documents which are required.",
    },
    {
      target: "#mld-search",
      content: "Use this search box to filter by document reference.",
    },
    {
      target: "#mld-sort",
      content: "Sort your documents by date or name using this dropdown.",
    },
    {
      target: "#mld-upload-table",
      content:
        "This table shows all required uploaded documents. You can preview, upload, approve, or delete documents here.",
    },
    {
      target: "#mld-upload-btn",
      content: "Click this button to upload a document.",
    },
    {
      target: "#mld-approve-btn",
      content:
        "If you are a Risk Owner, you can approve documents using this button.",
    },
    {
      target: "#mld-delete-btn",
      content: "Delete a document using this button.",
    },
  ];

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
  const itemsPerPage = 3;

  // additional states
  const [uploadedCounts, setUploadedCounts] = useState({});
  const [soaSearch, setSoaSearch] = useState("");
  const [soaSort, setSoaSort] = useState("date_newest"); // date_newest | date_oldest | name
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date_newest");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Fetch all documents and filter by organization
      const docs = (await documentationService.getDocuments()) || [];
      const orgDocs = docs.filter(
        (d) => d.organization === effectiveOrgId,
      );
      setDocuments(orgDocs);
      console.log("📄 Documents fetched from API (org filtered):", orgDocs);

      // Fetch all SoA entries and filter by organization
      const soaList = (await documentationService.getSoAEntries()) || [];
      const orgSoas = soaList.filter(
        (s) => s.organization === effectiveOrgId,
      );
      setSoas(orgSoas);
      console.log("📘 SoA entries fetched (org filtered):", orgSoas);

      // Compute counts per SoA
      const counts = {};
      orgSoas.forEach((s) => {
        counts[s.id] = 0;
      });
      orgDocs.forEach((d) => {
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
  }, [effectiveOrgId]);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [fetchData, mounted]);

  const handlePreviewClick = (soa) => {
    const doc = documents.find((d) => String(d.soaId) === String(soa.id));
    if (doc) {
      const baseUrl = `${process.env.NEXT_PUBLIC_SP}/doc-service`;
      const filePath = doc.url.startsWith("/") ? doc.url : `/${doc.url}`;
      const encodedPath = encodeURI(filePath);
      const fullUrl = baseUrl + encodedPath;
      setPreviewUrl(fullUrl);
      setPreviewModalOpen(true);
    } else {
      setModal({
        isOpen: true,
        title: "No Document Found",
        message: "No Document to preview",
        showCancel: false,
        onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
      });
    }
  };

  const getDocsForUser = (soas, user, documents) => {
    const docsSet = new Set();
    let docCount = 0;

    // Create a list of allowed department names for this user
    const userDeptNames = (user?.departments || []).map((d) => d.name);

    documents.forEach((doc) => {
      soas.forEach((soa) => {
        if (doc.soaId !== soa.id.toString()) return;

        if (user.role.includes("root") || user?.role.includes("super_admin")) {
          docCount++;
        } else if (userDeptNames.includes(doc.departmentName)) {
          // Match against array
          docCount++;
        }
      });
    });

    soas.forEach((soa) => {
      const refs = Array.isArray(soa.documentRef)
        ? soa.documentRef
        : [soa.documentRef];

      // Get an array of all department names assigned to the user
      const userDeptNames = (user?.departments || []).map((d) => d.name);

      // Check if user is an admin type
      const isAdmin =
        user.role.includes("root") || user.role.includes("super_admin");

      refs.forEach((ref) => {
        for (const key in DOCUMENT_MAPPING) {
          const mapping = DOCUMENT_MAPPING[key];

          // Ensure we are looking at the right mapping for this specific reference
          if (mapping.docs?.includes(ref)) {
            if (isAdmin) {
              docsSet.add(ref);
            } else {
              // Check if any of the user's departments match the departments allowed in mapping
              const mappingDepts = Array.isArray(mapping.dept)
                ? mapping.dept
                : [mapping.dept];

              const hasAccess = mappingDepts.some((deptName) =>
                userDeptNames.includes(deptName),
              );

              if (hasAccess) {
                docsSet.add(ref);
              }
            }
          }
        }
      });
    });

    return { docCount, userDocs: Array.from(docsSet) };
  };
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
  };

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
        [refId]: false,
      }));
    }
  };
  const findActiveDocForSoA = (soaId) =>
    documents.filter((d) => {
      // 1. Basic ID check
      if (String(d.soaId) !== String(soaId)) return false;

      // 2. Admin/Root bypass (using the same role check as your dashboard)
      const isAdmin =
        user.role.includes("root") || user.role.includes("super_admin");
      if (isAdmin) return true;

      // 3. Multi-department check
      // Extract names from user.departments array of objects
      const userDeptNames = (user?.departments || []).map((dept) => dept.name);

      return userDeptNames.includes(d.departmentName);
    });

  const handleSingleButtonUpload = async (soaId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        setUploading((prev) => ({ ...prev, [soaId]: true }));

        // Inside handleSingleButtonUpload
        const userRoles = Array.isArray(user?.role) ? user.role : [user?.role];
        const isAdmin = userRoles.some(
          (r) => r === "root" || r === "super_admin",
        );

        const uploadedDoc = await documentationService.uploadDocument({
          file,
          soaId,
          controlId: "",
          uploaderName: user?.name ?? "Unknown",
          departmentName: isAdmin
            ? "All"
            : (user?.departments?.[0]?.name ?? "N/A"),
          organization: effectiveOrgId,
        });

        setModal({
          isOpen: true,
          title: "Success",
          message: "Document uploaded successfully!",
          showCancel: false,
          onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
        });

        // refresh documents and counts
        const docs = (await documentationService.getDocuments()) || [];

        const orgDocs = docs.filter(
          (d) => d.organization === effectiveOrgId,
        );

        setDocuments(orgDocs);

        const counts = {};
        (soas || []).forEach((s) => (counts[s.id] = 0));
        (orgDocs || []).forEach((d) => {
          const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
          if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
        });
        setUploadedCounts(counts);
      } catch (err) {
        console.error("Upload failed:", err);
        setModal({
          isOpen: true,
          title: "Failure",
          message: "Upload Failed please try again in some time.",
          showCancel: false,
          onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
        });
      } finally {
        setUploading((prev) => ({ ...prev, [soaId]: false }));
      }
    };
    input.click();
  };

  const handleDeleteForSoA = async (soaId) => {
    setModal({
      isOpen: true,
      title: "Confirm Delete",
      message:
        "Are you sure you want to delete the uploaded document(s) for this SoA?",
      showCancel: true,
      onConfirm: async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        try {
          const linkedDocs = documents.filter(
            (doc) => String(doc.soaId) === String(soaId),
          );

          for (const doc of linkedDocs) {
            await documentationService.deleteDocument(doc.id);
          }

          const updatedDocs = documents.filter(
            (doc) => !linkedDocs.includes(doc),
          );
          setDocuments(updatedDocs);

          // Recompute uploaded counts
          const counts = {};
          (soas || []).forEach((s) => (counts[s.id] = 0));
          (updatedDocs || []).forEach((d) => {
            const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
            if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
          });
          setUploadedCounts(counts);

          // Clear selected files for this SoA
          setSelectedFiles((prev) => {
            const copy = { ...prev };
            delete copy[soaId];
            return copy;
          });

          setModal({
            isOpen: true,
            title: "Success",
            message: "Documents Deleted",
            showCancel: false,
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
          });
        } catch (error) {
          console.error("Delete failed:", error);
          setModal({
            isOpen: true,
            title: "Failure",
            message: "Documents Delete Failed",
            showCancel: false,
            onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
          });
        } // call your delete function
      },
    });
  };

  const getAllDocsForSoA = (soaId) =>
    documents
      .filter((d) => String(d.soaId) === String(soaId))
      .sort((a, b) => b.version - a.version);

  const getLatestDocForSoA = (soaId) => {
    const docs = getAllDocsForSoA(soaId);
    return docs.find((d) => !d.deleted) || docs[0];
  };

  const getUploadedCount = (soaId) => uploadedCounts[soaId] ?? 0;

  // ---------------- SEARCH & SORT ----------------
  const filteredAndSortedSoas = useMemo(() => {
    let list = Array.isArray(soas) ? [...soas] : [];
    if (soaSearch && soaSearch.trim() !== "") {
      const q = soaSearch.trim().toLowerCase();
      list = list.filter((s) => {
        const ref = Array.isArray(s.documentRef)
          ? s.documentRef.join(" ")
          : (s.documentRef ?? "");
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
            : (a.documentRef ?? "")
        ).toLowerCase();
        const bn = (
          Array.isArray(b.documentRef)
            ? b.documentRef.join(", ")
            : (b.documentRef ?? "")
        ).toLowerCase();
        return an.localeCompare(bn);
      });
    }
    return list;
  }, [soas, soaSearch, soaSort]);

  // --- DEDUPLICATE SOAs ---
  const uniqueSoas = useMemo(() => {
    const seen = new Set();
    return filteredAndSortedSoas.filter((soa) => {
      if (seen.has(soa.id)) return false;
      seen.add(soa.id);
      return true;
    });
  }, [filteredAndSortedSoas]);

  const departmentFilteredSoAs = useMemo(() => {
    // 1. Role Check: Check if any of the user's roles have administrative access
    const userRoles = Array.isArray(user?.role) ? user.role : [user?.role];
    const isAdmin = userRoles.some((r) => r === "root" || r === "super_admin");

    if (isAdmin) return uniqueSoas;

    // 2. Department Check: Extract names from the departments array of objects
    const userDeptNames = (user?.departments || []).map((d) => d.name);

    // If a standard user has no departments, they shouldn't see any data
    if (userDeptNames.length === 0) return [];

    return uniqueSoas.filter((soa) => {
      const docRefs = Array.isArray(soa.documentRef)
        ? soa.documentRef
        : [soa.documentRef];

      // 3. Mapping Intersection
      return docRefs.some((ref) => {
        for (const key in DOCUMENT_MAPPING) {
          if (DOCUMENT_MAPPING[key].docs?.includes(ref)) {
            const mappingDeptList = Array.isArray(DOCUMENT_MAPPING[key].dept)
              ? DOCUMENT_MAPPING[key].dept
              : [DOCUMENT_MAPPING[key].dept];

            // Check if any of the user's departments match the mapping's required departments
            const hasAccess = mappingDeptList.some((dept) =>
              userDeptNames.includes(dept),
            );

            if (hasAccess) return true;
          }
        }
        return false;
      });
    });
  }, [uniqueSoas, user]);

  // Pagination
  const currentSoAs = departmentFilteredSoAs;

  const totalPagesSoA = Math.max(
    1,
    Math.ceil(currentSoAs.length / itemsPerPage),
  );

  // ==================== STYLES ====================
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

  const tableContainerStyle = { width: "100%", overflowX: "auto" };

  const { docCount, userDocs } = getDocsForUser(
    filteredAndSortedSoas,
    user,
    documents,
  );



  // ==================== RENDER ====================
  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "0px auto" }}>
      {/* Joyride */}
      <Joyride
        steps={joyrideSteps}
        run={joyrideRun}
        continuous
        scrollToFirstStep
        showSkipButton
        styles={{ options: { zIndex: 10000 } }}
        callback={(data) => {
          const { status } = data;
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setJoyrideRun(false);
          }
        }}
      />

      {/* Start Tour Button */}
      <button
        style={{
          position: "sticky",
          top: "0",
          margin: "10px",
          padding: "10px 24px",
          borderRadius: "8px",
          background: "linear-gradient(90deg, #ffb74d 0%, #ff9800 100%)",
          border: "none",
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 999,
          transform: showButtons ? "translateY(0)" : "translateY(-100%)",
          opacity: showButtons ? 1 : 0,
        }}
        onClick={() => setJoyrideRun(true)}
      >
        Tutorial{" "}
      </button>

      {/* Back to Dashboard Button */}
      <button
        style={{
          position: "sticky",
          top: "0",
          margin: "10px",
          padding: "10px 24px",
          borderRadius: "8px",
          background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          border: "none",
          color: "#fff",
          fontWeight: "500",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 0,
          transform: showButtons ? "translateY(0)" : "translateY(-100%)",
          opacity: showButtons ? 1 : 0,
        }}
        onClick={() => router.push("/risk-assessment")}
      >
        ← Back to Dashboard{" "}
      </button>

      <div
        id="mld-header"
        style={{
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(241,245,249,0.8)", borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          padding: "18px 24px 16px", marginBottom: 16,
        }}
      >
        <h1
          style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700" }}
        >
          Master List of Documents
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.95, marginBottom: "12px" }}>
          Upload and manage your documents
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
            <span style={{ fontWeight: 600 }}>Total Documents to Upload:</span>{" "}
            {userDocs.length}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Documents Uploaded:</span>{" "}
            {docCount}
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
            id="mld-search"
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
            id="mld-sort"
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
          Showing {userDocs.length} upload entries
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
          Upload Documents
        </h2>

        <div style={tableContainerStyle}>
          <table
            id="mld-upload-table"
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "4%",
                  }}
                >
                  #
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
                  Doc Owner
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "6%", // adjust width as needed
                  }}
                >
                  Version
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
                  Uploader Name
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
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "20%",
                  }}
                >
                  Delete Comment
                </th>
              </tr>
            </thead>
            <tbody>
              {userDocs.length === 0 ? (
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
                userDocs.map((docName, idx) => {
                  // Find the SoA corresponding to this docName
                  const soa = filteredAndSortedSoas.find((s) =>
                    (Array.isArray(s.documentRef)
                      ? s.documentRef
                      : [s.documentRef]
                    ).includes(docName),
                  );
                  const soaId = soa?.id;
                  const allDocs = getAllDocsForSoA(soaId);
                  const doc = getLatestDocForSoA(soaId); // active doc only

                  const hasUploaded = !!doc && !doc.deleted;

                  // Department from mapping
                  const departmentFromMapping =
                    user?.departments?.[0]?.name ??
                    (user.role === "root" ? "Root" : "—");

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
                          today.getTime(),
                          nextDate.getTime(),
                        );
                      setDocuments((prevDocs) =>
                        prevDocs.map((d) => (d.id === doc.id ? updatedDoc : d)),
                      );
                      setModal({
                        isOpen: true,
                        title: "Success",
                        message: "Documents Approved",
                        showCancel: false,
                        onConfirm: () =>
                          setModal((m) => ({ ...m, isOpen: false })),
                      });
                    } catch (err) {
                      console.error(err);
                      setModal({
                        isOpen: true,
                        title: "Failed",
                        message: "Documents Approve Failed",
                        showCancel: false,
                        onConfirm: () =>
                          setModal((m) => ({ ...m, isOpen: false })),
                      });
                    }
                  };

                  return (
                    <tr
                      key={soaId}
                      style={{ borderBottom: "1px solid #f1f1f1" }}
                    >
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
                        className="mld-cell-doc"
                        onClick={() => {
                          if (doc?.deleted || !doc?.url) {
                            setModal({
                              isOpen: true,
                              title: "Document Deleted",
                              message:
                                "This document was deleted and cannot be previewed.",
                              showCancel: false,
                              onConfirm: () =>
                                setModal((m) => ({ ...m, isOpen: false })),
                            });
                            return;
                          }
                          handlePreviewClick(soa);
                        }}
                        style={{
                          cursor: doc?.deleted ? "not-allowed" : "pointer",
                          color: doc?.deleted ? "#999" : "inherit",
                        }}
                      >
                        {Array.isArray(soa.documentRef)
                          ? soa.documentRef.join(", ")
                          : soa.documentRef}
                      </td>

                      {/* Department from mapping */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {departmentFromMapping}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {doc?.version ?? "—"}
                      </td>

                      {/* Uploader Name */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {doc?.uploaderName ?? "—"}
                      </td>

                      {/* Approval Date */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {approvalDate}
                      </td>

                      {/* Next Approval Date */}
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {nextApprovalDate}
                      </td>

                      {/* Upload File */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => handleSingleButtonUpload(soaId)}
                          id="mld-upload-btn"
                          style={{
                            backgroundColor: hasUploaded
                              ? "#2ecc71"
                              : "#f1f1f1",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: hasUploaded ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: hasUploaded ? "white" : "inherit",
                          }}
                          disabled={hasUploaded || uploading[soaId]}
                        >
                          {uploading[soaId] ? (
                            <>
                              <UploadCloud
                                size={16}
                                style={{ marginRight: "4px" }}
                              />
                              Uploading...
                            </>
                          ) : hasUploaded ? (
                            <Check
                              size={20}
                              style={{
                                marginRight: "25px",
                                marginLeft: "25px",
                              }}
                            />
                          ) : (
                            <>
                              <UploadCloud
                                size={16}
                                style={{ marginRight: "4px" }}
                              />
                              Upload
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      {/* Actions */}
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          display: "flex",
                          gap: "4px",
                          justifyContent: "center",
                        }}
                      >
                        {hasUploaded && (
                          <>
                            {doc?.approvalDate ? (
                              <div
                                style={{
                                  backgroundColor: "#2ecc71",
                                  color: "white",
                                  padding: "2px",
                                }}
                              >
                                Approved
                              </div>
                            ) : (
                              // Only show Approve button if user is Risk Owner
                              (user?.role || []).some((r) =>
                                ["risk_owner", "root", "super_admin"].includes(
                                  r,
                                ),
                              ) && (
                                <button
                                  id="mld-approve-btn"
                                  onClick={handleApprove}
                                  style={{
                                    backgroundColor: "#2ecc71",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Calendar
                                    size={16}
                                    style={{ marginRight: "4px" }}
                                  />
                                  Approve
                                </button>
                              )
                            )}

                            <button
                              onClick={() =>
                                setDeleteModal({
                                  open: true,
                                  docId: doc.id,
                                  comment: "",
                                })
                              }
                              id="mld-delete-btn"
                              style={{
                                backgroundColor: "#e74c3c",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              className="mld-approve-btn"
                              onClick={async () => {
                                const versions =
                                  await documentationService.getDocVersions(
                                    doc.id,
                                  );
                                const safeVersions = versions.filter(
                                  (v) => v.organization === effectiveOrgId,
                                );

                                setDocVersions((prev) => ({
                                  ...prev,
                                  [doc.id]: safeVersions,
                                }));
                                setModal({
                                  isOpen: true,
                                  title: "Version History",
                                  message: (
                                    <table
                                      style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                      }}
                                    >
                                      <thead>
                                        <tr>
                                          <th>Version</th>
                                          <th>Uploader</th>
                                          <th>Approval Date</th>
                                          <th>Delete Comment</th>
                                          <th>Deleted At</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {versions.map((v, idx) => (
                                          <tr key={idx}>
                                            <td>{v.version}</td>
                                            <td>{v.uploaderName}</td>
                                            <td>
                                              {v.approvalDate
                                                ? new Date(
                                                    v.approvalDate,
                                                  ).toLocaleDateString()
                                                : "—"}
                                            </td>
                                            <td>{v.deleteComment ?? "—"}</td>
                                            <td>
                                              {v.deletedAt
                                                ? new Date(
                                                    v.deletedAt,
                                                  ).toLocaleDateString()
                                                : "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ),
                                  showCancel: false,
                                  onConfirm: () =>
                                    setModal((m) => ({ ...m, isOpen: false })),
                                });
                              }}
                              style={{
                                backgroundColor: "#3498db",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 6px",
                                cursor: "pointer",
                              }}
                            >
                              View Versions
                            </button>
                          </>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          color: "#2c3e50",
                        }}
                      >
                        {doc?.deleteComment ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {previewModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start", // ⬅️ change
            paddingTop: "80px", // ⬅️ move down
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "85vw",
              height: "85vh",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <button
              onClick={closePreviewModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                fontWeight: 600,
                cursor: "pointer",
                zIndex: 1,
              }}
            >
              ×
            </button>

            <iframe
              src={previewUrl}
              title="Preview Document"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </div>
        </div>
      )}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        onConfirm={modal.onConfirm}
        showCancel={modal.showCancel}
      />
      <Modal
        isOpen={deleteModal.open}
        title="Delete Document"
        showCancel
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={async () => {
          try {
            await documentationService.deleteDocument(
              deleteModal.docId,
              deleteModal.comment,
            );

            // Update the document with the delete comment without removing it
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === deleteModal.docId
                  ? {
                      ...d,
                      deleteComment: deleteModal.comment,
                      deleted: true,
                    }
                  : d,
              ),
            );

            setDeleteModal({ open: false });
          } catch (e) {
            console.error(e);
          }
        }}
        message={
          <textarea
            placeholder="Enter reason for deletion"
            value={deleteModal.comment}
            onChange={(e) => {
              const value = e.target.value;
              setDeleteModal((m) => ({ ...m, comment: value }));
            }}
            style={{
              width: "100%",
              minHeight: 80,
              padding: 8,
            }}
          />
        }
      />
                 <footer
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
 background: "white",
      color: "#9ca3af",
    padding: "12px",
    textAlign: "center",
    fontSize: "13px",
    zIndex: 1000,
  }}
>
  © {new Date().getFullYear()} CalVant. All rights reserved.
</footer>
    </div>
  );
};

export default MLD;

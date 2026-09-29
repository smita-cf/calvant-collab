import React, { useEffect, useState } from "react";
import { ISO_27001_CLAUSES, ISO_27001_CONTROL } from "../constant";
import {
  Upload,
  X,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import gapService from "../services/gapService";

const NewAssessment = () => {
  const [rows, setRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("employee");

  // Load logged-in user
  useEffect(() => {
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      setUser(parsedUser);
      setUserRole(parsedUser.role || "employee");
    }
  }, []);

  // Build rows from constants filtered by department
  useEffect(() => {
    if (!user) return;

    const combined = [...ISO_27001_CLAUSES, ...ISO_27001_CONTROL];
    const filtered = combined
      .flatMap((item) =>
        item.auditQuestions.map((q) => ({
          clause: item.clause,
          standardRequirement: item.standardRequirement,
          question: typeof q === "string" ? q : q.text || q,
          departments:
            item.departments?.map((d) =>
              typeof d === "string" ? d : d.name
            ) || [],
          documentEvidence: null,
          practiceEvidence: null,
          practiceEvidenceText: "",
          docScore: "",
          practiceScore: "",
          docRemarks: "",
          practiceRemarks: "",
          gapId: null,
        }))
      )
      .filter((row) =>
        !user?.department?.name
          ? true
          : row.departments.includes(user.department.name)
      );

    setRows(filtered);
  }, [user]);

  // Fetch gaps from backend
  useEffect(() => {
    if (!user) return;

    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();
        setRows((prev) =>
          prev.map((row) => {
            const gap = gaps.find(
              (g) => g.clause === row.clause && g.question === row.question
            );
            return gap
              ? {
                  ...row,
                  documentEvidence: gap.documentURL || null,
                  practiceEvidence: gap.practiceEvidence || null,
                  practiceEvidenceText: gap.practiceEvidenceText || "",
                  docScore: gap.docScore || "",
                  practiceScore: gap.practiceScore || "",
                  docRemarks: gap.docRemarks || "",
                  practiceRemarks: gap.practiceRemarks || "",
                  gapId: gap._id,
                }
              : row;
          })
        );
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      }
    };
    fetchGaps();
  }, [user]);

  // Generic input handler
  const handleInputChange = (i, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[i][field] = value;
      return updated;
    });
  };

  // Document upload
  const handleFileChange = async (i, file) => {
    if (!file) return;
    try {
      const url = await gapService.uploadFile(file);
      const newRow = { ...rows[i], documentEvidence: url };
      setRows((prev) => {
        const updated = [...prev];
        updated[i] = newRow;
        return updated;
      });
      const saved = await gapService.saveEntry({
        ...newRow,
        documentURL: url,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch {
      alert("Upload failed");
    }
  };

  // Practice file upload
  const handlePracticeFileChange = async (i, file) => {
    if (!file) return;
    try {
      const url = await gapService.uploadFile(file);
      const newRow = { ...rows[i], practiceEvidence: url };
      setRows((prev) => {
        const updated = [...prev];
        updated[i] = newRow;
        return updated;
      });
      const saved = await gapService.saveEntry({
        ...newRow,
        practiceEvidence: url,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch {
      alert("Upload failed");
    }
  };

  // Delete file
  const handleDeleteFile = async (i, field) => {
    const row = rows[i];
    const fileUrl = row[field];
    if (!fileUrl) return;

    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const backendFieldMap = {
      documentEvidence: "documentURL",
      practiceEvidence: "practiceEvidence",
    };
    const backendField = backendFieldMap[field];
    if (!backendField) {
      console.error("Unknown field:", field);
      return;
    }

    try {
      await gapService.deleteDocumentByUrl(fileUrl, backendField);

      setRows((prev) => {
        const updated = [...prev];
        updated[i][field] = null;
        return updated;
      });

      alert("File deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting file");
    }
  };

  // Save practice text on blur
  const handlePracticeBlur = async (i) => {
    const r = rows[i];
    if (!r.practiceEvidenceText) return;
    try {
      const saved = await gapService.saveEntry({
        ...r,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Auditor score/remark updates
  const handleAuditorChange = async (i, field, value) => {
    const r = rows[i];
    const updated = { ...r, [field]: value };
    handleInputChange(i, field, value);
    if (!r.gapId) return;
    try {
      await gapService.updateEntry(r.gapId, {
        ...updated,
        verifiedBy: user?.id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Group rows by clause
  const grouped = rows.reduce((acc, r, idx) => {
    if (!acc[r.clause]) acc[r.clause] = [];
    acc[r.clause].push({ ...r, idx });
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">New Assessment</h2>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
        Logged in as: <strong>{user?.name || "Unknown"}</strong> | Role:{" "}
        <strong className="capitalize">{userRole}</strong> | Department:{" "}
        <strong>{user?.department?.name || "N/A"}</strong>
      </div>

      <div className="overflow-auto rounded-xl shadow border border-gray-200">
        {Object.keys(grouped).map((clause, i) => (
          <div key={i} className="mb-6">
            {/* Clause Header Section */}
            <div className="bg-blue-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">{clause}</h3>
              <span className="block text-sm text-gray-600">
                {grouped[clause][0].standardRequirement}
              </span>
            </div>

            {/* Table Section */}
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="border px-3 py-2">Question</th>
                  <th className="border px-3 py-2">Document Evidence</th>
                  <th className="border px-3 py-2">Practice Evidence</th>
                  <th className="border px-3 py-2">Doc Score</th>
                  <th className="border px-3 py-2">Practice Score</th>
                  <th className="border px-3 py-2">Doc Remarks</th>
                  <th className="border px-3 py-2">Practice Remarks</th>
                </tr>
              </thead>
              <tbody>
                {grouped[clause].map((row) => (
                  <tr key={row.idx} className="hover:bg-blue-50 transition">
                    <td className="border px-3 py-2 font-medium">
                      {row.question}
                    </td>
                    <td className="border px-3 py-2">
                      {userRole !== "auditor" && (
                        <label className="cursor-pointer text-blue-600 hover:underline text-xs">
                          <Upload size={14} className="inline" /> Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(row.idx, e.target.files[0])
                            }
                          />
                        </label>
                      )}
                      {row.documentEvidence && (
                        <>
                          <button
                            onClick={() => setSelectedDoc(row.documentEvidence)}
                            className="text-xs text-blue-600 hover:underline ml-2 mr-1"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(row.idx, "documentEvidence")
                            }
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {userRole !== "auditor" && (
                        <label className="cursor-pointer text-green-600 hover:underline text-xs">
                          <Upload size={14} className="inline" /> Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handlePracticeFileChange(
                                row.idx,
                                e.target.files[0]
                              )
                            }
                          />
                        </label>
                      )}
                      {row.practiceEvidence && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedDoc(row.practiceEvidence)
                            }
                            className="text-xs text-green-600 hover:underline ml-2 mr-1"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(row.idx, "practiceEvidence")
                            }
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <textarea
                        className="w-full border rounded mt-2 px-1 py-0.5"
                        rows="1"
                        value={row.practiceEvidenceText || ""}
                        placeholder="Practice notes..."
                        onChange={(e) =>
                          handleInputChange(
                            row.idx,
                            "practiceEvidenceText",
                            e.target.value
                          )
                        }
                        onBlur={() => handlePracticeBlur(row.idx)}
                      />
                    </td>
                    <td className="border px-3 py-2">
                      {userRole === "auditor" ? (
                        <select
                          className="w-full border"
                          value={row.docScore}
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "docScore",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Doc Score</option>
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      ) : (
                        <span>{row.docScore || "—"}</span>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {userRole === "auditor" ? (
                        <select
                          className="w-full border"
                          value={row.practiceScore}
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "practiceScore",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Practice Score</option>
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      ) : (
                        <span>{row.practiceScore || "—"}</span>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {userRole === "auditor" ? (
                        <textarea
                          className="w-full border"
                          rows="1"
                          value={row.docRemarks}
                          placeholder="Doc remarks..."
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "docRemarks",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <span>{row.docRemarks || "—"}</span>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      {userRole === "auditor" ? (
                        <textarea
                          className="w-full border"
                          rows="1"
                          value={row.practiceRemarks}
                          placeholder="Practice remarks..."
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "practiceRemarks",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <span>{row.practiceRemarks || "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Document Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-lg p-4 w-11/12 md:w-3/4 lg:w-1/2 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={18} /> Uploaded
                Document
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={
                selectedDoc.startsWith("http")
                  ? selectedDoc
                  : `https://cftoolbackend.duckdns.org${selectedDoc}`
              }
              className="w-full h-96 border rounded-md"
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssessment;

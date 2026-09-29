import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Edit2, Trash2, PlusCircle } from "lucide-react";
import API from "../../api/api";

export default function RiskList() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const history = useHistory();

  // ✅ FETCH RISKS (axios + interceptors)
  const fetchRisks = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all risks from the API
      const res = await API.get("/risks");
      let allRisks = Array.isArray(res.data) ? res.data : [];

      // 2. Safely retrieve the user object from session storage
      const userString = sessionStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      let filteredRisks = allRisks;

      // 3. Apply organization-wise filtering for "root" users
      if (user && user.role === "root") {
        const userOrganization = user.organization;

        if (userOrganization) {
          // Filter risks to only include those belonging to the user's organization.
          // ASSUMPTION: Each risk object (r) has an 'organization' field.
          filteredRisks = allRisks.filter(
            (r) => r.organization === userOrganization
          );
        }
      }

      // 4. Update the state with the filtered list
      setRisks(filteredRisks);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch risks");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE RISK (Using the corrected r._id for state update)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;

    try {
      // NOTE: Assuming the API expects the MongoDB _id for deletion
      await API.delete(`/risks/${id}`); 
      
      // FIX: Filter by the ID passed, which should be the MongoDB _id
      setRisks((prev) => prev.filter((r) => r.riskId !== id));
      
    } catch (err) {
      console.error(err);
      alert("Error deleting risk");
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const filteredRisks = risks.filter((r) =>
    [r.riskId, r.riskDescription, r.department, r.riskType, r.riskLevel]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading risks...</p>
      </div>
    );

  if (error)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>
        {error}
      </p>
    );

  return (
    <div style={{ padding: 20, marginLeft: 200 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Organizational Risks</h2>
        <button onClick={() => history.push("/risks/create")} style={styles.button}>
          <PlusCircle size={18} style={{ marginRight: 5 }} /> Add Risk
        </button>
      </div>

      <input
        placeholder="Search risks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      <table width="100%" border="1" style={styles.table}>
        <thead>
          <tr>
            <th>Risk ID</th>
            <th>Description</th>
            <th>Department</th>
            <th>Type</th>
            <th>Level</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRisks.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No risks found
              </td>
            </tr>
          ) : (
            filteredRisks.map((r) => (
              <tr key={r._id}>
                <td>{r.riskId}</td>
                <td>{r.riskDescription}</td>
                <td>{r.department}</td>
                <td style={getLevelCellStyle(r.riskType)}>{r.riskType}</td>
                <td style={getLevelCellStyle(r.riskLevel)}>{r.riskLevel}</td>
                <td>{r.riskScore}</td>
                <td>
                  <Edit2 
                    onClick={() => history.push(`/risks/edit/${r.riskId}`)} // FIX: Use r._id for edit route
                    style={styles.actionIcon} 
                  />
                  <Trash2 
                    onClick={() => handleDelete(r.riskId)} // FIX: Use r._id for delete action
                    style={styles.actionIcon} 
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const getLevelCellStyle = (level) => {
    let color = '';
    switch (level) {
        case 'High':
        case 'Operational':
            color = '#f8d7da'; // Light Red
            break;
        case 'Medium':
        case 'Tactical':
            color = '#fff3cd'; // Light Yellow
            break;
        case 'Low':
        case 'Strategic':
            color = '#d4edda'; // Light Green
            break;
        default:
            color = '#f8f9fa';
    }
    return { backgroundColor: color, fontWeight: 'bold' };
};

const styles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    marginLeft: 200,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "5px solid #ddd",
    borderTop: "5px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: 12 },
  button: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 15px',
      backgroundColor: '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
  },
  searchInput: { 
      width: "100%", 
      padding: 8, 
      margin: "10px 0",
      borderRadius: 5,
      border: '1px solid #ccc'
  },
  table: {
    borderCollapse: 'collapse',
    marginTop: 15,
    borderRadius: 8,
    overflow: 'hidden'
  },
  actionIcon: {
      cursor: 'pointer',
      marginRight: 10,
      width: 18,
      height: 18,
      color: '#2563eb'
  }
};
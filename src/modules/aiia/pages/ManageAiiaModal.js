// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ChevronDown, RefreshCw, Save, AlertCircle, Edit, Trash2, X, Plus, Search } from 'lucide-react';
// import './PlanAssessmentModal.css';
// import './ManageAiiaModal.css';
// import { getAllUsers, getDepartments } from '../../departments/services/userService';
// import { stage1Api } from '../services/aiiaApi';
// import { captureActivity } from '../../../services/activities';

// // ─── Edit Form (same 2-step layout as PlanAssessmentModal) ───────────────────
// function EditAssessmentForm({ assessment, onClose, onSaved }) {
//   const [step, setStep] = useState(1);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');
//   const [departments, setDepartments] = useState([]);
//   const [riskOwners, setRiskOwners] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loadingDepts, setLoadingDepts] = useState(false);
//   const [loadingOwners, setLoadingOwners] = useState(false);

//   const [form, setForm] = useState({
//     aiSystemName:      assessment.aiSystemName      || '',
//     department:        assessment.department         || '',
//     businessObjective: assessment.businessObjective || '',
//     intendedUse:       assessment.intendedUse        || '',
//     foreseableMisuse:  assessment.foreseableMisuse   || '',
//     aiSystemOwner:     assessment.aiSystemOwner      || '',
//     riskOwners:        assessment.assignedRiskOwners || [],
//     dateOfAssessment:  assessment.dateOfAssessment
//       ? String(assessment.dateOfAssessment).split('T')[0]
//       : new Date().toISOString().split('T')[0],
//     status: assessment.status || 'DRAFT',
//   });

//   const selectedDeptName = departments.find(d => d.id === form.department)?.name || form.department;

//   useEffect(() => {
//     fetchDepartmentsAndUsers();
//   }, []);

//   useEffect(() => {
//     if (form.department) fetchRiskOwnersForDepartment(form.department);
//     else setRiskOwners([]);
//   }, [form.department, allUsers]);

//   const fetchDepartmentsAndUsers = async () => {
//     try {
//       setLoadingDepts(true);
//       setError('');
//       const usersResponse = await getAllUsers();
//       const users = usersResponse.data ?? (Array.isArray(usersResponse) ? usersResponse : []);
//       setAllUsers(users);

//       const deptsResponse = await getDepartments();
//       const depts = deptsResponse.data ?? (Array.isArray(deptsResponse) ? deptsResponse : []);
//       const departmentObjects = depts
//         .map(d => ({ id: d._id || d.id, name: d.name || d.departmentName || d.title || '' }))
//         .filter(d => d.id && d.name);
//       const unique = Array.from(new Map(departmentObjects.map(d => [d.id, d])).values());
//       setDepartments(unique);
//     } catch (err) {
//       setError('Failed to load departments.');
//     } finally {
//       setLoadingDepts(false);
//     }
//   };

//   const fetchRiskOwnersForDepartment = async (selectedDeptId) => {
//     try {
//       setLoadingOwners(true);
//       const owners = allUsers.filter(u => {
//         const userDeptIds = Array.isArray(u.department) ? u.department : u.department ? [u.department] : [];
//         const inDept = userDeptIds.some(id => {
//           const idStr = typeof id === 'string' ? id : id?._id || id?.id || '';
//           return idStr === selectedDeptId;
//         });
//         if (!inDept) return false;
//         const roles = Array.isArray(u.role) ? u.role : u.role ? [u.role] : [];
//         const rolesAlt = Array.isArray(u.roles) ? u.roles : u.roles ? [u.roles] : [];
//         return [...roles, ...rolesAlt].some(r =>
//           (typeof r === 'string' ? r : r?.name || '').toLowerCase().replace(/[\s_-]/g, '').includes('risk')
//         );
//       });
//       setRiskOwners(owners);
//     } catch {
//       setRiskOwners([]);
//     } finally {
//       setLoadingOwners(false);
//     }
//   };

//   const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

//   const toggleRiskOwner = (ownerId) => {
//     setForm(prev => ({
//       ...prev,
//       riskOwners: prev.riskOwners.includes(ownerId)
//         ? prev.riskOwners.filter(id => id !== ownerId)
//         : [...prev.riskOwners, ownerId],
//     }));
//   };

//   const canProceedStep1 = form.aiSystemName && form.department &&
//     form.businessObjective && form.intendedUse && form.aiSystemOwner;
//   const canSave = canProceedStep1 && form.riskOwners.length > 0;

//   const handleSave = async () => {
//     if (!canSave) { setError('Please select at least one risk owner'); return; }
//     setSaving(true);
//     setError('');
//     try {
//       const payload = {
//         aiSystemName:       form.aiSystemName,
//         department:         form.department,
//         businessObjective:  form.businessObjective,
//         intendedUse:        form.intendedUse,
//         foreseableMisuse:   form.foreseableMisuse,
//         aiSystemOwner:      form.aiSystemOwner,
//         assignedRiskOwners: form.riskOwners,
//         dateOfAssessment:   form.dateOfAssessment,
//         status:             form.status,
//       };
//       const assessmentId = assessment._id || assessment.id;
//       await stage1Api.update(assessmentId, payload);
//       captureActivity({
//         action: 'AIIA_ASSESSMENT_UPDATED',
//         item: `Updated AI Assessment: ${form.aiSystemName}`,
//         aiSystemName: form.aiSystemName,
//         department: form.department,
//         status: form.status
//       });
//       onSaved();
//     } catch (err) {
//       if (err.response?.status === 401)      setError('Unauthorized. Please login again.');
//       else if (err.response?.status === 400) setError(err.response.data.message || 'Invalid data provided');
//       else                                   setError('Failed to update assessment. Please try again.');
//       setSaving(false);
//     }
//   };

//   return (
//     <>
//       {/* Sub-header */}
//       <div className="manage-edit-header">
//         <button className="manage-back-btn" onClick={onClose}>← Back to List</button>
//         <div>
//           <h3 className="manage-edit-title">Edit: {assessment.aiSystemName}</h3>
//           <p className="manage-edit-sub">Step {step} of 2 — {step === 1 ? 'Assessment Details' : 'Assign Risk Owners'}</p>
//         </div>
//       </div>

//       {/* Progress bar */}
//       <div className="progress-bar" style={{ margin: '0 0 1.25rem' }}>
//         {[1, 2].map(s => (
//           <div key={s} className={`progress-segment ${step >= s ? 'active' : ''}`} />
//         ))}
//       </div>

//       <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
//         {step === 1 ? (
//           <div className="form-section">
//             <div className="form-group required">
//               <label className="form-label">AI System Name</label>
//               <input type="text" className="form-control" value={form.aiSystemName}
//                 onChange={e => setField('aiSystemName', e.target.value)} placeholder="e.g., Customer Support Chatbot" />
//             </div>

//             <div className="form-group required">
//               <label className="form-label">Department</label>
//               <div className="select-wrapper">
//                 <select className="form-control" value={form.department}
//                   onChange={e => setField('department', e.target.value)}
//                   disabled={loadingDepts || departments.length === 0}>
//                   <option value="">{loadingDepts ? 'Loading departments...' : 'Select Department...'}</option>
//                   {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
//                 </select>
//                 <ChevronDown size={16} className="select-icon" />
//               </div>
//             </div>

//             <div className="form-group required">
//               <label className="form-label">Business Objective</label>
//               <textarea className="form-control" value={form.businessObjective} rows={3}
//                 onChange={e => setField('businessObjective', e.target.value)}
//                 placeholder="Describe the business objective..." />
//             </div>

//             <div className="form-group required">
//               <label className="form-label">Intended Use</label>
//               <textarea className="form-control" value={form.intendedUse} rows={3}
//                 onChange={e => setField('intendedUse', e.target.value)}
//                 placeholder="Describe how this system will be used..." />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Foreseeable Misuse</label>
//               <textarea className="form-control" value={form.foreseableMisuse} rows={3}
//                 onChange={e => setField('foreseableMisuse', e.target.value)}
//                 placeholder="Potential risks or misuse scenarios..." />
//             </div>

//             <div className="form-group required">
//               <label className="form-label">AI System Owner Email</label>
//               <input type="email" className="form-control" value={form.aiSystemOwner}
//                 onChange={e => setField('aiSystemOwner', e.target.value)} placeholder="owner@example.com" />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Assessment Date</label>
//               <input type="date" className="form-control" value={form.dateOfAssessment}
//                 onChange={e => setField('dateOfAssessment', e.target.value)} />
//             </div>

//             <div className="form-group">
//               <label className="form-label">Status</label>
//               <div className="select-wrapper">
//                 <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value)}>
//                   <option value="DRAFT">DRAFT</option>
//                   <option value="SUBMITTED">SUBMITTED</option>
//                   <option value="APPROVED">APPROVED</option>
//                   <option value="REJECTED">REJECTED</option>
//                 </select>
//                 <ChevronDown size={16} className="select-icon" />
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="form-section">
//             <div className="info-box">
//               <AlertCircle size={16} />
//               <p>Select risk owners from <strong>{selectedDeptName}</strong> department</p>
//             </div>
//             {loadingOwners ? (
//               <div className="loading-state"><RefreshCw size={20} className="spinning" /><p>Loading risk owners...</p></div>
//             ) : riskOwners.length === 0 ? (
//               <div className="empty-state">
//                 <AlertCircle size={20} />
//                 <p>No risk owners found in {selectedDeptName} department</p>
//                 <small>Users with a risk role will appear here.</small>
//               </div>
//             ) : (
//               <div className="risk-owners-list">
//                 {riskOwners.map(owner => {
//                   const ownerId  = owner._id || owner.id || owner.userId;
//                   const ownerName  = owner.name || `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
//                   const ownerEmail = owner.email || owner.emailAddress || '';
//                   return (
//                     <div key={ownerId} className="risk-owner-item">
//                       <input type="checkbox" id={`edit-owner-${ownerId}`}
//                         checked={form.riskOwners.includes(ownerId)}
//                         onChange={() => toggleRiskOwner(ownerId)} className="owner-checkbox" />
//                       <label htmlFor={`edit-owner-${ownerId}`} className="owner-label">
//                         <div className="owner-info">
//                           <span className="owner-name">{ownerName}</span>
//                           <span className="owner-email">{ownerEmail}</span>
//                         </div>
//                         <span className="owner-role">Risk Owner</span>
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//             <div className="selected-summary">
//               <p>Selected: <strong>{form.riskOwners.length}</strong> risk owner{form.riskOwners.length !== 1 ? 's' : ''}</p>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="alert alert-danger"><AlertCircle size={16} /><p>{error}</p></div>
//         )}
//       </div>

//       <div className="modal-footer">
//         <div className="button-group">
//           {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>}
//           {step < 2 ? (
//             <button className={`btn btn-primary ${!canProceedStep1 ? 'disabled' : ''}`}
//               onClick={() => {
//                 setStep(2);
//                 captureActivity({ action: 'AIIA_ASSESSMENT_EDIT_STEP_2', item: `Navigated to Assign Risk Owner for AI Assessment: ${form.aiSystemName}` });
//               }} disabled={!canProceedStep1}>
//               Next: Assign Risk Owners →
//             </button>
//           ) : (
//             <button className={`btn btn-success ${!canSave || saving ? 'disabled' : ''}`}
//               onClick={handleSave} disabled={!canSave || saving}>
//               <Save size={16} />
//               {saving ? 'Saving...' : 'Save Changes'}
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// // ─── Main Modal ───────────────────────────────────────────────────────────────
// function ManageAiiaModal({ onClose, onSaved }) {
//   const [assessments, setAssessments] = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [error, setError]             = useState('');
//   const [search, setSearch]           = useState('');
//   const [editingAssessment, setEditingAssessment] = useState(null);
//   const [deletingId, setDeletingId]   = useState(null);

//   useEffect(() => { 
//     fetchAssessments(); 
//     captureActivity({ action: 'AIIA_MANAGE_MODAL_OPENED', item: 'Opened Manage AI Assessments Modal' });
//   }, []);

//   const fetchAssessments = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const res = await stage1Api.getAll();
//       setAssessments(res.data.data || []);
//     } catch {
//       setError('Failed to load assessments.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this assessment? This cannot be undone.')) return;
//     setDeletingId(id);
//     try {
//       const assessmentToDelete = assessments.find(a => (a._id || a.id) === id);
//       const name = assessmentToDelete ? assessmentToDelete.aiSystemName : id;
//       await stage1Api.delete(id);
//       captureActivity({
//         action: 'AIIA_ASSESSMENT_DELETED',
//         item: `Deleted AI Assessment: ${name}`,
//         assessmentId: id
//       });
//       setAssessments(prev => prev.filter(a => (a._id || a.id) !== id));
//       onSaved?.();
//     } catch {
//       setError('Failed to delete assessment.');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const filtered = assessments.filter(a =>
//     a.aiSystemName?.toLowerCase().includes(search.toLowerCase()) ||
//     a.department?.toLowerCase().includes(search.toLowerCase()) ||
//     a.aiSystemOwner?.toLowerCase().includes(search.toLowerCase())
//   );

//   const statusColors = {
//     DRAFT:     { bg: '#fef3c7', color: '#b45309' },
//     SUBMITTED: { bg: '#dbeafe', color: '#1d4ed8' },
//     APPROVED:  { bg: '#d1fae5', color: '#065f46' },
//     REJECTED:  { bg: '#fee2e2', color: '#dc2626' },
//   };

//   // ── Edit view ─────────────────────────────────────────────────────────────
//   if (editingAssessment) {
//     return (
//       <div className="modal-overlay" onClick={onClose}>
//         <div className="modal manage-modal" onClick={e => e.stopPropagation()}>
//           <div className="modal-header">
//             <div>
//               <h2 className="modal-title">Manage AI Assessments</h2>
//             </div>
//             <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
//           </div>
//           <EditAssessmentForm
//             assessment={editingAssessment}
//             onClose={() => setEditingAssessment(null)}
//             onSaved={() => {
//               setEditingAssessment(null);
//               fetchAssessments();
//               onSaved?.();
//             }}
//           />
//         </div>
//       </div>
//     );
//   }

//   // ── List view ─────────────────────────────────────────────────────────────
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal manage-modal" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div>
//             <h2 className="modal-title">Manage AI Assessments</h2>
//             <p className="modal-subtitle">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''} total</p>
//           </div>
//           <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
//         </div>

//         {/* Search */}
//         <div className="manage-search-bar">
//           <Search size={16} className="manage-search-icon" />
//           <input
//             type="text"
//             className="manage-search-input"
//             placeholder="Search by name, department, or owner..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//         </div>

//         <div className="modal-body">
//           {error && <div className="alert alert-danger"><AlertCircle size={16} /><p>{error}</p></div>}

//           {loading ? (
//             <div className="loading-state">
//               <RefreshCw size={20} className="spinning" />
//               <p>Loading assessments...</p>
//             </div>
//           ) : filtered.length === 0 ? (
//             <div className="empty-state">
//               <AlertCircle size={20} />
//               <p>{search ? 'No assessments match your search.' : 'No assessments yet.'}</p>
//             </div>
//           ) : (
//             <div className="manage-list">
//               {filtered.map(assessment => {
//                 const id = assessment._id || assessment.id;
//                 const sc = statusColors[assessment.status] || { bg: '#f1f5f9', color: '#64748b' };
//                 return (
//                   <div key={id} className="manage-item">
//                     <div className="manage-item-left">
//                       <div className="manage-item-title">{assessment.aiSystemName}</div>
//                       <div className="manage-item-meta">
//                         <span>🏢 {assessment.department}</span>
//                         <span className="manage-meta-dot">·</span>
//                         <span>👤 {assessment.aiSystemOwner}</span>
//                         <span className="manage-meta-dot">·</span>
//                        <span>
//   📅 {assessment.dateOfAssessment
//     ? (() => {
//         const date = new Date(assessment.dateOfAssessment);
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();

//         return `${day}-${month}-${year}`;
//       })()
//     : '—'}
// </span>
//                       </div>
//                     </div>
//                     <div className="manage-item-right">
//                       <span className="manage-status-badge" style={{ background: sc.bg, color: sc.color }}>
//                         {assessment.status}
//                       </span>
//                       <button
//                         className="manage-action-btn manage-edit-btn"
//                         onClick={() => setEditingAssessment(assessment)}
//                         title="Edit"
//                       >
//                         <Edit size={15} /> Edit
//                       </button>
//                       <button
//                         className="manage-action-btn manage-delete-btn"
//                         onClick={() => handleDelete(id)}
//                         disabled={deletingId === id}
//                         title="Delete"
//                       >
//                         <Trash2 size={15} />
//                         {deletingId === id ? '...' : 'Delete'}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <div className="button-group">
//             <button className="btn btn-secondary" onClick={onClose}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ManageAiiaModal;


//Testing
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, RefreshCw, Save, AlertCircle, Edit, Trash2, X, Plus, Search } from 'lucide-react';
import './PlanAssessmentModal.css';
import './ManageAiiaModal.css';
import { getAllUsers, getDepartments } from '../../departments/services/userService';
import { stage1Api } from '../services/aiiaApi';

// ── Logging ───────────────────────────────────────────────────────────────────
// CHANGE: same bug as MyAssignments.jsx in this module — custom, non-canonical
// action strings (AIIA_ASSESSMENT_UPDATED, AIIA_ASSESSMENT_EDIT_STEP_2,
// AIIA_MANAGE_MODAL_OPENED, AIIA_ASSESSMENT_DELETED) with no module/url set,
// plus extra top-level fields (aiSystemName, department, status,
// assessmentId) that buildPayload() silently drops since it only destructures
// { action, module, item, url, name, email, role, organizationId }.
// Now imports ACTIONS/MODULES and uses the canonical 10-action taxonomy;
// context fields folded into `item` as an array-of-object.
// CONFIRM: same as flagged in MyAssignments.jsx — verify this import path
// resolves to the real shared activities.js, not a separate/stale copy.
import { captureActivity, ACTIONS, MODULES } from '../../admin/shell/services/activities';

const AIIA_URL = '/aiia/manage';

// ─── Edit Form (same 2-step layout as PlanAssessmentModal) ───────────────────
function EditAssessmentForm({ assessment, onClose, onSaved }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [riskOwners, setRiskOwners] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(false);

  const [form, setForm] = useState({
    aiSystemName:      assessment.aiSystemName      || '',
    department:        assessment.department         || '',
    businessObjective: assessment.businessObjective || '',
    intendedUse:       assessment.intendedUse        || '',
    foreseableMisuse:  assessment.foreseableMisuse   || '',
    aiSystemOwner:     assessment.aiSystemOwner      || '',
    riskOwners:        assessment.assignedRiskOwners || [],
    dateOfAssessment:  assessment.dateOfAssessment
      ? String(assessment.dateOfAssessment).split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: assessment.status || 'DRAFT',
  });

  const selectedDeptName = departments.find(d => d.id === form.department)?.name || form.department;

  useEffect(() => {
    fetchDepartmentsAndUsers();
  }, []);

  useEffect(() => {
    if (form.department) fetchRiskOwnersForDepartment(form.department);
    else setRiskOwners([]);
  }, [form.department, allUsers]);

  const fetchDepartmentsAndUsers = async () => {
    try {
      setLoadingDepts(true);
      setError('');
      const usersResponse = await getAllUsers();
      const users = usersResponse.data ?? (Array.isArray(usersResponse) ? usersResponse : []);
      setAllUsers(users);

      const deptsResponse = await getDepartments();
      const depts = deptsResponse.data ?? (Array.isArray(deptsResponse) ? deptsResponse : []);
      const departmentObjects = depts
        .map(d => ({ id: d._id || d.id, name: d.name || d.departmentName || d.title || '' }))
        .filter(d => d.id && d.name);
      const unique = Array.from(new Map(departmentObjects.map(d => [d.id, d])).values());
      setDepartments(unique);
    } catch (err) {
      setError('Failed to load departments.');
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchRiskOwnersForDepartment = async (selectedDeptId) => {
    try {
      setLoadingOwners(true);
      const owners = allUsers.filter(u => {
        const userDeptIds = Array.isArray(u.department) ? u.department : u.department ? [u.department] : [];
        const inDept = userDeptIds.some(id => {
          const idStr = typeof id === 'string' ? id : id?._id || id?.id || '';
          return idStr === selectedDeptId;
        });
        if (!inDept) return false;
        const roles = Array.isArray(u.role) ? u.role : u.role ? [u.role] : [];
        const rolesAlt = Array.isArray(u.roles) ? u.roles : u.roles ? [u.roles] : [];
        return [...roles, ...rolesAlt].some(r =>
          (typeof r === 'string' ? r : r?.name || '').toLowerCase().replace(/[\s_-]/g, '').includes('risk')
        );
      });
      setRiskOwners(owners);
    } catch {
      setRiskOwners([]);
    } finally {
      setLoadingOwners(false);
    }
  };

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleRiskOwner = (ownerId) => {
    setForm(prev => ({
      ...prev,
      riskOwners: prev.riskOwners.includes(ownerId)
        ? prev.riskOwners.filter(id => id !== ownerId)
        : [...prev.riskOwners, ownerId],
    }));
  };

  const canProceedStep1 = form.aiSystemName && form.department &&
    form.businessObjective && form.intendedUse && form.aiSystemOwner;
  const canSave = canProceedStep1 && form.riskOwners.length > 0;

  const handleSave = async () => {
    if (!canSave) { setError('Please select at least one risk owner'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        aiSystemName:       form.aiSystemName,
        department:         form.department,
        businessObjective:  form.businessObjective,
        intendedUse:        form.intendedUse,
        foreseableMisuse:   form.foreseableMisuse,
        aiSystemOwner:      form.aiSystemOwner,
        assignedRiskOwners: form.riskOwners,
        dateOfAssessment:   form.dateOfAssessment,
        status:             form.status,
      };
      const assessmentId = assessment._id || assessment.id;
      await stage1Api.update(assessmentId, payload);
      // ── LOG: UPDATED — CHANGE: was custom action "AIIA_ASSESSMENT_UPDATED"
      // with no module/url; aiSystemName/department/status were passed as
      // stray top-level fields and silently dropped by buildPayload().
      captureActivity({
        action: ACTIONS.UPDATED,
        module: MODULES.AIIA,
        url: AIIA_URL,
        item: [{
          assessmentId,
          aiSystemName: form.aiSystemName,
          department: form.department,
          status: form.status,
          detail: 'Updated AI Assessment',
        }],
      });
      onSaved();
    } catch (err) {
      if (err.response?.status === 401)      setError('Unauthorized. Please login again.');
      else if (err.response?.status === 400) setError(err.response.data.message || 'Invalid data provided');
      else                                   setError('Failed to update assessment. Please try again.');
      setSaving(false);
    }
  };

  return (
    <>
      {/* Sub-header */}
      <div className="manage-edit-header">
        <button className="manage-back-btn" onClick={onClose}>← Back to List</button>
        <div>
          <h3 className="manage-edit-title">Edit: {assessment.aiSystemName}</h3>
          <p className="manage-edit-sub">Step {step} of 2 — {step === 1 ? 'Assessment Details' : 'Assign Risk Owners'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ margin: '0 0 1.25rem' }}>
        {[1, 2].map(s => (
          <div key={s} className={`progress-segment ${step >= s ? 'active' : ''}`} />
        ))}
      </div>

      <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
        {step === 1 ? (
          <div className="form-section">
            <div className="form-group required">
              <label className="form-label">AI System Name</label>
              <input type="text" className="form-control" value={form.aiSystemName}
                onChange={e => setField('aiSystemName', e.target.value)} placeholder="e.g., Customer Support Chatbot" />
            </div>

            <div className="form-group required">
              <label className="form-label">Department</label>
              <div className="select-wrapper">
                <select className="form-control" value={form.department}
                  onChange={e => setField('department', e.target.value)}
                  disabled={loadingDepts || departments.length === 0}>
                  <option value="">{loadingDepts ? 'Loading departments...' : 'Select Department...'}</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>

            <div className="form-group required">
              <label className="form-label">Business Objective</label>
              <textarea className="form-control" value={form.businessObjective} rows={3}
                onChange={e => setField('businessObjective', e.target.value)}
                placeholder="Describe the business objective..." />
            </div>

            <div className="form-group required">
              <label className="form-label">Intended Use</label>
              <textarea className="form-control" value={form.intendedUse} rows={3}
                onChange={e => setField('intendedUse', e.target.value)}
                placeholder="Describe how this system will be used..." />
            </div>

            <div className="form-group">
              <label className="form-label">Foreseeable Misuse</label>
              <textarea className="form-control" value={form.foreseableMisuse} rows={3}
                onChange={e => setField('foreseableMisuse', e.target.value)}
                placeholder="Potential risks or misuse scenarios..." />
            </div>

            <div className="form-group required">
              <label className="form-label">AI System Owner Email</label>
              <input type="email" className="form-control" value={form.aiSystemOwner}
                onChange={e => setField('aiSystemOwner', e.target.value)} placeholder="owner@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Assessment Date</label>
              <input type="date" className="form-control" value={form.dateOfAssessment}
                onChange={e => setField('dateOfAssessment', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="select-wrapper">
                <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>
        ) : (
          <div className="form-section">
            <div className="info-box">
              <AlertCircle size={16} />
              <p>Select risk owners from <strong>{selectedDeptName}</strong> department</p>
            </div>
            {loadingOwners ? (
              <div className="loading-state"><RefreshCw size={20} className="spinning" /><p>Loading risk owners...</p></div>
            ) : riskOwners.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={20} />
                <p>No risk owners found in {selectedDeptName} department</p>
                <small>Users with a risk role will appear here.</small>
              </div>
            ) : (
              <div className="risk-owners-list">
                {riskOwners.map(owner => {
                  const ownerId  = owner._id || owner.id || owner.userId;
                  const ownerName  = owner.name || `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
                  const ownerEmail = owner.email || owner.emailAddress || '';
                  return (
                    <div key={ownerId} className="risk-owner-item">
                      <input type="checkbox" id={`edit-owner-${ownerId}`}
                        checked={form.riskOwners.includes(ownerId)}
                        onChange={() => toggleRiskOwner(ownerId)} className="owner-checkbox" />
                      <label htmlFor={`edit-owner-${ownerId}`} className="owner-label">
                        <div className="owner-info">
                          <span className="owner-name">{ownerName}</span>
                          <span className="owner-email">{ownerEmail}</span>
                        </div>
                        <span className="owner-role">Risk Owner</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="selected-summary">
              <p>Selected: <strong>{form.riskOwners.length}</strong> risk owner{form.riskOwners.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger"><AlertCircle size={16} /><p>{error}</p></div>
        )}
      </div>

      <div className="modal-footer">
        <div className="button-group">
          {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>}
          {step < 2 ? (
            <button className={`btn btn-primary ${!canProceedStep1 ? 'disabled' : ''}`}
              onClick={() => {
                setStep(2);
                // ── LOG: CLICK — CHANGE: was custom action
                // "AIIA_ASSESSMENT_EDIT_STEP_2" with no module/url. In-form
                // step navigation, not a data mutation, so CLICK is correct
                // (matches how multi-step navigation is logged elsewhere,
                // e.g. Step 2 | Step Name entries seen in Risk's add flow).
                captureActivity({
                  action: ACTIONS.CLICK,
                  module: MODULES.AIIA,
                  url: AIIA_URL,
                  item: [{ detail: `Navigated to Assign Risk Owner for AI Assessment: ${form.aiSystemName}`, step: 2 }],
                });
              }} disabled={!canProceedStep1}>
              Next: Assign Risk Owners →
            </button>
          ) : (
            <button className={`btn btn-success ${!canSave || saving ? 'disabled' : ''}`}
              onClick={handleSave} disabled={!canSave || saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
function ManageAiiaModal({ onClose, onSaved }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  useEffect(() => { 
    fetchAssessments(); 
    // ── LOG: VISITED — CHANGE: was custom action "AIIA_MANAGE_MODAL_OPENED"
    // with no module/url. Modal-open-on-mount is treated as a VISITED event,
    // consistent with how page mounts are logged elsewhere (e.g. AddRisk.jsx).
    captureActivity({
      action: ACTIONS.VISITED,
      module: MODULES.AIIA,
      url: AIIA_URL,
      item: [{ detail: 'Opened Manage AI Assessments Modal' }],
    });
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await stage1Api.getAll();
      setAssessments(res.data.data || []);
    } catch {
      setError('Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const assessmentToDelete = assessments.find(a => (a._id || a.id) === id);
      const name = assessmentToDelete ? assessmentToDelete.aiSystemName : id;
      await stage1Api.delete(id);
      // ── LOG: DELETE — CHANGE: was custom action "AIIA_ASSESSMENT_DELETED"
      // with no module/url; assessmentId was a stray top-level field dropped
      // by buildPayload().
      captureActivity({
        action: ACTIONS.DELETE,
        module: MODULES.AIIA,
        url: AIIA_URL,
        item: [{ assessmentId: id, aiSystemName: name, detail: 'Deleted AI Assessment' }],
      });
      setAssessments(prev => prev.filter(a => (a._id || a.id) !== id));
      onSaved?.();
    } catch {
      setError('Failed to delete assessment.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = assessments.filter(a =>
    a.aiSystemName?.toLowerCase().includes(search.toLowerCase()) ||
    a.department?.toLowerCase().includes(search.toLowerCase()) ||
    a.aiSystemOwner?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    DRAFT:     { bg: '#fef3c7', color: '#b45309' },
    SUBMITTED: { bg: '#dbeafe', color: '#1d4ed8' },
    APPROVED:  { bg: '#d1fae5', color: '#065f46' },
    REJECTED:  { bg: '#fee2e2', color: '#dc2626' },
  };

  // ── Edit view ─────────────────────────────────────────────────────────────
  if (editingAssessment) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal manage-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Manage AI Assessments</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <EditAssessmentForm
            assessment={editingAssessment}
            onClose={() => setEditingAssessment(null)}
            onSaved={() => {
              setEditingAssessment(null);
              fetchAssessments();
              onSaved?.();
            }}
          />
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal manage-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Manage AI Assessments</h2>
            <p className="modal-subtitle">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''} total</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Search */}
        <div className="manage-search-bar">
          <Search size={16} className="manage-search-icon" />
          <input
            type="text"
            className="manage-search-input"
            placeholder="Search by name, department, or owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger"><AlertCircle size={16} /><p>{error}</p></div>}

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={20} className="spinning" />
              <p>Loading assessments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={20} />
              <p>{search ? 'No assessments match your search.' : 'No assessments yet.'}</p>
            </div>
          ) : (
            <div className="manage-list">
              {filtered.map(assessment => {
                const id = assessment._id || assessment.id;
                const sc = statusColors[assessment.status] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <div key={id} className="manage-item">
                    <div className="manage-item-left">
                      <div className="manage-item-title">{assessment.aiSystemName}</div>
                      <div className="manage-item-meta">
                        <span>🏢 {assessment.department}</span>
                        <span className="manage-meta-dot">·</span>
                        <span>👤 {assessment.aiSystemOwner}</span>
                        <span className="manage-meta-dot">·</span>
                       <span>
  📅 {assessment.dateOfAssessment
    ? (() => {
        const date = new Date(assessment.dateOfAssessment);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
      })()
    : '—'}
</span>
                      </div>
                    </div>
                    <div className="manage-item-right">
                      <span className="manage-status-badge" style={{ background: sc.bg, color: sc.color }}>
                        {assessment.status}
                      </span>
                      <button
                        className="manage-action-btn manage-edit-btn"
                        onClick={() => setEditingAssessment(assessment)}
                        title="Edit"
                      >
                        <Edit size={15} /> Edit
                      </button>
                      <button
                        className="manage-action-btn manage-delete-btn"
                        onClick={() => handleDelete(id)}
                        disabled={deletingId === id}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                        {deletingId === id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="button-group">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageAiiaModal;
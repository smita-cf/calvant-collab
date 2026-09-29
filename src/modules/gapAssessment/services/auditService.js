// src/modules/audit/services/auditService.js

var BASE = "https://api.calvant.com/audit/api";
var CONTROL_BASE = "https://api.calvant.com/framework/api";

function getOrg() {
  var raw = sessionStorage.getItem("user");
  var user = raw ? JSON.parse(raw) : {};
  return user.organization || "";
}

function handleResponse(res) {
  if (!res.ok) {
    return res.json().then(function(body) {
      throw new Error((body && body.message) || "Request failed: " + res.status);
    }).catch(function() {
      throw new Error("Request failed: " + res.status);
    });
  }
  var contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  }
  return null;
}

// ─────────────────────────────────────────────
// AUDITS
// ─────────────────────────────────────────────

function getAudits() {
  return fetch(BASE + "/audits?organization=" + encodeURIComponent(getOrg()), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(handleResponse);
}

function createAudit(payload) {
  return fetch(BASE + "/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function updateAudit(id, payload) {
  return fetch(BASE + "/audits/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);
}

function deleteAudit(id) {
  return fetch(BASE + "/audits/" + id, {
    method: "DELETE",
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// ASSIGN
// ─────────────────────────────────────────────

function assignControl(auditId, controlId, assignedTo) {
  return fetch(BASE + "/audits/" + auditId + "/controls/" + controlId + "/assign", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignedTo: assignedTo }),
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// SCORE
// ─────────────────────────────────────────────

function scoreControl(auditId, controlId, docScore, practiceScore, remarks) {
  return fetch(BASE + "/audits/" + auditId + "/controls/" + controlId + "/score", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docScore: docScore, practiceScore: practiceScore, remarks: remarks }),
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// FINDINGS
// ─────────────────────────────────────────────

function getFindings(auditId) {
  return fetch(BASE + "/audits/" + auditId + "/findings", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(handleResponse);
}

function addFinding(auditId, finding) {
  return fetch(BASE + "/audits/" + auditId + "/findings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(finding),
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// CAP
// ─────────────────────────────────────────────

function createOrUpdateCAP(auditId, findingId, cap) {
  return fetch(BASE + "/audits/" + auditId + "/findings/" + findingId + "/cap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cap),
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// USER SERVICE
// ─────────────────────────────────────────────

function getToken() {
  return sessionStorage.getItem("token");
}

function userAuthConfig() {
  var token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
}

var USER_BASE = (process.env.NEXT_PUBLIC_SP || "") + "/user-service/api";

function getAllUsers() {
  return fetch(USER_BASE + "/users", {
    method: "GET",
    headers: userAuthConfig(),
  }).then(handleResponse);
}

// ─────────────────────────────────────────────
// CONTROL SERVICE
// ─────────────────────────────────────────────

function getControlsByFramework(frameworkCode) {
  return fetch(CONTROL_BASE + "/controls/framework/" + encodeURIComponent(frameworkCode), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(handleResponse);
}

// Normalise the control-service response.
//
// KEY FIX: controlId = _id (MongoDB ObjectId — used as the key in AuditControl.controlId)
//          clause    = controlCode (e.g. "5.5.2" — used for all DISPLAY purposes)
//
// Everywhere in the UI we now display ctrl.clause (the human-readable code)
// and only send ctrl.controlId to the backend.
//
function normaliseControl(raw) {
  return {
    // Backend key — the MongoDB _id stored in AuditControl.controlId
    controlId:      raw._id           || raw.controlId || raw.id || "",
    // Display code — e.g. "5.5.2", "A.8.1" — shown in all badges and dropdowns
    clause:         raw.controlCode   || raw.clause    || raw.controlId || "",
    label:          raw.title         || raw.label     || raw.name || raw.standardRequirement || "",
    departmentIds:  Array.isArray(raw.departmentIds) ? raw.departmentIds : [],
    category:       raw.category      || "",
    sectionType:    raw.sectionType   || "",
    description:    raw.description   || "",
    // Include audit questions so ConductAuditModal can display them
    auditQuestions: Array.isArray(raw.auditQuestions) ? raw.auditQuestions : [],
  };
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

var auditService = {
  getAudits:              getAudits,
  createAudit:            createAudit,
  updateAudit:            updateAudit,
  deleteAudit:            deleteAudit,
  assignControl:          assignControl,
  scoreControl:           scoreControl,
  getFindings:            getFindings,
  addFinding:             addFinding,
  createOrUpdateCAP:      createOrUpdateCAP,
  getAllUsers:             getAllUsers,
  getControlsByFramework: getControlsByFramework,
  normaliseControl:       normaliseControl,
};

export default auditService;
// src/api/controlOwnershipApi.js
// Base URL points to control-ownership-service on port 4025

const BASE_URL = "https://api.calvant.com/control-ownership-service";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ── Eligible Owners ───────────────────────────────────────────────────────────
export const getEligibleOwners = async () => {
  const res = await fetch(`${BASE_URL}/api/control-ownership/eligible-owners`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Frameworks ────────────────────────────────────────────────────────────────
export const getAllFrameworks = async () => {
  const res = await fetch(`${BASE_URL}/api/control-ownership/frameworks`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Controls by Framework ─────────────────────────────────────────────────────
export const getControlsByFramework = async (frameworkCode) => {
  const res = await fetch(
    `${BASE_URL}/api/control-ownership/frameworks/${frameworkCode}/controls`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Assign Ownership ──────────────────────────────────────────────────────────
export const assignOwnership = async ({ controlId, ownerId, ownerRole, notes }) => {
  const res = await fetch(`${BASE_URL}/api/control-ownership/assign`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ controlId, ownerId, ownerRole, notes }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Get All Assignments ───────────────────────────────────────────────────────
export const getAllOwnerships = async () => {
  const res = await fetch(`${BASE_URL}/api/control-ownership`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Get By Framework ──────────────────────────────────────────────────────────
export const getOwnershipsByFramework = async (frameworkCode) => {
  const res = await fetch(
    `${BASE_URL}/api/control-ownership/by-framework/${frameworkCode}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Get By Owner ──────────────────────────────────────────────────────────────
export const getOwnershipsByOwner = async (ownerId) => {
  const res = await fetch(
    `${BASE_URL}/api/control-ownership/by-owner/${ownerId}`,
    { headers: getHeaders() }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Delete Assignment ─────────────────────────────────────────────────────────
export const deleteOwnership = async (ownershipId) => {
  const res = await fetch(`${BASE_URL}/api/control-ownership/${ownershipId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Update Notes ──────────────────────────────────────────────────────────────
export const updateOwnershipNotes = async (ownershipId, notes) => {
  const res = await fetch(
    `${BASE_URL}/api/control-ownership/${ownershipId}/notes`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
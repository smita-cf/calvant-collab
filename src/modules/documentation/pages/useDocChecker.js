// // import { useState, useCallback, useRef } from "react";

// // const DOC_CHECKER_BASE = "https://api.calvant.com/doc-checker-service/api/doc-checker";

// // /**
// //  * Hard approval threshold — a doc must score >= this to be COMPLIANT.
// //  * Still 85, unchanged. What changed is the band BELOW it:
// //  *   COMPLIANT    >= 85   → green, can approve
// //  *   BORDERLINE   75–84   → amber, cannot approve yet (manual review required)
// //  *   NON_COMPLIANT < 75   → red, hard fail
// //  *
// //  * The 10-point BORDERLINE buffer (75–84) absorbs LLM score drift of ±4–6 pts
// //  * across re-runs, so a document that scores 82 on run 1 and 79 on re-verify
// //  * stays BORDERLINE rather than flipping to a hard fail.
// //  */
// // export const APPROVAL_THRESHOLD  = 85;
// // export const BORDERLINE_THRESHOLD = 75;

// // /**
// //  * Derive the compliance band from a numeric score.
// //  * Single source of truth — mirrors DocCheckerService.evaluate() on the backend.
// //  */
// // export function getComplianceStatus(score) {
// //   if (score >= APPROVAL_THRESHOLD)   return "COMPLIANT";
// //   if (score >= BORDERLINE_THRESHOLD) return "BORDERLINE";
// //   return "NON_COMPLIANT";
// // }

// // function authHeaders() {
// //   const token = sessionStorage.getItem("token");
// //   return {
// //     "Content-Type": "application/json",
// //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //   };
// // }

// // async function postCheck(payload) {
// //   const res = await fetch(`${DOC_CHECKER_BASE}/check`, {
// //     method: "POST",
// //     headers: authHeaders(),
// //     body: JSON.stringify(payload),
// //   });
// //   if (!res.ok) {
// //     const body = await res.json().catch(() => ({}));
// //     throw new Error(body?.message || `Doc check failed (HTTP ${res.status})`);
// //   }
// //   return res.json();
// // }

// // async function getLatest(docId) {
// //   const res = await fetch(`${DOC_CHECKER_BASE}/results/latest/${docId}`, {
// //     headers: authHeaders(),
// //   });
// //   if (res.status === 404) return null;
// //   if (!res.ok) throw new Error(`Failed to fetch latest result (HTTP ${res.status})`);
// //   return res.json();
// // }

// // export function useDocChecker() {
// //   const [results,   setResults]   = useState({});
// //   const [verifying, setVerifying] = useState({});
// //   const [errors,    setErrors]    = useState({});

// //   // Only used to deduplicate hydration calls — NOT used to guard state updates
// //   const hydratedRef = useRef(new Set());

// //   const hydrateDocs = useCallback(async (docIds) => {
// //     const pending = docIds.filter((id) => id && !hydratedRef.current.has(id));
// //     if (pending.length === 0) return;
// //     pending.forEach((id) => hydratedRef.current.add(id));

// //     const settled = await Promise.allSettled(
// //       pending.map((id) => getLatest(id).then((r) => ({ id, result: r })))
// //     );

// //     const updates = {};
// //     settled.forEach((s) => {
// //       if (s.status === "fulfilled" && s.value.result) {
// //         updates[s.value.id] = s.value.result;
// //       } else if (s.status === "rejected") {
// //         console.warn("[useDocChecker] hydrateDocs error:", s.reason?.message);
// //       }
// //       // 404 → result is null → silent, row shows Verify button
// //     });

// //     if (Object.keys(updates).length > 0) {
// //       setResults((prev) => ({ ...prev, ...updates }));
// //     }
// //   }, []);

// //   const verify = useCallback(async (row) => {
// //     const { docId } = row;
// //     if (!docId) {
// //       console.error("[useDocChecker] verify() called without docId", row);
// //       return null;
// //     }

// //     setVerifying((prev) => ({ ...prev, [docId]: true }));
// //     setErrors((prev)    => ({ ...prev, [docId]: null }));

// //     try {
// //       const payload = {
// //         docId,
// //         docUrl:         row.docUrl,
// //         mldDocName:     row.docName,
// //         organizationId: row.organizationId,
// //         soaId:          row.soaId,
// //         controlId:      row.controlId,
// //         // Framework-aware control mapping — lets doc-checker-service factor
// //         // coverage of this control's requirements into the policyStatements score.
// //         framework:      row.framework,
// //         controlCode:    row.controlCode,
// //         controlTitle:   row.controlTitle,
// //       };
// //       const result = await postCheck(payload);
// //       setResults((prev) => ({ ...prev, [docId]: result }));
// //       hydratedRef.current.add(docId);
// //       return result;
// //     } catch (e) {
// //       setErrors((prev) => ({ ...prev, [docId]: e.message }));
// //       return null;
// //     } finally {
// //       setVerifying((prev) => ({ ...prev, [docId]: false }));
// //     }
// //   }, []);

// //   const getResult   = useCallback((docId) => results[docId],     [results]);
// //   const isVerifying = useCallback((docId) => !!verifying[docId], [verifying]);
// //   const getError    = useCallback((docId) => errors[docId],      [errors]);

// //   /**
// //    * A document can be approved only when:
// //    *   1. Title matches (binary gate — never relaxed)
// //    *   2. complianceStatus === "COMPLIANT" (score >= 85)
// //    *
// //    * BORDERLINE (75–84) is intentionally NOT approvable — it requires manual
// //    * review before sign-off. This is what requiresManualReview=true signals
// //    * from the backend.
// //    */
// //   const canApprove = useCallback((docId) => {
// //     const r = results[docId];
// //     if (!r) return false;
// //     const status = r.complianceStatus || getComplianceStatus(r.overallScore ?? 0);
// //     return r.titleMatch === true && status === "COMPLIANT";
// //   }, [results]);

// //   /**
// //    * Human-readable block reason shown in the ApproveGateModal.
// //    * Explicitly describes the BORDERLINE state so users understand
// //    * this isn't a hard fail — it needs manual review.
// //    */
// //   const getBlockReason = useCallback((docId) => {
// //     const r = results[docId];
// //     if (!r) {
// //       return "This document has not been verified yet. Click Verify in the Quality Check column to run the check.";
// //     }

// //     const reasons = [];

// //     if (!r.titleMatch) {
// //       reasons.push(
// //         `Title mismatch: the MLD expects "${r.mldDocName}" but the document title is "${r.extractedDocTitle}".`
// //       );
// //     }

// //     const score  = r.overallScore ?? 0;
// //     const status = r.complianceStatus || getComplianceStatus(score);

// //     if (status === "BORDERLINE") {
// //       reasons.push(
// //         `Content score ${score}/100 is in the borderline zone (${BORDERLINE_THRESHOLD}–${APPROVAL_THRESHOLD - 1}). ` +
// //         `This document requires manual review before approval. ` +
// //         `A compliance officer must sign off on borderline documents — they do not auto-approve.`
// //       );
// //     } else if (status === "NON_COMPLIANT") {
// //       reasons.push(
// //         `Content score ${score}/100 is below the minimum threshold of ${BORDERLINE_THRESHOLD}. ` +
// //         `The document must be revised and re-verified before it can be approved.`
// //       );
// //     }

// //     return reasons.join(" ");
// //   }, [results]);

// //   return {
// //     verify,
// //     hydrateDocs,
// //     getResult,
// //     isVerifying,
// //     getError,
// //     canApprove,
// //     getBlockReason,
// //   };
// // }

//+++++++++++++++++++++++++++++++++++++++++++--------------------------------------------++++++++++++++++++++++++++++++++++++++
// import { useState, useCallback, useRef } from "react";

// const DOC_CHECKER_BASE = "https://api.calvant.com/doc-checker-service/api/doc-checker";

// // ✅ CHANGED: was 85, now 75
// export const APPROVAL_THRESHOLD = 75;

// function authHeaders() {
//   const token = sessionStorage.getItem("token");
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// async function postCheck(payload) {
//   const res = await fetch(`${DOC_CHECKER_BASE}/check`, {
//     method: "POST",
//     headers: authHeaders(),
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     throw new Error(body?.message || `Doc check failed (HTTP ${res.status})`);
//   }
//   return res.json();
// }

// async function getLatest(docId) {
//   const res = await fetch(`${DOC_CHECKER_BASE}/results/latest/${docId}`, {
//     headers: authHeaders(),
//   });
//   if (res.status === 404) return null;
//   if (!res.ok) throw new Error(`Failed to fetch latest result (HTTP ${res.status})`);
//   return res.json();
// }

// export function useDocChecker() {
//   const [results,   setResults]   = useState({});
//   const [verifying, setVerifying] = useState({});
//   const [errors,    setErrors]    = useState({});

//   // Only used to deduplicate hydration calls — NOT used to guard state updates
//   const hydratedRef = useRef(new Set());

//   const hydrateDocs = useCallback(async (docIds) => {
//     const pending = docIds.filter((id) => id && !hydratedRef.current.has(id));
//     if (pending.length === 0) return;
//     pending.forEach((id) => hydratedRef.current.add(id));

//     const settled = await Promise.allSettled(
//       pending.map((id) => getLatest(id).then((r) => ({ id, result: r })))
//     );

//     const updates = {};
//     settled.forEach((s) => {
//       if (s.status === "fulfilled" && s.value.result) {
//         updates[s.value.id] = s.value.result;
//       } else if (s.status === "rejected") {
//         console.warn("[useDocChecker] hydrateDocs error:", s.reason?.message);
//       }
//       // 404 → result is null → silent, row shows Verify button
//     });

//     if (Object.keys(updates).length > 0) {
//       setResults((prev) => ({ ...prev, ...updates }));
//     }
//   }, []);

//   const verify = useCallback(async (row) => {
//     const { docId } = row;
//     if (!docId) {
//       console.error("[useDocChecker] verify() called without docId", row);
//       return null;
//     }

//     setVerifying((prev) => ({ ...prev, [docId]: true }));
//     setErrors((prev)    => ({ ...prev, [docId]: null }));

//     try {
//       const payload = {
//         docId,
//         docUrl:         row.docUrl,
//         mldDocName:     row.docName,
//         organizationId: row.organizationId,
//         soaId:          row.soaId,
//         controlId:      row.controlId,
//         // ── Framework-aware control mapping ──
//         // When present, doc-checker-service factors coverage of this
//         // control's actual requirements directly into the policyStatements
//         // score (see GroqAuditService) — not a separate field, a real input
//         // to the same 0-80 criterion.
//         framework:      row.framework,
//         controlCode:    row.controlCode,
//         controlTitle:   row.controlTitle,
//       };
//       const result = await postCheck(payload);
//       setResults((prev) => ({ ...prev, [docId]: result }));
//       hydratedRef.current.add(docId);
//       return result;
//     } catch (e) {
//       setErrors((prev) => ({ ...prev, [docId]: e.message }));
//       return null;
//     } finally {
//       setVerifying((prev) => ({ ...prev, [docId]: false }));
//     }
//   }, []);

//   const getResult   = useCallback((docId) => results[docId],     [results]);
//   const isVerifying = useCallback((docId) => !!verifying[docId], [verifying]);
//   const getError    = useCallback((docId) => errors[docId],      [errors]);

//   const canApprove = useCallback((docId) => {
//     const r = results[docId];
//     if (!r) return false;
//     // Both title match AND content score >= APPROVAL_THRESHOLD (75) required to approve.
//     // Note: when this doc was control-linked, control-requirement coverage
//     // is already baked into overallScore via policyStatements (see
//     // GroqAuditService/DocCheckerService) — there is no separate gate here.
//     return r.titleMatch === true && (r.overallScore ?? 0) >= APPROVAL_THRESHOLD;
//   }, [results]);

//   const getBlockReason = useCallback((docId) => {
//     const r = results[docId];
//     if (!r) return "This document has not been verified yet. Click Verify in the Quality Check column to run the check.";
//     const reasons = [];
//     if (!r.titleMatch) {
//       reasons.push(
//         `Title mismatch: the MLD expects "${r.mldDocName}" but the document title is "${r.extractedDocTitle}".`
//       );
//     }
//     if ((r.overallScore ?? 0) < APPROVAL_THRESHOLD) {
//       reasons.push(
//         `Content score is ${r.overallScore}/100 — below the required ${APPROVAL_THRESHOLD} to approve.`
//       );
//     }
//     return reasons.join(" ");
//   }, [results]);

//   return {
//     verify,
//     hydrateDocs,
//     getResult,
//     isVerifying,
//     getError,
//     canApprove,
//     getBlockReason,
//   };
// }

//////////////////////////////////77777777777777777777777777777777777777777777777777777777////////////////////////////////////////
import { useState, useCallback, useRef } from "react";

const DOC_CHECKER_BASE = "https://api.calvant.com/doc-checker-service/api/doc-checker";

// ✅ CHANGED: was 75, now 90 — only A+ grade documents are approvable
export const APPROVAL_THRESHOLD = 90;

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function postCheck(payload) {
  const res = await fetch(`${DOC_CHECKER_BASE}/check`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Doc check failed (HTTP ${res.status})`);
  }
  return res.json();
}

async function getLatest(docId) {
  const res = await fetch(`${DOC_CHECKER_BASE}/results/latest/${docId}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch latest result (HTTP ${res.status})`);
  return res.json();
}

export function useDocChecker() {
  const [results,   setResults]   = useState({});
  const [verifying, setVerifying] = useState({});
  const [errors,    setErrors]    = useState({});

  // Only used to deduplicate hydration calls — NOT used to guard state updates
  const hydratedRef = useRef(new Set());

  const hydrateDocs = useCallback(async (docIds) => {
    const pending = docIds.filter((id) => id && !hydratedRef.current.has(id));
    if (pending.length === 0) return;
    pending.forEach((id) => hydratedRef.current.add(id));

    const settled = await Promise.allSettled(
      pending.map((id) => getLatest(id).then((r) => ({ id, result: r })))
    );

    const updates = {};
    settled.forEach((s) => {
      if (s.status === "fulfilled" && s.value.result) {
        updates[s.value.id] = s.value.result;
      } else if (s.status === "rejected") {
        console.warn("[useDocChecker] hydrateDocs error:", s.reason?.message);
      }
      // 404 → result is null → silent, row shows Verify button
    });

    if (Object.keys(updates).length > 0) {
      setResults((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const verify = useCallback(async (row) => {
    const { docId } = row;
    if (!docId) {
      console.error("[useDocChecker] verify() called without docId", row);
      return null;
    }

    setVerifying((prev) => ({ ...prev, [docId]: true }));
    setErrors((prev)    => ({ ...prev, [docId]: null }));

    try {
      const payload = {
        docId,
        docUrl:         row.docUrl,
        mldDocName:     row.docName,
        organizationId: row.organizationId,
        soaId:          row.soaId,
        controlId:      row.controlId,
        // ── Framework-aware control mapping ──
        // When present, doc-checker-service factors coverage of this
        // control's actual requirements directly into the policyStatements
        // score (see GroqAuditService) — not a separate field, a real input
        // to the same 0-80 criterion.
        framework:      row.framework,
        controlCode:    row.controlCode,
        controlTitle:   row.controlTitle,
      };
      const result = await postCheck(payload);
      setResults((prev) => ({ ...prev, [docId]: result }));
      hydratedRef.current.add(docId);
      return result;
    } catch (e) {
      setErrors((prev) => ({ ...prev, [docId]: e.message }));
      return null;
    } finally {
      setVerifying((prev) => ({ ...prev, [docId]: false }));
    }
  }, []);

  const getResult   = useCallback((docId) => results[docId],     [results]);
  const isVerifying = useCallback((docId) => !!verifying[docId], [verifying]);
  const getError    = useCallback((docId) => errors[docId],      [errors]);

  const canApprove = useCallback((docId) => {
    const r = results[docId];
    if (!r) return false;
    // Both title match AND content score >= APPROVAL_THRESHOLD (90, i.e.
    // A+ grade only) required to approve.
    // Note: when this doc was control-linked, control-requirement coverage
    // is already baked into overallScore via policyStatements (see
    // GroqAuditService/DocCheckerService) — there is no separate gate here.
    return r.titleMatch === true && (r.overallScore ?? 0) >= APPROVAL_THRESHOLD;
  }, [results]);

  const getBlockReason = useCallback((docId) => {
    const r = results[docId];
    if (!r) return "This document has not been verified yet. Click Verify in the Quality Check column to run the check.";
    const reasons = [];
    if (!r.titleMatch) {
      reasons.push(
        `Title mismatch: the MLD expects "${r.mldDocName}" but the document title is "${r.extractedDocTitle}".`
      );
    }
    if ((r.overallScore ?? 0) < APPROVAL_THRESHOLD) {
      reasons.push(
        `Document grade is below A+ — only an A+ grade can be approved.`
      );
    }
    return reasons.join(" ");
  }, [results]);

  return {
    verify,
    hydrateDocs,
    getResult,
    isVerifying,
    getError,
    canApprove,
    getBlockReason,
  };
}
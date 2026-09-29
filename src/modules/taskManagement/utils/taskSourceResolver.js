// taskManagement/utils/taskSourceResolver.js

export function resolveTaskSource(task) {
  // DPIA — direct link, id is a path segment
  if (task.dpiaId || task.source === "DPIA") {
    const id = task.dpiaId;
    if (!id) return null;
    return { label: "DPIA", kind: "direct", route: `/dpia/${encodeURIComponent(id)}` };
  }

  // AIIA — direct link, confirmed via MyAssignments.js handleCardClick
  if (task.aiiaId || task.source === "AIIA") {
    const id = task.aiiaId;
    if (!id) return null;
    return { label: "AIIA", kind: "direct", route: `/aiia/my-assignments/${encodeURIComponent(id)}` };
  }

  // Risk — direct link via editRiskId
  if (task.riskId) {
    return { label: "Risk", kind: "direct", route: `/risk-assessment/add?editRiskId=${encodeURIComponent(task.riskId)}` };
  }

  // Audit / CAP — modal, no deep link — needs auto-open wiring (see section 2)
  if (task.auditId) {
    return {
      label: "Audit",
      kind: "queryParam",
      route: `/gap-assessment?openAuditId=${encodeURIComponent(task.auditId)}`,
      openParam: "openAuditId",
    };
  }

  // Policy vs Compliance — both use controlId, source flag disambiguates
  if (task.controlId && task.source === "Policy") {
    return {
      label: "Policy",
      kind: "queryParam",
      route: `/documentation/mld?openControlId=${encodeURIComponent(task.controlId)}`,
      openParam: "openControlId",
    };
  }
  if (task.controlId) {
    return {
      label: "Compliance",
      kind: "queryParam",
      route: `/compliances/detailed?openControlId=${encodeURIComponent(task.controlId)}`,
      openParam: "openControlId",
    };
  }

  return null;
}
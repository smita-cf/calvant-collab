import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@material-ui/core";
import { captureActivity, ACTIONS, logSelect } from "../../services/activities";
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Functions as FunctionsIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@material-ui/icons";

const PAGE_SIZE = 10;

const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(2);
};

const formatKey = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Stringify any scalar-ish value for display in a generic table cell.
const displayValue = (v) => {
  if (v === null || v === undefined || v === "") return "N/A";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return formatNumber(v);
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
};

// ─── Summary / KV card ───────────────────────────────────────────────────────
const SummaryCard = ({ data, title }) => (
  <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
    {title && (
      <Typography variant="subtitle2" gutterBottom>
        <strong>{title}</strong>
      </Typography>
    )}
    <Box display="flex" flexWrap="wrap" style={{ gap: 16 }}>
      {Object.entries(data)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => (
          <Box key={k} minWidth={120}>
            <Typography variant="caption" style={{ color: "#888", display: "block" }}>
              {formatKey(k)}
            </Typography>
            <Typography variant="body2" style={{ fontWeight: 600 }}>
              {displayValue(v)}
            </Typography>
          </Box>
        ))}
    </Box>
  </Box>
);

// ─── Boolean badge ────────────────────────────────────────────────────────────
const BoolBadge = ({ value, trueLabel = "Yes", falseLabel = "No" }) =>
  value ? (
    <Chip
      icon={<CheckCircleIcon />}
      label={trueLabel}
      size="small"
      style={{ backgroundColor: "#d4edda", color: "#155724" }}
    />
  ) : (
    <Chip
      icon={<CancelIcon />}
      label={falseLabel}
      size="small"
      style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
    />
  );

// ─── Generic auto-column table (fallback renderer for shapes with no bespoke UI) ──
// Infers columns from the union of keys across the first few items so any
// array-of-objects evidence renders as a real table instead of being dropped
// or dumped as raw JSON.
const inferColumns = (items, maxCols = 6) => {
  const seen = new Set();
  const cols = [];
  for (const item of items.slice(0, 25)) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      Object.keys(item).forEach((k) => {
        if (!seen.has(k) && k !== "_class") {
          seen.add(k);
          cols.push(k);
        }
      });
    }
    if (cols.length >= maxCols) break;
  }
  return cols.slice(0, maxCols);
};

const AutoTable = ({ items }) => {
  if (!items || items.length === 0) return null;
  // Array of primitives (strings/numbers) — single column.
  const allPrimitive = items.every((it) => typeof it !== "object" || it === null);
  if (allPrimitive) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {items.map((v, i) => (
              <TableRow key={i} hover>
                <TableCell>{displayValue(v)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  const cols = inferColumns(items);
  if (cols.length === 0) {
    // Objects with no simple keys at all — show as compact JSON per row.
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {items.map((v, i) => (
              <TableRow key={i} hover>
                <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>
                  {displayValue(v)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {cols.map((c) => (
              <TableCell key={c}>
                <strong>{formatKey(c)}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i} hover>
              {cols.map((c) => (
                <TableCell key={c} style={{ fontSize: 12 }}>
                  {displayValue(item?.[c])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// A single "section" inside the generic multi-section fallback: either a
// list of array items rendered via AutoTable, or a nested plain object
// rendered as a SummaryCard. Nothing gets silently dropped anymore.
const AutoSection = ({ title, items, data }) => (
  <Box mb={2}>
    <Typography
      variant="subtitle2"
      gutterBottom
      style={{ fontWeight: 700, color: "#334155" }}
    >
      {formatKey(title)}
      {items ? ` (${items.length})` : ""}
    </Typography>
    {items ? (
      items.length > 0 ? (
        <AutoTable items={items} />
      ) : (
        <Typography variant="body2" style={{ color: "#888" }}>
          No entries.
        </Typography>
      )
    ) : (
      <SummaryCard data={data} />
    )}
  </Box>
);

// ─── String classification helpers ───────────────────────────────────────────
// Distinguish a genuine compliance FORMULA ("compliantUsers / totalUsers * 100")
// from an ERROR / STATUS string ("Macie is not enabled. (Service: Macie2, ...)"
// or an IAM "not authorized" message). Without this, error strings were being
// torn apart by the formula tokenizer and shown under a misleading "Compliance
// Formula" header.
const ERROR_STRING_PATTERN =
  /(not enabled|not authorized|access denied|status code\s*:|request id\s*:|exception|graph api error|no .* data from|failed to|unable to)/i;

const looksLikeErrorString = (s) => ERROR_STRING_PATTERN.test(s);

const looksLikeFormula = (s) => {
  const trimmed = s.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return false;
  if (looksLikeErrorString(trimmed)) return false;
  // Formulas are short expressions built from operators between compact tokens
  // (identifiers / numbers), e.g. "resolved / total * 100". Prose sentences
  // (long, many words, ending in punctuation) should not qualify.
  const hasOperator = /[+\-*/=]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;
  return hasOperator && wordCount <= 12;
};

// ─── Error-object detection ───────────────────────────────────────────────────
// Evidence collection failures come back as {message}, {error},
// {collectionTime, error}, or AWS SDK-style {exceptionType, awsErrorCode,
// awsErrorMessage}. These were previously rendered as an innocuous key/value
// "metrics" table, indistinguishable from real compliance data.
const ERROR_KEYS = [
  "message",
  "error",
  "exceptionType",
  "awsErrorCode",
  "awsErrorMessage",
  "errorCode",
  "errorMessage",
];
const META_KEYS = ["collectionTime", "_class", "timestamp"];

const isErrorLikeObject = (evidence) => {
  if (typeof evidence !== "object" || Array.isArray(evidence) || evidence === null)
    return false;
  const keys = Object.keys(evidence).filter((k) => !META_KEYS.includes(k));
  if (keys.length === 0) return false;
  const hasErrorKey = keys.some((k) => ERROR_KEYS.includes(k));
  const allKeysAreErrorOrMeta = keys.every((k) => ERROR_KEYS.includes(k));
  return hasErrorKey && allKeysAreErrorOrMeta;
};

// ─── normalise ────────────────────────────────────────────────────────────────
const normalise = (evidence) => {
  // ── truly empty ───────────────────────────────────────────────────────────
  if (evidence === null || evidence === undefined || evidence === "")
    return { type: "empty", items: [] };

  // ── numeric evidence (fixes falsy-0 bug: 0 is a legitimate result) ───────
  if (typeof evidence === "number") {
    return { type: "scalar_number", value: evidence, items: [] };
  }
  if (typeof evidence === "boolean") {
    return { type: "scalar_bool", value: evidence, items: [] };
  }

  // ── string evidence ───────────────────────────────────────────────────────
  if (typeof evidence === "string") {
    try {
      const parsed = JSON.parse(evidence);
      // Successfully parsed (including double-encoded strings) — recurse.
      return normalise(parsed);
    } catch {
      if (looksLikeErrorString(evidence)) {
        return { type: "evidence_error", message: evidence, items: [] };
      }
      if (looksLikeFormula(evidence)) {
        return { type: "formula", text: evidence, items: [] };
      }
      // Plain informational text — neither a formula nor a recognizable error.
      return { type: "message", text: evidence, items: [] };
    }
  }

  // ── empty array ──────────────────────────────────────────────────────────
  if (Array.isArray(evidence) && evidence.length === 0)
    return { type: "empty", items: [] };

  // ── error-shaped object (collection failure, not real evidence) ─────────
  if (isErrorLikeObject(evidence)) {
    const msg =
      evidence.message ||
      evidence.error ||
      evidence.awsErrorMessage ||
      evidence.errorMessage ||
      "Evidence collection failed.";
    return {
      type: "evidence_error",
      message: msg,
      detail: {
        exceptionType: evidence.exceptionType,
        awsErrorCode: evidence.awsErrorCode || evidence.errorCode,
        collectionTime: evidence.collectionTime,
      },
      items: [],
    };
  }

  // ── GCP users  (array with email) ────────────────────────────────────────
  if (Array.isArray(evidence) && evidence[0]?.email) {
    return {
      type: "gcp_users",
      items: evidence.map((u) => ({
        email: u.email,
        status: u.mfaEnabled ? "Enabled" : "Disabled",
        compliant: u.mfaEnabled,
      })),
    };
  }

  // ── IAM users list (array with userName) ─────────────────────────────────
  if (Array.isArray(evidence) && evidence[0]?.userName) {
    return {
      type: "iam_users_list",
      items: evidence.map((u) => ({
        userName: u.userName,
        arn: u.arn,
        created: u.createDate || "N/A",
        lastUsed: u.passwordLastUsed || "Never",
      })),
    };
  }

  // ── Azure / Entra users (mail / userPrincipalName / displayName) ────────
  if (
    Array.isArray(evidence) &&
    evidence[0] &&
    (evidence[0].mail || evidence[0].userPrincipalName || evidence[0].displayName)
  ) {
    return {
      type: "azure_users",
      items: evidence.map((u) => ({
        name: u.displayName || u.userPrincipalName || u.mail || "N/A",
        email: u.mail || u.userPrincipalName || "N/A",
        mfaStatus:
          u.isMfaRegistered !== undefined
            ? u.isMfaRegistered
            : u.mfaEnabled !== undefined
              ? u.mfaEnabled
              : undefined,
      })),
    };
  }

  // ── Role / IAM assignments (principalId / roleDefinitionId) ──────────────
  if (
    Array.isArray(evidence) &&
    evidence[0] &&
    (evidence[0].principalId || evidence[0].roleDefinitionId)
  ) {
    return {
      type: "role_assignments",
      items: evidence.map((r) => ({
        principalId: r.principalId || "N/A",
        roleDefinitionId: r.roleDefinitionId || "N/A",
        principalType: r.principalType || "N/A",
        scope: r.scope || "N/A",
      })),
    };
  }

  // ── Generic array of objects with no recognized shape ────────────────────
  // (was previously dumped as raw JSON; now renders as a real table)
  if (Array.isArray(evidence)) {
    return { type: "generic_array", items: evidence };
  }

  // ── AWS IAM snapshot ──────────────────────────────────────────────────────
  if (evidence.userAccessSnapshot?.length > 0) {
    return {
      type: "aws_iam_users",
      items: evidence.userAccessSnapshot.map((u) => ({
        user: u.user || "N/A",
        mfaActive: u.mfa_active === "true",
        passwordEnabled: u.password_enabled === "true",
        lastUsed: u.password_last_used || "Never",
        created: u.user_creation_time || "N/A",
      })),
    };
  }

  // ── MFA Usage ─────────────────────────────────────────────────────────────
  if (evidence.usersWithMfa !== undefined || evidence.usersWithoutMfa !== undefined) {
    const withMfa = evidence.usersWithMfa || [];
    const withoutMfa = evidence.usersWithoutMfa || [];
    return {
      type: "mfa_usage",
      summary: {
        totalUsers: evidence.totalUsers ?? withMfa.length + withoutMfa.length,
        withMfa: evidence.usersWithMfaCount ?? withMfa.length,
        withoutMfa: evidence.usersWithoutMfaCount ?? withoutMfa.length,
      },
      items: [
        ...withMfa.map((u) => ({ user: u, hasMfa: true })),
        ...withoutMfa.map((u) => ({ user: u, hasMfa: false })),
      ],
      mfaSerials: evidence.mfaSerials || [],
    };
  }

  // ── Combined S3 + KMS encryption coverage ────────────────────────────────
  // Must be checked BEFORE the narrower aws_kms_keys branch below, otherwise
  // the S3 half of this evidence (encryptedS3Buckets / s3EncryptionPct /
  // totalS3Buckets) is silently discarded.
  if (
    evidence.kmsKeys !== undefined &&
    (evidence.encryptedS3Buckets !== undefined ||
      evidence.s3EncryptionPct !== undefined ||
      evidence.totalS3Buckets !== undefined)
  ) {
    return {
      type: "encryption_coverage",
      summary: {
        totalKmsKeys: evidence.totalKmsKeys ?? (evidence.kmsKeys || []).length,
        enabledKmsKeys: evidence.enabledKmsKeys,
        totalS3Buckets: evidence.totalS3Buckets,
        s3EncryptionPct:
          evidence.s3EncryptionPct !== undefined
            ? `${formatNumber(evidence.s3EncryptionPct)}%`
            : undefined,
      },
      kmsItems: (evidence.kmsKeys || []).map((k) => ({
        keyId: k.keyId,
        keySpec: k.keySpec,
        keyState: k.keyState,
        compliant: k.isCompliant,
      })),
      s3Items: (evidence.encryptedS3Buckets || []).map((b) =>
        typeof b === "string" ? { bucket: b } : b,
      ),
      items: [],
    };
  }

  // ── Combined ACM + KMS ────────────────────────────────────────────────────
  if (evidence.kmsKeys !== undefined && evidence.acmCertificates !== undefined) {
    return {
      type: "kms_acm_combined",
      kmsItems: (evidence.kmsKeys || []).map((k) => ({
        keyId: k.keyId,
        keySpec: k.keySpec,
        keyState: k.keyState,
        compliant: k.isCompliant,
      })),
      acmItems: evidence.acmCertificates || [],
      items: [],
    };
  }

  // ── KMS keys (narrow / pure shape only — no other array/object siblings) ──
  if (evidence.kmsKeys?.length > 0) {
    const siblingKeys = Object.keys(evidence).filter(
      (k) => !["kmsKeys", "totalKmsKeys", "enabledKmsKeys", "_class"].includes(k),
    );
    const hasOtherArrayOrObject = siblingKeys.some(
      (k) =>
        Array.isArray(evidence[k]) ||
        (typeof evidence[k] === "object" && evidence[k] !== null),
    );
    if (!hasOtherArrayOrObject) {
      return {
        type: "aws_kms_keys",
        items: evidence.kmsKeys.map((k) => ({
          keyId: k.keyId,
          keySpec: k.keySpec,
          keyState: k.keyState,
          compliant: k.isCompliant,
        })),
      };
    }
    // Otherwise fall through — an unrecognized combined shape will be
    // picked up by the generic multi-section fallback further down so
    // nothing is silently dropped.
  }

  // ── Config changes ────────────────────────────────────────────────────────
  if (evidence.changeWindowAnalysis) {
    const {
      withinWindow = [],
      outsideWindow = [],
      changesWithinWindow,
      changesOutsideWindow,
      withinWindowPercentage,
    } = evidence.changeWindowAnalysis;
    return {
      type: "aws_config_changes",
      summary: {
        withinWindow: changesWithinWindow ?? withinWindow.length,
        outsideWindow: changesOutsideWindow ?? outsideWindow.length,
        withinPercent: withinWindowPercentage ?? 0,
      },
      items: [
        ...withinWindow.slice(0, 50).map((e) => ({ ...e, inWindow: true })),
        ...outsideWindow.slice(0, 50).map((e) => ({ ...e, inWindow: false })),
      ],
    };
  }

  // ── Instance metrics (also covers "instanceBreakdown" shaped uptime combos) ─
  if (evidence.instanceMetrics?.length > 0 || evidence.instanceBreakdown?.length > 0) {
    const list = evidence.instanceMetrics || evidence.instanceBreakdown;
    return {
      type: "instance_metrics",
      summary: {
        uptimePercentage: `${formatNumber(evidence.uptimePercentage)}%`,
        totalDatapoints: evidence.totalDatapoints,
        downtimeDatapoints: evidence.downtimeDatapoints,
        startTime: evidence.startTime,
        endTime: evidence.endTime,
        cloudsContributing: evidence.cloudsContributing,
        belowTarget: evidence.belowTarget,
      },
      items: list.map((m) => ({
        instanceId: m.instanceId || m.id || "N/A",
        uptime: m.uptimePercentage ?? m.uptime,
        totalDatapoints: m.totalDatapoints,
        downtimeDatapoints: m.downtimeDatapoints,
        status: m.status,
      })),
    };
  }

  // ── Env access / SCP ──────────────────────────────────────────────────────
  if (evidence.organizationAndSCP !== undefined) {
    const scp = evidence.organizationAndSCP || {};
    const events = evidence.crossEnvironmentEvents || [];
    return {
      type: "env_access",
      scpInfo: {
        organizationExists: scp.organizationExists,
        scpEnforced: scp.scpEnforced,
        isValid: scp.isValid,
      },
      items: events.map((e) => ({
        event: e.eventName || "N/A",
        user: e.username || "N/A",
        time: e.eventTime || "N/A",
        source: e.eventSource || "N/A",
      })),
    };
  }

  // ── SoD matrix ────────────────────────────────────────────────────────────
  if (
    typeof evidence === "object" &&
    !Array.isArray(evidence) &&
    Object.values(evidence).some((v) => Array.isArray(v))
  ) {
    const entries = Object.entries(evidence).filter(([k]) => k !== "_class");
    if (entries.every(([, v]) => Array.isArray(v))) {
      return {
        type: "sod_matrix",
        items: entries.map(([role, policies]) => ({ role, policies })),
      };
    }
  }

  // ── Vulnerability / SecurityHub findings (covers both shapes) ────────────
  if (
    evidence.vulnerabilityFindings !== undefined ||
    evidence.slaStatus !== undefined ||
    evidence.findings !== undefined ||
    evidence.findingCount !== undefined
  ) {
    const findings = evidence.vulnerabilityFindings || evidence.findings || [];
    const sla = evidence.slaStatus || {};
    return {
      type: "vulnerability_findings",
      summary: {
        total: evidence.findingCount ?? findings.length,
        withinSLAPercentage: sla.withinSLAPercentage,
        breachedSLAPercentage: sla.breachedSLAPercentage,
        breachedCount: (sla.breachedSLA || []).length,
        withinCount: (sla.withinSLA || []).length,
        notApplicableCount: (sla.notApplicable || []).length,
      },
      items: findings.map((f) => ({
        title: f.title || f.Title || f.name || "N/A",
        severity: f.severity || f.Severity?.Label || f.Severity || "N/A",
        status: f.status || f.RecordState || f.Compliance?.Status || "N/A",
        type: f.type,
        cveId: f.cveId || "N/A",
        cvssScore: f.cvssScore || "N/A",
        firstObservedAt: f.firstObservedAt,
        lastObservedAt: f.lastObservedAt,
        description: f.description || f.Description,
        remediation: f.remediation,
      })),
    };
  }

  // ── CloudWatch log analysis ───────────────────────────────────────────────
  if (evidence.logAnalysis !== undefined || evidence.logCategories !== undefined) {
    const la = evidence.logAnalysis || {};
    const lc = evidence.logCategories || {};
    const withoutRetention = lc.withoutRetention || [];
    const withRetention = lc.withRetention || [];
    const recentlyCreated = lc.recentlyCreated || [];
    const allGroups = [
      ...withRetention.map((g) => ({ ...g, retentionStatus: "configured" })),
      ...withoutRetention.map((g) => ({ ...g, retentionStatus: "missing" })),
      ...recentlyCreated.map((g) => ({ ...g, retentionStatus: "new" })),
    ];
    return {
      type: "log_analysis",
      summary: {
        totalLogGroups: la.totalLogGroups ?? allGroups.length,
        enabledLogGroups: la.enabledLogGroups ?? 0,
        disabledLogGroups: la.disabledLogGroups ?? 0,
        withRetentionCount: lc.withRetentionCount ?? withRetention.length,
        withoutRetentionCount: lc.withoutRetentionCount ?? withoutRetention.length,
        recentlyCreatedCount: lc.recentlyCreatedCount ?? recentlyCreated.length,
        averageRetentionDays: la.averageRetentionDays ?? 0,
      },
      items: allGroups,
    };
  }

  // ── Capacity management ───────────────────────────────────────────────────
  if (evidence.activeCapacityIncidents !== undefined || evidence.capacityAlarms !== undefined) {
    const incidents = evidence.activeCapacityIncidents || [];
    const alarms = evidence.capacityAlarms || [];
    return {
      type: "capacity",
      summary: { activeIncidents: incidents.length, alarms: alarms.length },
      items: [
        ...incidents.map((i) => ({ source: "Incident", ...i })),
        ...alarms.map((a) => ({ source: "Alarm", ...a })),
      ],
    };
  }

  // ── Privileged roles / users ───────────────────────────────────────────────
  if (evidence.privilegedRoles !== undefined || evidence.privilegedUsers !== undefined) {
    const roles = evidence.privilegedRoles || [];
    const users = evidence.privilegedUsers || [];
    return {
      type: "privileged_access",
      summary: {
        totalPrivilegedRoles: roles.length,
        totalPrivilegedUsers: users.length,
      },
      roleItems: roles,
      userItems: users,
      items: [],
    };
  }

  // ── S3 Object Lock coverage ────────────────────────────────────────────────
  if (
    evidence.buckets !== undefined &&
    (evidence.coveragePct !== undefined ||
      evidence.lockEnabledCount !== undefined ||
      evidence.totalBuckets !== undefined)
  ) {
    const buckets = evidence.buckets || [];
    return {
      type: "s3_object_lock",
      summary: {
        coveragePct:
          evidence.coveragePct !== undefined
            ? `${formatNumber(evidence.coveragePct)}%`
            : undefined,
        totalBuckets: evidence.totalBuckets ?? buckets.length,
        lockEnabledCount: evidence.lockEnabledCount,
      },
      items: buckets.map((b) =>
        typeof b === "string"
          ? { bucket: b }
          : {
              bucket: b.bucketName || b.name || "N/A",
              lockEnabled: b.lockEnabled,
              mode: b.mode || b.retentionMode,
            },
      ),
    };
  }

  // ── Backup plans ───────────────────────────────────────────────────────────
  if (evidence.backupPlans !== undefined) {
    const plans = evidence.backupPlans || [];
    return {
      type: "backup_plans",
      summary: {
        totalPlans: evidence.backupPlansCount ?? plans.length,
        completedJobs: evidence.completedJobs,
        failedJobs: evidence.failedJobs,
        successRate:
          evidence.successRatePct !== undefined
            ? `${formatNumber(evidence.successRatePct)}%`
            : undefined,
      },
      items: plans.map((p) =>
        typeof p === "string"
          ? { plan: p }
          : { plan: p.backupPlanName || p.name || "N/A", status: p.status },
      ),
    };
  }

  // ── CloudTrail ─────────────────────────────────────────────────────────────
  if (evidence.trails !== undefined || evidence.activeTrails !== undefined) {
    const trails = evidence.trails || evidence.activeTrails || [];
    return {
      type: "cloudtrail",
      summary: {
        totalTrails: evidence.totalTrails ?? trails.length,
        multiRegionTrails: evidence.multiRegionTrails,
      },
      items: trails.map((t) =>
        typeof t === "string"
          ? { trail: t }
          : {
              trail: t.name || t.trailName || "N/A",
              multiRegion: t.isMultiRegionTrail ?? t.multiRegion,
              logging: t.isLogging,
            },
      ),
    };
  }

  // ── AWS Config rules ───────────────────────────────────────────────────────
  if (
    evidence.rules !== undefined &&
    (evidence.compliancePct !== undefined || evidence.totalRules !== undefined)
  ) {
    const rules = evidence.rules || [];
    return {
      type: "config_rules",
      summary: {
        compliancePct:
          evidence.compliancePct !== undefined
            ? `${formatNumber(evidence.compliancePct)}%`
            : undefined,
        compliant: (evidence.compliantRules || []).length,
        nonCompliant: (evidence.nonCompliantRules || []).length,
        totalRules: evidence.totalRules ?? rules.length,
      },
      items: rules.map((r) =>
        typeof r === "string"
          ? { rule: r }
          : {
              rule: r.configRuleName || r.name || "N/A",
              compliance: r.complianceType || r.compliance,
            },
      ),
    };
  }

  // ── ECR scan coverage ──────────────────────────────────────────────────────
  if (evidence.repositories !== undefined) {
    const repos = evidence.repositories || [];
    return {
      type: "ecr_repos",
      summary: {
        totalRepositories: evidence.totalEcrRepositories ?? repos.length,
        activelyScanned: evidence.activelyScanned,
      },
      items: repos.map((r) =>
        typeof r === "string"
          ? { repository: r }
          : {
              repository: r.repositoryName || r.name || "N/A",
              scanOnPush: r.scanOnPush,
            },
      ),
    };
  }

  // ── AI data asset tagging ──────────────────────────────────────────────────
  if (evidence.aiTaggedBuckets !== undefined || evidence.totalAiDataAssets !== undefined) {
    const documented = evidence.aiTaggedBuckets || evidence.documentedAiDataAssets || [];
    const undocumented = evidence.undocumentedAiAssets || [];
    const asAsset = (a, isDocumented) =>
      typeof a === "string"
        ? { asset: a, documented: isDocumented }
        : { asset: a.name || a.bucketName || "N/A", documented: isDocumented };
    return {
      type: "ai_data_assets",
      summary: {
        totalAiDataAssets:
          evidence.totalAiDataAssets ?? documented.length + undocumented.length,
        documented: documented.length,
        undocumented: undocumented.length,
      },
      items: [
        ...documented.map((a) => asAsset(a, true)),
        ...undocumented.map((a) => asAsset(a, false)),
      ],
    };
  }

  // ── VPC flow logs (nested objects, not arrays — must not be dropped) ────
  if (evidence.flowLogCategories !== undefined || evidence.securityAnalysis !== undefined) {
    return {
      type: "nested_sections",
      sections: [
        evidence.flowLogCategories && {
          title: "flowLogCategories",
          data: evidence.flowLogCategories,
        },
        evidence.securityAnalysis && {
          title: "securityAnalysis",
          data: evidence.securityAnalysis,
        },
      ].filter(Boolean),
      items: [],
    };
  }

  // ── Generic user list (getUserFailed / getUserSuccess / users) ───────────
  if (
    evidence.users !== undefined &&
    (evidence.getUserFailed !== undefined ||
      evidence.getUserSuccess !== undefined ||
      evidence.totalUsers !== undefined)
  ) {
    const users = evidence.users || [];
    return {
      type: "user_list_generic",
      summary: {
        totalUsers: evidence.totalUsers ?? users.length,
        getUserSuccess: evidence.getUserSuccess,
        getUserFailed: evidence.getUserFailed,
      },
      items: users,
    };
  }

  // ── Generic multi-section fallback ────────────────────────────────────────
  // Anything that reaches this point is an object shape we don't have a
  // bespoke renderer for. Instead of filtering out array/object values (old
  // behaviour) or dumping raw JSON, split it into scalar summary + one
  // auto-rendered table per array field + one nested card per object field,
  // so nothing is silently lost.
  if (typeof evidence === "object" && !Array.isArray(evidence)) {
    const keys = Object.keys(evidence).filter((k) => k !== "_class");
    const scalarEntries = {};
    const arraySections = [];
    const objectSections = [];
    keys.forEach((k) => {
      const v = evidence[k];
      if (v === null || v === undefined || typeof v === "function") return;
      if (Array.isArray(v)) {
        arraySections.push({ title: k, items: v });
      } else if (typeof v === "object") {
        objectSections.push({ title: k, data: v });
      } else {
        scalarEntries[k] = v;
      }
    });
    if (
      Object.keys(scalarEntries).length > 0 ||
      arraySections.length > 0 ||
      objectSections.length > 0
    ) {
      return {
        type: "multi_section",
        scalarEntries,
        arraySections,
        objectSections,
        items: [],
      };
    }
  }

  // ── Raw JSON fallback (only reached for truly unclassifiable shapes) ────
  return {
    type: "raw_json",
    items: [{ data: JSON.stringify(evidence, null, 2) }],
  };
};

// ─── Formula renderer ─────────────────────────────────────────────────────────
const FormulaDisplay = ({ text }) => {
  const parts = text.split(/(\s*[\/\*\+\-\=\(\)]\s*)/g);

  const operatorStyle = {
    color: "#7c3aed",
    fontWeight: 700,
    fontSize: 18,
    padding: "0 2px",
  };
  const operandStyle = {
    color: "#0f172a",
    fontWeight: 600,
    fontSize: 15,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    padding: "2px 8px",
    border: "1px solid #e2e8f0",
  };
  const isOperator = (s) => /^[\s]*[\/\*\+\-\=\(\)][\s]*$/.test(s);

  return (
    <Box>
      <Box display="flex" alignItems="center" style={{ gap: 10, marginBottom: 20 }}>
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#ede9fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FunctionsIcon style={{ color: "#7c3aed", fontSize: 22 }} />
        </Box>
        <Typography style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          Compliance Formula
        </Typography>
      </Box>

      <Box
        style={{
          backgroundColor: "#fafafa",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 6 }}>
          {parts.map((part, i) =>
            part.trim() === "" ? null : isOperator(part) ? (
              <span key={i} style={operatorStyle}>{part.trim()}</span>
            ) : (
              <span key={i} style={operandStyle}>{part.trim()}</span>
            )
          )}
        </Box>
      </Box>

      <Box
        style={{
          backgroundColor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: 8,
          padding: "12px 16px",
        }}
      >
        <Typography
          style={{
            fontSize: 12,
            color: "#64748b",
            fontFamily: "Consolas, Monaco, monospace",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Error / collection-failure renderer ─────────────────────────────────────
const EvidenceErrorDisplay = ({ message, detail }) => (
  <Box>
    <Box display="flex" alignItems="center" style={{ gap: 10, marginBottom: 16 }}>
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#fdecea",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ErrorOutlineIcon style={{ color: "#d32f2f", fontSize: 22 }} />
      </Box>
      <Box>
        <Typography style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          Evidence Collection Failed
        </Typography>
        <Typography style={{ fontSize: 12, color: "#94a3b8" }}>
          This control has no compliance evidence because collection errored out.
        </Typography>
      </Box>
    </Box>
    <Box
      style={{
        backgroundColor: "#fdecea",
        border: "1px solid #f5c6cb",
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: detail && (detail.exceptionType || detail.awsErrorCode) ? 12 : 0,
      }}
    >
      <Typography
        style={{
          fontSize: 13,
          color: "#721c24",
          fontFamily: "Consolas, Monaco, monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message}
      </Typography>
    </Box>
    {detail && (detail.exceptionType || detail.awsErrorCode || detail.collectionTime) && (
      <SummaryCard
        data={{
          exceptionType: detail.exceptionType,
          awsErrorCode: detail.awsErrorCode,
          collectionTime: detail.collectionTime,
        }}
      />
    )}
  </Box>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Evidence_Modal = ({ open, onClose, evidence }) => {
  const [page, setPage] = useState(0);

  const norm = useMemo(() => {
    setPage(0);
    const n = normalise(evidence);
    if (open && n.type !== "empty") {
      logSelect(`Compliance · View Evidence: ${n.type}`, { type: n.type }, window.pathname);
    }
    return n;
  }, [evidence, open]);

  const totalPages = Math.ceil((norm.items?.length || 0) / PAGE_SIZE);
  const paged = (norm.items || []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleClose = (_, reason) => {
    if (reason !== "backdropClick") onClose();
  };

  const countLabel =
    {
      gcp_users: "users",
      iam_users_list: "users",
      azure_users: "users",
      role_assignments: "assignments",
      aws_iam_users: "IAM users",
      aws_kms_keys: "keys",
      aws_config_changes: "events",
      instance_metrics: "instances",
      mfa_usage: "users",
      env_access: "events",
      sod_matrix: "roles",
      capacity: "items",
      aws_metrics: "metrics",
      vulnerability_findings: "findings",
      log_analysis: "log groups",
      generic_array: "items",
      s3_object_lock: "buckets",
      backup_plans: "plans",
      cloudtrail: "trails",
      config_rules: "rules",
      ecr_repos: "repositories",
      ai_data_assets: "assets",
      user_list_generic: "users",
    }[norm.type] || "items";

  // ── dialog title ─────────────────────────────────────────────────────────
  const dialogTitle =
    norm.type === "formula"
      ? "Control Formula"
      : norm.type === "evidence_error"
        ? "Evidence Collection Error"
        : norm.type === "message"
          ? "Evidence"
          : `Evidence Details${(norm.items?.length || 0) > 0 ? ` (${norm.items.length} ${countLabel})` : ""}`;

  const NO_ITEMS_OK_TYPES = new Set([
    "env_access",
    "capacity",
    "mfa_usage",
    "vulnerability_findings",
    "log_analysis",
    "formula",
    "evidence_error",
    "message",
    "scalar_number",
    "scalar_bool",
    "encryption_coverage",
    "kms_acm_combined",
    "privileged_access",
    "nested_sections",
    "multi_section",
    "s3_object_lock",
    "backup_plans",
    "cloudtrail",
    "config_rules",
    "ecr_repos",
    "ai_data_assets",
    "user_list_generic",
  ]);

  const renderContent = () => {
    if ((norm.items?.length || 0) === 0 && !NO_ITEMS_OK_TYPES.has(norm.type)) {
      return (
        <Box p={4} textAlign="center" style={{ color: "#666" }}>
          <Typography variant="h6">No Evidence Data</Typography>
          <Typography variant="body2">No details available for this control.</Typography>
        </Box>
      );
    }

    // ── Formula ────────────────────────────────────────────────────────────
    if (norm.type === "formula") {
      return <FormulaDisplay text={norm.text} />;
    }

    // ── Evidence collection error ─────────────────────────────────────────
    if (norm.type === "evidence_error") {
      return <EvidenceErrorDisplay message={norm.message} detail={norm.detail} />;
    }

    // ── Plain informational message (not error, not formula) ──────────────
    if (norm.type === "message") {
      return (
        <Box
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "16px 20px",
          }}
        >
          <Typography style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" }}>
            {norm.text}
          </Typography>
        </Box>
      );
    }

    // ── Bare scalar number / boolean (e.g. legitimate "0" result) ──────────
    if (norm.type === "scalar_number" || norm.type === "scalar_bool") {
      return (
        <Box p={3} textAlign="center">
          <Typography style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
            Evidence Value
          </Typography>
          <Chip
            label={norm.type === "scalar_bool" ? (norm.value ? "Yes" : "No") : String(norm.value)}
            style={{
              fontSize: 20,
              fontWeight: 700,
              padding: "18px 14px",
              backgroundColor: "#e3f2fd",
              color: "#1565c0",
            }}
          />
        </Box>
      );
    }

    // ── GCP Users ──────────────────────────────────────────────────────────
    if (norm.type === "gcp_users") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((u, i) => (
                <TableRow key={i} hover>
                  <TableCell>{u.email}</TableCell>
                  <TableCell align="center"><BoolBadge value={u.compliant} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── IAM Users List ─────────────────────────────────────────────────────
    if (norm.type === "iam_users_list") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>ARN</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Last Login</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((u, i) => (
                <TableRow key={i} hover>
                  <TableCell>{u.userName}</TableCell>
                  <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{u.arn}</TableCell>
                  <TableCell style={{ fontSize: 11 }}>{u.created}</TableCell>
                  <TableCell style={{ fontSize: 11 }}>{u.lastUsed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Azure / Entra Users ────────────────────────────────────────────────
    if (norm.type === "azure_users") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email / UPN</strong></TableCell>
                <TableCell align="center"><strong>MFA</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((u, i) => (
                <TableRow key={i} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell style={{ fontSize: 12 }}>{u.email}</TableCell>
                  <TableCell align="center">
                    {u.mfaStatus === undefined ? (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>N/A</span>
                    ) : (
                      <BoolBadge value={!!u.mfaStatus} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Role assignments ───────────────────────────────────────────────────
    if (norm.type === "role_assignments") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Principal ID</strong></TableCell>
                <TableCell><strong>Role Definition ID</strong></TableCell>
                <TableCell><strong>Principal Type</strong></TableCell>
                <TableCell><strong>Scope</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{r.principalId}</TableCell>
                  <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{r.roleDefinitionId}</TableCell>
                  <TableCell style={{ fontSize: 11 }}>{r.principalType}</TableCell>
                  <TableCell style={{ fontSize: 11 }}>{r.scope}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Generic array of objects with no recognized shape ─────────────────
    if (norm.type === "generic_array") {
      return <AutoTable items={paged} />;
    }

    // ── AWS IAM Users snapshot ─────────────────────────────────────────────
    if (norm.type === "aws_iam_users") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>User</strong></TableCell>
                <TableCell align="center"><strong>MFA</strong></TableCell>
                <TableCell align="center"><strong>Password</strong></TableCell>
                <TableCell><strong>Last Used</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((u, i) => (
                <TableRow key={i} hover>
                  <TableCell>{u.user}</TableCell>
                  <TableCell align="center">
                    {u.mfaActive ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <CancelIcon style={{ color: "#f44336" }} />}
                  </TableCell>
                  <TableCell align="center">
                    {u.passwordEnabled ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <CancelIcon style={{ color: "#9e9e9e" }} />}
                  </TableCell>
                  <TableCell style={{ fontSize: 11 }}>{u.lastUsed}</TableCell>
                  <TableCell style={{ fontSize: 11 }}>{u.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── MFA Usage ──────────────────────────────────────────────────────────
    if (norm.type === "mfa_usage") {
      const { summary, items, mfaSerials } = norm;
      return (
        <>
          <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <Typography variant="subtitle2" gutterBottom><strong>MFA Summary</strong></Typography>
            <Box display="flex" style={{ gap: 8 }} mt={1} flexWrap="wrap">
              <Chip label={`Total Users: ${summary.totalUsers}`} size="small" variant="outlined" />
              <Chip icon={<CheckCircleIcon />} label={`With MFA: ${summary.withMfa}`} size="small" style={{ backgroundColor: "#d4edda", color: "#155724" }} />
              <Chip icon={<CancelIcon />} label={`Without MFA: ${summary.withoutMfa}`} size="small"
                style={{ backgroundColor: summary.withoutMfa > 0 ? "#f8d7da" : undefined, color: summary.withoutMfa > 0 ? "#721c24" : undefined }} />
            </Box>
          </Box>
          {items.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell align="center"><strong>MFA Active</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((u, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{u.user}</TableCell>
                      <TableCell align="center">
                        {u.hasMfa ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <CancelIcon style={{ color: "#f44336" }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box p={2} textAlign="center" style={{ color: "#888" }}>
              <Typography variant="body2">No user detail data available.</Typography>
            </Box>
          )}
        </>
      );
    }

    // ── KMS Keys ───────────────────────────────────────────────────────────
    if (norm.type === "aws_kms_keys") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Key ID</strong></TableCell>
                <TableCell><strong>Spec</strong></TableCell>
                <TableCell><strong>State</strong></TableCell>
                <TableCell align="center"><strong>Compliant</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((k, i) => (
                <TableRow key={i} hover>
                  <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{k.keyId}</TableCell>
                  <TableCell>{k.keySpec}</TableCell>
                  <TableCell>
                    <Chip label={k.keyState} size="small" color={k.keyState === "Enabled" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell align="center">
                    {k.compliant ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <CancelIcon style={{ color: "#f44336" }} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Combined S3 + KMS encryption coverage ──────────────────────────────
    if (norm.type === "encryption_coverage") {
      return (
        <>
          <SummaryCard title="Encryption Coverage" data={norm.summary} />
          <AutoSection title="KMS Keys" items={norm.kmsItems} />
          <AutoSection title="Encrypted S3 Buckets" items={norm.s3Items} />
        </>
      );
    }

    // ── Combined ACM + KMS ──────────────────────────────────────────────────
    if (norm.type === "kms_acm_combined") {
      return (
        <>
          <AutoSection title="KMS Keys" items={norm.kmsItems} />
          <AutoSection title="ACM Certificates" items={norm.acmItems} />
        </>
      );
    }

    // ── Privileged access ───────────────────────────────────────────────────
    if (norm.type === "privileged_access") {
      return (
        <>
          <SummaryCard title="Privileged Access Summary" data={norm.summary} />
          <AutoSection title="Privileged Roles" items={norm.roleItems} />
          <AutoSection title="Privileged Users" items={norm.userItems} />
        </>
      );
    }

    // ── Nested (non-array) sections, e.g. VPC flow logs ────────────────────
    if (norm.type === "nested_sections") {
      return (
        <>
          {norm.sections.map((s, i) => (
            <AutoSection key={i} title={s.title} data={s.data} />
          ))}
        </>
      );
    }

    // ── Generic user list ──────────────────────────────────────────────────
    if (norm.type === "user_list_generic") {
      return (
        <>
          <SummaryCard title="User Summary" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── S3 Object Lock ──────────────────────────────────────────────────────
    if (norm.type === "s3_object_lock") {
      return (
        <>
          <SummaryCard title="S3 Object Lock Coverage" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── Backup plans ────────────────────────────────────────────────────────
    if (norm.type === "backup_plans") {
      return (
        <>
          <SummaryCard title="Backup Plans" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── CloudTrail ──────────────────────────────────────────────────────────
    if (norm.type === "cloudtrail") {
      return (
        <>
          <SummaryCard title="CloudTrail Coverage" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── Config rules ────────────────────────────────────────────────────────
    if (norm.type === "config_rules") {
      return (
        <>
          <SummaryCard title="Config Rule Compliance" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── ECR repositories ────────────────────────────────────────────────────
    if (norm.type === "ecr_repos") {
      return (
        <>
          <SummaryCard title="ECR Scan Coverage" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── AI data assets ──────────────────────────────────────────────────────
    if (norm.type === "ai_data_assets") {
      return (
        <>
          <SummaryCard title="AI Data Asset Tagging" data={norm.summary} />
          <AutoTable items={paged} />
        </>
      );
    }

    // ── Config Changes ─────────────────────────────────────────────────────
    if (norm.type === "aws_config_changes") {
      const { summary } = norm;
      return (
        <>
          <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <Typography variant="subtitle2" gutterBottom><strong>Change Window Analysis</strong></Typography>
            <Box display="flex" style={{ gap: 8 }} mt={1} flexWrap="wrap">
              <Chip label={`Within Window: ${summary.withinWindow}`} color="primary" size="small" />
              <Chip label={`Outside Window: ${summary.outsideWindow}`} size="small"
                style={{ backgroundColor: summary.outsideWindow > 0 ? "#ff9800" : undefined, color: summary.outsideWindow > 0 ? "white" : undefined }} />
              <Chip label={`${formatNumber(summary.withinPercent)}% Compliant`} size="small" variant="outlined" />
            </Box>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell align="center"><strong>In Window</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((e, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{e.eventName || "N/A"}</TableCell>
                    <TableCell>{e.username || "N/A"}</TableCell>
                    <TableCell style={{ fontSize: 11 }}>{e.eventTime || "N/A"}</TableCell>
                    <TableCell align="center">
                      {e.inWindow ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <CancelIcon style={{ color: "#ff9800" }} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    }

    // ── Instance Metrics ───────────────────────────────────────────────────
    if (norm.type === "instance_metrics") {
      const { summary } = norm;
      return (
        <>
          <SummaryCard data={summary} />
          <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Instance ID</strong></TableCell>
                  <TableCell align="center"><strong>Uptime %</strong></TableCell>
                  <TableCell align="center"><strong>Total Datapoints</strong></TableCell>
                  <TableCell align="center"><strong>Downtime Points</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((m, i) => (
                  <TableRow key={i} hover>
                    <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{m.instanceId}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${formatNumber(m.uptime)}%`} size="small"
                        style={{ backgroundColor: m.uptime === 100 ? "#d4edda" : "#fff3cd", color: m.uptime === 100 ? "#155724" : "#856404" }} />
                    </TableCell>
                    <TableCell align="center">{m.totalDatapoints}</TableCell>
                    <TableCell align="center">{m.downtimeDatapoints}</TableCell>
                    <TableCell align="center">
                      {m.status === "SUCCESS" ? <CheckCircleIcon style={{ color: "#4caf50" }} /> : <WarningIcon style={{ color: "#ff9800" }} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    }

    // ── Env Access / SCP ───────────────────────────────────────────────────
    if (norm.type === "env_access") {
      const { scpInfo, items } = norm;
      return (
        <>
          <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <Typography variant="subtitle2" gutterBottom><strong>Organization & SCP Status</strong></Typography>
            <Box display="flex" style={{ gap: 8 }} mt={1} flexWrap="wrap">
              <BoolBadge value={scpInfo.organizationExists} trueLabel="Org Exists" falseLabel="No Org" />
              <BoolBadge value={scpInfo.scpEnforced} trueLabel="SCP Enforced" falseLabel="SCP Not Enforced" />
              <BoolBadge value={scpInfo.isValid} trueLabel="Valid" falseLabel="Invalid" />
            </Box>
          </Box>
          {items.length === 0 ? (
            <Box p={2} textAlign="center" style={{ color: "#888" }}>
              <CheckCircleIcon style={{ color: "#4caf50", marginBottom: 4 }} />
              <Typography variant="body2">No cross-environment events detected.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Event</strong></TableCell>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Source</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((e, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{e.event}</TableCell>
                      <TableCell>{e.user}</TableCell>
                      <TableCell style={{ fontSize: 11 }}>{e.source}</TableCell>
                      <TableCell style={{ fontSize: 11 }}>{e.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    }

    // ── SoD Matrix ─────────────────────────────────────────────────────────
    if (norm.type === "sod_matrix") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Assigned Policies</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell style={{ fontFamily: "monospace", fontSize: 11, verticalAlign: "top", paddingTop: 10 }}>{row.role}</TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
                      {row.policies.map((p, j) => (
                        <Chip key={j} label={p} size="small" variant="outlined" style={{ fontSize: 10 }} />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Capacity Management ────────────────────────────────────────────────
    if (norm.type === "capacity") {
      const { summary, items } = norm;
      return (
        <>
          <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <Typography variant="subtitle2" gutterBottom><strong>Capacity Status</strong></Typography>
            <Box display="flex" style={{ gap: 8 }} mt={1}>
              <Chip
                icon={summary.activeIncidents === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                label={`Active Incidents: ${summary.activeIncidents}`}
                size="small"
                style={{ backgroundColor: summary.activeIncidents === 0 ? "#d4edda" : "#f8d7da", color: summary.activeIncidents === 0 ? "#155724" : "#721c24" }}
              />
              <Chip
                icon={summary.alarms === 0 ? <CheckCircleIcon /> : <WarningIcon />}
                label={`Alarms: ${summary.alarms}`}
                size="small"
                style={{ backgroundColor: summary.alarms === 0 ? "#d4edda" : "#fff3cd", color: summary.alarms === 0 ? "#155724" : "#856404" }}
              />
            </Box>
          </Box>
          {items.length === 0 && (
            <Box p={2} textAlign="center" style={{ color: "#888" }}>
              <CheckCircleIcon style={{ color: "#4caf50", marginBottom: 4 }} />
              <Typography variant="body2">No active capacity incidents or alarms.</Typography>
            </Box>
          )}
        </>
      );
    }

    // ── Vulnerability Findings ─────────────────────────────────────────────
    if (norm.type === "vulnerability_findings") {
      const { summary } = norm;
      const severityColor = (sev) => {
        switch (sev) {
          case "CRITICAL": return { backgroundColor: "#7b1fa2", color: "white" };
          case "HIGH":     return { backgroundColor: "#d32f2f", color: "white" };
          case "MEDIUM":   return { backgroundColor: "#f57c00", color: "white" };
          case "LOW":      return { backgroundColor: "#388e3c", color: "white" };
          default:         return { backgroundColor: "#9e9e9e", color: "white" };
        }
      };
      const statusColor = (s) =>
        s === "ACTIVE"
          ? { backgroundColor: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" }
          : { backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" };

      return (
        <>
          {summary.total > 0 && (
            <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
              <Typography variant="subtitle2" gutterBottom><strong>SLA Summary</strong></Typography>
              <Box display="flex" style={{ gap: 8 }} mt={1} flexWrap="wrap">
                <Chip label={`Total Findings: ${summary.total}`} size="small" variant="outlined" />
                <Chip icon={<CheckCircleIcon />} label={`Within SLA: ${summary.withinCount} (${summary.withinSLAPercentage != null ? Number(summary.withinSLAPercentage).toFixed(1) : "N/A"}%)`} size="small" style={{ backgroundColor: "#d4edda", color: "#155724" }} />
                <Chip icon={<WarningIcon />} label={`Breached SLA: ${summary.breachedCount} (${summary.breachedSLAPercentage != null ? Number(summary.breachedSLAPercentage).toFixed(1) : "N/A"}%)`} size="small"
                  style={{ backgroundColor: summary.breachedCount > 0 ? "#f8d7da" : undefined, color: summary.breachedCount > 0 ? "#721c24" : undefined }} />
                <Chip label={`Not Applicable: ${summary.notApplicableCount}`} size="small" style={{ backgroundColor: "#e8eaf6", color: "#3949ab" }} />
              </Box>
            </Box>
          )}
          {norm.items.length === 0 ? (
            <Box p={4} textAlign="center" style={{ color: "#666" }}>
              <CheckCircleIcon style={{ color: "#4caf50", fontSize: 32, marginBottom: 8 }} />
              <Typography variant="h6">No Findings</Typography>
              <Typography variant="body2">No vulnerability findings detected.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ minWidth: 80 }}><strong>Severity</strong></TableCell>
                    <TableCell style={{ minWidth: 80 }}><strong>Status</strong></TableCell>
                    <TableCell style={{ minWidth: 200 }}><strong>Title</strong></TableCell>
                    <TableCell><strong>CVE ID</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>First Observed</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((f, i) => (
                    <TableRow key={i} hover>
                      <TableCell><Chip label={f.severity} size="small" style={severityColor(f.severity)} /></TableCell>
                      <TableCell><Chip label={f.status} size="small" style={statusColor(f.status)} /></TableCell>
                      <TableCell style={{ fontSize: 11, maxWidth: 260 }}>
                        <Typography variant="caption" title={f.description} style={{ display: "block", cursor: "help", lineHeight: 1.4 }}>{f.title}</Typography>
                      </TableCell>
                      <TableCell style={{ fontFamily: "monospace", fontSize: 10 }}>{f.cveId}</TableCell>
                      <TableCell style={{ fontSize: 10 }}>
                        {f.type && (
                          <Chip label={f.type === "NETWORK_REACHABILITY" ? "Network" : "Package"} size="small" variant="outlined" style={{ fontSize: 9 }} />
                        )}
                      </TableCell>
                      <TableCell style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                        {f.firstObservedAt ? new Date(f.firstObservedAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    }

    // ── CloudWatch Log Analysis ────────────────────────────────────────────
    if (norm.type === "log_analysis") {
      const { summary } = norm;
      const retentionStatusStyle = (status) => {
        switch (status) {
          case "configured": return { backgroundColor: "#d4edda", color: "#155724" };
          case "missing":    return { backgroundColor: "#f8d7da", color: "#721c24" };
          case "new":        return { backgroundColor: "#e8eaf6", color: "#3949ab" };
          default:           return {};
        }
      };
      const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 B";
        const units = ["B", "KB", "MB", "GB"];
        let i = 0, val = bytes;
        while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
        return `${val.toFixed(1)} ${units[i]}`;
      };
      const formatTs = (ts) => (ts ? new Date(ts).toLocaleDateString() : "N/A");

      return (
        <>
          <Box mb={2} p={2} style={{ backgroundColor: "#f5f5f5", borderRadius: 8 }}>
            <Typography variant="subtitle2" gutterBottom><strong>CloudWatch Log Groups</strong></Typography>
            <Box display="flex" style={{ gap: 8 }} mt={1} flexWrap="wrap">
              <Chip label={`Total Groups: ${summary.totalLogGroups}`} size="small" variant="outlined" />
              <Chip icon={<CheckCircleIcon />} label={`Enabled: ${summary.enabledLogGroups}`} size="small" style={{ backgroundColor: "#d4edda", color: "#155724" }} />
              {summary.disabledLogGroups > 0 && (
                <Chip icon={<CancelIcon />} label={`Disabled: ${summary.disabledLogGroups}`} size="small" style={{ backgroundColor: "#f8d7da", color: "#721c24" }} />
              )}
              <Chip
                icon={summary.withRetentionCount === summary.totalLogGroups ? <CheckCircleIcon /> : <WarningIcon />}
                label={`Retention Set: ${summary.withRetentionCount}`}
                size="small"
                style={{ backgroundColor: summary.withRetentionCount === summary.totalLogGroups ? "#d4edda" : "#fff3cd", color: summary.withRetentionCount === summary.totalLogGroups ? "#155724" : "#856404" }}
              />
              {summary.withoutRetentionCount > 0 && (
                <Chip icon={<WarningIcon />} label={`No Retention: ${summary.withoutRetentionCount}`} size="small" style={{ backgroundColor: "#f8d7da", color: "#721c24" }} />
              )}
              {summary.recentlyCreatedCount > 0 && (
                <Chip label={`Recently Created: ${summary.recentlyCreatedCount}`} size="small" style={{ backgroundColor: "#e8eaf6", color: "#3949ab" }} />
              )}
              {summary.averageRetentionDays > 0 && (
                <Chip label={`Avg Retention: ${summary.averageRetentionDays} days`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
          {norm.items.length === 0 ? (
            <Box p={2} textAlign="center" style={{ color: "#888" }}>
              <Typography variant="body2">No log group data available.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell style={{ minWidth: 260 }}><strong>Log Group Name</strong></TableCell>
                    <TableCell align="center"><strong>Retention</strong></TableCell>
                    <TableCell align="right"><strong>Stored Size</strong></TableCell>
                    <TableCell align="center"><strong>Metric Filters</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((g, i) => (
                    <TableRow key={i} hover>
                      <TableCell style={{ fontFamily: "monospace", fontSize: 11 }}>{g.logGroupName}</TableCell>
                      <TableCell align="center">
                        <Chip label={g.retentionInDays != null ? `${g.retentionInDays} days` : "Not set"} size="small" style={retentionStatusStyle(g.retentionStatus)} />
                      </TableCell>
                      <TableCell align="right" style={{ fontSize: 11 }}>{formatBytes(g.storedBytes)}</TableCell>
                      <TableCell align="center" style={{ fontSize: 12 }}>{g.metricFilterCount ?? 0}</TableCell>
                      <TableCell style={{ fontSize: 11 }}>{formatTs(g.creationTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      );
    }

    // ── Simple Metrics (flat KV) ───────────────────────────────────────────
    if (norm.type === "aws_metrics") {
      return (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Metric</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((item, i) => (
                <TableRow key={i} hover>
                  <TableCell style={{ textTransform: "capitalize" }}>{item.metric}</TableCell>
                  <TableCell>{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // ── Generic multi-section fallback (replaces old data-dropping branch) ──
    if (norm.type === "multi_section") {
      const hasScalars = Object.keys(norm.scalarEntries).length > 0;
      return (
        <>
          {hasScalars && <SummaryCard data={norm.scalarEntries} />}
          {norm.arraySections.map((s, i) => (
            <AutoSection key={`arr-${i}`} title={s.title} items={s.items} />
          ))}
          {norm.objectSections.map((s, i) => (
            <AutoSection key={`obj-${i}`} title={s.title} data={s.data} />
          ))}
        </>
      );
    }

    // ── Raw JSON fallback ──────────────────────────────────────────────────
    if (norm.type === "raw_json") {
      const jsonText = paged[0]?.data || "";
      return (
        <Box style={{ borderRadius: 10, border: "1px solid #e0e0e0", overflow: "hidden", background: "#ffffff" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}
            style={{ background: "#f7f7f7", borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="subtitle2" style={{ fontWeight: 600, color: "black" }}>Raw Evidence JSON</Typography>
            <Button size="small" variant="outlined" onClick={() => navigator.clipboard.writeText(jsonText)}>Copy JSON</Button>
          </Box>
          <Box style={{ maxHeight: 420, overflow: "auto", background: "#1e1e1e", padding: 16 }}>
            <pre style={{ margin: 0, fontSize: 12, fontFamily: "Consolas, Monaco, monospace", lineHeight: 1.5, color: "#dcdcdc", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {jsonText}
            </pre>
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper" aria-labelledby="evidence-dialog-title">
      <DialogTitle id="evidence-dialog-title">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "black" }}>{dialogTitle}</span>
          <IconButton aria-label="close" onClick={onClose} style={{ color: "#666", padding: 4 }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers style={{ maxHeight: 500 }}>
        {renderContent()}
      </DialogContent>

      <DialogActions style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Button onClick={onClose} variant="contained" color="primary">Close</Button>
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconButton onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Chip label={`Page ${page + 1} of ${totalPages}`} size="small" variant="outlined" />
              <IconButton onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} size="small">
                <ChevronRightIcon />
              </IconButton>
            </div>
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default Evidence_Modal;
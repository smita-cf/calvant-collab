import axios from "axios";
import documentationService from "../documentation/services/documentationService";

// ── API roots ─────────────────────────────────────────────────────────────────
const CONTROLS_API   = "https://api.calvant.com/framework/api/controls/framework";
const COMPLIANCE_API = "https://api.calvant.com/compliance-brain/compliance";
const MAPPINGS_API   = "https://api.calvant.com/framework/api/mappings/framework";
const SOA_API        = "https://api.calvant.com/control-soa/api/soa";         // ✅ FIX: was going through documentationService which used wrong URL
const DOCS_API       = "https://api.calvant.com/doc-service/api/documents";   // ✅ FIX: was `${SP}/doc-service/api/documents` where SP="" in production

// ── localStorage keys ─────────────────────────────────────────────────────────
const AUTO_CACHE_KEYS = {
  ISO27001: "risk_assessment_cache_v1",
  ISO27701: "risk_assessment_cache_27701_v1",
  SOC2:     "risk_assessment_cache_soc2_v1",
  ISO42001: "risk_assessment_cache_iso42001_v1",
  KSA_PDPL: "risk_assessment_cache_ksapdpl_v1",
};

const CONTROLS_CACHE_KEYS = {
  ISO27001: "iso27001_controls_cache_v1",
  ISO27701: "iso27701_controls_cache_v1",
  SOC2:     "soc2_controls_cache_v1",
  ISO42001: "iso42001_controls_cache_v1",
  KSA_PDPL: "ksapdpl_controls_cache_v1",
};

// ── Auth ──────────────────────────────────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});

// ─────────────────────────────────────────────────────────────────────────────
// getIds  — returns both tenantId and orgId
//
// IMPORTANT: these are TWO different values in CalVant:
//   tenantId  — used for compliance-brain API calls (/scores, /evidence)
//   orgId     — used for filtering SoA entries and MLD docs (e.organization)
//
// Previously getTenantId() conflated them, causing SoA and doc lookups to
// silently return 0 results when the two IDs differed.
// ─────────────────────────────────────────────────────────────────────────────
export function getIds() {
  try {
    const tenantId = sessionStorage.getItem("tenantId") || null;
    const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
    const org      = userData.organization;
    // organization can be a string ID or an object with an _id field
    const orgId    = typeof org === "object" && org !== null
      ? (org._id ?? org.id ?? null)
      : (org ?? null);
    return { tenantId, orgId };
  } catch {
    return { tenantId: null, orgId: null };
  }
}

// Keep for backward compatibility — callers that only need tenantId
export function getTenantId() {
  return getIds().tenantId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Letter-prefix → control.  Digit-prefix → clause.
const isControl = (cat = "") => /^[A-Za-z]/.test(cat.trim());

/**
 * Try all A./bare variants for a code when looking up in a Map/Set.
 */
function withVariants(code) {
  const withA    = code.startsWith("A.") ? code : `A.${code}`;
  const withoutA = code.startsWith("A.") ? code.slice(2) : code;
  return [code, withA, withoutA];
}

function mapGet(map, code) {
  for (const v of withVariants(code)) {
    const val = map.get(v);
    if (val !== undefined) return val;
  }
  return undefined;
}

function setHas(set, code) {
  return withVariants(code).some((v) => set.has(v));
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────────────────────────────────────

/** Control library for a framework. Cached in localStorage. */
async function getControlLibrary(framework) {
  const cacheKey = CONTROLS_CACHE_KEYS[framework];
  try {
    const raw = cacheKey && localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fall through */ }
  try {
    const { data } = await axios.get(`${CONTROLS_API}/${framework}`, {
      headers: authHeader(),
    });
    const controls = data || [];
    if (cacheKey) localStorage.setItem(cacheKey, JSON.stringify(controls));
    return controls;
  } catch (err) {
    console.warn(`[complianceData] getControlLibrary(${framework})`, err?.message);
    return [];
  }
}

/**
 * SoA data for a framework.
 *
 * ✅ FIX: Now calls SOA_API directly instead of documentationService.getSoAEntries()
 *         which was resolving to a wrong/relative URL in production.
 * ✅ FIX: Now uses orgId (from user.organization) to filter, not tenantId,
 *         because SoA entries store orgId in their `organization` field.
 *
 * Returns:
 *   applicableSet           — Set<"category|framework"> (null → no SoA found, treat all as in-scope)
 *   soaIdByCategoryFramework — Map<"category|framework", soaId>
 */
async function getSoaData(framework) {
  try {
    const { orgId } = getIds();

    const res = await axios.get(SOA_API, { headers: authHeader() });
    const all = res.data || [];

    // ── pre-fetch doc soaIds so we can prefer entries that have a linked doc ──
    // Multiple SoA entries can exist for the same category|framework (duplicates
    // from different tenants or re-saves). Always picking the first one causes
    // controls like A.6.1 to resolve to a soaId with no doc even though another
    // entry for the same control does have one.
    let docSoaIds = new Set();
    try {
      const docsRes = await axios.get(DOCS_API, { headers: authHeader() });
      const liveDocs = (docsRes.data || []).filter((d) => !d.deleted);
      docSoaIds = new Set(liveDocs.map((d) => String(d.soaId)).filter(Boolean));
    } catch { /* degrade gracefully — scoring still works, just no doc preference */ }

    const relevant = all.filter((e) => {
      if (orgId && e.organization !== orgId) return false;
      return (
        (e.framework || "").trim() === framework &&
        e.status !== "Not Applicable"
      );
    });

    // Deduplicate by category|framework — prefer the entry whose soaId
    // has a linked MLD document over one that doesn't.
    const seen = new Map();
    relevant.forEach((e) => {
      const cat = String(e.category || "").trim();
      const fw  = String(e.framework || "").trim();
      if (!cat || !fw) return;
      const key = `${cat}|${fw}`;

      if (!seen.has(key)) {
        seen.set(key, e);
      } else {
        // Upgrade if current best has no doc but this entry does
        const currentHasDoc = docSoaIds.has(String(seen.get(key).id));
        const thisHasDoc    = docSoaIds.has(String(e.id));
        if (!currentHasDoc && thisHasDoc) seen.set(key, e);
      }
    });

    if (seen.size === 0) {
      return { applicableSet: null, soaIdByCategoryFramework: new Map() };
    }

    const soaIdByCategoryFramework = new Map(
      [...seen.entries()].map(([key, e]) => [key, String(e.id)]),
    );

    return {
      applicableSet: new Set(seen.keys()),
      soaIdByCategoryFramework,
    };
  } catch (err) {
    console.warn(`[complianceData] getSoaData(${framework})`, err?.message);
    return { applicableSet: null, soaIdByCategoryFramework: new Map() };
  }
}

/**
 * Auto scores from localStorage cache.
 * Returns Map<controlCode, number[]>.
 */
function getAutoScoreMap(framework) {
  const key = AUTO_CACHE_KEYS[framework];
  if (!key) return new Map();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return new Map();
    const map = new Map();
    items.forEach((item) => {
      const code = item.controlId;
      if (!code) return;
      const scores = extractScores(item);
      if (!map.has(code)) map.set(code, []);
      map.get(code).push(...scores);
    });
    return map;
  } catch {
    return new Map();
  }
}

/** Extract numeric scores from one cache item. */
function extractScores(item) {
  if (Array.isArray(item.metrics) && item.metrics.length > 0) {
    return item.metrics.map((m) => {
      const s = parseFloat(m.currentScore);
      return isNaN(s) ? 0 : s;
    });
  }
  if (item.score != null && item.score !== "") {
    const s = parseFloat(item.score);
    return [isNaN(s) ? 0 : s];
  }
  return [item.compliant === true ? 100 : 0];
}

/**
 * All TargetScore records for the tenant + framework.
 * Returns Map<controlId, { targetScore: number|null, currentScore: number|null }>
 */
async function getTargetScoreMap(tenantId, frameworkCode = null) {
  if (!tenantId) return new Map();
  try {
    const { data } = await axios.get(`${COMPLIANCE_API}/${tenantId}/scores`, {
      headers: authHeader(),
      ...(frameworkCode ? { params: { frameworkCode } } : {}),
    });

    const merged = {};
    (data || []).forEach((r) => {
      const id = r.controlId;
      if (!id) return;
      if (!merged[id]) merged[id] = { targetScore: null, currentScore: null };
      const ts = r.targetScore != null ? parseFloat(r.targetScore) : null;
      const cs = r.currentScore != null ? parseFloat(r.currentScore) : null;
      if (ts !== null && !isNaN(ts)) merged[id].targetScore = ts;
      if (cs !== null && !isNaN(cs)) merged[id].currentScore = cs;
    });

    return new Map(Object.entries(merged));
  } catch (err) {
    console.warn("[complianceData] getTargetScoreMap", err?.message);
    return new Map();
  }
}

/**
 * Evidence file controlIds for tenant + framework.
 * Returns Set<controlId>.
 */
async function getEvidenceSet(tenantId, framework) {
  if (!tenantId) return new Set();
  try {
    const { data } = await axios.get(`${COMPLIANCE_API}/${tenantId}/evidence`, {
      headers: authHeader(),
      params: { frameworkCode: framework },
    });
    return new Set((data || []).map((f) => f.controlId).filter(Boolean));
  } catch (err) {
    console.warn(`[complianceData] getEvidenceSet(${framework})`, err?.message);
    return new Set();
  }
}

/**
 * Non-deleted MLD documents.
 *
 * ✅ FIX: Now calls DOCS_API directly with absolute URL instead of
 *         `${SP}/doc-service/api/documents` where SP="" in production,
 *         which caused every fetch to return an HTML 404 page instead of JSON.
 *
 * Returns:
 *   docsBySoaId    — Set<soaId>
 *   docsByControlId — Set<controlId>
 */
async function getDocSets() {
  try {
    const res  = await axios.get(DOCS_API, { headers: authHeader() });
    const live = (res.data || []).filter((d) => !d.deleted);
    return {
      docsBySoaId:     new Set(live.map((d) => String(d.soaId)).filter(Boolean)),
      docsByControlId: new Set(live.map((d) => String(d.controlId)).filter(Boolean)),
    };
  } catch (err) {
    console.warn("[complianceData] getDocSets", err?.message);
    return { docsBySoaId: new Set(), docsByControlId: new Set() };
  }
}

/**
 * SOC2 → ISO mappings.
 * Returns Map<soc2ControlCode, Array<{ code: string, framework: string }>>
 */
async function getSoc2MappingsMap() {
  const CACHE_KEY = "soc2_mappings_cache_v1";
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object") {
        return new Map(Object.entries(parsed).map(([k, v]) => [k, v]));
      }
    }
  } catch { /* fall through */ }

  try {
    const [res1, res7] = await Promise.all([
      axios.get(`${MAPPINGS_API}/SOC2/ISO27001`, { headers: authHeader() }).catch(() => ({ data: [] })),
      axios.get(`${MAPPINGS_API}/SOC2/ISO27701`, { headers: authHeader() }).catch(() => ({ data: [] })),
    ]);

    const map = new Map();
    const push = (rows, fw) => {
      (rows || []).forEach((m) => {
        const soc2Id = m.sourceControlCode;
        const isoId  = m.targetControlCode;
        if (!soc2Id || !isoId) return;
        if (!map.has(soc2Id)) map.set(soc2Id, []);
        map.get(soc2Id).push({ code: isoId, framework: fw });
      });
    };
    push(res1.data, "ISO27001");
    push(res7.data, "ISO27701");

    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(map)));
    return map;
  } catch (err) {
    console.warn("[complianceData] getSoc2MappingsMap", err?.message);
    return new Map();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core evaluator — one control/clause entry
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Compliance rules:
 *
 *  CLAUSE  (digit-prefix: "4.1", "5.1", "9.3" …)
 *    Compliant     : scoreOk OR ≥1 non-deleted MLD doc linked via soaId/controlId
 *    Non-compliant : neither
 *
 *  CONTROL (letter-prefix: "A.5.1", "CC6.1" …)
 *    Auto-tracked  (controlId has entries in localStorage auto-cache)
 *      Compliant   : ALL cached scores === 100  AND  ≥1 MLD doc
 *      Non-compliant: otherwise
 *    Manual-only   (no auto-cache entries)
 *      Compliant   : (currentScore >= targetScore AND hasDoc)
 *                    OR (hasDoc AND hasEvidence)
 *      Non-compliant: neither path satisfied
 */
function evaluateEntry({
  category,
  soaId,
  autoScores,
  scores,
  hasEvidence,
  docsBySoaId,
  docsByControlId,
}) {
  const hasDoc =
    (soaId && docsBySoaId.has(String(soaId))) ||
    setHas(docsByControlId, category);

  const ts = scores?.targetScore;
  const cs = scores?.currentScore;
  const scoreOk =
    ts != null && !isNaN(ts) && ts > 0 &&
    cs != null && !isNaN(cs) && cs >= ts;

  // ── CLAUSE ────────────────────────────────────────────────────────────────
  // Requires a doc AND either score meets target or evidence uploaded.
  // Prevents false positives where currentScore=100 in DB but no doc exists.
  if (!isControl(category)) {
    return hasDoc && (scoreOk || hasEvidence);
  }

  // ── CONTROL: auto-tracked ─────────────────────────────────────────────────
  if (autoScores.length > 0) {
    return autoScores.every((s) => s === 100) && hasDoc;
  }

  // ── CONTROL: manual-only ──────────────────────────────────────────────────
  // Path 1: score meets target AND doc present
  if (scoreOk && hasDoc) return true;

  // Path 2: doc present AND evidence file uploaded
  return hasDoc && hasEvidence;
}

// ─────────────────────────────────────────────────────────────────────────────
// ISO computation  (ISO27001 / ISO27701 / ISO42001 / KSA_PDPL)
// ─────────────────────────────────────────────────────────────────────────────
async function computeIso(framework, tenantId) {
  const [
    controls,
    { applicableSet, soaIdByCategoryFramework },
    targetScoreMap,
    evidenceSet,
    { docsBySoaId, docsByControlId },
  ] = await Promise.all([
    getControlLibrary(framework),
    getSoaData(framework),
    getTargetScoreMap(tenantId, framework),
    getEvidenceSet(tenantId, framework),
    getDocSets(),
  ]);

  const autoScoreMap = getAutoScoreMap(framework);

  const applicable = applicableSet
    ? controls.filter((c) => applicableSet.has(`${c.controlCode}|${framework}`))
    : controls;

  if (applicable.length === 0)
    return { totalControls: 0, compliant: 0, nonCompliant: 0 };

  let compliant = 0, nonCompliant = 0;

  applicable.forEach((ctrl) => {
    const code   = ctrl.controlCode;
    const soaKey = `${code}|${framework}`;
    const soaId  = soaIdByCategoryFramework.get(soaKey) ?? null;

    const ok = evaluateEntry({
      category:    code,
      soaId,
      autoScores:  mapGet(autoScoreMap, code) ?? [],
      scores:      mapGet(targetScoreMap, code) ?? null,
      hasEvidence: setHas(evidenceSet, code),
      docsBySoaId,
      docsByControlId,
    });

    ok ? compliant++ : nonCompliant++;
  });

  return { totalControls: applicable.length, compliant, nonCompliant };
}

// ─────────────────────────────────────────────────────────────────────────────
// SOC2 computation
// ─────────────────────────────────────────────────────────────────────────────
async function computeSOC2(tenantId) {
  const [
    soc2Controls,
    soc2Mappings,
    { docsBySoaId, docsByControlId },
    { soaIdByCategoryFramework: iso1SoaIds },
    iso1TargetMap,
    iso1EvidenceSet,
    { soaIdByCategoryFramework: iso7SoaIds },
    iso7TargetMap,
    iso7EvidenceSet,
  ] = await Promise.all([
    getControlLibrary("SOC2"),
    getSoc2MappingsMap(),
    getDocSets(),
    getSoaData("ISO27001"),
    getTargetScoreMap(tenantId, "ISO27001"),
    getEvidenceSet(tenantId, "ISO27001"),
    getSoaData("ISO27701"),
    getTargetScoreMap(tenantId, "ISO27701"),
    getEvidenceSet(tenantId, "ISO27701"),
  ]);

  const iso1AutoScoreMap = getAutoScoreMap("ISO27001");
  const iso7AutoScoreMap = getAutoScoreMap("ISO27701");

  function isoControlCompliant(isoCode) {
    const checkForFramework = (fw, autoMap, targetMap, evidSet, soaIdMap) => {
      const soaKey = `${isoCode}|${fw}`;
      const soaId  = soaIdMap.get(soaKey) ?? null;

      const hasDoc =
        (soaId && docsBySoaId.has(String(soaId))) ||
        setHas(docsByControlId, isoCode);

      if (!soaId && !hasDoc) return false;

      return evaluateEntry({
        category:    isoCode,
        soaId,
        autoScores:  mapGet(autoMap, isoCode) ?? [],
        scores:      mapGet(targetMap, isoCode) ?? null,
        hasEvidence: setHas(evidSet, isoCode),
        docsBySoaId,
        docsByControlId,
      });
    };

    return (
      checkForFramework("ISO27001", iso1AutoScoreMap, iso1TargetMap, iso1EvidenceSet, iso1SoaIds) ||
      checkForFramework("ISO27701", iso7AutoScoreMap, iso7TargetMap, iso7EvidenceSet, iso7SoaIds)
    );
  }

  if (soc2Controls.length === 0)
    return { totalControls: 0, compliant: 0, nonCompliant: 0 };

  let compliant = 0, nonCompliant = 0;

  soc2Controls.forEach((ctrl) => {
    const mappedList = soc2Mappings.get(ctrl.controlCode) || [];
    if (mappedList.length === 0) { nonCompliant++; return; }
    mappedList.every(({ code }) => isoControlCompliant(code))
      ? compliant++
      : nonCompliant++;
  });

  return { totalControls: soc2Controls.length, compliant, nonCompliant };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {"ISO27001"|"ISO27701"|"SOC2"|"ISO42001"|"KSA_PDPL"} framework
 * @returns {Promise<{ totalControls: number, compliant: number, nonCompliant: number }>}
 */
export async function getFrameworkCompliance(framework) {
  const { tenantId } = getIds();
  if (framework === "SOC2") return computeSOC2(tenantId);
  return computeIso(framework, tenantId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy / sync helpers  (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function getComplianceCache(frameworkCode) {
  const key = AUTO_CACHE_KEYS[frameworkCode];
  if (!key) return null;
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function getFrameworkComplianceSync(frameworkCode) {
  const raw = getComplianceCache(frameworkCode);
  if (!raw || !Array.isArray(raw))
    return { totalControls: 0, compliant: 0, nonCompliant: 0 };

  const scoresByControl = {};
  raw.forEach((item) => {
    if (!item.controlId) return;
    if (!scoresByControl[item.controlId]) scoresByControl[item.controlId] = [];
    scoresByControl[item.controlId].push(...extractScores(item));
  });

  let totalControls = 0, compliant = 0, nonCompliant = 0;
  Object.values(scoresByControl).forEach((scores) => {
    totalControls++;
    scores.length > 0 && scores.every((s) => s === 100)
      ? compliant++
      : nonCompliant++;
  });

  return { totalControls, compliant, nonCompliant };
}

export async function getFrameworkComplianceWithTargetScore(
  frameworkCode,
  tenantId = null,
) {
  const raw = getComplianceCache(frameworkCode);
  if (!raw || !Array.isArray(raw))
    return { totalControls: 0, compliant: 0, nonCompliant: 0 };

  const effectiveTenantId = tenantId || getIds().tenantId;
  const targetMap = effectiveTenantId
    ? await getTargetScoreMap(effectiveTenantId, frameworkCode)
    : new Map();

  const scoresByControl = {};
  raw.forEach((item) => {
    if (!item.controlId) return;
    if (!scoresByControl[item.controlId])
      scoresByControl[item.controlId] = { scores: [], targetScore: null };
    scoresByControl[item.controlId].scores.push(...extractScores(item));
    const ts = mapGet(targetMap, item.controlId);
    if (ts?.targetScore != null && scoresByControl[item.controlId].targetScore === null)
      scoresByControl[item.controlId].targetScore = ts.targetScore;
  });

  let totalControls = 0, compliant = 0;
  Object.values(scoresByControl).forEach(({ scores, targetScore }) => {
    if (targetScore != null && targetScore > 0) {
      totalControls++;
      if (scores.length > 0 && scores.every((s) => s === 100)) compliant++;
    }
  });

  return { totalControls, compliant, nonCompliant: totalControls - compliant };
}
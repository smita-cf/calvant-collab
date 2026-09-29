#!/usr/bin/env node
/**
 * CalVant UI Knowledge Extractor
 * --------------------------------
 * Statically analyses your Next.js /app router and /src/modules source tree
 * and produces two output files:
 *
 *   calvant-ui-sitemap.json          — structured map of every module, route,
 *                                      and action in the app
 *   calvant-workflow-kb.json         — WorkflowKnowledgeBase entries ready to
 *                                      load into your Spring Boot RAG service
 *
 * Usage (from repo root):
 *   node scripts/extract-ui-knowledge.js
 *
 * Outputs land next to this script.  Copy them into your backend resource dir.
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');   // repo root
const APP_DIR    = path.join(ROOT, 'app');
const SRC_DIR    = path.join(ROOT, 'src');
const OUT_SITEMAP = path.join(__dirname, 'calvant-ui-sitemap.json');
const OUT_KB      = path.join(__dirname, 'calvant-workflow-kb.json');

// ── Route extractor ───────────────────────────────────────────────────────────
function extractRoutes(appDir) {
  const routes = [];
  function walk(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = entry.name;
      if (name.startsWith('_') || name.startsWith('.')) continue;
      if (entry.isDirectory()) {
        const segment = name.startsWith('[') ? `:${name.slice(1,-1)}` : name;
        walk(path.join(dir, name), `${prefix}/${segment}`);
      } else if (name === 'page.js' || name === 'page.jsx' || name === 'page.ts' || name === 'page.tsx') {
        routes.push({ route: prefix || '/', file: path.join(dir, name) });
      }
    }
  }
  walk(appDir);
  return routes;
}

// ── Source text extractor ─────────────────────────────────────────────────────
function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function extractButtonTexts(source) {
  const texts = new Set();
  // Match text between > and < in JSX, filter out pure whitespace/variables
  const pattern = />([A-Z][a-zA-Z &+\-/]{2,35})</g;
  let m;
  while ((m = pattern.exec(source)) !== null) {
    const t = m[1].trim();
    if (t && !t.includes('{') && !t.includes('(') && t.length > 2) {
      texts.add(t);
    }
  }
  // Also match string literals that look like button labels
  const strPattern = /"((?:Add|Create|New|Edit|Delete|Upload|Export|Submit|Assign|Plan|Review|Conduct|View|Manage|Save|Cancel|Back|Close|Search|Filter|Generate|Download|Approve|Reject|Mark|Complete|Start|Run|Refresh|Reset|Archive|Restore|Bulk)[A-Za-z ]{0,30})"/g;
  while ((m = strPattern.exec(source)) !== null) {
    texts.add(m[1].trim());
  }
  return [...texts];
}

function extractRouterPushPaths(source) {
  const paths = new Set();
  const pattern = /router\.push\([`"'](\/[a-z0-9\-/[\]{}$:]*)[`"']/g;
  let m;
  while ((m = pattern.exec(source)) !== null) {
    paths.add(m[1].replace(/\$\{[^}]+\}/g, ':id'));
  }
  return [...paths];
}

function extractModalNames(source) {
  const modals = new Set();
  // setShowXxxModal(true) or showXxxModal state
  const pattern1 = /set(Show[A-Z][a-zA-Z]+Modal|[A-Z][a-zA-Z]+Modal)\s*\(/g;
  let m;
  while ((m = pattern1.exec(source)) !== null) {
    modals.add(m[1].replace(/^Show/, '').replace(/Modal$/, ''));
  }
  // <XxxModal  component usage
  const pattern2 = /<([A-Z][a-zA-Z]+Modal)\b/g;
  while ((m = pattern2.exec(source)) !== null) {
    modals.add(m[1].replace(/Modal$/, ''));
  }
  return [...modals];
}

function extractFormFields(source) {
  const fields = new Set();
  // placeholder="..." and label= patterns
  const pattern1 = /placeholder=["']([^"']{3,50})["']/g;
  const pattern2 = /label=["']([^"']{3,50})["']/g;
  let m;
  while ((m = pattern1.exec(source)) !== null) fields.add(m[1]);
  while ((m = pattern2.exec(source)) !== null) fields.add(m[1]);
  return [...fields];
}

// ── Module scanner ─────────────────────────────────────────────────────────────
function scanModule(modulePath, moduleName) {
  const result = { name: moduleName, buttons: new Set(), routes: new Set(), modals: new Set(), fields: new Set() };
  if (!fs.existsSync(modulePath)) return result;

  function walkDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.match(/\.(js|jsx|ts|tsx)$/) && !entry.name.match(/\.bak|copy/)) {
        const src = readFile(fullPath);
        extractButtonTexts(src).forEach(b => result.buttons.add(b));
        extractRouterPushPaths(src).forEach(r => result.routes.add(r));
        extractModalNames(src).forEach(m => result.modals.add(m));
        extractFormFields(src).forEach(f => result.fields.add(f));
      }
    }
  }
  walkDir(modulePath);

  return {
    name: result.name,
    buttons: [...result.buttons],
    routes: [...result.routes],
    modals: [...result.modals],
    fields: [...result.fields],
  };
}

// ── Hand-authored module knowledge ────────────────────────────────────────────
// This is the semantic layer that static analysis can't infer on its own.
// Maps each module to a curated set of workflow Q&A entries.
const MODULE_KNOWLEDGE = {
  'risk-assessment': {
    displayName: 'Risk Assessment',
    description: 'Create, manage, and track organisational risks. View risk register, assign risk owners, set likelihood/impact scores, and monitor remediation tasks.',
    path: '/risk-assessment',
    keyPages: [
      { path: '/risk-assessment', label: 'Risk Dashboard' },
      { path: '/risk-assessment/add', label: 'Add New Risk' },
      { path: '/risk-assessment/saved', label: 'My Risks / Saved Risks' },
      { path: '/risk-assessment/templates', label: 'Risk Templates' },
      { path: '/risk-assessment/controls', label: 'Controls' },
      { path: '/risk-assessment/soa', label: 'Statement of Applicability (SoA)' },
      { path: '/risk-assessment/my-tasks', label: 'My Risk Tasks' },
      { path: '/risk-assessment/mld', label: 'Risk MLD (Management Log Document)' },
    ],
    workflows: [
      {
        questions: ['how do i add a new risk', 'how to create a risk', 'add risk', 'create new risk', 'log a risk'],
        steps: ['Go to Risks in the left sidebar', 'Click "Create Risk" from the quick actions, or navigate to /risk-assessment/add', 'Fill in the risk title, category, likelihood (1–5), impact (1–5), and description', 'Assign a risk owner and department', 'Select the applicable framework(s)', 'Click Save'],
        notes: 'After saving the risk appears in your risk register on /risk-assessment/saved'
      },
      {
        questions: ['how do i view my risks', 'where is my risk register', 'see all risks', 'list of risks'],
        steps: ['Go to Risks → My Risks in the sidebar, or navigate to /risk-assessment/saved', 'Use the framework filter at the top to filter by ISO 27001, GDPR, SOC 2, etc.', 'Click any risk row to expand details'],
        notes: 'The main /risk-assessment dashboard shows summary charts and stats; the register itself is at /risk-assessment/saved'
      },
      {
        questions: ['how to edit a risk', 'update a risk', 'modify risk', 'change risk score'],
        steps: ['Navigate to /risk-assessment/saved', 'Click the risk you want to edit', 'Click the Edit icon (pencil)', 'Update the fields and click Save'],
      },
      {
        questions: ['how do i use risk templates', 'what are risk templates', 'template risks'],
        steps: ['Navigate to Risks → Templates (/risk-assessment/templates)', 'Browse available templates by framework or category', 'Click a template to pre-fill a new risk form', 'Adjust the fields for your organisation and save'],
      },
      {
        questions: ['what is soa', 'statement of applicability', 'how to use soa', 'soa page'],
        steps: ['Navigate to /risk-assessment/soa', 'The SoA lists all Annex A controls and their applicability status for your org', 'Toggle each control as Applicable or Not Applicable', 'Add a justification note where required'],
        notes: 'The SoA is framework-specific — make sure you have ISO 27001 selected in your framework filter'
      },
      {
        questions: ['how to complete a risk task', 'mark task complete', 'my risk tasks'],
        steps: ['Navigate to /risk-assessment/my-tasks', 'Find the task in your list', 'Click the task to expand it', 'Click "Mark Complete" when done'],
      },
    ]
  },

  'documentation': {
    displayName: 'Policies & Documentation',
    description: 'Upload, manage, and view compliance policies and procedures. Organise documents by framework. Access the Master Log Document (MLD).',
    path: '/documentation',
    keyPages: [
      { path: '/documentation', label: 'Policy Library' },
      { path: '/documentation/upload', label: 'Upload Policy' },
      { path: '/documentation/view', label: 'View Policy' },
      { path: '/documentation/mld', label: 'Master Log Document (MLD)' },
      { path: '/documentation/archived', label: 'Archived Policies' },
      { path: '/documentation/settings', label: 'Documentation Settings' },
    ],
    workflows: [
      {
        questions: ['how do i upload a policy', 'upload document', 'add policy', 'upload compliance document'],
        steps: ['Navigate to Policies in the sidebar → Upload Policy, or go to /documentation/upload', 'Click "Choose File" and select your PDF or Word document', 'Enter the policy title, version, and owner', 'Select the applicable framework(s) and policy type', 'Click Upload'],
      },
      {
        questions: ['how do i view a policy', 'view uploaded document', 'open policy'],
        steps: ['Navigate to /documentation/view', 'Use the search bar or browse by framework/category', 'Click a policy card to preview or download it'],
      },
      {
        questions: ['what is the mld', 'master log document', 'how to use mld'],
        steps: ['Navigate to Policies → MLD, or go to /documentation/mld', 'The MLD is an auto-generated document listing all your active policies, their owners, review dates, and framework mappings', 'Click Export to download as PDF'],
      },
      {
        questions: ['how to archive a policy', 'archive document', 'retire a policy'],
        steps: ['Navigate to /documentation', 'Find the policy you want to archive', 'Click the three-dot menu (⋮) on the policy card', 'Select "Archive Policy"', 'Confirm the action'],
        notes: 'Archived policies are accessible at /documentation/archived — they are not deleted'
      },
    ]
  },

  'gap-assessment': {
    displayName: 'Gap Assessment / Audits',
    description: 'Plan and conduct compliance audits (gap assessments) against selected frameworks. Assign auditors, record findings, manage corrective action plans (CAPs).',
    path: '/gap-assessment',
    keyPages: [
      { path: '/gap-assessment', label: 'Audit Dashboard' },
      { path: '/gap-assessment/new', label: 'New Audit / Plan Audit' },
      { path: '/gap-assessment/history', label: 'Audit Results / History' },
    ],
    workflows: [
      {
        questions: ['how do i plan an audit', 'create a new audit', 'start gap assessment', 'plan gap assessment', 'how to conduct an audit'],
        steps: ['Navigate to Audits → New Audit (/gap-assessment/new)', 'Select the compliance framework (e.g. ISO 27001, SOC 2, GDPR)', 'Set the audit scope, start date, and end date', 'Assign an auditor from your user list', 'Click "Plan Audit" to create it'],
      },
      {
        questions: ['how do i record an audit finding', 'add finding', 'record non-conformance', 'log audit result'],
        steps: ['Open the audit from the Audit Dashboard (/gap-assessment)', 'Click "Conduct Audit" on the relevant audit', 'For each control, select Conformant / Non-Conformant / Not Applicable', 'For non-conformant controls, click "Add Finding" and describe the gap', 'Save your findings before moving to the next section'],
      },
      {
        questions: ['how to create a corrective action plan', 'what is a cap', 'corrective action', 'fix audit finding'],
        steps: ['Go to Audits → open the audit with findings', 'Click "Review Findings"', 'Select a non-conformant finding', 'Click "Create CAP" (Corrective Action Plan)', 'Enter the action description, owner, and due date', 'Save the CAP'],
      },
      {
        questions: ['how to view audit history', 'past audit results', 'previous audits'],
        steps: ['Navigate to /gap-assessment/history', 'Filter by framework or date range', 'Click an audit to see full results and findings'],
      },
    ]
  },

  'task-management': {
    displayName: 'Task Management',
    description: 'Create, assign, and track compliance tasks. View tasks by department or as personal (My Tasks).',
    path: '/task-management',
    keyPages: [
      { path: '/task-management', label: 'Task Dashboard' },
      { path: '/task-management/tasks', label: 'Manage Tasks (all tasks)' },
      { path: '/task-management/departmenttasks', label: 'My Tasks (assigned to me)' },
    ],
    workflows: [
      {
        questions: ['how do i create a task', 'add a new task', 'assign a task', 'create compliance task'],
        steps: ['Navigate to Tasks → Manage Task (/task-management/tasks)', 'Click "Add New Task"', 'Enter the task title, description, and due date', 'Assign to a user and select priority (High/Medium/Low)', 'Click Save'],
      },
      {
        questions: ['how do i see my tasks', 'view assigned tasks', 'my tasks', 'tasks assigned to me'],
        steps: ['Navigate to Tasks → My Tasks (/task-management/departmenttasks)', 'Your assigned tasks are listed here with status and due dates', 'Click a task to expand details or mark it complete'],
      },
      {
        questions: ['how to mark a task complete', 'complete a task', 'finish task'],
        steps: ['Go to /task-management/departmenttasks (My Tasks)', 'Find the task', 'Click the task row to expand it', 'Click "Mark Complete"'],
      },
    ]
  },

  'compliances': {
    displayName: 'Compliance Dashboard',
    description: 'View your overall compliance posture across all frameworks. Drill down into framework-specific compliance scores, generate compliance reports.',
    path: '/compliances',
    keyPages: [
      { path: '/compliances', label: 'Compliance Overview' },
      { path: '/compliances/detailed', label: 'Detailed Compliance View' },
      { path: '/compliances/reports', label: 'Compliance Reports' },
      { path: '/iso-27001', label: 'ISO 27001 Framework Dashboard' },
      { path: '/gdpr', label: 'GDPR Framework Dashboard' },
      { path: '/soc2', label: 'SOC 2 Framework Dashboard' },
      { path: '/iso-27701', label: 'ISO 27701 Framework Dashboard' },
      { path: '/iso-42001', label: 'ISO 42001 Framework Dashboard' },
      { path: '/ksa-pdpl', label: 'KSA PDPL Framework Dashboard' },
    ],
    workflows: [
      {
        questions: ['how do i view my compliance score', 'what is my compliance status', 'overall compliance', 'how compliant are we'],
        steps: ['Navigate to Compliances in the sidebar (/compliances)', 'The overview shows your compliance percentage per framework', 'Click "Detailed View" for a breakdown by control domain'],
      },
      {
        questions: ['how to generate a compliance report', 'export compliance report', 'download compliance report'],
        steps: ['Navigate to Compliances → Reports (/compliances/reports)', 'Select the framework, date range, and report format', 'Click "Generate Report"', 'Download the PDF once generated'],
      },
      {
        questions: ['how to view iso 27001 compliance', 'iso 27001 dashboard', 'iso 27001 controls', 'see iso controls'],
        steps: ['Navigate to /iso-27001 from the framework dashboard, or select ISO 27001 in the framework filter on the main dashboard', 'View Annex A control compliance by domain', 'Click any domain to see individual control status'],
      },
    ]
  },

  'tprm': {
    displayName: 'TPRM (Third Party Risk Management / Vendors)',
    description: 'Manage vendor risk assessments. Send questionnaires to vendors, review responses, score vendor risk, and track remediation.',
    path: '/tprm',
    keyPages: [
      { path: '/tprm', label: 'Vendor Risk Dashboard' },
    ],
    workflows: [
      {
        questions: ['how do i add a vendor', 'create a vendor', 'add third party', 'new vendor assessment'],
        steps: ['Navigate to Vendors in the sidebar (/tprm)', 'Click "New Assessment" or "Add Vendor"', 'Enter the vendor name and contact details', 'Select the questionnaire template (e.g. security, privacy, operational)', 'Click Send to dispatch the questionnaire to the vendor'],
      },
      {
        questions: ['how to review vendor responses', 'vendor questionnaire results', 'see vendor risk score'],
        steps: ['Navigate to /tprm', 'Find the vendor in the list', 'Click the vendor row to open their assessment', 'Review their responses section by section', 'Score and add remarks for each response', 'Click Approve or flag for further review'],
      },
    ]
  },

  'dpia': {
    displayName: 'DPIA (Data Protection Impact Assessment)',
    description: 'Conduct Data Protection Impact Assessments for GDPR Article 35 compliance. Three-stage assessment process: scoping, risk analysis, and sign-off.',
    path: '/dpia',
    keyPages: [
      { path: '/dpia', label: 'DPIA Dashboard' },
      { path: '/dpia/new', label: 'New DPIA' },
      { path: '/dpia/assessments', label: 'My DPIA Assessments' },
      { path: '/dpia/:id', label: 'DPIA Detail View' },
      { path: '/dpia/compliance/:id', label: 'DPIA Compliance Check' },
    ],
    workflows: [
      {
        questions: ['how do i start a dpia', 'create new dpia', 'new data protection impact assessment', 'begin dpia'],
        steps: ['Navigate to DPIA in the sidebar (/dpia)', 'Click "New DPIA" (/dpia/new)', 'Stage 1 — Scoping: describe the processing activity, purpose, and data types', 'Assign a DPO or assessor', 'Save and proceed to Stage 2'],
      },
      {
        questions: ['what are the stages of a dpia', 'dpia stages', 'dpia process steps'],
        steps: ['Stage 1 — Scoping: Describe the processing activity, data subjects, and lawful basis', 'Stage 2 — Risk Analysis: Identify privacy risks, assess likelihood and severity, propose mitigations', 'Stage 3 — Sign-off: DPO reviews the completed assessment and approves or requests changes'],
      },
      {
        questions: ['how to assign a dpia to someone', 'assign dpia assessor', 'delegate dpia'],
        steps: ['Navigate to /dpia', 'Click "Assign DPIA" on the dashboard', 'Select the DPIA and choose the assessor from the user list', 'Set a due date', 'Click Assign'],
      },
      {
        questions: ['how to view my dpia assessments', 'see my assigned dpias', 'dpia my assessments'],
        steps: ['Navigate to /dpia/assessments', 'Your assigned DPIAs are listed with status and due date', 'Click any DPIA to open and complete it'],
      },
    ]
  },

  'aiia': {
    displayName: 'AI Impact Assessment (AI IA)',
    description: 'Conduct AI Impact Assessments for ISO 42001 compliance. Assess AI systems across 51 checklist items covering governance, transparency, bias, and accountability.',
    path: '/aiia',
    keyPages: [
      { path: '/aiia', label: 'AI IA Dashboard' },
      { path: '/aiia/my-assignments', label: 'My AI IA Assignments' },
      { path: '/aiia/my-assignments/:id', label: 'AI IA Assignment Detail' },
      { path: '/aiia/risks', label: 'AI Risks' },
      { path: '/aiia/stage1', label: 'Stage 1 Assessments' },
      { path: '/aiia/stage2', label: 'Stage 2 Assessments' },
      { path: '/aiia/audit-logs', label: 'AI IA Audit Logs' },
    ],
    workflows: [
      {
        questions: ['how do i start an ai impact assessment', 'create ai ia', 'new ai assessment', 'plan ai impact assessment'],
        steps: ['Navigate to AI IA in the sidebar (/aiia)', 'Click "Plan Assessment" button on the dashboard', 'Enter the AI system name, description, and use case', 'Select the assessment type (Stage 1 or Stage 2)', 'Assign an assessor and set a due date', 'Click Save'],
      },
      {
        questions: ['how to complete an ai ia assignment', 'fill in ai assessment', 'answer ai ia questions', 'my ai ia'],
        steps: ['Navigate to /aiia/my-assignments', 'Click the assignment you want to complete', 'Work through the 51-question checklist section by section', 'Select Yes/No/Partial for each item and add evidence notes', 'Click Submit when all sections are complete'],
      },
      {
        questions: ['what is stage 1 vs stage 2 in ai ia', 'ai ia stages', 'difference between stage 1 and stage 2'],
        steps: ['Stage 1 — Initial scoping assessment: covers the AI system description, intended use, and high-level risk classification', 'Stage 2 — Detailed impact assessment: covers all 51 checklist items across governance, transparency, fairness, accountability, and technical robustness'],
      },
      {
        questions: ['how to view ai ia audit logs', 'ai audit trail', 'ai ia history'],
        steps: ['Navigate to /aiia/audit-logs', 'Filter by date range or assessor', 'Each log entry shows who took what action and when'],
      },
    ]
  },

  'admin': {
    displayName: 'Admin Panel',
    description: 'Root/admin-only area. Manage users, departments, organisations, frameworks, risk templates, gap questions, and platform settings.',
    path: '/admin',
    keyPages: [
      { path: '/admin/dashboard', label: 'Admin Dashboard' },
      { path: '/admin/users', label: 'User Management' },
      { path: '/admin/users/create', label: 'Create User' },
      { path: '/admin/users/bulk', label: 'Bulk User Import' },
      { path: '/admin/departments', label: 'Departments' },
      { path: '/admin/departments/create', label: 'Create Department' },
      { path: '/admin/organization', label: 'Organisations' },
      { path: '/admin/organization/create', label: 'Create Organisation' },
      { path: '/admin/risks', label: 'Risk Templates (Global)' },
      { path: '/admin/risks/add', label: 'Add Risk Template' },
      { path: '/admin/frameworks', label: 'Frameworks' },
      { path: '/admin/gap-questions', label: 'Gap Questions' },
      { path: '/admin/vendors', label: 'Vendors (Admin)' },
      { path: '/admin/trust-centre', label: 'Trust Centre Settings' },
      { path: '/admin/logs', label: 'System Logs' },
    ],
    workflows: [
      {
        questions: ['how do i create a user', 'add new user', 'invite user', 'register user'],
        steps: ['Navigate to Admin Panel → Users (/admin/users)', 'Click "Create User" (/admin/users/create)', 'Enter the user\'s name, email, role (admin/user/auditor), and department', 'Click Save — the user receives an invitation email'],
        notes: 'Only root/admin users can access the Admin Panel'
      },
      {
        questions: ['how to bulk import users', 'import users from csv', 'bulk user upload'],
        steps: ['Navigate to /admin/users/bulk', 'Download the CSV template', 'Fill in user details (name, email, role, department)', 'Upload the completed CSV', 'Review and confirm the import'],
      },
      {
        questions: ['how to create a department', 'add department', 'new department'],
        steps: ['Navigate to Admin Panel → Departments (/admin/departments)', 'Click "Create Department"', 'Enter the department name and assign a head', 'Click Save'],
      },
      {
        questions: ['how to create an organisation', 'add organisation', 'new tenant', 'onboard organisation'],
        steps: ['Navigate to Admin Panel → Organisation (/admin/organization)', 'Click "Create Organisation"', 'Enter the org name, domain, and plan details', 'Click Save'],
        notes: 'This is used by partner admins to onboard managed client organisations'
      },
      {
        questions: ['how to add a global risk template', 'create risk template', 'add template risk'],
        steps: ['Navigate to Admin Panel → Risks (/admin/risks)', 'Click "Add Risk"', 'Fill in the risk title, type, and framework mapping', 'Click Save — the template becomes available to all org users'],
      },
    ]
  },
};

// ── Build sitemap ─────────────────────────────────────────────────────────────
function buildSitemap() {
  const routes = extractRoutes(APP_DIR);
  const sitemap = { generatedAt: new Date().toISOString(), modules: [] };

  for (const [key, knowledge] of Object.entries(MODULE_KNOWLEDGE)) {
    // Find all app routes that belong to this module
    const prefix = `/${key.replace('risk-assessment', 'risk-assessment').replace('gap-assessment', 'gap-assessment')}`;
    const matchingRoutes = routes
      .filter(r => r.route === prefix || r.route.startsWith(prefix + '/'))
      .map(r => r.route);

    // Scan source module directory
    const srcModuleDir = path.join(SRC_DIR, 'modules', key.replace(/-/g, '').replace('riskassessment', 'riskAssesment').replace('gapassessment', 'gapAssessment').replace('taskmanagement', 'taskManagement').replace('tprm', 'tprm').replace('documentation', 'documentation'));
    const scanned = scanModule(srcModuleDir, key);

    sitemap.modules.push({
      key,
      displayName: knowledge.displayName,
      description: knowledge.description,
      primaryPath: knowledge.path,
      pages: knowledge.keyPages,
      discoveredRoutes: matchingRoutes,
      extractedButtons: (Array.isArray(scanned.buttons) ? scanned.buttons : [...scanned.buttons]).slice(0, 20),
      workflows: knowledge.workflows.map(w => ({
        triggerPhrases: w.questions,
        steps: w.steps,
        notes: w.notes || null,
      })),
    });
  }

  return sitemap;
}

// ── Build WorkflowKnowledgeBase entries ───────────────────────────────────────
function buildWorkflowKB(sitemap) {
  const entries = [];

  for (const module of sitemap.modules) {
    for (const workflow of module.workflows) {
      // Primary entry — first question is the canonical one
      const primary = workflow.triggerPhrases[0];
      const answer = [
        `**${module.displayName}** — Here's how to do it:`,
        '',
        workflow.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        workflow.notes ? `\n> 💡 ${workflow.notes}` : '',
        '',
        `You can access this at: \`${module.primaryPath}\``
      ].filter(Boolean).join('\n');

      entries.push({
        id: `${module.key}-${entries.length}`,
        module: module.key,
        moduleDisplayName: module.displayName,
        primaryPath: module.primaryPath,
        question: primary,
        alternativeQuestions: workflow.triggerPhrases.slice(1),
        answer,
        steps: workflow.steps,
        notes: workflow.notes || null,
      });
    }

    // Also add a "what can I do in X" entry for each module
    const pageList = module.pages.map(p => `- **${p.label}** (\`${p.path}\`)`).join('\n');
    entries.push({
      id: `${module.key}-overview`,
      module: module.key,
      moduleDisplayName: module.displayName,
      primaryPath: module.primaryPath,
      question: `what can I do in ${module.displayName.toLowerCase()}`,
      alternativeQuestions: [
        `what is ${module.displayName.toLowerCase()}`,
        `how does ${module.displayName.toLowerCase()} work`,
        `${module.key} features`,
        `navigate ${module.displayName.toLowerCase()}`,
      ],
      answer: [
        `**${module.displayName}** — ${module.description}`,
        '',
        'Available pages:',
        pageList,
      ].join('\n'),
      steps: [],
      notes: null,
    });
  }

  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('🔍  Scanning CalVant Next.js source tree...');
const sitemap = buildSitemap();
console.log(`✅  Discovered ${sitemap.modules.length} modules`);

fs.writeFileSync(OUT_SITEMAP, JSON.stringify(sitemap, null, 2));
console.log(`📄  Sitemap written → ${OUT_SITEMAP}`);

const kb = buildWorkflowKB(sitemap);
fs.writeFileSync(OUT_KB, JSON.stringify(kb, null, 2));
console.log(`📚  WorkflowKB written → ${OUT_KB} (${kb.length} entries)`);

console.log('\nSummary per module:');
for (const m of sitemap.modules) {
  console.log(`  ${m.displayName.padEnd(35)} ${m.workflows.length} workflows, ${m.pages.length} pages`);
}

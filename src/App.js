//C:\Users\ak192\Downloads\calvant-frontend-2-cv_nextjs4\calvant-frontend-2-cv_nextjs4\src\App.js


import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Context & Modals
import { SessionProvider, useSession } from "./context/SessionContext";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import AuditorAccessRestricted from "./components/AuditorAccessRestricted";

// Navigations
import PersistentSidebar from "./components/navigations/PersistentSidebar";

// Modules - Dashboard & Login
import Dashboard from "./modules/dashboard/Dashboard";
import DashboardLoggedIn from "./modules/dashboard/DashboardLoggedIn";
import LoginPage from "./modules/departments/pages/loginPage";
import DemoPage from "./modules/departments/pages/DemoPage";
import ChangePasswordPage from "./modules/departments/pages/ChangePasswordPage";

// Modules - Risk Assessment
import RiskAssessment from "./modules/riskAssesment/pages/RiskAssessment";
import AddRisk from "./modules/riskAssesment/pages/AddRisk";
import TemplatesPage from "./modules/riskAssesment/pages/TemplatesPage";
import SavedRisksPage from "./modules/riskAssesment/pages/SavedRisksPage";
import MyTasks from "./modules/riskAssesment/pages/MyTasks";

// Modules - Documentation
import Documentation from "./modules/documentation/pages/Documentation";
import SoaPage from "./modules/documentation/pages/SoaPage";
import ControlsPage from "./modules/documentation/pages/ControlPage";
import DocumentationSettingsPage from "./modules/documentation/pages/DocumentationSettingsPage";
import MLD from "./modules/documentation/pages/MLD";
import SoAMLD from "./modules/documentation/pages/SoAMLD";
import Archived from "./modules/documentation/pages/Archived";

// Modules - Gap & Task Management
import GapAssessmentDashboard from "./modules/gapAssessment/pages/GapAssessment";
import NewAssessment from "./modules/gapAssessment/pages/NewAssessment";
import AssessmentHistory from "./modules/gapAssessment/pages/AssessmentHistory";
import TaskManagementDashboard from "./modules/taskManagement/pages/TaskManagementDashboard";
import TaskManagementPage from "./modules/taskManagement/pages/TaskManagementPage";
import departmenttask from "./modules/taskManagement/pages/departmenttask";

// Modules - Integrations
import IntegrationsDashboard from "./modules/integrations/integrationdashboard";
import ComplianceReports from "./modules/integrations/ComplianceReports";
import Compliances from "./modules/integrations/Compliances";
import AuthBridge from "./modules/departments/pages/AuthBridge";
import { FrameworkProvider, useFramework } from "./context/FrameworkContex";

// --- TPRM MODULE IMPORTS ---
import TPRMSection from "./modules/tprm/pages/TPRMSection";

//--- Trust Centre ---
// Add this with your other module imports
import PublicTrustCentrePage from "./modules/trustcentre/pages/PublicTrustCentrePage";
import TrustCentrePage from "./modules/trustcentre/pages/TrustCentrePage";

import DpiaDashboard from "./modules/dpia/pages/DpiaDashboard";
import DpiaAssessment from "./modules/dpia/pages/DpiaAssessment";
import ViewAssessments from "./modules/dpia/pages/ViewAssessments";
import ComplianceDashboard from "./modules/dpia/pages/ComplianceDashboard";

//--- AIIA-----
import AiiaDashboard from "./modules/aiia/pages/AiiaDashboard";
import Stage1List from "./modules/aiia/pages/ManageAiiaModal";
import PlanAssessmentModal from "./modules/aiia/components/PlanAssessmentModal";
import Stage2List from "./modules/aiia/pages/Stage2List";
import Stage2Form from "./modules/dpia/components/Stage2Form";
import RisksForm from "./modules/aiia/pages/RiskForm";
import RisksList from "./modules/aiia/pages/RiskList";
import AuditLogs from "./modules/aiia/pages/AuditLogs";
import MyAssignments from "./modules/aiia/pages/MyAssignments";
import AssignmentDetailRoute from "./modules/aiia/pages/AssignmentDetailRout";

// Frameworks & Templates
import ISO_27001 from "./modules/dashboard/FrameWorks/ISO_27001";
import ISO_27701 from "./modules/dashboard/FrameWorks/ISO_27701";
import ISO_42001 from "./modules/dashboard/FrameWorks/ISO_42001";
import SOC2 from "./modules/dashboard/FrameWorks/SOC2";
import KSA_PDPL from "./modules/dashboard/FrameWorks/KSA_PDPL";
import GDPR from "./modules/dashboard/FrameWorks/GDPR";
import DPDPA from "./modules/dashboard/FrameWorks/DPDPA";

import Policies from "./modules/dashboard/Template/Policies";
import Procedures from "./modules/dashboard/Template/Procedures";

// Static Pages
import AboutPage from "./static-pages/about";
import BlogPage from "./static-pages/blog";
import BlogPost from "./static-pages/BlogPost";
import DATASHEETS  from "./static-pages/datasheet";
import CareersPage from "./static-pages/careers";
import PrivacyPage from "./static-pages/privacy";
import TermsPage from "./static-pages/terms";
import SecurityPage from "./static-pages/security";
import useActivityLogger from "./hooks/useActivityLogger";
import { useLocation } from "react-router-dom";
import ReportsDashboard from "./modules/reports/pages/ReportsDashboard";
import FooterContentPage from "./footer-pages/FooterContentPage";

import { UIProvider } from "./context/UIContext";

import "./styles/GlobalStyles.css";

// ── SEO INTEGRATION ───────────────────────────────────────────
import { SEOProvider } from "./context/SEOContext";
import DynamicSEO from "./components/DynamicSEO";

// ─────────────────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const RoleBasedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const userRoles = Array.isArray(user?.role)
    ? user.role
    : user?.role
      ? [user.role]
      : [];

  return (
    <Route
      {...rest}
      render={(props) =>
        user && userRoles.some((role) => allowedRoles.includes(role)) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

/**
 * FrameworkProtectedRoute
 * Renders the component only when the user is authenticated AND the
 * current framework selection permits access to this module.
 *
 * @param {string} moduleKey  - "dpia" | "aiia"
 * @param {React.Component} component
 */
const FrameworkProtectedRoute = ({
  component: Component,
  moduleKey,
  ...rest
}) => {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  // useFramework is safe here because this component is always rendered
  // inside <FrameworkProvider>
  const { showDpia, showAiia } = useFramework();

  const moduleAllowed = moduleKey === "dpia" ? showDpia : showAiia;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!user) return <Redirect to="/login" />;
        if (!moduleAllowed) return <Redirect to="/" />;
        return <Component {...props} />;
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const AppLayout = ({ children }) => {
  const { sidebarWidth, navbarHeight, isMobile } = useLayout();
  const [user, setUser] = useState(getStoredUser);
  const { isStrictAuditor, isAuditorAllowedPath } = require("./utils/roleUtils");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const isLoggedIn = !!user;
  const location = useLocation();
  const pathname = location.pathname;
  useActivityLogger(); // Auto PAGE_LOAD logs

  // Block strict auditors from any path except Home, Audits, Tasks, and Compliances
  const isAuditorRestricted = isStrictAuditor(user) && !isAuditorAllowedPath(pathname);

  return (
    <div className="app">
      {isLoggedIn && <PersistentSidebar />}
      <main
        className="main-content"
        style={{
          paddingTop: isLoggedIn ? navbarHeight : undefined,
          minHeight: "100vh",
          boxSizing: "border-box",
          marginLeft: isLoggedIn && !isMobile ? sidebarWidth : undefined,
          transition: "margin-left cubic-bezier(0.4, .2) .3s",
        }}
      >
        {isAuditorRestricted ? <AuditorAccessRestricted /> : children}
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Route Switcher
// ─────────────────────────────────────────────────────────────────────────────

const AppRoutes = () => {
  return (
    <Switch>
      {/* LOGIN & DEMO - No Sidebar */}
      <Route exact path="/auth-bridge" component={AuthBridge} />
      <Route exact path="/login" component={LoginPage} />
      <Route path="/demo" component={DemoPage} />

      {/* STATIC PAGES */}
      <Route path="/about">
        <FooterContentPage type="about" />
      </Route>
      <Route exact path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPost} />
     


      {/* SEPARATE STATIC ROUTES */}
      <Route path="/privacy">
        <FooterContentPage type="privacy" />
      </Route>
      <Route path="/terms">
        <FooterContentPage type="terms" />
      </Route>
      <Route path="/security">
        <FooterContentPage type="security" />
      </Route>
      <Route path="/about">
        <FooterContentPage type="about" />
      </Route>
   
      {/* FRAMEWORKS & TEMPLATES */}
      <Route path="/iso-27001" component={ISO_27001} />
      <Route path="/iso-27701" component={ISO_27701} />
      <Route path="/iso-42001" component={ISO_42001} />
      <Route path="/soc-2" component={SOC2} />
      <Route path="/ksa-pdpl" component={KSA_PDPL} />
      <Route path="/gdpr" component={GDPR} />
      <Route path="/dpdpa" component={DPDPA} />
      <Route path="/policies" component={Policies} />
      <Route path="/procedures" component={Procedures} />

      {/* AUTHENTICATED APP ROUTES */}
      <Route>
        <AppLayout>
          <Switch>
            <Route
              exact
              path="/"
              render={() => {
                const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = sessionStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);
                return user ? <DashboardLoggedIn /> : <Dashboard />;
              }}
            />
            <Route
              exact
              path="/change-password"
              component={ChangePasswordPage}
            />

            {/* ── RISK ASSESSMENT ─────────────────────────────────── */}
            <ProtectedRoute
              exact
              path="/risk-assessment"
              component={RiskAssessment}
            />
            <ProtectedRoute path="/risk-assessment/add" component={AddRisk} />
            <RoleBasedRoute
              path="/risk-assessment/saved"
              component={SavedRisksPage}
              allowedRoles={[
                "risk_owner",
                "risk_identifier",
                "risk_manager",
                "super_admin",
                "root",
                "dpo",
                "ciso",
                "aio",
              ]}
            />
            <RoleBasedRoute
              path="/risk-assessment/soa"
              component={SoaPage}
              allowedRoles={[
                "risk_owner",
                "risk_identifier",
                "risk_manager",
                "super_admin",
                "root",
                "dpo",
                "ciso",
                "aio",
              ]}
            />
            <Route
              path="/risk-assessment/templates"
              component={TemplatesPage}
            />
            <ProtectedRoute
              path="/risk-assessment/my-tasks"
              component={MyTasks}
            />
            <ProtectedRoute path="/risk-assessment/mld" component={SoAMLD} />

            {/* ── DOCUMENTATION ───────────────────────────────────── */}
            <ProtectedRoute
              exact
              path="/documentation"
              component={Documentation}
            />

            <ProtectedRoute
              exact
              path="/documentation/archived"
              component={Archived}
            />

            <ProtectedRoute
              path="/risk-assessment/controls"
              component={ControlsPage}
            />
            <ProtectedRoute
              path="/documentation/settings"
              component={DocumentationSettingsPage}
            />
            <ProtectedRoute path="/documentation/mld" component={MLD} />
            <ProtectedRoute path="/documentation/view" component={MLD} />
            <ProtectedRoute path="/documentation/upload" component={MLD} />

            {/* ── AUDIT / GAP ASSESSMENT ──────────────────────────── */}
            <ProtectedRoute
              exact
              path="/gap-assessment"
              component={GapAssessmentDashboard}
            />
            <ProtectedRoute
              exact
              path="/gap-assessment/new"
              component={NewAssessment}
            />

            {/* ── TASK MANAGEMENT ─────────────────────────────────── */}
            <ProtectedRoute
              exact
              path="/task-management"
              component={TaskManagementDashboard}
            />
            <ProtectedRoute
              exact
              path="/task-management/tasks"
              component={TaskManagementPage}
            />
            <ProtectedRoute
              exact
              path="/task-management/departmenttasks"
              component={departmenttask}
            />

            {/* ── INTEGRATIONS / COMPLIANCE ───────────────────────── */}
            <ProtectedRoute exact path="/compliances" component={Compliances} />
            <ProtectedRoute
              path="/compliances/reports"
              component={ComplianceReports}
            />
            <ProtectedRoute
              exact
              path="/compliances/detailed"
              component={IntegrationsDashboard}
            />

            <ProtectedRoute
              exact
              path="/reports"
              component={ReportsDashboard}
            />

            {/* ── TPRM ────────────────────────────────────────────── */}
            <ProtectedRoute exact path="/tprm" component={TPRMSection} />

            <Route exact path="/trust" component={PublicTrustCentrePage} />
            <ProtectedRoute
              exact
              path="/trust-centre"
              component={TrustCentrePage}
            />

            {/* ── DPIA — framework-gated ──────────────────────────── */}
            <FrameworkProtectedRoute
              exact
              path="/dpia"
              component={DpiaDashboard}
              moduleKey="dpia"
            />
            <FrameworkProtectedRoute
              exact
              path="/dpia/assessments"
              component={ViewAssessments}
              moduleKey="dpia"
            />
            <FrameworkProtectedRoute
              exact
              path="/dpia/compliance/:id"
              component={ComplianceDashboard}
              moduleKey="dpia"
            />
            <FrameworkProtectedRoute
              exact
              path="/dpia/new"
              component={DpiaAssessment}
              moduleKey="dpia"
            />
            <FrameworkProtectedRoute
              exact
              path="/dpia/:id"
              component={DpiaAssessment}
              moduleKey="dpia"
            />

            {/* ── AIIA — framework-gated ──────────────────────────── */}
            <FrameworkProtectedRoute
              exact
              path="/aiia"
              component={AiiaDashboard}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage1"
              component={Stage1List}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage1/new"
              component={PlanAssessmentModal}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/my-assignments/:id"
              component={AssignmentDetailRoute}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/my-assignments"
              component={MyAssignments}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage1/edit/:id"
              component={PlanAssessmentModal}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage2"
              component={Stage2List}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage2/new"
              component={Stage2Form}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/stage2/edit/:id"
              component={Stage2Form}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/risks"
              component={RisksList}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/risks/new"
              component={RisksForm}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/risks/edit/:id"
              component={RisksForm}
              moduleKey="aiia"
            />
            <FrameworkProtectedRoute
              exact
              path="/aiia/audit-logs"
              component={AuditLogs}
              moduleKey="aiia"
            />

            {/* CATCH ALL */}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
};

const AppWithSession = () => {
  const { sessionExpired, logout } = useSession();
  return (
    <>
      {/* {sessionExpired && <SessionExpiredModal onOk={logout} />} */}
      <AppRoutes />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <SEOProvider>
          <DynamicSEO />
          <UIProvider>
            <FrameworkProvider>
              <LayoutProvider>
                <SessionProvider>
                  <AppWithSession />
                </SessionProvider>
              </LayoutProvider>
            </FrameworkProvider>
          </UIProvider>
        </SEOProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;

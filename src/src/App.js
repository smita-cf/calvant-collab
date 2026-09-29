import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import HamburgerMenu from "./components/navigations/HamburgerMenu";

import Dashboard from "./modules/dashboard/Dashboard";
import LoginPage from "./modules/departments/pages/loginPage";

import RiskAssessment from "./modules/riskAssesment/pages/RiskAssessment";
import AddRisk from "./modules/riskAssesment/pages/AddRisk";
import TemplatesPage from "./modules/riskAssesment/pages/TemplatesPage";
import SavedRisksPage from "./modules/riskAssesment/pages/SavedRisksPage";

import Documentation from "./modules/documentation/pages/Documentation";
import SoaPage from "./modules/documentation/pages/SoaPage";
import ControlsPage from "./modules/documentation/pages/ControlPage";
import ReportsPage from "./modules/documentation/pages/ReportPage";
import DocumentationSettingsPage from "./modules/documentation/pages/DocumentationSettingsPage";
import MLD from "./modules/documentation/pages/MLD";

import GapAssessmentDashboard from "./modules/gapAssessment/pages/GapAssessment";
import NewAssessment from "./modules/gapAssessment/pages/NewAssessment";
import AssessmentHistory from "./modules/gapAssessment/pages/AssessmentHistory";

import MyTasks from "./modules/riskAssesment/pages/MyTasks";

import "./styles/GlobalStyles.css";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
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
  const user = JSON.parse(sessionStorage.getItem("user"));
  return (
    <Route
      {...rest}
      render={(props) =>
        user && allowedRoles.includes(user.role) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <HamburgerMenu />
        <main className="main-content">
          <Switch>
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/" component={Dashboard} />

            <ProtectedRoute exact path="/risk-assessment" component={RiskAssessment} />
            <ProtectedRoute path="/risk-assessment/add" component={AddRisk} />
            <RoleBasedRoute
              path="/risk-assessment/saved"
              component={SavedRisksPage}
              allowedRoles={["risk_owner", "risk_manager","super_admin" ]


              }
            />
              <RoleBasedRoute
              path="/documentation/soa"
              component={SoaPage}
              allowedRoles={["super_admin"]

                
              }
            />

            <ProtectedRoute path="/risk-assessment/templates" component={TemplatesPage} />
            {/* Route for the new My Tasks page */}
            <ProtectedRoute path="/risk-assessment/my-tasks" component={MyTasks} />

            <ProtectedRoute exact path="/documentation" component={Documentation} />
            {/* <ProtectedRoute path="/documentation/soa" component={SoaPage} /> */}
            <ProtectedRoute path="/documentation/controls" component={ControlsPage} />
            <ProtectedRoute path="/documentation/reports" component={ReportsPage} />
            <ProtectedRoute path="/documentation/settings" component={DocumentationSettingsPage} />
            <ProtectedRoute path="/documentation/mld" component={MLD} />

            <ProtectedRoute exact path="/gap-assessment" component={GapAssessmentDashboard} />
            <ProtectedRoute exact path="/gap-assessment/new" component={NewAssessment} />
            <ProtectedRoute exact path="/gap-assessment/history" component={AssessmentHistory} />

            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;












// import React from "react";
// import {
//   BrowserRouter as Router,
//   Route,
//   Switch,
//   Redirect,
// } from "react-router-dom";

// import HamburgerMenu from "./components/navigations/HamburgerMenu";

// import Dashboard from "./modules/dashboard/Dashboard";
// import LoginPage from "./modules/departments/pages/loginPage";

// // Other imports for modules...
// import RiskAssessment from "./modules/riskAssesment/pages/RiskAssessment";
// import AddRisk from "./modules/riskAssesment/pages/AddRisk";
// import TemplatesPage from "./modules/riskAssesment/pages/TemplatesPage";
// // import TaskManagement from "./modules/riskAssesment/pages/TaskManagement";

// import SavedRisksPage from "./modules/riskAssesment/pages/SavedRisksPage";

// import Documentation from "./modules/documentation/pages/Documentation";
// import SoaPage from "./modules/documentation/pages/SoaPage";
// import ControlsPage from "./modules/documentation/pages/ControlPage";
// import ReportsPage from "./modules/documentation/pages/ReportPage";
// import DocumentationSettingsPage from "./modules/documentation/pages/DocumentationSettingsPage";
// import MLD from "./modules/documentation/pages/MLD";

// import GapAssessmentDashboard from "./modules/gapAssessment/pages/GapAssessment";
// import NewAssessment from "./modules/gapAssessment/pages/NewAssessment";
// import AssessmentHistory from "./modules/gapAssessment/pages/AssessmentHistory";

// import "./styles/GlobalStyles.css";

// // Simple ProtectedRoute that checks if user is logged in
// const ProtectedRoute = ({ component: Component, ...rest }) => {
//   const user = JSON.parse(sessionStorage.getItem("user"));
//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         user ? <Component {...props} /> : <Redirect to="/login" />
//       }
//     />
//   );
// };

// const RoleBasedRoute = ({ component: Component, allowedRoles, ...rest }) => {
//   const user = JSON.parse(sessionStorage.getItem("user"));
//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         user && allowedRoles.includes(user.role) ? (
//           <Component {...props} />
//         ) : (
//           <Redirect to="/login" />
//         )
//       }
//     />
//   );
// };

// function App() {
//   return (
//     <Router>
//       <div className="app">
//         <HamburgerMenu />
//         <main className="main-content">
//           <Switch>
//             {/* Public Routes */}
//             <Route exact path="/login" component={LoginPage} />
//             <Route exact path="/" component={Dashboard} />

//             {/* Protected Module Routes */}
//             <ProtectedRoute exact path="/risk-assessment" component={RiskAssessment} />
//             <ProtectedRoute path="/risk-assessment/add" component={AddRisk} />
//             <RoleBasedRoute
//               path="/risk-assessment/saved"
//               component={SavedRisksPage}
//               allowedRoles={["risk_owner", "risk_manager"]}
//             />
//             <ProtectedRoute path="/risk-assessment/templates" component={TemplatesPage} />
//             {/* <ProtectedRoute path="/risk-assessment/tasks" component={TaskManagement} /> */}
  
            

//             <ProtectedRoute exact path="/documentation" component={Documentation} />
//             <ProtectedRoute path="/documentation/soa" component={SoaPage} />
//             <ProtectedRoute path="/documentation/controls" component={ControlsPage} />
//             <ProtectedRoute path="/documentation/reports" component={ReportsPage} />
//             <ProtectedRoute path="/documentation/settings" component={DocumentationSettingsPage} />
//             <ProtectedRoute path="/documentation/mld" component={MLD} />

//             <ProtectedRoute exact path="/gap-assessment" component={GapAssessmentDashboard} />
//             <ProtectedRoute exact path="/gap-assessment/new" component={NewAssessment} />
//             <ProtectedRoute exact path="/gap-assessment/history" component={AssessmentHistory} />

//             {/* Catch-All Redirect */}
//             <Route path="*">
//               <Redirect to="/" />
//             </Route>
//           </Switch>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;

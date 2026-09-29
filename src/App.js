import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import UserList from "./components/Users/UserList";
import UserForm from "./components/Users/UserForm";
import DepartmentsList from "./components/Departments/DepartmentList";
import DepartmentForm from "./components/Departments/DepartmentForm";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard"; // ✅ Add this
import RiskList from "./components/Risks/RiskList";
import RiskForm from "./components/Risks/RiskForm";
import Organization from "./components/Organization/Organization";
import ChangePassword from "./components/Users/ChangePassword";
import ControlOwnershipAdmin from "./components/ControlOwnership/ControlOwnershipAdmin";
import TrustCentreAdmin from "./components/TrustCentre/TrustCentreAdmin";
import TrustCentrePage from "./components/TrustCentre/TrustCentrePage";
import TrustCentreSharePage from "./components/TrustCentre/TrustCentreSharePage";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Switch>
          <Route exact path="/login" component={Login} />

          {/* ✅ Dashboard route for "/" */}
          <PrivateRoute exact path="/" component={Dashboard} />

          <PrivateRoute exact path="/users" component={UserList} />
          <PrivateRoute exact path="/users/create" component={UserForm} />
          <PrivateRoute exact path="/users/edit/:id" component={UserForm} />

          <PrivateRoute
            exact
            path="/change-password"
            component={ChangePassword}
          />

          <PrivateRoute exact path="/departments" component={DepartmentsList} />
          <PrivateRoute
            exact
            path="/departments/create"
            component={DepartmentForm}
          />
          <PrivateRoute
            exact
            path="/departments/edit/:id"
            component={DepartmentForm}
          />
          <PrivateRoute
            exact
            path="/control-ownership"
            component={ControlOwnershipAdmin}
          />

          <PrivateRoute exact path="/risks" component={RiskList} />
          <PrivateRoute exact path="/risks/create" component={RiskForm} />
          <PrivateRoute exact path="/risks/edit/:id" component={RiskForm} />
          {/* Organizations ✅ */}
          <PrivateRoute exact path="/organizations" component={Organization} />

          {/* Trust Centre — admin panel (root / super_admin only) */}
          <PrivateRoute
            exact
            path="/trust-centre/admin"
            component={TrustCentreAdmin}
          />

          {/* Trust Centre — internal view for org users */}
          <PrivateRoute
            exact
            path="/trust-centre"
            component={TrustCentrePage}
          />

          <Route
            exact
            path="/trust-centre/:shareToken"
            component={TrustCentreSharePage}
          />
          {/* Redirect unknown paths to dashboard if logged in, else login */}
          <PrivateRoute path="*" component={Dashboard} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;

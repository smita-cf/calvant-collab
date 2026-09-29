// src/main.jsx
import React from "react";
import "./index.css";
import "./app.css";
import { createRoot } from "react-dom/client";
import {
  BackendError,
  Lockscreen,
  NotFound,
  PasswordReset,
  Signin,
  Signup
} from "./pages";
import { isTokenExpired } from "./utils/authUtils";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppProvider from "./components/AppProvider/AppProvider";
import Dashboard from "./containers/Dashboard";


const basename = "/";

const App = () => {
  const isAuth = !isTokenExpired();

  return (
    <AppProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          {/* Redirect to signin as the landing page if not authenticated */}
          <Route 
            path="/" 
            element={isAuth ? <Dashboard /> : <Navigate to="/signin" replace />} 
          />
          
          <Route path="/404" element={<NotFound />} />
          <Route path="/500" element={<BackendError />} />
          <Route path="/Lockscreen" element={<Lockscreen />} />
          <Route path="/forgot" element={<PasswordReset />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />

          {/* catch-all route for dashboard / app routes */}
          <Route 
            path="/*" 
            element={isAuth ? <Dashboard /> : <Navigate to="/signin" replace />} 
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

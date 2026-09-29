import React from "react";
import { Navigate } from "react-router-dom";

import { isTokenExpired, clearAuthAndRedirect } from "../../utils/authUtils";

/**
 * React Router v6 compatible protected route wrapper.
 * Usage: <Route element={<ProtectedRoute component={SomeComponent} />} />
 */

function ProtectedRoute({ component: Component }) {
  if (isTokenExpired()) {
    clearAuthAndRedirect();
    return <Navigate to="/signin" replace />;
  }

  return <Component />;
}

export default ProtectedRoute; 
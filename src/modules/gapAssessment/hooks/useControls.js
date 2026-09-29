import { useState, useEffect } from "react";
import auditService from "../services/auditService";

// ─────────────────────────────────────────────
// useControls HOOK
// ─────────────────────────────────────────────
export function useControls(frameworkCode) {
  var _controls = useState([]);
  var controls = _controls[0];
  var setControls = _controls[1];
  var _loading = useState(false);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _error = useState("");
  var error = _error[0];
  var setError = _error[1];

  useEffect(
    function () {
      if (!frameworkCode) return;
      setLoading(true);
      setError("");
      auditService
        .getControlsByFramework(frameworkCode)
        .then(function (data) {
          setControls((data || []).map(auditService.normaliseControl));
          setLoading(false);
        })
        .catch(function (err) {
          setError(err.message || "Failed to load controls");
          setLoading(false);
        });
    },
    [frameworkCode],
  );

  return { controls: controls, loading: loading, error: error };
}

export default useControls;


import axios from "axios";

const API = axios.create({
  baseURL: "https://api.calvant.com/user-service/api",
  withCredentials: true,
}); 

API.interceptors.request.use(async (config) => {
  // JWT
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Organization
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user.organization) {
    config.headers["x-org"] = user.organization;
  }

  // --- START REGION LOGIC UPDATE ---
  let region = "US";

  const manualRegion = sessionStorage.getItem("selected_region");

  // 1️⃣ Login-time manual selection
  if (manualRegion && manualRegion !== "AUTO") {
    region = manualRegion;
  }

  // 2️⃣ Persisted user region (MOST IMPORTANT)
  else if (user.region) {
    region = user.region;
  }

  // 3️⃣ AUTO geolocation
  else if (manualRegion === "AUTO") {
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            if (
              latitude >= 8 &&
              latitude <= 37 &&
              longitude >= 68 &&
              longitude <= 97
            ) {
              region = "INDIA";
            } else if (
              latitude >= 35 &&
              latitude <= 70 &&
              longitude >= -10 &&
              longitude <= 40
            ) {
              region = "EU";
            } else {
              region = "US";
            }

            user.region = region;
            sessionStorage.setItem("user", JSON.stringify(user));
            resolve();
          },
          () => resolve()
        );
      });
    }
  }

  // 4️⃣ Set header
  config.headers["x-region"] = region;

  // --- END REGION LOGIC UPDATE ---

  return config;
});

export default API;

// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Stack,
//   CircularProgress,
//   Chip,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Avatar,
// } from "@mui/material";

// // Icons
// import GroupIcon from "@mui/icons-material/Group";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import StorefrontIcon from "@mui/icons-material/Storefront";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import api from "../../services/api"; // Existing generic API logic for /users, /departments

// // Chart.js
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js";
// import { Bar, Doughnut, Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// );

//  TPRM_BASE = "https://api.calvant.com/tprm-service/api/tprm/vendors";
//  RISKS_BASE = "https://api.calvant.com/risk-template-service/api/risks";
//  ROOT_RISKS_BASE = "https://api.calvant.com/risk-service/api/risks";

// const DashboardInfoCard = ({ title, value, icon, color, subtitle, trend }) => (
//   <Card
//     sx={{
//       borderRadius: "16px",
//       boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//       border: "1px solid #f1f5f9",
//       height: "100%",
//       position: "relative",
//       overflow: "hidden",
//     }}
//   >
//     <Box
//       sx={{
//         position: "absolute",
//         right: "-20px",
//         top: "-20px",
//         width: "100px",
//         height: "100px",
//         borderRadius: "50%",
//         background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
//       }}
//     />
//     <CardContent sx={{ p: 3, pb: "24px !important" }}>
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         alignItems="flex-start"
//         mb={2}
//       >
//         <Box
//           sx={{
//             p: 1.5,
//             borderRadius: "12px",
//             backgroundColor: `${color}15`,
//             color: color,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {icon}
//         </Box>
//         {trend && (
//           <Chip
//             icon={
//               <TrendingUpIcon style={{ fontSize: "14px", color: "#16a34a" }} />
//             }
//             label={trend}
//             size="small"
//             sx={{
//               backgroundColor: "#dcfce7",
//               color: "#16a34a",
//               fontWeight: 600,
//               fontSize: "11px",
//               height: "22px",
//             }}
//           />
//         )}
//       </Stack>
//       <Typography
//         variant="h3"
//         sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
//       >
//         {value}
//       </Typography>
//       <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b" }}>
//         {title}
//       </Typography>
//       {subtitle && (
//         <Typography
//           variant="caption"
//           sx={{ color: "#94a3b8", display: "block", mt: 1 }}
//         >
//           {subtitle}
//         </Typography>
//       )}
//     </CardContent>
//   </Card>
// );

// const Home = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState({
//     users: [],
//     departments: [],
//     vendors: [],
//     risks: [],
//   });
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;
//   const loggedInRole = Array.isArray(decoded?.role)
//     ? decoded.role[0]
//     : decoded?.role;
//   const myObject = JSON.parse(localStorage.getItem("myObject") || "{}");
//   const organizationId = myObject?.organization || null;
//   const isSuperAdmin = loggedInRole === "super_admin";

//   const authHeaders = {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       setLoading(true);
//       try {
//         const vendorParams = isSuperAdmin
//           ? {}
//           : { organization: organizationId };

//         const username = "username";
//         const password = "password";
//         const basicToken = btoa(`${username}:${password}`);

//         const [usersRes, deptsRes, vendorsRes, risksRes] = await Promise.all([
//           api.get("/users").catch(() => ({ data: [] })),
//           api.get("/departments").catch(() => ({ data: [] })),
//           axios
//             .get(TPRM_BASE, { headers: authHeaders, params: vendorParams })
//             .catch(() => ({ data: [] })),
//           fetch(ROOT_RISKS_BASE, {
//             headers: {
//               Authorization: `Basic ${basicToken}`,
//               "Content-Type": "application/json",
//             },
//           })
//             .then((res) => res.json())
//             .then((data) => ({ data }))
//             .catch(() => ({ data: [] })),
//         ]);

//         const users = Array.isArray(usersRes.data) ? usersRes.data : [];
//         const depts = Array.isArray(deptsRes.data) ? deptsRes.data : [];
//         const vendors = Array.isArray(vendorsRes.data)
//           ? vendorsRes.data
//           : vendorsRes.data?.content || [];

//         let risks = [];
//         if (risksRes.data?.data) {
//           risks = risksRes.data.data;
//         } else if (Array.isArray(risksRes.data)) {
//           risks = risksRes.data;
//         } else if (risksRes.data?.risks) {
//           risks = risksRes.data.risks;
//         }

//         setData({ users, departments: depts, vendors, risks });
//       } catch (err) {
//         console.error("Dashboard data fetch error", err);
//         setError("Unable to load complete dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="80vh"
//       >
//         <CircularProgress size={50} sx={{ color: "#3b82f6" }} />
//       </Box>
//     );
//   }

//   // Analytics Math
//   const risksByLevel = data.risks.reduce((acc, risk) => {
//     const level = (risk.riskLevel || risk.riskScore || risk.level || "UNKNOWN")
//       .toString()
//       .toUpperCase();
//     acc[level] = (acc[level] || 0) + 1;
//     return acc;
//   }, {});

//   const usersByRole = data.users.reduce((acc, user) => {
//     const roles = Array.isArray(user.role) ? user.role : [user.role || "user"];
//     roles.forEach((r) => {
//       acc[r] = (acc[r] || 0) + 1;
//     });
//     return acc;
//   }, {});

//   // Chart configs
//   const riskBarData = {
//     labels: ["High", "Medium", "Low", "Critical", "Unknown"],
//     datasets: [
//       {
//         label: "Risks",
//         data: [
//           risksByLevel["HIGH"] || 0,
//           risksByLevel["MEDIUM"] || 0,
//           risksByLevel["LOW"] || 0,
//           risksByLevel["CRITICAL"] || 0,
//           risksByLevel["UNKNOWN"] || 0,
//         ],
//         backgroundColor: [
//           "#ef4444",
//           "#f59e0b",
//           "#22c55e",
//           "#7f1d1d",
//           "#94a3b8",
//         ],
//         borderRadius: 6,
//         barThickness: 32,
//         maxBarThickness: 40,
//       },
//     ],
//   };

//   const riskBarOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         backgroundColor: "#0f172a",
//         titleFont: { family: "Inter, sans-serif", size: 13, weight: 600 },
//         bodyFont: { family: "Inter, sans-serif", size: 13, weight: 500 },
//         padding: 12,
//         cornerRadius: 8,
//         displayColors: false,
//         callbacks: {
//           label: (context) => `Total: ${context.parsed.y} Risks`,
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: {
//           font: { family: "Inter, sans-serif", size: 12 },
//           color: "#64748b",
//         },
//         border: { display: false },
//       },
//       y: {
//         beginAtZero: true,
//         border: { display: false },
//         grid: { color: "#f1f5f9" },
//         ticks: {
//           font: { family: "Inter, sans-serif", size: 12 },
//           color: "#64748b",
//           stepSize: 1,
//           precision: 0,
//         },
//       },
//     },
//   };

//   const sortedRoles = Object.entries(usersByRole)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5);
//   const roleDoughnutData = {
//     labels: sortedRoles.map((i) => i[0].replace("_", " ").toUpperCase()),
//     datasets: [
//       {
//         data: sortedRoles.map((i) => i[1]),
//         backgroundColor: [
//           "#3b82f6",
//           "#8b5cf6",
//           "#ec4899",
//           "#f59e0b",
//           "#10b981",
//         ],
//         borderWidth: 2,
//         borderColor: "#ffffff",
//         hoverOffset: 6,
//       },
//     ],
//   };

//   const roleDoughnutOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "80%",
//     plugins: {
//       legend: {
//         position: "right",
//         labels: {
//           usePointStyle: true,
//           boxWidth: 8,
//           padding: 24,
//           font: { family: "Inter, sans-serif", weight: 600, size: 12 },
//           color: "#475569",
//         },
//       },
//       tooltip: {
//         backgroundColor: "#0f172a",
//         bodyFont: { family: "Inter, sans-serif", size: 13, weight: 500 },
//         padding: 12,
//         cornerRadius: 8,
//       },
//     },
//   };

//   // Recent Risks (last 5)
//   const recentRisks = [...data.risks].slice(0, 5);

//   return (
//     <Box
//       sx={{
//         p: { xs: 2, md: 4 },
//         backgroundColor: "#ffffff",
//         minHeight: "100%",
//       }}
//     >
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Typography
//           variant="h4"
//           sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}
//         >
//           GRC Overview Dashboard
//         </Typography>
//         <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
//           Real-time metrics and dynamic monitoring across your enterprise.
//         </Typography>
//       </Box>

//       {/* Metric Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Total Users"
//             value={data.users.length}
//             icon={<GroupIcon />}
//             color="#3b82f6"
//             subtitle="Active accounts within platform"
//             trend="+12%"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Departments"
//             value={data.departments.length}
//             icon={<AccountBalanceIcon />}
//             color="#ec4899"
//             subtitle="Configured logical groupings"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Vendors"
//             value={data.vendors.length}
//             icon={<StorefrontIcon />}
//             color="#8b5cf6"
//             subtitle="Third-party risk partners"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Active Risks"
//             value={data.risks.length}
//             icon={<WarningAmberIcon />}
//             color="#f59e0b"
//             subtitle="Items across risk register"
//           />
//         </Grid>
//       </Grid>

//       {/* Charts Section */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Risk Distribution Chart */}
//         <Grid item xs={12} md={7}>
//           <Card
//             sx={{
//               borderRadius: "16px",
//               boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//               border: "1px solid #f1f5f9",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             <CardContent
//               sx={{
//                 p: 3,
//                 flexGrow: 1,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}
//               >
//                 Risk Severity Distribution
//               </Typography>
//               <Box sx={{ flexGrow: 1, minHeight: 320, position: "relative" }}>
//                 <Bar data={riskBarData} options={riskBarOptions} />
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* User Roles Chart */}
//         <Grid item xs={12} md={5}>
//           <Card
//             sx={{
//               borderRadius: "16px",
//               boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//               border: "1px solid #f1f5f9",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             <CardContent
//               sx={{
//                 p: 3,
//                 flexGrow: 1,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}
//               >
//                 Top User Roles
//               </Typography>
//               <Box
//                 sx={{
//                   flexGrow: 1,
//                   minHeight: 320,
//                   position: "relative",
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Box sx={{ width: "100%", height: "100%" }}>
//                   <Doughnut
//                     data={roleDoughnutData}
//                     options={roleDoughnutOptions}
//                   />
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Recent Activity Table */}
//       <Card
//         sx={{
//           borderRadius: "16px",
//           boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
//           border: "1px solid #f1f5f9",
//         }}
//       >
//         <CardContent sx={{ p: 0 }}>
//           <Box sx={{ px: 3, pt: 3, pb: 2 }}>
//             <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
//               Recent Actionable Risks
//             </Typography>
//           </Box>
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: "#f8fafc" }}>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Risk ID
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Asset Type
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Department
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Risk Score
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Status
//                   </TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {recentRisks.length > 0 ? (
//                   recentRisks.map((risk, index) => (
//                     <TableRow
//                       key={index}
//                       sx={{
//                         "&:last-child td": { border: 0 },
//                         "&:hover": { backgroundColor: "#f8fafc" },
//                       }}
//                     >
//                       <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
//                         {risk.riskId?.slice(-6) || "-"}
//                       </TableCell>
//                       <TableCell sx={{ color: "#475569" }}>
//                         {risk.assetType || "-"}
//                       </TableCell>
//                       <TableCell sx={{ color: "#475569" }}>
//                         {risk.department || "-"}
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>
//                         {risk.riskScore || "-"}
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={risk.status || "N/A"}
//                           size="small"
//                           sx={{
//                             backgroundColor:
//                               risk.status === "Open"
//                                 ? "#fee2e2"
//                                 : risk.status === "Closed"
//                                   ? "#dcfce7"
//                                   : "#f1f5f9",
//                             color:
//                               risk.status === "Open"
//                                 ? "#ef4444"
//                                 : risk.status === "Closed"
//                                   ? "#16a34a"
//                                   : "#64748b",
//                             fontWeight: 600,
//                             borderRadius: "6px",
//                           }}
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={5}
//                       align="center"
//                       sx={{ py: 4, color: "#64748b" }}
//                     >
//                       No recent risks found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default Home;
// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Stack,
//   CircularProgress,
//   Chip,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Avatar,
// } from "@mui/material";

// // Icons
// import GroupIcon from "@mui/icons-material/Group";
// import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// import StorefrontIcon from "@mui/icons-material/Storefront";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import api from "../../services/api"; // Existing generic API logic for /users, /departments

// // Chart.js
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js";
// import { Bar, Doughnut, Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// );

// const TPRM_BASE = "https://api.calvant.com/tprm-service/api/tprm/vendors";
// const RISKS_BASE = "https://api.calvant.com/risk-template-service/api/risks";
// const ROOT_RISKS_BASE = "https://api.calvant.com/risk-service/api/risks";

// const DashboardInfoCard = ({ title, value, icon, color, subtitle, trend }) => (
//   <Card
//     sx={{
//       borderRadius: "16px",
//       boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//       border: "1px solid #f1f5f9",
//       height: "100%",
//       position: "relative",
//       overflow: "hidden",
//     }}
//   >
//     <Box
//       sx={{
//         position: "absolute",
//         right: "-20px",
//         top: "-20px",
//         width: "100px",
//         height: "100px",
//         borderRadius: "50%",
//         background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
//       }}
//     />
//     <CardContent sx={{ p: 3, pb: "24px !important" }}>
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         alignItems="flex-start"
//         mb={2}
//       >
//         <Box
//           sx={{
//             p: 1.5,
//             borderRadius: "12px",
//             backgroundColor: `${color}15`,
//             color: color,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           {icon}
//         </Box>
//         {trend && (
//           <Chip
//             icon={
//               <TrendingUpIcon style={{ fontSize: "14px", color: "#16a34a" }} />
//             }
//             label={trend}
//             size="small"
//             sx={{
//               backgroundColor: "#dcfce7",
//               color: "#16a34a",
//               fontWeight: 600,
//               fontSize: "11px",
//               height: "22px",
//             }}
//           />
//         )}
//       </Stack>
//       <Typography
//         variant="h3"
//         sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
//       >
//         {value}
//       </Typography>
//       <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b" }}>
//         {title}
//       </Typography>
//       {subtitle && (
//         <Typography
//           variant="caption"
//           sx={{ color: "#94a3b8", display: "block", mt: 1 }}
//         >
//           {subtitle}
//         </Typography>
//       )}
//     </CardContent>
//   </Card>
// );

// const Home = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState({
//     users: [],
//     departments: [],
//     vendors: [],
//     risks: [],
//   });
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;
//   const loggedInRole = Array.isArray(decoded?.role)
//     ? decoded.role[0]
//     : decoded?.role;
//   const myObject = JSON.parse(localStorage.getItem("myObject") || "{}");
//   const organizationId = myObject?.organization || null;
//   const isSuperAdmin = loggedInRole === "super_admin";

//   const authHeaders = {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       setLoading(true);
//       try {
//         const vendorParams = isSuperAdmin
//           ? {}
//           : { organization: organizationId };

//         const username = "username";
//         const password = "password";
//         const basicToken = btoa(`${username}:${password}`);

//         const [usersRes, deptsRes, vendorsRes, risksRes] = await Promise.all([
//           api.get("/users").catch(() => ({ data: [] })),
//           api.get("/departments").catch(() => ({ data: [] })),
//           axios
//             .get(TPRM_BASE, { headers: authHeaders, params: vendorParams })
//             .catch(() => ({ data: [] })),
//           fetch(ROOT_RISKS_BASE, {
//             headers: {
//               Authorization: `Basic ${basicToken}`,
//               "Content-Type": "application/json",
//             },
//           })
//             .then((res) => res.json())
//             .then((data) => ({ data }))
//             .catch(() => ({ data: [] })),
//         ]);

//         const users = Array.isArray(usersRes.data) ? usersRes.data : [];
//         const depts = Array.isArray(deptsRes.data) ? deptsRes.data : [];
//         const vendors = Array.isArray(vendorsRes.data)
//           ? vendorsRes.data
//           : vendorsRes.data?.content || [];

//         let risks = [];
//         if (risksRes.data?.data) {
//           risks = risksRes.data.data;
//         } else if (Array.isArray(risksRes.data)) {
//           risks = risksRes.data;
//         } else if (risksRes.data?.risks) {
//           risks = risksRes.data.risks;
//         }

//         setData({ users, departments: depts, vendors, risks });
//       } catch (err) {
//         console.error("Dashboard data fetch error", err);
//         setError("Unable to load complete dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   if (loading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="80vh"
//       >
//         <CircularProgress size={50} sx={{ color: "#3b82f6" }} />
//       </Box>
//     );
//   }

//   // Analytics Math
//   const risksByLevel = data.risks.reduce((acc, risk) => {
//     const level = (risk.riskLevel || risk.riskScore || risk.level || "UNKNOWN")
//       .toString()
//       .toUpperCase();
//     acc[level] = (acc[level] || 0) + 1;
//     return acc;
//   }, {});

//   const usersByRole = data.users.reduce((acc, user) => {
//     const roles = Array.isArray(user.role) ? user.role : [user.role || "user"];
//     roles.forEach((r) => {
//       acc[r] = (acc[r] || 0) + 1;
//     });
//     return acc;
//   }, {});

//   // Chart configs
//   const riskBarData = {
//     labels: ["High", "Medium", "Low", "Critical", "Unknown"],
//     datasets: [
//       {
//         label: "Risks",
//         data: [
//           risksByLevel["HIGH"] || 0,
//           risksByLevel["MEDIUM"] || 0,
//           risksByLevel["LOW"] || 0,
//           risksByLevel["CRITICAL"] || 0,
//           risksByLevel["UNKNOWN"] || 0,
//         ],
//         backgroundColor: [
//           "#ef4444",
//           "#f59e0b",
//           "#22c55e",
//           "#7f1d1d",
//           "#94a3b8",
//         ],
//         borderRadius: 6,
//         barThickness: 32,
//         maxBarThickness: 40,
//       },
//     ],
//   };

//   const riskBarOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { display: false },
//       tooltip: {
//         backgroundColor: "#0f172a",
//         titleFont: { family: "Inter, sans-serif", size: 13, weight: 600 },
//         bodyFont: { family: "Inter, sans-serif", size: 13, weight: 500 },
//         padding: 12,
//         cornerRadius: 8,
//         displayColors: false,
//         callbacks: {
//           label: (context) => `Total: ${context.parsed.y} Risks`,
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: { display: false },
//         ticks: {
//           font: { family: "Inter, sans-serif", size: 12 },
//           color: "#64748b",
//         },
//         border: { display: false },
//       },
//       y: {
//         beginAtZero: true,
//         border: { display: false },
//         grid: { color: "#f1f5f9" },
//         ticks: {
//           font: { family: "Inter, sans-serif", size: 12 },
//           color: "#64748b",
//           stepSize: 1,
//           precision: 0,
//         },
//       },
//     },
//   };

//   const sortedRoles = Object.entries(usersByRole)
//     .sort((a, b) => b[1] - a[1])
//     .slice(0, 5);
//   const roleDoughnutData = {
//     labels: sortedRoles.map((i) => i[0].replace("_", " ").toUpperCase()),
//     datasets: [
//       {
//         data: sortedRoles.map((i) => i[1]),
//         backgroundColor: [
//           "#3b82f6",
//           "#8b5cf6",
//           "#ec4899",
//           "#f59e0b",
//           "#10b981",
//         ],
//         borderWidth: 2,
//         borderColor: "#ffffff",
//         hoverOffset: 6,
//       },
//     ],
//   };

//   const roleDoughnutOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: "80%",
//     plugins: {
//       legend: {
//         position: "right",
//         labels: {
//           usePointStyle: true,
//           boxWidth: 8,
//           padding: 24,
//           font: { family: "Inter, sans-serif", weight: 600, size: 12 },
//           color: "#475569",
//         },
//       },
//       tooltip: {
//         backgroundColor: "#0f172a",
//         bodyFont: { family: "Inter, sans-serif", size: 13, weight: 500 },
//         padding: 12,
//         cornerRadius: 8,
//       },
//     },
//   };

//   // Recent Risks (last 5)
//   const recentRisks = [...data.risks].slice(0, 5);

//   return (
//     <Box
//       sx={{
//         p: { xs: 2, md: 4 },
//         backgroundColor: "#ffffff",
//         minHeight: "100%",
//       }}
//     >
//       {/* Header */}
//       <Box sx={{ mb: 4 }}>
//         <Typography
//           variant="h4"
//           sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}
//         >
//           GRC Overview Dashboard
//         </Typography>
//         <Typography variant="body1" sx={{ color: "#64748b", mt: 0.5 }}>
//           Real-time metrics and dynamic monitoring across your enterprise.
//         </Typography>
//       </Box>

//       {/* Metric Cards */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Total Users"
//             value={data.users.length}
//             icon={<GroupIcon />}
//             color="#3b82f6"
//             subtitle="Active accounts within platform"
//             trend="+12%"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Departments"
//             value={data.departments.length}
//             icon={<AccountBalanceIcon />}
//             color="#ec4899"
//             subtitle="Configured logical groupings"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Vendors"
//             value={data.vendors.length}
//             icon={<StorefrontIcon />}
//             color="#8b5cf6"
//             subtitle="Third-party risk partners"
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <DashboardInfoCard
//             title="Active Risks"
//             value={data.risks.length}
//             icon={<WarningAmberIcon />}
//             color="#f59e0b"
//             subtitle="Items across risk register"
//           />
//         </Grid>
//       </Grid>

//       {/* Charts Section */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Risk Distribution Chart */}
//         <Grid item xs={12} md={7}>
//           <Card
//             sx={{
//               borderRadius: "16px",
//               boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//               border: "1px solid #f1f5f9",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             <CardContent
//               sx={{
//                 p: 3,
//                 flexGrow: 1,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}
//               >
//                 Risk Severity Distribution
//               </Typography>
//               <Box sx={{ flexGrow: 1, minHeight: 320, position: "relative" }}>
//                 <Bar data={riskBarData} options={riskBarOptions} />
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* User Roles Chart */}
//         <Grid item xs={12} md={5}>
//           <Card
//             sx={{
//               borderRadius: "16px",
//               boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
//               border: "1px solid #f1f5f9",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//             }}
//           >
//             <CardContent
//               sx={{
//                 p: 3,
//                 flexGrow: 1,
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{ fontWeight: 700, color: "#0f172a", mb: 3 }}
//               >
//                 Top User Roles
//               </Typography>
//               <Box
//                 sx={{
//                   flexGrow: 1,
//                   minHeight: 320,
//                   position: "relative",
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Box sx={{ width: "100%", height: "100%" }}>
//                   <Doughnut
//                     data={roleDoughnutData}
//                     options={roleDoughnutOptions}
//                   />
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Recent Activity Table */}
//       <Card
//         sx={{
//           borderRadius: "16px",
//           boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
//           border: "1px solid #f1f5f9",
//         }}
//       >
//         <CardContent sx={{ p: 0 }}>
//           <Box sx={{ px: 3, pt: 3, pb: 2 }}>
//             <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
//               Recent Actionable Risks
//             </Typography>
//           </Box>
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: "#f8fafc" }}>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Risk ID
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Asset Type
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Department
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Risk Score
//                   </TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: "#475569", py: 2 }}>
//                     Status
//                   </TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {recentRisks.length > 0 ? (
//                   recentRisks.map((risk, index) => (
//                     <TableRow
//                       key={index}
//                       sx={{
//                         "&:last-child td": { border: 0 },
//                         "&:hover": { backgroundColor: "#f8fafc" },
//                       }}
//                     >
//                       <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
//                         {risk.riskId?.slice(-6) || "-"}
//                       </TableCell>
//                       <TableCell sx={{ color: "#475569" }}>
//                         {risk.assetType || "-"}
//                       </TableCell>
//                       <TableCell sx={{ color: "#475569" }}>
//                         {risk.department || "-"}
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>
//                         {risk.riskScore || "-"}
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={risk.status || "N/A"}
//                           size="small"
//                           sx={{
//                             backgroundColor:
//                               risk.status === "Open"
//                                 ? "#fee2e2"
//                                 : risk.status === "Closed"
//                                   ? "#dcfce7"
//                                   : "#f1f5f9",
//                             color:
//                               risk.status === "Open"
//                                 ? "#ef4444"
//                                 : risk.status === "Closed"
//                                   ? "#16a34a"
//                                   : "#64748b",
//                             fontWeight: 600,
//                             borderRadius: "6px",
//                           }}
//                         />
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell
//                       colSpan={5}
//                       align="center"
//                       sx={{ py: 4, color: "#64748b" }}
//                     >
//                       No recent risks found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default Home;



import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import taskService from "../services/taskService";
import Joyride, { STATUS } from "react-joyride";
import {
  BarChart3,
  FileText,
  CheckCircle,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  FolderOpen,
  Users,
  Award,
  HelpCircle,
  PieChartIcon,
  RefreshCw,
  BookOpen,
  UserCheck,
  Send,
  Building2,
  Plus,
  Archive,
  Zap,
  Globe,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import HelpDocModal from "@/components/shared/HelpDocModal";

// ── Logging ───────────────────────────────────────────────────────────────────
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities";

// ── Overdue / Due Soon helpers (derived, not real status values) ──────────────
const DUE_SOON_DAYS = 3;
function isTaskOverdue(t) {
  return !!t.endDate && new Date(t.endDate) < new Date() && t.status !== "Done";
}
function isTaskDueSoon(t) {
  if (!t.endDate || t.status === "Done") return false;
  const diffDays = (new Date(t.endDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= DUE_SOON_DAYS;
}

// NEW: rolling 3-month window, based on task createdAt — used ONLY by the
// Task Distribution pie chart. Everything else (stat cards, bar chart) still
// looks at all-time data via taskStats/allTasks.
const PIE_WINDOW_MONTHS = 3;
function isWithinLastNMonths(dateString, months) {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d >= cutoff;
}

const TaskManagementDashboard = () => {
  const router = useRouter();
  const chartsContainerRef = useRef(null);

  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const [run, setRun] = useState(false);

  const [showHelpDoc, setShowHelpDoc] = useState(false);

  const TASK_HELP_CONTENT = `
## 1. Introduction

The Task Module is the centralized task management workspace in CalVant. Tasks created from Risk, Compliance, Policy, Audit, and other modules are managed here, allowing users to assign, monitor, update, and complete activities from a single location.

## 2. Accessing the Task Module

1. Click the Task icon in the sidebar to land on your Task Dashboard.

### 2.1 How Task Module Integrates with Calvant

The Task Module serves as the execution layer of CalVant. While other modules identify compliance requirements, risks, gaps, policies, audits, and vendor activities, the Task Module enables organizations to assign ownership, track progress, and monitor completion of the actions required to achieve compliance.

Tasks may originate from or support multiple modules, including:

1. **Risk Assessment** – Risk treatment and mitigation activities.
2. **Compliance** – Control implementation and remediation.
3. **Policy** – Policy drafting, review, approval, and periodic review.
4. **TPRM** – Vendor assessments, evidence collection, and follow-up actions.
5. **Audit** – Corrective actions arising from audit findings.

### 2.2 Typical Workflow

Identify Requirement/Risk → Create Task → Assign Owner → Track Progress → Complete Task → Change Task Status → Receive Notification

## 3. Key Terminology

| Term | Definition |
|---|---|
| Assignee | User responsible for completing the task |
| Reporter | User who created the task |

## 4. Manual Navigation

### 4.1 Task Dashboard

![Task Dashboard overview](/Screenshots/Task/task-dashboard.png)

1. Summary tiles display task counts by status.
2. Task Distribution provides an overview of task status.
3. Quick Actions provide access to Manage Tasks and My Tasks.

### 4.2 Action Plan (Manage Tasks)

![Task Manage overview](/Screenshots/Task/task-manage.png)

1. View all tasks across modules.
2. Filter by status, priority and assignee.
3. Search tasks.
4. Select Create Task to add a new task.

### 4.3 Creating a Task

![Task Creation overview](/Screenshots/Task/task-add.png)

1. Select Department and Assignee.
2. Enter the task description.
3. Specify Start Date, End Date and Priority.
4. Add remarks if required.
5. Click Create Task.

### 4.4 My Tasks

![My Task overview](/Screenshots/Task/my-task.png)

1. Displays tasks assigned to the logged-in user.
2. Review task counts by status.
3. Use filters and search to locate tasks quickly.

### 4.5 Task Actions

![Task Actions overview](/Screenshots/Task/task-actions.png)

1. View opens task details.
2. Edit updates task information.
3. Delete permanently removes the task.

### 4.6 Viewing Task Details

![Task Details overview](/Screenshots/Task/task-details.png)

1. Review task status, assignee, reporter and priority.
2. Track history, remarks and work log.
3. View subtasks where available.

## 5. Status Reference

| Status | Meaning |
|---|---|
| To-Do | Task has not been started |
| In Progress | Work is currently underway |
| Done | Task has been completed |
| On Hold | Task is temporarily paused |

## 6. Tips & Best Practices

1. Assign every task to the appropriate department and owner.
2. Use remarks and work logs to record important updates.
3. Review overdue tasks periodically.
  `;

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  // ── Completed / Due Soon / Overdue / In Progress / My Task / Reported Task / Department Task ──
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    onTrack: 0,
    overdue: 0,
    inProgress: 0,
    myTask: 0,
    reportedTask: 0,
    departmentTask: 0,
    orgWideTask: 0,
    archivedTask: 0,
  });
  const [allTasks, setAllTasks] = useState([]);

  // Kept for the header badge / label only — NOT used for task visibility anymore.
  const { isAdmin, userDeptNames, departmentLabel } = useMemo(() => {
    if (!user)
      return { isAdmin: false, userDeptNames: [], departmentLabel: "" };

    const depts = user?.departments || [];
    const names = depts.map((d) => d.name.trim().toLowerCase());

    return {
      isAdmin: isPrivilegedRole,
      userDeptNames: names,
      departmentLabel: isPrivilegedRole
        ? "All"
        : depts.map((d) => d.name).join(", ") ||
        user?.department?.name ||
        "General",
    };
  }, [user, isPrivilegedRole]);

  // NEW: role check for the Department Task card — risk_owner or process_owner only
  // (root alone does NOT qualify unless also holding one of these roles).
  const userRoles = useMemo(
    () => (Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : []),
    [user],
  );
  const canSeeDeptTasks = userRoles.includes("risk_owner") || userRoles.includes("process_owner");
  // NEW: Archive Tasks card — mirrors the archive/bin permission used on the
  // Task Management page (root / super_admin only).
  const canArchive = userRoles.includes("root") || userRoles.includes("super_admin");

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 150);
      }
    });

    if (chartsContainerRef.current) {
      resizeObserver.observe(chartsContainerRef.current);
    }

    return () => {
      if (chartsContainerRef.current) {
        resizeObserver.unobserve(chartsContainerRef.current);
      }
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  // ── Visibility rule: root sees the whole org's tasks; everyone else sees
  // tasks where they are the ASSIGNEE **or** the REPORTER. ──
  const loadTaskStats = useCallback(async () => {
    if (!user) return;

    captureActivity({ action: ACTIONS.VISITED, module: MODULES.TASK, url: "/task-management" });

    try {
      const [tasks, archivedTasks] = await Promise.all([
        taskService.getAllTasks(),
        taskService.getArchivedTasks().catch(() => []),
      ]);
      if (!Array.isArray(tasks)) return;

      const orgTasks = tasks.filter(
        (t) => t.organization === effectiveOrgId,
      );
      const orgArchivedTasks = Array.isArray(archivedTasks)
        ? archivedTasks.filter((t) => t.organization === effectiveOrgId)
        : [];

      const isAssignee = (t) => {
        const emp = t.employee;
        return (
          !!emp &&
          (String(emp) === String(user?._id || user?.id) ||
            emp === user?.name ||
            emp === user?.username)
        );
      };
      const isReporterOf = (t) => {
        const rep = t.reporter;
        return (
          !!rep &&
          (rep === user?.name || rep === user?.username || String(rep) === String(user?._id || user?.id))
        );
      };

      const visibleTasks = isRoot
        ? orgTasks
        : orgTasks.filter((t) => isAssignee(t) || isReporterOf(t));

      setAllTasks(visibleTasks);

      const deptNames = (user?.departments || []).map((d) => (d.name || "").trim().toLowerCase());
      const departmentTaskCount = canSeeDeptTasks
        ? orgTasks.filter(
          (t) => t.department && deptNames.includes(String(t.department).trim().toLowerCase()),
        ).length
        : 0;

      const completedCount = visibleTasks.filter((t) => t.status === "Done").length;
      const overdueCount = visibleTasks.filter(isTaskOverdue).length;
      const onTrackCount = Math.max(0, visibleTasks.length - completedCount - overdueCount);

      setTaskStats({
        total: visibleTasks.length,
        completed: completedCount,
        overdue: overdueCount,
        onTrack: onTrackCount,
        inProgress: visibleTasks.filter((t) => t.status === "In Progress").length,
        myTask: visibleTasks.filter(isAssignee).length,
        reportedTask: visibleTasks.filter(isReporterOf).length,
        departmentTask: departmentTaskCount,
        // Archive is root/super_admin-only, same as the Task Management bin view.
        orgWideTask: isRoot ? orgTasks.length : 0,   // NEW — root only
        archivedTask: canArchive ? orgArchivedTasks.length : 0,
      });
    } catch (error) {
      console.error("Error loading task stats:", error);
    }
  }, [user, isRoot, effectiveOrgId, canSeeDeptTasks, canArchive]);

  useEffect(() => {
    loadTaskStats();
  }, [loadTaskStats]);

  // useEffect(() => {
  //   if (mounted && !user) {
  //     router.push("/");
  //   }
  // }, [mounted, user, router]);

  // if (!mounted || !user) return null;

  // Charts Data Processing
  // const getMonthFromDate = (dateString) => {
  //   if (!dateString) return null;
  //   const date = new Date(dateString);
  //   const monthNames = [
  //     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  //     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  //   ];
  //   return monthNames[date.getMonth()];
  // };

  // // ── NEW: Task Distribution pie chart — restricted to tasks created in the
  // // last 3 months only (per UAT feedback). Stat cards and the Monthly Trends
  // // bar chart are untouched and keep showing all-time data. ──
  // const pieStats = useMemo(() => {
  //   const recentTasks = allTasks.filter((t) =>
  //     isWithinLastNMonths(t.createdAt || t.created_at, PIE_WINDOW_MONTHS),
  //   );
  //   const completed = recentTasks.filter((t) => t.status === "Done").length;
  //   const overdue = recentTasks.filter(isTaskOverdue).length;
  //   const dueSoon = recentTasks.filter(isTaskDueSoon).length;
  //   return {
  //     total: recentTasks.length,
  //     completed,
  //     overdue,
  //     dueSoon,
  //   };
  // }, [allTasks]);

  // // ── Pie: Completed / Overdue / Due Soon / Others (rest of the 3-month total) ──
  // const otherCount = Math.max(
  //   0,
  //   pieStats.total - pieStats.completed - pieStats.overdue - pieStats.dueSoon,
  // );

  useEffect(() => {
    if (mounted && !user) {
      router.push("/");
    }
  }, [mounted, user, router]);

  // ── Task Distribution pie chart — restricted to tasks created in the
  // last 3 months only (per UAT feedback). Stat cards and the Monthly
  // Trends bar chart are untouched and keep showing all-time data.
  // NOTE: this hook MUST stay above the `if (!mounted || !user) return null;`
  // line below it — every hook has to run on every render, or React throws
  // "Rendered more hooks than during the previous render."
  const pieStats = useMemo(() => {
    const recentTasks = allTasks.filter((t) =>
      isWithinLastNMonths(t.createdAt || t.created_at, PIE_WINDOW_MONTHS),
    );
    const completed = recentTasks.filter((t) => t.status === "Done").length;
    const overdue = recentTasks.filter(isTaskOverdue).length;
    const onTrack = Math.max(0, recentTasks.length - completed - overdue);
    return {
      total: recentTasks.length,
      completed,
      overdue,
      onTrack,
    };
  }, [allTasks]);

  if (!mounted || !user) return null;

  // Charts Data Processing
  const getMonthFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return monthNames[date.getMonth()];
  };

  // ── Pie: Completed / Overdue / On Track ──
  const pieData = [
    {
      name: "Completed",
      value: pieStats.completed,
      color: "#10b981",
      desc: `${pieStats.completed} completed tasks`,
    },
    {
      name: "Overdue",
      value: pieStats.overdue,
      color: "#ef4444",
      desc: `${pieStats.overdue} overdue tasks`,
    },
    {
      name: "On Track",
      value: pieStats.onTrack,
      color: "#f59e0b",
      desc: `${pieStats.onTrack} on track tasks`,
    },
  ].filter((d) => d.value > 0);

  const realMonthlyData = allTasks.reduce((acc, task) => {
    const month = getMonthFromDate(task.createdAt || task.created_at);
    if (month) acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const barData = [
    { name: "Jan", value: realMonthlyData.Jan || 0 },
    { name: "Feb", value: realMonthlyData.Feb || 0 },
    { name: "Mar", value: realMonthlyData.Mar || 0 },
    { name: "Apr", value: realMonthlyData.Apr || 0 },
    { name: "May", value: realMonthlyData.May || 0 },
    { name: "Jun", value: realMonthlyData.Jun || 0 },
    { name: "Jul", value: realMonthlyData.Jul || 0 },
    { name: "Aug", value: realMonthlyData.Aug || 0 },
    { name: "Sep", value: realMonthlyData.Sep || 0 },
    { name: "Oct", value: realMonthlyData.Oct || 0 },
    { name: "Nov", value: realMonthlyData.Nov || 0 },
    { name: "Dec", value: realMonthlyData.Dec || 0 },
  ];

  // COMPACT Tooltips
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-[200px]">
          <div className="font-semibold text-slate-800 text-sm mb-1">
            {data.name}
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {data.value}
          </div>
          <div className="text-xs text-slate-600">{data.desc}</div>
          <div className="text-xs text-slate-500 mt-1">
            {((data.value / (pieStats.total || 1)) * 100).toFixed(1)}% of last {PIE_WINDOW_MONTHS} months
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage =
        taskStats.total > 0
          ? ((data.value / taskStats.total) * 100).toFixed(1)
          : 0;

      const monthInfo = {
        Jan: "January", Feb: "February", Mar: "March", Apr: "April",
        May: "May", Jun: "June", Jul: "July", Aug: "August",
        Sep: "September", Oct: "October", Nov: "November", Dec: "December",
      };
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg min-w-[240px] max-h-[200px]">
          <div className="flex items-center gap-2 mb-2 pb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-sm text-slate-900">
              {data.name}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-2">
            {data.value}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="text-slate-600">{monthInfo[data.name]}</div>
            <div className="text-right">
              <span className="font-semibold text-slate-800">
                {percentage}%
              </span>
              <span className="text-slate-500"> of total</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mb-2 bg-slate-50 p-2 rounded">
            <div className="font-medium">How calculated:</div>
            <div className="text-left pl-2">
              •{" "}
              <code className="text-xs bg-blue-100 px-1 rounded">
                createdAt
              </code>{" "}
              in {data.name}
            </div>
            <div className="text-left pl-2">• {departmentLabel} dept only</div>
          </div>
          <div className="text-xs text-slate-400 text-center mt-1 pt-1 border-t border-slate-100">
            🔄 Live database data
          </div>
        </div>
      );
    }
    return null;
  };

  // ── Stat cards, in the requested order:
  // My Task / Reported Task / Department Task / In Progress / Due Soon /
  // Overdue / Done / Archive Tasks — laid out 3 per row, same card format
  // throughout. Done sits right after Overdue, and (with the 3-per-row grid)
  // Done + Archive Tasks land together on the following line.
  // Department Task and Archive Tasks stay permission-gated, same as before.
  const statsCardsBase = [
    {
      Icon: UserCheck,
      value: taskStats.myTask,
      label: "My Tasks",
      color: "from-indigo-400 to-indigo-500",
      filterKey: "myTask",
    },
    {
      Icon: Send,
      value: taskStats.reportedTask,
      label: "Reported Tasks",
      color: "from-pink-400 to-pink-500",
      filterKey: "reportedTask",
    },
    ...(isRoot
      ? [
        {
          Icon: Globe,
          value: taskStats.orgWideTask,
          label: "Orgwide Tasks",
          color: "from-cyan-400 to-cyan-500",
          filterKey: "orgWideTask",
        },
      ]
      : []),
    ...(canSeeDeptTasks
      ? [
        {
          Icon: Building2,
          value: taskStats.departmentTask,
          label: "Department Tasks",
          color: "from-teal-400 to-teal-500",
          filterKey: "departmentTask",
        },
      ]
      : []),
    {
      Icon: Zap,
      value: taskStats.inProgress,
      label: "In Progress",
      color: "from-blue-400 to-blue-500",
      filterKey: "inProgress",
    },
    {
      Icon: Clock,
      value: taskStats.onTrack,
      label: "On Track",
      color: "from-orange-400 to-orange-500",
      filterKey: "onTrack",
    },
    {
      Icon: AlertTriangle,
      value: taskStats.overdue,
      label: "Overdue",
      color: "from-red-400 to-red-500",
      filterKey: "overdue",
    },
    // Done — sits right after Overdue
    {
      Icon: CheckCircle2,
      value: taskStats.completed,
      label: "Done",
      color: "from-emerald-400 to-emerald-500",
      filterKey: "done",
    },
    ...(canArchive
      ? [
        {
          Icon: Archive,
          value: taskStats.archivedTask,
          label: "Archived Tasks",
          color: "from-slate-400 to-slate-500",
          filterKey: "archivedTask",
        },
      ]
      : []),
  ];

  const statsCards = statsCardsBase;

  // Archive quick-action tile removed — Archive is still reachable from the
  // "Archive Tasks" stat card above.
  const actionCards = [
    {
      id: "tasks",
      icon: FileText,
      title: "Manage Tasks",
      subtitle: "All Tasks",
      path: "/task-management/tasks",
      color: "from-violet-400 to-violet-500",
    },
    {
      id: "create",
      icon: Plus,
      title: "Create Task",
      subtitle: "New Task",
      path: "/task-management/tasks?openCreate=true",
      color: "from-emerald-400 to-emerald-500",
      primary: true,
    },
  ];

  const steps = [
    {
      target: "#dashboard-header",
      content: `Welcome to your ${departmentLabel} task management dashboard.`,
    },
    {
      target: "#stats-grid",
      content: "Quick metrics overview at a glance.",
    },
    {
      target: "#charts-container",
      content: "Visual task distribution and trends analysis.",
    },
    {
      target: "#action-cards",
      content: "Quick access to all task management tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-6 pb-20 lg:pb-26 overflow-hidden">
        <Joyride
          steps={steps}
          run={run}
          continuous
          showSkipButton
          scrollToFirstStep
          styles={{ options: { primaryColor: "#3b82f6", width: 300 } }}
          callback={(data) => {
            if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status))
              setRun(false);
          }}
        />

        {/* Header */}
        <motion.header
          id="dashboard-header"
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-2 lg:mb-2 p-4 lg:p-5 !text-left"
          style={{ textAlign: "left", width: "100%", justifyContent: "flex-start", alignItems: "flex-start", justifyItems: "flex-start" }}
          initial={hasMounted ? { opacity: 0, y: -15 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between w-full">

            {/* LEFT SIDE: ICON + TITLE */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Task Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  {departmentLabel} •{" "}
                  <span className="font-bold text-slate-900">
                    {taskStats.total}
                  </span>{" "}
                  total tasks
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: BUTTONS */}
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isAdmin ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                {isAdmin ? "Admin" : "User"}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {user?.name || "User"}
              </span>
              <motion.button
                onClick={() => {
                  captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: "Refresh Dashboard", url: "/task-management" });
                  loadTaskStats();
                }}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                onClick={() => setShowHelpDoc(true)}
                title="Help Documentation"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                onClick={() => {
                  captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: "Open Guide", url: "/task-management" });
                  setRun(false);
                  setTimeout(() => setRun(true), 100);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HelpCircle size={18} />
                <span>Guide</span>
              </motion.button>
            </div>

          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 h-full">
          {/* Left: Stats + Actions */}
          <div className="space-y-8 lg:space-y-10">
            {/* Stats Grid — 3 per row, same card format */}
            <motion.section
              id="stats-grid"
              className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch"
              initial={hasMounted ? { opacity: 0, y: 15 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {statsCards.map(({ Icon, value, label, color, filterKey }, i) => (
                <motion.div
                  key={label}
                  className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-3 h-full min-h-[72px] hover:bg-white"
                  onClick={() => {
                    captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: `Stat Card - ${label}`, url: "/task-management" });
                    // Archive Tasks routes to the bin view, not a ?filter= query.
                    if (filterKey === "archivedTask") {
                      router.push("/task-management/tasks?view=archived");
                      return;
                    }
                    const query = filterKey && filterKey !== "all" ? `?filter=${filterKey}` : "";
                    router.push(`/task-management/tasks${query}`);
                  }}
                  initial={hasMounted ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm flex-shrink-0`}
                  >
                    <Icon
                      size={16}
                      className="text-white drop-shadow-sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-base lg:text-lg font-bold text-slate-800 block leading-none group-hover:text-slate-900 mb-0.5">
                      {value}
                    </span>
                    <span className="text-[10px] lg:text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none block">
                      {label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              id="action-cards"
              className="space-y-1"
              initial={hasMounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-6 px-1">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-15">
                <AnimatePresence>
                  {actionCards.map(
                    (
                      {
                        id,
                        icon: Icon,
                        title,
                        subtitle,
                        path,
                        color,
                        primary,
                        show = true,
                      },
                      index,
                    ) =>
                      show && (
                        <motion.div
                          key={id}
                          className={`group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer ${primary ? "ring-2 ring-emerald-200/50 bg-gradient-to-br " + color : ""}`}
                          initial={hasMounted ? { opacity: 0, scale: 0.9 } : false}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.4 + index * 0.06,
                          }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: `Action Card - ${title}`, url: "/task-management" });
                            router.push(path);
                          }}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md flex-shrink-0 ${primary ? "bg-white/20 backdrop-blur-sm" : `bg-gradient-to-br ${color}`}`}
                          >
                            <Icon
                              size={20}
                              className={`${primary ? "text-white" : "text-white"} drop-shadow-sm`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-sm lg:text-base font-semibold text-center text-slate-800 leading-tight mb-1 px-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                              {title}
                            </h4>
                            <p className="text-xs font-bold text-center text-slate-600 px-1 truncate">
                              {subtitle}
                            </p>
                          </div>
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* Right: Charts */}
          <div
            ref={chartsContainerRef}
            id="charts-container"
            className="space-y-4 lg:space-y-3"
          >
            {/* Pie Chart - Task Distribution (last 3 months only) */}
            {/* Pie Chart - Task Distribution (last 3 months only) */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-80 flex flex-col"
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="mb-1 px-1 flex-shrink-0">
                <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                  Tasks Distribution
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Last {PIE_WINDOW_MONTHS} months
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {pieStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={66}
                        paddingAngle={2}
                        stroke="white"
                        strokeWidth={3}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <text
                        x="50%"
                        y="42%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#475569"
                        fontSize={12}
                        fontWeight={600}
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#111827"
                        fontSize={20}
                        fontWeight={700}
                      >
                        {pieStats.total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <PieChartIcon
                      size={40}
                      className="text-slate-400 mb-4"
                      strokeWidth={1.5}
                    />
                    <p className="text-lg font-semibold text-slate-500 mb-2">
                      No Data
                    </p>
                    <p className="text-sm text-slate-500 max-w-xs">
                      No tasks created in the last {PIE_WINDOW_MONTHS} months
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bar Chart - Monthly Task Creation Trends */}
            <motion.div
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid #f1f5f9",
                borderRadius: "16px",
                padding: "24px",
                height: "288px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                transition: "all 0.4s ease",
              }}
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div style={{ marginBottom: "14px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "4px",
                  }}
                >
                  📈 Monthly Task Creation Trends
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Each bar shows NEW tasks created each month
                </p>
              </div>

              <div style={{ flex: 1 }}>
                {barData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="#f1f5f9"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6b7280",
                          fontWeight: 500,
                        }}
                      />

                      <Tooltip content={<CustomBarTooltip />} />

                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                        {barData.map((entry, index) => (
                          <Cell
                            key={`bar-${index}`}
                            fill={
                              [
                                "#3b82f6",
                                "#60a5fa",
                                "#93c5fd",
                                "#bfdbfe",
                                "#dbeafe",
                                "#eff6ff",
                                "#e0f2fe",
                                "#bae6fd",
                                "#7dd3fc",
                                "#38bdf8",
                                "#0ea5e9",
                                "#0284c7",
                              ][index]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                    }}
                  >
                    <BarChart3
                      size={38}
                      style={{
                        color: "#cbd5f5",
                        marginBottom: "8px",
                      }}
                      strokeWidth={1.5}
                    />

                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    >
                      No Trend Data
                    </p>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      Tasks need date fields for trends
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <HelpDocModal
        open={showHelpDoc}
        onClose={() => setShowHelpDoc(false)}
        title="Task Management Help"
        content={TASK_HELP_CONTENT}
      />

      {/* Professional Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-6 py-4 lg:px-8 lg:py-5 sticky bottom-0 z-0">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm lg:text-base text-slate-600 font-medium">
            © {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TaskManagementDashboard;
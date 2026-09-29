# Reports Module — v5 Migration Guide

## What changed

### Navigation: Sidebar → Header Dropdown

The left sidebar listing "schedules" has been **replaced** with a compact
dropdown in the header. The dropdown shows all dashboards for the org,
lets you switch between them, edit any of them, and create new ones —
all without leaving the page or re-routing.

**Old:**
```
<aside>  ← sticky 224px sidebar with ScheduleItem list
  ReportsDashboard renders ScheduleItem per config
</aside>
```

**New:**
```
<DashboardDropdown>  ← header-inline dropdown, max-w-[260px]
  Shows all dashboards, active indicator, edit pencil per item
  Bottom CTA: "+ New Dashboard"
</DashboardDropdown>
```

No component in the old sidebar is reused. Delete `ScheduleItem` from
your codebase.

---

### New Dashboard Flow (NewDashboardModal)

Previously, "New schedule" opened `ReportConfigModal` (schedule settings
only). Now it opens `NewDashboardModal` — a 2-step modal:

1. **Name** — free-text input, Enter to advance
2. **Sharing** — Me / All members / Custom (comma-separated emails)

The sharing value is sent as `sharing` + `sharedWith` fields in the POST
payload. Your Spring Boot `ReportConfig` model will need these fields or
they will be silently ignored.

---

### Panel Builder: CustomDashboardModal → PanelBuilderModal

`CustomDashboardModal` is replaced by `PanelBuilderModal`. Key differences:

| Feature | Old | New |
|---|---|---|
| Component categories | Flat list | KPI group + Chart group |
| Target Meter | ❌ | ✅ `TargetMeter` component |
| Duration field | ❌ | ✅ dropdown for x-axis date field |
| Benchmark lines | ❌ | ✅ add N reference lines on trend charts |
| Panel gallery | same 5 templates | same 5 templates (unchanged) |

**Prop contract** is the same:
```js
onSave({ panel, isEdit, originalPanelId })
onAppendTemplate(panels[])
```

---

### Panel Card Actions (DashboardEngine v5)

Each panel now has a hover action bar with 5 buttons:

| Button | Behaviour |
|---|---|
| ✎ Edit | Opens `PanelBuilderModal` pre-filled |
| ⎘ Clone | Duplicates panel with `(Copy)` suffix, appends to view |
| ⛶ Fullscreen | Renders panel in a centered modal overlay |
| 🖨 Print | Opens a new window with the panel HTML and calls `window.print()` |
| 🗑 Delete | Removes panel from the view with confirmation-free immediate delete |

---

### New Component: TargetMeter

A progress-bar widget that shows current value vs a user-defined target.

**Props (via kpiConfig):**
```js
{
  componentType: "TargetMeter",
  title: "Tasks · Completion",
  color: "emerald",             // Tailwind colour token
  props: {
    extractor: "tasks.total",
    target: 100,                // the 100% / goal value
  }
}
```

**Renders:** animated progress bar, `currentValue / target`, percentage
badge (colour-coded by proximity: emerald ≥100%, indigo ≥75%, amber ≥50%,
rose <50%), optional comparison period bar underneath.

Register: already added to `kpiRegistry.js`.

---

### TrendLineChart v2 — Benchmark Reference Lines

Pass `benchmarks` in `props` to render dashed `ReferenceLine` elements:

```js
props: {
  series: [...],
  benchmarks: [
    { value: 50,  label: "Target",  color: "#10b981" },
    { value: 100, label: "Maximum", color: "#ef4444" },
  ]
}
```

Benchmarks are stored in the `panel.props.benchmarks` array and forwarded
to `TrendLineChart` / `TrendBarChart`.

---

## File map

```
reports/
  pages/
    ReportsDashboard.jsx      ← REPLACED (v5)
  components/
    DashboardEngine.jsx       ← REPLACED (v5)
    PanelBuilderModal.jsx     ← NEW (replaces CustomDashboardModal.js)
    NewDashboardModal.jsx     ← NEW
    TargetMeter.jsx           ← NEW
    TrendLineChart.jsx        ← UPDATED (v2 — benchmarks)
    kpiRegistry.js            ← UPDATED (adds TargetMeter)
    
    -- unchanged files (copy from original zip) --
    StatCard.js
    TrendAreaChart.js
    TrendBarChart.js
    DonutStatusChart.js
    ScoreGauge.js
    ChartShell.js
    dataExtractors.js
    dashboardSchema.js
    ComparisonBar.js
    FilterBar.js
    ReportConfigModal.js
    
  -- unchanged hooks (copy from original) --
  hooks/
    useDashboardData.js
    useDashboardExport.js
```

---

## Backend changes needed

### `ReportConfig` model

Add optional fields (nullable / ignored if absent):

```java
private String sharing;          // "me" | "all" | "custom"
private List<String> sharedWith; // email list for "custom"
```

No other backend changes are required for the core rewrite. The
`/config`, `/config/:id/views`, `/results`, `/stream` and `/sources`
endpoints are all called identically to v4.

---

## Unchanged

- `useDashboardData` — no changes
- `useDashboardExport` — no changes
- `ComparisonBar`, `FilterBar`, `ReportConfigModal` — no changes
- `ChartShell`, `StatCard`, `DonutStatusChart`, `ScoreGauge` — no changes
- `dataExtractors`, `dashboardSchema` — no changes
- Backend Spring Boot services — no changes (except optional sharing fields)
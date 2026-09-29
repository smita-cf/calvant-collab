"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  FileText,
  ClipboardCheck,
  ListChecks,
  ShieldCheck,
  Handshake,
  FileSearch,
  Search,
  ArrowRight,
  ArrowLeft,
  Grid,
  Layers,
  HelpCircle,
  Clock,
  Shield,
  Lock,
  Cpu,
  Award
} from "lucide-react";

const ICONS = {
  ShieldAlert,
  FileText,
  ClipboardCheck,
  ListChecks,
  ShieldCheck,
  Handshake,
  FileSearch,
};

const HelpCenterHome = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState("menu"); // "menu", "modules", "infosec_modules", "framework", "coming_soon"
  const [previousView, setPreviousView] = useState("menu");

  const navigateTo = (view) => {
    setPreviousView(activeView);
    setActiveView(view);
  };
  const [modules, setModules] = useState([]);
  const [infosecModules, setInfosecModules] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Check for query parameters to set initial view
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get("view");
      if (viewParam) {
        setActiveView(viewParam);
      }
    }

    fetch("/docs/help-manifest.json")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setModules(data.modules || []);
          setInfosecModules(data.infosecModules || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModules([]);
          setInfosecModules([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeModules = activeView === "infosec_modules" ? infosecModules : modules;
  const filtered = activeModules.filter((m) =>
    (m.title + " " + m.description).toLowerCase().includes(query.toLowerCase())
  );

  const renderHeader = (title, subtitle) => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-14 sm:py-16 relative">
      {activeView !== "menu" && (
        <button
          onClick={() => setActiveView("menu")}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 hover:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-700"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>
      )}
      <div className="max-w-3xl mx-auto text-center mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {title}
        </h1>
        <p className="text-slate-300 mt-2 text-sm sm:text-base">
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (activeView === "coming_soon") {
    return (
      <div className="min-h-screen bg-slate-50">
        {renderHeader("Coming Soon", "We are currently working on this section.")}
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Please wait, updation is being done</h2>
          <p className="text-slate-500">
            This section is currently under development. Check back later!
          </p>
          <button
            onClick={() => setActiveView(previousView)}
            className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Return to {previousView === "framework" ? "Frameworks" : "Help Center"}
          </button>
        </div>
      </div>
    );
  }

  if (activeView === "framework") {
    return (
      <div className="min-h-screen bg-slate-50">
        {renderHeader("Frameworks", "Select a Framework to proceed")}

        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveView("infosec_modules")}
              className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">ISO/IEC 27001:2022</h2>
              <p className="text-slate-500 text-sm">Information Security frameworks and standards</p>
            </button>

            <button
              onClick={() => navigateTo("coming_soon")}
              className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">ISO/IEC 27701</h2>
              <p className="text-slate-500 text-sm">Data privacy regulations and guidelines</p>
            </button>

            <button
              onClick={() => navigateTo("coming_soon")}
              className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">ISO/IEC 42001:2023</h2>
              <p className="text-slate-500 text-sm">Artificial Intelligence governance and compliance</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "infosec_modules") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-14 sm:py-16 relative">
          <button
            onClick={() => setActiveView("framework")}
            className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 hover:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-700"
          >
            <ArrowLeft size={16} />
            Back to Frameworks
          </button>
          <div className="max-w-3xl mx-auto text-center mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              ISO/IEC 27001:2022 Implementation Roadmap
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Follow these sequential steps to achieve full ISO/IEC 27001:2022 compliance.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-12 py-4 space-y-10">
            {/* Start Node */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-[3px] border-slate-50"></div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs -mt-1">Start</h3>
            </div>

            {/* Modules Timeline Mapping */}
            {infosecModules.map((mod, index) => {
              const Icon = ICONS[mod.icon] || FileText;
              return (
                <div
                  key={mod.slug}
                  className="relative pl-8 md:pl-12 group cursor-pointer"
                  onClick={() => {
                    if (!mod.file) {
                      navigateTo("coming_soon");
                    } else {
                      router.push(`/help-center/${mod.slug}`);
                    }
                  }}
                >
                  <div className="absolute -left-[11px] top-4 w-5 h-5 rounded-full bg-white border-[3px] border-blue-500 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300 shadow-sm"></div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${mod.color}1A` }}>
                        <Icon size={24} style={{ color: mod.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-slate-400">STEP {index + 1}</span>
                          <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {mod.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                          View details
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Certifications Node */}
            <div className="relative pl-8 md:pl-12 group cursor-default">
              <div className="absolute -left-[13px] top-4 w-6 h-6 rounded-full bg-green-500 border-4 border-slate-50 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-100/50 rounded-2xl border-2 border-green-400 p-5 md:p-6 shadow-[0_0_25px_rgba(34,197,94,0.25)] hover:shadow-[0_0_35px_rgba(34,197,94,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40">
                    <Award size={28} className="text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mt-0.5">Certifications</h3>
                    <p className="text-sm font-semibold text-green-700/80 mt-1">Official ISO/IEC 27001:2022 Compliance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* End Node */}
            <div className="relative pl-8 md:pl-12">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300 border-[3px] border-slate-50"></div>
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs -mt-1">End</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "modules") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-14 sm:py-16 relative">
          <button
            onClick={() => setActiveView("menu")}
            className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 hover:bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-700"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>
          <div className="max-w-3xl mx-auto text-center mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Module Guides
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Browse the knowledge base for guides on every CalVant module.
            </p>
            <div className="mt-6 relative max-w-xl mx-auto">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a module…"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Knowledge base</h2>
          {loading && (
            <div className="text-sm text-slate-400">Loading modules…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-slate-400">
              No modules match "{query}".
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mod) => {
              const Icon = ICONS[mod.icon] || FileText;
              return (
                <button
                  key={mod.slug}
                  onClick={() => {
                    if (!mod.file) {
                      navigateTo("coming_soon");
                    } else {
                      router.push(`/help-center/${mod.slug}`);
                    }
                  }}
                  className="text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${mod.color}1A` }}
                  >
                    <Icon size={18} style={{ color: mod.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {mod.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                    Learn more
                    <ArrowRight
                      size={12}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default Main Menu View
  return (
    <div className="min-h-screen bg-slate-50">
      {renderHeader("How can we help you today?", "Select an area you need assistance with")}

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveView("modules")}
            className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Grid size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Modules</h2>
            <p className="text-slate-500 text-sm mb-6">Guides and documentation for all CalVant platform modules</p>
            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
              Browse Modules
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setActiveView("framework")}
            className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Framework</h2>
            <p className="text-slate-500 text-sm mb-6">Explore Infosec, Privacy, and AI compliance frameworks</p>
            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Explore Frameworks
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigateTo("coming_soon")}
            className="text-left bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">FAQ</h2>
            <p className="text-slate-500 text-sm mb-6">Frequently asked questions and general platform support</p>
            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
              View FAQs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterHome;

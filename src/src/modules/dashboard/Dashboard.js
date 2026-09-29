import React from "react";
import { useHistory } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Activity,
  LogIn,
  UserCircle2,
  Lock,
} from "lucide-react";

const tiles = [
  {
    label: "Risk Management",
    route: "/risk-assessment",
    description:
      "Identify, analyze, and manage organizational risks effectively.",
    icon: <ShieldCheck className="w-12 h-12 text-indigo-600" />,
  },
  {
    label: "Documentation",
    route: "/documentation",
    description:
      "Maintain compliance with policy, control, and evidence documentation.",
    icon: <FileText className="w-12 h-12 text-indigo-600" />,
  },
  {
    label: "Gap Assessment",
    route: "/gap-assessment",
    description: "Evaluate gaps and enhance your ISMS controls continuously.",
    icon: <Activity className="w-12 h-12 text-indigo-600" />,
  },
];

// const whyChooseItems = [
//   {
//     icon: "🛡️",
//     title: "Real-time Protection",
//     desc: "Get alerts and insights instantly to prevent risks and breaches.",
//   },
//   {
//     icon: "🔒",
//     title: "Data Privacy First",
//     desc: "We ensure your business data stays encrypted and secure.",
//   },
//   {
//     icon: "📊",
//     title: "Smart Analytics",
//     desc: "Track risk trends and make informed decisions with AI-driven insights.",
//   },
//   {
//     icon: "👥",
//     title: "Team Collaboration",
//     desc: "Assign risks, manage tasks, and work together in real-time.",
//   },
// ];

const Dashboard = () => {
  const history = useHistory();
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Signed-in user view
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900">
        {/* HEADER */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 ml-16 md:ml-0">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                SAFESPHERE
              </h1>
            </div>
          </div>

          {/* USER CARD */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full shadow-sm border border-indigo-100">
            <UserCircle2 className="text-indigo-600 w-5 h-5" />
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-gray-800">
                {user.name || "User"}
              </span>
              <span className="text-xs text-gray-500">
                {user.role || "Consultant"}
              </span>
            </div>
            <button
              onClick={() =>
                (window.location.href =
                  "https://main.d1jl1790poryf2.amplifyapp.com/change-password")
              }
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition text-sm font-medium"
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center px-6 py-16 md:py-24">
          {/* New Welcome heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            Welcome to SafeSphere
          </h2>

          {/* Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mb-12">
            {tiles.map(({ label, route, description, icon }) => (
              <div
                key={label}
                className="group relative bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => history.push(route)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") history.push(route);
                }}
              >
                <div className="p-8 flex flex-col items-center text-center relative z-10">
                  <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">
                    {label}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          {/* New Section for Signed-in User */}
          <section className="text-center w-full max-w-6xl">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Secure your business with SafeSphere
            </h3>
            <p className="text-sm md:text-base text-gray-700 mb-10 max-w-xl mx-auto">
              Identify, analyze, and manage cybersecurity risks with ease using
              SafeSphere.
            </p>

            {/* Why Choose Section
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseItems.map(({ icon, title, desc }, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-indigo-100"
                >
                  <div className="text-4xl mb-3">{icon}</div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div> */}
          </section>
        </main>

        {/* FOOTER */}
        <footer className="py-4 text-center text-xs md:text-sm text-gray-500 border-t bg-white">
          © {new Date().getFullYear()} SAFESPHERE · All rights reserved
        </footer>
      </div>
    );
  }

  // Non logged-in user view (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900">
      {/* HEADER */}
      <header className="px-6 md:px-12 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4 ml-16 md:ml-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              SAFESPHERE
            </h1>
            <p className="text-xs md:text-sm text-gray-500 hidden md:block">
              Secure Your Business with Confidence
            </p>
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <div>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2.5 rounded-full hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            onClick={() => history.push("/login")}
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="text-center py-12 md:py-20 px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Secure Your Business with{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            SafeSphere
          </span>
        </h2>
        <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          SafeSphere helps you identify, analyze, and manage cybersecurity
          risks. Stay one step ahead of threats.
        </p>
        <button
          onClick={() => history.push("/login")}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Get Started
        </button>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-12 px-6 bg-white/50">
        {/* <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">
          Why Choose SafeSphere?
        </h3> */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {whyChooseItems.map(({ icon, title, desc }, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-indigo-100"
            >
              <div className="text-3xl md:text-4xl mb-3">{icon}</div>
              <h4 className="font-semibold text-base md:text-lg text-gray-800 mb-2">{title}</h4>
              <p className="text-xs md:text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div> */}
      </section>

      {/* KEY FEATURES SECTION */}
      <section className="py-12 px-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">
          Explore Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiles.map(({ label, route, description, icon }) => (
            <div
              key={label}
              className="group relative bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden opacity-60 cursor-not-allowed"
              role="presentation"
            >
              <div className="p-8 flex flex-col items-center text-center relative z-10">
                <div className="mb-5 transform group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">
                  {label}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-blue-100 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center">
        <h3 className="text-2xl md:text-2xl font-bold mb-4">
          Ready to safeguard your business?
        </h3>
        <p className="text-sm md:text-lg mb-4 opacity-90">
          Sign up now and get started with SafeSphere today.
        </p>
        <button
          onClick={() => history.push("/login")}
          className="bg-white text-indigo-600 px-3 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
        >
          Sign Up
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-4 text-center text-xs md:text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} SAFESPHERE · All rights reserved · Made in
        India
      </footer>
    </div>
  );
};

export default Dashboard;

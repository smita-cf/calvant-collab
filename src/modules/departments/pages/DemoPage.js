"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./DemoPage.css";
import Modal from "../../../components/navigations/Modal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
const DemoPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    organization: "",
    employees: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/login");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.organization || !form.employees) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      !form.email.includes("@") ||
      form.email.includes("@gmail") ||
      form.email.includes("@yahoo") ||
      form.email.includes("@hotmail")
    ) {
      setError("Please enter a valid work email.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const username = "username";
      const password = "password";
      const basicAuth = btoa(`${username}:${password}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SP}/email-service/demo-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            organization: form.organization,
            employees: form.employees,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Email service failed");
      }

      // 3️⃣ Success
      setIsModalOpen(true);
      console.log("Form submitted successfully:", form);
    } catch (err) {
      console.error(err);
      setError("Failed to send email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="demo-page">
      <Modal
        isOpen={isModalOpen}
        title="Success"
        message="Thank you for your demo request! Our team will contact you shortly."
        onClose={handleCloseModal}
      />

      <main className="demo-main">
        <section className="demo-left">
          <div className="demo-left-inner">
            <div className="demo-badge">Digital Compliance Management Simplified</div>

            <h1 className="demo-title">
              Schedule
              <br />a Live Demo
            </h1>
            <p className="demo-subtitle">
              See how CalVant unifies risk, documentation, and compliance into a
              single 3D command center for your security team.
            </p>

            <div className="demo-highlights">
              <span>
                <strong>Guided walkthrough</strong> of your use case
              </span>
              <span>
                <strong>Real-time dashboards</strong> with risk scoring
              </span>
              <span>
                <strong>Cyber Security</strong>
              </span>
              <span>
                <strong>Information security</strong>
              </span>
               <span>
                <strong>Data privacy</strong>
              </span>
              <span>
                <strong>Artificial Intelligence</strong>
              </span>
              <span>
                <strong>Regional / Statutory / Regulatory Requirements</strong>
              </span>

              <span>
                <strong>Personalized demo</strong> tailored to your needs
              </span>
            </div>

            <div className="demo-orbit demo-orbit-main">
              <div className="demo-orbit-sphere" />
              <div className="demo-orbit-ring" />
            </div>

            <div className="demo-trust">
              <div className="demo-trust-item">
                <div className="demo-trust-number">100%</div>
                <div>Compliance-Ready</div>
              </div>
              <div className="demo-trust-item">
                <div className="demo-trust-number">99.9%</div>
                <div>Uptime SLA</div>
              </div>
              <div className="demo-trust-item">
                <div className="demo-trust-number">5+</div>
                <div>Countries</div>
              </div>
            </div>
          </div>
        </section>

        <section className="demo-right">
          <div className="demo-form-card">
            <div className="demo-form-header">
              <h2 className="demo-form-title">Tell us about your team</h2>
              <p className="demo-form-subtitle">
                Share a few details and we will match you with a product expert.
                Takes 30 seconds.
              </p>
            </div>

            {error && <div className="demo-error">{error}</div>}
            <form onSubmit={handleSubmit} className="demo-form">
              <div className="demo-field-group">
                <label className="demo-label">
                  Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="demo-input"
                  placeholder="Please Enter your full name."
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="demo-field-group">
                <label className="demo-label">
                  Phone Number <span>*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  className="demo-input"
                  placeholder="Please enter your contact number with region code ."
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="demo-field-group">
                <label className="demo-label">
                  Work email <span>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="demo-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="demo-field-group">
                <label className="demo-label">
                  Organization <span>*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  className="demo-input"
                  placeholder="Company or institution"
                  value={form.organization}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="demo-field-group">
                <label className="demo-label">
                  Number of employees <span>*</span>
                </label>
                <select
                  name="employees"
                  className="demo-input demo-select"
                  value={form.employees}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a range</option>
                  <option value="1-50">1 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="501-1000">501 – 1,000</option>
                  <option value="1000+">1,000+</option>
                </select>
              </div>

              <button
                type="submit"
                className="demo-submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Request Demo"}
              </button>

              <p className="demo-legal">
                CalVant is built for security, risk and compliance teams. By
                submitting this form you agree to be contacted about our product
                and services.
              </p>

              {/* ✅ ATTRACTIVE FOOTER ENHANCEMENT */}
              <div className="demo-footer-enhance">
                <div className="demo-stats-row">
                  <div className="demo-stat">
                    <div className="demo-stat-number">24/7</div>
                    <div>Support</div>
                  </div>
                  <div className="demo-stat">
                    <div className="demo-stat-number">60 minutes</div>
                    <div>Response</div>
                  </div>
                  <div className="demo-stat">
                    <div className="demo-stat-number">Free</div>
                    <div>Trial</div>
                  </div>
                </div>
              </div>
            </form>

            <div className="demo-orbit demo-orbit-right">
              <div className="demo-orbit-sphere-right" />
              <div className="demo-orbit-ring-right" />
            </div>
          </div>
        </section>
      </main>
    </div>
      <SiteFooter />
    </>
  );
};

export default DemoPage;
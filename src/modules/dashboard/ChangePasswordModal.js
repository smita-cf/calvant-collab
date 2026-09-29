import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock } from "lucide-react";
import API from "./api";

export default function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");
      const org = sessionStorage.getItem("user"); // Get org from storage
      const region = sessionStorage.getItem("region"); // Get region from storage

      if (!token) {
        setMessage("❌ You are not authenticated.");
        setLoading(false);
        return;
      }

      // Add the headers your backend middleware requires
      const res = await API.post("/change-password", {
        oldPassword,
        newPassword,
      });

      setMessage("✅ Password changed successfully! Logging you in...");
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setMessage(
        `❌ ${
          err.response?.data?.error ||
          err.message ||
          "Failed to change password"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {!success && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
          >
            ✕
          </button>
        )}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-600">
          <Lock className="w-6 h-6" /> Change Password
        </h2>

        {message && (
          <p
            className={`text-center mb-4 font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {!success && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

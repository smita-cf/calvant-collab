"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { Lock, Loader2 } from "lucide-react";
import Modal from "../../../components/navigations/Modal"; // <-- move to top

const ChangePasswordPage = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });

  const router = useRouter();
  const query = new URLSearchParams(usePathname().search);
  const showModal = (title, message, onClose) => {
    setModal({ isOpen: true, title, message, onClose });
  };

  const closeModal = () => {
    if (modal.onClose) modal.onClose();
    setModal({ ...modal, isOpen: false, onClose: null });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return showModal("Error", "Passwords do not match");
    }

    const resetToken = sessionStorage.getItem("resetToken");
    if (!resetToken) {
      return showModal(
        "Error",
        "Reset token missing. Please retry OTP verification.",
      );
    }

    const maxRetries = 5;
    const retryDelay = 500; // ms

    setLoading(true);

    let attempt = 0;
    let success = false;
    let lastError = "Failed to reset password";

    while (attempt < maxRetries && !success) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_CFTB}/user-service/api/users/reset-password`,
          {
            resetToken,
            newPassword,
          },
          { withCredentials: true },
        );

        success = true;

        sessionStorage.removeItem("resetToken");

        showModal(
          "Success",
          "Password changed successfully! You can now login.",
          () => router.push("/login"),
        );
      } catch (err) {
        lastError =
          err.response?.data?.error ||
          err.response?.data ||
          "Failed to reset password";

        // ⛔ stop retrying for real errors
        if (err.response?.status === 400 || err.response?.status === 404) {
          break;
        }

        // wait before retry
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        attempt++;
      }
    }

    if (!success) {
      showModal("Error", lastError);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-md">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Change Your Password
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter and confirm your new password
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-gray-700 font-medium">New Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-blue-500 outline-none transition"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 
                         focus:ring-blue-500 outline-none transition"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 
                       rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1500,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 8,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 12 }}>{modal.title}</h3>
            <p style={{ marginBottom: 20 }}>{modal.message}</p>
            <button
              onClick={closeModal}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordPage;


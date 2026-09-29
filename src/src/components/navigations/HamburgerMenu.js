import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Home, FolderKanban, FileText, TrendingUp, LogOut } from "lucide-react";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    sessionStorage.clear();
    history.push(""); // adjust if login path differs
    closeMenu();
  };

  const handleNavigation = (path, state = null) => {
    if (state) {
      history.push(path, state);
    } else {
      history.push(path);
    }
    closeMenu();
  };

  const iconStyle = { marginRight: 10, verticalAlign: "middle" };

  return (
    <>
      {!isOpen && (
        <button
          style={{
            position: "fixed",
            top: 20,
            left: 5,
            zIndex: 1001,
            width: 50,
            height: 50,
            backgroundColor: "#007bff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease",
          }}
          onClick={toggleMenu}
          aria-label="Open menu"
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span
            style={{
              width: 25,
              height: 3,
              backgroundColor: "white",
              borderRadius: 1.5,
              transition: "all 0.3s ease",
            }}
          />
          <span
            style={{
              width: 25,
              height: 3,
              backgroundColor: "white",
              borderRadius: 1.5,
              transition: "all 0.3s ease",
            }}
          />
          <span
            style={{
              width: 25,
              height: 3,
              backgroundColor: "white",
              borderRadius: 1.5,
              transition: "all 0.3s ease",
            }}
          />
        </button>
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: isOpen ? "block" : "none",
          zIndex: 998,
        }}
        onClick={closeMenu}
      ></div>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : -300,
          width: 280,
          height: "100vh",
          backgroundColor: "white",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          transition: "left 0.3s ease",
          zIndex: 1000,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "#007bff",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18 }}>SafeSphere</h3>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
              padding: 0,
              width: 30,
              height: 30,
            }}
            onClick={closeMenu}
            title="Close menu"
          >
            &times;
          </button>
        </div>

        {/* HOME */}
        <div
          style={{
            display: "block",
            padding: "15px 20px",
            color: "#333",
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer",
            borderBottom: "1px solid #eee",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => handleNavigation("/")}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          <Home style={iconStyle} size={18} /> Home
        </div>

        <div style={{ padding: "5px 0", flexGrow: 1 }}>
          <div
            style={{
              display: "block",
              padding: "15px 20px",
              color: "#333",
              textDecoration: "none",
              fontWeight: 500,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => handleNavigation("/risk-assessment/")}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#f8f9fa")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <FolderKanban style={iconStyle} size={18} /> Risk Management
          </div>

          <div
            style={{
              display: "block",
              padding: "15px 20px",
              color: "#333",
              textDecoration: "none",
              fontWeight: 500,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => handleNavigation("/documentation")}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#f8f9fa")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <FileText style={iconStyle} size={18} /> Documentation
          </div>

          <div
            style={{
              display: "block",
              padding: "15px 20px",
              color: "#333",
              textDecoration: "none",
              fontWeight: 500,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => handleNavigation("/gap-assessment")}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#f8f9fa")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <TrendingUp style={iconStyle} size={18} /> Gap Assessment
          </div>

          {user && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 20px",
                borderTop: "1px solid #eee",
                color: "#007bff",
                fontWeight: 600,
              }}
            >
              <div>
                {user.name},{" "}
                {user.department?.name ? user.department.name : user.role}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  marginTop: 6,
                  padding: "6px 14px",
                  fontWeight: 600,
                  borderRadius: 20,
                  border: "none",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "0 3px 8px rgba(231,76,60,0.4)",
                  transition: "background-color 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#c0392b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e74c3c")
                }
                title="Logout"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default HamburgerMenu;

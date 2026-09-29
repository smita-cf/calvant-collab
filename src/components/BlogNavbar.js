import Link from 'next/link';
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const BlogNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!sessionStorage.getItem("user"));
    }
    
  }, []);

  const isActive = (path) => {
    if (path === "/blog") return pathname.startsWith("/blog");
    return pathname === path;
  };

  return (
    <header className="blog-header">
      <div className="blog-header-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: "10px 0 auto",
          }}
        >
          <Image
            src="/CalVant Logo.svg"
            alt="CalVant"
            width={180}
            height={60}
            style={{
              height: isMobile ? "30px" : "60px",
              width: "auto",
              transform: isMobile ? "scale(3.9)" : "scale(2.9)",
              transformOrigin: "center",
              cursor: "pointer",
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(3.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(3.5)";
            }}
            onClick={() => router.push("/")}
          />
        </div>
        <nav className="blog-nav">
          <button
            className="blog-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul className={`blog-nav-list ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <Link
                href="/"
                className={isActive("/") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={isActive("/about") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className={isActive("/blog") ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </li>
            {!isLoggedIn && (
              <li>
                <Link
                  href="/login"
                  className="blog-login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default BlogNavbar;



import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinkClasses = (path) =>
    `text-gray-100 hover:text-white block w-full transition-all duration-150 font-semibold hover:text-opacity-90`;

  return (
    <nav className="bg-gradient-to-r from-[#0c4a6e] to-[#1e40af] sticky top-0 z-50 shadow-md relative overflow-hidden">
      {/* Tech-themed background overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:10px_10px] animate-[patternMove_20s_linear_infinite]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Brand with tech animation */}
          <Link
            to={token ? (isAdmin ? "/admin" : "/dashboard") : "/"}
            className="text-2xl font-bold text-white hover:text-gray-100 transition-colors duration-200 relative group"
          >
            <span className="relative z-10">ExcelAnalyzer</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!token ? (
              <>
                <Link to="/login" className={navLinkClasses("/login")}>
                  Login
                </Link>
                <Link to="/register" className={navLinkClasses("/register")}>
                  Register
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin" className={navLinkClasses("/admin")}>
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white font-bold hover:text-red-300 transition-all duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkClasses("/dashboard")}>
                  Dashboard
                </Link>
                <Link to="/upload" className={navLinkClasses("/upload")}>
                  Upload
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white font-bold hover:text-red-300 transition-all duration-150"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute z-10 right-1 bg-white shadow-lg rounded-md px-4 pt-2 pb-4 space-y-2 transition-all duration-200 border border-gray-200">
          {!token ? (
            <>
              <Link to="/login" className="text-[#0c4a6e] font-semibold block py-2 hover:text-[#1e40af] transition-colors duration-200">
                Login
              </Link>
              <Link to="/register" className="text-[#0c4a6e] font-semibold block py-2 hover:text-[#1e40af] transition-colors duration-200">
                Register
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link to="/admin" className="text-[#0c4a6e] font-semibold block py-2 hover:text-[#1e40af] transition-colors duration-200">
                Admin Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block text-left w-full text-red-600 font-bold hover:text-red-700 transition-all duration-150 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-[#0c4a6e] font-semibold block py-2 hover:text-[#1e40af] transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/upload" className="text-[#0c4a6e] font-semibold block py-2 hover:text-[#1e40af] transition-colors duration-200">
                Upload
              </Link>
              <button
                onClick={handleLogout}
                className="block text-left w-full text-red-600 font-bold hover:text-red-700 transition-all duration-150 py-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect, useRef, useContext } from "react";
import { assets } from "../assets/assets_frontend/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 px-4 md:px-10">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-20 sm:w-32 md:w-40 lg:w-44 cursor-pointer"
      />

      {/* Desktop Nav Links */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "py-1 border-b-2 border-primary"
              : "py-1 hover:border-b-2 hover:border-gray-300"
          }
        >
          <li>HOME</li>
        </NavLink>
        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            isActive
              ? "py-1 border-b-2 border-primary"
              : "py-1 hover:border-b-2 hover:border-gray-300"
          }
        >
          <li>ALL DOCTORS</li>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive
              ? "py-1 border-b-2 border-primary"
              : "py-1 hover:border-b-2 hover:border-gray-300"
          }
        >
          <li>ABOUT</li>
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive
              ? "py-1 border-b-2 border-primary"
              : "py-1 hover:border-b-2 hover:border-gray-300"
          }
        >
          <li>CONTACT</li>
        </NavLink>
      </ul>

      {/* Right Section (user or login) */}
      <div className="flex items-center gap-4 relative">
        {/* Admin/Doctor Login Button */}
        <a
          href="http://localhost:5174/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-block bg-gradient-to-r from-primary to-blue-500 text-white px-4 py-2 rounded-full font-medium shadow hover:from-blue-500 hover:to-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Admin/Doctor
        </a>
        {/* End Admin/Doctor Login Button */}
        {token && userData ? (
          <div ref={dropdownRef} className="flex items-center gap-2 relative">
            <img className="w-8 rounded-full" src={userData.image} alt="Profile" />
            <img
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-2.5 cursor-pointer"
              src={assets.dropdown_icon}
              alt="Dropdown"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-10 right-0 bg-white border shadow-md rounded-md z-50 w-48 text-gray-700">
                <div className="flex flex-col py-2 text-sm">
                  <p
                    onClick={() => {
                      navigate("/my-profile");
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => {
                      navigate("/my-appointments");
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={logout}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            CREATE ACCOUNT
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt="menu"
        />

        {/* Mobile Fullscreen Menu */}
        <div
          className={`${
            showMenu ? "fixed top-0 left-0 w-full h-screen" : "hidden"
          } md:hidden z-50 bg-white transition-all duration-300`}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <img className="w-20" src={assets.logo} alt="logo" />
            <div className="flex items-center gap-3">
              <img
                className="w-6 cursor-pointer"
                onClick={() => setShowMenu(false)}
                src={assets.cross_icon}
                alt="close"
              />
            </div>
          </div>

          {/* Mobile Links */}
          <ul className="flex flex-col items-center gap-4 mt-6 px-5 text-base font-medium text-gray-800">
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 border-b-2 border-primary"
                  : "px-4 py-2 hover:bg-gray-100 rounded"
              }
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/doctors"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 border-b-2 border-primary"
                  : "px-4 py-2 hover:bg-gray-100 rounded"
              }
            >
              ALL DOCTORS
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 border-b-2 border-primary"
                  : "px-4 py-2 hover:bg-gray-100 rounded"
              }
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setShowMenu(false)}
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "px-4 py-2 border-b-2 border-primary"
                  : "px-4 py-2 hover:bg-gray-100 rounded"
              }
            >
              CONTACT
            </NavLink>
          </ul>
          {/* Mobile Admin/Doctor Login Button */}
          <div className="flex justify-center mt-6 px-5">
            <a
              href="http://localhost:5174/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-gradient-to-r from-primary to-blue-500 text-white px-4 py-2 rounded-full font-medium shadow hover:from-blue-500 hover:to-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Admin/Doctor
            </a>
          </div>
          {/* End Mobile Admin/Doctor Login Button */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

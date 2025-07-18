import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets_admin/assets";

const Sidebar = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  const renderLink = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 py-3 px-2 transition-all
         ${isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : "hover:bg-gray-100"}
         w-full`
      }
    >
      <div className="min-w-[1.25rem] sm:min-w-[1.5rem]">
        <img
          src={icon}
          alt={label}
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
        />
      </div>
      <span className="hidden md:inline-block text-sm">{label}</span>
    </NavLink>
  );

  return (
      <ul className="text-[#515151] mt-4 space-y-1">
        {aToken && (
          <>
            {renderLink("/admin-dashboard", assets.home_icon, "Dashboard")}
            {renderLink("/all-appointments", assets.appointment_icon, "Appointments")}
            {renderLink("/add-doctor", assets.add_icon, "Add Doctor")}
            {renderLink("/doctor-list", assets.people_icon, "Doctors List")}
          </>
        )}
        {dToken && (
          <>
            {renderLink("/doctor-dashboard", assets.home_icon, "Dashboard")}
            {renderLink("/doctor-appointments", assets.appointment_icon, "Appointments")}
            {renderLink("/doctor-profile", assets.people_icon, "Profile")}
          </>
        )}
      </ul>
  );
};

export default Sidebar;

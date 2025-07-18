import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20">
      {/* Left Side */}
      <div className="md:w-1/2 flex flex-col justify-center gap-4 py-10 md:py-0 m-auto h-full">
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-snug sm:leading-snug md:leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-28" src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block"/>
            schedule your appointment hassle-free
          </p>
        </div>
        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white px-6 py-2 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300 w-fit max-w-[200px] sm:max-w-[240px]"
        >
          Book Appointment <img className="w-3" src={assets.arrow_icon} alt="" />
        </a>
      </div>

      {/* Right Side */}
      {/* Right Side */}
      <div className="md:w-1/2 relative flex items-end justify-end">
        <img
          className="w-full h-auto max-h-[500px] md:max-h-[90%] object-contain rounded-lg"
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Header;

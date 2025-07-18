import React from "react";
import { Route,Routes } from "react-router-dom";
import Home from './pages/Home';
import Doctors from "./pages/Doctors";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from './pages/MyProfile';
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer} from 'react-toastify';
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import LoadingOverlay from "./components/LoadingOverlay";


const App = () => {
  const { loading } = useContext(AppContext);
  return (
    <div className="mx-4 sm:mx-[10%]">
      {loading && <LoadingOverlay />}
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/doctors" element={<Doctors/>}/>
        <Route path="/doctors/:speciality" element={<Doctors/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/my-profile" element={<MyProfile/>}/>
        <Route path="/my-appointments" element={<MyAppointments/>}/>
        <Route path="/appointments/:docId" element={<Appointment/>}/>
      </Routes>
      <Footer/>
    </div>
  );
};

export default App;

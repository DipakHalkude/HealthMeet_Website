import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;
    const docdata = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docdata.available,
    });
    res.json({ success: true, message: "Availablity Changed :)" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!email) {
      return res.json({ success: false, message: "Invalid Credentials ):" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials ):" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const docId = req.docId;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed :)" });
    } else {
      return res.json({ success: false, message: "Mark Failed ):" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.docId;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled :)" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed ):" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId;

    const appointments = await appointmentModel.find({ docId });

    let earning = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earning += item.amount;
      }
    });

    let uniquePatients = [];
    appointments.map((item) => {
      if (!uniquePatients.includes(item.userId)) {
        uniquePatients.push(item.userId);
      }
    });

    const dashData = {
      earning,
      appointments: appointments.length,
      patients: uniquePatients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
  try {
    const docId = req.docId;
    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to update doctor profile data from doctor panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { fees, address, available } = req.body;
    const docId = req.docId;

    const updated = await doctorModel.findByIdAndUpdate(
      docId,
      { fees, address, available },
      { new: true }
    );
    if (!updated) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    res.json({
      success: true,
      message: "Profile Updated :)",
      profileData: updated,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailablity,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};

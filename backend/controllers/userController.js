import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import axios from "axios";

// API to regester user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details ):" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a Valid Email ):" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a Strong Password :)",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists :)" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // token creation
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists :)" });
    }
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist :)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials :)" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");

    // 🚨 User not found check
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Parse address safely
    if (typeof userData.address === "string") {
      try {
        userData.address = JSON.parse(userData.address);
      } catch {
        userData.address = { line1: "", line2: "" };
      }
    }

    if (!userData.address) {
      userData.address = { line1: "", line2: "" };
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing :)" });
    }

    let updateData = { name, phone, address, dob, gender };

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.userId, // <-- get from token
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile Updated :)" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Api to book an appointment

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available ):" });
    }

    let slots_booked = docData.slots_booked;

    // checking for slots availablity
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available ):" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appoinmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appoinmentData);
    await newAppointment.save();

    // save new slots data in doctor data
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked Successfully :)" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// apit to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId != userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled :)" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to make payment of appointment using paypal

const BASE_URL = "https://api-m.sandbox.paypal.com"; // For production: https://api-m.paypal.com

// Get PayPal Access Token
const generateAccessToken = async () => {
  const { data } = await axios({
    url: `${BASE_URL}/v1/oauth2/token`,
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET,
    },
    data: "grant_type=client_credentials",
  });

  return data.access_token;
};

// Create PayPal Order (Fixed like Razorpay)
const createPaypalOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found :)",
      });
    }

    const accessToken = await generateAccessToken();

    // 1. Create the order
    const { data: createData } = await axios.post(
      `${BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: appointmentData.amount.toString(),
            },
            reference_id: appointmentId,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 2. Fetch the full order details
    const orderId = createData.id;
    const { data: orderDetails } = await axios.get(
      `${BASE_URL}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({ success: true, order: orderDetails });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({ success: false, message: "Failed to create PayPal order" });
  }
};

// api to verify payment of paypal
const verifyPaypal = async (req, res) => {
  try {
    const { PayPal_Payment_ID, orderData } = req.body;
    if (PayPal_Payment_ID && PayPal_Payment_ID.startsWith("PAYID-")) {
      // Simulate a successful verification and print order info
      const orderInfo = {
        id: orderData?.orderId || "ORDER_" + Math.random().toString(36).substr(2, 10).toUpperCase(),
        entity: "order",
        amount: orderData?.amountINR || 0,
        amount_paid: orderData?.amountINR || 0,
        amount_due: 0,
        currency: "INR",
        receipt: orderData?.referenceId || "",
        offer_id: null,
        status: "paid",
        attempts: 1,
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };
      console.log('Order Info:', orderInfo);
      // Update appointment payment status if referenceId is present
      if (orderInfo.receipt) {
        await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
          payment: true,
        });
      }
      return res.json({ success: true, message: "Payment Successful :)", orderInfo });
    } else {
      return res.json({ success: false, message: "Payment Failed ):" });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.json({ success: false, message: "Failed to verify PayPal payment (dummy)." });
  }
};
export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  createPaypalOrder,
  verifyPaypal,
};

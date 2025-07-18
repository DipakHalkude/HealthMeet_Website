import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const USD_TO_INR = 83; // Fixed conversion rate for demo

const MyAppointments = () => {
  const { backendUrl, token, userData, getDoctorsData, setLoading } =
    useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [dummyStep, setDummyStep] = useState("phone");
  const [dummyForm, setDummyForm] = useState({
    phone: "",
    card: "",
    expiry: "",
    cvv: "",
    otp: "",
    result: null,
  });
  const [dummyError, setDummyError] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const navigate = useNavigate();

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    const day = dateArray[0];
    const monthIndex = Number(dateArray[1]) - 1;
    const year = dateArray[2];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId, userId: userData?._id },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const appointmentPaypal = async (appointmentId) => {
    setLoading(true);
    try {
      setLoadingPayment(true);
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-paypal",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        const order = data.order;
        if (
          order &&
          Array.isArray(order.purchase_units) &&
          order.purchase_units.length > 0
        ) {
          const amountUSD = parseFloat(order.purchase_units[0].amount.value);
          const amountINR = Math.round(amountUSD * USD_TO_INR);
          setPaymentDetails({
            amountUSD,
            amountINR,
            currency: "INR",
            orderId: order.id,
            referenceId: order.purchase_units[0].reference_id,
          });
          setShowPaymentModal(true);
          setDummyStep("phone");
          setDummyForm({
            phone: "",
            card: "",
            expiry: "",
            cvv: "",
            otp: "",
            result: null,
          });
        } else {
          toast.error("Order does not contain amount information.");
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingPayment(false);
      setLoading(false);
    }
  };

  const verifyPaypal = async (PayPal_Payment_ID, orderData) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-paypal",
        { PayPal_Payment_ID, orderData },
        { headers: { token } }
      );
      if (data.success) {
        getUserAppointments();
        navigate("/my-appointments");
        toast.success("Payment verified!");
      } else {
        toast.error(data.message || "Payment verification failed.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>
      <div>
        {appointments.map((item, idx) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-6 border-b"
            key={idx}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled && item.payment && !item.isCompleted &&  (
                <button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">
                  Paid
                </button>
              )}
              {!item.cancelled && !item.payment && !item.isCompleted &&  (
                <button
                  onClick={() => appointmentPaypal(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay Online
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancle Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border  border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}
              {item.isCompleted && <button className="sm:min-w-48 py-2 border border-green-500 rounded tet-green-500">Completed</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Dummy PayPal Modal */}
      {showPaymentModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl min-w-[340px] max-w-[90vw] border-2 border-[#0070ba]">
            <img
              src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
              alt="PayPal"
              className="w-16 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-[#0070ba] text-center mb-2">
              Pay with PayPal (Dummy)
            </h2>
            <div className="text-center text-gray-700 mb-6">
              <p className="text-lg mb-2">
                <span className="font-semibold">Amount:</span>
                <span className="ml-2 text-[#0070ba] font-bold">
                  ₹{paymentDetails.amountINR} (INR) &nbsp;
                  <span className="text-xs text-gray-500">
                    (${paymentDetails.amountUSD} USD)
                  </span>
                </span>
              </p>
              <p className="text-xs text-gray-500 mb-1">
                <span className="font-semibold">Order ID:</span>{" "}
                {paymentDetails.orderId}
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Reference ID:</span>{" "}
                {paymentDetails.referenceId}
              </p>
            </div>
            {/* Step 1: Phone */}
            {dummyStep === "phone" && (
              <div>
                <input
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Enter phone number"
                  value={dummyForm.phone}
                  maxLength={10}
                  onChange={(e) => {
                    setDummyForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }));
                    setDummyError("");
                  }}
                />
                {dummyError && <div className="text-red-500 text-xs mb-2">{dummyError}</div>}
                <button
                  className="w-full py-2 rounded bg-[#ffc439] text-[#111820] font-semibold text-lg shadow hover:bg-[#ffb800] transition"
                  onClick={() => {
                    if (!/^\d{10}$/.test(dummyForm.phone)) {
                      setDummyError("Please enter a valid 10-digit phone number.");
                      return;
                    }
                    setDummyError("");
                    setDummyStep("card");
                  }}
                >
                  Next
                </button>
              </div>
            )}
            {/* Step 2: Card */}
            {dummyStep === "card" && (
              <div>
                <input
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Enter card number"
                  value={dummyForm.card}
                  maxLength={16}
                  onChange={(e) => {
                    setDummyForm((f) => ({ ...f, card: e.target.value.replace(/\D/g, "") }));
                    setDummyError("");
                  }}
                />
                <div className="flex gap-2 mb-2">
                  <input
                    className="border p-2 rounded w-1/2"
                    placeholder="MM/YY"
                    value={dummyForm.expiry}
                    maxLength={5}
                    onChange={(e) => {
                      setDummyForm((f) => ({ ...f, expiry: e.target.value }));
                      setDummyError("");
                    }}
                  />
                  <input
                    className="border p-2 rounded w-1/2"
                    placeholder="CVV"
                    value={dummyForm.cvv}
                    maxLength={3}
                    onChange={(e) => {
                      setDummyForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }));
                      setDummyError("");
                    }}
                  />
                </div>
                {dummyError && <div className="text-red-500 text-xs mb-2">{dummyError}</div>}
                <button
                  className="w-full py-2 rounded bg-[#ffc439] text-[#111820] font-semibold text-lg shadow hover:bg-[#ffb800] transition mb-2"
                  onClick={() => {
                    if (!/^\d{16}$/.test(dummyForm.card)) {
                      setDummyError("Card number must be 16 digits.");
                      return;
                    }
                    if (!/^\d{2}\/\d{2}$/.test(dummyForm.expiry)) {
                      setDummyError("Expiry must be in MM/YY format.");
                      return;
                    }
                    // Validate expiry is a valid future date
                    const [mm, yy] = dummyForm.expiry.split("/");
                    const expMonth = parseInt(mm, 10);
                    const expYear = 2000 + parseInt(yy, 10);
                    const now = new Date();
                    const expDate = new Date(expYear, expMonth - 1, 1);
                    if (expMonth < 1 || expMonth > 12 || expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
                      setDummyError("Expiry must be a valid future date.");
                      return;
                    }
                    if (!/^\d{3}$/.test(dummyForm.cvv)) {
                      setDummyError("CVV must be 3 digits.");
                      return;
                    }
                    setDummyError("");
                    setDummyStep("otp");
                  }}
                >
                  Next
                </button>
                <button
                  className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold text-lg shadow"
                  onClick={() => {
                    setDummyError("");
                    setDummyStep("phone");
                  }}
                >
                  Back
                </button>
              </div>
            )}
            {/* Step 3: OTP */}
            {dummyStep === "otp" && (
              <div>
                <input
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Enter OTP"
                  value={dummyForm.otp}
                  maxLength={6}
                  onChange={(e) => {
                    setDummyForm((f) => ({ ...f, otp: e.target.value.replace(/\D/g, "") }));
                    setDummyError("");
                  }}
                />
                {dummyError && <div className="text-red-500 text-xs mb-2">{dummyError}</div>}
                <button
                  className="w-full py-2 rounded bg-[#ffc439] text-[#111820] font-semibold text-lg shadow hover:bg-[#ffb800] transition mb-2"
                  onClick={() => {
                    if (!/^\d{6}$/.test(dummyForm.otp)) {
                      setDummyError("OTP must be 6 digits.");
                      return;
                    }
                    setDummyError("");
                    setDummyStep("result");
                  }}
                >
                  Submit
                </button>
                <button
                  className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold text-lg shadow"
                  onClick={() => {
                    setDummyError("");
                    setDummyStep("card");
                  }}
                >
                  Back
                </button>
              </div>
            )}
            {/* Step 4: Result */}
            {dummyStep === "result" && (
              <div>
                <button
                  className="w-full py-2 rounded bg-green-500 text-white font-semibold text-lg shadow hover:bg-green-600 transition mb-2"
                  onClick={() => {
                    setDummyForm((f) => ({ ...f, result: "success" }));
                    setTimeout(() => {
                      setShowPaymentModal(false);
                      setDummyStep("phone");
                      setDummyForm({
                        phone: "",
                        card: "",
                        expiry: "",
                        cvv: "",
                        otp: "",
                        result: null,
                      });
                      toast.success("Payment successful!");
                      // Console log fake PayPal payment info
                      const fakePaymentId = `PAYID-${Math.random()
                        .toString(36)
                        .substr(2, 12)
                        .toUpperCase()}`;
                      const fakeOrderId =
                        paymentDetails.orderId ||
                        `ORDER-${Math.random()
                          .toString(36)
                          .substr(2, 10)
                          .toUpperCase()}`;
                      const fakeSignature = Math.random()
                        .toString(36)
                        .substr(2, 24)
                        .toUpperCase();
                      console.log("PayPal_Payment_ID:", fakePaymentId);
                      console.log("PayPal_Order_ID:", fakeOrderId);
                      console.log("PayPal_Signature:", fakeSignature);
                      // Call backend to verify
                      verifyPaypal(fakePaymentId, paymentDetails);
                    }, 1000);
                  }}
                >
                  Simulate Success
                </button>
                <button
                  className="w-full py-2 rounded bg-red-500 text-white font-semibold text-lg shadow hover:bg-red-600 transition"
                  onClick={() => {
                    setDummyForm((f) => ({ ...f, result: "failure" }));
                    setTimeout(() => {
                      setShowPaymentModal(false);
                      setDummyStep("phone");
                      setDummyForm({
                        phone: "",
                        card: "",
                        expiry: "",
                        cvv: "",
                        otp: "",
                        result: null,
                      });
                      toast.error("Payment failed!");
                    }, 1000);
                  }}
                >
                  Simulate Failure
                </button>
              </div>
            )}
            {/* Optional: Show a message for success/failure */}
            {dummyForm.result === "success" && (
              <div className="text-green-600 font-bold mt-4">
                Payment Successful!
              </div>
            )}
            {dummyForm.result === "failure" && (
              <div className="text-red-600 font-bold mt-4">Payment Failed!</div>
            )}
            {/* Close button */}
            <button
              className="mt-6 px-6 py-2 bg-gray-300 text-gray-700 rounded w-full"
              onClick={() => {
                setShowPaymentModal(false);
                setDummyStep("phone");
                setDummyForm({
                  phone: "",
                  card: "",
                  expiry: "",
                  cvv: "",
                  otp: "",
                  result: null,
                });
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loadingPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="flex flex-col items-center">
            <img src="/logo.svg" alt="Loading..." className="w-20 h-20 animate-spin mb-4" />
            <span className="text-white text-lg font-semibold">Loading payment details...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;

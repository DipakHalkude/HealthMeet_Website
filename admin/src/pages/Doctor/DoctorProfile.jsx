import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from 'axios';

const DoctorProfile = () => {
  const { dToken, getProfileData, profileData, setProfileData ,backendUrl} =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  const updateProfile=async()=>{
   try{
     const updateData={
      address:profileData.address,
      fees:profileData.fees,
      available:profileData.available
     }

     const {data}=await axios.post(backendUrl+'/api/doctor/update-profile',updateData,{headers:{dToken}});
     if(data.success)
     {
      toast.success(data.message);
      setIsEdit(false);
      getProfileData();
     }
     else
     {
      toast.error(data.message);
     }
   }catch(error)
   {
     toast.error(error.message);
     console.log(error);
   }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return (
    profileData && (
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          {/* Profile Image */}
          <div className="w-full sm:max-w-[250px] mx-auto lg:mx-0">
            <img
              className=" bg-primary/80 w-full rounded-xl shadow-md object-cover"
              src={profileData.image}
              alt="Doctor"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <p className="text-3xl font-semibold text-gray-800">
              {profileData.name}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600 text-sm">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <span className="px-2 py-0.5 border rounded-full text-xs bg-gray-50">
                {profileData.experience}
              </span>
            </div>

            {/* About Section */}
            <div className="mt-4">
              <p className="font-medium text-gray-700">About:</p>
              <p className="text-gray-600 text-sm mt-1">{profileData.about}</p>
            </div>

            {/* Fees */}
            <p className="text-gray-700 font-medium mt-4">
              Appointment Fee:
              <span className="text-gray-900 font-semibold ml-2">
                {isEdit ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={profileData.fees}
                  />
                ) : (
                  `${currency} ${profileData.fees}`
                )}
              </span>
            </p>

            {/* Address */}
            <div className="mt-4">
              <p className="font-medium text-gray-700">Address:</p>
              <p className="text-sm text-gray-600 mt-1">
                { isEdit ? <input type="text" onChange={(e)=>setProfileData(prev=>({...prev,address:{...prev.address,line1:e.target.value}}))} value={profileData.address.line1} />  :profileData.address.line1}
                <br />
                {isEdit ? <input type="text" onChange={(e)=>setProfileData(prev=>({...prev,address:{...prev.address,line2:e.target.value}}))} value={profileData.address.line2} />  :profileData.address.line2}
              </p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mt-4">
              <input
                checked={profileData.available}
                type="checkbox"
                className="accent-primary"
                onChange={()=>isEdit && setProfileData(prev=>({...prev,available:!prev.available}))}
              />
              <label className="text-sm text-gray-700">Available</label>
            </div>

            {/* Edit Button */}
            {
              isEdit? <button
              onClick={updateProfile}
              className="mt-6 px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"

            >
              Save
            </button>
            :<button
              onClick={() => setIsEdit(true)}
              className="mt-6 px-5 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              Edit
            </button>
            }
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;

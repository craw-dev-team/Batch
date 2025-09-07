import { useState, useEffect } from "react";
import { Select, Input, message, TimePicker  } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import axios from "axios";
import BASE_URL from "../../../../ip/Ip";
import { useAuth } from "../../AuthContext/AuthContext";
import { useTimeSlotForm } from "./TimeSlotContext";
import dayjs from "dayjs";
import { useTheme } from "../../../Themes/ThemeContext";



const TimeSlotForm = ( { isOpen, onClose, timeSlotData } ) => {
    if (!isOpen) return null;

    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const isEditing = Boolean(timeSlotData?.id); 

    const { timeSlotFormData, setTimeSlotFormData, errors, setErrors, resetTimeSlotForm } = useTimeSlotForm();
    const { token } = useAuth();

    const [ loading, setLoading] = useState(false);


    useEffect(() => {
        if (timeSlotData) {
            setTimeSlotFormData({
                id: timeSlotData.id || "",
                startTime: timeSlotData.start_time || "",
                endTime: timeSlotData.end_time || "",
                weekType: timeSlotData.week_type || undefined,
                specialTimeSlot : timeSlotData.special_time_slot || undefined
            });
        } else {
            resetTimeSlotForm();
        }
    }, []);
    

    const handleChange = (name, value) => {
        setTimeSlotFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };


    const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            // if (!validateForm()) return; // Stop submission if validation fails

            const payload = {
                id: timeSlotFormData.id,
                start_time: timeSlotFormData.startTime,
                end_time: timeSlotFormData.endTime,
                week_type: timeSlotFormData.weekType,
                special_time_slot: timeSlotFormData.specialTimeSlot
            };

            try {
                setLoading(true); // Start loading

                let response;
                let successMessage = "";
                if (timeSlotData && timeSlotData.id) {
                // Update existing course (PATCH)
                response = await axios.patch(`${BASE_URL}/api/timeslots/update/${timeSlotData.id}/`, 
                    payload,
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    withCredentials : true
                }
                );
                successMessage = "TimeSlot updated successfully!";
                } else {
                    // Add new course (POST)
                    response = await axios.post(`${BASE_URL}/api/timeslots/create/`, 
                        payload, 
                        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        withCredentials : true
                    }
                    );
                    successMessage = "TimeSlot added successfully!";
                }

                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetTimeSlotForm();
                    }, 1000);
                }
            } catch (error) {
                message.error("Failed to submit the form.");
                setLoading(false);
            }
            
        };
    

     // FOR RESETTING ERRORS 
     const resetErrors = () => {
        setErrors({}); // Clear all errors
    };

    const handleClose = () => {
        resetErrors(); // Clear errors when modal closes
        onClose(); // Close the modal
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
             <div className={`relative p-2 w-4/6 rounded-xl shadow-lg ${theme.specificPageBg}`}>
                 
                 {/* Modal Header */}
                 <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                     <h3 className={`text-lg font-semibold ${theme.text}`}>
                     {isEditing ? "Edit TimeSlot Details" : "Add New TimeSlot"}
                     </h3>
                     <button
                        onClick={() => { handleClose(); }}
                         type="button"
                         className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                     >
                         <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                         </svg>
                         <span className="sr-only">Close modal</span>
                     </button>
                 </div>
 
                 {/* Modal Form */}
                <form className="p-4 md:p-5" onSubmit={handleFormSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-3">

                         {/* StartTime EndTime  */}
                        <div className="col-span-1">
                            <label htmlFor="time" className={`block mb-2 text-sm font-medium ${theme.text}`}>Time</label>
                            <TimePicker.RangePicker
                                format="HH:mm"
                                value={
                                    timeSlotFormData.startTime && timeSlotFormData.endTime
                                    ? [dayjs(timeSlotFormData.startTime, "HH:mm"), dayjs(timeSlotFormData.endTime, "HH:mm")]
                                    : null
                                }
                                onChange={(value) => {
                                    if (value && value.length === 2) {
                                    handleChange("startTime", value[0].format("HH:mm"));
                                    handleChange("endTime", value[1].format("HH:mm"));
                                    } else {
                                    handleChange("startTime", "");
                                    handleChange("endTime", "");
                                    }
                                }}
                            />

                        </div>

                         {/* WeekType  */}
                        <div className="col-span-1">
                                <label htmlFor="weekType" className={`block mb-2 text-sm font-medium ${theme.text}`}>Preferred Week</label>
                               <Select
                                    name="weekType"
                                    value={timeSlotFormData.weekType}
                                    onChange={(value) => handleChange("weekType", value)}
                                    className="w-60 border-gray-300"
                                    size="large"
                                    placeholder="Select Preferred Week"
                                    options={[
                                        { value: 'Weekdays', label: 'Week Days' },
                                        { value: 'Weekends', label: 'Weekends' },
                                        { value: 'Both', label: 'Both' } 
                                    ]}
                                />
                                {errors.week_type && <p className="text-red-500 text-sm">{errors.week_type}</p>}
                            </div>

                         {/* specialTimeSlot  */}
                        <div className="col-span-1">
                            <label htmlFor="specialTimeSlot" className={`block mb-2 text-sm font-medium ${theme.text}`}>SpecialTimeSlot</label>
                           <Select
                                name="specialTimeSlot"
                                value={timeSlotFormData.specialTimeSlot}
                                onChange={(value) => handleChange("specialTimeSlot", value)}
                                className="w-60 border-gray-300"
                                size="large"
                                placeholder="Select Special TimeSlot"
                                options={[
                                    { value: "Normal", label: "Normal" },
                                    { value: "Special", label: "Special" }
                                ]}
                            />
                            {errors.special_time_slot && <p className="text-red-500 text-sm">{errors.special_time_slot}</p> }
                        </div> 
                        
                    </div>

                   <div className="flex justify-end">
                   <button
                    type="submit"
                    disabled={loading} // Disable button when loading
                    className={`text-white inline-flex items-center font-medium rounded-lg text-sm px-4 py-2 text-center focus:ring-4 focus:outline-none shadow-lg hover:shadow-xl transition-all duration-200 
                            ${loading ? "bg-gray-400 cursor-not-allowed" : `${theme.createBtn}`}
                        `}
                >
                    {loading ? (
                        <>
                            <SyncOutlined spin className="mr-2" />
                            Processing...
                        </>
                    ) : isEditing ? "Save Changes" : "Add TimeSlot"}
                </button>
                   </div>
                </form>
             </div>
         </div>
        </>
    )
};

export default TimeSlotForm;
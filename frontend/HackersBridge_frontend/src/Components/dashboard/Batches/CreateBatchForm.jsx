import { useState, useEffect } from "react";
import { DatePicker, TimePicker, Select, Input, message, Checkbox, Tooltip  } from 'antd';
import { SyncOutlined, CopyOutlined, RightOutlined  } from '@ant-design/icons';
import { useBatchForm } from "../Batchcontext/BatchFormContext";
import { useCourseForm } from "../Coursecontext/CourseFormContext";
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { useStudentForm } from "../Studentcontext/StudentFormContext";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axiosInstance from "../api/api";
import { useTimeSlotForm } from "../AddDetails/TimeSlot/TimeSlotContext";
import { useTheme } from "../../Themes/ThemeContext";


const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);



const CreateBatchForm = ({ isOpen, onClose, selectedBatchData, currentFilters }) => {
    if (!isOpen) return null; // Prevent rendering when not open

    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const isEditing = Boolean(selectedBatchData?.id);
    const { batchFormData, setBatchFormData, errors, setErrors, resetBatchForm, fetchBatches } = useBatchForm();
    const { coursesData, fetchCourses } = useCourseForm();
        const {timeSlotData, fetchTimeSlotData} = useTimeSlotForm();
    const { trainerData, fetchTrainers } = useTrainerForm();
    const { fetchStudents, allStudentData, fetchAllStudent } = useStudentForm();
    const [ loading, setLoading ] = useState(false);


    // fetch batches and assign prefilled value to fields in form
    useEffect(() => {        
        fetchCourses();
        fetchTrainers();
        fetchStudents();
        fetchAllStudent();        
        fetchTimeSlotData();
        
        if (selectedBatchData) {            
            setBatchFormData({
                batchId: selectedBatchData.batch_id || "",
                batchTime: selectedBatchData?.batch_time_data?.id || null,
                startTime: selectedBatchData?.batch_time_data?.start_time || "",
                endTime: selectedBatchData?.batch_time_data?.end_time || "",
                startDate: selectedBatchData.start_date || "",  
                endDate: selectedBatchData.end_date || "", 
                course: selectedBatchData.course || "",
                trainer: selectedBatchData.trainer || "",
                preferredWeek: selectedBatchData.preferred_week || "",
                mode: selectedBatchData.mode || "",
                language: selectedBatchData.language || "",
                location: selectedBatchData.location || "",
                student: selectedBatchData.student || [],
                status: selectedBatchData.status || "",
                
            });
            
        } else {
            resetBatchForm();
        }
    }, [allStudentData]);


        //handle change of input fields  
        const handleChange = (name, value) => {
            setBatchFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        };



        // Validation function for input fields
        const validateForm = () => {
            let newErrors = {};
    
            // if (!batchFormData.batchId) newErrors.batchId = "Batch Id is required";
            if (!batchFormData.batchTime || batchFormData.batchTime.length === 0) newErrors.batchTime = "Batch Timing is required";
            if (!batchFormData.course || batchFormData.course.length === 0) newErrors.course = "Course is required";
            if (!batchFormData.preferredWeek || batchFormData.preferredWeek.length === 0) newErrors.preferredWeek = "Preferred Week is required";
            if (!batchFormData.mode || batchFormData.mode.length === 0) newErrors.mode = "Mode is required";
            if (!batchFormData.language || batchFormData.language.length === 0) newErrors.language = "Language is required";
            if (!batchFormData.location || batchFormData.location.length === 0) newErrors.location = "Location is required";
    
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0; // Returns true if no errors
        };

 
    // handle form submittion 
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return; // Stop submission if validation fails
        
         const formattedData = {
                    ...batchFormData,
                    location: parseInt(batchFormData.location, 10) || null,
                    startDate: batchFormData.startDate  && dayjs(batchFormData.startDate).isValid() 
                    ? dayjs(batchFormData.startDate).format("YYYY-MM-DD") 
                    : null,
                    endDate: batchFormData.endDate  && dayjs(batchFormData.endDate).isValid() 
                    ? dayjs(batchFormData.endDate).format("YYYY-MM-DD") 
                    : null,
                };
        
        
                    const payload = {
                        batch_id: formattedData.batchId,
                        batch_time: formattedData.batchTime,
                        start_date: formattedData.startDate,
                        end_date: formattedData.endDate,
                        course: formattedData.course,
                        trainer: formattedData.trainer,
                        preferred_week: formattedData.preferredWeek,
                        mode: formattedData.mode,
                        language: formattedData.language,
                        location: formattedData.location,
                        student: formattedData.student,
                        status: formattedData.status,
                        // profile_picture: studentFormData.studentProfilePicture,
                    };
        
        
        try {
            setLoading(true); // Start loading
            
            let response;
            let successMessage = "";
            
            if (selectedBatchData && selectedBatchData.id) {
                // Update existing course (PUT)
                response = await axiosInstance.put(`/api/batches/edit/${selectedBatchData.id}/`, payload );
                successMessage = "Batch updated successfully!";
                } else {
                    // Add new course (POST)
                    response = await axiosInstance.post(`/api/batches/add/`, payload);
                    successMessage = "Batch added successfully!";
                }

                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetBatchForm();
                        fetchBatches(currentFilters, true);
                    }, 1000);
                }
  
        } catch (error) {
            setLoading(false);
        
            if (error.response) {
                console.error("Server Error Response:", error.response);
        
                const errorData = error.response.data?.error;
        
                if (typeof errorData === "string") {
                    // Simple error message as a string
                    message.error(errorData);
                } else if (typeof errorData === "object" && errorData !== null) {
                    // Object of error messages
                    Object.entries(errorData).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            value.forEach((msg) => message.error(`${msg}`));
                        } else {
                            message.error(`${key}: ${value}`);
                        }
                    });
                } else {
                    message.error("An unknown error occurred.");
                }
        
            } else if (error.request) {
                console.error("No Response from Server:", error.request);
                message.error("No response from server. Please check your internet connection.");
            } else {
                console.error("Error Message:", error);
                message.error("An unexpected error occurred.", error);
            }
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


        // THIS WILL REDIRECT TO STUDENT IONFO PAGE IN NEW TAB FROM CREATE BATCH MODAL SELECT FIELD
        const handleStudentClickOnSelect = (event, studentId) => {
            event.preventDefault();
            event.stopPropagation(); // Prevents interfering with Select behavior
        
            if (!studentId) return;
        
            const encodedStudentId = btoa(studentId);
            
            // Open in a new tab without switching focus immediately
            setTimeout(() => {
                window.open(`/students/${encodedStudentId}`, "_blank", "noopener,noreferrer");
            }, 2000); // Small delay prevents immediate redirection
            
        };
        
        
        const copyToClipboard = (text) => {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                navigator.clipboard.writeText(text)
                    .then(() => message.success("Phone number copied!"))
                    .catch(() => message.error("Failed to copy!"));
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                message.success("Phone number copied!");
            }
        };


   
     return (
         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
             <div className={`relative p-2 w-4/6 rounded-xl shadow-lg ${theme.specificPageBg}`}>
                 
                 {/* Modal Header */}
                 <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                     <h3 className={`text-lg font-semibold ${theme.text}`}>
                     {isEditing ? "Edit Batch" : "Create New Batch"}
                     </h3>
                     <button
                        onClick={() => {handleClose(); }}
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
                 <div className="max-h-[700px] overflow-y-auto p-4 md:p-5">
                    <form className="p-4 md:p-5" onSubmit={handleFormSubmit}>
                        <div className="grid gap-4 mb-4 grid-cols-6">
                            <div className="col-span-2">
                                <label htmlFor="batchId" className={`block mb-2 text-sm font-medium ${theme.text}`}>Batch Id</label>
                                <Input name="batchId" disabled value={batchFormData.batchId} onChange={(e) => handleChange("batchId", e.target.value)} className='rounded-lg border-gray-300' placeholder="Batch Id"/>
                                {/* {errors.batchId && <p className="text-red-500 text-sm">{errors.batchId}</p>} */}
                            </div>
                            
                            {/* batch Time  */}
                            <div className="col-span-2">
                            <label htmlFor="batchTime" className={`block mb-2 text-sm font-medium ${theme.text}`}>Batch Timing</label>
                            {/* <TimePicker.RangePicker use12Hours  format="h:mm a" size={"large"} required
                                value={[
                                    batchFormData?.startTime ? dayjs(batchFormData?.startTime, "HH:mm:ss") : null,
                                    batchFormData?.endTime ? dayjs(batchFormData?.endTime, "HH:mm:ss") : null,
                                ]}
                                onChange={(value) => handleChange('batchTime', value)}
                            /> */}
                            <Select name="batchTime" value={batchFormData.batchTime }  className='w-full border-gray-300' size='large' placeholder='Select Batch Timing' 
                                dropdownRender={menu => <div>{menu}</div>} // required to ensure styling applies properly
                                showSearch 

                                options={(timeSlotData || []).map((slot) => {
                                    let bgColor = "bg-gray-100"; // default

                                    if (slot.week_type === "Weekends") bgColor = "bg-yellow-100";
                                    else if (slot.week_type === "Weekdays") bgColor = "bg-blue-100";
                                    else if (slot.week_type === "Both") bgColor = "bg-green-100";

                                    return {
                                        value: slot.id,
                                        label: (
                                        <div className={`rounded p-0 ${bgColor}`}>
                                            <span className="text-gray-800">
                                            {`${dayjs(slot.start_time, "HH:mm").format("hh:mm A")} - ${dayjs(
                                                slot.end_time,
                                                "HH:mm"
                                            ).format("hh:mm A")} `}
                                            </span>
                                            <span className="text-xs text-gray-500">({slot.week_type})</span>
                                        </div>
                                        ),
                                    };
                                })}

                                 onChange={(val) => setBatchFormData(prev => ({
                                    ...prev,
                                    batchTime: val // val is just ID
                                }))}

                                 filterOption={(input, option) => {
                                    const labelText = typeof option.label === 'string'
                                      ? option.label
                                      : option.label?.props?.children || ''; // safely get text inside <div>
                                      
                                    return labelText.toLowerCase().includes(input.toLowerCase());
                                  }}

                                //  options={[
                                //     { value: '1', label: '10:00 - 12:00' },
                                //     { value: '2', label: '12:00 - 02:00' },
                                //     { value: '3', label: '03:00 - 05:00' },
                                //     { value: '4', label: '05:00 - 06:30' },
                                //     { value: '9', label: '06:00 - 07:00' },
                                //     { value: '7', label: '07:00 - 09:00' },
                                //     { value: '8', label: '10:00 - 05:00' },
                           
                                //     // Weekends
                                //     { value: '5', label: <div style={{ backgroundColor: '#fffbe6' }}>10:00 - 02:00 - Weekends</div> },
                                //     { value: '6', label: <div style={{ backgroundColor: '#fffbe6' }}>03:00 - 06:30 - Weekends</div> },
                                //     { value: '16', label: <div style={{ backgroundColor: '#fffbe6' }}>12:00 - 02:00 - Weekends</div> },
                                    
                                //     // Weekdays
                                //     { value: '17', label: <div style={{ backgroundColor: '#c3f3fa' }}>10:30 - 12:00 - Weekdays</div> },
                                //     { value: '10', label: <div style={{ backgroundColor: '#c3f3fa' }}>12:30 - 02:30 - Weekdays</div> },
                                //     { value: '11', label: <div style={{ backgroundColor: '#c3f3fa' }}>07:00 - 08:30 - Weekdays</div> },
                                //     { value: '12', label: <div style={{ backgroundColor: '#c3f3fa' }}>05:00 - 07:00 - Weekdays</div> },
                                //     { value: '13', label: <div style={{ backgroundColor: '#c3f3fa' }}>08:00 - 09:00 - Weekdays</div> },
                                //     { value: '14', label: <div style={{ backgroundColor: '#c3f3fa' }}>03:00 - 07:00 - Weekdays</div> },
                                //     { value: '15', label: <div style={{ backgroundColor: '#c3f3fa' }}>06:00 - 07:30 - Weekdays</div> },
                                // ]}
                                
                            />
                                {errors.batchTime && <p className="text-red-500 text-sm">{errors.batchTime}</p>}
                            </div>


                            {/* Batch Start And End Date  */}
                            <div className="col-span-2">
                            <label className={`block mb-2 text-sm font-medium ${theme.text}`}>Batch Start and End Date</label>
                            {/* <Datepicker title="Batch start Date" />
                            <Datepicker title="Batch End Date" /> */}
                            <RangePicker size={"large"} required
                                value={[
                                    batchFormData?.startDate ? dayjs(batchFormData.startDate, "YYYY-MM-DD") : null,
                                    batchFormData?.endDate ? dayjs(batchFormData.endDate, "YYYY-MM-DD") : null,
                                ]}
                                onChange={(value) => {
                                    if (value && value.length === 2) {
                                    handleChange("startDate", value[0]);
                                    handleChange("endDate", value[1]);
                                    }
                            }}/>
                            
                            </div>

                            {/* Dropdown for Course Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="course" className={`block mb-2 text-sm font-medium ${theme.text}`}>Course</label>
                                <Select name="course" className='w-full border-gray-300' size='large' placeholder='Select Course' 
                                    showSearch  // This enables search functionality
                                        
                                    onChange={(value) => handleChange("course", value)} 
                                    value={batchFormData.course ? batchFormData.course : []}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                    }
                                    options={coursesData.map(course => ({
                                        value: course.id,
                                        label: course.name,
                                    }))}
                                />
                                {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
                            </div>
    
                            {/* Dropdown for Preferred Week Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="preferredWeek" className={`block mb-2 text-sm font-medium ${theme.text}`}>Preferred Week</label>
                                <Select name="preferredWeek"  value={batchFormData.preferredWeek.length > 0 ? batchFormData.preferredWeek : null} onChange={(value) => handleChange("preferredWeek", value)} className='w-full border-gray-300' size='large' placeholder='Select Preferred Week' 
                                options={[
                                            { value: 'Weekdays', label: 'Week Days' },
                                            { value: 'Weekends', label: 'Weekends' },
                                        ]}
                                />
                                {errors.preferredWeek && <p className="text-red-500 text-sm">{errors.preferredWeek}</p>}
                            </div>

                            {/* Dropdown for Mode Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="mode" className={`block mb-2 text-sm font-medium ${theme.text}`}>Mode</label>
                                <Select name="mode" value={batchFormData.mode.length > 0 ? batchFormData.mode : null} onChange={(value) => handleChange("mode", value)} className='w-full border-gray-300' size='large' placeholder='Select Mode' 
                                    options={[
                                                { value: 'Offline', label: 'Offline' },
                                                { value: 'Online', label: 'Online' },
                                                { value: 'Hybrid', label: 'Hybrid' },
                                            ]} 
                                    />
                                {errors.mode && <p className="text-red-500 text-sm">{errors.mode}</p>}
                            </div>

                            {/* Dropdown for Language Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="language" className={`block mb-2 text-sm font-medium ${theme.text}`}>Language</label>
                                <Select name="language" value={batchFormData.language.length > 0 ? batchFormData.language : null} onChange={(value) => handleChange("language", value)} className='w-full border-gray-300' size='large' placeholder='Select Language' 
                                options={[
                                            { value: 'Hindi', label: 'Hindi', },
                                            { value: 'English', label: 'English' },
                                            { value: 'Both', label: 'Both' },
                                        ]}
                                />
                                {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                            </div>

                            {/* Dropdown for Location Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="location" className={`block mb-2 text-sm font-medium ${theme.text}`}>Location</label>
                                <Select name="location" value={batchFormData.location ? String(batchFormData.location) : null} onChange={(value) => handleChange("location", value)} className='w-full border-gray-300' size='large' placeholder='Select Location' 
                                options={[
                                            { value: '1', label: 'Saket' },
                                            { value: '2', label: 'Laxmi Nagar' },
                                        ]}
                                />
                                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                            </div>

                            {/* Dropdown for Trainer Selection */}
                            <div className="col-span-2 sm:col-span-2">
                                <label htmlFor="trainer" className={`block mb-2 text-sm font-medium ${theme.text}`}>Trainer</label>
                                <Select name="trainer" className='w-full border-gray-300' size='large' placeholder="Select Trainer" 
                                showSearch  // This enables search functionality
                                        
                                onChange={(value) => handleChange("trainer", value)} 
                                value={batchFormData.trainer || ""}                            
                                filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                }
                                options={Array.isArray(trainerData?.all_data?.trainers)  // Check if trainerData.trainer is an array
                                    ? trainerData?.all_data?.trainers.map(trainer => ({
                                        value: trainer.id,  // Ensure ID is unique
                                        label: trainer.name, // Display trainer name as the label
                                    }))
                                    : []
                                }
                                
                                />
                                {/* {errors.trainer && <p className="text-red-500 text-sm">{errors.trainer}</p>} */}
                            </div>


                            {/* Dropdown for Student Selection */}
                            <div className="col-span-5 sm:col-span-5">
                                <label htmlFor="student" className={`block mb-2 text-sm font-medium ${theme.text}`}>Add Students</label>
                                <Select name="student" mode="multiple" className='w-full border-gray-300' size='large' placeholder='Select Students' 
                                showSearch  // This enables search functionality
                                        
                                onChange={(value) => handleChange("student", value)} 
                                value={batchFormData.student ? batchFormData.student : []}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                }
                                options={Array.isArray(allStudentData) && allStudentData.length > 0 
                                    ? allStudentData.map(student => ({
                                        value: student.id,
                                        label: `${student.name} - ${student.phone}`, // Show name and phone
                                        phone: student.phone, // Store phone if necessary
                                      }))
                                    : []  // Fallback to an empty array if studentData is empty or not loaded
                                  }
                                optionRender={(option) => (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        {/* Left-aligned student name & phone */}
                                        <span style={{ flex: 1 }}>{option.data.label}</span>
                                
                                        {/* Right-aligned icons */}
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <Tooltip title="Copy Phone Number">
                                                <CopyOutlined
                                                    style={{ cursor: "pointer", color: "#1890ff" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(option.data.phone);
                                                    }}
                                                />
                                            </Tooltip>
                                            
                                            <Tooltip title="Open Student Info">
                                                <RightOutlined
                                                    style={{ cursor: "pointer", color: "blue" }}
                                                    onClick={(e) => {
                                                        handleStudentClickOnSelect(e, option.data.value);
                                                    }}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                )}
                                />
                                {errors.trainer && <p className="text-red-500 text-sm">{errors.trainer}</p>}
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
                        ) : isEditing ? "Save Changes" : "Create batch"}
                    </button>
                    </div>
                    </form>
                </div>
             </div>
         </div>
     );
 };
 
 export default CreateBatchForm;
 
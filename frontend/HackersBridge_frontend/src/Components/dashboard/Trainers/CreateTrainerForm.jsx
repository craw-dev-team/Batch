import { useState, useEffect } from 'react';
import { DatePicker, Select, Input, message, Checkbox  } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useTrainerForm } from '../Trainercontext/TrainerFormContext';
import { useCourseForm } from '../Coursecontext/CourseFormContext';
import { useCoordinatorForm } from '../AddDetails/Coordinator/CoordinatorContext';
import axios from 'axios';
import BASE_URL from '../../../ip/Ip';
import dayjs from 'dayjs';
import { useAuth } from '../AuthContext/AuthContext';


const CreateTrainerForm = ({ isOpen, onClose, selectedTrainerData }) => {
    if(!isOpen) return null;

    const isEditing = Boolean(selectedTrainerData?.id); 
    const { trainerFormData, setTrainerFormData, errors, setErrors, trainerData, fetchTrainers, resetTrainerForm } = useTrainerForm();
    const { coursesData, fetchCourses  } = useCourseForm();
    const { coordinatorData, fetchCoordinators } = useCoordinatorForm();
    const { token } = useAuth();

    const [ loading, setLoading] = useState(false);
 // fetching trainers and assigning prefilled value to fields in form 
 useEffect(() => {
    fetchCourses();
    fetchTrainers();
    fetchCoordinators()
    
    
    if (selectedTrainerData) {
        setTrainerFormData({
            trainerId: selectedTrainerData.trainer_id || "",
            trainerName: selectedTrainerData.name || "",
            trainerEmailAddress: selectedTrainerData.email || "",  
            trainerPhoneNumber: selectedTrainerData.phone || "", 
            trainerDateOfJoining: selectedTrainerData.date_of_joining || "",
            trainerExperience: selectedTrainerData.experience || "",
            trainerCourse: selectedTrainerData.course || [],
            trainerLanguage: selectedTrainerData.languages || "",
            trainerWeekOff: selectedTrainerData.weekoff || "",
            location: selectedTrainerData.location || "",
            isTeamLeader: selectedTrainerData.is_teamleader || "",
            trainerTeamLeader: selectedTrainerData.teamleader || "",
            trainerCoordinator: selectedTrainerData.coordinator || "",
            trainerTimeSlot: selectedTrainerData.timeslot || [],
            
        });   

    } else {
        resetTrainerForm();
    }
    }, []);
    

    //handle change of input fields  
    const handleChange = (name, value) => {
        setTrainerFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };



    // Validation function for input fields 
    const validateForm = () => {
        let newErrors = {};

        if(!trainerFormData.trainerId) newErrors.trainerId = "Trainer Id is required";
        if(!trainerFormData.trainerName) newErrors.trainerName = "Trainer Name is required";
        if(!trainerFormData.trainerDateOfJoining || trainerFormData.trainerDateOfJoining.length === 0) newErrors.trainerDateOfJoining = "Joining Date is required";
        if(!trainerFormData.trainerPhoneNumber) newErrors.trainerPhoneNumber = "Phone Number is required";
        if(!trainerFormData.trainerEmailAddress) newErrors.trainerEmailAddress = "Email Address id required";
        if(!trainerFormData.trainerExperience || trainerFormData.trainerExperience.length === 0) newErrors.trainerExperience = "Trainer Experience is required";
        if(!trainerFormData.trainerCourse || trainerFormData.trainerCourse.length === 0) newErrors.trainerCourse = "Course is required";
        if(!trainerFormData.trainerLanguage || trainerFormData.trainerLanguage.length === 0) newErrors.trainerLanguage = "language is required";
        // if(!trainerFormData.trainerTeamLeader || trainerFormData.trainerTeamLeader.length === 0) newErrors.trainerTeamLeader = "Team Leader is required";
        if(!trainerFormData.trainerCoordinator || trainerFormData.trainerCoordinator.length === 0) newErrors.trainerCoordinator = "Team Leader is required";
        if(!trainerFormData.location || trainerFormData.location.length === 0) newErrors.location = "Location is required";
        if(!trainerFormData.trainerWeekOff || trainerFormData.trainerWeekOff.length === 0) newErrors.trainerWeekOff = "Location is required";
        if(!trainerFormData.trainerTimeSlot || trainerFormData.trainerTimeSlot.length === 0) newErrors.trainerTimeSlot = "Time Slot is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return; // Stop submission if validation fails
        
        // Convert necessary fields to integers
        const formattedData = {
            ...trainerFormData,
            location: parseInt(trainerFormData.location, 10) || null,
            trainerTeamLeader: parseInt(trainerFormData.trainerTeamLeader, 10) || "",
            trainerCoordinator: parseInt(trainerFormData.trainerCoordinator, 10) || null,
            trainerDateOfJoining: trainerFormData.trainerDateOfJoining  && dayjs(trainerFormData.trainerDateOfJoining).isValid() 
            ? dayjs(trainerFormData.trainerDateOfJoining).format("YYYY-MM-DD") 
            : null,
        };


            const payload = {
                trainer_id: formattedData.trainerId,
                name: formattedData.trainerName,
                email: formattedData.trainerEmailAddress,
                phone: formattedData.trainerPhoneNumber,
                date_of_joining: formattedData.trainerDateOfJoining,
                experience: formattedData.trainerExperience,
                course: formattedData.trainerCourse,
                languages: formattedData.trainerLanguage,
                weekoff: formattedData.trainerWeekOff,
                location: formattedData.location,
                is_teamleader: formattedData.isTeamLeader ? "true" : "false",
                teamleader: formattedData.isTeamLeader ? "" : formattedData.trainerTeamLeader,
                coordinator: formattedData.trainerCoordinator,
                timeslot: formattedData.trainerTimeSlot,
                // profile_picture: studentFormData.studentProfilePicture,
            };

            // console.log("Final Payload:", JSON.stringify(payload, null, 2));

            try {
                setLoading(true); // Start loading
    
                let response;
                let successMessage = "";
                
                if (selectedTrainerData && selectedTrainerData.id) {
                    // Update existing course (PUT)
                    response = await axios.put(`${BASE_URL}/api/trainers/edit/${selectedTrainerData.id}/`, payload, {
                        headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` }
                    });
                    successMessage = "Trainer updated successfully!";
                    } else {
                        // Add new course (POST)
                        response = await axios.post(`${BASE_URL}/api/trainers/add/`, payload, {
                            headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` }
                        });
                        successMessage = "Trainer added successfully!";
                    }
    
                    if (response.status >= 200 && response.status < 300) {
                        message.success(successMessage);
                        setTimeout(() => {
                            setLoading(false);
                            onClose();
                            resetTrainerForm();
                        }, 1000);
                    }
      
            } catch (error) {
                setLoading(false);
            
                if (error.response) {
                    console.error("Server Error Response:", error.response.data);
            
                    // Extract error messages and show each one separately
                    Object.entries(error.response.data).forEach(([key, value]) => {
                        value.forEach((msg) => {
                            message.error(`${msg}`);
                        });
                    });
                } else if (error.request) {
                    console.error("No Response from Server:", error.request);
                    message.error("No response from server. Please check your internet connection.");
                } else {
                    console.error("Error Message:", error.message);
                    message.error("An unexpected error occurred.");
                }
            }       
    }

    // FOR RESETTING ERRORS 
    const resetErrors = () => {
        setErrors({}); // Clear all errors
    };

    const handleClose = () => {
        resetErrors(); // Clear errors when modal closes
        onClose(); // Close the modal
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="relative p-2 w-4/6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditing ? "Edit Trainer" : "Add New Trainer"}
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
                <div className="max-h-[700px] overflow-y-auto p-4 md:p-5">
                    <form className="p-4 md:p-5" onSubmit={handleFormSubmit}>
                   <div className="grid gap-4 mb-4 grid-cols-3">
                       <div className="col-span-1">
                           <label htmlFor="trainerId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer Id</label>
                            <Input name="trainerId" value={trainerFormData.trainerId}  onChange={(e) => handleChange("trainerId", e.target.value)} disabled={isEditing} className='rounded-lg border-gray-300' placeholder="Enter Trainer Id" />
                       </div>
                       
                       {/*  Trainer Name  */}
                       <div className="col-span-1">
                            <label htmlFor="trainerName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer Name</label>
                            <Input name="trainerName" value={trainerFormData.trainerName} className='rounded-lg border-gray-300' placeholder="Enter Trainer Name" 
                            onChange={(e) => {
                                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove non-alphabetic characters
                                handleChange("trainerName", inputValue);
                            }}
                            />
                            {errors.trainerName && <p className="text-red-500 text-sm">{errors.trainerName}</p>}
                       </div>


                       {/* Trainer Date of Joining  */}
                       <div className="col-span-1">
                            <label htmlFor="trainerDateOfJoining" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Joining Date</label>
                            <DatePicker name='trainerDateOfJoining' value={trainerFormData.trainerDateOfJoining ? dayjs(trainerFormData.trainerDateOfJoining, "YYYY-MM-DD") : null} onChange={(date, dateString) => setTrainerFormData({ ...trainerFormData, trainerDateOfJoining: dateString })} className='w-full border-gray-300' size='large'  placeholder="Select Joining Date"/>                       
                            {errors.trainerDateOfJoining && <p className="text-red-500 text-sm">{errors.trainerDateOfJoining}</p>}
                        </div>

                       {/* Trainer Phone Number */}
                       <div className="col-span-1">
                            <label htmlFor="trainerPhoneNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Phone Number</label>
                            <Input name="trainerPhoneNumber" value={trainerFormData.trainerPhoneNumber} className='rounded-lg border-gray-300'  size='large' placeholder='Enter Phone Number' 
                                onChange={(e) => {
                                    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric values
                                    if (inputValue.length <= 10) {
                                        handleChange("trainerPhoneNumber", inputValue);
                                    }
                                }} 
                            />
                            {errors.trainerPhoneNumber && <p className="text-red-500 text-sm">{errors.trainerPhoneNumber}</p>}
                       </div>

                        {/* Trainer Email Address */}
                        <div className="col-span-1">
                            <label htmlFor="trainerEmailAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Email Address</label>
                            <Input name="trainerEmailAddress" value={trainerFormData.trainerEmailAddress} className='rounded-lg border-gray-300' placeholder="Enter Email Address" 
                                onChange={(e) => {
                                    const inputValue = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""); // Allow email characters
                                    handleChange("trainerEmailAddress", inputValue);
                                }}
                            />
                            {errors.trainerEmailAddress && <p className="text-red-500 text-sm">{errors.trainerEmailAddress}</p>}
                        </div>

                       
                       {/* Dropdown for Years of Experience Selection */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="trainerExperience" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Experience</label>
                            <Select name="trainerExperience" value={trainerFormData.trainerExperience.length > 0 ? trainerFormData.trainerExperience : null } onChange={(value) => handleChange("trainerExperience", value)} className='w-full border-gray-300' size='large' placeholder="select trainer's Experience" 
                                options={[
                                            { value: 'Fresher', label: 'Fresher' },
                                            { value: 'Less Than 1 Year', label: 'Less Than 1 Year' },
                                            { value: '1 Year', label: '1 Year' },
                                            { value: '2 Year', label: '2 Year' },
                                            { value: '3 Year', label: '3 Year' },
                                            { value: 'More Than 3 Year', label: 'More Than 3 Year' },
                                        ]}
                            />
                            {errors.trainerExperience && <p className="text-red-500 text-sm">{errors.trainerExperience}</p>}
                        </div>
                       


                        {/* Dropdown for trainer course Selection */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="trainerCourse" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Courses</label>
                            <Select name="trainerCourse" mode='multiple' className='w-full border-gray-300' size='large' placeholder='Select Courses' 
                               showSearch  // This enables search functionality
                                    
                               onChange={(value) => handleChange("trainerCourse", value)} 
                               value={Array.isArray(trainerFormData.trainerCourse) ? trainerFormData.trainerCourse : []}
                               filterOption={(input, option) =>
                                   option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                               }
                               options={coursesData.map(course => ({
                                   value: course.id,
                                   label: course.name,
                               }))}
                            />
                            {errors.trainerCourse && <p className="text-red-500 text-sm">{errors.trainerCourse}</p>}
                       </div>

                        {/* Dropdown for Trainer's Mode Selection */}
                        {/* <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="trainerMode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mode</label>
                            <Select name="trainerMode" value={trainerFormData.trainerMode.length > 0 ? trainerFormData.trainerMode : null }  onChange={(value) => handleChange("trainerMode", value)} className='w-full border-gray-300' size='large' placeholder='Select Mode' 
                                options={[
                                            { value: 'Offline', label: 'Offline' },
                                            { value: 'online', label: 'Online' },
                                            { value: 'hybrid', label: 'Hybrid' },
                                        ]}
                            />
                            {errors.trainerMode && <p className="text-red-500 text-sm">{errors.trainerMode}</p>}
                       </div> */}


                        {/* Dropdown for Trainer's Language Selection */}
                        <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="trainerLanguage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Languages</label>
                           <Select name="trainerLanguage" value={trainerFormData.trainerLanguage.length > 0 ? trainerFormData.trainerLanguage : null } onChange={(value) => handleChange("trainerLanguage", value)} className='w-full border-gray-300' size='large' placeholder='Select Languages' 
                                options={[
                                            { value: 'Hindi', label: 'Hindi' },
                                            { value: 'English', label: 'English' },
                                            { value: 'Both', label: 'Both' },
                                        ]}
                            />
                            {errors.trainerLanguage && <p className="text-red-500 text-sm">{errors.trainerLanguage}</p>}
                       </div>

                       {/* Dropdown for Trainer's Preferred Week Selection */}
                       {/* <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="trainerPreferredWeek" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Preferred Week</label>
                           <Select name="trainerPreferredWeek" value={trainerFormData.trainerPreferredWeek.length > 0 ? trainerFormData.trainerPreferredWeek : null } onChange={(value) => handleChange("trainerPreferredWeek", value)} className='w-full border-gray-300' size='large' placeholder='Select Preferred Week' 
                                options={[
                                            { value: 'weekdays', label: 'Week Days' },
                                            { value: 'weekends', label: 'Weekends' }, 
                                            { value: 'both', label: 'Both' },
                                        ]}
                            />
                            {errors.trainerPreferredWeek && <p className="text-red-500 text-sm">{errors.trainerPreferredWeek}</p>}
                       </div> */}

                        {/* Dropdown for Trainer's Team Leader Selection */}
                        <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="trainerTeamLeader" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Team Leader</label>
                            <div className='flex'>
                            <Checkbox  onChange={(e) => handleChange("isTeamLeader", e.target.checked)}></Checkbox>  
                            <Select name="trainerTeamLeader"  disabled={trainerFormData.isTeamLeader} className='ml-4 w-full border-gray-300' size='large' placeholder='Select Team Leader' 
                               showSearch  // This enables search functionality
                                    
                               onChange={(value) => handleChange("trainerTeamLeader", value)} 
                               value={trainerFormData.trainerTeamLeader || "Mohit Yadav" }
                               filterOption={(input, option) =>
                                   option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                               }
                               options={trainerData?.all_data?.teamleaders  // Check if selectedTrainerData.trainer is an array
                                ? trainerData?.all_data?.teamleaders.map(trainer => ({
                                    value: trainer.id,  // Ensure ID is unique
                                    label: trainer.name, // Display trainer name as the label
                                }))
                                : []
                            }
                            />
                            {errors.trainerTeamLeader && <p className="text-red-500 text-sm">{errors.trainerTeamLeader}</p>}
                            </div>
                       </div>

                        {/* Dropdown for trainer's Coordinator Selection */}
                        <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="trainerCoordinator" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Coordinator</label>
                           <Select name="trainerCoordinator" className='w-full border-gray-300' size='large' placeholder='Select Coordinator' 
                                showSearch  // This enables search functionality
                                    
                                onChange={(value) => handleChange("trainerCoordinator", value)} 
                                value={trainerFormData.trainerCoordinator ? trainerFormData.trainerCoordinator : undefined}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                }
                                options={coordinatorData.map(coordinator => ({
                                    value: coordinator.id,
                                    label: coordinator.name,
                                }))}
                            />
                            {errors.trainerCoordinator && <p className="text-red-500 text-sm">{errors.trainerCoordinator}</p>}
                       </div>

                        {/* Dropdown for Location Selection */}
                        <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                           <Select name="location" value={trainerFormData.location ? String(trainerFormData.location) : null} onChange={(value) => handleChange("location", value)} className='w-full border-gray-300' size='large' placeholder='Select Location' 
                            options={[
                                        { value: '1', label: 'Saket' },
                                        { value: '2', label: 'Laxmi Nagar' },
                                    ]}
                            />
                            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                       </div>

                        {/* Dropdown for Trainer's Week Off Selection */}
                        <div className="col-span-1 sm:col-span-1">
                           <label htmlFor="trainerWeekOff" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Week Off</label>
                           <Select name="trainerWeekOff" value={trainerFormData.trainerWeekOff.length > 0 ? trainerFormData.trainerWeekOff : null } onChange={(value) => handleChange("trainerWeekOff", value)} className='w-full border-gray-300' size='large' placeholder='Select Week Off' 
                                options={[
                                            { value: 'Monday', label: 'Monday' },
                                            { value: 'Tuesday', label: 'Tuesday' },
                                            { value: 'Wednesday', label: 'Wednesday' },
                                            { value: 'Thursday', label: 'Thursday' },
                                            { value: 'Friday', label: 'Friday' },
                                            { value: 'Saturday', label: 'Saturday' },
                                            { value: 'Sunday', label: 'Sunday' },
                                        ]}
                            />
                            {errors.trainerWeekOff && <p className="text-red-500 text-sm">{errors.trainerWeekOff}</p>}
                        </div>
                        
                         {/* Dropdown for Trainer's Time Slot Selection */}
                         <div className="col-span-1 sm:col-span-2">
                           <label htmlFor="trainerTimeSlot" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer's Time Slot</label>
                           <Select name="trainerTimeSlot" mode='multiple' className='w-full border-gray-300' size='large' placeholder='Select Trainer Time Slot' 
                                value={Array.isArray(trainerFormData?.trainerTimeSlot) && trainerFormData?.trainerTimeSlot.length > 0
                                    ? trainerFormData.trainerTimeSlot.map(id => String(id))  // Convert IDs to strings
                                    : []
                                }
                                onChange={(selectedValues) => {
                                    setTrainerFormData(prev => ({
                                        ...prev,
                                        trainerTimeSlot: selectedValues.map(Number),  // Convert back to numbers if needed
                                    }));
                                }}
                                options={[
                                    { value: '1', label: '10:00 - 12:00' },
                                    { value: '2', label: '12:00 - 02:00' },
                                    { value: '3', label: '03:00 - 05:00' },
                                    { value: '4', label: '05:00 - 06:30' },
                                    { value: '9', label: '06:00 - 07:00' },
                                    { value: '7', label: '07:00 - 09:00' },
                                    { value: '8', label: '10:00 - 05:00' },
                                    { value: '5', label: '10:00 - 02:00 - Weekends' },
                                    { value: '10', label: '12:30 - 02:30 - Weekdays' },
                                    { value: '11', label: '07:00 - 08:30 - Weekdays' },
                                    { value: '12', label: '05:00 - 07:00 - Weekdays' },
                                    { value: '13', label: '08:00 - 09:00 - Weekdays' },
                                    { value: '14', label: '03:00 - 06:30 - Weekends' },
                                    { value: '15', label: '07:00 - 08:30 - Weekdays' },
                                ]}
                            />
                            {errors.trainerTimeSlot && <p className="text-red-500 text-sm">{errors.trainerTimeSlot}</p>}
                       </div>


                   </div>

                  <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading} // Disable button when loading
                    className={`text-white inline-flex items-center font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 focus:ring-green-300"}
                        `}
                >
                    {loading ? (
                        <>
                            <SyncOutlined spin className="mr-2" />
                            Processing...
                        </>
                    ) : isEditing ? "Save Changes" : "Add Trainer"}
                </button>
                  </div>
                    </form>
               </div>
            </div>
        </div>
    );
}

export default CreateTrainerForm;
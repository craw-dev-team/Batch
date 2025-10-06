import { useState, useEffect, useMemo } from 'react';
import { DatePicker, Select, Input, Checkbox, message } from 'antd';
import { SyncOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useCourseForm } from '../Coursecontext/CourseFormContext';
import dayjs from "dayjs";
import { useCoordinatorForm } from '../AddDetails/Coordinator/CoordinatorContext';
import { useCounsellorForm } from '../AddDetails/Counsellor/CounsellorContext';
import { useStudentForm } from '../Studentcontext/StudentFormContext';
import { useTagContext } from '../Tags/TagsContext';
import axiosInstance from '../api/api';
import { useTheme } from '../../Themes/ThemeContext';


const { TextArea } = Input;




const CreateStudentForm = ({ isOpen, onClose, selectedStudentData, currentFilters }) => {
    if(!isOpen) return null;

    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const isEditing = Boolean(selectedStudentData?.id); 

    const { studentFormData, setStudentFormData, errors, setErrors, resetStudentForm, fetchStudents } = useStudentForm();
    const { coursesData, fetchCourses  } = useCourseForm();
    const { coordinatorData, fetchCoordinators } = useCoordinatorForm();
    const { counsellorData, fetchCounsellors } = useCounsellorForm();
    const { tagData, fetchTagData} = useTagContext();

    const [ loading, setLoading] = useState(false);
    // store visibility of alternate phone number of student
    const [showAltPhone, setShowAltPhone] = useState(false);
    // store courses in which student enrolled
    const [selectedCourses, setSelectedCourses] = useState([]);
    // store student's completed courses  
    const [completedCourses, setCompletedCourses] = useState([]);

    // fetching students and assigning prefilled value to fields in form 
       useEffect(() => {
        fetchCourses();
        fetchCoordinators();
        fetchCounsellors();
        fetchTagData();
        
        if (selectedStudentData) {
            setStudentFormData({
                enrollmentNumber: selectedStudentData.enrollment_no || "",
                studentName: selectedStudentData.name || "",
                dateOfBirth: selectedStudentData.dob || "",  
                // dateOfJoining: selectedStudentData.date_of_joining || "", 
                dateOfJoining: selectedStudentData.date_of_joining 
                ? dayjs(selectedStudentData.date_of_joining, "YYYY-MM-DD").format("DD/MM/YYYY") 
                : "", 
                phoneNumber: selectedStudentData.phone || "",
                alternatePhoneNumber: selectedStudentData.alternate_phone || "",
                emailAddress: selectedStudentData.email || "",
                course: selectedStudentData.courses || [], 
                completedCourse: selectedStudentData.complete_course_id || [],
                studentAddress: selectedStudentData.address || "",
                language: selectedStudentData.language || "",
                mode: selectedStudentData.mode || "",
                preferredWeek: selectedStudentData.preferred_week || "",
                location: selectedStudentData.location || "",
                guardianName: selectedStudentData.guardian_name || "",
                guardianPhoneNumber: selectedStudentData.guardian_no || "",
                courseCounsellor: selectedStudentData.course_counsellor || "",
                supportCoordinator: selectedStudentData.support_coordinator || "",
                note: selectedStudentData.note || "",
                tags: Array.isArray(selectedStudentData.tags_values)
                    ? selectedStudentData.tags_values.map(tag => tag.id)
                    : [],


            });
            console.log(selectedStudentData);
            
            
            setSelectedCourses(selectedStudentData.courses || []);  // Set IDs for Enrolled Courses
            setCompletedCourses(selectedStudentData.complete_course_id || []); 

        } else {
            resetStudentForm();
        }

    }, []);


    const tagList = Array.isArray(tagData?.data) ? tagData.data : [];


    //handle change of input fields  
    const handleChange = (name, value) => {
        setStudentFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };


      // Validation function
      const validateForm = () => {
        let newErrors = {};

        if (!studentFormData.studentName) newErrors.studentName = "Student Name is required";
        if (!studentFormData.enrollmentNumber) newErrors.enrollmentNumber = "Enrollment Number is required";
        if (!studentFormData.dateOfJoining || studentFormData.dateOfJoining.length === 0) newErrors.dateOfJoining = "Date Of Joining are required";
        if (!studentFormData.phoneNumber) newErrors.phoneNumber = "Phone Number is required";
        if (!studentFormData.emailAddress) newErrors.emailAddress = "Email Address is required";
        if (!studentFormData.language || studentFormData.language.length === 0) newErrors.language = "Language is required";
        if (!studentFormData.mode || studentFormData.mode.length === 0) newErrors.mode = "Mode is required";
        if (!studentFormData.preferredWeek || studentFormData.preferredWeek.length === 0) newErrors.preferredWeek = "Preferred Week is required";
        if (!studentFormData.location || studentFormData.location.length === 0) newErrors.location = "Location is required";
        if (!studentFormData.courseCounsellor || studentFormData.courseCounsellor.length === 0) newErrors.courseCounsellor = "Course Counsellor is required";
        if (!studentFormData.supportCoordinator || studentFormData.supportCoordinator.length === 0) newErrors.supportCoordinator = "Support Coordinator is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };


    // handle form submittion  
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return; // Stop submission if validation fails

        // Convert necessary fields to integers
        const formattedData = {
            ...studentFormData,
            phoneNumber: parseInt(studentFormData.phoneNumber, 10) || null,
            alternatePhoneNumber: studentFormData.alternatePhoneNumber ? parseInt(studentFormData.alternatePhoneNumber, 10) : null,
            guardianPhoneNumber: parseInt(studentFormData.guardianPhoneNumber, 10) || null,
            location: parseInt(studentFormData.location, 10) || null,
            courseCounsellor: parseInt(studentFormData.courseCounsellor, 10) || null,
            supportCoordinator: parseInt(studentFormData.supportCoordinator, 10) || null,
            dateOfBirth: studentFormData.dateOfBirth  && dayjs(studentFormData.dateOfBirth).isValid() 
            ? dayjs(studentFormData.dateOfBirth).format("YYYY-MM-DD") 
            : null,
            dateOfJoining: studentFormData.dateOfJoining && dayjs(studentFormData.dateOfJoining, "DD/MM/YYYY").isValid()
            ? dayjs(studentFormData.dateOfJoining, "DD/MM/YYYY").format("YYYY-MM-DD")  // convert to "YYYY-MM-DD"
            : null,
        };

        
        const payload = {
            enrollment_no: formattedData.enrollmentNumber,
            name: formattedData.studentName,
            dob: formattedData.dateOfBirth,
            date_of_joining: formattedData.dateOfJoining,
            phone: formattedData.phoneNumber,
            alternate_phone: formattedData.alternatePhoneNumber,
            email: formattedData.emailAddress,
            courses: Array.isArray(selectedCourses) ? selectedCourses : [],
            complete_course: Array.isArray(completedCourses) ? completedCourses : [],
            address: formattedData.studentAddress,
            language: formattedData.language,
            mode: formattedData.mode,
            preferred_week: formattedData.preferredWeek,
            location: formattedData.location,
            guardian_name: formattedData.guardianName,
            guardian_no: formattedData.guardianPhoneNumber,
            course_counsellor: formattedData.courseCounsellor,
            support_coordinator: formattedData.supportCoordinator,
            note: formattedData.note,
            tags:formattedData.tags,
        };

        try {
            setLoading(true); // Start loading

            let response;
            let successMessage = "";

            if (selectedStudentData && selectedStudentData.id) {
                // Update existing course (PUT)
                response = await axiosInstance.put(`/api/students/edit/${selectedStudentData.id}/`, payload );
                    successMessage = "Student updated successfully!";
                } else {
                    // Add new course (POST)
                    response = await axiosInstance.post(`/api/students/add/`, payload );
                        successMessage = "Student added successfully!";
                };
                
                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetStudentForm();
                        fetchStudents(currentFilters, true);
                    }, 1000);
                };
  
        } catch (error) {
            setLoading(false);
        
            if (error.response) {
                console.error("Server Error Response:", error.response);

                // Extract and handle error messages
                Object.entries(error.response.data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                    value.forEach((msg) => {
                        message.error(`${msg}`);
                    });
                    } else {
                    message.error(`${value}`);
            }
        });
        } else if (error.request) {
            console.error("No Response from Server:", error.request);
            message.error("No response from server. Please check your internet connection.");
        } else {
            console.error("Error Message:", error.message);
            message.error("An unexpected error occurred.");
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


    // Handle changes in "Select Courses" dropdown
    const handleCourseChange = (selectedValues) => {
        setSelectedCourses(selectedValues);
    };
    
    
    
    
    const handleCompletedCourseChange = (selectedValues) => {
        setCompletedCourses(selectedValues);
    };
    
    


    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 overflow-y-scroll">
            <div className={`relative p-2 w-4/6 rounded-xl shadow-lg ${theme.specificPageBg}`}>
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                    <h3 className={`text-lg font-semibold ${theme.text}`}>
                        {isEditing ? "Edit Student" : "Add New Student"}
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
                    <div className="grid gap-4 mb-0 grid-cols-4">
                        <div className="col-span-1">
                            <label htmlFor="enrollmentNumber" className={`block mb-2 text-sm font-medium ${theme.text}`}>Enrollment Number</label>
                            <Input name="enrollmentNumber" value={studentFormData.enrollmentNumber} onChange={(e) => handleChange("enrollmentNumber", e.target.value)} disabled={isEditing} className='rounded-lg border-gray-300' placeholder="Enter Enrollment Number" />
                            {errors.enrollmentNumber && <p className="text-red-500 text-sm">{errors.enrollmentNumber}</p>}
                        </div>
                        
                        {/*  Student Name  */}
                        <div className="col-span-1">
                            <label htmlFor="studentName" className={`block mb-2 text-sm font-medium ${theme.text}`}>Student Name</label>
                            <Input name="studentName" value={studentFormData.studentName} className='rounded-lg border-gray-300' placeholder="Enter Student Name" 
                                    onChange={(e) => {
                                        const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove non-alphabetic characters
                                        handleChange("studentName", inputValue);
                                        }}
                            />
                            {errors.studentName && <p className="text-red-500 text-sm">{errors.studentName}</p>}
                        </div>

                        {/* Student Date of Birth  */}
                        <div className="col-span-1">
                            <label htmlFor="dateOfBirth" className={`block mb-2 text-sm font-medium ${theme.text}`}>Student's Date of Birth</label>
                            <DatePicker name='dateOfBirth' value={studentFormData.dateOfBirth ? dayjs(studentFormData.dateOfBirth, "YYYY-MM-DD") : null}  onChange={(date, dateString) => setStudentFormData({ ...studentFormData, dateOfBirth: dateString })} className='w-full border-gray-300' size='large'  placeholder="Select Date of Birth"/>                       
                            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
                        </div>

                        {/* Phone Number */}
                        <div className="col-span-1 flex gap-2">
                            <div>
                                <label htmlFor="phoneNumber" className={`block mb-2 text-sm font-medium ${theme.text}`}>Phone Number</label>
                                <Input name="phoneNumber"  value={studentFormData.phoneNumber} className='rounded-lg border-gray-300'  placeholder='Enter Phone Number' 
                                    onChange={(e) => {
                                        const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric values
                                        if (inputValue.length <= 15) {
                                            handleChange("phoneNumber", inputValue);
                                        }
                                    }}
                                    />
                                
                                {showAltPhone && (
                                    <>
                                        <label htmlFor="alternatePhoneNumber" className={`block mb-2 text-sm font-medium ${theme.text}`}>
                                            Alternate Phone Number
                                        </label>
                                        <Input
                                            name="alternatePhoneNumber"
                                            value={studentFormData.alternatePhoneNumber || ""}
                                            className="rounded-lg border-gray-300"
                                            placeholder="Enter Alternate Phone Number"
                                            onChange={(e) => {
                                                const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric values
                                                if (inputValue.length <= 15) {
                                                    handleChange("alternatePhoneNumber", inputValue);
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                            <div className='flex items-end mb-3'>
                                {showAltPhone ? (
                                    <MinusCircleOutlined
                                        className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                        onClick={() => setShowAltPhone(false)}
                                    />
                                ) : (
                                    <PlusCircleOutlined
                                        className="text-green-500 text-lg cursor-pointer hover:text-green-700"
                                        onClick={() => setShowAltPhone(true)}
                                    />
                                )}
                            </div>
                                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                        </div>

                            {/* Email Address */}
                            <div className="col-span-1">
                                <label htmlFor="emailAddress" className={`block mb-2 text-sm font-medium ${theme.text}`}>Email Address</label>
                                <Input name="emailAddress" value={studentFormData.emailAddress} className='rounded-lg border-gray-300' placeholder="Enter Email Address" 
                                        onChange={(e) => {
                                            const inputValue = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, ""); // Allow email characters
                                            handleChange("emailAddress", inputValue);
                                        }}
                                />
                                {errors.emailAddress && <p className="text-red-500 text-sm">{errors.emailAddress}</p>}
                            </div>

                            {/* Text Area Adding Address */}
                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="studentAddress" className={`block mb-2 text-sm font-medium ${theme.text}`}>Student Address</label>
                                <TextArea name="studentAddress" value={studentFormData.studentAddress} onChange={(e) => handleChange("studentAddress", e.target.value)} placeholder="Add Address Here" autoSize size='large' />
                                    <div
                                        style={{
                                        margin: '24px 0',
                                        }}
                                />
                            </div>
                            

                        {/* Enrollment Date  */}
                        <div className="col-span-1">
                            <label htmlFor="dateOfJoining" className={`block mb-2 text-sm font-medium ${theme.text}`}>Enrollment Date</label>
                            <DatePicker name='dateOfJoining' value={studentFormData.dateOfJoining ? dayjs(studentFormData.dateOfJoining, "DD/MM/YYYY") : null}  className='w-full border-gray-300' size='large'  placeholder="Select Enrollment Date"
                                    format="DD/MM/YYYY"
                                    onChange={(date, dateString) =>
                                        setStudentFormData({
                                        ...studentFormData,
                                        dateOfJoining: date ? dayjs(date).format("DD/MM/YYYY") : null,  // Always store as "DD/MM/YYYY"
                                        })
                                    }
                            />                         
                            {errors.dateOfJoining && <p className="text-red-500 text-sm">{errors.dateOfJoining}</p>}
                            </div>

                            {/* Dropdown for Language Selection */}
                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="language" className={`block mb-2 text-sm font-medium ${theme.text}`}>Language</label>
                                <Select name="language" value={studentFormData.language.length > 0 ? studentFormData.language : null } onChange={(value) => handleChange("language", value)} className='w-full border-gray-300' size='large' placeholder='Select Language'
                                    options={[
                                                { value: 'Hindi', label: 'Hindi' },
                                                { value: 'English', label: 'English' },
                                                { value: 'Both', label: 'Both' },
                                            ]} 
                                />
                                    {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                             </div>

    
                        {/* Dropdown for Courses Selection */}
                        <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="course" className={`block mb-2 text-sm font-medium ${theme.text}`}>Enrolled Courses</label>
                            <Select name="course" mode="multiple" className='w-full border-gray-300' size='large' placeholder="select Courses" 
                                showSearch  
                                
                                onChange={(values) => handleCourseChange(values)}
                                value={selectedCourses}
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


                        {/* Dropdown for Completed Courses Selection */}
                        <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="completedCourse" className={`block mb-2 text-sm font-medium ${theme.text}`}>Completed Courses</label>
                            <Select name="completedCourse" mode="multiple" className='w-full border-gray-300' size='large' placeholder="select Completed Courses" 
                                showSearch 
                                
                                onChange={handleCompletedCourseChange}
                                value={completedCourses}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                }
                                options={coursesData
                                    .filter(course => selectedCourses.includes(course.id))
                                    .map(course => ({
                                        key: course.id, 
                                        value: course.id,
                                        label: course.name,
                                    }))
                                }
                                disabled={selectedCourses.length === 0} // Disable if no courses are selected
                            />
                        </div>


                            {/* Dropdown for Mode Selection */}
                            <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="mode" className={`block mb-2 text-sm font-medium ${theme.text}`}>Mode</label>
                            <Select name="mode" value={studentFormData.mode.length > 0 ? studentFormData.mode : null } onChange={(value) => handleChange("mode", value)} className='w-full border-gray-300' size='large' placeholder='Select Mode' 
                                    options={[
                                                    { value: 'Offline', label: 'Offline' },
                                                    { value: 'Online', label: 'Online' },
                                                    { value: 'Hybrid', label: 'Hybrid' },
                                                ]}
                                />
                                {errors.mode && <p className="text-red-500 text-sm">{errors.mode}</p>}
                        </div>

                            {/* Dropdown for Preferres Week Selection */}
                            <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="preferredWeek" className={`block mb-2 text-sm font-medium ${theme.text}`}>Preferred Week</label>
                            <Select name="preferredWeek" value={studentFormData.preferredWeek.length > 0 ? studentFormData.preferredWeek : null } onChange={(value) => handleChange("preferredWeek", value)} className='w-full border-gray-300' size='large' placeholder='Select Preferred Week' 
                                    options={[
                                                    { value: 'Weekdays', label: 'Weekdays' },
                                                    { value: 'Weekends', label: 'Weekends' },
                                                    { value: 'Both', label: 'Both' },
                                                ]}
                                />
                                {errors.preferredWeek && <p className="text-red-500 text-sm">{errors.preferredWeek}</p>}
                        </div>

                            {/* Dropdown for Location Selection */}
                            <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="location" className={`block mb-2 text-sm font-medium ${theme.text}`}>Location</label>
                            <Select name="location" value={studentFormData.location ? String(studentFormData.location) : null}  onChange={(value) => handleChange("location", value)} className='w-full border-gray-300' size='large' placeholder='Select Location' 
                                    options={[
                                                { value: '1', label: 'Saket' },
                                                { value: '2', label: 'Laxmi Nagar' },
                                                { value: '3', label: 'Both' },
                                            ]}
                                />
                                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                        </div>

                        {/*  Student's Guardian Name  */}
                        <div className="col-span-1">
                            <label htmlFor="guardianName" className={`block mb-2 text-sm font-medium ${theme.text}`}>Guardian Name</label>
                            <Input name="guardianName" value={studentFormData.guardianName} className='rounded-lg border-gray-300' placeholder="Enter Guardian Name" 
                                    onChange={(e) => {
                                        const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Remove non-alphabetic characters
                                        handleChange("guardianName", inputValue);
                                    }}
                            />
                            {/* {errors.guardianName && <p className="text-red-500 text-sm">{errors.guardianName}</p>} */}
                        </div>


                            {/* Guardian Phone Number */}
                            <div className="col-span-1">
                            <label htmlFor="guardianPhoneNumber" className={`block mb-2 text-sm font-medium ${theme.text}`}>Guardian Phone Number</label>
                            <Input name="guardianPhoneNumber"  value={studentFormData.guardianPhoneNumber} className='rounded-lg border-gray-300'  size='large' placeholder='Enter Phone Number' 
                                    onChange={(e) => {
                                        const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric values
                                        if (inputValue.length <= 15) {
                                            handleChange("guardianPhoneNumber", inputValue);
                                        }
                                    }}
                            />
                            {/* {errors.guardianPhoneNumber && <p className="text-red-500 text-sm">{errors.guardianPhoneNumber}</p>} */}
                        </div>

                        {/* Dropdown for Course Counseller Selection */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="courseCounsellor" className={`block mb-2 text-sm font-medium ${theme.text}`}>Course Counsellor</label>
                            <Select name="courseCounsellor" className='w-full border-gray-300' size='large' placeholder='Select Course Counsellor' 
                                    showSearch  // This enables search functionality
                                        
                                    onChange={(value) => handleChange("courseCounsellor", value)} 
                                    value={studentFormData.courseCounsellor ? studentFormData.courseCounsellor : undefined}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                    }
                                    options={counsellorData.map(counsellor => ({
                                        value: counsellor.id,
                                        label: counsellor.name,
                                    }))}
                                />
                                {errors.courseCounsellor && <p className="text-red-500 text-sm">{errors.courseCounsellor}</p>}
                        </div>

                        {/* Dropdown for Support Coordinator Selection */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="supportCoordinator" className={`block mb-2 text-sm font-medium ${theme.text}`}>Support Coordinator</label>
                            <Select name="supportCoordinator" className='w-full border-gray-300' size='large' placeholder='Select Support Coordinator' 
                                showSearch  // This enables search functionality
                                        
                                onChange={(value) => handleChange("supportCoordinator", value)} 
                                value={studentFormData.supportCoordinator ? studentFormData.supportCoordinator : undefined}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                }
                                options={coordinatorData.map(coordinator => ({
                                    value: coordinator.id,
                                    label: coordinator.name,
                                }))}
                                />
                                {errors.supportCoordinator && <p className="text-red-500 text-sm">{errors.supportCoordinator}</p>}
                        </div>

                        
                        {/* Text Area for Adding Note */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="note" className={`block mb-2 text-sm font-medium ${theme.text}`}>Add Note</label>
                            <TextArea maxLength={1500} showCount name="note" value={studentFormData.note} onChange={(e) => handleChange("note", e.target.value)} placeholder="Add Note Here" autoSize size='large' />
                                <div
                                    style={{
                                    margin: '24px 0',
                                    }}
                                />
                        </div>


                        {/* Dropdown for Adding Tags */}
                        <div className="col-span-1 sm:col-span-1">
                            <label htmlFor="tags" className={`block mb-2 text-sm font-medium ${theme.text}`}>Add Tags</label>
                            <Select size='large'
                                mode="multiple"
                                showSearch
                                placeholder="Select Tags"
                                className="w-full border-gray-300"
                                name="tags"
                                value={studentFormData.tags || []}

                                onChange={(value) =>
                                setStudentFormData((prev) => ({ ...prev, tags: value }))
                                }
                                filterOption={(input, option) =>
                                option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                                options={tagList.map((tag) => ({
                                value: tag.id,
                                label: tag.tag_name,
                                tag_color: tag.tag_color,
                                }))}
                                optionRender={(option) => (
                                <div
                                    className="w-full px-1 py-1 rounded"
                                    style={{
                                    backgroundColor: `${option.data.tag_color}`, // light background using transparency
                                    // clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
                                    }}
                                >
                                    <span className="text-sm font-medium text-white">
                                    {option.label}
                                    </span>
                                </div>
                                )}
                            />
                        {errors?.tags && (
                            <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                        )}
                        <div style={{ margin: '24px 0' }} />
                        </div>        

                            {/* Text Area for Profile Picture */}
                            {/* <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="studentProfilePicture" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add Profile Picture</label>
                                    <div className='flex'>
                                    <Upload
                                        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                        listType="picture"
                                        >
                                        <Button type="primary" icon={<UploadOutlined />}>
                                        Upload
                                        </Button>
                                    </Upload>
                                    </div>
                            </div> */}

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
                        ) : isEditing ? "Save Changes" : "Add Student"}
                    </button>
                    </div>
                    </form>
               </div>
            </div>
        </div>
    );


}

export default CreateStudentForm
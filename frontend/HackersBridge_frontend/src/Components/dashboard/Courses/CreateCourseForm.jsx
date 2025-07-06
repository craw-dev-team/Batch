import { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import { Select, Input, Alert, Button, Spin, message   } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useCourseForm } from '../Coursecontext/CourseFormContext';
import BASE_URL from '../../../ip/Ip';
import { useAuth } from '../AuthContext/AuthContext';




const CreateCourseForm = ({ isOpen, onClose, selectedCourseData }) => {
    if(!isOpen) return null;
    
    const isEditing = Boolean(selectedCourseData?.id); 

    const { courseFormData, setCourseFormData, errors, setErrors, resetCourseForm } = useCourseForm();
    const [ loading, setLoading] = useState(false);

    // Reset form data when selectedCourseData changes (for Add or Edit mode)
    useEffect(() => {        
        if (selectedCourseData) {
            setCourseFormData({
                courseName: selectedCourseData.name || "",
                courseCode: selectedCourseData.code || "",
                courseDuration: selectedCourseData.duration || "",
                courseCertification: selectedCourseData.certification_body || "",
            });
        } else {
            resetCourseForm();
        }
    }, []);


    const handleChange = (name, value) => {
        setCourseFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

      // Validation function
      const validateForm = () => {
        let newErrors = {};

        if (!courseFormData.courseName) newErrors.courseName = "Course Name is required";
        if (!courseFormData.courseCode) newErrors.courseCode = "Course Code is required";
        if (!courseFormData.courseDuration) newErrors.courseDuration = "Course Duration is required";
        if (!courseFormData.courseCertification) newErrors.courseCertification = "Course Certification is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };


     // handle form submittion  
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return; // Stop submission if validation fails

            const payload = {
                name: courseFormData.courseName,
                code: courseFormData.courseCode,
                duration: courseFormData.courseDuration,
                certification_body: courseFormData.courseCertification,
            };
            // console.log("Final Payload:", JSON.stringify(payload, null, 2));

            try {
                setLoading(true); // Start loading

                let response;
                let successMessage = "";
                if (selectedCourseData && selectedCourseData.id) {
                // Update existing course (PUT)
                response = await axios.put(`${BASE_URL}/api/courses/edit/${selectedCourseData.id}/`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials : true
                }
                );
                    successMessage = "Course updated successfully!";
                } else {
                    // Add new course (POST)
                    response = await axios.post(`${BASE_URL}/api/courses/add/`, payload, {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials : true
                    }
                    );
                    successMessage = "Course added successfully!";
                }

                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetCourseForm();
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
            <div className="relative p-2 w-3/6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                         {isEditing ? "Edit Course" : "Add New Course"}
                    </h3>
                    <button
                       onClick={() => { handleClose() }}
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
                            <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Name</label>
                            <Input name="courseName" value={courseFormData.courseName}  onChange={(e) => handleChange("courseName", e.target.value)}  className='rounded-lg border-gray-300' placeholder="Enter Course Name" />
                            {errors.courseName && <p className="text-red-500 text-sm">{errors.courseName}</p>}
                        </div>
                        
                        {/*  Course Code Selection  */}
                        <div className="col-span-1">
                            <label htmlFor="courseCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Code</label>
                            <Input name="courseCode" value={courseFormData.courseCode}  className='rounded-lg border-gray-300' placeholder="Enter Course Code" onChange={(e) => handleChange("courseCode", e.target.value)} />
                            {errors.courseCode && <p className="text-red-500 text-sm">{errors.courseCode}</p>}
                        </div>
                        <div className="col-span-1">
                            <label htmlFor="courseDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Duration in Days</label>
                            <Input name="courseDuration" value={courseFormData.courseDuration} className='rounded-lg border-gray-300' placeholder="Enter Course Duration" onChange={(e) => handleChange("courseDuration", e.target.value)} />
                            {errors.courseDuration && <p className="text-red-500 text-sm">{errors.courseDuration}</p>}
                        </div>
    
                        {/* Dropdown for Course Duration Selection */}
                        {/* <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="courseDuration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Duration</label>
                                <Select name="courseDuration"  onChange={(value) => handleChange("courseDuration", value)} className='w-full border-gray-300' size='large' placeholder="select Course Duration" 
                                        options={[
                                                    { value: '3months', label: '3 Months' },
                                                    { value: '6months', label: '6 Months' },
                                                    { value: '1year', label: '1 Year', },
                                                ]}
                                />
                                {errors.courseDuration && <p className="text-red-500 text-sm">{errors.courseDuration}</p>}
                        </div> */}

                            {/* Dropdown for Course Certification Selection */}
                            <div className="col-span-1 sm:col-span-2">
                            <label htmlFor="courseCertification" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Certification</label>
                            <Input name="courseCertification" value={courseFormData.courseCertification} className='rounded-lg border-gray-300' placeholder="Enter Course Certification" onChange={(e) => handleChange("courseCertification", e.target.value)} />

                            {/* <Select name="courseCertification" value={formData.courseCertification}  onChange={(value) => handleChange("courseCertification", value)} className='w-full border-gray-300' size='large' placeholder="select Course Duration"
                                    options={[
                                                { value: 'comptia', label: 'Compatia' },
                                                { value: 'xyz', label: 'Xyz' },
                                            ]} 
                                /> */}
                                {errors.courseCertification && <p className="text-red-500 text-sm">{errors.courseCertification}</p>}
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
                        ) : isEditing ? "Save Changes" : "Add Course"}
                    </button>
                    </div>
                    </form>
                </div>
            </div>
            </div>
        </>
    )
};

export default CreateCourseForm;
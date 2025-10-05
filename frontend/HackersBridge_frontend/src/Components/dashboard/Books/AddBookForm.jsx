import { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import { Select, Input, Alert, Button, Spin, message   } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useBookForm } from '../BooksContext/BookFormContext';
import { useCourseForm } from '../Coursecontext/CourseFormContext';
import axiosInstance from '../api/api';
import { useTheme } from '../../Themes/ThemeContext';




const AddBookForm = ({ isOpen, onClose, selectedBookData }) => {
    if(!isOpen) return null;

    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------
    
    const isEditing = Boolean(selectedBookData?.id); 

    const { bookFormData, setBookFormData, errors, setErrors, resetBookForm } = useBookForm();
    const { coursesData, fetchCourses } = useCourseForm();
    
    const [ loading, setLoading] = useState(false);

    // Reset form data when courseData changes (for Add or Edit mode)
    useEffect(() => {
        fetchCourses();

        if (selectedBookData) {
            setBookFormData({
                bookCode: selectedBookData.book_id || "",
                bookName: selectedBookData.name || "",
                bookVersion: selectedBookData.version || "",
                course: selectedBookData.course || "",
                bookStock: selectedBookData.stock || "",
            });
        } else {
            resetBookForm();
        }
    }, []);


    const handleChange = (name, value) => {
        setBookFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };


     // handle form submittion  
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            
            const payload = {
                book_id: bookFormData.bookCode,
                name: bookFormData.bookName,
                version: bookFormData.bookVersion,
                course: parseInt(bookFormData.course),
                stock: parseInt(bookFormData.bookStock),
            };

            try {
                setLoading(true); // Start loading

                let response;
                let successMessage = "";
                if (selectedBookData && selectedBookData.id) {
                // Update existing course (PUT)
                response = await axiosInstance.put(`/api/books/edit/${selectedBookData.id}/`, payload );
                successMessage = "Book updated successfully!";
                
                } else {
                    // Add new course (POST)
                    response = await axiosInstance.post(`/api/books/add/`, payload );
                    successMessage = "Book added successfully!";
                }

                if (response.status >= 200 && response.status < 300) {
                    message.success(successMessage);
                    setTimeout(() => {
                        setLoading(false);
                        onClose();
                        resetBookForm();
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
            <div className={`relative p-2 w-3/6 rounded-xl shadow-lg ${theme.specificPageBg}`}>
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-300">
                    <h3 className={`text-lg font-semibold ${theme.text}`}>
                         {isEditing ? "Edit Book" : "Add New Book"}
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
                            <label htmlFor="bookCode" className={`block mb-2 text-sm font-medium ${theme.text}`}>Book Code</label>
                            <Input name="bookCode" value={bookFormData.bookCode} onChange={(e) => handleChange("bookCode", e.target.value)}  className='rounded-lg border-gray-300' placeholder="Enter Course Name" />
                            {/* {errors.courseName && <p className="text-red-500 text-sm">{errors.courseName}</p>} */}
                        </div>
                        
                        {/*  Course Code Selection  */}
                        <div className="col-span-1">
                            <label htmlFor="bookName" className={`block mb-2 text-sm font-medium ${theme.text}`}>Book Name</label>
                            <Input name="bookName" value={bookFormData.bookName} onChange={(e) => handleChange("bookName", e.target.value)} className='rounded-lg border-gray-300' placeholder="Enter Course Code" />
                            {/* {errors.courseCode && <p className="text-red-500 text-sm">{errors.courseCode}</p>} */}
                        </div>

                        <div className="col-span-1">
                            <label htmlFor="bookVersion" className={`block mb-2 text-sm font-medium ${theme.text}`}>Book Version</label>
                            <Input name="bookVersion" value={bookFormData.bookVersion} onChange={(e) => handleChange("bookVersion", e.target.value)} className='rounded-lg border-gray-300' placeholder="Enter Course Duration" />
                            {/* {errors.courseDuration && <p className="text-red-500 text-sm">{errors.courseDuration}</p>} */}
                        </div>

                        <div className="col-span-1">
                            <label htmlFor="course" className={`block mb-2 text-sm font-medium ${theme.text}`}>Book Course</label>
                            <Select name="course" className='w-full border-gray-300' size='large' placeholder='Select Course' 
                                    showSearch  // This enables search functionality
                                        
                                    onChange={(value) => handleChange("course", value)} 
                                    value={bookFormData.course ? bookFormData.course : []}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                                    }
                                    options={coursesData.map(course => ({
                                        value: course.id,
                                        label: course.name,
                                    }))}
                                />                            {/* {errors.courseDuration && <p className="text-red-500 text-sm">{errors.courseDuration}</p>} */}
                        </div>

                        <div className="col-span-1">
                            <label htmlFor="bookStock" className={`block mb-2 text-sm font-medium ${theme.text}`}>Book Quantity</label>
                            <Input name="bookStock" value={bookFormData.bookStock} onChange={(e) => handleChange("bookStock", e.target.value)} className='rounded-lg border-gray-300' placeholder="Enter Course Duration" />
                            {/* {errors.courseDuration && <p className="text-red-500 text-sm">{errors.courseDuration}</p>} */}
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
                        ) : isEditing ? "Save Changes" : "Add Book"}
                    </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
};

export default AddBookForm;
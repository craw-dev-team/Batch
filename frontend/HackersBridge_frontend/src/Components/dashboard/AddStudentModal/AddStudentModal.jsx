import { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import { Select, Input, Alert, Button, Spin, message   } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import BASE_URL from '../../../ip/Ip';
import { useBatchForm } from '../Batchcontext/BatchFormContext';
import { useStudentForm } from '../StudentContext/StudentFormContext';


// const fetchAvailableStudents = async (batchId) => {
//     try {
//         const response = await axios.get(`${BASE_URL}/api/batches/${batchId}/available-students/`);
//         const data = response.data;
        
//         if (!Array.isArray(data.available_students)) {
//             throw new Error("Invalid response format: Expected an array");
//         }

//         // Update state with student data
//         setStudents(data.available_students);
//     } catch (error) {
//         console.error("Error fetching students:", error);
//     }
// };


const AddStudentModal = ({ isOpen, onClose }) => {
    const {batchFormData, setBatchFormData} = useBatchForm();
    const { studentData, fetchStudents } = useStudentForm();
    const [ loading, setLoading ] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState({}); // Stores selected students per batch

    
    useEffect(() => {
        if (isOpen) {
            fetchStudents(); // Fetch students only when the modal is open
        }
    }, [isOpen]); // Run when modal opens

    useEffect(() => {
        console.log("Updated Student Data:", studentData); // Log only after data updates
    }, [studentData]); // Run when stuentData updates
    
    const handleChange = (batchId, value) => {
        setSelectedStudent((prev) => ({
            ...prev,
            [batchId]: value, 
        }));
    };
    

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const studentIds = selectedStudent[batchId] || [];
        // console.log("Batch ID:", batchId, studentIds);
    
        if (studentIds.length === 0) {
            message.warning("No students selected!");
            return;
        }
    
        try {
            const response = await axios.post(`${BASE_URL}/api/batches/${batchId}/add-students/`, 
                { students: studentIds }, // Ensure correct payload format
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            if (response.status >= 200 && response.status < 300) {
                message.success("Student added successfully!");
                setAddStudentDropdown(false); // Close dropdown on success
            } else {
                message.error("Student not added.");
            }
        } catch (error) {
            console.error("Error sending Add student request:", error);
            message.error("Failed to add student.");
        }
    }; 





    if(!isOpen) return null;
    
    return (
        <>
         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="relative p-2 w-3/6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New Student
                    </h3>
                    <button
                       onClick={() => onClose() }
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
                <form className="p-4 md:p-5">
                   <div className="">
                   <label htmlFor="student" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add Students</label>
                            <Select name="student" mode="multiple" className='w-full border-gray-300' size='large' placeholder='Select Students' 
                            showSearch  // This enables search functionality
                                    
                            onChange={(value) => handleChange("student", value)} 
                            value={batchFormData.student ? batchFormData.student : []}
                            filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                            }
                            options={studentData?.map(student => ({
                                value: student.id,
                                label: student.name +" - "+ student.phone,
                            }))}
                            />

                   </div>

                  <div className="flex justify-end">
                  <button
                  onClick={() => handleFormSubmit(Item.id)}
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
                    ) : "Add Student"}
                </button>
                  </div>
               </form>
            </div>
        </div>
        </>
    )
};

export default AddStudentModal;
import { useState, useEffect, useCallback } from 'react';
import { Select, Input, Alert, Button, Spin, message, Tooltip   } from 'antd';
import { SyncOutlined, CopyOutlined, RightOutlined } from '@ant-design/icons';
import { useBatchForm } from '../Batchcontext/BatchFormContext';
import { useParams } from 'react-router-dom';
import { useSpecificBatch } from '../Contexts/SpecificBatch';
import axiosInstance from '../api/api';
import { useStudentForm } from '../Studentcontext/StudentFormContext';




const AddStudentModal = ({ isOpen, onClose }) => {

    const {batchId} = useParams();
    const [decodedBatchId, setDecodedBatchId] = useState(null);
    const {batchFormData, setBatchFormData, resetBatchForm} = useBatchForm();
    const { fetchSpecificBatch } = useSpecificBatch();
    const { studentsListSelect, fetchAvailableStudents } = useStudentForm();
    const [ loading, setLoading ] = useState(false);
    const [students, setStudents] = useState({}); // Stores selected students per batch

    
    useEffect(() => {
        if (batchId) {
                setDecodedBatchId(atob(batchId));
        }
    }, [batchId]); 
    
    
    const handleChange = (batchId, selectedStudents) => {
        setBatchFormData((prev) => ({
            ...prev,
            [batchId]: selectedStudents, // Store students per batch
        }));
    };
    
    

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const batch_id = decodedBatchId; // Ensure batchId is properly decoded
        const studentIds = batchFormData[batch_id] || []; // Get selected students for this batch
    
        if (studentIds.length === 0) {
            message.warning("No students selected!");
            return;
        };
    
        try {
            const response = await axiosInstance.post(`/api/batches/${batch_id}/add-students/`, 
                { students: studentIds } );
    
            if (response.status >= 200 && response.status < 300) {
                message.success("Students added successfully!");
                 setTimeout( () => {
                    setLoading(false);
                    onClose();
                    setBatchFormData((prev) => ({ ...prev, [batch_id]: [] })); // Reset selected students
                    fetchSpecificBatch(batch_id)
                }, 1000);

            } else {
                message.error(response.data?.message || "Failed to add students.");
            };
        } catch (error) {
            console.error("Error sending Add student request:", error);
            
            const errorMessage = error.response?.data?.message || "Failed to add students.";
            message.error(errorMessage);
        }  finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (isOpen) {
            fetchAvailableStudents(decodedBatchId);
        }
    },[isOpen]);



     // THIS WILL REDIRECT TO STUDENT INFO PAGE IN NEW TAB FROM CREATE BATCH MODAL SELECT FIELD
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

    if(!isOpen) return null;

    
    return (
        <>
         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="relative p-2 w-3/6 bg-white rounded-lg shadow-lg">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Add New Student
                    </h3>
                    <button
                       onClick={() => { onClose(); resetBatchForm()}}
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
                   <div className="grid grid-cols-5">
                   <label htmlFor="student" className="col-span-4 block mb-2 text-sm font-medium text-gray-900">Add Students</label>
                            <Select name="student" mode="multiple" className='col-span-4 border-gray-300' size='large' placeholder='Select Students' 
                            showSearch  // This enables search functionality
                                    
                            onChange={(value) => handleChange(decodedBatchId, value)} 
                            value={Array.isArray(batchFormData[decodedBatchId]) ? batchFormData[decodedBatchId] : []} // Store students per batch
                            filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                            }
                            options={Array.isArray(studentsListSelect[decodedBatchId]) 
                                ? studentsListSelect[decodedBatchId].map(student => ({
                                    value: String(student.studentid),
                                    label: `${student.name} - ${student.phone}`,
                                    phone:  student.phone,
                                  })) 
                                : []
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

                   {/* </div> */}

                  <div className="flex justify-end h-12">
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
                    ) : "Add Student"}
                </button>
                  </div>
                  </div>
               </form>
            </div>
        </div>
        </>
    )
};

export default AddStudentModal;
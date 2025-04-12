import { useEffect, useState, useCallback,useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useSpecificBatch } from "../Contexts/SpecificBatch";
import { DatePicker, Empty, Spin, Avatar, Tooltip, Tag, Button, Popconfirm, message   } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined, ClearOutlined    } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from 'axios';
import BASE_URL from "../../../ip/Ip";
import AddStudentModal from "../AddStudentModal/AddStudentModal";
import CreateStudentForm from "../Students/CreateStudentForm";
import CreateBatchForm from "../Batches/CreateBatchForm";
import { useAuth } from "../AuthContext/AuthContext";
import { useBatchForm } from "../Batchcontext/BatchFormContext";
import { useSpecificStudent } from "../Contexts/SpecificStudent";


// const SpecificBatchPage = () => {
//     const { batchId } = useParams();
//     const { specificBatch, fetchSpecificBatch } = useSpecificBatch();
 


//     useEffect(() => {
//         if (batchId) {
//             fetchSpecificBatch(batchId);
//         }
//     },[batchId]);
    
//     const batchDetails = specificBatch?.batch;
//     console.log(batchDetails);

  

//     // const filteredStudentData = specificStudent?.All_in_One
//     //     ? activeTab === 'running'
//     //     ? specificStudent?.All_in_One?.student_batch_ongoing
//     //     : activeTab === 'scheduled'
//     //     ? specificStudent?.All_in_One?.student_batch_upcoming
//     //     : activeTab === 'completed'
//     //     ? specificStudent?.All_in_One?.student_batch_completed
//     //     : activeTab === 'allupcomingbatches'
//     //     ? specificStudent?.All_in_One?.all_upcoming_batch
//     //     : []
//     // :[];


//     return (
//         <>
//         <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
//             <div className="grid grid-cols-6 gap-x-6">
//                     {batchDetails ? (
//                     <>
//                 <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
//                     <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
//                         <p key={batchDetails.id}># {batchDetails.batch_id}</p>
//                     </div>
//                         <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        
//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Trainer</h1>
//                             <p className="font-semibold">{batchDetails.trainer_name}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1">
//                             <h1>Course</h1>
//                             <p className="font-semibold">{batchDetails.course_name}</p>
//                         </div>
                        
//                         <div className="col-span-1 px-1 py-1">
//                             <h1 >Start Time</h1>
//                             <p className="font-semibold">{batchDetails.batch_time_data?.start_time}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1">
//                             <h1 >End Time</h1>
//                             <p className="font-semibold">{batchDetails.batch_time_data?.end_time}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Preferred Week</h1>
//                             <p className="font-semibold">{batchDetails.preferred_week}</p>
//                         </div>
                        
//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Location</h1>
//                             <p className="font-semibold">{batchDetails.batch_location}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Language</h1>
//                             <p className="font-semibold">{batchDetails.language}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Mode</h1>
//                             <p className="font-semibold">{batchDetails.mode}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
//                             <h1>Start Date</h1>
//                             <p className="font-semibold">{batchDetails.start_date}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
//                             <h1>End Date</h1>
//                             <p className="font-semibold">{batchDetails.end_date}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Status</h1>
//                             <p className="font-semibold">{batchDetails.status}</p>
//                         </div>

//                         </div>
//                 </div>

//                 <div className="px-4 py-4 col-span-5 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
//                     <div className="w-full font-semibold">
                        
//                         <div className="col-span-1 text-lg px-4 py-4">
//                             <h1>Students</h1>
//                         </div>

//                         <div className="col-span-1 px-4 py-2 leading-8">
//                             <ul>
//                             {specificBatch?.students.map((student, index) => (
//                               <>
//                                 <li className="" key={index}><span className="mr-4">{index + 1} :</span>{student.name}</li>
//                               </>
//                             ))}


//                             </ul>
//                         </div>

//                     </div>
//                 </div>

                
//                     </>
//                     ) : (
//                         <p>Loading student data...</p>
//                     )}
//             </div>


           
                    
                
                   
//         </div>  
//         </>
//     )

// }

// export default SpecificBatchPage;








const SpecificBatchPage = () => {
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false); 
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('students')
    // store batch data for editing 
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false) 
    const [selectedBatch, setSelectedBatch] = useState();

    const { batchId } = useParams();
    const { specificBatch, fetchSpecificBatch } = useSpecificBatch();
    const {batchFormData, setBatchFormData} = useBatchForm();

    const { token } = useAuth();

    const [editingField, setEditingField] = useState(null);
    const [updatedValues, setUpdatedValues] = useState(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState() // store specific student data for editing
    // handle date field dropdown for issue certificate date 
    const [dateFieldIssueCertificate, setDateFieldIssueCertificate] = useState(false);
    // store issuing date sending to server 
    const [certificateIssueDate, setCertificateIssueDate] = useState(null);
    // store student id's of all students in a specific batch 
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    // track the certificate is issued or not 
    const [isCertificateIssued, setIsCertificateIssued] = useState(false);
    // store preferred available students for that specific batch
    const [students, setStudents] = useState({});
    // store search input 
    const [searchTerm, setSearchTerm] = useState("");

    
    const navigate = useNavigate();
    
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    
        // HANDLE FETCH PREFFERED AVAILABLE STUDNETS FOR THAT SPECIFIC BATCH
        const fetchAvailableStudents = useCallback(async (batchId) => {              
            try {
                const response = await axios.get(`${BASE_URL}/api/batches/${batchId}/available-students/`, 
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
                );
                const data = response.data;
                // console.log(data);
                
                if (!data.available_students) {
                    throw new Error("Invalid response format");
                };
        
                // Update state with students for the specific batchId
                setStudents(data);                        
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        }, [students]);

                
          // Filter students based on the search term of all students added in that batch
          const filteredBatchStudents = useMemo(() => {
            if (!Array.isArray(specificBatch?.students)) return [];
          
            return specificBatch.students.filter(item =>
              item?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.student?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }, [specificBatch?.students, searchTerm]);
        

          // Filter students based on the search term of recommended students for that batch
          const filteredAvailableStudents = useMemo(() => {
            if (!Array.isArray(students?.available_students)) return [];
          
            return students.available_students.filter(item =>
              item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }, [students?.available_students, searchTerm]);
          
             
         

        // HANDLE FORM SUBMIT AND SEND DATA TO THAT MODAL AND ADD THAT STUDENT IN THAT BATCH 
        const handleAddStudentToBatch = async (studentId) => {
            const batch_id = atob(batchId)
                    
            if (!studentId) {
                message.warning("No student selected!");
                return;
            }
        
            try {
                const response = await axios.post(`${BASE_URL}/api/batches/${batch_id}/add-students/`, 
                    { students: [studentId] }, // Ensure correct payload format
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
                );
        
                if (response.status >= 200 && response.status < 300) {
                    message.success("Students added successfully!");
                     setTimeout( () => {
                        setLoading(false);
                        setBatchFormData((prev) => ({ ...prev, [batch_id]: [] })); // Reset selected students
                        fetchSpecificBatch(batch_id)
                        fetchAvailableStudents(batch_id)
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
        if (batchId) {
            try {
                // Decode the ID before using it
                const originalBatchId = atob(batchId);                
                // Fetch trainer data with the decoded ID
                fetchAvailableStudents(originalBatchId)
                fetchSpecificBatch(originalBatchId);
                
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    }, [batchId, isCertificateIssued, activeTab ]);
    

    useEffect(() => {
        if (specificBatch?.batch) {
            setUpdatedValues(specificBatch.batch);
        }
    }, [specificBatch]);

    if (!updatedValues) {
        return <p>Loading batch data...</p>;
    }

    
    // Function to handle Edit button click 
       const handleBatchEditClick = (batch) => {
        setSelectedBatch(batch);
        setIsBatchModalOpen(true);
    };


    // TO NAVIGATE TO STUDENT SPECIFIC PAGE 
    const handleStudentClick = async (studentId) => {
        if (!studentId) return;
        const encodedStudentId = btoa(studentId);
        
        navigate(`/students/${encodedStudentId}`)
    };


    // Function to safely get nested property values
    const getNestedValue = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    // Function to safely update nested properties
    const setNestedValue = (obj, path, value) => {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const deepCopy = { ...obj };

        let temp = deepCopy;
        keys.forEach((key) => {
            if (!temp[key]) temp[key] = {};
            temp = temp[key];
        });

        temp[lastKey] = value;
        return deepCopy;
    };

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleChange = (field, value) => {
        setUpdatedValues((prev) => setNestedValue(prev, field, value));
    };

    const saveChanges = async (field) => {
        if (!updatedValues) return;
        setEditingField(null);
        setIsDatePickerOpen(false); // Close DatePicker if it was open
    
        try {
            const decodedBatchId = atob(batchId); // Decode batchId before using it
            const updatePayload = JSON.stringify({ [field]: updatedValues[field] }); // Convert to JSON string
    
            // console.log("Decoded Batch ID:", decodedBatchId);
            // console.log("Payload:", updatePayload);
    
            await axios.put(`${BASE_URL}/api/batches/edit/${decodedBatchId}`, 
                updatePayload, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
    
            console.log(`${field} updated successfully`);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };
    


    // REMOVE STUDENT FROM BATCH 
     const handleRemoveStudent = async (studentId) => {
        try {     
            const decodedBatchId = atob(batchId);       
            const payload = { students: [studentId] }; // Wrap studentId in an array

            const response = await axios.post(`${BASE_URL}/api/batch/remove-student/${decodedBatchId}/`,  
                payload,  // Student IDs in the body
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );

                if (response.status >= 200 && response.status < 300) {   
                    // console.log(specificBatch);
                                 
                    fetchSpecificBatch(decodedBatchId);
                    // fetchAvailableStudents(decodedBatchId)                     
                } else {
                    throw new Error("Failed to delete student");
                }  
   
        } catch (error) {
            setLoading(false);
            if (error.response) {
                console.error("Server Error Response:", error);
            }
        }       
    };


        // Confirm and Cancel Handler for delete button 
        // const confirm = async (studentId) => {
        //     try {
        //         await handleRemoveStudent(studentId); 
        //         message.success("Batch Deleted Successfully");
        //         // console.log(specificBatch);
                
        //     } catch (error) {
        //         message.error("Failed to delete batch");
        //         console.error("Error deleting batch:", error);
        //     }
        // };
        
        const confirm = (studentId, studentName) => {            
            handleRemoveStudent(studentId);
            message.success(`${studentName} Removed from this Batch`);
        };
    
        const cancel = () => {
            message.error('Student Removal Cancelled');
        };


         // Function to handle Edit button click
        const handleEditClick = (student) => {
            setSelectedStudent(student); // Set the selected course data
            setIsModalOpen(true); // Open the modal            
            // setIsDeleted(false)
        };


        // HANDLE ISSUE CERTIFICATE DATE PICKER MODAL OPEN AND CLOSE AND SET ALL STUDENT ID' IN STATE
        const handleIssueClick = () => {
            setSelectedStudentIds(specificBatch?.students.map(student => student.student.id));
            setDateFieldIssueCertificate((prev) => !prev); // Toggle date field visibility
        };
        
        
        // HANDLE ISSUE CERTIFICATE TO ALL THE STUENTS IN A BATCH 
        const handleIssueCertificate = async () => {
            if (!certificateIssueDate) {
                message.info("Please Select a date");
                return;
            };

            const batch_id = atob(batchId)            

            const payload = {
                students : selectedStudentIds,
                issue_date : certificateIssueDate,
            };
            

            try {
                const response = await axios.post(`${BASE_URL}/api/batch-generate-certificate/${batch_id}/`, 
                    payload,
                    { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
                );
                
                if (response.status >= 200 && response.status < 300) {
                    message.success("Certificate issued to students successfully");

                    setDateFieldIssueCertificate(false);
                    setSelectedStudentIds([]);
                    setCertificateIssueDate(null);
                    setIsCertificateIssued(true);
                };
            } catch (error) {
                console.log("Error issuing crtificate", error);
                message.error("Failed to issue Certificate")
            };
        };


     
    return (
        <div className="w-auto h-full pt-20 px-2 mt-0">
            <div className="grid grid-cols-6 gap-x-6">
                <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                        <p># {updatedValues.batch_id}</p>

                        <Button
                            color="secondary" 
                            variant="outlined" 
                            className="rounded-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBatchEditClick(updatedValues);
                                setIsBatchModalOpen(true);
                            }}>
                            <EditOutlined />
                        </Button>

                    </div>

                    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">
                    {[
                            { label: "Trainer", key: "trainer_name" },
                            { label: "Course", key: "course_name" },
                            { label: "Start Time", key: "batch_time_data.start_time" },
                            { label: "End Time", key: "batch_time_data.end_time" },
                            { label: "Preferred Week", key: "preferred_week" },
                            { label: "Location", key: "batch_location" },
                            { label: "Language", key: "language" },
                            { label: "Mode", key: "mode" },
                            { label: "Status", key: "status" },
                            { label: "Start Date", key: "start_date" },
                            { label: "End Date", key: "end_date" },
                        ].map(({ label, key }) => (
                        <div key={key} className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <strong>{label}:</strong>
                            <div className="flex items-center gap-2">
                                {editingField === key ? (
                                    key === "start_date" ? (
                                        <div className="flex items-center gap-2">
                                            {/* Date Picker */}
                                    <DatePicker
                                        open={isDatePickerOpen}
                                        value={updatedValues.start_date ? dayjs(updatedValues.start_date, "YYYY-MM-DD") : null}
                                        onChange={(date, dateString) => handleChange("start_date", dateString)}
                                        className="border-gray-300"
                                        size="large"
                                        placeholder="Select Start Date"
                                    />

                                    {/* Submit Button */}
                                    <CheckCircleOutlined
                                        className="text-green-500 text-lg cursor-pointer hover:text-green-700"
                                        onClick={() => {
                                            saveChanges("start_date");
                                            setIsDatePickerOpen(false);
                                        }}
                                    />

                                    {/* Cancel Button */}
                                    <CloseCircleOutlined
                                        className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                        onClick={() => {
                                            setIsDatePickerOpen(false);
                                            setEditingField(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={getNestedValue(updatedValues, key) || ""}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    onBlur={() => saveChanges(key)}
                                    onKeyDown={(e) => e.key === "Enter" && saveChanges(key)}
                                    autoFocus
                                />
                                )
                            ) : (
                                <p className="font-semibold">
                                    {key === "start_date"
                                        ? new Date(updatedValues.start_date).toLocaleDateString("en-GB")
                                        : getNestedValue(updatedValues, key) || "N/A"}
                                </p>
                            )}

                            {/* Edit Icon */}
                            {!isDatePickerOpen && (
                                <EditOutlined
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        handleEdit(key);
                                        if (key === "start_date") setIsDatePickerOpen(true);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}

                        {/* Formatted Start Date */}
                        {/* <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Start Date</h1>
                            <p className="font-semibold">
                                {new Date(updatedValues.start_date).toLocaleDateString("en-GB")}
                            </p>
                        </div> */}

                        {/* Formatted End Date */}
                        {/* <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>End Date</h1>
                            <p className="font-semibold">
                                {new Date(updatedValues.end_date).toLocaleDateString("en-GB")}
                            </p>
                        </div> */}
                    </div>
                </div>


                {/* Students List */}
                <div className="py-4 col-span-6 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50  bg-white">
                    <div className="w-full font-semibold">
                        <div className="col-span-1 text-lg px-4 py-4 flex justify-between">
                            {/* <h1>Students</h1> */}

                            <div className="relative ">
                                <button
                                    onClick={() => handleTabClick("students")}
                                    className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200  
                                        ${activeTab === "students" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                    Students
                                </button>

                                <button
                                    onClick={() => handleTabClick("recommended_students")}
                                    className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200  
                                        ${activeTab === "recommended_students" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                    Recommended Students
                                </button>
                            </div>


                            <div className="flex gap-x-3">
                                <label htmlFor="table-search" className="sr-only">Search</label>
                                <div className="relative">
                                    <input onChange={(e) => setSearchTerm(e.target.value.replace(/^\s+/, ''))} value={searchTerm} type="text" id="table-search" placeholder="Search for items"
                                        className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 h-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <button onClick={() => setSearchTerm("")}>
                                    {searchTerm ? (
                                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                            </svg>
                                        )}
                                    </button>
                                    </div>
                                </div>
               

                                <div className="flex">
                                        {!dateFieldIssueCertificate && (
                                            <Button
                                            onClick={handleIssueClick}
                                            variant="outlined"
                                            color={isCertificateIssued ? "blue" : "green"}
                                            >
                                            {isCertificateIssued ? "Certificate Issued" : "Issue Certificate"}
                                            </Button>
                                        )}
                                        {dateFieldIssueCertificate && (
                                            <div className="flex mx-1">
                                                <DatePicker
                                                    open={dateFieldIssueCertificate}
                                                    name="certificateIssueDate"
                                                    className="border-gray-300"
                                                    size="small"
                                                    placeholder="Certificate issue date"
                                                    // value={certificateData[item.id] 
                                                    //         ? dayjs(certificateData[item.id])  //  Show selected date 
                                                    //         : item.course_certificate_date 
                                                    //         ? dayjs(item.course_certificate_date)  //  Show date from server
                                                    //         : null
                                                    // }
                                                    onChange={(date, dateString) => {
                                                        setCertificateIssueDate(dateString);  //  Store selected date
                                                    }}
                                                />
                                                {/* Submit Button */}
                                                <CheckCircleOutlined
                                                    className="mx-1 text-green-500 text-lg cursor-pointer hover:text-green-700"
                                                    onClick={() => {
                                                        handleIssueCertificate();
                                                        setDateFieldIssueCertificate(false);
                                                    }}
                                                />

                                                {/* Cancel Button */}
                                                <CloseCircleOutlined
                                                    className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                                    onClick={() => {
                                                        setDateFieldIssueCertificate(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    <button onClick={() => { setIsAddStudentModalOpen(true) }} type="button" className="ml-2 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5">Add +</button>
                                </div>
                            </div>
                        </div>

                            <div className={`overflow-hidden pb-2 relative `}>
                                <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                                    <div className="col-span-1py-2 leading-8">
                                    <table className="w-full text-xs text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" className="px-3 py-3 md:px-2">
                                                    s.No
                                                </th>
                                                {/* <th scope="col" className="px-3 py-3 md:px-1 w-5">

                                                </th> */}
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Enrollment No
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Phone No
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Courses
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Mode
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Language
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Preferred Week
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Location
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    course Counsellor
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    support Coordinator
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Action
                                                </th>
                                            
                                            </tr>
                                        </thead>

                                {activeTab === "students" && (
                                        <tbody>
                                    {loading ? (
                                            <tr>
                                                <td colSpan="100%" className="text-center py-4">
                                                    <Spin size="large" />
                                                </td>
                                            </tr>
                                    
                                    ) : filteredBatchStudents.length > 0 ? (
                                        filteredBatchStudents.map((item, index) => (
                                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                            <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                            {index + 1}
                                            </td>
                                            {/* <td className="px-3 py-2 md:px-1">
                                                {item.id}
                                            </td> */}
                                            {/* <td> {isCertificateIssued ? <CheckCircleOutlined className="text-green-500 text-md"/> : ''} </td> */}
                                            
                                            <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.student.id)}>
                                                {item.student.enrollment_no}
                                            </td>
                                            

                                            <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.student.id)}>
                                                {item.student.name}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                                {item.student.phone}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                                {item.student.email}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                            <Avatar.Group
                                                        max={{
                                                            count: 2,
                                                            style: {
                                                                color: "#f56a00",
                                                                backgroundColor: "#fde3cf",
                                                                height: "24px", // Match avatar size
                                                                width: "24px", // Match avatar size
                                                            }
                                                        }}
                                                    >
                                                        {item.student.courses_names?.map((name, index) => (
                                                            <Tooltip key={index} title={name} placement="top">
                                                                <Avatar
                                                                    size={24}
                                                                    style={{ backgroundColor: "#87d068" }}
                                                                >
                                                                    {name[0]}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </Avatar.Group>
                                            </td>

                                            <td className="px-3 py-2 md:px-1">
                                                <Tag bordered={false} color={item.student.mode === "Offline" ? "green" : item.student.mode === "Online" ? "red" : "geekblue"}>
                                                    {item.student.mode}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1">
                                                <Tag bordered={false} color={item.student.language === 'Hindi'? 'green' : item.student.language === 'English'? 'volcano' : 'blue'}>
                                                    {item.student.language}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1">
                                                <Tag bordered={false} color={item.student.preferred_week === "Weekdays" ? "cyan" : item.student.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                                    {item.student.preferred_week}
                                                </Tag>
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                                {item.student.location == '1' ? <Tag color="blue">Saket</Tag> : item.student.location == "2" ? <Tag color="magenta">Laxmi Nagar</Tag> : <Tag color="blue">Both</Tag>}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                                {item.student.course_counsellor_name}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">
                                                {item.student.support_coordinator_name}
                                            </td>
                                            {/* <td className="px-3 py-2 md:px-1">
                                                <Switch
                                                    size="small"
                                                    checkedChildren={<CheckOutlined />}
                                                    unCheckedChildren={<CloseOutlined />}
                                                    checked={studentStatuses[item.id] || false} // Get correct status per trainer
                                                    onChange={(checked) => handleToggle(checked, item.id)}
                                                    style={{
                                                        backgroundColor: studentStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                                    }}
                                                />
                                            </td> */}
                                            <td > <Button 
                                                    color="primary" 
                                                    variant="filled" 
                                                    className="rounded-lg w-auto pl-3 pr-3 py-0 my-1 mr-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                                        handleEditClick(item);  // Open the form with selected course data
                                                        setIsModalOpen(true);   // Open the modal
                                                    }}
                                                >
                                                    <EditOutlined />
                                                </Button>
                                                <Popconfirm
                                                    title={`Remove ${item.student.name}`}
                                                    description="Are you sure you want to Remove this Student?"
                                                    onConfirm={() => confirm(item.student.id, item.student.name)}
                                                    onCancel={cancel}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <Button 
                                                        color="danger" 
                                                        variant="filled" 
                                                        className="rounded-lg w-auto px-3"
                                                        onClick={(e) => e.stopPropagation()} // Prevent the click from triggering the Edit button
                                                    >
                                                        <ClearOutlined />
                                                    </Button>
                                            </Popconfirm>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="100%" className="text-center py-4 text-gray-500">
                                            <Empty description="No Students found" />
                                        </td>
                                    </tr>
                                )}
                                        </tbody>
                                )}

                                {activeTab === "recommended_students" && (
                                         <tbody>
                                         {loading ? (
                                                 <tr>
                                                     <td colSpan="100%" className="text-center py-4">
                                                         <Spin size="large" />
                                                     </td>
                                                 </tr>
                                         
                                         ) : filteredAvailableStudents.length > 0 ? (
                                            filteredAvailableStudents.map((item, index) => (
                                             <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                                 <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                                 {index + 1}
                                                 </td>
                                                 {/* <td className="px-3 py-2 md:px-1">
                                                     {item.id}
                                                 </td> */}  

                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    <Tooltip 
                                                        color="white"
                                                        title={
                                                            Array.isArray(item.complete_course_name) && item.complete_course_name.length > 0 ? (
                                                            <div className="w-auto max-w-lg bg-white text-black border-none">
                                                                {/* Dynamically adjusting width */}
                                                                {item.complete_course_name.map((course, idx) => (
                                                                <div key={idx} className="py-1"><CheckCircleOutlined className="text-green-500 text-md"/>  {course} - <span className="text-green-500 font-semibold">Completed</span></div>
                                                                ))}
                                                            </div>
                                                            ) : (
                                                            "No completed courses"
                                                            )
                                                        }
                                                    >
                                                        <span>{item.enrollment_no}</span>
                                                    </Tooltip>

                                                </td>
     
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}> 
                                                    <Tooltip 
                                                        color="white"
                                                        title={
                                                            Array.isArray(item.complete_course_name) && item.complete_course_name.length > 0 ? (
                                                            <div className="w-auto max-w-lg bg-white text-black border-none">
                                                                {/* Dynamically adjusting width */}
                                                                {item.complete_course_name.map((course, idx) => (
                                                                <div key={idx} className="py-1"><CheckCircleOutlined className="text-green-500 text-md"/>  {course} - <span className="text-lime-500 font-serif">Completed</span></div>
                                                                ))}
                                                            </div>
                                                            ) : (
                                                            "No completed courses"
                                                            )
                                                        }
                                                    >
                                                        <span>{item.name}</span>
                                                        </Tooltip>

                                                </td>

                                                 <td className="px-3 py-2 md:px-1">
                                                     {item.phone}
                                                 </td>

                                                 <td className="px-3 py-2 md:px-1">
                                                     {item.email}
                                                 </td>
                                                 
                                                 <td className="px-3 py-2 md:px-1">
                                                 <Avatar.Group
                                                             max={{
                                                                 count: 2,
                                                                 style: {
                                                                     color: "#f56a00",
                                                                     backgroundColor: "#fde3cf",
                                                                     height: "24px", // Match avatar size
                                                                     width: "24px", // Match avatar size
                                                                 }
                                                             }}
                                                         >
                                                             {item.courses_names?.map((name, index) => (
                                                                 <Tooltip key={index} title={name} placement="top">
                                                                     <Avatar
                                                                         size={24}
                                                                         style={{ backgroundColor: "#87d068" }}
                                                                     >
                                                                         {name[0]}
                                                                     </Avatar>
                                                                 </Tooltip>
                                                             ))}
                                                         </Avatar.Group>
                                                 </td>
     
                                                 <td className="px-3 py-2 md:px-1">
                                                     <Tag bordered={false} color={item.mode === "Offline" ? "green" : item.mode === "Online" ? "red" : "geekblue"}>
                                                         {item.mode}
                                                     </Tag>
                                                 </td>
     
                                                 <td className="px-3 py-2 md:px-1">
                                                     <Tag bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                                         {item.language}
                                                     </Tag>
                                                 </td>
     
                                                 <td className="px-3 py-2 md:px-1">
                                                     <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                                         {item.preferred_week}
                                                     </Tag>
                                                 </td>
                                                 <td className="px-3 py-2 md:px-1">
                                                     {item.location == '1' ? <Tag color="blue">Saket</Tag> : item.location == "2" ? <Tag color="magenta">Laxmi Nagar</Tag> : <Tag color="blue">Both</Tag>}
                                                 </td>
                                                 <td className="px-3 py-2 md:px-1">
                                                     {item.course_counsellor_name}
                                                 </td>
                                                 <td className="px-3 py-2 md:px-1">
                                                     {item.support_coordinator_name}
                                                 </td>
                                                 <td > 
                                                    <Button 
                                                         color="primary" 
                                                         variant="filled" 
                                                         className="rounded-lg w-auto pl-3 pr-3 py-0 my-1 mr-1"
                                                         onClick={(e) => {
                                                             e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                                             handleAddStudentToBatch(item.id);  // Open the form with selected course data
                                                         }}
                                                     >
                                                         +
                                                     </Button>
                                                 </td>
                                             </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                 <Empty description="No Students found" />
                                             </td>
                                         </tr>
                                     )}
                                         </tbody>
                                )}
                                    </table>
                                        {/* <ul>
                                            {specificBatch?.students.map((student, index) => (
                                                <li key={index}>
                                                    <span className="mr-4">{index + 1} :</span>
                                                    {student.name}
                                                </li>
                                            ))}
                                        </ul> */}
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
            <CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} />
            <AddStudentModal isOpen={isAddStudentModalOpen}  onClose={() => setIsAddStudentModalOpen(false)} />
            <CreateBatchForm isOpen={isBatchModalOpen} selectedBatchData={selectedBatch|| {}}  onClose={() => setIsBatchModalOpen(false)} />

        </div>
    );
};

export default SpecificBatchPage;

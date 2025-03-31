import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Popconfirm, Avatar, Tooltip, Select, Tag, Dropdown, Badge, Spin, Empty, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined, CopyOutlined, RightOutlined, FilterOutlined } from '@ant-design/icons';
import  { useBatchForm }  from "../Batchcontext/BatchFormContext";
import CreateBatchForm from "./CreateBatchForm";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import BatchCards from "../SpecificPage/BatchCards";
import AvailableBatches from "./AvailableBatches";
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import { useSpecificBatch } from "../Contexts/SpecificBatch";
import { useCourseForm } from "../Coursecontext/CourseFormContext";



const Batches = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState("running");
    const [selectedBatch, setSelectedBatch] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const [students, setStudents] = useState({}); // Stores selected students per batch
    const [selectedStudent, setSelectedStudent] = useState({}); // Stores selected students per batch
    const [addStudentDropdown, setAddStudentDropdown] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [sortByTime, setSortByTime] = useState(false); // Default ascending
    const [sortByStartDate, setSortByStartDate] = useState(false);
    const [sortByEndDate, setSortByEndDate] = useState(false);
    const [sortByMode, setSortByMode] = useState(null);
    const [sortByLanguage, setSortByLanguage] = useState(null);
    const [sortByPreferredWeek, setSortByPreferredWeek] = useState(null);
    const [sortByLocation, setSortByLocation] = useState(null);
    const [sortByCourse, setSortByCourse] = useState(null);
    
    const { batchData, loading, setLoading, setBatchData, fetchBatches, countBatchesByType } = useBatchForm();
    const { coursesData, setCoursesData, fetchCourses } = useCourseForm();
    const [originalCourses, setOriginalCourses] = useState([]); // Store the original data

    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    useEffect(() => {
        if (!batchData) {  // Only fetch if batchData is empty
            fetchBatches();
        }
    }, [isModalOpen, isDeleted, batchData]); 
    

   // Store the original course list when data is first loaded
   useEffect(() => {
    fetchCourses();
    
    if (coursesData.length > 0 && originalCourses.length === 0) {
        setOriginalCourses([...coursesData]); // Store unmodified data
    }
    }, [coursesData]);
    
    // Function to handle Edit button click 
    const handleEditClick = (batch) => {
        setSelectedBatch(batch);
        setIsModalOpen(true);
        setIsDeleted(false);
        setAddStudentDropdown(true);
    };


    
    // Delete Function 
    const handleDelete = async (batchId) => {
        if (!batchId) return;

        try {
            const response = await axios.delete(`${BASE_URL}/api/batches/delete/${batchId}/`);

            setBatchData(prevBatch => {
                if (!prevBatch || !prevBatch.All_Type_Batch || !Array.isArray(prevBatch.All_Type_Batch.batches)) {
                    return prevBatch; // Return unchanged state if not in the correct format
                }
            
                return {
                    ...prevBatch,
                    All_Type_Batch: {
                        ...prevBatch.All_Type_Batch,
                        batches: prevBatch.All_Type_Batch.batches.filter(batch => batch.id !== batchId),
                    }
                };
            });
            
   
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
    };


    // Confirm and Cancel Handler for delete button 
    const confirm = (batchId) => {
        handleDelete(batchId);
        message.success('Batch Deleted Successfully');
    };

    const cancel = () => {
        message.error('batch Deletion Cancelled');
    };


    // to add students in a batch fetch available student data from select field
    const fetchAvailableStudents = useCallback(async (batchId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/batches/${batchId}/available-students/`);
            const data = response.data;
            // console.log(data);
            
            if (!data.available_students) {
                throw new Error("Invalid response format");
            }
    
            // Format data for the Select component
            const formattedOptions = data.available_students.map(student => ({
                name: student.name,
                studentid: student.id,
                phone: student.phone
            }));
            
    
            // Update state with students for the specific batchId
            setStudents(prev => ({ ...prev, [batchId]: formattedOptions }));
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }, [students]) 
    

    // send student id to api and add it in selected  batch
    const addStudents = async (batchId) => {
        
        // Get selected student IDs for this batch
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
    
    

    const handleSelectChange = (batchId, selectedValues) => {
        setSelectedStudent(prev => ({
            ...prev,
            [batchId]: selectedValues // Store selected student IDs
        }));
    };
    

    const handleStudentDropdown = (batchId, index) => {
        
        if (addStudentDropdown === index) {
            setAddStudentDropdown(null); // Close dropdown
        } else {
            setAddStudentDropdown(index);
            if (!selectedStudent[index]) fetchAvailableStudents(batchId, index); // Fetch only if not already loaded
        }
    };


    // Filter batch data based on the selected tab
    const filteredBatchesByStatus = batchData?.All_Type_Batch 
        ? activeTab === "running"
        ? batchData.All_Type_Batch.running_batch
        : activeTab === "scheduled"
        ? batchData.All_Type_Batch.scheduled_batch
        : activeTab === "completed"
        ? batchData.All_Type_Batch.completed_batch
        : activeTab === "endingsoon"
        ? batchData.All_Type_Batch.batches_ending_soon
        : activeTab === "hold"
        ? batchData.All_Type_Batch.hold_batch
        : batchData.All_Type_Batch.cancelled_batch
        
    : [];


    // HANDLE STATUS CHANGE OF BATCH 
    const handlestatusChange = async (batchId, status) => {
        if (!batchId || !status) return;

            // Get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split("T")[0];
        
            // If status is "Completed" or "Cancelled", set batch_end_date to today
            const updatedData = {
                status,
                ...(status === "Completed" || status === "Cancelled" ? { end_date: today } : {}),
            };
                
        try {
            const response = await axios.put(`${BASE_URL}/api/batches/edit/${batchId}/`,
                JSON.stringify(updatedData),
                { headers: { "Content-Type": "application/json"} }
            );
            if (response.status >= 200 && response.status < 300) {
                message.success(`Batch status updated successfully to ${status} !`);
                // console.log(updatedData);

                // setBatchData((prevBatches) => {
                //     console.log("Previous Batches:", prevBatches);
                //     if (!Array.isArray(prevBatches)) return [];
                    
                //     return prevBatches.map((batch) =>
                //         batch.id === batchId ? { ...batch, ...updatedData } : batch
                //     );
                // });
                
            } else {
                message.error("Batch status not updated.");
            }
            
           await fetchBatches()
    
        } catch (error) {
            console.error("Error sending status data to server", error);
        }
    };
    

    const searchFilteredBatches = searchTerm
    ? filteredBatchesByStatus.filter((batch) =>
        batch.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.trainer_name.toLowerCase().includes(searchTerm.toLowerCase()) 
    )
    : filteredBatchesByStatus;


    const handleBatchClick =  async (batchId) => {
        if (!batchId) return;
        const encodedBatchId = btoa(batchId);
        navigate(`/batches/${encodedBatchId}`);
    };


    const handleTrainerClick =  async (trainerId) => {
        if (!trainerId) return;
        const encodedTrainerId = btoa(trainerId); 
        navigate(`/trainers/${encodedTrainerId}`);
    };
    


    // FOR SORTING BY START TIME AND START DATE
        const toggleSortByStartTime = () => {
            setSortByTime((prev) => !prev);
            setSortByStartDate(false); // Reset start_time sorting when sorting by name
        };
      
        const toggleSortByStartDate = () => {
            setSortByStartDate((prev) => !prev);
            setSortByTime(false); // Reset name sorting when sorting by start_time
        };

        const toggleSortByEndDate = () => {
            setSortByEndDate((prev) => !prev);
            setSortByTime(false);  // Explicitly set to false instead of null
            setSortByStartDate(false);
        };
        
        
        
        const sortedBatches = useMemo(() => {
            let sorted = [...searchFilteredBatches];
          
            if (sortByTime) {
              sorted.sort((a, b) => a.batch_time_data.start_time.localeCompare(b.batch_time_data.start_time)); // Always Ascending
            } else if (sortByStartDate) {
                sorted.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            } else if (sortByEndDate) {
                sorted.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
            };

             // Filter based on selected mode on top
            if (sortByMode) {
                sorted.sort((a, b) => {
                    if (a.mode === sortByMode && b.mode !== sortByMode) return -1;
                    if (b.mode === sortByMode && a.mode !== sortByMode) return 1;
                    return 0;
                });
            };

            // Filter based on selected language on top
            if (sortByLanguage) {
                sorted.sort((a, b) => {
                    if (a.language === sortByLanguage && b.language !== sortByLanguage) return -1;
                    if (b.language === sortByLanguage && a.language !== sortByLanguage) return 1;
                    return 0;
                })
            };

            // Filter based on selected preferred week on top
            if (sortByPreferredWeek) {
                sorted.sort((a, b) => {
                    if (a.preferred_week === sortByPreferredWeek && b.preferred_week !== sortByPreferredWeek) return -1;
                    if (b.preferred_week === sortByPreferredWeek && a.preferred_week !== sortByPreferredWeek) return 1;
                    return 0;
                })
            };

            // filter based on selected location on top
            if (sortByLocation) {
                sorted.sort((a, b) => {
                    if (a.batch_location === sortByLocation && b.batch_location !== sortByLocation) return -1;
                    if (b.batch_location === sortByLocation && a.batch_location !== sortByLocation) return 1;
                    return 0;
                })
            };
            
            // Filter by selected course (if applicable)
            if (sortByCourse) {
                sorted.sort((a, b) => (a.course_id === sortByCourse ? -1 : b.course_id === sortByCourse ? 1 : 0));
            }

            return sorted;
          }, [searchFilteredBatches, sortByTime, sortByStartDate, sortByMode, sortByLanguage, sortByPreferredWeek]);



        const handleSort = async (key, filterType) => {
            if (key === "clear") {
                if (filterType === "mode") setSortByMode(null);
                if (filterType === "language") setSortByLanguage(null);
                if (filterType === "preferred_week") setSortByPreferredWeek(null);
                if (filterType === "location") setSortByLocation(null);
                if (key === "clear") {
                    if (filterType === "course") {
                        setSortByCourse(null);
                        setCoursesData([...originalCourses]); // Reset to original data
                    }
                    return;
                }
            }
        
            if (filterType === "mode") setSortByMode(key);
            if (filterType === "language") setSortByLanguage(key);
            if (filterType === "preferred_week") setSortByPreferredWeek(key);
            if (filterType === "location") setSortByLocation(key);
        
            if (filterType === "course") {
                setSortByCourse(Number(key)); // Ensure key is a number
        
                setCoursesData(() => {
                    const selectedCourse = originalCourses.find(course => course.id === Number(key));
                    if (!selectedCourse) return [...originalCourses]; // Reset if not found
        
                    return [
                        selectedCourse, 
                        ...originalCourses.filter(course => course.id !== Number(key))
                    ];
                });
            }
        };
        

            const modeMenu = {
                items: [
                    { key: "Online", label: <span style={{ color: "red" }}>Online</span> },
                    { key: "Offline", label: <span style={{ color: "green" }}>Offline</span> },
                    { key: "Hybrid", label: <span style={{ color: "blue" }}>Hybrid</span> },
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "mode"),
            };

            const languageMenu = {
                items: [
                    { key: "Hindi", label: <span style={{ color: "green" }}>Hindi</span> },
                    { key: "English", label: <span style={{ color: "red" }}>English</span> },
                    { key: "Both", label: <span style={{ color: "blue" }}>Both</span> },
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "language"),
            };

            const preferredWeekMenu = {
                items: [
                    { key: "Weekdays", label: <span style={{ color: "gray" }}>Weekdays</span> },
                    { key: "Weekends", label: <span style={{ color: "gray" }}>Weekends</span> },
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "preferred_week"),
            };

            const locationMenu = {
                items: [
                    { key: "Saket", label: <span style={{ color: "blue" }}>Saket</span> },
                    { key: "Laxmi Nagar", label: <span style={{ color: "magenta" }}>Laxmi Nagar</span> },
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "location"),
            };

            const courseMenu = {
                items: [
                    ...(coursesData && coursesData.length > 0
                        ? coursesData.map(course => ({
                            key: String(course.id), // Ensure ID is a string for Dropdown compatibility
                            label: (
                                <span style={{ fontWeight: Number(course.id) === Number(sortByCourse) ? "bold" : "normal" }}>
                                    {course.name}
                                </span>
                            ),
                        }))
                        : [
                            { key: "no-data", label: <span style={{ color: "gray" }}>No courses available</span>, disabled: true }
                        ]
                    ),
                    { type: "divider" },
                    { key: "clear", label: <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(Number(key), "course"),
            };
            
                        


    // handle Trainer Dropdown for assigning trainer to batch 
    // const handleTrainerDropdown = (batchId, index) => {
        
    //     if (addTrainerDropdown === index) {
    //         setAddTrainerDropdown(null); // Close dropdown
    //     } else {
    //         setAddTrainerDropdown(index);
    //         if (!selectedTrainer[index]) fetchAvailableTrainers(batchId, index); // Fetch only if not already loaded
    //     }
    // };


       // to add trainers in a batch fetch available trainers data for select field
    //    const fetchAvailableTrainers = async (batchId) => {
    //     try {
    //         const response = await axios.get(`${BASE_URL}/api/batches/${batchId}/available-trainers/`);
    //         const data = response.data;
    //         console.log(data);
            
    //         if (!data.available_trainers) {
    //             throw new Error("Invalid response format");
    //         }
    
    //         // Format data for the Select component
    //         const formattedOptions = data.available_trainers.map(trainer => ({
    //             label: trainer.name,
    //             value: trainer.id
    //         }));
    
    //         // Update state with students for the specific batchId
    //         setAvailabletrainers(prev => ({ ...prev, [batchId]: formattedOptions }));
    //     } catch (error) {
    //         console.error("Error fetching trainers:", error);
    //     }
    // };

    
    // THIS WILL REDIRECT TO STUDENT IONFO PAGE IN NEW TAB FROM FILTERED STUDENT SELECT FIELD
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
        <>
<div className="w-auto pt-4 px-2 mt-14 darkmode">
    <BatchCards/>
    <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
            <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                <h1>All Batches</h1>
                <div>
                    <button onClick={() =>  { setIsModalOpen(true); setSelectedBatch(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create Batch +</button>
                </div>
            </div>

        <div className="w-full grid grid-cols-5 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
            <div className="grid col-span-5">
                <div className="flex gap-x-4 h-auto flex-wrap justify-between">
                    
                    <div className="relative ">
                            <Badge count={countBatchesByType.running} size="small">
                        <button
                            onClick={() => handleTabClick("running")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200  
                                ${activeTab === "running" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                            Active
                        </button>
                            </Badge>
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("scheduled")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "scheduled" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Scheduled
                        </button>
                            {/* </Badge>      */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("hold")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "hold" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Hold
                        </button>
                            {/* </Badge> */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("endingsoon")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "endingsoon" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Ending Soon
                        </button>
                            {/* </Badge> */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("completed")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "completed" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Completed 
                        </button>
                            {/* </Badge> */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("cancelled")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "cancelled" ? 'bg-blue-300 dark:bg-[#afc0d1] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Cancelled 
                        </button>
                            {/* </Badge> */}
                        
                    </div>


                    <div className="grid col-span-1 justify-items-end">
                        <div className="flex gap-x-6">
                            <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative h-auto">
                                <input onChange={(e) => setSearchTerm(e.target.value.replace(/^\s+/, ''))} value={searchTerm} type="text" id="table-search" placeholder="Search for items"
                                    className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 h-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    />
                                <div className="absolute inset-y-0 right-0 h-auto flex items-center pr-3">
                                <button onClick={() => setSearchTerm("")}>
                                {searchTerm ? (
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                        </svg>
                                    )}
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        
        {/* {activeTab === 'tab1' && ( */}
        <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
            <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                    {/* <th scope="col" className="p-4">
                        <div className="flex items-center">
                            <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                        </div>
                    </th> */}
                    <th scope="col" className="px-3 py-3 md:px-2">
                        S.No
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Batch Id
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByStartTime}>
                        Start Time 
                       <span className="ml-1">
                            <Tooltip title="Sort by Start Time" placement="top"> 
                                {sortByTime ? "▲" : "▼"}
                            </Tooltip>
                       </span>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByStartDate}>
                        Start Date
                       <span className="ml-1">
                            <Tooltip title="Sort by start Date" placement="top">
                                {sortByStartDate ? "▲" : "▼"}
                            </Tooltip>
                       </span>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByEndDate}>
                        End Date
                        <span className="ml-1">
                            <Tooltip title="Sort by End Date" placement="top">
                                {sortByEndDate ? "▲" : "▼"}
                            </Tooltip>
                       </span>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Course
                        {/* <Tooltip title="Sort by Course" placement="top">
                        <Dropdown menu={courseMenu} trigger={["click"]} >
                            <Button type="text" icon={<FilterOutlined  />} />
                        </Dropdown>
                        </Tooltip> */}
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Trainer
                        {/* <Tooltip title="Sort by Trainer" placement="top">
                        <Dropdown  trigger={["click"]}>
                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} />} />
                        </Dropdown>
                        </Tooltip> */}
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Students
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer">
                        Mode 
                        <Tooltip title="Sort by Mode" placement="top">
                        <Dropdown menu={modeMenu} trigger={["click"]}>
                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByMode ? "blue" : "black" }} />} />
                        </Dropdown>
                        </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Language 
                        <Tooltip title="Sort by Language" placement="top">
                        <Dropdown menu={languageMenu} trigger={["click"]}>
                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} />} />
                        </Dropdown>
                        </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Preferred Week
                        <Tooltip title="Sort by Preferred Week" placement="top">
                        <Dropdown menu={preferredWeekMenu} trigger={["click"]}>
                            <Button type="text" icon={<FilterOutlined style={{ color: sortByPreferredWeek ? "blue" : "black" }} />} />
                        </Dropdown>
                        </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Location
                        <Tooltip title="Sort by Location" placement="top">
                        <Dropdown menu={locationMenu} trigger={["click"]}>
                            <Button type="text" icon={<FilterOutlined style={{ color: sortByLocation ? "blue" : "black" }} />} />
                        </Dropdown>
                        </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Status
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Action
                    </th>
                    
                </tr>
            </thead>
            <tbody>
    {loading ? (
        <tr>
            <td colSpan="100%" className="text-center py-4">
                <Spin size="large" />
            </td>
        </tr>
    ) : sortedBatches.length > 0 ? (
        sortedBatches.map((item, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900 dark:text-white">
                    {index + 1}
                </td>
                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleBatchClick(item.id)}>{item.batch_id}</td>
                <td className="px-3 py-2 md:px-1">
                    {new Date(`1970-01-01T${item.batch_time_data?.start_time}`).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                    })}
                    <span> - </span>
                    {new Date(`1970-01-01T${item.batch_time_data?.end_time}`).toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                    })}
                </td>
                <td className="px-3 py-2 md:px-1"> 
                    {new Date(item.start_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}
                </td>
                <td className="px-3 py-2 md:px-1"> 
                    {new Date(item.end_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}
                </td>
                <td className="px-3 py-2 md:px-1">{item.course_name}</td>
                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.trainer)}>{item.trainer_name}</td>
                <td className="px-3 py-2 md:px-1 relative">
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
                        {item.student_name?.map((name, index) => (
                            <Tooltip key={index} title={name} placement="top">
                                <Avatar
                                    size={24}
                                    style={{ backgroundColor: "#87d068" }}
                                >
                                    {name[0]} {/* Show initials if no avatar */}
                                </Avatar>
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                    <div className="relative inline-block">
                        <Button
                            disabled={item.status === "Cancelled" || item.status === "Completed"}
                            color="primary"
                            variant="filled"
                            className="ml-1 rounded-full"
                            size="small"
                            onClick={() => {
                                handleStudentDropdown(item.id, index);
                                fetchAvailableStudents(item.id);
                            }}
                        >
                            {addStudentDropdown === index ? "-" : "+"}
                        </Button>

                        {addStudentDropdown === index && (
                            <div className="absolute left-full top-0 ml-2 bg-white border rounded shadow-lg p-2 z-50 flex">
                                <Select
                                    showSearch
                                    mode="multiple"
                                    size="small"
                                    style={{ width: 250, whiteSpace: "normal" }}
                                    onChange={(values) => handleSelectChange(item.id, values)}
                                    placeholder="Select a student"
                                    options={students[item.id] ? students[item.id].map(student => ({
                                        label: (
                                            <div style={{ whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>
                                                {student.name} - {student.phone}
                                            </div>
                                        ),
                                        title: `${student.name} - ${student.phone}`,
                                        value: student.studentid,
                                        phone:  student.phone,
                                        dataName: student.name.toLowerCase(), 
                                        dataPhone: student.phone.toLowerCase(),
                                    })) : []}
                                    filterOption={(input, option) =>
                                        option.dataName.includes(input.toLowerCase()) ||
                                        option.dataPhone.includes(input.toLowerCase())
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
                                <Button variant="solid" color="green" className="ml-1" size="small" onClick={() => { addStudents(item.id); setAddStudentDropdown(false); }}>
                                    Add
                                </Button>
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.mode === "Offline" ? "green" : item.mode === "Online" ? "red" : "geekblue"}>
                        {item.mode}
                    </Tag>
                </td>
                <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.language === "Hindi" ? "green" : item.language === "English" ? "volcano" : "blue"}>
                        {item.language}
                    </Tag>
                </td>
                <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                        {item.preferred_week}
                    </Tag>
                </td>
                <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.batch_location === "saket" ? "blue" : item.batch_location === "Laxmi Nagar" ? "magenta" : "geekblue"}>
                        {item.batch_location}
                    </Tag>
                </td>
                <td className="px-3 py-2 md:px-1">
                    <Dropdown
                        menu={{
                            items: ["Running", "Completed", "Hold", "Cancelled"]
                                .filter((status) => !(item.status === "Running" && status === "Running" || item.status === "Hold" && status === "Hold"))
                                .map((status) => ({
                                    key: status,
                                    label: status,
                                })),
                            onClick: ({ key }) => handlestatusChange(item.id, key),
                        }}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Tag color={item.status === "Running" ? "green" : item.status === "Upcoming" ? "lime" : item.status === "Completed" ? "geekblue" : item.status === "Hold" ? "volcano" : "red"}>
                                {item.status} <span><DownOutlined /></span>
                            </Tag>
                        </a>
                    </Dropdown>
                </td>
                <td>
                    <Button
                        color="primary"
                        variant="filled"
                        className="rounded-lg w-auto pl-3 pr-3 py-0 my-1 mr-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(item);
                            setIsModalOpen(true);
                        }}
                    >
                        <EditOutlined />
                    </Button>
                    <Popconfirm
                        title="Delete the Batch"
                        description="Are you sure you want to delete this Batch?"
                        onConfirm={() => confirm(item.id)}
                        onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            color="danger"
                            variant="filled"
                            className="rounded-lg w-auto px-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DeleteOutlined />
                        </Button>
                    </Popconfirm>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="100%" className="text-center py-4 text-gray-500">
                <Empty description="No Batches found" />
            </td>
        </tr>
    )}
</tbody>

        </table>
        </div>

        </div>
        {/* )} */}
    </div>

<CreateBatchForm isOpen={isModalOpen} selectedBatchData={selectedBatch|| {}}  onClose={() => setIsModalOpen(false)} />




        </div>
<div>
    <AvailableBatches/>
</div>

   </>
    )
}


export default Batches;
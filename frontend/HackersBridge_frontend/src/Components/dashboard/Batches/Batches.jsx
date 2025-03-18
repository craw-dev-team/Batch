import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Popconfirm, Avatar, Tooltip, Select, Tag, Dropdown, Badge, Spin, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import  { useBatchForm }  from "../Batchcontext/BatchFormContext";
import CreateBatchForm from "./CreateBatchForm";
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import BatchCards from "../SpecificPage/BatchCards";
import AvailableBatches from "./AvailableBatches";
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import { useSpecificBatch } from "../Contexts/SpecificBatch";



const Batches = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState("running");
    const [selectedBatch, setSelectedBatch] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const [students, setStudents] = useState({}); // Stores selected students per batch
    const [selectedStudent, setSelectedStudent] = useState({}); // Stores selected students per batch
    const [addStudentDropdown, setAddStudentDropdown] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" for nearest date first, "desc" for farthest date first

    // const [addTrainerDropdown, setAddtrainerDropdown] = useState({});
    // const [availableTrainers, setAvailabletrainers] = useState({});

    const { batchData, loading, setLoading, setBatchData, fetchBatches, countBatchesByType } = useBatchForm();
    const {  fetchSpecificTrainer } = useSpecificTrainer();
    const {  fetchSpecificBatch } = useSpecificBatch();

    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        fetchBatches();  
              
    }, [isModalOpen, isDeleted, batchData ]); 

    // Fetch batches afer deletion or modal open
    // useEffect(() => {
    //     fetchBatches();
    //     setIsDeleted(false);
    //     // console.log(availableTrainers);
        
    // },[selectedBatch, isModalOpen, setAddStudentDropdown ])

    
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
                    console.log("prevBatch is not in the expected format", prevBatch);
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
    const fetchAvailableStudents = async (batchId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/batches/${batchId}/available-students/`);
            const data = response.data;
            // console.log(data);
            
            if (!data.available_students) {
                throw new Error("Invalid response format");
            }
    
            // Format data for the Select component
            const formattedOptions = data.available_students.map(student => ({
                label: student.name,
                value: student.id
            }));
    
            // Update state with students for the specific batchId
            setStudents(prev => ({ ...prev, [batchId]: formattedOptions }));
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };
    
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
         await fetchSpecificBatch(batchId); // Call function with trainer ID
 
        
        navigate(`/batches/${encodedBatchId}`);
    };


    const handleTrainerClick =  async (trainerId) => {
        if (!trainerId) return;
        const encodedTrainerId = btoa(trainerId);
         await fetchSpecificTrainer(trainerId); // Call function with trainer ID
 
        
        navigate(`/trainers/${encodedTrainerId}`);
    };
    

    const sortedBatches = [...searchFilteredBatches].sort((a, b) => 
        new Date(a.start_date) - new Date(b.start_date) // Nearest date first
    );
    
        

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
                                ${activeTab === "running" ? 'bg-blue-300 text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                            Active
                        </button>
                            </Badge>
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("scheduled")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "scheduled" ? 'bg-blue-300 dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Scheduled 
                        </button>
                            {/* </Badge>      */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("hold")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "hold" ? 'bg-blue-300 dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Hold 
                        </button>
                            {/* </Badge> */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("endingsoon")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "endingsoon" ? 'bg-blue-300 dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Ending 
                        </button>
                            {/* </Badge> */}
                            {/* <Badge count={countBatchesByType.endingsoon}> */}
                        <button
                            onClick={() => handleTabClick("completed")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "completed" ? 'bg-blue-300 dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
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
                    <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" id="table-search" placeholder="Search for items"
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
            

                {/* <div className="col-span-1 justify-items-end">
                    <button id="dropdownRadioButton" data-dropdown-toggle="dropdownRadio" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-xs px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                            </svg>
                        Last 30 days
                        <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </button>
                
                    <div id="dropdownRadio" className="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600" data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="top" style={{position: 'absolute', inset: 'auto auto 0px 0px', margin: '0px', transform: 'translate3d(522.5px, 3847.5px, 0px)'}}>
                        <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioButton">
                            <li>
                                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-radio-example-1" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                    <label htmlFor="filter-radio-example-1" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last day</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input checked="" id="filter-radio-example-2" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                    <label htmlFor="filter-radio-example-2" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 7 days</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-radio-example-3" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                    <label htmlFor="filter-radio-example-3" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last 30 days</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-radio-example-4" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                    <label htmlFor="filter-radio-example-4" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last month</label>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input id="filter-radio-example-5" type="radio" value="" name="filter-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                    <label htmlFor="filter-radio-example-5" className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">Last year</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div> */}
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
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Batch Time
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Start Date
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        End Date
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Course
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Trainer
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Students
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
                        maxCount={2} // Show only 2 avatars initially
                        maxStyle={{
                            color: "#f56a00",
                            backgroundColor: "#fde3cf",
                            height: "24px",
                            width: "24px",
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
                                    onChange={(values) => handleSelectChange(item.id, values)}
                                    style={{ width: 200 }}
                                    placeholder="Select a student"
                                    options={students[item.id] ? students[item.id].map(student => ({
                                        label: student.label,
                                        value: student.value,
                                    })) : []}
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().includes(input.toLowerCase())
                                    }
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
                    <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : "gold" }>
                        {item.preferred_week}
                    </Tag>
                </td>
                <td className="px-3 py-2 md:px-1">
                    {item.location == "1" ? <Tag bordered={false} color="blue">Saket</Tag> : <Tag bordered={false} color="magenta">Laxmi Nagar</Tag>}
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
                        title="Delete the Course"
                        description="Are you sure you want to delete this course?"
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
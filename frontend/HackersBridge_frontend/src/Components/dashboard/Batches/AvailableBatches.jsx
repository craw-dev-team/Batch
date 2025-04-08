import { useState, useEffect,useMemo } from "react";
import { DatePicker, Select, Input, message, Avatar, Tooltip, Empty, Spin, Tag } from 'antd';
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { SyncOutlined } from "@ant-design/icons";
import customParseFormat from "dayjs/plugin/customParseFormat";
import axios from "axios";
import dayjs from "dayjs";
import BASE_URL from "../../../ip/Ip";
import { useAuth } from "../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";



const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);


const AvailableBatches = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState("tab1");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [sortByName, setSortByName] = useState(false);
    const [sortByStartTime, setSortByStartTime] = useState(false);

    const { availableTrainers, loading, fetchTrainers } = useTrainerForm();

    const navigate = useNavigate();
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(()=>{
        fetchTrainers()
        
    }, [availableTrainers])

    // THIS FUNCTION CREATE BATCH OF TRAINER'S FREE TIME 
    const handleCreateClick = (trainer) => {
        setSelectedBatch({
            ...trainer, 
            courses: trainer.course?.map(([id, name]) => ({ id, name })) || [], // Extract id & name
        });
        setIsModalOpen(true);
    };
    
    const freeTrainers = availableTrainers?.free_trainers ?? [];    
    const futureAvailableTrainers = availableTrainers?.future_availability_trainers ?? [];


    const filteredTrainers = activeTab === "tab1" ? freeTrainers : futureAvailableTrainers;

//    filter batches based on trainer name and location 
    const searchFilteredBatches = searchTerm
    ? filteredTrainers.filter((batch) =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : filteredTrainers;
   
   
    
    // FOR SORTING BY NAME AND START TIME 
    const toggleSortByName = () => {
      setSortByName((prev) => !prev);
      setSortByStartTime(false); // Reset start_time sorting when sorting by name
    };
    
    const toggleSortByStartTime = () => {
      setSortByStartTime((prev) => !prev);
      setSortByName(false); // Reset name sorting when sorting by start_time
    };
    
    const sortedFreeTrainers = useMemo(() => {
      let sorted = [...searchFilteredBatches];
    
      if (sortByName) {
        sorted.sort((a, b) => a.name.localeCompare(b.name)); // Always Ascending
      } else if (sortByStartTime) {
        sorted.sort((a, b) => a.start_time.localeCompare(b.start_time)); // Sort by Time as String
      }
    
      return sorted;
    }, [searchFilteredBatches, sortByName, sortByStartTime]);
    

    const sortedFutureAvailableTrainers = useMemo(() => {
      let sorted = [...searchFilteredBatches];
    
      if (sortByName) {
        sorted.sort((a, b) => a.name.localeCompare(b.name)); // Always Ascending
      } else if (sortByStartTime) {
        sorted.sort((a, b) => a.start_time.localeCompare(b.start_time)); // Sort by Time as String
      }
    
      return sorted;
    }, [searchFilteredBatches, sortByName, sortByStartTime]);
    
  
    // HANDLE NAVIGATE TO TRAINER INFO
    const handleTrainerClick =  async (trainerId) => {    
        if (!trainerId) return;
        const encodedTrainerId = btoa(trainerId); 
        navigate(`/trainers/${encodedTrainerId}`);
    };

    
    // HANDLE NAVIGATE TO BATCH INFO
    const handleBatchClick =  async (batchId) => {            
        if (!batchId) return;
        const encodedBatchId = btoa(batchId); 
        navigate(`/batches/${encodedBatchId}`);
    };


    return (
    <>
        <div className="w-auto pt-4 px-2 mt-3 mb-14 darkmode">
        <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                    {/* <h1>All Batches</h1> */}
                    {/* <div>
                        <button onClick={() =>  { setIsModalOpen(true); setSelectedBatch(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create Batch +</button>
                    </div> */}
                </div>

            <div className="w-full grid grid-cols-5 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
                <div className="grid col-span-5">
                    <div className="flex gap-x-4 h-auto flex-wrap justify-between">
                        
                    <div className="relative ">
                                {/* <Badge count={countBatchesByType.availableBatches} size="small"> */}
                            <button
                                onClick={() => handleTabClick("tab1")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200  
                                    ${activeTab === "tab1" ? 'bg-blue-300 text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                Available Batches
                            </button>
                                {/* </Badge> */}
                            <button
                                onClick={() => handleTabClick("tab2")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "tab2" ? 'bg-blue-300 dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                Future Available Batches
                            </button>
                            
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
            {activeTab === 'tab1' && (
            <div className={`overflow-hidden pb-2 relative`}>
            {/* Scrollable Table Container */}
            <div className="w-full h-[38rem] overflow-y-auto overflow-x-auto dark:border-gray-700 rounded-lg pb-2">
                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 table-auto">
                {/* Fixed Header */}
                <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10 shadow-md">
                    <tr>
                        <th scope="col" className="px-3 py-3 md:px-2">
                            S.No
                        </th>
                        <th scope="col" className="px-3 py-3 md:px-1">
                            Trainer ID
                        </th>
                        <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByName}>
                            Trainer Name
                           <span className="ml-1">
                                <Tooltip title="sort by Trainer Name" placement="top">
                                    {sortByName ? "▲" : "▼"}
                                </Tooltip>
                           </span>
                        </th>

                        <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByStartTime}>
                            Start Time 
                            <span className="ml-1">
                                <Tooltip title="sort by start Time" placement="top">
                                    {sortByStartTime  ? "▲" : "▼"} 
                                </Tooltip>
                            </span>
                        </th>
                        <th scope="col" className="px-3 py-3 md:px-1">
                            End Time
                        </th>
                        <th scope="col" className="px-3 py-3 md:px-1">
                            course
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
                            Free Since
                        </th>
                        <th scope="col" className="px-3 py-3 md:px-1">
                            create Batch
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
                            ) : Array.isArray(sortedFreeTrainers) && sortedFreeTrainers.length > 0 ? (
                            sortedFreeTrainers.map((item, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.tr_id)}>
                                    {item.trainer_id}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.tr_id)}>
                                    {item.name} 
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {new Date(`1970-01-01T${item.start_time}`).toLocaleString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                    })} 
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {new Date(`1970-01-01T${item.end_time}`).toLocaleString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                    })} 
                                </td>
                                <td className="px-3 py-2 md:px-1 font-semibold">
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
                                        {item.course &&
                                            item.course.map(([id, name], index) => ( // Destructure to get name
                                            <Tooltip key={id} title={name} placement="top">
                                                <Avatar size={24} style={{ backgroundColor: "#87d068" }}>
                                                {name[0]} {/* Display first letter of course name */}
                                                </Avatar>
                                            </Tooltip>
                                            ))}
                                    </Avatar.Group>
                                    {/* {item.course__name} */}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.mode}
                                </td> */}
                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.languages === "Hindi" ? "green" : item.languages === "English" ? "volcano" : "blue"}>
                                    {item.languages}
                                    </Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.week === "Weekdays" ? "cyan" : item.week === "Weekends" ? "gold" : "geekblue" }>
                                        {item.week}
                                    </Tag>
                                </td>
                                
                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.location == 'Saket'? 'blue' : 'magenta'}>
                                        {item.location}
                                    </Tag>
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.free_days >= 0 ? item.free_days + " Days" : item.free_days}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                <button onClick={() => handleCreateClick(item)} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Create +</button>
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
                <CreateAvailableBatchForm isOpen={isModalOpen} selectedBatch={selectedBatch} onClose={() => setIsModalOpen(false)} />
                </div>

                </div>
            
            )}


            {activeTab === 'tab2' && (
            <div className={`overflow-hidden pb-2 relative`}>
            {/* Scrollable Table Container */}
            <div className="w-full h-[38rem] overflow-y-auto overflow-x-auto dark:border-gray-700 rounded-lg pb-2">
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 table-auto">
                {/* Fixed Header */}
                <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10 shadow-md">
                    <tr>
                    <th className="px-3 py-3 md:px-2">S.No</th>
                    <th className="px-3 py-3 md:px-1">Trainer ID</th>
                    <th className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByName}>
                        <Tooltip title="sort by Trainer Name" placement="right">
                        Trainer Name {sortByName ? "▲" : "▼"} 
                        </Tooltip>
                    </th>
                    <th className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByStartTime}>
                        <Tooltip title="sort by Trainer Name" placement="right">
                        Start Time {sortByStartTime  ? "▲" : "▼"} 
                        </Tooltip>
                    </th>
                    <th className="px-3 py-3 md:px-1">End Time</th>
                    <th className="px-3 py-3 md:px-1">Start Date</th>
                    <th className="px-3 py-3 md:px-1">End Date</th>
                    <th className="px-3 py-3 md:px-1">Course</th>
                    <th className="px-3 py-3 md:px-1">Batch ID</th>
                    <th className="px-3 py-3 md:px-1">Preferred Week</th>
                    <th className="px-3 py-3 md:px-1">Days Left</th>
                    <th className="px-3 py-3 md:px-1">Create Batch</th>
                </tr>
                </thead>
        
                {/* Scrollable Table Body */}
                <tbody>
                    {loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                    ) : Array.isArray(sortedFutureAvailableTrainers) && sortedFutureAvailableTrainers.length > 0 ? (
                        sortedFutureAvailableTrainers.map((item, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-3 py-2 md:px-2 font-medium text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.tr_id)}>{item.trainer_id}</td>
                        <td className="px-3 py-2 md:px-1 ">{item.name}</td>
                        <td className="px-3 py-2 md:px-1">
                        {new Date(`1970-01-01T${item.start_time}`).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        })} 
                        </td>
                        <td className="px-3 py-2 md:px-1">
                        {new Date(`1970-01-01T${item.end_time}`).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        })} 
                        </td>
                        <td className="px-3 py-2 md:px-1">{new Date(item.start_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        })}</td>
                        <td className="px-3 py-2 md:px-1">{new Date(item.end_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}</td>
                        <td className="px-3 py-2 md:px-1 font-semibold">{item.batch_course}</td>
                        <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleBatchClick(item.batch__id)}>{item.batch_id}</td>
                        <td className="px-3 py-2 md:px-1">
                            <Tag bordered={false} color={item.batch_week === "Weekdays" ? "cyan" : item.batch_week === "Weekends" ? "gold" : "geekblue" }>
                                {item.batch_week}
                            </Tag>
                        </td>

                        <td className="px-3 py-2 md:px-1">
                            {item.free_days >= 0 ? item.free_days + " Days" : item.free_days}
                        </td>

                        <td className="px-3 py-2 md:px-1">
                        <button 
                            onClick={() => handleCreateClick(item)} 
                            type="button" 
                            className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                        >
                            Create +
                        </button>
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
        
            )}

        </div>

    <CreateAvailableBatchForm isOpen={isModalOpen} selectedBatch={selectedBatch} onClose={() => setIsModalOpen(false)} />




        </div>

    </>
    )
}

export default AvailableBatches;









const CreateAvailableBatchForm = ({ isOpen, onClose, selectedBatch }) => {
    if (!isOpen) return null;

    const { token } = useAuth();
    
    const [ loading, setLoading ] = useState(false);
    const [batchFormData, setBatchFormData] = useState({
        batchId: "",
        batchTime: "",
        startDate: "",
        endDate: "",
        course: "",
        trainer: "",
        preferredWeek: "",
        mode: "",
        language: "",
        location: "",
        student: [],
        status: "",
    });

    useEffect(() => {
        if (isOpen && selectedBatch) {
            // console.log(selectedBatch);
            
            setBatchFormData({
                batchId: selectedBatch.batchId || "",
                // batchTime: selectedBatch.start_time || "",
                batchTime: selectedBatch.start_time && selectedBatch.end_time
                ? `${convertTo12HourFormat(selectedBatch.start_time)} - ${convertTo12HourFormat(selectedBatch.end_time)}`
                : "",
                startDate: selectedBatch.startDate || "",
                endDate: selectedBatch.endDate || "",
                course: selectedBatch.course?.id || "",
                trainer: selectedBatch.name || "",
                preferredWeek: selectedBatch.week || "",
                mode: selectedBatch.mode || "",
                language: selectedBatch.languages || "",
                location: selectedBatch.location || "",
                student: selectedBatch.student || [],
                status: selectedBatch.status || "",
            });
        }
    }, [isOpen, selectedBatch]);

  // Handle input changes
  const handleChange = (name, value) => {
    setBatchFormData(prev => ({
        ...prev,
        [name]: value
    }));
    console.log(`${name} updated:`, value); // Debugging
};


  // Handle form submission (e.g., API call)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
        ...batchFormData,
        location: batchFormData.location ? parseInt(batchFormData.location, 10) : null,
        startDate: batchFormData.startDate && dayjs(batchFormData.startDate).isValid()
            ? dayjs(batchFormData.startDate).format("YYYY-MM-DD")
            : null,
        endDate: batchFormData.endDate && dayjs(batchFormData.endDate).isValid()
            ? dayjs(batchFormData.endDate).format("YYYY-MM-DD")
            : null,
    };

    const payload = {
        batch_id: formattedData.batchId,
        batch_time: selectedBatch?.time_id,
        start_date: formattedData.startDate,
        end_date: formattedData.endDate,
        course: formattedData.course?.id,
        trainer: selectedBatch?.preferredWeek,
        mode: formattedData.mode,
        language: formattedData.language,
        location: selectedBatch?.location_id,
        student: selectedBatch.student || [],

        status: formattedData.status,
    };

    console.log("Final Payload:", JSON.stringify(payload, null, 2));

    try {
        setLoading(true); // Start loading

        let response;
        let successMessage = "";

        if (selectedBatch && selectedBatch.id) {
            // Update existing batch (PUT)
            response = await axios.put(`${BASE_URL}/api/batches/edit/${selectedBatch.id}/`, 
                payload, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            successMessage = "Batch updated successfully!";
        } else {
            // Add new batch (POST)
            response = await axios.post(`${BASE_URL}/api/batches/add/`, 
                payload, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            successMessage = "Batch added successfully!";
            console.log(response);
            
        }

        if (response.status >= 200 && response.status < 300) {
            message.success(successMessage);
            setTimeout(() => {
                setLoading(false);
                onClose();
            }, 1000);
        }

    } catch (error) {
        message.error("Failed to submit the form.");
        console.error("Submission Error:", error.response?.data || error);
        setLoading(false);
    }
};


const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    return new Date(1970, 0, 1, hour, minute).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};


  // Reset form when modal opens (optional, depends on your flow)
//   useEffect(() => {
//     if (isOpen) {
//       resetBatchForm();
//     }
//   }, [isOpen, resetBatchForm]);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
    <div className="relative p-2 w-4/6 bg-white rounded-lg shadow-lg dark:bg-gray-700">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
             Create New Batch
            </h3>
            <button
               onClick={() => onClose()}
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
           <div className="grid gap-4 mb-4 grid-cols-6">
               <div className="col-span-2">
                   <label htmlFor="batchId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Batch Id</label>
                   <Input name="batchId" disabled value={batchFormData.batchId} onChange={(e) => handleChange("batchId", e.target.value)} className='rounded-lg border-gray-300' placeholder="Batch Id"/>
                   {/* {errors.batchId && <p className="text-red-500 text-sm">{errors.batchId}</p>} */}
               </div>
               
               {/* batch Time  */}
               <div className="col-span-2">
               <label htmlFor="batchTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Batch Timing</label>
               {/* <TimePicker.RangePicker use12Hours  format="h:mm a" size={"large"} required
                   value={[
                       batchFormData?.startTime ? dayjs(batchFormData?.startTime, "HH:mm:ss") : null,
                       batchFormData?.endTime ? dayjs(batchFormData?.endTime, "HH:mm:ss") : null,
                   ]}
                   onChange={(value) => handleChange('batchTime', value)}
               /> */}
               <Select name="batchTime" onChange={(value) => handleChange("batchTime", value)} className='w-full border-gray-300' size='large' placeholder='Select Batch Timing' 
                   value={batchFormData.batchTime ? String(batchFormData.batchTime) : null}
                    dropdownRender={menu => <div>{menu}</div>} // required to ensure styling applies properly
                    options={[
                           { value: '1', label: '10:00 - 12:00' },
                           { value: '2', label: '12:00 - 02:00' },
                           { value: '3', label: '03:00 - 05:00' },
                           { value: '4', label: '05:00 - 06:30' },
                           { value: '9', label: '06:00 - 07:00' },
                           { value: '7', label: '07:00 - 09:00' },
                           { value: '8', label: '10:00 - 05:00' },
                      
                        // Weekends
                      { value: '5', label: <div style={{ backgroundColor: '#fffbe6' }}>10:00 - 02:00 - Weekends</div> },
                      { value: '14', label: <div style={{ backgroundColor: '#fffbe6' }}>12:00 - 02:00 - Weekends</div> },
                        
                      // Weekdays
                      { value: '10', label: <div style={{ backgroundColor: '#c3f3fa' }}>12:30 - 02:30 - Weekdays</div> },
                      { value: '11', label: <div style={{ backgroundColor: '#c3f3fa' }}>07:00 - 08:30 - Weekdays</div> },
                      { value: '12', label: <div style={{ backgroundColor: '#c3f3fa' }}>05:00 - 07:00 - Weekdays</div> },
                      { value: '13', label: <div style={{ backgroundColor: '#c3f3fa' }}>08:00 - 09:00 - Weekdays</div> },
                      { value: '15', label: <div style={{ backgroundColor: '#c3f3fa' }}>07:00 - 08:30 - Weekdays</div> },
                    ]}
                    filterOption={(input, option) => {
                        const labelText = typeof option.label === 'string'
                          ? option.label
                          : option.label?.props?.children || ''; // safely get text inside <div>
                          
                        return labelText.toLowerCase().includes(input.toLowerCase());
                      }}
                    showSearch
                   />
                   {/* {errors.batchTime && <p className="text-red-500 text-sm">{errors.batchTime}</p>} */}
               </div>


               {/* Batch Start And End Date  */}
               <div className="col-span-2">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date and End Date</label>
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
                   <label htmlFor="course" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course</label>
                    <Select name="course" className='w-full border-gray-300' size='large' placeholder='Select Course' 
                        showSearch  // This enables search functionality
                            
                        onChange={(value) => {
                            const selectedCourse = selectedBatch?.courses?.find(course => course.id === value);
                            handleChange("course", selectedCourse ? { id: selectedCourse.id, name: selectedCourse.name } : "");
                        }}                        
                        value={batchFormData.course?.id || null}  // Ensure it's a single value
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        // options={(Array.isArray(selectedBatch?.courses) ? selectedBatch.courses : []).map(course => ({
                        //     value: course.id,  
                        //     label: course.name, 
                        // }))}
                        options={[
                            ...(Array.isArray(selectedBatch?.courses)
                              ? selectedBatch.courses.map(course => ({
                                  value: course.id, // Extract ID
                                  label: course.name, // Extract Name
                                }))
                              : []),
                            ...(selectedBatch?.batch_course
                              ? [{ value: selectedBatch.batch_course, label: selectedBatch.batch_course }]
                              : [])
                          ]}
                          
                          
                    />
                   {/* {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>} */}
               </div>

               {/* Dropdown for Preferred Week Selection */}
               <div className="col-span-2 sm:col-span-2">
                   <label htmlFor="preferredWeek" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Preferred Week</label>
                   <Select name="preferredWeek"  value={batchFormData.preferredWeek.length > 0 ? batchFormData.preferredWeek : null} onChange={(value) => handleChange("preferredWeek", value)} className='w-full border-gray-300' size='large' placeholder='Select Preferred Week' 
                   options={[
                               { value: 'Weekdays', label: 'Week Days' },
                               { value: 'Weekends', label: 'Weekends' },
                           ]}
                   />
                   {/* {errors.preferredWeek && <p className="text-red-500 text-sm">{errors.preferredWeek}</p>} */}
               </div>

                {/* Dropdown for Mode Selection */}
                <div className="col-span-2 sm:col-span-2">
                   <label htmlFor="mode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mode</label>
                   <Select name="mode" value={batchFormData.mode.length > 0 ? batchFormData.mode : null} onChange={(value) => handleChange("mode", value)} className='w-full border-gray-300' size='large' placeholder='Select Mode' 
                       options={[
                                   { value: 'Offline', label: 'Offline' },
                                   { value: 'Online', label: 'Online' },
                                   { value: 'Hybrid', label: 'Hybrid' },
                               ]} 
                       />
                   {/* {errors.mode && <p className="text-red-500 text-sm">{errors.mode}</p>} */}
               </div>

                {/* Dropdown for Language Selection */}
                <div className="col-span-2 sm:col-span-2">
                   <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Language</label>
                   <Select name="language" value={batchFormData.language.length > 0 ? batchFormData.language : null} onChange={(value) => handleChange("language", value)} className='w-full border-gray-300' size='large' placeholder='Select Language' 
                   options={[
                               { value: 'Hindi', label: 'Hindi', },
                               { value: 'English', label: 'English' },
                               { value: 'Both', label: 'Both' },
                           ]}
                   />
                   {/* {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>} */}
               </div>

                {/* Dropdown for Location Selection */}
                <div className="col-span-2 sm:col-span-2">
                   <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                   <Input name="location" disabled  value={batchFormData.location} onChange={(e) => handleChange("location", e.target.value)} className='rounded-lg border-gray-300' placeholder="Location"/>

                   {/* {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>} */}
               </div>

               {/* Dropdown for Trainer Selection */}
               <div className="col-span-2 sm:col-span-2">
                   <label htmlFor="trainer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Trainer</label>
                   <Input name="trainer" disabled  value={batchFormData.trainer} onChange={(e) => handleChange("trainer", e.target.value)} className='rounded-lg border-gray-300' placeholder="Trainer Name"/>
                   {/* {errors.trainer && <p className="text-red-500 text-sm">{errors.trainer}</p>} */}
               </div>


                {/* Dropdown for Student Selection */}
                {/* <div className="col-span-5 sm:col-span-5">
                   <label htmlFor="student" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Add Students</label>
                   <Select name="student" mode="multiple" className='w-full border-gray-300' size='large' placeholder='Select Students' 
                   showSearch  // This enables search functionality
                           
                   onChange={(value) => handleChange("student", value)} 
                   value={batchFormData.student ? batchFormData.student : []}
                   filterOption={(input, option) =>
                       option.label.toLowerCase().includes(input.toLowerCase()) // Search filter
                   }
                   options={studentData.map(student => ({
                       value: student.id,
                       label: student.name +" - "+ student.enrollment_no,
                   }))}
                   />
                   {errors.trainer && <p className="text-red-500 text-sm">{errors.trainer}</p>}
               </div> */}

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
           ) : "Create Batch"}
       </button>
          </div>
       </form>
    </div>
</div>
  );
};

export {CreateAvailableBatchForm};




import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import { Button, message, Select, Popover, Avatar, Tooltip, Tag, DatePicker, Checkbox } from 'antd';
import { EditOutlined, SyncOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons';
import CreateTrainerForm from "../Trainers/CreateTrainerForm";
import dayjs from "dayjs";
import handleBatchClick from "../../Navigations/Navigations";


const CheckboxGroup = Checkbox.Group;

const { RangePicker } = DatePicker;

const SpecificTrainerPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("running");
    const [selectedTrainer, setSelectedTrainer] = useState();

    const { trainerId } = useParams();
    const { specificTrainer, fetchSpecificTrainer, isEditing, setIsEditing, selectedOption, setSelectedOption, 
        startDate, setStartDate, endDate, setEndDate, loading, handleTrainerStatusChange } = useSpecificTrainer();
    const [searchTerm, setSearchTerm] = useState("");
    // for checkbox
    const [checkBatchList, setCheckBatchList] = useState([]); 

    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    useEffect(() => {
        if (trainerId) {
            try {
                // Decode the ID before using it
                const originalTrainerId = atob(trainerId);
                // setDecodedTrainerId(originalTrainerId);
                
                // Fetch trainer data with the decoded ID
                fetchSpecificTrainer(originalTrainerId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    }, [trainerId, isModalOpen]); 

    const trainerDetails = specificTrainer?.Trainer_All?.trainer;

    // filter batch data based on selected tab 
        const filteredBatches = specificTrainer?.Trainer_All 
            ? activeTab === 'running'
            ? specificTrainer?.Trainer_All?.trainer_batch_ongoing
            : activeTab === 'scheduled'
            ? specificTrainer?.Trainer_All?.trainer_batch_upcoming
            : activeTab === 'completed'
            ? specificTrainer?.Trainer_All.trainer_batch_completed
            :activeTab === 'hold'
            ? specificTrainer?.Trainer_All?.trainer_batch_hold
            : []
        : [];

        
        // FILTER BATCH FROM ALL BATCHES BASED ON THE SEARCH INPUT (BATCHID, COURSENAME, TRAINERNAME)
        const searchFilteredBatches = useMemo(() => {
            const term = searchTerm.toLowerCase();
              
            if (!searchTerm) return filteredBatches;
              
            return filteredBatches.filter(batch => {
                return (
                    (batch.batch_name?.toLowerCase() || "").includes(term) ||
                    (batch.course_name?.toLowerCase() || "").includes(term) ||
                    (batch.batch_mode?.toLowerCase() || "").includes(term) ||
                    (batch.batch_language?.toLowerCase() || "").includes(term) ||
                    (batch.batch_preferred_week?.toLowerCase() || "").includes(term) ||
                    (batch.batch_location?.toLowerCase() || "").includes(term)
                );
            });
        }, [filteredBatches, searchTerm, specificTrainer]);
              

        // FUNCTION HANDLE EDIT TRAINER CLICK
        const handleEditClick = (trainer) => {
            setSelectedTrainer(trainer); // Set the selected trainer data
            setIsModalOpen(true); // Open the modal
        };

        // Function to close the modal
        const handleCloseModal = () => {
            setIsModalOpen(false);
            setSelectedTrainer(null);
        };

         
        // handle status change to date select in dropdown
        const handleRangeChange = (value) => {
            if (value && value.length === 2) {
              const start = value[0].format("YYYY-MM-DD");
              const end = value[1].format("YYYY-MM-DD");
          
              setStartDate(start);
              setEndDate(end);
            } else {
              setStartDate(null);
              setEndDate(null);
            }
          };
          
          
        // RESET DATE FIELD WHEN CLICK ON CANCEL AND DATA IS SENT 
        const resetTrainerEditForm = () => {
            setIsEditing(false);
            setSelectedOption("");
            setStartDate(null);
            setEndDate(null);
          };


        // HANDLE SEND LEAVE EMAIL TO SELECTED BATCH OF SPECIFIC TRAINER 
        const allBatchIds = filteredBatches.map((item) => item.batch_id);
        const checkAll = checkBatchList.length === allBatchIds.length;
        const indeterminate = checkBatchList.length > 0 && checkBatchList.length < allBatchIds.length;

        // Fix toggleSelectAll
        const toggleSelectAll = (checked) => {
            const selected = checked ? filteredBatches.map((item) => item.batch_id) : [];
            setCheckBatchList(selected);
        };

        // Fix toggleStudent
        const toggleStudent = (id) => {            
            setCheckBatchList((prev) =>
                prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
            );
        };



    return (
        <>
        <div className="w-auto h-full pt-14 px-2 mt-0 ">
            <div className="grid grid-cols-7 gap-x-2">
                    {trainerDetails ? (
                    <>
                <div className="px-4 py-4 col-span-5 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    
                    <d iv className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                        <div className="flex gap-x-10">
                        <p># {trainerDetails.trainer_id}</p>
                        </div>
                            <Button 
                                color="secondary" 
                                variant="outlined" 
                                className="rounded-lg"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                    handleEditClick(trainerDetails);  // Open the form with selected course data
                                    setIsModalOpen(true);   // Open the modal
                                }}
                                >
                                <EditOutlined />
                            </Button>
                    </d>
                    <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        <div className="col-span-1 px-1 py-1">
                            <h1 >Name</h1>
                            <p className="font-bold text-lg text-blue-500">{trainerDetails.name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1">
                            <h1>Date of Joining</h1>
                            <p className="font-semibold">
                                {dayjs(trainerDetails.date_of_joining).format("DD/MM/YYYY")}
                            </p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Phone Number</h1>
                            <p className="font-semibold">{trainerDetails.phone}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 2xl:mt-0 lg:mt-6 md:mt-0 sm:mt-6">
                            <h1>Email Address</h1>
                            <p className="font-semibold">{trainerDetails.email}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Week Off</h1>
                            <p className="font-semibold">{trainerDetails.weekoff}</p>
                        </div>
                        
                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Experience</h1>
                            <p className="font-semibold">{trainerDetails.experience}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Support</h1>
                            <p className="font-semibold">{trainerDetails.coordinator_name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 mt-6">
                            <h1>Leave Status</h1>
                            {!isEditing ? (
                            <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">
                                {trainerDetails?.leave_status === "custom" ? `${trainerDetails?.leave_start_date} - ${trainerDetails?.leave_end_date}` : trainerDetails?.leave_status || "On Duty"}
                            </p>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-500 hover:text-primary"
                                aria-label="Edit Status"
                            >
                                <EditOutlined  />
                            </button>
                            </div>
                            ) : (
                                <>
                                    <div className="space-y-2 relative">
                                    <Select
                                        placeholder='Select Leave Type' 
                                        className="w-2/3 text-sm rounded border p-1"
                                        value={selectedOption}
                                        onChange={(value) => setSelectedOption(value)}
                                        options={[
                                            { value: 'First Half off', label: 'First Half Off' },
                                            { value: 'Second Half off', label: 'Second Half Off' },
                                            { value: 'Full Day off', label: 'Full Day Off' },
                                            { value: 'On Duty', label: 'On Duty' },
                                            { value: 'custom', label: 'Custom' },
                                        ]}
                                    />
                                
                                    {selectedOption === "custom" && (
                                    <Popover
                                        content={
                                        <RangePicker
                                            format="YYYY-MM-DD"
                                            value={[
                                            startDate ? dayjs(startDate) : null,
                                            endDate ? dayjs(endDate) : null,
                                            ]}
                                            onChange={handleRangeChange}
                                        />
                                        }
                                        open={true}
                                    >
                                    </Popover>
                                    )}
                                    </div>
                              
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleTrainerStatusChange(trainerDetails?.id, checkBatchList, () => setCheckBatchList([]))}
                                            disabled={loading}
                                            className="text-xs px-3 py-1 bg-blue-500 text-white rounded"
                                            >
                                            {loading ? (
                                                <>
                                                <SyncOutlined spin className="mr-2" />
                                                Processing...
                                                </>
                                            ) : "Save" }
                                            </button>
                                        <button
                                            onClick={resetTrainerEditForm}
                                            className="text-xs px-3 py-1 bg-gray-300 text-black rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            
                            )}
                        
                        </div>

                    </div>
                </div>

                <div className="px-4 py-4 col-span-2 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    <div className="w-full h-auto font-semibold">
                        
                        <div className="col-span-1 text-lg px-4 py-4">
                            <h1>Specialist</h1>
                        </div>

                        <div className="col-span-1 px-4 py-2 leading-8">
                            <ul>
                                {trainerDetails?.course_names.map((course, index) => (
                                    <li key={index}>{course}</li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                
                    </>
                    ) : (
                        <p>Loading trainer data...</p>
                    )}
            </div>

            {isModalOpen && (
                <CreateTrainerForm
                    trainer={selectedTrainer}
                    onClose={handleCloseModal}
                />
            )}
           
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <h1>Batches Assigned</h1>
                    </div>
                    <div className="flex justify-between gap-x-4 h-10">
                    
                        <div className="tabs">
                            <button
                                onClick={() => handleTabClick("running")}
                                className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "running" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                Active
                            </button>

                            <button
                                onClick={() => handleTabClick("scheduled")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "scheduled" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                Upcoming
                            </button>
                        
                            <button
                                onClick={() => handleTabClick("hold")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "hold" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                Hold
                            </button>

                            <button
                                onClick={() => handleTabClick("completed")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "completed" ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                Completed
                            </button>

                        
                            
                        </div>

                        <div className="grid col-span-1 justify-items-end">
                        <div className="flex gap-x-6">
                            <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative h-auto">
                                <input value={searchTerm} type="text" id="table-search" placeholder="Search for items"
                                    onChange={(e) => {
                                        const value = e.target.value.trimStart();
                                        setSearchTerm(value);
                                        setCurrentPage(1);
                                    }}
                                    className="2xl:w-80 lg:w-80 md:w-40 h-8 block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500" 
                                    />
                                <div className="absolute inset-y-0 right-0 h-8 flex items-center pr-3">
                                <button onClick={() => setSearchTerm("")}>
                                {searchTerm ? (
                                    <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                        </svg>
                                    )}
                                </button>
                                </div>
                            </div>
                        </div>
                        </div>

                    </div>

                        <div className="">
                                <>
                               <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                                    <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" className="p-2">
                                                    <div className="flex items-center">
                                                        <input id="checkbox-all-search" type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} checked={checkAll} ref={(el) => {if (el) {el.indeterminate = indeterminate}}} className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-1"></input>
                                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-2">
                                                    S.No
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Batch ID
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
                                                    students
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    course
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
                                                
                                            </tr>
                                    </thead>
                                        <tbody>
                                        {Array.isArray(searchFilteredBatches) && searchFilteredBatches.length > 0 ? (
                                            searchFilteredBatches.map((item, index) => (
                                            <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth">
                                                <td scope="col" className="p-2">
                                                    <div className="flex items-center">
                                                        <input id="checkbox-all-search" type="checkbox" checked={checkBatchList.includes(item.batch_id)} onChange={() => toggleStudent(item.batch_id)} className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-1"></input>
                                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                    </div>
                                                </td>
                                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleBatchClick(navigate,item.batch_id)}>
                                                    {item.batch_name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {dayjs(`1970-01-01T${item.batch_time_start}`).format("hh:mm A")} 
                                                    <span> - </span>
                                                    {dayjs(`1970-01-01T${item.batch_time_end}`).format("hh:mm A")}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {dayjs(item.batch_start_date).format("DD/MM/YYYY")}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {dayjs(item.batch_end_date).format("DD/MM/YYYY")}
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
                                                        {item.students?.map((student, index) => (
                                                            <Tooltip key={student.id || index} title={student.name} placement="top">
                                                                <Avatar
                                                                    size={24}
                                                                    style={{ backgroundColor: "#87d068" }}
                                                                >
                                                                     {student.name.charAt(0).toUpperCase()} {/* Show initials if no avatar */}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </Avatar.Group>
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-semibold">
                                                    {item.course_name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_mode === "Offline" ? "green" : item.batch_mode === "Online" ? "red" : "geekblue"}>
                                                        {item.batch_mode}
                                                    </Tag>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_language === "Hindi" ? "green" : item.batch_language === "English" ? "volcano" : "blue"}>
                                                        {item.batch_language}
                                                    </Tag>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_preferred_week === "Weekdays" ? "cyan" : "gold" }>
                                                        {item.batch_preferred_week}
                                                    </Tag>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_location === "Saket" ? "blue" : "magenta" }>
                                                        {item.batch_location}
                                                    </Tag>
                                                </td>
                                            </tr>
                                          ))
                                        ) : (
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td colSpan="5" className="text-center py-3 text-gray-500">
                                                    No batches found for {activeTab}
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                </table>
                                </>
                        

                        </div>
                </div>
                <CreateTrainerForm isOpen={isModalOpen} selectedTrainerData={selectedTrainer || {}} onClose={() => setIsModalOpen(false)} />

        </div>  
        </>
    )
};


export default SpecificTrainerPage;
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import { Button, message, Select, Popover, Avatar, Tooltip, Tag, DatePicker, Checkbox } from 'antd';
import { EditOutlined, SyncOutlined, CheckOutlined, DownOutlined } from '@ant-design/icons';
import CreateTrainerForm from "../Trainers/CreateTrainerForm";
import dayjs from "dayjs";
import handleBatchClick from "../../Navigations/Navigations";
import { useTheme } from "../../Themes/ThemeContext";


const CheckboxGroup = Checkbox.Group;

const { RangePicker } = DatePicker;

const SpecificTrainerPage = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------
    
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
        <div className={`w-auto h-full pt-16 px-4 mt-0 ${theme.bg}`}>
            <div className="grid grid-cols-7 gap-x-2">
                    {trainerDetails ? (
                    <>
                        <div className={`px-4 py-4 col-span-5 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
                            
                            <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                                <div className="flex items-center gap-x-10 flex-wrap">
                                <p># {trainerDetails.trainer_id}</p>
                                </div>
                                    <Button 
                                        color="secondary" 
                                        variant="outlined" 
                                        className={`rounded-xl ${theme.bg}`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                            handleEditClick(trainerDetails);  // Open the form with selected course data
                                            setIsModalOpen(true);   // Open the modal
                                        }}
                                        >
                                        <EditOutlined />
                                    </Button>
                            </div>
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

                <div className={`px-4 py-4 col-span-2 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
                    <div className="w-full h-auto font-semibold">
                        
                        <div className="col-span-1 text-lg px-4 py-4">
                            <h1>Specialist</h1>
                        </div>

                        <div className="col-span-1 px-4 py-2 leading-8">
                            <ul className="list-disc">
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
           
                    
                <div className={`px-0 py-4 h-auto shadow-md mt-2 mb-6 ${theme.specificPageBg}`}>
                    
                    <div className={`w-full h-auto px-4 py-3 text-lg font-semibold ${theme.text}`}>
                        <h1>Batches Assigned</h1>
                    </div>
                    <div className="flex justify-between gap-x-4 h-10 px-4">
                    
                        <div className="bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                            <button
                                onClick={() => handleTabClick("running")}
                                className={` px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                    ${activeTab === "running" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                Active
                            </button>

                            <button
                                onClick={() => handleTabClick("scheduled")}
                                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                    ${activeTab === "scheduled" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                Upcoming
                            </button>
                        
                            <button
                                onClick={() => handleTabClick("hold")}
                                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                    ${activeTab === "hold" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                Hold
                            </button>

                            <button
                                onClick={() => handleTabClick("completed")}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "completed" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400 '}`}
                                >
                                Completed
                            </button>

                        
                            
                        </div>

                        <div className="grid col-span-1 justify-items-end">
                        <div className="flex gap-x-6">
                            <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative h-auto">
                                <input value={searchTerm} type="text" id="table-search" placeholder="Search for batch"
                                    onChange={(e) => {
                                        const value = e.target.value.trimStart();
                                        setSearchTerm(value);
                                        setCurrentPage(1);
                                    }}
                                    className={`2xl:w-80 lg:w-80 md:w-40 h-8 block p-2 pr-10 text-xs font-medium ${theme.searchBg}`} 
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

                        <div className="px-4 rounded-xl">
                            <table className="w-full text-xs font-normal text-left text-gray-600 mt-1 bg-white/40 rounded-xl">
                                <thead className="bg-white sticky top-0 z-10">
                                        <tr className="bg-gray-50/80">
                                            <th scope="col" className="p-2">
                                                <div className="flex items-center">
                                                    <input id="checkbox-all-search" type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} checked={checkAll} ref={(el) => {if (el) {el.indeterminate = indeterminate}}}
                                                        className={`
                                                            w-3 h-3 rounded-[4px] text-md cursor-pointer focus:ring-0
                                                            appearance-none border border-gray-300
                                                            transition-all duration-200 ease-in-out
                                                            checked:${theme.activeTab} checked:border-transparent
                                                            hover:border-gray-400
                                                        `}
                                                    />
                                                </div>
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                S.No
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Batch ID
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Batch Time
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Start Date
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                End Date
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                students
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                course
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Mode
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Language
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Preferred Week
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                Location
                                            </th>
                                            
                                        </tr>
                                </thead>
                                    <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                                    {Array.isArray(searchFilteredBatches) && searchFilteredBatches.length > 0 ? (
                                        searchFilteredBatches.map((item, index) => (
                                        <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                            <td scope="col" className="p-2">
                                                <div className="flex items-center">
                                                    <input type="checkbox" checked={checkBatchList.includes(item.batch_id)} onChange={() => toggleStudent(item.batch_id)} 
                                                        className={`
                                                            w-3 h-3 rounded-[4px] text-md cursor-pointer focus:ring-0
                                                            appearance-none border border-gray-300
                                                            transition-all duration-200 ease-in-out
                                                            checked:${theme.activeTab} checked:border-transparent
                                                            hover:border-gray-400
                                                        `}
                                                     />
                                                </div>
                                            </td>
                                            <td scope="row" className="px-3 py-2 md:px-2">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBatchClick(navigate,item.batch_id)}>
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
                                                                 className={`${theme.studentCount} text-white`}
                                                            >
                                                                    {student.name.charAt(0).toUpperCase()} {/* Show initials if no avatar */}
                                                            </Avatar>
                                                        </Tooltip>
                                                    ))}
                                                </Avatar.Group>
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-medium">
                                                {item.course_name}
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.batch_mode === "Offline" ? "green" : item.batch_mode === "Online" ? "red" : "geekblue"}>
                                                    {item.batch_mode}
                                                </Tag>
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.batch_language === "Hindi" ? "green" : item.batch_language === "English" ? "volcano" : "blue"}>
                                                    {item.batch_language}
                                                </Tag>
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.batch_preferred_week === "Weekdays" ? "cyan" : "gold" }>
                                                    {item.batch_preferred_week}
                                                </Tag>
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.batch_location === "Saket" ? "blue" : "magenta" }>
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
                        </div>
                </div>
                <CreateTrainerForm isOpen={isModalOpen} selectedTrainerData={selectedTrainer || {}} onClose={() => setIsModalOpen(false)} />

        </div>  
        </>
    )
};


export default SpecificTrainerPage;
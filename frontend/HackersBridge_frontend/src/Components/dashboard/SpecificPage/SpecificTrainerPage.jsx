import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import { Button, message, Popconfirm, Switch, Avatar, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import CreateTrainerForm from "../Trainers/CreateTrainerForm";




const SpecificTrainerPage = () => {
    const { trainerId } = useParams();
    const { specificTrainer, fetchSpecificTrainer } = useSpecificTrainer();
    const [activeTab, setActiveTab] = useState("running");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
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
    }, [trainerId]); 

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


        // Function to handle Edit button click
        const handleEditClick = (trainer) => {
            setSelectedTrainer(trainer); // Set the selected trainer data
            setIsModalOpen(true); // Open the modal
        };

        // Function to close the modal
        const handleCloseModal = () => {
            setIsModalOpen(false);
            setSelectedTrainer(null);
        };

        // TO NAVIGATE TO BATCH SPECIFIC PAGE 
        const handleBatchClick = async (batchId) => {
            if (!batchId) return;
            console.log(batchId);
            
            const encodedBatchId = btoa(batchId);
            
            navigate(`/batches/${encodedBatchId}`)
        };

    

    return (
        <>
        <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
            <div className="grid grid-cols-5 gap-x-6">
                    {trainerDetails ? (
                    <>
                <div className="px-4 py-4 col-span-3 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                        <p># {trainerDetails.trainer_id}</p>
                        <Button 
                            color="secondary" 
                            variant="filled" 
                            className="rounded-lg"
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
                                {new Date(trainerDetails.date_of_joining).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Phone Number</h1>
                            <p className="font-semibold">{trainerDetails.phone}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
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

                        </div>
                </div>

                <div className="px-4 py-4 col-span-2 h-auto shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
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
           
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <h1>Batches Assigned</h1>
                    </div>
                    <div className="flex gap-x-4 h-10">
                    
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

                </div>
                        <div className="">
                                <>
                               <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                                    <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                            <tr>
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
                                                    Location
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1">
                                                    Preferred Week
                                                </th>
                                                
                                            </tr>
                                    </thead>
                                        <tbody>
                                        {Array.isArray(filteredBatches) && filteredBatches.length > 0 ? (
                                            filteredBatches.map((item, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleBatchClick(item.batch_id)}>
                                                    {item.batch_name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(`1970-01-01T${item.batch_time_start}`).toLocaleString("en-US", {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    hour12: true,
                                                    })} 
                                                    <span> - </span>
                                                    {new Date(`1970-01-01T${item.batch_time_end}`).toLocaleString("en-US", {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    hour12: true,
                                                    })}
                                                    {item.batch_time_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(item.batch_start_date).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    })}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(item.batch_end_date).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })}
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
                                                    {/* {item.batch_mode} */}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_language === "Hindi" ? "green" : item.batch_language === "English" ? "volcano" : "blue"}>
                                                        {item.batch_language}
                                                    </Tag>
                                                    {/* {item.batch_language} */}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_location === "Saket" ? "blue" : "magenta" }>
                                                        {item.batch_location}
                                                    </Tag>
                                                    {/* {item.batch_location} */}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.batch_preferred_week === "Weekdays" ? "cyan" : "gold" }>
                                                        {item.batch_preferred_week}
                                                    </Tag>
                                                    {/* {item.batch_preferred_week} */}
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
                   
        </div>  
        </>
    )
};


export default SpecificTrainerPage;
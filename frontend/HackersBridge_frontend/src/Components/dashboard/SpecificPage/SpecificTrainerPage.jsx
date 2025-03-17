import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    // const [decodedTrainerId, setDecodedTrainerId] = useState(null);

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
            setSelectedTrainer(trainer); // Set the selected course data
            setIsModalOpen(true); // Open the modal
            
        };


    // Function to close the modal
    const handleCloseModal = async  () => {
        setIsModalOpen(false);
        setSelectedTrainer(null);
        
        // Refetch trainer data after modal closes
        try {
            const originalTrainerId = atob(trainerId);
            await fetchSpecificTrainer(originalTrainerId);
        } catch (error) {
            console.error("Error fetching updated trainer data:", error);
        }
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
                            <p className="font-semibold">{trainerDetails.date_of_joining}</p>
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
           
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <h1>Batches Assigned</h1>
                    </div>
                    <div className="flex gap-x-4 h-10">
                    
                    <div className="tabs">
                        <button
                            onClick={() => handleTabClick("running")}
                            className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "running" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                        Active
                        </button>

                        <button
                            onClick={() => handleTabClick("scheduled")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "scheduled" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Upcoming
                        </button>
                       
                        <button
                            onClick={() => handleTabClick("hold")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "hold" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Hold
                        </button>

                        <button
                            onClick={() => handleTabClick("completed")}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === "completed" ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
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
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.batch_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.batch_time_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.start_date}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.end_date}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.course_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.mode}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.language}
                                                </td>
                                              
                                                <td className="px-3 py-2 md:px-1">
                                                {/* <Tag bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag> */}
                                                {item.location_id == '1' ? 'saket' : 'Laxmi Nagar'}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.preferred_week}
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

        {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <CreateTrainerForm 
                        isOpen={isModalOpen}
                        selectedTrainerData={selectedTrainer}  // Pass the trainer details
                        onClose={handleCloseModal} 
                    />
                </div>
            </div>
        )}


    </>

    )
};


export default SpecificTrainerPage;
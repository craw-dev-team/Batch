import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import CreateTrainerForm from "./CreateTrainerForm";
import { Button, message, Popconfirm, Switch, Avatar, Tooltip, Tag, Empty, Spin, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { useSpecificTrainer } from "../Contexts/SpecificTrainers";
import AvailableTrainers from "./AvailableTrainers";
import FutureAvailableTrainers from "./FutureAvailableTrainers";
import { useAuth } from "../AuthContext/AuthContext";
import { handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";
import TrainerCards from "../SpecificPage/Cards/Trainer/TrainerCards";
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext";


const Trainers = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------
        
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('all_trainers');
    const [selectedTrainer, setSelectedTrainer] = useState();
    const [isDeleted, setIsDeleted] = useState(false);
    const [trainerStatuses, setTrainerStatuses] = useState({}); // Store status per trainer
    const [searchTerm, setSearchTerm] = useState("");
    // const [showSearch, setShowSearch] = useState(false);


    const { trainerData, loading, setTrainerData, fetchTrainers } = useTrainerForm();
    
    const navigate = useNavigate();


        const handleTabClick = (tab) => {
            setActiveTab(tab);
        };

        // Filter trainers based on the search term (searches by name)
        const filteredTrainers = Array.isArray(trainerData?.all_data?.trainers)
        ? trainerData.all_data.trainers.filter(trainer =>
            trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];


        useEffect(() => {
            fetchTrainers(); 
        },[trainerData, selectedTrainer]);

        useEffect(() => {
            setIsDeleted(false); // Reset deletion flag
            
            if (trainerData?.all_data?.trainers) {
                // Ensure trainerData.all_data.trainers exists and is an array
                const trainersArray = Array.isArray(trainerData.all_data.trainers)
                    ? trainerData.all_data.trainers
                    : [];
                    
                    // Set a timeout to wait 2 seconds before initializing statuses
                    const timer = setTimeout(() => {
                        const initialStatuses = {};
                        trainersArray.forEach((trainer) => {
                            initialStatuses[trainer.id] = trainer.status === "Active"; 
                        });
                        
                    setTrainerStatuses(initialStatuses); 
                }, 100);
    
                // Cleanup function to clear the timer if the component unmounts
                return () => clearTimeout(timer);
            };

           
        }, [trainerData, isDeleted, selectedTrainer, isModalOpen]);
        

    // Function to handle Edit button click
    const handleEditClick = (trainer) => {
        setSelectedTrainer(trainer); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };


    // Delete Function
    const handleDelete = async (trainerId) => {
    if (!trainerId) return;
        
    try {
        const response = await axiosInstance.delete(`/api/trainers/delete/${trainerId}/`);

        if (response.status === 204) {
            // Make sure coursesData is an array before filtering
            if (Array.isArray(trainerData)) {
                setTrainerData(prevTrainers => prevTrainers.filter(trainer => trainer.id !== trainerId));
            } else {
                console.error('TrainerData is not an array');
            }
        }
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

    // Confirm and Cancel Handlers for delete button
    const confirm = (trainerId) => {
        handleDelete(trainerId); // Call delete function with course ID
        message.success('Trainer Deleted Successfully');
    };

    const cancel = () => {
        message.error('Trainer Deletion Cancelled');
    };
    

    // Handle Toggle of trainer active and inactive 
    const handleToggle = async (checked, trainerId, trainerEmail) => {
        const newStatus = checked ? "Active" : "Inactive";
        
        //  Optimistically update UI before API call
        setTrainerStatuses((prev) => ({ ...prev, [trainerId]: checked }));
    
        try {
            const response = await axiosInstance.put(`/api/trainers/edit/${trainerId}/`, 
                { status: newStatus, email: trainerEmail } );
            
            message.success(`Trainer status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");            
            //  Revert UI if API fails
            setTrainerStatuses((prev) => ({ ...prev, [trainerId]: !checked }));
        }
    };
    



    return (
        <>
        <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
            <TrainerCards  handleTabClick={handleTabClick} activeTab={activeTab}/>
            {/* <div className="relative mt-3 w-full h-full shadow-md sm:rounded-lg border border-gray-50"> */}
                <div className="w-full grid grid-cols-3 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-4 px-0 pt-4 pb-2">
                    <div className="flex gap-x-4 h-auto flex-wrap justify-between">
                        {/* Dropdown for small screens */}
                        <div className="lg:hidden">
                            <select
                                value={activeTab}
                                onChange={(e) => handleTabClick(e.target.value)}
                                className="block w-auto px-4 py-1 text-sm border rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                            <option value="all_trainers">Trainers</option>
                            <option value="available_trainers">Available Trainers</option>
                            <option value="future_available_trainers">Future Available Trainers</option>
                            </select>
                        </div>


                        <div className="relative hidden lg:flex bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                            <button
                                onClick={() => handleTabClick('all_trainers')}
                                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                    ${activeTab === 'all_trainers' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                All Trainers
                            </button>
                            <button
                                onClick={() => handleTabClick('available_trainers')}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === 'available_trainers' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                Available Trainers
                            </button>
                            <button
                                onClick={() => handleTabClick('future_available_trainers')}
                                className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === 'future_available_trainers' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                >
                                Future Available Trainers
                            </button>
                        </div>

                    </div>

                    <div className="flex justify-center">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative">
                            <input onChange={(e) => setSearchTerm(e.target.value.trim())} value={searchTerm} type="text" id="table-search" placeholder="Search for trainer"
                                className={`2xl:w-96 lg:w-96 md:w-40 h-8 block p-2 pr-10 text-xs font-medium ${theme.searchBg}`} 
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
                

                    </div>
                        
                    <div className="flex justify-end">
                    <button onClick={() => { setIsModalOpen(true); setSelectedTrainer(null); }} type="button" className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Add Trainer +</button>
                    </div>

                </div>


                
                {activeTab === 'all_trainers' && (
                <div className={"overflow-hidden pb-2 mx-0 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm"}>
                <div className="w-full h-[37rem] md:max-h-[32rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2">
                <table className="w-full text-xs font-normal text-left text-gray-600">
                <thead className="bg-white sticky top-0 z-10">
                        <tr className="bg-gray-50/80">
                            {/* <th></th> */}
                            <th scope="col" className="p-2">
                                <div className="flex items-center">
                                    <input id="checkbox-all-search" type="checkbox" 
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
                            {/* <th scope="col" className="px-3 py-3 md:px-2">
                                ID
                            </th> */}
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Trainer ID
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 relative text-xs font-medium uppercase">
                                <div className="flex items-center gap-2 relative">
                                    Name
                                    {/* <div className="relative inline-block">
                                    <Tooltip title="Search Trainer" placement="top">
                                        <span 
                                            onClick={() => {
                                                setShowSearch((prev) => { 
                                                    if (prev) setSearchTerm(""); 
                                                    return !prev;
                                                });
                                            }} 
                                            className="cursor-pointer"
                                        >
                                            <svg 
                                                className="w-4 h-4 text-gray-500 dark:text-gray-400" 
                                                aria-hidden="true" 
                                                fill="currentColor" 
                                                viewBox="0 0 20 20" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path 
                                                    fillRule="evenodd" 
                                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                        </span>
                                        </Tooltip>

                                        {showSearch && (
                                            <div className="w-[13rem] absolute left-full top-0 ml-2 bg-white border rounded-lg shadow-lg p-1 z-50 flex">
                                                <input
                                                    type="text"
                                                    className="block px-2 p-0 text-sm font-normal text-gray-900 border border-gray-300 rounded-lg w-full bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="Search by name..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    autoFocus
                                                />
                                                <button 
                                                    className="ml-0 py-1 text-sm font-semibold text-white rounded-md  focus:outline-none" 
                                                    onClick={() => { setShowSearch(false); setSearchTerm(""); }}
                                                >   <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </th>

                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Date of Joining
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Phone No
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Email
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Experience
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Courses
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Language
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Team Leader
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Coordinator
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Location
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Week Off
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Status
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Action
                            </th>
                            
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                    {loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                        
                    ) : filteredTrainers.length > 0 ? (
                        filteredTrainers.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                            <td scope="col" className="p-2">
                                <div className="flex items-center">
                                    <input id="checkbox-all-search" type="checkbox" 
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
                            <td className="px-3 py-2 md:px-1 cursor-pointer font-medium" onClick={() => handleTrainerClick(navigate,item.id)}>
                                {item.trainer_id}
                            </td>
                            <td className="px-3 py-2 md:px-1 font-normal">
                                {item.name}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {dayjs(item.date_of_joining).format("DD/MM/YYYY")}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.phone}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.email}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.experience}
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
                                        {item.course_names?.map((name, index) => (
                                            <Tooltip key={index} title={name} placement="top">
                                                <Avatar
                                                    size={24}
                                                    className={`${theme.studentCount} text-white`}
                                                >
                                                    {name[0]}
                                                </Avatar>
                                            </Tooltip>
                                        ))}
                                    </Avatar.Group>
                            </td>
                            <td className="px-3 py-2 md:px-1 font-normal">
                                <Tag className="rounded-xl" bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                            </td>

                            <td className="px-3 py-2 md:px-1">
                                {trainerData?.all_data?.teamleaders?.find(leader => leader.id === item.teamleader)?.name || "Mohit Yadav"}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.coordinator_name}
                            </td>

                            <td className="px-3 py-2 md:px-1 font-normal">
                                {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag>}
                            </td>
                            
                            <td className="px-3 py-2 md:px-1">
                                {item.weekoff}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                <Switch
                                    size="small"
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    checked={trainerStatuses[item.id] || false} // Get correct status per trainer
                                    onChange={(checked) => handleToggle(checked, item.id, item.email)}
                                    style={{
                                        backgroundColor: trainerStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                    }}
                                />                    
                            </td>
                            <td > 
                                <Dropdown
                                    trigger={["click"]}
                                    placement="bottomRight"
                                    menu={{
                                    items: [
                                        {
                                        key: "edit",
                                        label: (
                                            <div
                                            className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(item);   // Open trainer edit form
                                                setIsModalOpen(true);    // Open the modal
                                            }}
                                            >
                                            <EditOutlined /> Edit
                                            </div>
                                        ),
                                        },
                                        {
                                        key: "delete",
                                        label: (
                                            <Popconfirm
                                            title="Delete the Trainer"
                                            description="Are you sure you want to delete this Trainer?"
                                            onConfirm={() => confirm(item.id)}
                                            onCancel={cancel}
                                            okText="Yes"
                                            cancelText="No"
                                            >
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md text-red-500"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DeleteOutlined /> Delete
                                            </div>
                                            </Popconfirm>
                                        ),
                                        },
                                    ],
                                    }}
                                    >
                                    <MoreOutlined className="cursor-pointer text-lg p-2 rounded-full hover:bg-gray-200" />
                                </Dropdown>
                            </td>
                        </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                    <Empty description="No trainers found" />
                                </td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
                </div>
                </div>
                )}

                <div>
                    {activeTab === 'available_trainers' && (
                        <div className="w-full h-full overflow-hidden">
                            <AvailableTrainers />
                        </div>
                    )}
                </div>

                <div>
                    {activeTab === 'future_available_trainers' && (
                        <div className="w-full h-full overflow-hidden">
                            <FutureAvailableTrainers />
                        </div>
                    )}
                </div>
            {/* </div> */}

        <CreateTrainerForm isOpen={isModalOpen} selectedTrainerData={selectedTrainer || {}} onClose={() => setIsModalOpen(false)} />

        </div>  


   </>
    )
}


export default Trainers;
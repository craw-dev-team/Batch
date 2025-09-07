import { useEffect, useState } from "react"
import axios from "axios";
import BASE_URL from "../../../../ip/Ip";
import { Button, message, Popconfirm, Switch, Empty, Spin, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import AddCoordinatorForm from "./AddCoordinatorForm";
import { useCoordinatorForm } from "./CoordinatorContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import TimeSlot from "../TimeSlot/TimeSlot";
import { handleCoordinatorClick } from "../../../Navigations/Navigations";
import Tags from './../../Tags/Tags';
import { useTheme } from "../../../Themes/ThemeContext";




const Coordinators = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoordinator, setSelectedCoordinator] = useState(); 
    const [isDeleted, setIsDeleted] = useState(false);
    const [coordinatorStatuses, setCoordinatorStatuses] = useState({}); // Store status per trainer

    const { coordinatorData, loading, setLoading, setCoordinatorData, fetchCoordinators } = useCoordinatorForm();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState("coordinators");
    
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab)
    };


    // Fetch batches afer deletion or modal open
    useEffect(() => {
        fetchCoordinators();
        setIsDeleted(false);

        if (coordinatorData) {
            // Ensure trainerData.all_data.trainers exists and is an array
            const coordinatorArray = Array.isArray(coordinatorData)
                ? coordinatorData
                : [];

            // Set a timeout to wait 2 seconds before initializing statuses
            const timer = setTimeout(() => {
                const initialStatuses = {};
                coordinatorArray.forEach((coordinator) => {
                    initialStatuses[coordinator.id] = coordinator.status === "Active"; 
                });

                setCoordinatorStatuses(initialStatuses); 
            }, 100);

            // Cleanup function to clear the timer if the component unmounts
            return () => clearTimeout(timer);
        }

    },[isDeleted, selectedCoordinator, isModalOpen, coordinatorData])


     // Function to handle Edit button click 
     const handleEditClick = (coordinator) => {
        setSelectedCoordinator(coordinator);
        setIsModalOpen(true);
        setIsDeleted(false);
    };

     // Delete Function 
     const handleDelete = async (coordinatorId) => {
        if (!coordinatorId) return;

        try {
            const response = await axios.delete(`${BASE_URL}/api/coordinators/delete/${coordinatorId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                withCredentials : true
            }
            );

            if (response.status === 204) {
                // Make sure coursesData is an array before filtering
                if (Array.isArray(coordinatorData)) {
                    setCoordinatorData(prevCoordinator => prevCoordinator.filter(coordinator => coordinator.id !== coordinatorId));
                } else {
                    console.error('coordinatordata is not an array');
                }
            }
        }catch (error) {
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
      const confirm = (coordinatorId) => {
        handleDelete(coordinatorId);
        message.success('Coordinator Deleted Successfully');
    };

    const cancel = () => {
        message.error('Coordinator Deletion Cancelled');
    };
    


    // Handle Toggle of coordinator active and inactive 
    const handleToggle = async (checked, coordinatorId, coordinatorEmail) => {
        const newStatus = checked ? "Active" : "Inactive";
        
        // Optimistically update UI before API call
        setCoordinatorStatuses((prev) => ({ ...prev, [coordinatorId]: checked }));
    
        try {
            await axios.put(`${BASE_URL}/api/coordinators/edit/${coordinatorId}/`, 
                { status: newStatus, email: coordinatorEmail },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                withCredentials : true
            }
            );
            message.success(`Coordinator status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");
            // Revert UI if API fails
            setCoordinatorStatuses((prev) => ({ ...prev, [coordinatorId]: !checked }));
        }
    };




    return (
        <>
            <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
                
                    <div className="w-full grid grid-cols-4 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8">
                        <div className="grid col-span-2">
                            <div className="flex gap-x-4 h-10 ">   
                                <div className="bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                    <button
                                        onClick={() => handleTabClick('coordinators')}
                                        className={` px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                            ${activeTab === 'coordinators' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                    Coordinators
                                    </button>
                                    <button
                                        onClick={() => handleTabClick('tags')}
                                        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                            ${activeTab === 'tags' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                    Tags
                                    </button>
                                    <button
                                        onClick={() => handleTabClick('timeslot')}
                                        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                            ${activeTab === 'timeslot' ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                    Time Slot
                                    </button>
                                </div>

                            </div>
                        </div>                     

                    </div> 

                    {activeTab === "coordinators" && (
                        <div className={`relative w-full h-full shadow-md rounded-xl p-4 mt-1 ${theme.specificPageBg}`}>
                        <div className={`w-full px-1 py-3 flex justify-between items-center font-semibold ${theme.text}`}>
                            <h1>All Coordinators</h1>
                                <div>
                                    <button onClick={() =>  { setIsModalOpen(true); setSelectedCoordinator(null); }} type="button" className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Add Coordinator +</button>
                                </div>
                            </div>

                            <div className={`overflow-hidden pb-0 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                                <div className="w-full h-[37rem] md:max-h-[36rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2">
                                    <table className="w-full text-xs font-normal text-left text-gray-600">
                                        <thead className="bg-white sticky top-0 z-10">
                                            <tr className="bg-gray-50/80">
                                                {/* <th scope="col" className="p-4">
                                                    <div className="flex items-center">
                                                        <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                    </div>
                                                </th> */}
                                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                    S.No
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                    Coordinator ID
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                    Phone Number
                                                </th>
                                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                    Email Address
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
                                    
                                        ) : coordinatorData &&  Array.isArray(coordinatorData) && coordinatorData.length > 0 ? (
                                            coordinatorData.map((item, index) => (    
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                                                <td scope="row" className="px-3 py-2 md:px-2">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleCoordinatorClick(navigate,item.id)}>
                                                    {item.coordinator_id}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleCoordinatorClick(navigate,item.id)}>
                                                    {item.name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.phone}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.email}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.weekoff}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Switch
                                                        size="small"
                                                        checkedChildren={<CheckOutlined />}
                                                        unCheckedChildren={<CloseOutlined />}
                                                        checked={coordinatorStatuses[item.id] || false} // Get correct status per trainer
                                                        onChange={(checked) => handleToggle(checked, item.id, item.email)}
                                                        style={{
                                                            backgroundColor: coordinatorStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                                        }}
                                                    /> 
                                                </td>
                                                <td> 
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
                                                                    handleEditClick(item);  // Open edit form
                                                                    setIsModalOpen(true);   // Open modal
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
                                                                title="Delete the Coordinator"
                                                                description="Are you sure you want to delete this Coordinator?"
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
                                                    <Empty description="No Coordinators found" />
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    )}
           
                    {activeTab === "tags" && (
                        <Tags />
                    )}
        
        
                    {activeTab === "timeslot" && (
                        <TimeSlot />
                    )}

            <AddCoordinatorForm isOpen={isModalOpen} coordinatorData={selectedCoordinator|| {}} onClose={() => setIsModalOpen(false)} />

            </div>  

        </>

    )  
}


export default Coordinators;
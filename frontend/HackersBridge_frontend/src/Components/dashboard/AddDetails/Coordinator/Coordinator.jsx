import { useEffect, useState } from "react"
import axios from "axios";
import BASE_URL from "../../../../ip/Ip";
import { Button, message, Popconfirm, Switch, Empty, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import AddCoordinatorForm from "./AddCoordinatorForm";
import { useCoordinatorForm } from "./CoordinatorContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";






const Coordinators = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoordinator, setSelectedCoordinator] = useState(); 
    const [isDeleted, setIsDeleted] = useState(false);
    const [coordinatorStatuses, setCoordinatorStatuses] = useState({}); // Store status per trainer

    const { coordinatorData, loading, setLoading, setCoordinatorData, fetchCoordinators } = useCoordinatorForm();
    const { token } = useAuth();
    
    const navigate = useNavigate();

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
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
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
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );
            message.success(`Coordinator status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");
            // Revert UI if API fails
            setCoordinatorStatuses((prev) => ({ ...prev, [coordinatorId]: !checked }));
        }
    };


    const handleCoordinatorClick = async (coordinatorId) => {
        if (!coordinatorId) return;
            const encodedCoordinatorId = btoa(coordinatorId);
            navigate(`/add-details/coordinators/${encodedCoordinatorId}`);
    };


    return (
        <>
            <div className="w-auto pt-4 px-2 mt-16 darkmode">
                <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                    <h1>All Coordinators</h1>
                        <div>
                            <button onClick={() =>  { setIsModalOpen(true); setSelectedCoordinator(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Coordinator +</button>
                        </div>
                    </div>

                    {/* <div className="w-full grid grid-cols-4 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
                        <div className="grid col-span-2">
                            <div className="flex gap-x-4 h-10">
                                
                            <div className="tabs">
                        <button
                            onClick={() => handleTabClick('tab1')}
                            className={` px-4 py-2 text-sm font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === 'tab1' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                        Active Batches
                        </button>
                        <button
                            onClick={() => handleTabClick('tab2')}
                            className={`px-4 py-2 text-sm font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === 'tab2' ? 'bg-[#afc0d1] dark:bg-[#3D5A80] text-black dark:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Scheduled Batches
                        </button>
                    </div>

                            </div>
                        </div>

                    <div className="grid col-span-2 justify-items-end">
                        <div className="flex gap-x-6">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                                </div>
                                <input type="text" id="table-search" className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-40 h-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for items"></input>
                            </div>
                    

                        <div className="col-span-1 justify-items-end">
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
                        </div>
                        </div>
                        </div>

                    

                    </div> */}
                    <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                        <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                {/* <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </th> */}
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    S.No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Coordinator ID
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Name
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Phone Number
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Email Address
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Week Off
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
                    
                        ) : coordinatorData &&  Array.isArray(coordinatorData) && coordinatorData.length > 0 ? (
                            coordinatorData.map((item, index) => (    
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleCoordinatorClick(item.id)}>
                                    {item.coordinator_id}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleCoordinatorClick(item.id)}>
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
                                            onClick={(e) => e.stopPropagation()} // Prevent the click from triggering the Edit button
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
                                    <Empty description="No Coordinators found" />
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    </div>

                    </div>
                </div>

            <AddCoordinatorForm isOpen={isModalOpen} coordinatorData={selectedCoordinator|| {}} onClose={() => setIsModalOpen(false)} />

            </div>  

   </>
    )
}


export default Coordinators;
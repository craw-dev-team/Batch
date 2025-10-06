import { useNavigate, useParams } from "react-router-dom";
import { useSpecificCoordinator } from "../Contexts/SpecificCoordinators";
import { useEffect, useState } from "react";

import { Button, Popconfirm,  Avatar, Tag, Tooltip, Switch, Spin, Empty  } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import SpecificCoordinatorLogs from "../AllLogs/Coordinator/SpecificCoordinatorLogs";
import AddCoordinatorForm from "../AddDetails/Coordinator/AddCoordinatorForm";
import SpecificCoordinatorActivityLogs from "../AllLogs/Coordinator/SpecificCoordinatorActivityLogs";
import { handleStudentClick, handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";
import { useTheme } from "../../Themes/ThemeContext";



const SpecificCoordinatorPage = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoordinator, setSelectedCoordinator] = useState();

    const { coordinatorId } = useParams();
    const { specificCoordinator, loading, fetchSpecificCoordinator, specificCoordinatorStudents, fetchSpecificCoordinatorStudents, specificCoordinatorTrainers, fetchSpecificCoordinatorTrainers } = useSpecificCoordinator();
    const [topTab, setTopTab] = useState("Info");
    const [activeTab, setActiveTab] = useState("students");

    const navigate = useNavigate();

    
    const handleTopTabClick = (tab) => {
        setTopTab(tab);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (coordinatorId) {                        
            try {
                const originalCoordinatorId = atob(coordinatorId);
                fetchSpecificCoordinator(originalCoordinatorId);
                fetchSpecificCoordinatorStudents(originalCoordinatorId);
                fetchSpecificCoordinatorTrainers(originalCoordinatorId);
            } catch (error) {
                console.error("Error decoding Coordinator ID", error);
            }
        }
    },[coordinatorId]);

    const coordinatorDetails = specificCoordinator?.Coordinator_Info?.coordinator;


         // FUNCTION TO HANDLE EDIT BUTTON CLICK
        const handleEditClick = (coordinatorId) => {
            setSelectedCoordinator(coordinatorId); // Set the selected course data
            setIsModalOpen(true); // Open the modal
        };



return (
    <>
        <div className={`w-auto h-full pt-16 px-4 mt-0 ${theme.bg}`}>
            <div className="relative z-10 inline-block bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                <button
                    onClick={() => handleTopTabClick("Info")}
                    className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                        ${topTab === "Info" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                >
                Info
                </button>

                <button
                    onClick={() => handleTopTabClick("Activity_Logs")}
                    className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50  
                        ${topTab === "Activity_Logs" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                >
                Activity Logs
                </button>
                
                <button
                    onClick={() => handleTopTabClick("Logs")}
                    className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                        ${topTab === "Logs" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                >
                Logs
                </button>
                            
            </div>
                
                {topTab === 'Info' && (
                    <> 
                    <div className="grid grid-cols-6 gap-x-6 mt-1">
                        {coordinatorDetails ? (
                            <>
                            <div className={`px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg ${theme.specificPageBg}`}>
                                
                                <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                                    <p># {coordinatorDetails.coordinator_id}</p>

                                    <Button  
                                        color="secondary" 
                                        variant="outlined" 
                                        className={`rounded-xl ${theme.bg}`}
                                        onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                                handleEditClick(coordinatorDetails);  // Open the form with selected course data
                                                setIsModalOpen(true);   // Open the modal
                                            }}>
                                            <EditOutlined />
                                    </Button>
                                </div>
                                    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                                    <div className="col-span-1 px-1 py-1">
                                        <h1 >Name</h1>
                                        <p className="font-bold text-lg text-blue-500">{coordinatorDetails.name}</p>
                                    </div>

                                    <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                                        <h1>Phone Number</h1>
                                        <p className="font-semibold">{coordinatorDetails.phone}</p>
                                    </div>

                                    <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                                        <h1>Email Address</h1>
                                        <p className="font-semibold">{coordinatorDetails.email}</p>
                                    </div>

                                    <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                                        <h1>Week Off</h1>
                                        <p className="font-semibold">{coordinatorDetails.weekoff}</p>
                                    </div>

                                    <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                                        <h1>Status</h1>
                                        <p className="font-semibold"><Tag color="green">{coordinatorDetails.status}</Tag></p>
                                    </div>

                                    </div>
                            </div>

                            <div className={`py-4 px-4 col-span-6 mt-2 h-auto shadow-md ${theme.specificPageBg}`}>
                                <div className="w-auto inline-block bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                        
                                        <button
                                            onClick={() => handleTabClick("students")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${activeTab === "students" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                            Students
                                        </button>
                                        
                                        <button
                                            onClick={() => handleTabClick("trainers")}
                                            className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                                                ${activeTab === "trainers" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                                        >
                                            Trainers
                                        </button>
                                    </div>

                                {activeTab === 'students' && (
                                    <div className={`overflow-hidden pb-2 mt-1 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                                        <div className="w-full h-auto md:max-h-[22rem] 2xl:max-h-[25rem] overflow-y-auto rounded-xl pb-2">
                                            <table className="w-full text-xs font-normal text-left text-gray-600">
                                                <thead className="bg-white sticky top-0 z-10">
                                                    <tr className="bg-gray-50/80">
                                                        <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                            s.No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Enrollment No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Phone No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Email
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Date of Joining
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Courses
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Language
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Mode
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Preferred Week
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Location
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            course Counsellor
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            support Coordinator
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="100%" className="text-center py-4">
                                                                <Spin size="large" />
                                                            </td>
                                                        </tr>
                                
                                                    ) : (specificCoordinatorStudents ?? []).length > 0 ? (
                                                        specificCoordinatorStudents.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                                            <td scope="row" className="px-3 py-2 md:px-2">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate,item.id)}>
                                                                {item.enrollment_no}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate,item.id)}>
                                                                {item.name}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {item.phone}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {item.email}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {dayjs(item.date_of_joining).format("DD/MM/YYYY")}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                            <Avatar.Group
                                                                        maxCount={2} // Show only 2 avatars initially
                                                                        maxStyle={{
                                                                            color: "#f56a00",
                                                                            backgroundColor: "#fde3cf",
                                                                            height: "24px", // Match avatar size
                                                                            width: "24px", // Match avatar size
                                                                        }}
                                                                    >
                                                                        {item.courses_names?.map((name, index) => (
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
                                                            <Tag className="rounded-xl" bordered={false} color={item.language == 'hindi'? 'green' : item.language == 'english'? 'volcano' : 'blue'}>{item.language}</Tag>
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                            <Tag className="rounded-xl" bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>

                                                            </td>
                                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                                <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                                                    {item.preferred_week}
                                                                </Tag>
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                                {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag>}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {item.course_counsellor_name}
                                                            </td>
                                                            <td className="px-3 py-2 md:px-1">
                                                                {item.support_coordinator_name}
                                                            </td>
                                                            {/* <td className="px-3 py-2 md:px-1">
                                                                <Switch
                                                                    size="small"
                                                                    checkedChildren={<CheckOutlined />}
                                                                    unCheckedChildren={<CloseOutlined />}
                                                                    checked={studentStatuses[item.id] || false} // Get correct status per trainer
                                                                    onChange={(checked) => handleToggle(checked, item.id)}
                                                                    style={{
                                                                        backgroundColor: studentStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                                                    }}
                                                                />
                                                            </td> */}
                                                            {/* <td > <Button 
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
                                                            </td> */}
                                                        </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                                <Empty description="No Students found" />
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'trainers' && (
                                    <div className={`overflow-hidden pb-2 mt-1 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                                        <div className="w-full h-auto md:max-h-[22rem] 2xl:max-h-[25rem] overflow-y-auto rounded-xl pb-2">
                                            <table className="w-full text-xs font-normal text-left text-gray-600">
                                                <thead className="bg-white sticky top-0 z-10">
                                                    <tr className="bg-gray-50/80">
                                                        <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                                            S.No
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Trainer ID
                                                        </th>
                                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                                            Name
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
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                                    {(specificCoordinatorTrainers ?? []).length > 0 ? (
                                                    specificCoordinatorTrainers.map((item, index) => (
                                                    <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                                                        <td scope="row" className="px-3 py-2 md:px-2">
                                                            {index + 1}
                                                        </td>
                                                        {/* <td className="px-3 py-2 md:px-1">
                                                            {item.id}
                                                        </td> */}
                                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.id)}>
                                                            {item.trainer_id}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.id)}>
                                                            {item.name}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {dayjs(item.date_of_joining).format("DD//MM/YYYY")}
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
                                                                    maxCount={2} // Show only 2 avatars initially
                                                                    maxStyle={{
                                                                        color: "#f56a00",
                                                                        backgroundColor: "#fde3cf",
                                                                        height: "24px", // Match avatar size
                                                                        width: "24px", // Match avatar size
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
                                                        <td className="px-3 py-2 md:px-1">
                                                            <Tag className="rounded-xl" bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                        {item?.teamleader_name || "Mohit Yadav"}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.coordinator_name}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag>}
                                                        </td>
                                                        <td className="px-3 py-2 md:px-1">
                                                            {item.weekoff}
                                                        </td>
                                                        {/* <td className="px-3 py-2 md:px-1">
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
                                                        </td> */}
                                                        {/* <td > <Button 
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
                                                        </td> */}
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

                            </div>

                            
                                </>
                                ) : (
                                    <p>Loading data...</p>
                                )}
                    </div>
                    </>
                )}

                {topTab === "Activity_Logs" && (
                    <>
                      <SpecificCoordinatorActivityLogs />
                    </>
                )}
                {topTab === "Logs" && (
                    <>
                      <SpecificCoordinatorLogs />
                    </>
                )}

                <AddCoordinatorForm isOpen={isModalOpen} coordinatorData={selectedCoordinator|| {}} onClose={() => setIsModalOpen(false)} />
        </div>
    </>
)


};
export default SpecificCoordinatorPage;
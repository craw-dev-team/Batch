import { useNavigate, useParams } from "react-router-dom";
import { useSpecificCoordinator } from "../Contexts/SpecificCoordinators";
import { useEffect, useState } from "react";

import { Button, Popconfirm,  Avatar, Tag, Tooltip, Switch, Spin, Empty  } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';



const SpecificCoordinatorPage = () => {
    const { coordinatorId } = useParams();
    const { specificCoordinator, loading, fetchSpecificCoordinator, specificCoordinatorStudents, fetchSpecificCoordinatorStudents, specificCoordinatorTrainers, fetchSpecificCoordinatorTrainers } = useSpecificCoordinator();
    const [activeTab, setActiveTab] = useState("tab1");

    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }


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

    const coordinatorDetails = specificCoordinator?.Coordinator_Info?.coordinator
    console.log(specificCoordinator);

        //NAVIGATE TO SPECIFIC STUDENT PAGE 
        const handleStudentClick = async (studentId) => {
            if (!studentId) return;
            const encodedStudentId = btoa(studentId)
            navigate(`/students/${encodedStudentId}`)
        }; 

        // NAVIGATE TO SPECIFIC TRAINER PAGE 
        const handleTrainerClick = async (trainerId) => {
            if (!trainerId) return;
            const encodedTrainerId = btoa(trainerId);
            navigate(`/trainers/${encodedTrainerId}`);
        };

return (
    <>
        <div className="w-auto h-full pt-20 px-2 mt-0">
            <div className="grid grid-cols-6 gap-x-6">
                        {coordinatorDetails ? (
                        <>
                    <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                        
                        <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                            <p># {coordinatorDetails.coordinator_id}</p>
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

                    <div className="px-4 py-4 col-span-6 mt-6 h-auto shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                        <div className="w-full font-semibold">
                            
                            <div className="w-full grid grid-cols-4 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 pb-4">
                        <div className="grid col-span-2">
                            <div className="flex gap-x-4 h-10">
                                
                            <div className="tabs">
                        <button
                            onClick={() => handleTabClick('tab1')}
                            className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === 'tab1' ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                        Students
                        </button>
                        <button
                            onClick={() => handleTabClick('tab2')}
                            className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                ${activeTab === 'tab2' ? 'bg-blue-300 text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                            >
                            Trainers
                        </button>
                    </div>
                    </div>
                    </div>
                    </div>

                    {activeTab === 'tab1' && (
                            <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                                <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                                    <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-3 py-3 md:px-2">
                                                s.No
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Enrollment No
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Name
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Phone No
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Email
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Date of Joining
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Courses
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Language
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Mode
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Preferred Week
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Location
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                course Counsellor
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                support Coordinator
                                            </th>
                                            {/* <th scope="col" className="px-3 py-3 md:px-1">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-3 md:px-1">
                                                Action
                                            </th> */}
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="100%" className="text-center py-4">
                                                    <Spin size="large" />
                                                </td>
                                            </tr>
                    
                                        ) : (specificCoordinatorStudents ?? []).length > 0 ? (
                                            specificCoordinatorStudents.map((item, index) => (
                                            <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth">
                                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900 ">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.enrollment_no}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.phone}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.email}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {new Date(item.date_of_joining).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "2-digit"
                                                    })}
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
                                                                        style={{ backgroundColor: "#87d068" }}
                                                                    >
                                                                        {name[0]}
                                                                    </Avatar>
                                                                </Tooltip>
                                                            ))}
                                                        </Avatar.Group>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                <Tag bordered={false} color={item.language == 'hindi'? 'green' : item.language == 'english'? 'volcano' : 'blue'}>{item.language}</Tag>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>

                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                                        {item.preferred_week}
                                                    </Tag>
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.location == '1' ? <Tag color="blue">Saket</Tag> : <Tag color="magenta">Laxmi Nagar</Tag>}
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
                        </div>

                        {activeTab === 'tab2' && (
                            <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                                <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                                <table className="w-full text-xs text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 md:px-2">
                                            S.No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Trainer ID
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Name
                                        </th>

                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Date of Joining
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Phone No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Email
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Experience
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Courses
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Language
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Team Leader
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Coordinator
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1">
                                            Location
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
                                {(specificCoordinatorTrainers ?? []).length > 0 ? (
                                specificCoordinatorTrainers.map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                        <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                            {index + 1}
                                        </td>
                                        {/* <td className="px-3 py-2 md:px-1">
                                            {item.id}
                                        </td> */}
                                        <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.id)}>
                                            {item.trainer_id}
                                        </td>
                                        <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.id)}>
                                            {item.name}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {new Date(item.date_of_joining).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "2-digit"
                                            })}
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
                                                                style={{ backgroundColor: "#87d068" }}
                                                            >
                                                                {name[0]}
                                                            </Avatar>
                                                        </Tooltip>
                                                    ))}
                                                </Avatar.Group>
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            <Tag bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                        {item?.teamleader_name || "Mohit Yadav"}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.coordinator_name}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.location == '1' ? <Tag color="blue">Saket</Tag> : <Tag color="magenta">Laxmi Nagar</Tag>}
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
        </div>
    </>
)


};
export default SpecificCoordinatorPage;
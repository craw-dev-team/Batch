import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, Tag, Tooltip, Dropdown, message, Empty } from 'antd';
import { CheckOutlined, DownOutlined  } from '@ant-design/icons';
import StudentCards from "./StudentCard";
import axios from "axios";
import BASE_URL from "../../../../ip/Ip";
import { useAuth } from "../../AuthContext/AuthContext";


const StudentsList = () => {
    const { type } = useParams(); // Get type from URL
    const location = useLocation();
    const { data } = location.state || { data: "No data available", type: "Unknown" };
    // To store students status and set active and inactive 
    const [studentStatuses, setStudentStatuses] = useState({}); // Store status per trainer
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const filteredStudents = Array.isArray(data) ? data : [];

    useEffect(() => {
        if (Array.isArray(filteredStudents) && filteredStudents.length > 0) {
            const initialStatuses = {};
            filteredStudents.forEach((student) => {
                initialStatuses[student.id] = student.status;
            });

            setStudentStatuses(initialStatuses);
        }
    }, [filteredStudents]);



    // Handle Toggle of trainer active and inactive 
    const handleStudentStatusChange = async (studentId, newStatus) => {
        const previousStatus = studentStatuses[studentId]; // store current before update
        
        //  Optimistically update UI before API call
        setStudentStatuses((prev) => ({ ...prev, [studentId]: newStatus }));

        try {
            const response = await axios.put(`${BASE_URL}/api/students/edit/${studentId}/`, 
                { status: newStatus },
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                withCredentials : true
            }
            );            
            message.success(`Student status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");
            console.error(error);
            //  Revert UI if API fails
            setStudentStatuses((prev) => ({ ...prev, [studentId]: previousStatus }));
        }
    };


    // HANDLE FILTER STUDENT BASED ON SEARCH INPUT 
     const searchFilteredStudents = useMemo(() => {
            const term = searchTerm.toLowerCase();
          
            if (!searchTerm) return filteredStudents;
          
            return filteredStudents.filter(student => {
              return (
                (student.name?.toLowerCase() || "").includes(term) ||
                (student.email?.toLowerCase() || "").includes(term) ||
                (student.phone?.toLowerCase() || "").includes(term)
              );
            });
          }, [filteredStudents, searchTerm]);
          


    // NAVIGATE TO SPECIFIC STUDENT PAGE INFO 
    const handleStudentClick = async (studentId) => {
        if (!studentId) return;
        const encodedStudentId = btoa(studentId)
        navigate(`/students/${encodedStudentId}`)
    };


    return (
        <>
        <div className="w-auto pt-4 px-2 mt-10 darkmode">
            <div className="relative w-full h-full shadow-md sm:rounded-lg border border-gray-50">
                <div className={`pb-2 relative`}>
                    <StudentCards/>

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold my-4 px-4"> {type === "enrolled_students"? "Students Enrolled In Batches": type === "today_added_students" ? "Today Added Students" : type === "not_enrolled_students" ? "Students Not Enrolled In Batches Yet" : type === "active_students" ? "Active Students" : "Inactive Students"}</h3>
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative h-auto">
                            <input onChange={(e) => setSearchTerm(e.target.value.replace(/^\s+/, ''))} value={searchTerm} type="text" id="table-search" placeholder="Search for items"
                                className="2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500" 
                                />
                            <div className="absolute inset-y-0 right-0 h-auto flex items-center pr-3">
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

                    <div className="w-full h-[39rem] overflow-y-auto rounded-lg pb-2">
                        <table className="w-full text-xs text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                            {["not_enrolled_students", "today_added_students", "enrolled_students", "active_students", "inactive_students"].includes(type) && (
                                <>
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
                                <th scope="col" className="px-3 py-3 md:px-1 truncate">
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
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Status
                                </th>
                                
                            </tr>
                                </>
                            )}
                        
                        </thead>
                        <tbody>
                        {searchFilteredStudents.length > 0 ? (
                            searchFilteredStudents.map((item, index) => (
                                <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-3 py-2 md:px-2 font-medium text-gray-900 dark:text-white">
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
                                    <td className="px-3 py-2 md:px-1 truncate">
                                        <Tooltip title={item.email}>
                                        {item.email}
                                    </Tooltip>
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.date_of_joining}
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
                                        <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'Online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        <Tag bordered={false} color={item.language == 'Hindi'? 'green' : item.language == 'English'? 'volcano' : 'blue'}>{item.language}</Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                            {item.preferred_week}
                                        </Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.location == '1' ? <Tag bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag bordered={false} color="geekblue">Both</Tag>}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.course_counsellor_name}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.support_coordinator_name}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        <Dropdown
                                            menu={{
                                                items: ["Active", "Inactive", "Temp Block", "Restricted"]
                                                    .map((status) => ({
                                                        key: status,
                                                        label: status,
                                                    })),
                                                onClick: ({ key }) => handleStudentStatusChange(item.id, key),
                                            }}
                                            >
                                                <a onClick={(e) => e.preventDefault()}>
                                                <Tag color={
                                                    (studentStatuses[item.id] || item.status) === "Active" ? "#28a745" :
                                                    (studentStatuses[item.id] || item.status) === "Inactive" ? "#6c757d" :
                                                    (studentStatuses[item.id] || item.status) === "Temp Block" ? "#ff9100" :
                                                    "#ef233c"
                                                }>
                                                    {studentStatuses[item.id || item.status]} <span><DownOutlined /></span>
                                                </Tag>
                                            </a>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                    <Empty description="No Students Found" />
                                </td>
                            </tr>
                        )}
                        </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
        </>
    )
    
};

export default StudentsList;
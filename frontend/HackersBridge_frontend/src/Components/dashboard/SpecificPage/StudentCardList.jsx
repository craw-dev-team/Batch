import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, Tag, Tooltip } from 'antd';
import StudentCards from "./StudentCard";



const StudentsList = () => {
    const { type } = useParams(); // Get type from URL
    const location = useLocation();
    const { data } = location.state || { data: "No data available", type: "Unknown" };
    
    const navigate = useNavigate();

    const filteredStudents = Array.isArray(data) ? data : [];

    const handleStudentClick = async (studentId) => {
        if (!studentId) return;
        const encodedStudentId = btoa(studentId)
        navigate(`/students/${encodedStudentId}`)
    };

    return (
        <>
        <div className="w-auto pt-4 px-2 mt-14 darkmode">
            <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                <div className={`overflow-hidden pb-2 relative `}>
                    <div className="w-full h-[47.5rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                        
                        <StudentCards/>
                        
                        <h3 className="text-lg font-semibold my-4 px-4"> {type === "enrolled_students"? "Students Enrolled In Batches": type === "today_added_students"? "Today Added Students" : type === "not_enrolled_students"? "Students Not Enrolled In Batches Yet" : type === "active_students"? "Active Students" : "Inactive Students"}</h3>
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
                                {/* <th scope="col" className="px-3 py-3 md:px-1">
                                    Action
                                </th> */}
                                
                            </tr>
                                </>
                            )}
                        
                        </thead>
                        <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((item, index) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
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
                                    <Tag bordered={false} color={item.language == 'hindi'? 'green' : item.language == 'english'? 'volcano' : 'blue'}>{item.language}</Tag>
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>

                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.preferred_week}
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.location == '1' ? <Tag color="blue">Saket</Tag> : item.location == "2" ? <Tag color="magenta">Laxmi Nagar</Tag> : <Tag color="geekblue">Both</Tag>}
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.course_counsellor_name}
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.support_coordinator_name}
                                    </td>
                                    {/* <td className="px-3 py-2 md:px-1">
                                        Add
                                    </td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td colSpan="6" className="text-center py-3">
                                    No students found for "{type}"
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
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, Tag, Tooltip, Dropdown, Pagination, Empty, Spin } from 'antd';
import { CheckOutlined, DownOutlined  } from '@ant-design/icons';
import StudentCards from "./StudentCard";
import { useAuth } from "../../../AuthContext/AuthContext";
import { handleStudentClick } from "../../../../Navigations/Navigations";
import useStudentStatusChange, { statusDescription } from "../../../../Functions/StudentStatusChange";
import { useStudentForm } from "../../../Studentcontext/StudentFormContext";
import { useTheme } from "../../../../Themes/ThemeContext";
import StudentStatusDropdown from "../../../../Functions/StudentStatusDropdown";


const StudentsList = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const { type } = useParams(); // Get type from URL
    const { loading, studentsList, fetchStudentList } = useStudentForm();

    const { studentStatuses, setStudentStatuses, handleStudentStatusChange } = useStudentStatusChange();
    const navigate = useNavigate();

        // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    
    useEffect(() => {
        setCurrentPage(1)
    },[])

    useEffect(() => {
    if (type) {
      fetchStudentList(type, currentPage, pageSize, searchTerm);
    }
  }, [type, currentPage, searchTerm]);
  

    const currentStudentData = studentsList?.results || [];

  // HANDLE SEARCH INPUT AND DEBOUNCE 
        useEffect(() => {
            const handler = setTimeout(() => {
            setSearchTerm(inputValue.trimStart());
            }, 500);
            return () => clearTimeout(handler);
        }, [inputValue]);
    
    
        useEffect(() => {
            if (Array.isArray(currentStudentData) && currentStudentData.length > 0) {
            const initialStatuses = {};
            currentStudentData.forEach((student) => {
                initialStatuses[student.id] = student.status;
            });
            setStudentStatuses(initialStatuses);
            }
        }, [currentStudentData, setStudentStatuses]);



    // Handle Toggle of trainer active and inactive 
    const onChangeStatus = (studentId, newStatus, status_note) => {
        handleStudentStatusChange({ studentId, newStatus, status_note });
    };


    return (
        <>
        <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
            {/* <div className="relative w-full h-full shadow-md sm:rounded-lg border border-gray-50"> */}
                {/* <div className={`pb-2 relative`}> */}
                    <StudentCards/>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <h3 className={`font-semibold px-1 my-4 ${theme.text}`}> {type === "enrolled_students"? "Students Enrolled In Batches": type === "today_added_students" ? "Today Added Students" : type === "not_enrolled_students" ? "Students Not Enrolled In Batches Yet" : type === "active_students" ? "Active Students" : "Inactive Students"}</h3>
                            <span className={`text-lg font-bold ${theme.text}`}>({studentsList?.count || 0})</span>
                        </div>
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative h-auto">
                            <input onChange={(e) => setInputValue(e.target.value.replace(/^\s+/, ''))} value={inputValue} type="text" id="table-search" placeholder="Search for items"
                                className={`2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs font-medium ${theme.searchBg}`}
                                />
                            <div className="absolute inset-y-0 right-0 h-auto flex items-center pr-3">
                            <button onClick={() => setInputValue("")}>
                            {inputValue ? (
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

                    <div className="w-full h-auto md:max-h-[33rem] 2xl:max-h-[34rem] overflow-y-auto rounded-xl pb-2 bg-white/40 backdrop-blur-sm shadow-sm">
                        <table className="w-full text-xs font-normal text-left text-gray-600">
                        <thead className="bg-white sticky top-0 z-10">
                            {["not_enrolled_students", "today_added_students", "enrolled_students", "active_students", "inactive_students"].includes(type) && (

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
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase truncate">
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
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Status
                                </th>
                                
                            </tr>
                            )}
                        
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                        { loading.studentList ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>

                        ) : currentStudentData.length > 0 ? (
                            currentStudentData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                    <td className="px-3 py-2 md:px-2">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
                                        {item.enrollment_no}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
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
                                                            className={`${theme.studentCount} text-white`}
                                                        >
                                                            {name[0]}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                        </Avatar.Group>
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        <Tag className="rounded-xl" bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'Online'? 'volcano' : 'geekblue'}>{item.mode}</Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        <Tag className="rounded-xl" bordered={false} color={item.language == 'Hindi'? 'green' : item.language == 'English'? 'volcano' : 'blue'}>{item.language}</Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                            {item.preferred_week}
                                        </Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag className="rounded-xl" bordered={false} color="geekblue">Both</Tag>}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.course_counsellor_name}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.support_coordinator_name}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        <StudentStatusDropdown
                                            item={item}
                                            studentStatuses={studentStatuses}
                                            onChangeStatus={onChangeStatus}
                                        />
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

                     <div className="flex justify-center items-center mt-0 py-2 bg-gray-200/20">
                        <Pagination
                            size="small"
                            current={currentPage}
                            total={studentsList?.count || 0}
                            pageSize={pageSize}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showQuickJumper={false}
                        />
                    </div>

                {/* </div> */}
            {/* </div> */}
        </div>
        </>
    )
    
};

export default StudentsList;
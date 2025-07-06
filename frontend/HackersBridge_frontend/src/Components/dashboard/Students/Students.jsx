import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CreateStudentForm from "./CreateStudentForm";
import axios from "axios";
import { Button, message, Popconfirm,  Avatar, Tag, Tooltip, Input, Spin, Empty, Pagination, Dropdown, Popover, DatePicker, Select  } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, TagOutlined, FilterOutlined , DownOutlined } from '@ant-design/icons';
import BASE_URL from "../../../ip/Ip";
import { useAuth } from "../AuthContext/AuthContext";
import { useStudentForm } from "../Studentcontext/StudentFormContext";
import dayjs from "dayjs";
import { handleStudentClick } from "../../Navigations/Navigations";
import useStudentStatusChange, { statusDescription } from "../../Functions/StudentStatusChange";
import StudentCards from "../SpecificPage/Cards/Student/StudentCard";
import SearchBar from "../../SearchInput/SearchInput";
import { useTagContext } from "../Tags/TagsContext";

const { Search } = Input;
const { RangePicker } = DatePicker;


const Students = () => {
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('');
    const [selectedStudent, setSelectedStudent] = useState()
    const [isDeleted, setIsDeleted] = useState(false)
    const { studentStatuses, setStudentStatuses, handleStudentStatusChange } = useStudentStatusChange();

    const { studentData, loading, setLoading, setStudentData, fetchStudents } = useStudentForm();
    
    const navigate = useNavigate();

    // for tags 
        const {tagData, fetchTagData} = useTagContext();
        const [selectedStudentId, setSelectedStudentId] = useState(null);
        const [addTagValue, setAddTagValue] = useState([]);
        const [assignTagData, setAssignTagData] = useState([]);
        const [unassignTagData, setUnassignTagData] = useState([]); 

    // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;


    // for filtering data based on mode, language, preferred week, location
    const [sortByMode, setSortByMode] = useState(null);
    const [sortByLanguage, setSortByLanguage] = useState(null);
    const [sortByPreferredWeek, setSortByPreferredWeek] = useState(null);
    const [sortByLocation, setSortByLocation] = useState(null);
    // filter data between start date and end date on date of joining
    const [openDatePopover, setOpenDatePopover] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);


    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1)
    };


    // FETCH STUDENTDATA OM MOUNT
    useEffect(() => {
        fetchStudents({  page: currentPage, pageSize, search: searchTerm, mode: sortByMode, language: sortByLanguage, preferred_week: sortByPreferredWeek, location: sortByLocation, status: activeTab, date_of_joining_after: startDate, date_of_joining_before: endDate })        
        
        fetchTagData();
    },[!isModalOpen, searchTerm, currentPage, sortByMode, sortByLanguage, sortByPreferredWeek, sortByLocation, activeTab, startDate, endDate]);

          

    // Fetch students after deletion or modal interaction
    useEffect(() => {
        setIsDeleted(false); // Reset deletion flag

        if (studentData) {
            
            const studentsArray = Array.isArray(studentData?.results)
                ? studentData?.results
                : [];

            // Set a timeout to wait 2 seconds before initializing statuses
            const timer = setTimeout(() => {
                const initialStatuses = {};
                studentsArray.forEach((student) => {
                    initialStatuses[student.id] = student.status; 
                });
                
                setStudentStatuses(initialStatuses); 
            }, 100);

        // Cleanup function to clear the timer if the component unmounts
        return () => clearTimeout(timer);
    };

// }, [isDeleted, selectedStudent, isModalOpen, studentData]);
    }, [studentData, isModalOpen, isDeleted ]);
    

   // Function to handle Edit BUTTON click
    const handleEditClick = (student) => {
        setSelectedStudent(student); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

    
    // Delete Function
    const handleDelete = async (studentId) => {
    if (!studentId) return;

    try {
        const response = await axios.delete(`${BASE_URL}/api/students/delete/${studentId}/`, 
            { headers: { 'Content-Type': 'application/json' }, 
            withCredentials : true
        }
        );

        if (response.status === 204) {
            // Make sure Student Data is an array before filtering
            if (Array.isArray(studentData)) {
                setStudentData(prevStudents => prevStudents.filter(student => student.id !== studentId));
                
                setTimeout(() => {
                    setSearchTerm('')
                }, 2000);
            } else {
                // console.error('Student Data is not an array');
            }
        }
    } catch (error) {
        setLoading(false);
    
        if (error.response) {
            // console.error("Server Error Response:", error.response.data);
    
            // Extract error messages and show each one separately
            Object.entries(error.response.data).forEach(([key, value]) => {
                value.forEach((msg) => {
                    message.error(`${msg}`);
                });
            });
        } else if (error.request) {
            // console.error("No Response from Server:", error.request);
            message.error("No response from server. Please check your internet connection.");
        } else {
            // console.error("Error Message:", error.message);
            message.error("An unexpected error occurred.");
        }
    }       
    };

    // Confirm and Cancel Handlers for delete button
    const confirm = (studentId) => {
        handleDelete(studentId); 
        message.success('Student Deleted Successfully');
    };

    const cancel = () => {
        message.error('Student Deletion Cancelled');
    };


    // Handle Toggle of student active, inactive, temporary block and restricted 
    const onChangeStatus = (studentId, newStatus) => {
        handleStudentStatusChange({ studentId, newStatus });
    };

    
    const handleSort = async (key, filterType) => {
        if (key === "clear") {
            
            if (filterType === "mode") setSortByMode(null);
            if (filterType === "language") setSortByLanguage(null);
            if (filterType === "preferred_week") setSortByPreferredWeek(null);
            if (filterType === "location") setSortByLocation(null);
            
            return;
        }
    
        if (filterType === "mode") setSortByMode(key);
        if (filterType === "language") setSortByLanguage(key);
        if (filterType === "preferred_week") setSortByPreferredWeek(key);
        if (filterType === "location") setSortByLocation(key);
    
    };


    const modeMenu = {
        items: [
            { key: "Online", label: <span style={{ color: "red" }}>Online</span> },
            { key: "Offline", label: <span style={{ color: "green" }}>Offline</span> },
            { key: "Hybrid", label: <span style={{ color: "blue" }}>Hybrid</span> },
            { type: "divider" },
            { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
        ],
        onClick: ({ key }) => handleSort(key, "mode"),
    };


    const languageMenu = {
        items: [
            { key: "Hindi", label: <span style={{ color: "green" }}>Hindi</span> },
            { key: "English", label: <span style={{ color: "red" }}>English</span> },
            { key: "Both", label: <span style={{ color: "blue" }}>Both</span> },
            { type: "divider" },
            { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
        ],
        onClick: ({ key }) => handleSort(key, "language"),
    };

    const preferredWeekMenu = {
        items: [
            { key: "Weekdays", label: <span style={{ color: "gray" }}>Weekdays</span> },
            { key: "Weekends", label: <span style={{ color: "gray" }}>Weekends</span> },
            { key: "Both", label: <span style={{ color: "gray" }}>Both</span> },
                { type: "divider" },
            { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
        ],
        onClick: ({ key }) => handleSort(key, "preferred_week"),
    };

    const locationMenu = {
        items: [
            { key: "1", label: <span style={{ color: "blue" }}>Saket</span> },
            { key: "2", label: <span style={{ color: "magenta" }}>Laxmi Nagar</span> },
            { key: "3", label: <span style={{ color: "blue" }}>Both</span> },
            { type: "divider" },
            { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
        ],
        onClick: ({ key }) => handleSort(Number(key), "location"),
    };



    // Handle Tag Add (POST)
    const handleAddTag = async (tagIds, studentId) => {
        if (!studentId || !tagIds?.length) return;
    
        const payload = {
            tag_ids: tagIds, // expects an array of IDs like [1, 2, 3]
        };
    
        console.log("Payload being sent to backend:", payload);
    
        try {
        const response = await axios.post(`${BASE_URL}/api/student/assign_tag/${studentId}/`,
            payload, // ✅ send the payload here
            { headers: {"Content-Type": "application/json"},
            withCredentials: true
            }
        );
    
        if (response.status === 200 || response.status === 201) {
            message.success("Tag(s) added successfully!");
            // Optionally refresh tags
            // fetchTagData();
        } else {
            message.error("Failed to add tag(s).");
        }
        } catch (error) {
        console.error("Error creating tag:", error);
        message.error("Error adding tag(s).");
        }
    };
    
    
    // Fetch Assign and Unassign Tag
    const fetchAssignTagData = async (studentId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/student/assign_tag/${studentId}/`, 
            { headers: {"Content-Type": "application/json"},
            withCredentials: true
        }
        );
    
        const assigned = response.data?.assigned_tags || [];
        const unassigned = response.data?.unassigned_tags || [];
    
        setAssignTagData(assigned);       // full objects
        setUnassignTagData(unassigned);   // full objects

    } catch (error) {
        console.error("Error fetching tags:", error);
        setAssignTagData([]);
        setUnassignTagData([]);
    }
    };




    return (
        <>
        <div className="w-auto pt-4 px-2 mt-10">
            <StudentCards />
            <div className="relative mt-3 w-full h-full shadow-md sm:rounded-lg border border-gray-50">
            {/* <div className="w-full px-4 py-3 text flex justify-between font-semibold "> */}
                {/* <h1>All Students</h1> */}
                    {/* <div>
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Student +</button>
                    </div> */}
                {/* </div> */}

                <div className="w-full grid grid-cols-3 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-4 py-4">
                    <div className="grid col-span-1">
                        <div className="flex gap-x-4 h-auto items-center">
                            
                            <div className="lg:hidden">
                                <select
                                    value={activeTab}
                                    onChange={(e) => handleTabClick(e.target.value)}
                                    className="block w-auto h-7 px-4 py-1 text-sm border rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                <option value="">All Students</option>
                                <option value="Temp Block">Temporary Block</option>
                                <option value="Restricted">Restricted</option>
                                </select>
                            </div>

                            <div className="hidden lg:flex">
                                <button
                                    onClick={() => handleTabClick('')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === '' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    All Students
                                </button>
                                <button
                                    onClick={() => handleTabClick('Temp Block')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === 'Temp Block' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    Temporary Block
                                </button>
                                <button
                                    onClick={() => handleTabClick('Restricted')}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === 'Restricted' ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                    >
                                    Restricted
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-center">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                            <SearchBar placeholder="Search for Student"
                                inputClassName="2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500"
                                onSearch={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1);
                                }}
                            />

                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="h-8 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5">Add Student +</button>
                    </div>

                </div>


                
                <div className={`overflow-hidden pb-2 relative `}>
                    <div className="w-full h-[38rem] overflow-y-auto rounded-lg pb-2">
                        <table className="w-full text-xs text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-2">
                                    <div className="flex items-center">
                                        <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"></input>
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </th>
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
                                    <Tooltip title="Sort by Joining Date" placement="top">
                                    <span>
                                       <Popover
                                            content={
                                                <RangePicker
                                                format="YYYY-MM-DD"
                                                value={[
                                                    startDate ? dayjs(startDate) : null,
                                                    endDate ? dayjs(endDate) : null,
                                                ]}
                                                onChange={(dates) => {
                                                    if (dates && dates[0] && dates[1]) {
                                                        setStartDate(dates[0].format("YYYY-MM-DD"));
                                                        setEndDate(dates[1].format("YYYY-MM-DD"));
                                                    } else {
                                                        setStartDate(null);
                                                        setEndDate(null);
                                                    }
                                                    setOpenDatePopover(false); // auto close on selection
                                                }}
                                                />
                                            }
                                            placement="bottom"
                                            trigger="click"
                                            open={openDatePopover}
                                            onOpenChange={(visible) => setOpenDatePopover(visible)}
                                            >
                                            <Button type="text"
                                                icon={ <FilterOutlined style={{ color: startDate && endDate ? "blue" : "black" }} className="w-3"/>}
                                                onClick={() => setOpenDatePopover(!openDatePopover)} 
                                            />
                                        </Popover>

                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Courses
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Mode
                                    <Tooltip title="Sort by Mode" placement="top">
                                    <span>
                                        <Dropdown menu={modeMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByMode ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Language
                                    <Tooltip title="Sort by Language" placement="top">
                                    <span>
                                        <Dropdown menu={languageMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Preferred Week
                                    <Tooltip title="Sort by Preferred Week" placement="top">
                                    <span>
                                        <Dropdown menu={preferredWeekMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByPreferredWeek ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Location
                                    <Tooltip title="Sort by Location" placement="top">
                                    <span>
                                        <Dropdown menu={locationMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByLocation ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Counsellor
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Coordinator
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Action
                                </th>
                                
                            </tr>
                        </thead>
                        {/* TO show all students data  */}
                        {(activeTab === '' || activeTab === "Temp Block" || activeTab === "Restricted") && (
                        <tbody>
                        {loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                        
                        ) : studentData?.results?.length > 0 ? (
                            studentData.results.map((item, index) => (
                            <tr key={item.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth">
                                <td scope="col" className="p-2">
                                    <div className="flex items-center">
                                        <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-1"></input>
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </td>
                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900">
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.id}
                                </td> */}
                                {/* <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
                                    {item.enrollment_no}
                                </td> */}
                                <td className="px-3 py-2 md:px-1 font-bold">
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => handleStudentClick(navigate, item.id)} className="cursor-pointer">
                                            {item.enrollment_no}
                                        </span>

                                    <Popover
                                    trigger="hover"
                                    placement="bottomLeft"
                                    open={selectedStudentId === item.id}
                                    content={
                                        <div
                                        className="w-64 space-y-3"
                                        onMouseEnter={() => {
                                            clearTimeout(window.__popoverTimer);
                                        }}
                                        onMouseLeave={() => {
                                            window.__popoverTimer = setTimeout(() => {
                                            setSelectedStudentId(null);
                                            setAssignTagData([]);
                                            setUnassignTagData([]);
                                            setAddTagValue([]);
                                            }, 200);
                                        }}
                                        >
                                        {/* ✅ Assigned Tags */}
                                        <div className="space-y-1">
                                            {assignTagData.length > 0 ? (
                                            <>
                                                <p className="text-xs text-gray-500 font-medium">Assigned Tags:</p>
                                                <div className="flex flex-wrap gap-1">
                                                {assignTagData.map((tag) => (
                                                    <span
                                                    key={tag.id}
                                                    className="text-xs font-medium px-2 py-1 rounded"
                                                    style={{ backgroundColor: tag.tag_color, color: "#fff" }}
                                                    >
                                                    {tag.tag_name}
                                                    </span>
                                                ))}
                                                </div>
                                            </>
                                            ) : (
                                            <span className="text-xs text-gray-500">No Tags Assigned</span>
                                            )}
                                        </div>

                                        {/* Select New Tags */}
                                        <Select
                                            mode="multiple"
                                            showSearch
                                            placeholder="Select Tags"
                                            value={addTagValue}
                                            onChange={setAddTagValue}
                                            options={unassignTagData.map((tag) => ({
                                            value: tag.id,
                                            label: tag.tag_name,
                                            }))}
                                            className="w-full"
                                            size="small"
                                            optionRender={(option) => {
                                            const tag = unassignTagData.find((t) => t.id === option.value);
                                            return (
                                                <div
                                                style={{
                                                    backgroundColor: tag?.tag_color,
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    color: "#fff",
                                                }}
                                                >
                                                {option.label}
                                                </div>
                                            );
                                            }}
                                            tagRender={(props) => {
                                            const { label, value, closable, onClose } = props;
                                            const tag = unassignTagData.find((t) => t.id === value);
                                            return (
                                                <span
                                                style={{
                                                    backgroundColor: tag?.tag_color,
                                                    color: "#fff",
                                                    padding: "2px 8px",
                                                    borderRadius: "4px",
                                                    marginRight: "4px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    fontSize: "12px",
                                                }}
                                                >
                                                {label}
                                                {closable && (
                                                    <span
                                                    onClick={onClose}
                                                    style={{
                                                        marginLeft: 6,
                                                        cursor: "pointer",
                                                        fontWeight: "bold",
                                                    }}
                                                    >
                                                    ×
                                                    </span>
                                                )}
                                                </span>
                                            );
                                            }}
                                        />

                                        {/* ✅ Add Tags Button */}
                                        <Button
                                            type="primary"
                                            size="small"
                                            block
                                            disabled={!addTagValue || addTagValue.length === 0}
                                            onClick={async () => {
                                            if (!item.id || addTagValue.length === 0) return;

                                            await handleAddTag(addTagValue, item.id);
                                            await fetchAssignTagData(item.id);

                                            setStudentData((prev) => {
                                                const updated = prev.results.map((student) => {
                                                if (student.id === item.id) {
                                                    return {
                                                    ...student,
                                                    tags: [...(student.tags || []), ...addTagValue],
                                                    };
                                                }
                                                return student;
                                                });
                                                return { ...prev, results: updated };
                                            });

                                            setAddTagValue([]); // ✅ Do not close popover yet
                                            }}
                                        >
                                            Add Tag(s)
                                        </Button>
                                        </div>
                                    }
                                    >
                                    <TagOutlined
                                        className="cursor-pointer text-gray-600 hover:text-black"
                                        onMouseEnter={async () => {
                                        setSelectedStudentId(item.id);
                                        await fetchAssignTagData(item.id);
                                        setAddTagValue([]);
                                        }}
                                        onMouseLeave={() => {
                                        window.__popoverTimer = setTimeout(() => {
                                            setSelectedStudentId(null);
                                            setAssignTagData([]);
                                            setUnassignTagData([]);
                                            setAddTagValue([]);
                                        }, 200);
                                        }}
                                    />
                                    </Popover>




                                    </div>
                                </td>

                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
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
                                    {item.location == "1" ? <Tag bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag bordered={false} color="geekblue">Both</Tag> }
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
                                                    label:(
                                                        <Tooltip title={statusDescription[status]} placement="left">
                                                        <span>{status}</span>
                                                        </Tooltip>
                                                    ),
                                                })),
                                            onClick: ({ key }) => onChangeStatus(item.id, key),
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
                                        title="Delete the Student"
                                        description="Are you sure you want to delete this Student?"
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
                                <Empty description="No Students found" />
                            </td>
                        </tr>
                    )}
                        </tbody>
                        )}

                        </table>
                    </div>

                {/* <div className="w-full h-14 bg-slate-200"> */}
                <div className="flex justify-center items-center mt-0 py-2 bg-blue-50">
                    <Pagination
                        size="small"
                        current={currentPage}
                        total={studentData?.count || 0}
                        pageSize={pageSize} // example: 30
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}    // hide page size select
                        showQuickJumper={false}    // hide quick jump input
                    />
                    </div>
                {/* </div> */}

                </div>
                
            </div>
            
        <CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} />

        </div>  


   </>
    )
}


export default Students;
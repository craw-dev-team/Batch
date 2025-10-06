import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CreateStudentForm from "./CreateStudentForm";
import { Button, message, Popconfirm,  Avatar, Tag, Tooltip, Input, Spin, Empty, Pagination, Dropdown, Popover, DatePicker, Select, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, TagOutlined, FilterOutlined , MoreOutlined } from '@ant-design/icons';
import { useStudentForm } from "../Studentcontext/StudentFormContext";
import dayjs from "dayjs";
import { handleStudentClick } from "../../Navigations/Navigations";
import useStudentStatusChange, { statusDescription } from "../../Functions/StudentStatusChange";
import StudentCards from "../SpecificPage/Cards/Student/StudentCard";
import SearchBar from "../../SearchInput/SearchInput";
import { useTagContext } from "../Tags/TagsContext";
import axiosInstance from "../api/api";
import StudentStatusDropdown from "../../Functions/StudentStatusDropdown";
import TagAssignmentPopover from "../../Functions/TagAssignmentPopover";
import { useTheme } from "../../Themes/ThemeContext";

const { RangePicker } = DatePicker;


const Students = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [activeTab, setActiveTab] = useState('');
    const [selectedStudent, setSelectedStudent] = useState()
    const [isDeleted, setIsDeleted] = useState(false)
    const { studentStatuses, setStudentStatuses, handleStudentStatusChange } = useStudentStatusChange();

    const { studentData, loading, setStudentData, fetchStudents, handleDeleteStudent } = useStudentForm();
    
    const navigate = useNavigate();

    // for tags 
        const { fetchTagData } = useTagContext();
        const [selectedStudentId, setSelectedStudentId] = useState(null); 

    // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
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
        sessionStorage.setItem("activeStudentTab", tab); // save
        setCurrentPage(1)
    };

      // Load last tab from sessionStorage
    useEffect(() => {
        const savedTab = sessionStorage.getItem("activeStudentTab");
        if (savedTab) {
        setActiveTab(savedTab);
        }
    }, []);


    const currentFilters = useMemo(() => ({
        page: currentPage,
        pageSize,
        search: searchTerm,
        mode: sortByMode,
        language: sortByLanguage,
        preferred_week: sortByPreferredWeek,
        location: sortByLocation,
        status: activeTab,
        date_of_joining_after: startDate, 
        date_of_joining_before: endDate
    }), [currentPage, pageSize, searchTerm, sortByMode, sortByLanguage, sortByPreferredWeek, sortByLocation, activeTab, startDate, endDate]);


    // FETCH STUDENTDATA OM MOUNT
    useEffect(() => {   
        // fetchStudents({  page: currentPage, pageSize, search: searchTerm, mode: sortByMode, language: sortByLanguage, preferred_week: sortByPreferredWeek, location: sortByLocation, status: activeTab, date_of_joining_after: startDate, date_of_joining_before: endDate })        
        fetchStudents(currentFilters);
        fetchTagData();
    },[isModalOpen, currentFilters]);

    
     // HANDLE SEARCH INPUT AND DEBOUNCE 
        useEffect(() => {
            const handler = setTimeout(() => {
                setSearchTerm(inputValue.trimStart());
                setCurrentPage(1)
            }, 500); // debounce delay in ms
          
            return () => {
              clearTimeout(handler); // clear previous timeout on re-typing
            };
          }, [inputValue]);

          

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

    

    // Confirm and Cancel Handlers for delete button
    const confirm = (studentId) => {
        handleDeleteStudent(studentId); 
    };

    const cancel = () => {
        message.error('Student Deletion Cancelled');
    };


    // Handle Toggle of student active, inactive, temporary block and restricted 
    const onChangeStatus = (studentId, newStatus, status_note) => {        
        handleStudentStatusChange({ studentId, newStatus, status_note });
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




    return (
        <>
        <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
            <StudentCards />
            {/* <div className="relative mt-3 w-full h-full shadow-md sm:rounded-lg border border-gray-50"> */}
            {/* <div className="w-full px-4 py-3 text flex justify-between font-semibold "> */}
                {/* <h1>All Students</h1> */}
                    {/* <div>
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Student +</button>
                    </div> */}
                {/* </div> */}

                <div className="w-full grid grid-cols-3 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-0 pt-4 pb-2">
                    <div className="grid col-span-1">
                        <div className="flex gap-x-0 h-auto items-center">
                            
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

                            {/* <div className="hidden lg:flex">
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
                            </div> */}

                            <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex flex-wrap gap-x-1 bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                    {["All Students", "Temporary Block", "Restricted"].map((tab) => {
                                        const isActive =
                                                        (tab === "All Students" && activeTab === "") ||
                                                        (tab === "Temporary Block" && activeTab === "Temp Block") ||
                                                        (tab === "Restricted" && activeTab === "Restricted");

                                        const showCount = isActive ? studentData?.count : 0;

                                        const tabKey =
                                                    tab === "All Students"
                                                        ? ""
                                                        : tab === "Temporary Block"
                                                        ? "Temp Block"
                                                        : "Restricted";

                                        return (
                                        <div key={tab} className="relative">
                                            <Badge
                                            count={showCount}
                                            overflowCount={999999}
                                            size="small"
                                            offset={[0, 0]} // Adjust position of the badge
                                            >
                                            <button
                                                onClick={() => handleTabClick(tabKey)}
                                                className={`px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                                ${isActive ? `text-gray-600 shadow-md ${theme.activeTab}` : "text-gray-600 hover:bg-white/50"}`}
                                            >
                                                {tab}
                                            </button>
                                            </Badge>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-center">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                             <div className="relative h-auto">
                            <input onChange={(e) => setInputValue(e.target.value.replace(/^\s+/, ''))} value={inputValue} type="text" id="table-search" placeholder="Search for student"
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

                    <div className="flex justify-end">
                        <button onClick={() => { setIsModalOpen(true); setSelectedStudent(null); }} type="button" className={`h-8 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn} `}>Add Student +</button>
                    </div>

                </div>


                
                <div className={`overflow-hidden pb-0 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm`}>
                    <div className="w-full h-[32rem] 2xl:min-h-[36rem] md:max-h-[33rem] lg:max-h-[32rem] 2xl:max-h-[36rem] overflow-y-auto rounded-xl pb-2">
                        <table className="w-full text-xs font-normal text-left text-gray-600">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr className="bg-gray-50/80">
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
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Courses
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Mode
                                    <Tooltip title="Sort by Mode" placement="top">
                                    <span>
                                        <Dropdown menu={modeMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByMode ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Language
                                    <Tooltip title="Sort by Language" placement="top">
                                    <span>
                                        <Dropdown menu={languageMenu} >
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Preferred Week
                                    <Tooltip title="Sort by Preferred Week" placement="top">
                                    <span>
                                        <Dropdown menu={preferredWeekMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByPreferredWeek ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Location
                                    <Tooltip title="Sort by Location" placement="top">
                                    <span>
                                        <Dropdown menu={locationMenu} >
                                            <Button type="text" icon={<FilterOutlined style={{ color: sortByLocation ? "blue" : "black" }} className="w-3"/>} />
                                        </Dropdown>
                                    </span>
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Counsellor
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Coordinator
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Action
                                </th>
                                
                            </tr>
                        </thead>
                        {/* TO show all students data  */}
                        {(activeTab === '' || activeTab === "Temp Block" || activeTab === "Restricted") && (
                        <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                        {loading.students ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                        
                        ) : studentData?.results?.length > 0 ? (
                            studentData.results.map((item, index) => (
                            <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
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
                                    {(currentPage - 1) * pageSize + index + 1}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.id}
                                </td> */}
                                {/* <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
                                    {item.enrollment_no}
                                </td> */}
                                <td className="px-3 py-2 md:px-1 font-medium">
                                    <div className="flex items-center gap-2">
                                        <span onClick={() => handleStudentClick(navigate, item.id)} className="cursor-pointer">
                                            {item.enrollment_no}
                                        </span>

                                        <TagAssignmentPopover
                                            student={item}
                                            isOpen={selectedStudentId === item.id}
                                            onOpenChange={(visible) => setSelectedStudentId(visible ? item.id : null)}
                                            setStudentData={setStudentData}
                                        />
                                    </div>
                                </td>

                                <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(navigate, item.id)}>
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
                                                        // style={{ backgroundColor: "#87d068" }}
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
                                    {item.location == "1" ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag className="rounded-xl" bordered={false} color="geekblue">Both</Tag> }
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
                                                    handleEditClick(item);   // Open student form
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
                                                title="Delete the Student"
                                                description="Are you sure you want to delete this Student?"
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
                                <Empty description="No Students found" />
                            </td>
                        </tr>
                    )}
                        </tbody>
                        )}

                        </table>
                    </div>

                {/* <div className="w-full h-14 bg-slate-200"> */}
                <div className="flex justify-center items-center mt-0 py-2 bg-gray-200/20">
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
                
            {/* </div> */}
            
        <CreateStudentForm isOpen={isModalOpen} selectedStudentData={selectedStudent || {}} onClose={() => setIsModalOpen(false)} currentFilters={currentFilters} />

        </div>  


   </>
    )
}


export default Students;
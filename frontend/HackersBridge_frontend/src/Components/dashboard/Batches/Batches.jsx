import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message, Popconfirm, Avatar, Tooltip, Select, Tag, Dropdown, Badge, Spin, Empty, Pagination } from 'antd';
import { EditOutlined, DeleteOutlined, DownOutlined, CopyOutlined, RightOutlined, FilterOutlined, LinkOutlined, MoreOutlined, UpOutlined } from '@ant-design/icons';
import  { useBatchForm }  from "../Batchcontext/BatchFormContext";
import CreateBatchForm from "./CreateBatchForm";
import AvailableBatches from "./AvailableBatches";
import handleBatchClick, { handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";
import BatchCards from "../SpecificPage/Cards/Batch/BatchCards";
import useBatchStatusChange from "../../Functions/BatchStatusChange";
import SearchBar from "../../SearchInput/SearchInput";
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext.jsx";



const Batches = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState("Running");
    const [selectedBatch, setSelectedBatch] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const [students, setStudents] = useState({}); // Stores selected students per batch
    const [selectedStudent, setSelectedStudent] = useState({}); // Stores selected students per batch
    const [addStudentDropdown, setAddStudentDropdown] = useState({});
    const [sortByTime, setSortByTime] = useState(false); // Default ascending
    const [sortByStartDate, setSortByStartDate] = useState(false);
    const [sortByEndDate, setSortByEndDate] = useState(false);
    const [sortByMode, setSortByMode] = useState(null);
    const [sortByLanguage, setSortByLanguage] = useState(null);
    const [sortByPreferredWeek, setSortByPreferredWeek] = useState(null);
    const [sortByLocation, setSortByLocation] = useState(null);
    // const [sortByCourse, setSortByCourse] = useState(null);
    
    const { batchData, loading, setLoading, setBatchData, fetchBatches } = useBatchForm();
    const { handleBatchStatusChange } = useBatchStatusChange();

    const navigate = useNavigate();

    // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1)
    };


   const currentFilters = useMemo(() => ({
    page: currentPage,
    pageSize,
    search: searchTerm,
    mode: sortByMode,
    language: sortByLanguage,
    preferred_week: sortByPreferredWeek,
    location: sortByLocation,
    status: activeTab
}), [currentPage, pageSize, searchTerm, sortByMode, sortByLanguage, sortByPreferredWeek, sortByLocation, activeTab]);

      
    useEffect(() => {
        fetchBatches( currentFilters )        
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



    // Function to handle Edit button click 
    const handleEditClick = (batch) => {
        setSelectedBatch(batch);
        setIsModalOpen(true);
        setIsDeleted(false);
        setAddStudentDropdown(true);
    };


    
    // Delete Function 
    const handleDelete = async (batchId) => {
        if (!batchId) return;

        try {
            const response = await axiosInstance.delete(`/api/batches/delete/${batchId}/` );

            if (response.status >= 200 && response.status < 300) {
                // Only update the batch data if it's correctly structured
                if (
                    batchData?.results &&
                    Array.isArray(batchData.results.batches)
                ) {
                    setBatchData(prevBatch => {
                        const updatedBatches = prevBatch.results.batches.filter(
                            batch => String(batch.id) !== String(batchId)
                        );
    
                        // Update the batches in the corresponding status category
                        return {
                            ...prevBatch,
                            results: {
                                ...prevBatch.results,
                                batches: updatedBatches, // Update the batches array
                            },
                        };
                    });
            
                    setTimeout(() => {
                        setSearchTerm('');
                    }, 2000);
                } else {
                    console.error('batchData is not an array or properly structured');
                }
            } else {
                message.error('Failed to delete batch');
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


    // Confirm and Cancel Handler for delete button 
    const confirm = (batchId) => {
        handleDelete(batchId);
    };

    const cancel = () => {
        message.error('batch Deletion Cancelled');
    };


    // to add students in a batch fetch available student data from select field
    const fetchAvailableStudents = useCallback(async (batchId) => {
        try {
            const response = await axiosInstance.get(`/api/batches/${batchId}/available-students/`);
            const data = response.data;
            
            if (!data.available_students) {
                throw new Error("Invalid response format");
            }
    
            // Format data for the Select component
            const formattedOptions = data.available_students.map(student => ({
                name: student.name,
                studentid: student.id,
                phone: student.phone
            }));
            
    
            // Update state with students for the specific batchId
            setStudents(prev => ({ ...prev, [batchId]: formattedOptions }));
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }, [students]) 
    

    // send student id to api and add it in selected  batch
    const addStudents = async (batchId) => {
        
        // Get selected student IDs for this batch
        const studentIds = selectedStudent[batchId] || [];
    
        if (studentIds.length === 0) {
            message.warning("No students selected!");
            return;
        }
    
        try {
            const response = await axiosInstance.post(`/api/batches/${batchId}/add-students/`, 
                { students: studentIds } );
    
            if (response.status >= 200 && response.status < 300) {
                message.success("Student added successfully!");
                setAddStudentDropdown(false); // Close dropdown on success
                await fetchBatches(currentFilters);
            } else {
                message.error("Student not added.");
            }
        } catch (error) {
            // console.error("Error sending Add student request:", error);
            message.error("Failed to add student.");
        }
    };
    
    

    const handleSelectChange = (batchId, selectedValues) => {
        setSelectedStudent(prev => ({
            ...prev,
            [batchId]: selectedValues // Store selected student IDs
        }));
    };
    

    const handleStudentDropdown = (batchId, index) => {
        
        if (addStudentDropdown === index) {
            setAddStudentDropdown(null); // Close dropdown
        } else {
            setAddStudentDropdown(index);
            if (!selectedStudent[index]) fetchAvailableStudents(batchId, index); // Fetch only if not already loaded
        }
    };


    
    // Handle Toggle of batch running, scheduled, hold and completed, cancelled 
    const onChangeStatus = async (batchId, status) => {
        handleBatchStatusChange({ batchId, status });
        await fetchBatches(currentFilters)
    };


    // FOR SORTING BY START TIME AND START DATE
        const toggleSortByStartTime = () => {
            setSortByTime((prev) => !prev);
            setSortByStartDate(false); // Reset start_time sorting when sorting by name
        };
      
        const toggleSortByStartDate = () => {
            setSortByStartDate((prev) => !prev);
            setSortByTime(false); // Reset name sorting when sorting by start_time
        };

        const toggleSortByEndDate = () => {
            setSortByEndDate((prev) => !prev);
            setSortByTime(false);  // Explicitly set to false instead of null
            setSortByStartDate(false);
        };
        
        
        const data = batchData?.results?.batches || [];
        
        const sortedBatches = useMemo(() => {
            try {
                let sorted = [...(data || [])];

                if (sortByTime) {
                    sorted.sort((a, b) => {
                        const timeA = a?.batch_time_data?.start_time ?? '';
                        const timeB = b?.batch_time_data?.start_time ?? '';
                        return timeA.localeCompare(timeB);
                    });
                }

                if (sortByStartDate) {
                    sorted.sort((a, b) => {
                        const dateA = new Date(a?.start_date ?? 0);
                        const dateB = new Date(b?.start_date ?? 0);
                        return dateA - dateB;
                    });
                }

                if (sortByEndDate) {
                    sorted.sort((a, b) => {
                        const dateA = new Date(a?.end_date ?? 0);
                        const dateB = new Date(b?.end_date ?? 0);
                        return dateA - dateB;
                    });
                }

                return sorted;
            } catch (error) {
                console.error("Error while sorting batches:", error);
                return data || [];
            }
        }, [data, sortByTime, sortByStartDate, sortByEndDate]);

        


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
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "preferred_week"),
            };

            const locationMenu = {
                items: [
                    { key: "Saket", label: <span style={{ color: "blue" }}>Saket</span> },
                    { key: "Laxmi Nagar", label: <span style={{ color: "magenta" }}>Laxmi Nagar</span> },
                    { type: "divider" },
                    { key: "clear", label:  <span style={{ color: "red", fontWeight: "bold" }}>Clear Filter</span> },
                ],
                onClick: ({ key }) => handleSort(key, "location"),
            };


    // THIS WILL REDIRECT TO STUDENT IONFO PAGE IN NEW TAB FROM FILTERED STUDENT SELECT FIELD
    const handleStudentClickOnSelect = (event, studentId) => {
        event.preventDefault();
        event.stopPropagation(); // Prevents interfering with Select behavior
    
        if (!studentId) return;
    
        const encodedStudentId = btoa(studentId);
        
        // Open in a new tab without switching focus immediately
        setTimeout(() => {
            window.open(`/students/${encodedStudentId}`, "_blank", "noopener,noreferrer");
        }, 1000); // Small delay prevents immediate redirection
        
    };


    const copyToClipboard = (text) => {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text)
                .then(() => message.success("Phone number copied!"))
                .catch(() => message.error("Failed to copy!"));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            message.success("Phone number copied!");
        }
    };



    return (
        <>
        <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
            <BatchCards handleTabClick={handleTabClick} activeTab={activeTab}/>

            {/* <div className="relative w-full h-full mt-2 shadow-md sm:rounded-lg border border-gray-100"> */}
                <div className={`w-full py-3 px-1 flex justify-between items-center font-semibold ${theme.text}`}>
                    <h1>All Batches</h1>
                    <div>
                        <button onClick={() =>  { setIsModalOpen(true); setSelectedBatch(null); }} type="button" className={`focus:outline-none text-white font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Create Batch +</button>
                    </div>
                </div>

                <div className="w-full grid grid-cols-5 grid-flow-row space-y-4 sm:space-y-0 items-center justify-between gap-x-8 px-0 pb-2">
                    <div className="grid col-span-5">
                        <div className="flex gap-x-4 h-auto flex-wrap justify-between items-center">
                            
                            <div className="lg:hidden">
                                <select
                                    value={activeTab}
                                    onChange={(e) => handleTabClick(e.target.value)}
                                    className="block w-auto px-4 py-1 text-sm border rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                <option value="running">Active</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="hold">Hold</option>
                                <option value="endingsoon">Ending Soon</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                </select>
                            </div>


                            <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex flex-wrap gap-x-1 bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                                    {["Running", "Scheduled", "Hold", "endingsoon", "Completed", "Cancelled"].map((tab) => {
                                    const isActive = activeTab === tab;
                                    const showCount = isActive ? batchData?.count : 0;

                                    return (
                                        <Badge
                                        key={tab}
                                        count={showCount}
                                        overflowCount={999999}
                                        size="small"
                                        offset={[0, 0]} // reposition for new style
                                        >
                                        <button
                                            onClick={() => handleTabClick(tab)}
                                            className={`px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50
                                            ${
                                                isActive
                                                ? `text-gray-600 shadow-md ${theme.activeTab}` // active style
                                                : "text-gray-600 hover:bg-white/50"
                                            }`}
                                        >
                                            {tab === "endingsoon" ? "Ending Soon" : tab}
                                        </button>
                                        </Badge>
                                    );
                                    })}
                                </div>
                            </div>



                            <div className="grid col-span-1 justify-items-end items-center">
                                <div className="flex gap-x-6">
                                    <label htmlFor="table-search" className="sr-only">Search</label>
                                        <div className="relative">
                                            <input  value={inputValue} type="text" id="table-search" placeholder="Search for batch"
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className={`2xl:w-96 lg:w-96 md:w-40 h-8 block p-2 pr-10 text-xs font-medium ${theme.searchBg}`} 
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <button onClick={() => {setInputValue(""); setSearchTerm("");}}>
                                            {searchTerm ? (
                                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                                </svg>
                                            )}
                                        </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>  
                    </div>
                </div>
                
                {/* {activeTab === 'tab1' && ( */}
                <div className={`overflow-hidden pb-0 mx-0 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                    <div className="w-full h-auto md:max-h-[30rem] 2xl:max-h-[34rem] overflow-y-auto rounded-xl pb-2">
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
                                        S.No
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Batch Id
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByStartTime}>
                                        Start Time 
                                    <span className="ml-1">
                                            <Tooltip title="Sort by Start Time" placement="top"> 
                                                {sortByTime ? <UpOutlined /> : <DownOutlined />}
                                            </Tooltip>
                                    </span>
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByStartDate}>
                                        Start Date
                                    <span className="ml-1">
                                            <Tooltip title="Sort by start Date" placement="top">
                                                {sortByStartDate ? <UpOutlined /> : <DownOutlined />}
                                            </Tooltip>
                                    </span>
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByEndDate}>
                                        End Date
                                        <span className="ml-1">
                                            <Tooltip title="Sort by End Date" placement="top">
                                                {sortByEndDate ? <UpOutlined /> : <DownOutlined />}
                                            </Tooltip>
                                    </span>
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Course
                                        {/* <Tooltip title="Sort by Course" placement="top">
                                        <Dropdown menu={courseMenu} trigger={["click"]} >
                                            <Button type="text" icon={<FilterOutlined  />} />
                                        </Dropdown>
                                        </Tooltip> */}
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Trainer
                                        {/* <Tooltip title="Sort by Trainer" placement="top">
                                        <Dropdown  trigger={["click"]}>
                                            <Button type="text" icon={<FilterOutlined  style={{ color: sortByLanguage ? "blue" : "black" }} />} />
                                        </Dropdown>
                                        </Tooltip> */}
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Students
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
                                ) : sortedBatches.length > 0 ? (
                                    sortedBatches.map((item, index) => (
                                        <tr key={index} className={`hover:bg-white transition-colors scroll-smooth`}>
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
                                            <td className="px-3 py-2 md:px-1 cursor-pointer font-medium" onClick={() => handleBatchClick(navigate,item.id)}>
                                                {item.batch_id} {item.batch_link && ( 
                                                    <Tooltip title={
                                                        <span overlayStyle={{ whiteSpace: "nowrap", maxWidth: 'none' }}>
                                                            Class Link - {item.batch_link}
                                                        </span>
                                                        }
                                                        >
                                                        <span>
                                                        <LinkOutlined style={{ color: "blue" }} />
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 md:px-1 ">
                                                {dayjs(`1970-01-01T${item.batch_time_data?.start_time}`).format("hh:mm A")}
                                                <span> - </span>
                                                {dayjs(`1970-01-01T${item.batch_time_data?.end_time}`).format("hh:mm A")}
                                            </td>
                                            <td className="px-3 py-2 md:px-1"> 
                                                {dayjs(item.start_date).format("DD/MM/YYYY")}
                                            </td>
                                            <td className="px-3 py-2 md:px-1"> 
                                                {dayjs(item.end_date).format("DD/MM/YYYY")}
                                            </td>
                                            <td className="px-3 py-2 md:px-1">{item.course_name}</td>

                                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.trainer)}>{item.trainer_name}</td>
                                            
                                            <td className="px-3 py-2 md:px-1 relative">
                                                {/* <Avatar.Group
                                                    max={{
                                                        count: 2,
                                                        style: {
                                                        color: "#f56a00",
                                                        backgroundColor: "#fde3cf",
                                                        height: "24px",
                                                        width: "24px",
                                                        },
                                                    }}
                                                    >
                                                    {item.student_name?.slice(0, 0).map((name, index) => (
                                                        <Avatar size={24} style={{ backgroundColor: "#87d068" }}>
                                                            {name[0]}
                                                        </Avatar>
                                                    ))}
                                                    {item.student_name?.map((name, index) => (
                                                        <Avatar key={index} size={24} style={{ display: "none" }}>
                                                        {name[0]}
                                                        </Avatar>
                                                    ))}
                                                </Avatar.Group> */}


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
                                                    {item.student_name?.map((name, index) => (
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

                                                <div className="relative inline-block">
                                                    <Button
                                                        disabled={item.status === "Cancelled" || item.status === "Completed"}
                                                        color="primary"
                                                        variant="filled"
                                                        className="ml-1 rounded-full"
                                                        size="small"
                                                        onClick={() => {
                                                            handleStudentDropdown(item.id, index);
                                                            fetchAvailableStudents(item.id);
                                                        }}
                                                        >
                                                        {addStudentDropdown === index ? "-" : "+"}
                                                    </Button>

                                                    {addStudentDropdown === index && (
                                                        <div className="absolute left-full top-0 ml-2 bg-white border rounded shadow-lg p-2 z-50 flex">
                                                            <Select
                                                                showSearch
                                                                mode="multiple"
                                                                size="small"
                                                                style={{ width: 250, whiteSpace: "normal" }}
                                                                onChange={(values) => handleSelectChange(item.id, values)}
                                                                placeholder="Select a student"
                                                                options={students[item.id] ? students[item.id].map(student => ({
                                                                    label: (
                                                                        <div style={{ whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>
                                                                            {student.name} - {student.phone}
                                                                        </div>
                                                                    ),
                                                                    title: `${student.name} - ${student.phone}`,
                                                                    value: student.studentid,
                                                                    phone:  student.phone,
                                                                    dataName: student.name.toLowerCase(), 
                                                                    dataPhone: student.phone.toLowerCase(),
                                                                })) : []}
                                                                filterOption={(input, option) =>
                                                                    option.dataName.includes(input.toLowerCase()) ||
                                                                    option.dataPhone.includes(input.toLowerCase())
                                                                }
                                                                optionRender={(option) => (
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                                                        {/* Left-aligned student name & phone */}
                                                                        <span style={{ flex: 1 }}>{option.data.label}</span>
                                                                
                                                                        {/* Right-aligned icons */}
                                                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                                        <Tooltip title="Copy Phone Number">
                                                                            <span>
                                                                                <CopyOutlined
                                                                                    style={{ cursor: "pointer", color: "#1890ff" }}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        copyToClipboard(option.data.phone);
                                                                                    }}
                                                                                />
                                                                            </span>
                                                                        </Tooltip>

                                                                        <Tooltip title="Open Student Info">
                                                                            <span>
                                                                                <RightOutlined
                                                                                    style={{ cursor: "pointer", color: "blue" }}
                                                                                    onClick={(e) => {
                                                                                        handleStudentClickOnSelect(e, option.data.value);
                                                                                    }}
                                                                                />
                                                                            </span>
                                                                        </Tooltip>

                                                                        </div>
                                                                    </div>
                                                                )}
                                                            />

                                                            <button className={`ml-1 px-2 py-1 rounded-md text-white font-medium ${theme.createBtn}`}  onClick={() => { addStudents(item.id); setAddStudentDropdown(false); }}>
                                                                Add
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.mode === "Offline" ? "green" : item.mode === "Online" ? "red" : "geekblue"}>
                                                    {item.mode}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.language === "Hindi" ? "green" : item.language === "English" ? "volcano" : "blue"}>
                                                    {item.language}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : item.preferred_week === "Weekends" ? "gold" : "geekblue" }>
                                                    {item.preferred_week}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Tag className="rounded-xl" bordered={false} color={item.batch_location === "Saket" ? "blue" : item.batch_location === "Laxmi Nagar" ? "magenta" : "geekblue"}>
                                                    {item.batch_location}
                                                </Tag>
                                            </td>

                                            <td className="px-3 py-2 md:px-1 font-normal">
                                                <Dropdown
                                                    trigger={["click"]}
                                                    menu={{
                                                        items: ["Running", "Completed", "Hold", "Cancelled"]
                                                            .filter((status) => !(item.status === "Running" && status === "Running" || item.status === "Hold" && status === "Hold"))
                                                            .map((status) => ({
                                                                key: status,
                                                                label: status,
                                                            })),
                                                        onClick: ({ key }) => onChangeStatus(item.id, key),
                                                    }}
                                                    >
                                                    <a onClick={(e) => e.preventDefault()}>
                                                        <Tag className="rounded-xl" bordered={false} color={item.status === "Running" ? "green" : item.status === "Upcoming" ? "lime" : item.status === "Completed" ? "geekblue" : item.status === "Hold" ? "volcano" : "red"}>
                                                            {item.status} <span><DownOutlined /></span>
                                                        </Tag>
                                                    </a>
                                                </Dropdown>
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
                                                                handleEditClick(item);
                                                                setIsModalOpen(true);
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
                                                            title="Delete the Batch"
                                                            description="Are you sure you want to delete this Batch?"
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
                                            <Empty description="No Batches found" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>

                    <div className={`flex justify-center items-center mt-0 py-2 bg-gray-200/20`}>
                    <Pagination
                            size="small"
                            current={currentPage}
                            total={batchData?.count || 0}
                            pageSize={pageSize} // example: 30
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}    // hide page size select
                            showQuickJumper={false}    // hide quick jump input
                        />
                    </div>

                {/* {activeTab === "available_batches" && (
                    <AvailableBatches/>
                )} */}

                </div>
                {/* )} */}
            {/* </div> */}

            <CreateBatchForm isOpen={isModalOpen} selectedBatchData={selectedBatch|| {}}  onClose={() => setIsModalOpen(false)} />

        </div>


        {/* Table for available trainers  */}
        <div>
            <AvailableBatches/>
        </div>

   </>
    )
}


export default Batches;
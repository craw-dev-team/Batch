
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, Tag, Tooltip, Dropdown, Pagination, Empty, Spin, Switch, Button, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownOutlined, EditOutlined  } from '@ant-design/icons';
import { handleTrainerClick } from "../../../../Navigations/Navigations";
import { useTrainerForm } from "../../../Trainercontext/TrainerFormContext";
import TrainerCards from "./TrainerCards";
import dayjs from "dayjs";
import { useTheme } from "../../../../Themes/ThemeContext";


const TrainersList = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const { type } = useParams(); // Get type from URL
    const { loading, setLoading, trainersCount, fetchTrainersCount } = useTrainerForm();
    const [trainerStatuses, setTrainerStatuses] = useState({}); // Store status per trainer

    // const { studentStatuses, setStudentStatuses, handleStudentStatusChange } = useStudentStatusChange(token);
    const navigate = useNavigate();

        // for Pagination 
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');


    
    useEffect(() => {
        if (type) {
            fetchTrainersCount(type);
        }
    }, [type]);
    
    
  // HANDLE SEARCH INPUT AND DEBOUNCE 
        useEffect(() => {
            const handler = setTimeout(() => {
                setSearchTerm(inputValue.trimStart());
            }, 500); // debounce delay in ms
          
            return () => {
              clearTimeout(handler); // clear previous timeout on re-typing
            };
          }, [inputValue]);
    

    const filteredTrainer = trainersCount?.trainers || []
    
    useEffect(() => {
        if (Array.isArray(filteredTrainer) && filteredTrainer.length > 0) {
            
            const timer =  setTimeout(() => {
                const initialStatuses = {};
                filteredTrainer.forEach((student) => {
                initialStatuses[student.id] = student.status;
            });

            setTrainerStatuses(initialStatuses);
           }, 100);
           
           return () => clearTimeout(timer);
        }

    }, [filteredTrainer]);


    // HANDLE FILTER STUDENT BASED ON SEARCH INPUT 
     const searchFilteredTrainer = useMemo(() => {
            const term = searchTerm.toLowerCase();
          
            if (!searchTerm) return filteredTrainer;
          
            return filteredTrainer.filter(student => {
              return (
                (student.name?.toLowerCase() || "").includes(term) ||
                (student.email?.toLowerCase() || "").includes(term) ||
                (student.phone?.toLowerCase() || "").includes(term) ||
                (student.support_coordinator_name?.toLowerCase() || "").includes(term));
            });
          }, [filteredTrainer, searchTerm]);
          

    
    // Delete Function
    const handleDelete = async (trainerId) => {
    if (!trainerId) return;
        
    try {
        const response = await axiosInstance.delete(`/api/trainers/delete/${trainerId}/`);

        if (response.status === 204) {
            // Make sure coursesData is an array before filtering
            if (Array.isArray(trainerData)) {
                setTrainerData(prevTrainers => prevTrainers.filter(trainer => trainer.id !== trainerId));
            } else {
                console.error('TrainerData is not an array');
            }
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


    // Confirm and Cancel Handlers for delete button
    const confirm = (trainerId) => {
        handleDelete(trainerId); // Call delete function with course ID
        message.success('Trainer Deleted Successfully');
    };

    const cancel = () => {
        message.error('Trainer Deletion Cancelled');
    };


    return (
        <>
        <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
            {/* <div className="relative w-full h-full shadow-md sm:rounded-lg border border-gray-50"> */}
                {/* <div className={`pb-2 relative`}> */}
                    <TrainerCards/>

                    <div className="flex justify-between items-center">
                        <h3 className={`font-semibold px-1 my-4 ${theme.text}`}> {type === "trainer_on_leave"? "Trainers on Leave": type === "active_trainer" ? "Active Trainers" : type === "inactive_trainer" ? "Inactive Trainers" : type === "saket" ? "Trainers in Saket" : "Trainers in Laxmi Nagar"}</h3>
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
                            {["trainer_on_leave", "active_trainer", "inactive_trainer", "saket", "laxmi_nagar"].includes(type) && (

                            <tr className="bg-gray-50/80">
                                <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                    s.No
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
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Action
                                </th>
                                
                            </tr>

                            )}
                        
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                        { loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>

                        ) : searchFilteredTrainer.length > 0 ? (
                            searchFilteredTrainer.map((item, index) => (
                                <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                    <td className="px-3 py-2 md:px-2">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate, item.id)}>
                                        {item.trainer_id}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate, item.id)}>
                                        {item.name}
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {dayjs(item.date_of_joining).format("DD/MM/YYYY")}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 truncate">
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
                                        <Tag className="rounded-xl" bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item?.teamleaders?.find(leader => leader.id === item.teamleader)?.name || "Mohit Yadav"}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag>}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.location == '1' ? <Tag className="rounded-xl" bordered={false} color="blue">Saket</Tag> : item.location == "2" ? <Tag className="rounded-xl" bordered={false} color="magenta">Laxmi Nagar</Tag> : <Tag className="rounded-xl" bordered={false} color="geekblue">Both</Tag>}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
                                        {item.weekoff}
                                    </td>

                                    <td className="px-3 py-2 md:px-1">
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
                                    </td>

                                    <td > 
                                        <Button 
                                            color="primary" 
                                            variant="filled" 
                                            className="rounded-xl w-auto pl-3 pr-3 py-0 my-1 mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                                handleEditClick(item);  // Open the form with selected course data
                                                setIsModalOpen(true);   // Open the modal
                                            }}
                                            >
                                            <EditOutlined />
                                        </Button>
                                        <Popconfirm
                                            title="Delete the Trainer"
                                            description="Are you sure you want to delete this Trainer?"
                                            onConfirm={() => confirm(item.id)}
                                            onCancel={cancel}
                                            okText="Yes"
                                            cancelText="No"
                                            >
                                            <Button 
                                                color="danger" 
                                                variant="filled" 
                                                className="rounded-xl w-auto px-3"
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
                                    <Empty description="No Students Found" />
                                </td>
                            </tr>
                        )}
                        </tbody>
                        </table>
                    </div>

                     {/* <div className="flex justify-center items-center mt-0 py-2 bg-gray-200/20">
                        <Pagination
                            size="small"
                            current={currentPage}
                            total={currentTrainerData?.total || 0}
                            pageSize={pageSize}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showQuickJumper={false}
                        />
                    </div> */}

                {/* </div> */}
            {/* </div> */}
        </div>
        </>
    )
    
};

export default TrainersList;
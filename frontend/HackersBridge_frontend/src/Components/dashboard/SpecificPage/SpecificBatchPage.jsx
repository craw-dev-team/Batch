import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useSpecificBatch } from "../Contexts/SpecificBatch";
import { DatePicker, Empty, Spin, Avatar, Tooltip, Tag, Button, Popconfirm  } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, CloseOutlined, CheckOutlined    } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from 'axios';
import BASE_URL from "../../../ip/Ip";
import AddStudentModal from "../AddStudentModal/AddStudentModal";
import { useSpecificStudent } from "../Contexts/SpecificStudent";



// const SpecificBatchPage = () => {
//     const { batchId } = useParams();
//     const { specificBatch, fetchSpecificBatch } = useSpecificBatch();
 


//     useEffect(() => {
//         if (batchId) {
//             fetchSpecificBatch(batchId);
//         }
//     },[batchId]);
    
//     const batchDetails = specificBatch?.batch;
//     console.log(batchDetails);

  

//     // const filteredStudentData = specificStudent?.All_in_One
//     //     ? activeTab === 'running'
//     //     ? specificStudent?.All_in_One?.student_batch_ongoing
//     //     : activeTab === 'scheduled'
//     //     ? specificStudent?.All_in_One?.student_batch_upcoming
//     //     : activeTab === 'completed'
//     //     ? specificStudent?.All_in_One?.student_batch_completed
//     //     : activeTab === 'allupcomingbatches'
//     //     ? specificStudent?.All_in_One?.all_upcoming_batch
//     //     : []
//     // :[];


//     return (
//         <>
//         <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
//             <div className="grid grid-cols-6 gap-x-6">
//                     {batchDetails ? (
//                     <>
//                 <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
//                     <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
//                         <p key={batchDetails.id}># {batchDetails.batch_id}</p>
//                     </div>
//                         <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        
//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Trainer</h1>
//                             <p className="font-semibold">{batchDetails.trainer_name}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1">
//                             <h1>Course</h1>
//                             <p className="font-semibold">{batchDetails.course_name}</p>
//                         </div>
                        
//                         <div className="col-span-1 px-1 py-1">
//                             <h1 >Start Time</h1>
//                             <p className="font-semibold">{batchDetails.batch_time_data?.start_time}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1">
//                             <h1 >End Time</h1>
//                             <p className="font-semibold">{batchDetails.batch_time_data?.end_time}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Preferred Week</h1>
//                             <p className="font-semibold">{batchDetails.preferred_week}</p>
//                         </div>
                        
//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Location</h1>
//                             <p className="font-semibold">{batchDetails.batch_location}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Language</h1>
//                             <p className="font-semibold">{batchDetails.language}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Mode</h1>
//                             <p className="font-semibold">{batchDetails.mode}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
//                             <h1>Start Date</h1>
//                             <p className="font-semibold">{batchDetails.start_date}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
//                             <h1>End Date</h1>
//                             <p className="font-semibold">{batchDetails.end_date}</p>
//                         </div>

//                         <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
//                             <h1>Status</h1>
//                             <p className="font-semibold">{batchDetails.status}</p>
//                         </div>

//                         </div>
//                 </div>

//                 <div className="px-4 py-4 col-span-5 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
//                     <div className="w-full font-semibold">
                        
//                         <div className="col-span-1 text-lg px-4 py-4">
//                             <h1>Students</h1>
//                         </div>

//                         <div className="col-span-1 px-4 py-2 leading-8">
//                             <ul>
//                             {specificBatch?.students.map((student, index) => (
//                               <>
//                                 <li className="" key={index}><span className="mr-4">{index + 1} :</span>{student.name}</li>
//                               </>
//                             ))}


//                             </ul>
//                         </div>

//                     </div>
//                 </div>

                
//                     </>
//                     ) : (
//                         <p>Loading student data...</p>
//                     )}
//             </div>


           
                    
                
                   
//         </div>  
//         </>
//     )

// }

// export default SpecificBatchPage;








const SpecificBatchPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const { batchId } = useParams();
    const { specificBatch, fetchSpecificBatch, loading } = useSpecificBatch();
    const { fetchSpecificStudent } = useSpecificStudent();

    const [editingField, setEditingField] = useState(null);
    const [updatedValues, setUpdatedValues] = useState(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (batchId) {
            try {
                // Decode the ID before using it
                const originalTrainerId = atob(batchId);
                
                // Fetch trainer data with the decoded ID
                fetchSpecificBatch(originalTrainerId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    }, [batchId]);

    useEffect(() => {
        if (specificBatch?.batch) {
            setUpdatedValues(specificBatch.batch);
        }
    }, [specificBatch]);

    if (!updatedValues) {
        return <p>Loading batch data...</p>;
    }

    
    // TO NAVIGATE TO STUDENT SPECIFIC PAGE 
    const handleStudentClick = async (studentId) => {
        if (!studentId) return;
        const encodedStudentId = btoa(studentId);
        await fetchSpecificStudent(studentId)
        
        navigate(`/students/${encodedStudentId}`)
    };


    // Function to safely get nested property values
    const getNestedValue = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    // Function to safely update nested properties
    const setNestedValue = (obj, path, value) => {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const deepCopy = { ...obj };

        let temp = deepCopy;
        keys.forEach((key) => {
            if (!temp[key]) temp[key] = {};
            temp = temp[key];
        });

        temp[lastKey] = value;
        return deepCopy;
    };

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleChange = (field, value) => {
        setUpdatedValues((prev) => setNestedValue(prev, field, value));
    };

    const saveChanges = async (field) => {
        if (!updatedValues) return;
        setEditingField(null);
        setIsDatePickerOpen(false); // Close DatePicker if it was open
    
        try {
            const decodedBatchId = atob(batchId); // Decode batchId before using it
            const updatePayload = JSON.stringify({ [field]: updatedValues[field] }); // Convert to JSON string
    
            console.log("Decoded Batch ID:", decodedBatchId);
            console.log("Payload:", updatePayload);
    
            await axios.put(`${BASE_URL}/api/batches/edit/${decodedBatchId}`, updatePayload, {
                headers: { "Content-Type": "application/json" },
            });
    
            console.log(`${field} updated successfully`);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };
    

    return (
        <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
            <div className="grid grid-cols-6 gap-x-6">
                <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <p># {updatedValues.batch_id}</p>
                    </div>

                    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">
                    {[
                            { label: "Trainer", key: "trainer_name" },
                            { label: "Course", key: "course_name" },
                            { label: "Start Time", key: "batch_time_data.start_time" },
                            { label: "End Time", key: "batch_time_data.end_time" },
                            { label: "Preferred Week", key: "preferred_week" },
                            { label: "Location", key: "batch_location" },
                            { label: "Language", key: "language" },
                            { label: "Mode", key: "mode" },
                            { label: "Status", key: "status" },
                            { label: "Start Date", key: "start_date" },
                        ].map(({ label, key }) => (
                        <div key={key} className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>{label}</h1>
                            <div className="flex items-center gap-2">
                                {editingField === key ? (
                                    key === "start_date" ? (
                                        <div className="flex items-center gap-2">
                                            {/* Date Picker */}
                                    <DatePicker
                                        open={isDatePickerOpen}
                                        value={updatedValues.start_date ? dayjs(updatedValues.start_date, "YYYY-MM-DD") : null}
                                        onChange={(date, dateString) => handleChange("start_date", dateString)}
                                        className="border-gray-300"
                                        size="large"
                                        placeholder="Select Start Date"
                                    />

                                    {/* Submit Button */}
                                    <CheckCircleOutlined
                                        className="text-green-500 text-lg cursor-pointer hover:text-green-700"
                                        onClick={() => {
                                            saveChanges("start_date");
                                            setIsDatePickerOpen(false);
                                        }}
                                    />

                                    {/* Cancel Button */}
                                    <CloseCircleOutlined
                                        className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                        onClick={() => {
                                            setIsDatePickerOpen(false);
                                            setEditingField(null);
                                        }}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="border p-1 rounded w-full"
                                    value={getNestedValue(updatedValues, key) || ""}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    onBlur={() => saveChanges(key)}
                                    onKeyDown={(e) => e.key === "Enter" && saveChanges(key)}
                                    autoFocus
                                />
                                )
                            ) : (
                                <p className="font-semibold">
                                    {key === "start_date"
                                        ? new Date(updatedValues.start_date).toLocaleDateString("en-GB")
                                        : getNestedValue(updatedValues, key) || "N/A"}
                                </p>
                            )}

                            {/* Edit Icon */}
                            {!isDatePickerOpen && (
                                <EditOutlined
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        handleEdit(key);
                                        if (key === "start_date") setIsDatePickerOpen(true);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}

                        {/* Formatted Start Date */}
                        {/* <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Start Date</h1>
                            <p className="font-semibold">
                                {new Date(updatedValues.start_date).toLocaleDateString("en-GB")}
                            </p>
                        </div> */}

                        {/* Formatted End Date */}
                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>End Date</h1>
                            <p className="font-semibold">
                                {new Date(updatedValues.end_date).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Students List */}
                <div className="py-4 col-span-6 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full font-semibold">
                        <div className="col-span-1 text-lg px-4 py-4 flex justify-between">
                            <h1>Students</h1>
                            <button onClick={() => setIsModalOpen(true)} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add +</button>
                            </div>

                        <div className="col-span-1py-2 leading-8">
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
                                    {/* <th scope="col" className="px-3 py-3 md:px-1">
                                        Date of Birth
                                    </th> */}
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
                                        Mode
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1">
                                        Language
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
                        
                        ) : specificBatch?.students.length > 0 ? (
                            specificBatch?.students.map((item, index) => (
                            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                {index + 1}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.id}
                                </td> */}
                                <th className="px-3 py-2 md:px-1 cursor-pointer"  onClick={() => handleStudentClick(item.id)}>
                                    {item.enrollment_no}
                                </th>
                                <td className="px-3 py-2 md:px-1">
                                    {item.name}
                                </td>
                                {/* <td className="px-3 py-2 md:px-1">
                                    {item.dob}
                                </td> */}
                                <td className="px-3 py-2 md:px-1">
                                    {item.phone}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.email}
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.date_of_joining}
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
                                    <Tag bordered={false} color={item.mode == 'Offline'? 'green' : item.mode == 'online'? 'volcano' : 'geekblue'}>
                                        {item.mode}
                                    </Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.language === 'Hindi'? 'green' : item.language === 'English'? 'volcano' : 'blue'}>
                                        {item.language}
                                    </Tag>
                                </td>

                                <td className="px-3 py-2 md:px-1">
                                    <Tag bordered={false} color={item.preferred_week === "Weekdays" ? "cyan" : "geekblue" }>
                                        {item.preferred_week}
                                    </Tag>
                                </td>
                                <td className="px-3 py-2 md:px-1">
                                    {item.location == '1' ? <Tag color="blue">Saket</Tag> : <Tag color="magenta">laxmi Nagar</Tag>}
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
                            {/* <ul>
                                {specificBatch?.students.map((student, index) => (
                                    <li key={index}>
                                        <span className="mr-4">{index + 1} :</span>
                                        {student.name}
                                    </li>
                                ))}
                            </ul> */}
                        </div>
                    </div>
                </div>
            </div>
            <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default SpecificBatchPage;

import { useEffect, useState } from "react";
import { Button, message, Popconfirm, Spin, Empty, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import CreateCourseForm from "./CreateCourseForm";
import { useCourseForm } from "../Coursecontext/CourseFormContext";
import { useNavigate } from "react-router-dom";
import { handleCourseClick } from "../../Navigations/Navigations";
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext";


const Courses = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState('tab1');
    const [selectedCourse, setSelectedCourse] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const { coursesData, loading, setCoursesData, fetchCourses } = useCourseForm();
    
    const navigate = useNavigate();

    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

      // Fetch courses after deletion or modal interaction
      useEffect(() => {
            fetchCourses();  // Fetch courses after deletion
            setIsDeleted(false); // Reset deletion flag
     
    }, [isDeleted, selectedCourse, isModalOpen]);
    

    // Function to handle Edit button click
    const handleEditClick = (course) => {
        setSelectedCourse(course); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

    // Delete Function
    const handleDelete = async (courseId) => {
        if (!courseId) return;

        try {
            const response = await axiosInstance.delete(`/api/courses/delete/${courseId}/` );

            if (response.status === 204) {
                // Make sure coursesData is an array before filtering
                if (Array.isArray(coursesData)) {
                    setCoursesData(prevCourses => prevCourses.filter(course => course.id !== courseId));
                } else {
                    console.error('coursesData is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    // Confirm and Cancel Handlers
    const confirm = (courseId) => {
        handleDelete(courseId); // Call delete function with course ID
        message.success('Course Deleted Successfully');
    };

    const cancel = () => {
        message.error('Course Deletion Cancelled');
    };
   

   

    return (
        <>
            <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
                <div className={`w-full px-0 py-3 flex items-center justify-between font-semibold ${theme.text}`}>
                <h1>All Courses</h1>
                    <div>
                        <button onClick={() => { setIsModalOpen(true); setSelectedCourse(null); }} type="button" className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Add Course +</button>
                    </div>
                </div>

                {activeTab === 'tab1' && (
                <div className={`overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                    <div className="w-full h-[37rem] md:max-h-[32rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2">
                <table className="w-full text-xs font-normal text-left text-gray-600">
                    <thead className="bg-white sticky top-0 z-10">
                        <tr className="bg-gray-50/80">
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                s. No
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Course Name
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Course Code
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Duration
                            </th>
                            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                Certification
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
                    
                    ) : coursesData && Array.isArray(coursesData) && coursesData.length > 0 ? (
                        coursesData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                            <td className="p-3 px-3 py-2 md:px-1">
                                {index + 1}
                            </td>
                            <th scope="row" className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleCourseClick(navigate,item.id)}>
                            {item.name}
                            </th>
                            <td className="px-3 py-2 md:px-1">
                                {item.code}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.duration === 1 ? `${item.duration} Day` : `${item.duration} Days` }
                            </td>
                            <td className="px-3 py-2 md:px-1">
                            {item.certification_body}
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
                                                handleEditClick(item);   // Open course edit form
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
                                            title="Delete the Course"
                                            description="Are you sure you want to delete this course?"
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
                                <Empty description="No Courses found"/>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
                {/* <Pagination align="center" defaultCurrent={1} total={50} /> */}
                </div>
                )}


                <CreateCourseForm isOpen={isModalOpen}  selectedCourseData={selectedCourse || {}} onClose={() => setIsModalOpen(false)} />

            </div>        
        </>
    )
}

export default Courses;

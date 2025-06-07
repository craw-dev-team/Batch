import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpecificBook } from "../Contexts/SpecificBook";
import AddBookForm from "../Books/AddBookForm";
import { Button, Select, Empty, Spin, Avatar, Tooltip, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from "dayjs";


const SpecificBookPage = () => {
    const [activeTab, setActiveTab] = useState("issued_book");
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [selectedBook, setSelectedBook] = useState();

    const { specificBook, loading, fetchSpecificBook } = useSpecificBook();
    const { bookId } = useParams();

    const { book_info } = specificBook || {};
    const navigate = useNavigate();


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    useEffect(() => {
        if (bookId) {
            try {
                const originalBookId = atob(bookId)
                fetchSpecificBook(originalBookId)
            } catch (error) {
                console.log(error);
                
            }
        }
    },[])

    
     const handleBookEditClick = (book) => {
        setSelectedBook(book);
        setIsModalOpen(true);        
    };

    const handleStudentClick = (studentId) => {        
        if (!studentId) return;
        const encodedStudentId = btoa(studentId)
        navigate(`/students/${encodedStudentId}`)
    };
    
    return (
        <>
             <div className="w-auto h-full pt-20 px-2 mt-0 ">
            <div className="grid">
                    {book_info ? (
                    <>
                <div className="px-4 py-4 col-span-3 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold flex justify-between">
                        <p># {book_info.book_id}</p>
                        <Button 
                            color="secondary" 
                            variant="outlined" 
                            className="rounded-lg"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                handleBookEditClick(book_info);  // Open the form with selected course data
                                setIsModalOpen(true);   // Open the modal
                            }}
                        >
                            <EditOutlined />
                        </Button>
                    </div>
                        <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        <div className="col-span-1 px-1 py-1">
                            <h1 >Name</h1>
                            <p className="font-bold text-md">{book_info.name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Version</h1>
                            <p className="font-semibold">{book_info.version}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>course</h1>
                            <p className="font-semibold">{book_info.course}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Quantity</h1>
                            <p className="font-semibold">{book_info.stock}</p>
                        </div>
                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Status</h1>
                            <p className="font-semibold">{book_info.status}</p>
                        </div>

                        </div>
                </div>
                
                    </>
                     )  
                     : (
                        <p>Loading Course data...</p>
                    )}
            </div>
           
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <h1>{activeTab === "issued_book" ? "List of Students Who Have Received Books" : "Students Yet to Receive Their Books"}</h1>
                    </div>
                        <div className="flex gap-x-4 h-10 justify-between">
                            <div className="tabs">
                                <button
                                    onClick={() => handleTabClick("issued_book")}
                                    className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                        ${activeTab === "issued_book" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                    Issued Book
                                </button>

                                <button
                                    onClick={() => handleTabClick("not_issued_book")}
                                    className={` px-4 py-2 text-xs font-semibold rounded-sm transition-colors duration-200 
                                    ${activeTab === "not_issued_book" ? 'bg-blue-300  text-black' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                                >
                                    Not Issued Book
                                </button>
                                        
                            </div>

                        </div>
                        
                        <div className="overflow-hidden pb-2 relative ">
                            <div className="w-full h-[38rem] overflow-y-auto rounded-lg pb-2">
                                <>
                                    <table className="w-full text-xs text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                                                <tr>
                                                    <th scope="col" className="p-2">
                                                        <div className="flex items-center">
                                                            <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                        </div>
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-2">
                                                        S.No
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Enrollment No
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Student Name
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Course
                                                    </th>
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Issued Time
                                                    </th>
                                                    {/* <th scope="col" className="px-3 py-3 md:px-1">
                                                        Date of Joining
                                                    </th> */}
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Issued By
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
                                        ) : (
                                            (() => {
                                            const book_issued = specificBook?.issued_students || [];
                                            const book_not_issued = specificBook?.not_issued_students || [];
                                            const shouldBookIssued = activeTab === "issued_book";
                                            const shouldBookNotIssued = activeTab === "not_issued_book";
                                           
                                            const dataToRender = shouldBookIssued ? book_issued : shouldBookNotIssued ? book_not_issued : [];

                                            if (Array.isArray(dataToRender) && dataToRender.length > 0) {
                                                return dataToRender.map((item, index) => (
                                                <tr key={index} className="bg-white border-b border-gray-200 hover:bg-gray-50 scroll-smooth">
                                                    <td className="p-2">
                                                    <div className="flex items-center">
                                                        <input
                                                        id={`checkbox-${index}`}
                                                        type="checkbox"
                                                        className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                                                        />
                                                        <label htmlFor={`checkbox-${index}`} className="sr-only">
                                                        checkbox
                                                        </label>
                                                    </div>
                                                    </td>
                                                    <td className="px-3 py-2 md:px-2 font-medium text-gray-900">{index + 1}</td>
                                                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.student_id)}>
                                                        {item.enrollment_no}
                                                    </td>

                                                    <td className="px-3 py-2 md:px-1">{item.name}</td>
                                                    
                                                    <td className="px-3 py-2 md:px-1">{item.course}</td>
                                                    
                                                    <td className="px-3 py-2 md:px-1">
                                                        {item.allotment_datetime ? dayjs(item.allotment_datetime).format("DD/MM/YYYY | hh:mm A") : "Not Available"}
                                                    </td>
                                                    
                                                    <td className="px-3 py-2 md:px-1">{item.issue_by || "Not Available"}</td>
                                                </tr>
                                                ));
                                                } else if (shouldBookIssued || shouldBookNotIssued) {
                                                return (
                                                    <tr>
                                                        <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                            <Empty description="No Book Issued" />
                                                        </td>
                                                    </tr>
                                                );
                                                } else {
                                                return null;
                                                }
                                            })()
                                        )}
                                        
                                        </tbody>
                                    </table>
                                </>
                            </div>

                        </div>
                </div>
                <AddBookForm isOpen={isModalOpen} selectedBookData={selectedBook || {}} onClose={() => setIsModalOpen(false)} />
        </div>  
        </>
    )
};


export default SpecificBookPage;
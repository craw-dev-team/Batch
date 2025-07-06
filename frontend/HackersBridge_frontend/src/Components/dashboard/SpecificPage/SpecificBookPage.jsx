import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpecificBook } from "../Contexts/SpecificBook";
import AddBookForm from "../Books/AddBookForm";
import { Button, Empty, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { handleStudentClick } from "../../Navigations/Navigations";


const SpecificBookPage = () => {
    const [activeTab, setActiveTab] = useState("issued_book");
    const [isModalOpen, setIsModalOpen] = useState(false) 
    const [selectedBook, setSelectedBook] = useState();
    // for search 
    const [searchTerm, setSearchTerm] = useState("");
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



        const searchFilteredBooks = useMemo(() => {
            const term = searchTerm.toLowerCase();
            const students = activeTab === "issued_book"
                ? specificBook?.issued_students || []
                : activeTab === "not_issued_book"
                ? specificBook?.not_issued_students || []
                : [];

            if (!searchTerm) return students;

            return students.filter(book =>
                (book.enrollment_no?.toLowerCase() || "").includes(term) ||
                (book.name?.toLowerCase() || "").includes(term) ||
                (book.allotment_datetime?.toLowerCase() || "").includes(term) ||
                (book.book_status?.toLowerCase() || "").includes(term) ||
                (book.issue_by?.toLowerCase() || "").includes(term)
            );
        }, [activeTab, searchTerm, specificBook]);

          
    
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

                            <div className="grid col-span-1 justify-items-end">
                                <div className="flex gap-x-6">
                                    <label htmlFor="table-search" className="sr-only">Search</label>
                                    <div className="relative h-auto">
                                        <input value={searchTerm} type="text" id="table-search" placeholder="Search for batch"
                                            onChange={(e) => {
                                                const value = e.target.value.trimStart();
                                                setSearchTerm(value);
                                                // setCurrentPage(1);
                                            }}
                                            className="2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500" 
                                            />
                                        <div className="absolute inset-y-0 right-0 h-8 flex items-center pr-3">
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
                                                    <th scope="col" className="px-3 py-3 md:px-1">
                                                        Book Status
                                                    </th>
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
                                            ) : searchFilteredBooks.length > 0 ? (
                                                searchFilteredBooks.map((item, index) => (
                                                    <tr key={item.student_id || index} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="p-2">
                                                            <input type="checkbox" className="w-3 h-3" />
                                                        </td>
                                                        <td className="px-3 py-2">{index + 1}</td>
                                                        <td className="px-3 py-2 font-bold cursor-pointer" onClick={() => handleStudentClick(navigate,item.student_id)}>
                                                            {item.enrollment_no}
                                                        </td>
                                                        <td className="px-3 py-2">{item.name}</td>
                                                        <td className="px-3 py-2">{item.course}</td>
                                                        <td className="px-3 py-2">
                                                            {item.allotment_datetime ? dayjs(item.allotment_datetime).format("DD/MM/YYYY | hh:mm A") : "Not Available"}
                                                        </td>
                                                        <td className="px-3 py-2">{item.book_status || "-"}</td>
                                                        <td className="px-3 py-2">{item.issue_by || "Not Available"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="100%" className="text-center py-4 text-gray-500">
                                                        <Empty description={activeTab === "issued_book" ? "No Books Issued" : "No Students Waiting for Books"} />
                                                    </td>
                                                </tr>
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
import { useEffect, useState, useMemo } from "react";
import { Button, message, Popconfirm, Spin, Empty, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import AddBookForm from "./AddBookForm";
import { useBookForm } from "../BooksContext/BookFormContext";
import { useNavigate } from "react-router-dom";
import { handleBookClick } from "../../Navigations/Navigations";
import AllBooks from "./AllBooks";
import BookCards from "../SpecificPage/Cards/Book/BookCards";
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext";
import { useSpecificBook } from "../Contexts/SpecificBook";


const Books = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState('books');
    const [selectedBook, setSelectedBook] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const { bookData, loading, fetchBooks, handleDeleteBook } = useBookForm();
    const { specificBook, fetchSpecificBook } = useSpecificBook();
    
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

      // Fetch courses after deletion or modal interaction
      useEffect(() => {
            fetchBooks();  // Fetch courses after deletion
            setIsDeleted(false); // Reset deletion flag
            fetchSpecificBook(allBookIds);
     
    }, [isDeleted, selectedBook, bookData]);
    
    const allBookIds = bookData.map(book => book.id);


    // Function to handle Edit button click
    const handleEditClick = (book) => {
        setSelectedBook(book); // Set the selected book data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };


    // Confirm and Cancel Handlers
    const confirm = (bookId) => {
        handleDeleteBook(bookId);
        
    };

    const cancel = () => {
        message.error('Book Deletion Cancelled');
    };
    

    return (
        <>
        <div className={`w-auto h-full pt-2 px-4 mt-10 ${theme.bg}`}>
            <div className="relative w-auto inline-block z-10 bg-white/70 backdrop-blur-sm p-1.5 rounded-xl">
                    <button
                        onClick={() => handleTabClick("books")}
                        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                            ${activeTab === "books" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                    >
                    Books
                    </button>

                    <button
                        onClick={() => handleTabClick("all_books")}
                        className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-600 hover:bg-white/50 
                            ${activeTab === "all_books" ? `text-gray-600 shadow-md ${theme.activeTab}` : ' text-gray-600 hover:bg-white/50'}`}
                    >
                    All Books
                    </button>

            </div>
            
            {activeTab === "books" && (
            <>
            <div className={`p-2 rounded-xl ${theme.specificPageBg}`}>
                <BookCards />
            </div>
                <div className={`relative w-full h-full mt-3 px-4 shadow-md  ${theme.specificPageBg}`}>
                    <div className={`w-full px-1 py-3 flex justify-between items-center ${theme.text}`}>
                        <div className="flex items-center gap-1">
                            <h1 className="font-semibold">All Books</h1> <span className="text-lg font-bold">({bookData?.length || 0})</span>
                        </div>
                        <div>
                            <button onClick={() => { setIsModalOpen(true); setSelectedCourse(null); }} type="button" className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Add Book +</button>
                        </div>
                    </div>

                
                    <div className={`overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm `}>
                        <div className="w-auto h-[28rem] md:max-h-[25rem] 2xl:max-h-[28rem] overflow-y-auto rounded-xl pb-2">
                            <table className="w-full text-xs font-normal text-left text-gray-600">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr className="bg-gray-50/80">
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            S. No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Book Code
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Book Name
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Allotted
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Version
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Quantity 
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Action
                                        </th>   
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                {loading.all ? (
                                    <tr>
                                        <td colSpan="100%" className="text-center py-4">
                                            <Spin size="large" />
                                        </td>
                                    </tr>
                                
                                ) : bookData && Array.isArray(bookData) && bookData.length > 0 ? (
                                    bookData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                                        <td className=" px-3 py-3 ">
                                            {index + 1}
                                        </td>
                                        <th scope="row" className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBookClick(navigate,item.id)}>
                                            {item.book_id}
                                        </th>
                                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBookClick(navigate,item.id)}>
                                            {item.name}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {specificBook?.issued_students ? specificBook.issued_students.length : 0}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.version}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.stock}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                        {item.status}
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
                                                            handleEditClick(item);  // Open edit form
                                                            setIsModalOpen(true);   // Open modal
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
                
                </div>
                
            </>
            )}

            {activeTab === "all_books" && ( 
            <>
            <div className="bg-white">
                <AllBooks/>
            </div>   
            </>
            )}

            <AddBookForm isOpen={isModalOpen}  selectedBookData={selectedBook || {}} onClose={() => setIsModalOpen(false)} />

        </div>        
        </>
    )
}

export default Books;

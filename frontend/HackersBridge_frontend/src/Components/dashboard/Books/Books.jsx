import { useEffect, useState } from "react";
import { Button, message, Popconfirm, Spin, Empty } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from "axios";
import BASE_URL from "../../../ip/Ip";
import { useAuth } from "../AuthContext/AuthContext";
import AddBookForm from "./AddBookForm";
import { useBookForm } from "../BooksContext/BookFormContext";


const Books = () => {
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [activeTab, setActiveTab] = useState('tab1');
    const [selectedBook, setSelectedBook] = useState();
    const [isDeleted, setIsDeleted] = useState(false)
    const { bookData, loading, setBookData, fetchBooks } = useBookForm();
    const { token } = useAuth();
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

      // Fetch courses after deletion or modal interaction
      useEffect(() => {
            fetchBooks();  // Fetch courses after deletion
            setIsDeleted(false); // Reset deletion flag
     
    }, [isDeleted, selectedBook]);
    
console.log(bookData);

    // Function to handle Edit button click
    const handleEditClick = (book) => {
        setSelectedBook(book); // Set the selected course data
        setIsModalOpen(true); // Open the modal
        setIsDeleted(false)
    };

   // Delete Function
    const handleDelete = async (bookId) => {
        if (!bookId) return;

        try {
            const response = await axios.delete(`${BASE_URL}/api/books/delete/${bookId}/`, 
                { headers: { 'Content-Type': 'application/json', 'Authorization': `token ${token}` } }
            );

            if (response.status === 204) {
                // Make sure coursesData is an array before filtering
                if (Array.isArray(bookData)) {
                    setBookData(prevBooks => prevBooks.filter(book => book.id !== bookId));
                } else {
                    console.error('BookData is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting Book:", error);
        }
    };

// Confirm and Cancel Handlers
    const confirm = (bookId) => {
        handleDelete(bookId); // Call delete function with course ID
        message.success('Book Deleted Successfully');
    };

    const cancel = () => {
        message.error('Book Deletion Cancelled');
    };
   

    return (
        <>
       <div className="w-auto pt-4 px-2 mt-16 darkmode">
    <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
        <h1>All Books</h1>
            <div>
                <button onClick={() => { setIsModalOpen(true); setSelectedCourse(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Book +</button>
            </div>
        </div>

        {activeTab === 'tab1' && (
        <div className={`overflow-hidden pb-2 relative ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
            <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
        <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        s. No
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Book Code
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Book Name
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Version
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Quantity 
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Status
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
               
            ) : bookData && Array.isArray(bookData) && bookData.length > 0 ? (
                bookData.map((item, index) => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td className="p-3 px-3 py-2 md:px-1 font-medium text-gray-900">
                        {index + 1}
                    </td>
                    <th scope="row" className="px-3 py-2 md:px-1 font-medium text-gray-900  dark:text-white">
                       {item.book_id}
                    </th>
                    <td className="px-3 py-2 md:px-1">
                        {item.name}
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
                        <Button 
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
    </div>

<AddBookForm isOpen={isModalOpen}  bookData={selectedBook || {}} onClose={() => setIsModalOpen(false)} />

</div>        
        </>
    )
}

export default Books;

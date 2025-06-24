import { useState, useMemo, useEffect } from "react";
import { useSpecificBook } from "../Contexts/SpecificBook";
import { Pagination, Empty, Spin } from 'antd';
import dayjs from "dayjs";
import { handleStudentClick } from "../../Navigations/Navigations";
import { useNavigate } from "react-router-dom";


const AllBooks = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    const navigate = useNavigate();

    const { studentReceivedBooks, loading, fetchStudentReceivedBooks } = useSpecificBook();
    
    useEffect(() => {
        fetchStudentReceivedBooks({page: currentPage, pageSize, search: searchTerm})
    },[currentPage, searchTerm]);
    

    // HANDLE SEARCH INPUT AND DEBOUNCE 
    useEffect(() => {        
        const handler = setTimeout(() => {
        setSearchTerm(inputValue.trimStart());
        setCurrentPage(1); // reset to page 1 on new search
    }, 500);
        
        return () => {
            clearTimeout(handler); // clear previous timeout on re-typing
        };
    }, [inputValue]);


    return (
        <>
            <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                <div className="flex gap-x-4 h-10 justify-between">

                    <h1 className="text-lg font-semibold">List of Students Who Have Received Books</h1>
                    
                        <div className="grid col-span-1 justify-items-end">
                            <div className="flex gap-x-6">
                                <label htmlFor="table-search" className="sr-only">Search</label>
                                <div className="relative h-auto">
                                    <input value={inputValue} type="text" id="table-search" placeholder="Search for student"
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                    <div className="absolute inset-y-0 right-0 h-8 flex items-center pr-3">
                                    <button onClick={() => {setInputValue(""); setSearchTerm("");}}>
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
                    <div className="w-full h-[39rem] overflow-y-auto rounded-lg pb-2">
                    
                            <table className="w-full text-xs text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                                        <tr>
                                            {/* <th scope="col" className="p-2">
                                                <div className="flex items-center">
                                                    <input id="checkbox-all-search" type="checkbox" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                                                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                                </div>
                                            </th> */}
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
                                    ) : studentReceivedBooks?.results.length > 0 || 0 ? (
                                        studentReceivedBooks?.results.map((item, index) => (
                                            <tr key={ index} className="bg-white border-b hover:bg-gray-50">
                                                {/* <td className="p-2">
                                                    <input type="checkbox" className="w-3 h-3" />
                                                </td> */}
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
                                                <Empty description={"No Books Issued"} />
                                            </td>
                                        </tr>
                                    )}
                                
                                </tbody>
                            </table>
                    
                    </div>

                    <div className="flex justify-center items-center mt-0 py-2 bg-blue-50">
                        <Pagination
                        size="small"
                            current={currentPage}
                            total={studentReceivedBooks?.count || 0}
                            pageSize={pageSize} // example: 30
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}    // hide page size select
                            showQuickJumper={false}    // hide quick jump input
                        />
                    </div>

                </div>
                </div>
        </>
    )
};

export default AllBooks;
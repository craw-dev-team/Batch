import { Empty } from "antd";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../../../Themes/ThemeContext";


const BookCardList = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------
    
    const [searchTerm, setSearchTerm] = useState("");

    const location = useLocation();
    const { data } = location.state || { data: "No Data Available"}
    
    const courseName = data[0]?.course
    
    // Filter students based on the search term of all students added in that batch
        const filteredStudents = useMemo(() => {
        if (!Array.isArray(data)) return [];
        
        return data.filter(item =>
            item?.enrollment_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.book_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item?.book_issue_by?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        }, [data, searchTerm]);



    return (
        <>
            <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
                <div className="flex justify-between items-center">
                    <h1 className={`font-semibold px-1 my-4 ${theme.text}`}>List of Students Who Have Received <span className="text-blue-500">{courseName}</span> Books</h1>
                    
                    <div className="2xl:w-96 lg:w-96 mx-3 mt-0.5">
                        <label htmlFor="table-search" className="sr-only">Search</label>
                        <div className="relative">
                            <input onChange={(e) => setSearchTerm(e.target.value.replace(/^\s+/, ''))} value={searchTerm} type="text" id="table-search" placeholder="Search for student"
                                className={`2xl:w-96 lg:w-96 md:w-72 h-8 block p-2 pr-10 text-xs font-medium ${theme.searchBg}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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

                    <div className="overflow-hidden pb-2 relative">
                        <div className="w-fullh-auto md:max-h-[40rem] 2xl:max-h-[40rem] overflow-y-auto rounded-xl pb-2 bg-white/40 backdrop-blur-sm shadow-sm">
                            <table className="w-full text-xs font-normal text-left text-gray-600">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr className="bg-gray-50/80">
                                        <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                            S.No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Enrollment No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Student Name
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Course
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Issued Time
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Book Status
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Issued By
                                        </th>
                                        
                                    </tr>
                                </thead>
                            
                                <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((item, index) => (
                                            <tr key={item.enrollment_no} className="hover:bg-white transition-colors scroll-smooth">
                                                <td className="px-3 py-2 md:px-2">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.enrollment_no}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.course}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 truncate">
                                                    {item.book_issue_date ? dayjs(item.book_issue_date).format("DD/MM/YYYY | hh:mm A") : "Not Available"}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.book_status ?? "-"}
                                                </td> 
                                                <td className="px-3 py-2 md:px-1 font-normal">
                                                    {item.book_issue_by ?? "-"}
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

                    </div>
            </div> 
        </>
    )
};


export default BookCardList;
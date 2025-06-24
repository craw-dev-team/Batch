import dayjs from "dayjs";
import { useLocation } from "react-router-dom";


const BookCardList = () => {

    const location = useLocation();
    const { data } = location.state || { data: "No Data Available"}
    
    const courseName = data[0]?.course
    
    return (
        <>
             <div className="w-auto h-full pt-14 px-1 mt-0 ">
                    
                <div className="px-4 py-4 h-auto shadow-md sm:rounded-lg border border-gray-50 bg-white">
                        <h1 className="text-lg font-semibold py-2">List of Students Who Have Received <span className="text-blue-500">{courseName}</span> Books</h1>
                        <div className="overflow-hidden pb-2 relative ">
                            <div className="w-full h-[38rem] overflow-y-auto rounded-lg pb-2">
                                <>
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
                                    {data.length > 0 ? (
                                        data.map((item, index) => (
                                            <tr key={item.enrollment_no} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-3 py-2 md:px-2 font-medium text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.enrollment_no}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleStudentClick(item.id)}>
                                                    {item.name}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.course}
                                                </td>
                                                <td className="px-3 py-2 md:px-1 truncate">
                                                    {item.book_issue_date ? dayjs(item.book_issue_date).format("DD/MM/YYYY | hh:mm A") : "Not Available"}
                                                </td>
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.book_status ?? '-'}
                                                </td> 
                                                <td className="px-3 py-2 md:px-1">
                                                    {item.book_issue_by ?? '-'}
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
                                </>
                            </div>

                        </div>
                </div>
            </div> 
        </>
    )
};


export default BookCardList;
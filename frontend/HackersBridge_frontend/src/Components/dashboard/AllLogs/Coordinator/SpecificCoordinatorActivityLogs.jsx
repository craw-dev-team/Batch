import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty, Pagination } from 'antd';
import dayjs from "dayjs";
import { useSpecificCoordinator } from "../../Contexts/SpecificCoordinators";
import { useTheme } from "../../../Themes/ThemeContext";



const SpecificCoordinatorActivityLogs = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const { loading, activityLogs, fetchSpecificCoordinatorActivityLogs } = useSpecificCoordinator();
    const { coordinatorId } = useParams();

    

    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    
    useEffect(() => {        
        if (coordinatorId) {
            try {
                // Decode the ID before using it
                const originalCoordinatorId = atob(coordinatorId);

                // Fetch trainer data with the decoded ID
                fetchSpecificCoordinatorActivityLogs(originalCoordinatorId, {
                    page: currentPage,
                    pageSize,
                    search: searchTerm,
                    type: "activity_logs",
                });
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[coordinatorId, currentPage, pageSize, searchTerm]);


     // HANDLE SEARCH INPUT AND DEBOUNCE 
     useEffect(() => {
        const handler = setTimeout(() => {
          setSearchTerm(inputValue.trimStart());
        }, 10000); // debounce delay in ms
      
        return () => {
          clearTimeout(handler); // clear previous timeout on re-typing
        };
      }, [inputValue]);

    
    
    return (
        <>
            {/* <div className="w-auto mt-0 bg-white"> */}
                <div className={`relative w-full px-4 pb-4 pt-2 mt-1 h-auto shadow-md rounded-xl ${theme.specificPageBg}`}>
                    <div className={`w-full px-1 py-3 flex justify-between font-semibold ${theme.text}`}>
                        <h1>Activity Logs</h1>
                    </div>

                    {/* <div className={`overflow-hidden pb-2 relative `}> */}
                        <div className="w-full h-auto md:max-h-[32rem] 2xl:max-h-[35rem] overflow-y-auto rounded-xl pb-2 bg-white/40">
                            <table className="w-full  text-xs font-normal text-left text-gray-600">
                            <thead className="bg-white sticky top-0 z-10">
                                <tr className="bg-gray-50/80">
                                    <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                        s.No
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Username
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Changes in
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Changes
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Description                       
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Type                       
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                        Remote Ip                       
                                    </th>
                                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase md:w-20">
                                        Time                       
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
                            
                            ) : Array.isArray(activityLogs?.results) && activityLogs?.results.length > 0 ? (
                                activityLogs?.results.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                                    <td scope="row" className="px-3 py-2 md:px-2">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium">
                                        {item.actor}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.object_repr}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                    {typeof item.changes === "object"
                                        ? Object.entries(item.changes).map(([key, value]) => {
                                            if (typeof value === "object" && value.old !== undefined && value.new !== undefined) {
                                            return `${key}: ${value.old} ➝ ${value.new}\n`;
                                            } else {
                                            return `${key}: ${JSON.stringify(value)}\n`;
                                            }
                                        }).join("")
                                        : item.changes}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.changes_text}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.content_type}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {item.remote_addr}
                                    </td>

                                    <td className="px-3 py-2 md:px-1 font-normal">
                                        {dayjs(item.timestamp).format("DD/MM/YYYY | hh:mm A")}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                    <Empty description="No Coordinator Logs Found" />
                                </td>
                            </tr>
                        )}
                            </tbody>
                            </table>
                        </div>

                <div className="flex justify-center items-center mt-0 py-2 bg-gray-200/20">
                    <Pagination
                        size="small"
                        current={currentPage}
                        total={activityLogs?.count || 0}
                        pageSize={pageSize} // example: 10
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}    // hide page size select
                        showQuickJumper={false}    // hide quick jump input
                    />
                </div>

                    {/* </div> */}
                </div>
            {/* </div> */}
        </>
    )
};


export default SpecificCoordinatorActivityLogs;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty, Pagination } from 'antd';
import dayjs from "dayjs";
import { useSpecificCoordinator } from "../../Contexts/SpecificCoordinators";



const SpecificCoordinatorActivityLogs = () => {
    const { loading, activityLogs, fetchSpecificCoordinatorActivityLogs } = useSpecificCoordinator();
    const { coordinatorId } = useParams();

    
    const navigate = useNavigate();

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

      


    // HANDLE NAVIGATE TO TRAINER INFO
    const handleCoordinatorClick =  async (coordinatorId) => {
        if (!coordinatorId) return;
        const encodedCoordinatorId = btoa(coordinatorId); 
        navigate(`/add-details/coordinators/${encodedCoordinatorId}`);
    };
    
    
    
    return (
        <>
           <div className="w-auto mt-0 bg-white">
                <div className="relative w-full h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                        <h1>Logs</h1>
                    </div>

                    <div className={`overflow-hidden pb-2 relative `}>
            <div className="w-full h-[50rem] overflow-y-auto  rounded-lg pb-2">
            <table className="w-full text-xs text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-3 py-3 md:px-2">
                        s.No
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Username
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Changes in
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Changes
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Description                       
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Type                       
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Remote Ip                       
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 md:w-20">
                        Time                       
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
               
            ) : Array.isArray(activityLogs?.results) && activityLogs?.results.length > 0 ? (
                activityLogs?.results.map((item, index) => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                        {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleCoordinatorClick(item.id)}>
                        {item.actor}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {item.object_repr}
                    </td>

                    <td className="px-3 py-2 md:px-1">
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
                    <td className="px-3 py-2 md:px-1">
                        {item.changes_text}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {item.content_type}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {item.remote_addr}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {dayjs(item.timestamp).format("DD-MM-YYYY hh:mm A")}
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

            <div className="flex justify-center items-center mt-0 py-3 bg-slate-200">
                <Pagination
                    current={currentPage}
                    total={activityLogs?.count || 0}
                    pageSize={pageSize} // example: 10
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}    // hide page size select
                    showQuickJumper={false}    // hide quick jump input
                />
            </div>

        </div>
                </div>
            </div>
        </>
    )
};


export default SpecificCoordinatorActivityLogs;
import { useEffect, useState } from "react";
import { Button, message, Popconfirm, Avatar, Tooltip, Select, Tag, Dropdown, Pagination, Spin, Empty, Menu } from 'antd';
import dayjs from "dayjs";
import { useAllLogs } from "../AllLogsContext/AllLogsContext";
import LogsCountCards from "./LogsCountCards";



const AllLogs = () => {
    const { allLogsData, loading, fetchAllLogs } = useAllLogs();

    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 100;


        // HANDLE SEARCH INPUT AND DEBOUNCE 
        useEffect(() => {
            const handler = setTimeout(() => {
                setSearchTerm(inputValue.trimStart());
                setCurrentPage(1)
            }, 500); // debounce delay in ms
          
            return () => {
              clearTimeout(handler); // clear previous timeout on re-typing
            };
          }, [inputValue]);

        
        // FETCH STUDENTdATA OM MOUNT
        useEffect(() => {
            fetchAllLogs({  page: currentPage, pageSize, search: searchTerm, });
        },[searchTerm, currentPage]);
    

    return (
        <>
            <div className="w-auto pt-4 px-2 mt-10 darkmode">
                <LogsCountCards />
                <div className="relative w-full h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full px-4 py-3 text flex items-center justify-between font-semibold ">
                        <h1>All Logs</h1>

                        <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative">
                                <input  value={inputValue} type="text" id="table-search" placeholder="Search for items"
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className=" w-96 h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500" 
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <button onClick={() => {setInputValue(""); setSearchTerm("");}}>
                                {searchTerm ? (
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                                        </svg>
                                    )}
                                </button>
                                </div>
                            </div>
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
                            
                            ) : Array.isArray(allLogsData?.results) && allLogsData?.results.length > 0 ? (
                                allLogsData?.results.map((item, index) => (
                                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                        { (currentPage -1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                        {item.actor_first_name || item.actor}
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
                                        {dayjs(item.timestamp).format("DD/MM/YYYY | hh:mm A")}
                                    </td>
                                    {/* <td className="px-3 py-2 md:px-1">

                                    </td>
                                    <td className="px-3 py-2 md:px-1">
                                    
                                    </td>
                                    <td className="px-3 py-2 md:px-1">

                                    </td>
                                    <td className="px-3 py-2 md:px-1">

                                    </td>
                                    <td className="px-3 py-2 md:px-1">

                                    </td> */}
                                    {/* <td className="px-3 py-2 md:px-1">
                                        <Switch
                                            size="small"
                                            checkedChildren={<CheckOutlined />}
                                            unCheckedChildren={<CloseOutlined />}
                                            checked={studentStatuses[item.id] || false} // Get correct status per trainer
                                            onChange={(checked) => handleToggle(checked, item.id)}
                                            style={{
                                                backgroundColor: studentStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                            }}
                                        />
                                    </td> */}
                                    {/* <td > <Button 
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
                                            title="Delete the Student"
                                            description="Are you sure you want to delete this Student?"
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
                                    </td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                    <Empty description="No Students found" />
                                </td>
                            </tr>
                        )}
                            </tbody>
                            </table>
                        </div>
            
            <div className="flex justify-center items-center py-3 bg-slate-300">
            <Pagination
                    current={currentPage}
                    total={allLogsData?.count || 0}
                    pageSize={pageSize} // example: 10
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}    //  hide page size select
                    showQuickJumper={false}    //  hide quick jump input
                />
            </div>


                    </div>
                </div>
            </div>
        </>
    )
};


export default AllLogs;
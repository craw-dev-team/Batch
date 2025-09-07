import { useEffect, useState } from "react";
import { Button, message, Popconfirm, Avatar, Tooltip, Select, Tag, Dropdown, Pagination, Spin, Empty, Menu } from 'antd';
import dayjs from "dayjs";
import { useAllLogs } from "../AllLogsContext/AllLogsContext";
import LogsCountCards from "./LogsCountCards";
import SearchBar from "../../SearchInput/SearchInput";
import { useTheme } from "../../Themes/ThemeContext";



const AllLogs = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const { allLogsData, loading, fetchAllLogs } = useAllLogs();

    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 100;

        
        // FETCH STUDENTdATA OM MOUNT
        useEffect(() => {
            fetchAllLogs({  page: currentPage, pageSize, search: searchTerm, });
        },[searchTerm, currentPage]);


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
    

    return (
        <>
            <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
                <LogsCountCards />
                {/* <div className="relative w-full h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600"> */}
                    <div className={`w-full px-1 py-3 flex items-center justify-between font-semibold ${theme.text}`}>
                        <h1>All Logs</h1>

                        <label htmlFor="table-search" className="sr-only">Search</label>
                            <div className="relative">
                                <input  value={inputValue} type="text" id="table-search" placeholder="Search for log"
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className={`w-96 h-8 block p-2 pr-10 text-xs text-gray-600 font-medium ${theme.searchBg}`}
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

                    <div className={`overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm`}>
                        <div className="w-full h-[40rem] md:max-h-[40rem] 2xl:max-h-[40rem] overflow-y-auto rounded-xl pb-2">
                            <table className="w-full text-xs font-normal text-left text-gray-600">
                            <thead className="text-xs bg-white sticky top-0 z-10">
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
                                    <th scope="col" className="px-3 py-3 md:px-1 md:w-20 text-xs font-medium uppercase">
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
                            
                            ) : Array.isArray(allLogsData?.results) && allLogsData?.results.length > 0 ? (
                                allLogsData?.results.map((item, index) => (
                                <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                    <td scope="row" className="px-3 py-2 md:px-2">
                                        { (currentPage -1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-3 py-2 md:px-1 font-medium">
                                        {item.actor_first_name || item.actor}
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
                                        {dayjs(item.timestamp).format("DD/MM/YYYY hh:mm A")}
                                    </td>
                                    
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
            
            <div className="flex justify-center items-center mt-0 py-2 bg-gray-200/20">
                <Pagination
                    size="small"
                    current={currentPage}
                    total={allLogsData?.count || 0}
                    pageSize={pageSize} // example: 10
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}    //  hide page size select
                    showQuickJumper={false}    //  hide quick jump input
                />
            </div>


                    </div>
                {/* </div> */}
            </div>
        </>
    )
};


export default AllLogs;
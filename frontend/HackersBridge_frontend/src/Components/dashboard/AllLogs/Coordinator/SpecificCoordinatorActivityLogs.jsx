import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Empty } from 'antd';
import dayjs from "dayjs";
import { useSpecificCoordinator } from "../../Contexts/SpecificCoordinators";



const SpecificCoordinatorActivityLogs = () => {
    const { specificCoordinator, loading, fetchSpecificCoordinator } = useSpecificCoordinator();
    const { coordinatorId } = useParams();

    const { activity_logs } = specificCoordinator?.Coordinator_Info || [];
    

    useEffect(() => {        
        if (coordinatorId) {
            try {
                // Decode the ID before using it
                const originalCoordinatorId = atob(coordinatorId);

                // Fetch trainer data with the decoded ID
                fetchSpecificCoordinator(originalCoordinatorId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[]);

    console.log(specificCoordinator);
    
    
    
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
               
            ) : Array.isArray(activity_logs) && activity_logs.length > 0 ? (
                activity_logs.map((item, index) => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                        { index + 1}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(item.id)}>
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
                    <Empty description="No Coordinator Logs Found" />
                </td>
            </tr>
        )}
            </tbody>
            </table>
        </div>

        </div>
                </div>
            </div>
        </>
    )
};


export default SpecificCoordinatorActivityLogs;
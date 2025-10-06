import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty } from 'antd';
import dayjs from "dayjs";
import { useSpecificCoordinator } from "../../Contexts/SpecificCoordinators";
import { handleCoordinatorClick } from "../../../Navigations/Navigations";
import { useTheme } from "../../../Themes/ThemeContext";



const SpecificCoordinatorLogs = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const { specificCoordinator, loading, fetchSpecificCoordinator } = useSpecificCoordinator();
    const { coordinatorId } = useParams();

    const { coordinator_logs } = specificCoordinator?.Coordinator_Info || [];
    
    const navigate = useNavigate();

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

    
    
    return (
        <>
            <div className={`relative w-full px-4 pb-4 pt-2 mt-1 h-auto shadow-md rounded-xl ${theme.specificPageBg}`}>
                <div className={`w-full px-1 py-3 flex justify-between font-semibold ${theme.text}`}>
                    <h1>Logs</h1>
                </div>

                <div className="w-full h-auto md:max-h-[37rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2 bg-white/40">
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
                    
                ) : Array.isArray(coordinator_logs) && coordinator_logs.length > 0 ? (
                    coordinator_logs.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                        <td scope="row" className="px-3 py-2 md:px-2">
                            { index + 1}
                        </td>
                        <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleCoordinatorClick(navigate,item.action)}>
                            {item.actor}
                        </td>

                        <td className="px-3 py-2 md:px-1 font-normal">
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
                        <td className="px-3 py-2 md:px-1 font-normal">
                            {item.changes_text}
                        </td>


                        <td className="px-3 py-2 md:px-1 font-normal">
                            {item.content_type}
                        </td>

                        <td className="px-3 py-2 md:px-1 font-normal">
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
                        <Empty description="No Coordinator Logs Found" />
                    </td>
                </tr>
            )}
                </tbody>
                </table>
                </div>


            </div>
        </>
    )
};


export default SpecificCoordinatorLogs;
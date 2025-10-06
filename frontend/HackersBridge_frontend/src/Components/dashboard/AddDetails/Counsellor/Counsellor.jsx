import { useEffect, useState } from "react"
import { Button, Empty, message, Popconfirm, Switch, Spin, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import { useCounsellorForm } from "./CounsellorContext";
import AddCounsellorForm from "./AddCounsellorForm";
import axiosInstance from "../../api/api";
import { useTheme } from "../../../Themes/ThemeContext";





const Counsellor = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCounsellor, setSelectedCounsellor] = useState(); 
    const [isDeleted, setIsDeleted] = useState(false);
    const [counsellorStatuses, setCounsellorStatuses] = useState({}); // Store status per trainer

    const { counsellorData, loading, setCounsellorData, fetchCounsellors } = useCounsellorForm();

    // Fetch batches afer deletion or modal open
    useEffect(() => {
        fetchCounsellors();
        setIsDeleted(false);

        if (counsellorData) {
            // Ensure counsellor data exists and is an array
            const counsellorArray = Array.isArray(counsellorData)
                ? counsellorData
                : [];

            // Set a timeout to wait 2 seconds before initializing statuses
            const timer = setTimeout(() => {
                const initialStatuses = {};
                counsellorArray.forEach((counsellor) => {
                    initialStatuses[counsellor.id] = counsellor.status === "Active"; 
                });

                setCounsellorStatuses(initialStatuses); 
            }, 100);

            // Cleanup function to clear the timer if the component unmounts
            return () => clearTimeout(timer);
        }

    },[isDeleted, selectedCounsellor, isModalOpen, counsellorData])


     // Function to handle Edit button click 
     const handleEditClick = (counsellor) => {
        setSelectedCounsellor(counsellor);
        setIsModalOpen(true);
        setIsDeleted(false);
    };

     // Delete Function 
     const handleDelete = async (counsellorId) => {
        if (!counsellorId) return;

        try {
            const response = await axiosInstance.delete(`/api/counsellors/delete/${counsellorId}/`, 
                { headers: { 'Content-Type': 'application/json' },
                withCredentials : true
            }
            );

            if (response.status === 204) {
                // Make sure coursesData is an array before filtering
                if (Array.isArray(counsellorData)) {
                    setCounsellorData(prevcounsellor => prevcounsellor.filter(counsellor => counsellor.id !== counsellorId));
                } else {
                    console.error('counsellordata is not an array');
                }
            }
        } catch (error) {
            console.error("Error deleting counsellor:", error);
        }
    };

      // Confirm and Cancel Handler for delete button 
      const confirm = (counsellorId) => {
        handleDelete(counsellorId);
        message.success('counsellor Deleted Successfully');
    };

    const cancel = () => {
        message.error('counsellor Deletion Cancelled');
    };
    


    // Handle Toggle of counsellor active and inactive 
    const handleToggle = async (checked, counsellorId, counsellorEmail) => {
        const newStatus = checked ? "Active" : "Inactive";
        
        // Optimistically update UI before API call
        setCounsellorStatuses((prev) => ({ ...prev, [counsellorId]: checked }));
    
        try {
            await axiosInstance.put(`/api/counsellors/edit/${counsellorId}/`, 
                { status: newStatus, email: counsellorEmail },
                { headers: { 'Content-Type': 'application/json' },
                withCredentials : true
            }
            );
            message.success(`counsellor status updated to ${newStatus}`);
        } catch (error) {
            message.error("Failed to update status");
            // Revert UI if API fails
            setCounsellorStatuses((prev) => ({ ...prev, [counsellorId]: !checked }));
        }
    };




    return (
        <>
            <div className={`w-auto pt-4 px-4 mt-10 ${theme.bg}`}>
                {/* <div className="relative w-full h-full shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600"> */}
                <div className={`w-full px-1 py-3 flex items-center justify-between font-semibold ${theme.text}`}>
                    <h1>All Counsellors</h1>
                        <div>
                            <button onClick={() =>  { setIsModalOpen(true); setSelectedCounsellor(null); }} type="button" className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>Add counsellor +</button>
                        </div>
                    </div>

                    <div className={`overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm ${loading ? "backdrop-blur-md opacity-50 pointer-events-none" : ""}`}>
                        <div className="w-full h-[40rem] md:max-h-[35rem] 2xl:max-h-[40rem] overflow-y-auto rounded-xl pb-2">
                            <table className="w-full text-xs font-normal text-left text-gray-600">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr className="bg-gray-50/80">
                    
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            S.No
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Phone Number
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Email Address
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Week Off
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                            Action
                                        </th>
                                        
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="100%" className="text-center py-4">
                                            <Spin size="large" />
                                        </td>
                                    </tr>
                            
                                ) : counsellorData && Array.isArray(counsellorData) && counsellorData.length > 0 ? (
                                    counsellorData.map((item, index) => (    
                                        <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                        <td scope="row" className="px-3 py-2 md:px-2">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2 md:px-1 font-medium">
                                            {item.name}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.phone}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.email}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            {item.weekoff}
                                        </td>
                                        <td className="px-3 py-2 md:px-1">
                                            <Switch
                                                size="small"
                                                checkedChildren={<CheckOutlined />}
                                                unCheckedChildren={<CloseOutlined />}
                                                checked={counsellorStatuses[item.id] || false} // Get correct status per trainer
                                                onChange={(checked) => handleToggle(checked, item.id, item.email)}
                                                style={{
                                                    backgroundColor: counsellorStatuses[item.id] ? "#38b000" : "gray", // Change color when checked
                                                }}
                                            /> 
                                        </td>
                                        <td> 
                                            <Dropdown
                                                trigger={["click"]}
                                                placement="bottomRight"
                                                menu={{
                                                items: [
                                                    {
                                                    key: "edit",
                                                    label: (
                                                        <div
                                                        className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(item);   // Open form with selected counsellor data
                                                            setIsModalOpen(true);    // Open modal
                                                        }}
                                                        >
                                                        <EditOutlined /> Edit
                                                        </div>
                                                    ),
                                                    },
                                                    {
                                                    key: "delete",
                                                    label: (
                                                        <Popconfirm
                                                        title="Delete the Counsellor"
                                                        description="Are you sure you want to delete this Counsellor?"
                                                        onConfirm={() => confirm(item.id)}
                                                        onCancel={cancel}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        >
                                                        <div
                                                            className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-md text-red-500"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DeleteOutlined /> Delete
                                                        </div>
                                                        </Popconfirm>
                                                    ),
                                                    },
                                                ],
                                                }}
                                                >
                                                <MoreOutlined className="cursor-pointer text-lg p-2 rounded-full hover:bg-gray-200" />
                                            </Dropdown>
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="100%" className="text-center py-4 text-gray-500">
                                            <Empty description="No Counsellors found" />
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                {/* </div> */}

            <AddCounsellorForm isOpen={isModalOpen} counsellorData={selectedCounsellor|| {}} onClose={() => setIsModalOpen(false)} />

            </div>  

   </>
    )
}


export default Counsellor;
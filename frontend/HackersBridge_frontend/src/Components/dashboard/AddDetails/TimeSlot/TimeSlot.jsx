import React, {useState,useEffect} from "react";
import { useTimeSlotForm } from "./TimeSlotContext";
import TimeSlotForm from "./TimeSlotForm";
import { Button, Popconfirm, message } from "antd";
import {EditOutlined, DeleteOutlined} from  "@ant-design/icons";
import { useAuth } from "../../AuthContext/AuthContext";
import dayjs from "dayjs";
import axiosInstance from "../../api/api";
import { useTheme } from "../../../Themes/ThemeContext";

const TimeSlot = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState();
    const {timeSlotData, fetchTimeSlotData, loading, setLoading} = useTimeSlotForm();
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(()=>{
      fetchTimeSlotData();
    },[])

  const time = Array.isArray(timeSlotData) ? timeSlotData : [];
  

     // Function to handle Edit button click 
     const handleEditClick = (timeSlot) => {
        setSelectedTimeSlot(timeSlot);
        setIsModalOpen(true);
        setIsDeleted(false);
    };


      // Delete Function 
    const handleDelete = async (timeSlotId) => {
      try {
          const response = await axiosInstance.delete(`/api/timeslots/delete/${timeSlotId}/`);

          if (response.status === 204 || response.status === 200) {
              message.success("TimeSlot deleted successfully.");
              fetchTimeSlotData(); // Refresh after deletion
          }
      } catch (error) {
          if (error.response) {
              message.error("Delete failed: " + (error.response.data?.detail || "Server error"));
              console.error("Server Error Response:", error.response.data);
          } else if (error.request) {
              message.error("No response from server.");
          } else {
              message.error("Unexpected error occurred.");
          }
      }
};


     // Confirm and Cancel Handler for delete button 
      const confirm = (timeSlotId) => {
        handleDelete(timeSlotId);
        message.success('TimeSlot Deleted Successfully');
    };

    const cancel = () => {
        message.error('TimeSlot Deletion Cancelled');
    };



    return(
        <>
          <div className={`relative w-full h-full shadow-md rounded-xl p-4 mt-1 ${theme.specificPageBg}`}>
              <div className={`w-full px-1 py-3 flex justify-between items-center font-semibold ${theme.text}`}>
                <h1>All Time Slots</h1>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setSelectedTimeSlot(null);
                  }}
                  type="button"
                  className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}
                >
                  Add TimeSlot +
                </button>
              </div>

              <div className="overflow-y-auto h-[37rem] md:max-h-[36rem] 2xl:max-h-[37rem] bg-white/40 backdrop-blur-sm rounded-xl shadow-sm pb-2">
                <table className="w-full text-xs font-normal text-left text-gray-600">
                  <thead className="text-xs bg-white sticky top-0 z-10">
                    <tr className="bg-gray-50/80">
                      <th className="px-3 py-2 md:px-1 text-xs font-medium uppercase">S.No</th>
                      <th className="px-1 py-2 md:px-1 text-xs font-medium uppercase">Time</th>
                      <th className="px-1 py-2 md:px-1 text-xs font-medium uppercase">Prefered Week</th>
                      <th className="px-1 py-2 md:px-1 text-xs font-medium uppercase">Batch Type</th>
                      <th className="px-1 py-2 md:px-1 text-xs font-medium uppercase">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                    {time.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">No TimeSlots Found</td>
                      </tr>
                    ) : (
                      time.map((slot, index) => (
                        <tr key={slot.id} className="hover:bg-gray-50 transition-colors scroll-smooth">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-1 py-2 font-medium">
                            {slot.start_time} - {slot.end_time}
                          </td>
                          <td className="px-1 py-1">{slot.week_type}</td>
                          <td className="px-1 py-1 ">{slot.special_time_slot}</td>
                          <td className="px-1 py-1">
                            <Button
                              color="primary"
                              variant="filled"
                              className="rounded-xl w-auto pl-3 pr-3 py-0 my-1 mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(slot);
                                setIsModalOpen(true);
                              }}
                            >
                              <EditOutlined />
                            </Button>
                            <Popconfirm
                              title="Delete the TimeSlot"
                              description="Are you sure you want to delete this Time Slot?"
                              onConfirm={() => confirm(slot.id)}
                              onCancel={cancel}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                color="danger"
                                variant="filled"
                                className="rounded-xl w-auto px-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DeleteOutlined />
                              </Button>
                            </Popconfirm>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </div>

            <TimeSlotForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  timeSlotData={selectedTimeSlot || {}} />
        </>
        
    )
}

export default TimeSlot;
import React, { useEffect, useState } from "react";
import { useNotification } from "./NotificationContext";
import { Modal, Dropdown, Menu, message } from "antd";
import { MoreOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import CreateNotification from "../Notification/CreateNotification";
import BASE_URL from "../../../ip/Ip";
import dayjs from "dayjs";
import axiosInstance from "../api/api";
import { useTheme } from "../../Themes/ThemeContext";

const Notification = () => {
      // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------

  const { fetchNotification, notification } = useNotification();
  const [openCampaignModal, setOpenCampaignModal] = useState(false);

  useEffect(() => {
    fetchNotification();
  }, []);

  // const notificationList = notification || [];
  const notificationList = Array.isArray(notification) ? notification : [];

  console.log(notification)
  

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`push_notification/notification/${id}/delete/`);
      message.success("Notification Deleted Successfully");
      fetchNotification();
    } catch (error) {
      message.error("Failed to delete notification");
      console.error("Delete error:", error);
    }
  };

  // Dropdown menu with only Delete
  const getDropdownMenu = (notification) => (
    <Menu>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        onClick={() => handleDelete(notification.id)}
        style={{ color: '#ff4d4f' }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={`p-4 h-full w-full ${theme.bg}`}>
      <div className={`h-[80vh] md:h-[85vh] lg:h-[88vh] 2xl:max-h-[90vh] overflow-y-auto relative shadow-xs flex flex-col ${theme.cardBg}`}>
        {/* Header */}
        <div className={`flex justify-between items-center px-4 mt-12 mb-5 sticky top-0 left-0 z-10`}>
          <div className={`flex items-center gap-1 ${theme.text}`}>
              <h1 className={`text-base font-semibold`}>Notifications</h1> <span className="text-lg font-bold">({notificationList.length || 0})</span>
          </div>
          <button
            onClick={() => setOpenCampaignModal(true)}
            className={`${theme.createBtn} text-white px-4 py-2 rounded-lg hover:bg-green-700 transition`}
          >
            + Create Notification
          </button>
        </div>

        {/* Notification list */}
        <div className={`bg-white/40 h-auto rounded-lg shadow flex-1 overflow-y-auto`}>
          {notificationList.length === 0 ? (
            <p className="text-gray-500 p-4">No notifications available.</p>
          ) : (
            notificationList.map((not, index) => (
              <div
                key={not.id}
                className={`flex items-center gap-4 p-3  hover:bg-white cursor-pointer border-b border-gray-300 ${
                  index === notificationList.length - 1 ? "border-b-0" : ""
                }`}
              >
                {/* Circular image */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {not.image ? (
                    <img
                      src={
                        not.image.startsWith("http")
                          ? not.image
                          : `${BASE_URL.replace(/\/$/, "")}${not.image}`
                      }
                      alt={not.title || "Notification Image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">N/A</span>
                  )}
                </div>

                {/* Title */}
                <div className="flex-shrink-0 w-32">
                  <span className="text-sm font-medium text-gray-900 truncate block">
                    {not.title}
                  </span>
                </div>

                {/* Description + link */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate align-top">
                      {not.description}
                    </span>
                    </div>
                  </div>

                  <div className="flex flex-col w-32 items-start justify-start">
                    {/* Timestamp */}
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {dayjs(not.created_at).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                    {not.link && (
                      <a
                      href={not.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex-shrink-0 text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1 opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      >
                        <EyeOutlined size={16} />
                        View More
                      </a>
                    )}
                  </div>

                {/* Delete Dropdown */}
                <div className="flex-shrink-0">
                  <Dropdown
                    overlay={getDropdownMenu(not)}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      className="py-2 px-3 hover:bg-gray-200 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreOutlined />
                    </button>
                  </Dropdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for creating notification */}
        <Modal
          open={openCampaignModal}
          onCancel={() => setOpenCampaignModal(false)}
          footer={null}
          width={1000}
          destroyOnClose
          centered    
          >
          <CreateNotification  
            onClose={() => setOpenCampaignModal(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Notification;

import React, { useEffect, useState } from 'react';
import { Modal, Dropdown, message, Popconfirm } from 'antd';
import { NotificationOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { useAnnouncement } from './AnnouncementContext';
import CreateAnnouncementForm from './AnnouncementFormPage';
import axiosInstance from '../api/api';
import { useTheme } from '../../Themes/ThemeContext';
import { Form } from 'antd';
import dayjs from 'dayjs';

const AnnouncementPage = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


  const { Announcement, fetchAnnouncement } = useAnnouncement();
  const [announcementData, setAnnouncementData] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const [viewAnnouncement, setViewAnnouncement] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  useEffect(() => {
    setIsDeleted(false);
    fetchAnnouncement();
  }, [isDeleted]);

  const announcements = Announcement?.announcement || [];

  const handleOpenModal = () => setIsModalVisible(true);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setAnnouncementData(null);
  };

  const handleViewAnnouncement = (announcement) => {
    setViewAnnouncement(announcement);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (data) => {
    setAnnouncementData(data);
    handleOpenModal(true);
  };

  const handleDelete = async (announcementId) => {
    if (!announcementId) return;
    try {
      const response = await axiosInstance.delete(`/api/announcement/delete/${announcementId}/`, {
        headers: {
          'Content-Type': 'application/json',
         
        },
        withCredentials: true
      });

      if (response.status >= 200 && response.status <= 204) {
        message.success("Announcement deleted successfully");
        setIsDeleted(true);
        fetchAnnouncement();
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      message.error("Failed to delete announcement");
    }
  };

  const confirm = (announcementId) => {
    handleDelete(announcementId);
  };

  const cancel = () => {
    message.error('Announcement Deletion Cancelled');
  };

  return (
      <div className={`p-4 h-full w-full ${theme.bg}`}>

        <div className={`h-[80vh] md:h-[85vh] lg:h-[88vh] 2xl:max-h-[90vh] overflow-y-auto relative shadow-xs flex flex-col ${theme.cardBg}`}>
          {/* Header (sticky, not scrollable) */}
          <div className="flex justify-between items-center px-4 mt-12 mb-5 sticky top-0 left-0 z-10">
            <h1 className={`text-base font-semibold px-1 ${theme.text}`}>Announcements</h1>
            <button
              type="button"
              className={`text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-3 focus:ring-green-300 font-medium ${theme.createBtn}`}
              onClick={handleOpenModal}
            >
              Create Announcement
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="w-full overflow-y-auto flex-1 mx-auto space-y-4 px-4 py-2 border-t rounded-md">
        {announcements.length > 0 ? (
              announcements.map((ann, index) => (
                <div
                  key={index}
                  className={`flex items-start ${theme.bg} p-4 rounded-lg hover:shadow-lg border-2 transition-shadow w-full cursor-pointer`}
                  onClick={() => handleViewAnnouncement(ann)}
                >
                  <div className="mr-4 mt-1">
                    <NotificationOutlined className={`${theme.text} text-xl`} />
                  </div>

                  {/* Announcement Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className={`text-lg ${theme.text}`}>
                        {ann.subject || "No Subject"}
                      </h2>
                      <div className="flex items-end gap-1 mx-1">
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
                                      handleEditClick(ann);  // Open edit form
                                      isModalVisible(true);  // Open modal
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
                                    title="Delete the Announcement"
                                    description="Are you sure you want to delete this Announcement?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={(e) => {
                                        // prevent bubbling up to card click
                                        if (e?.stopPropagation) e.stopPropagation();
                                        confirm(ann.id);
                                      }}
                                      onCancel={(e) => {
                                        if (e?.stopPropagation) e.stopPropagation();
                                        cancel();
                                      }}
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
                          <MoreOutlined  onClick={(e) => e.stopPropagation()} className="cursor-pointer text-lg p-2 rounded-full hover:bg-gray-200" />
                        </Dropdown>
                      </div>
                    </div>

                    <div
                      className="text-gray-700 mb-2"
                      dangerouslySetInnerHTML={{ __html: ann.text || "No message available" }}
                    />

                    <p className="text-sm text-gray-500">
                      {ann.gen_time
                        // ? new Date(ann.gen_time).toLocaleString('en-US', {
                        //     year: 'numeric',
                        //     month: 'long',
                        //     day: 'numeric',
                        //     hour: '2-digit',
                        //     minute: '2-digit',
                        //   })
                        ? dayjs(ann.gen_time).format("MMMM D, YYYY [at] hh:mm A")
                        : "No date available"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No announcements available</p>
            )}
          </div>
        </div>


        {/* Create/Edit Modal */}
        <Modal
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={800}
          centered
          destroyOnClose
        >
          <CreateAnnouncementForm
            isOpen={handleOpenModal}
            onCancel={handleCloseModal}
            selectedAnnouncement={announcementData || {}}
          />
        </Modal>

        {/* View Announcement Modal */}
        <Modal
            title={
              <div className="text-lg font-semibold text-gray-800">
                Announcement Details
                <hr className="mt-2 border border-gray-300" />
              </div>
            }
            open={isViewModalOpen}
            onCancel={() => setIsViewModalOpen(false)}
            footer={null}
            width={1000}
            centered
            bodyStyle={{
              minHeight: '20vh',
              padding: '24px',
              backgroundColor: `${theme.specificPageBg}`,
              borderRadius: '12px',
            }}
          >
          {viewAnnouncement && (
            <div className="space-y-6">
              {/* Subject and Time */}
              <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md">
                <p className="text-base font-medium text-gray-800 uppercase tracking-wide">
                  {viewAnnouncement.subject || "No Subject"}
                </p>
                <p className="text-sm text-gray-500">
                  {viewAnnouncement.gen_time
                    ? new Date(viewAnnouncement.gen_time).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : "No date available"}
                </p>
              </div>

              {/* Message Content */}
              <div className="bg-white border h-44 border-gray-300 rounded-lg p-5 shadow-sm">
                <div
                  className="text-gray-700 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: viewAnnouncement.text || "No content available",
                  }}
                />
              </div>
            </div>
          )}
        </Modal>


      </div>
  );
};

export default AnnouncementPage;
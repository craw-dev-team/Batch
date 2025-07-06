import React, { useEffect, useState } from "react";
import { BsCheck2All,BsCheck2 } from "react-icons/bs";
import { Modal, Card, Typography, Tag, Tooltip } from "antd";
import {
  IdcardOutlined,
  UserOutlined,
  MailOutlined,
  PushpinOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useAllTickets } from "./TicketRaiseContext";
import TicketRaiseForm from "./TicketRaiseForm";
import dayjs from "dayjs";

const { Title } = Typography;


const AllTickets = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  
  const { ticketData, fetchTicketData, fetchTicketChat, ticketChat, sendTicketMessage, handleCloseTicket } = useAllTickets();
  
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  
  const selectedTicketId = ticketData?.tickets?.find((chat) => chat?.id === selectedTicket);
  const handleBack = () => setSelectedTicket(null);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  
  useEffect(() => {
    fetchTicketData();
  }, []);

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    fetchTicketChat(ticket.id);
    setChatModalVisible(true);
  };

  const handleCloseChatModal = () => {
    setChatModalVisible(false);
    setSelectedTicket(null);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    sendTicketMessage(selectedTicket.id, newMessage);
    setNewMessage("");
  };

  const tickets = Array.isArray(ticketData?.tickets)
    ? ticketData.tickets.map((t, index) => ({
        key: index + 1,
        id: t.id,
        ticketId: t.ticket_id,
        issue: t.issue_type,
        subject: t.title,
        status: t.status,
        description: t.message,
        createdAt: dayjs(t.created_at).format("DD/MM/YYYY | hh:mm A"),
      }))
    : [];

  const user = ticketData?.user_info || {};
  const update = ticketChat?.ticket_info || {};


  // Helper for colored status button this is for chats left section
  const getStatusColor = (status) => {
    switch (status) {
      case "Raise":
        return "bg-blue-500";
      case "In Progress":
        return "bg-green-500";
      case "Open":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };



  const renderSidebar = () => (
    <div className={`w-full md:w-1/3 border-r overflow-y-auto bg-gray-50 h-full transform transition-transform duration-500 ease-in-out`}>
      {selectedTicket && (
        <div className="m-1 p-3 md:bg-white md:rounded-md md:shadow-md text-base space-y-4">
          <div className="font-normal font-sans text-xl">
            Details
            <hr className="border-b border-gray-200"/>
          </div>
          {[
            {
              icon: <IdcardOutlined style={{ fontSize: "15px" }} />, label: "Ticket ID", value: `#${selectedTicket.ticketId || "N/A"}`,
            },
            {
              icon: <UserOutlined style={{ fontSize: "15px" }} />, label: "User Name", value: user.name || "N/A",
            },
            {
              icon: <MailOutlined style={{ fontSize: "15px" }} />, label: "User Email", value: user.email || "N/A",
            },
            {
              icon: <PushpinOutlined style={{ fontSize: "18px" }} />,
              label: "Ticket Status",
              value: (
                <span className={`text-white px-2 py-1 text-xs rounded ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              ),
            },
            {
              icon: <CalendarOutlined style={{ fontSize: "15px" }} />, label: "Created At", value: selectedTicket.createdAt,
            },
            {
              icon: <ClockCircleOutlined style={{ fontSize: "15px" }} />, label: "Last Updated", value: update.updated_at ? dayjs(update.updated_at).format("DD/MM/YYYY | hh:mm A") : "N/A",
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center text-sm text-gray-500">
              <div className="flex flex-col items-center justify-center mr-2 text-gray-500 text-base">
                {item.icon}
              </div>
              <div>
                <div className="font-medium text-gray-500">{item.label}</div>
                <div className="text-sm text-gray-800 font-semibold">{item.value}</div>
              </div>
            </div>
          ))}
          <div className="flex justify-start my-4">
        <button
          onClick={() => handleCloseTicket(selectedTicket?.id)}
          className={`w-full px-3 py-2 rounded-md ${selectedTicket?.status === "Closed" ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
          disabled={selectedTicket?.status === "Closed"}
        >
          {selectedTicket?.status === "Closed" ? "Closed" : "Close Ticket"}
        </button>
        </div>
      </div>
      )}

    </div>
  );

  return (
    <>
    {/* <div className=" py-2 bg-blue-200 h-fit w-full overflow-hidden"> */}
      <div className="md:p-4 p-2 bg-white rounded-md">
        <div className="flex justify-between items-center mb-4">
            <p className="2xl:text-lg lg:text-lg text-sm font-semibold">All Tickets</p>

           {/* VIEW button */}
          {/* <div className="relative ml-5 my-4">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-60 text-black bg-blue-100 font-medium ${isDropdownOpen ? 'rounded-t-lg' : 'rounded-lg'} text-sm px-5 py-2.5 flex justify-between items-center`}
            >
              VIEW
              <svg
                className="w-2.5 h-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {/* {isDropdownOpen && (
              <div className="absolute w-60 bg-zinc-50 rounded-b-lg shadow-lg border border-gray-200 z-50 transition-all duration-200">
                <ul className="p-3 space-y-1 text-sm text-gray-700">
                  {["Open", "Customer Reply", "Answered", "Closed"].map((label, index) => (
                    <li key={index}>
                      <div className="flex items-center p-2 rounded-sm hover:bg-gray-100">
                        <input
                          id={`checkbox-item-${index}`}
                          type="checkbox"
                          defaultChecked={label === "Customer Reply"}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`checkbox-item-${index}`}
                          className="w-full ms-2 text-sm font-medium text-gray-900"
                        >
                          {label}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          {/* </div>  */}
          <button
            onClick={showModal}
            className="bg-green-500 px-3 py-1 2xl:text-sm lg:text-sm text-xs text-white rounded hover:bg-green-600"
          >
            Raise Ticket
          </button>
        </div>

        <div className="overflow-auto rounded-md border border-gray-200 scrollbar-custom">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-green-200 uppercase text-gray-600 text-[10px] md:text-xs font-semibold tracking-wider">
              <tr>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">S.No</th>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">Ticket ID</th>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">Issue Type</th>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">Subject</th>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">Created At</th>
                <th className="2xl:px-4 px-1 py-2 border-b border-gray-200">Status</th>
                {/* <th className="px-4 py-3 border-b border-gray-200">Action</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id} 
                  onClick={()=>handleView(ticket)}
                  className="hover:bg-gray-50 cursor-pointer text-[10px] md:text-xs">
                    <td className="2xl:px-4 px-1 py-2">{ticket.key}</td>
                    <td className="2xl:px-4 px-1 py-2 font-medium">
                      <button onClick={() => handleView(ticket)} className="text-black">
                        {ticket.ticketId}
                      </button>
                    </td>
                    <td className="2xl:px-4 px-1 py-2">{ticket.issue}</td>
                    <td className="2xl:px-4 px-1 py-2">{ticket.subject}</td>
                    <td className="2xl:px-4 px-1 py-2">{ticket.createdAt}</td>
                    <td className="2xl:px-4 px-1 py-2">
                      <Tag color={ticket?.status === "Open" ? "green" : ticket?.status === "Your-Query" ? "blue" : ticket?.status === "Answered" ? "yellow" : ticket?.status === "Closed" ? "red" : ""}>
                        {ticket.status}
                      </Tag>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-5 text-center text-gray-500">
                    No tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    {/* </div> */}
     



        <div className="flex w-full flex-col md:flex-row">
          {/* Sidebar */}
          {isMobile ? (
            chatModalVisible && selectedTicket && (
              <div className="fixed top-0 left-0 w-full h-full max-h-[100dvh] bg-white z-50 flex flex-col">
                {/* Sidebar for mobile */}
                {showSidebar && (
                  <>
                    <div className="fixed top-0 left-0 h-full w-2/3 max-w-xs z-50 bg-white border-r shadow-lg transform transition-transform duration-300">
                      {renderSidebar()}
                    </div>
                    <div
                      className="fixed inset-0 bg-black bg-opacity-30 z-40"
                      onClick={() => setShowSidebar(false)}
                    />
                  </>
                )}

                {/* Chat Section */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center h-14 justify-between px-4 py-2 border-b border-gray-300 bg-white">
                      <ArrowLeftOutlined className="text-lg" onClick={handleBack} />
                      <h3 className="text-lg font-sans font-semibold">{`${selectedTicket?.ticketId}`}</h3>
                      <button onClick={() => setShowSidebar(true)}>
                        <InfoCircleOutlined className="text-lg"/>
                      </button>
                  </div>

                  <div className="flex-1 bg-gray-100 p-2 overflow-y-auto space-y-3">
                    {ticketChat?.all_message?.length > 0 ? (
                      ticketChat.all_message.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`max-w-[70%] px-3 py-2 rounded-md shadow-sm break-words ${
                            msg.sender === "student"
                              ? "ml-auto bg-green-400 text-white text-left"
                              : "mr-auto bg-white text-black text-left"
                          }`}
                          style={{ width: 'fit-content' }}
                        >
                          <div>{msg.message}</div>
                          <div className={`text-[11px] mt-1 ${msg.sender === "student" ? "text-gray-200" : "text-gray-500"}`}>
                            {dayjs(msg.gen_time).isValid() ? dayjs(msg.gen_time).format("hh:mm A") : "N/A"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">No messages yet.</div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="px-3 py-1 flex gap-2 border-t border-gray-200">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border rounded-full py-1 px-3 focus:ring-0 hover:border-green-500 focus:border-green-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                      <button
                        onClick={handleSendMessage}
                        className="bg-green-400 text-white px-3 py-2 rounded-full hover:bg-green-500"
                      >
                        <SendOutlined />
                      </button>
                  </div>
                </div>
              </div>
            )
            ) : (
              <Modal
                open={chatModalVisible}
                onCancel={handleCloseChatModal}
                footer={null}
                width={isMobile ? "100%" : 900}
                // bodyStyle={{ height: "calc(100vh - 100px)", padding: 0 }}
                title="Ticket Chat"
                closable
                style={{ top: isMobile ? 5 : 50 }}
                styles={{
                  body: {
                    height: isMobile ? "100vh" : "calc(100vh - 200px)",
                    padding: 0,
                  },
                }}
              >
                <div className="flex h-full w-full flex-col md:flex-row overflow-hidden">
                  {/* Sidebar */}
                  {renderSidebar()}

                  {/* Chat Section */}
                  <div className="w-full md:w-2/3 p-2 flex flex-col overflow-hidden ">
                    {selectedTicket ? (
                      <>
                        <div className="mb-2 font-semibold font-sans text-lg bg-white">
                          {selectedTicket.subject}
                          <hr className="border-gray-400" />
                        </div>

                        <div className="flex-1 bg-gray-50 p-2 overflow-y-auto space-y-3 scrollbar-custom">
                          {ticketChat?.all_message?.length > 0 ? (
                            ticketChat.all_message.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`max-w-[70%] px-3 py-2 rounded-xl shadow break-words ${
                                  msg.sender === "student"
                                    ? "ml-auto bg-green-400 text-white text-left"
                                    : "mr-auto bg-white text-black text-left"
                                }`}
                                style={{ width: 'fit-content' }}
                              >
                                <div>{msg.message}</div>
                                <div className={`text-[11px] mt-1 ${msg.sender === "student" ? "text-gray-200" : "text-gray-500"}`}>
                                  {dayjs(msg.gen_time).isValid() ? dayjs(msg.gen_time).format("hh:mm A") : "N/A"}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500">No messages yet.</div>
                          )}
                        </div>

                        {/* Message Input */}
                        <div className="p-2 flex gap-2 border-t">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border rounded-full py-1 px-3 focus:ring-0 hover:border-green-500 focus:border-green-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                            <button
                              onClick={handleSendMessage}
                              className="bg-green-400 text-white px-3 py-2 rounded-full hover:bg-green-500"
                            >
                          <Tooltip title="Send Message" placement="top">
                              <SendOutlined />
                          </Tooltip>
                            </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 flex-1 flex items-center justify-center">
                        Select a ticket to start messaging
                      </div>
                    )}
                  </div>
                </div>
              </Modal>
          )}
        </div>


      <Modal 
        open={isModalVisible}
        onCancel={hideModal}
        footer={null}
        destroyOnClose
        width="95%"
        centered
        styles={{
          body: { padding: 0, maxHeight: '100vh', overflowY: 'auto' },
        }}
        style={{ maxWidth: 800, margin: "0", padding: "0" }}
      >
        <TicketRaiseForm onCancel={hideModal} />
      </Modal>
    </>
  )
};

export default AllTickets;

import React, { useEffect, useState, useRef } from "react";
import { useTickets } from "./TicketContext";
import { Modal, Card, Typography, Tag } from "antd";
import {
  IdcardOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { BsCheck2All } from "react-icons/bs";
import dayjs from "dayjs";

const { Title } = Typography;




const TicketOperation = () => {
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [update, setUpdate] = useState({});

  const { ticketData, fetchTicketData, fetchChat, ticketChat, sendTicketMessage  } = useTickets();

  // ref to make the chat scroll to end by default 
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [ticketChat?.all_message]);



  useEffect(() => {
    fetchTicketData();
  }, []);

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    fetchChat(ticket.id);
    setChatModalVisible(true);
    setUpdate({ updated_at: ticket.updated_at });
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

  const handleCloseTicket = (ticketId) => {
    // your ticket closing logic here
    console.log("Closing ticket:", ticketId);
  };

  const renderStatusTag = (status) => {
    const colorMap = {
      Open: "green",
      // "Re-Open": "orange",
      Closed: "red",
      Answered: "blue",
      "Customer-Reply": "purple",
    };
    return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
  };

  const tickets = ticketData?.tickets || [];
  const user = selectedTicket?.user_info || {};


   // Group messages by date
  // Get today's and yesterday's dates
  const today = dayjs().format('DD/MM/YYYY');
  const yesterday = dayjs().subtract(1, 'day').format('DD/MM/YYYY');

  // Group messages by date
  const groupedMessages = ticketChat?.all_message?.length > 0
    ? ticketChat.all_message.reduce((acc, msg) => {
        const date = dayjs(msg.gen_time).format('DD/MM/YYYY');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(msg);
        return acc;
      }, {})
    : {};

  // Get sorted dates (earliest to latest)
  const sortedDates = Object.keys(groupedMessages).sort((a, b) =>
    dayjs(a, 'DD/MM/YYYY').diff(dayjs(b, 'DD/MM/YYYY'))
  );

  // Function to get display label for date
  const getDateLabel = (date) => {
    if (date === today) return 'Today';
    if (date === yesterday) return 'Yesterday';
    return date;
  };


  return (
      <>
        <div className="w-auto  px-2 pt-10 h-full overflow-y-hidden darkmode">

          <Card style={{ margin: "0px" }}>
            <div className="flex justify-between items-center mb-4">
              <Title level={5} className="!mb-0">
                All Tickets
              </Title>
            </div>

            <div className="overflow-auto rounded-md border border-gray-200">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-blue-50 uppercase text-gray-600 text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200">S.No</th>
                    <th className="px-4 py-3 border-b border-gray-200">Ticket ID</th>
                    <th className="px-4 py-3 border-b border-gray-200">Issue Type</th>
                    <th className="px-4 py-3 border-b border-gray-200">Subject</th>
                    <th className="px-4 py-3 border-b border-gray-200">Created At</th>
                    <th className="px-4 py-3 border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.length > 0 ? (
                    tickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleView(ticket)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-semibold">{ticket.ticket_id}</td>
                        <td className="px-4 py-3">{ticket.issue_type}</td>
                        
                        <td className="px-4 py-3 font-semibold">
                          <button
                            onClick={() => handleView(ticket)}
                            className="text-black "
                          >
                            {ticket.title}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {dayjs(ticket.created_at).format("DD/MM/YYYY | hh:mm A")}
                        </td>
                        <td className="px-4 py-3">{renderStatusTag(ticket.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-5 text-center text-gray-500">
                        No tickets available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>


      <Modal
        open={chatModalVisible}
        onCancel={handleCloseChatModal}
        footer={null}
        width={1100}
        bodyStyle={{ height: "600px", padding: "0" }}
        title="Ticket Chat"
      >
        <div className="flex w-full h-full border rounded overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-1/4 border-r overflow-y-auto bg-gray-100">
            {selectedTicket && (
              <div className="m-1 p-3 h-auto bg-white rounded-md shadow-md text-base space-y-4">
                {[
                  {
                    icon: <IdcardOutlined style={{ fontSize: "15px" }} />,
                    label: "Ticket ID",
                    value: `#${selectedTicket.ticket_id}`,
                  },
                  {
                    icon: <UserOutlined style={{ fontSize: "15px" }} />,
                    label: "User Name",
                    value: user.name || "N/A",
                  },
                  {
                    icon: <MailOutlined style={{ fontSize: "15px" }} />,
                    label: "User Email",
                    value: user.email || "N/A",
                  },
                  {
                    icon: <CalendarOutlined style={{ fontSize: "15px" }} />,
                    label: "Created At",
                    value: selectedTicket.created_at
                      ? dayjs(selectedTicket.created_at).format("DD/MM/YYYY | hh:mm A")
                      : "N/A",
                  },
                  {
                    icon: <ClockCircleOutlined style={{ fontSize: "15px" }} />,
                    label: "Last Updated",
                    value: update.updated_at
                      ? dayjs(update.updated_at).format("DD/MM/YYYY | hh:mm A")
                      : "N/A",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-[12px] text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center mr-2 text-gray-500 text-base">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">{item.label}</div>
                      <div className="text-sm text-gray-800 font-semibold">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
                
              
              <div className="flex justify-start my-4">
                    <button
                      onClick={() => handleCloseTicket(selectedTicket?.id)}
                      className={`px-3 py-2 w-full rounded-md ${
                        selectedTicket?.status === "Closed"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                      disabled={selectedTicket?.status === "Closed"}
                    >
                      {selectedTicket?.status === "Closed"
                        ? "Closed"
                        : "Close Ticket"}
                    </button>
              </div>

              </div>
              
            )}

          </div>

          {/* Right Chat Section */}
          <div className="w-3/4 p-2 flex flex-col">
            {selectedTicket ? (
              <>
                <div className="mb-2 font-semibold font-sans text-lg">
                  {selectedTicket.title}
                  <hr className="border-gray-400" />
                </div>

                <div
                  ref={chatContainerRef}
                  className="flex-1 bg-gray-100 p-1 rounded shadow-inner overflow-y-auto space-y-3"
                >
                  {ticketChat?.all_message?.length > 0 ? (
                    sortedDates.map((date) => (
                      <div key={date} className="flex flex-col">
                        {/* Centered Date Header */}
                        <div className="text-center text-sm text-gray-500 my-2">
                          {getDateLabel(date)}
                        </div>
                        {/* Messages for this date */}
                        {groupedMessages[date].map((msg, idx) => (
                          <div
                            key={idx}
                            className={`max-w-[53%] px-2 py-2 mt-1 rounded-md shadow-sm ${
                              msg.sender === "admin"
                                ? "ml-auto bg-darkBlue6 text-white text-right"
                                : "mr-auto bg-white text-black text-left"
                            }`}
                            style={{ width: 'fit-content' }}
                          >
                            <div className="text-md break-words">{msg.message}</div>
                            <div
                              className={`text-[11px] ${
                                msg.sender === "admin" ? "text-slate-100" : "text-gray-500"
                              }`}
                            >
                              {dayjs(msg.gen_time).isValid()
                                ? dayjs(msg.gen_time).format("hh:mm A")
                                : "N/A"}
                            </div>
                            {/* {msg.sender === "admin" && (
                              <div className="text-[11px] mt-1 flex justify-end items-center gap-1">
                                <BsCheck2All
                                  className={`${
                                    msg.message_status === "Open" ? "text-blue-500" : "text-white"
                                  } text-[18px]`}
                                />
                              </div>
                            )} */}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No messages yet.
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 border-1 rounded-3xl px-3 py-1 focus:ring-0"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // prevent new line if using textarea in future
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-darkBlue6 text-white px-3 py-2 rounded-full hover:bg-darkBlue6"
                  >
                    <SendOutlined />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                Select a ticket from the left to view chat.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TicketOperation;

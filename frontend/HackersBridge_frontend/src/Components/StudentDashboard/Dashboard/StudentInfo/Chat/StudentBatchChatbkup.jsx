import React, { useState, useEffect, useRef } from "react";
import {
  SendOutlined,
  PaperClipOutlined,
  MoreOutlined,
  PushpinOutlined,
  FileImageOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Dropdown, Empty, Menu } from "antd";
import useStudentBatchChat from "./StudentBatchChatFunctions";
import dayjs from "dayjs";




const StudentBatchChat = () => {
  const isMobile = window.innerWidth < 768; // you could improve this with a responsive hook
  // const [selectedBatch, setSelectedBatch] = useState(1);
  const [message, setMessage] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);

    //websockeand batch chat list 
    const { batchChatList, fetchStudentBatchChatList, ws, batchChatMessage, connectWebSocket, sendMessage } = useStudentBatchChat();
    const [chatListTab, setChatListTab] = useState("");
    const [combinedMessages, setCombinedMessages] = useState([]);
    // for Search functionality from backend basis of tabs (All, Ongoing, Archieved)
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    
    const messagesEndRef = useRef(null);

  const selectedChat = batchChatList?.all_batch_chats.find((chat) => chat.batch_id === selectedChatId);
  // for back button 
  const handleBack = () => setSelectedChatId(null);


    const handleChatTab = (tab) => {
      setChatListTab(tab);
    };



    useEffect(() => {
      fetchStudentBatchChatList({ search: searchTerm, batch__status: chatListTab });
    },[searchTerm, chatListTab]);


    // HANDLE SEARCH INPUT AND DEBOUNCE 
    useEffect(() => {        
        const handler = setTimeout(() => {
            setSearchTerm(inputValue.trimStart());
        }, 500); // debounce delay in ms
        
        return () => {
            clearTimeout(handler); // clear previous timeout on re-typing
        };
    }, [inputValue]);

  


  useEffect(() => {
      connectWebSocket(selectedChat?.batch_id);
    //   if (selectedChat?.batch_id) {
    //   setUnreadCounts((prev) => {
    //     const updated = { ...prev };
    //     delete updated[selectedChat.batch_id];
    //     return updated;
    //   });
    // }
  
      return () => {
        // Automatically disconnected in context cleanup
      };
  }, [selectedChat]);


    //  UPdate the message coming from web sockets
    useEffect(() => {
      if (!batchChatMessage || !selectedChat) return;
  
      const messages = batchChatMessage.messages || [];
  
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        text: msg.message,
        time: msg.gen_time,
        isSelf: msg.isSelf,
        senderName: msg.send_by,
        senderRole: msg.sender,
        type: "text",
      }));
  
      formattedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
      setCombinedMessages(formattedMessages);
    }, [batchChatMessage, selectedChat]);


      useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, [combinedMessages]);
    


      const handleBatchClick = (batch) => {
        setSelectedChatId(batch);
        // setCombinedMessages([]); 
        connectWebSocket(batch.batch_id); 
        
        // this will show badge of incomming messages in chat list 
        // setUnreadCounts((prev) => ({
        //   ...prev,
        //   [batch.batch_id]: 0,
        // }));
      };

      const isToday = (date) => {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      };

      const isYesterday = (date) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
          date.getDate() === yesterday.getDate() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getFullYear() === yesterday.getFullYear()
        );
      };


      const groupMessagesByDate = (messages) => {
        return messages.reduce((acc, message) => {
          const msgDate = new Date(message.time);
          let label = msgDate.toDateString();
          
          if (isToday(msgDate)) label = "Today";
          else if (isYesterday(msgDate)) label = "Yesterday";
          
          if (!acc[label]) acc[label] = [];
          acc[label].push(message);
          return acc;
        }, {});
      };
      
      const groupedMessages = groupMessagesByDate(combinedMessages);


      const handleSend = () => {
        if (!message.trim() || !selectedChat || !ws.current) return;

        if (ws.current.readyState !== WebSocket.OPEN) {
          message.error("Connection lost. Please wait for reconnection.");
          return;
        }

        const trimmedMessage = message.trim();
        setMessage(""); // Clear input
        sendMessage(selectedChat.batch_id, trimmedMessage); // Fire and let history update UI
      };



      function truncateText(text, maxLength = 50) {
        if (!text) return "";
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
      }


  const menu = (msgText) => (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <div onClick={() => handlePinMessage(msgText)}>
              <PushpinOutlined className="mr-2" /> Pin Message
            </div>
          ),
        },
      ]}
    />
  );



  return (
  
    <div className="fixed col-span-6 w-full h-screen shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden overflow-y-auto">
      <div className="pt-0 col-span-6 w-full h-[calc(100vh-50px)] shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden">
        {/* Full height container below navbar */}
         <div className="h-full w-full max-w-full flex flex-col md:flex-row">

          {/* Sidebar Chat List */}
          <div
            className={`bg-white border-r sm:p-0 transition-all duration-300 flex flex-col
              ${isMobile && selectedChatId ? "hidden" : "flex"}
              w-full md:basis-1/4 lg:basis-[25%] xl:basis-[27%] 2xl:basis-[30%] max-w-full`}
            > 
            <div className={`${isMobile ? 'sticky top-0 z-50' : ''} bg-white p-0`}>
              <h2 className={`text-lg font-semibold border-b bg-green-200 ${isMobile ? 'px-2 py-2' : "p-4"}`}>Chat</h2>
              {/* for search batch chat list  */}
              <div className="px-1 py-2">
                <div className="relative">
                  <input value={inputValue} type="text" id="table-search" placeholder="Search Batch"
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-green-400" 
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button onClick={() => {setInputValue(""); setSearchTerm("");}}>
                  {searchTerm ? (
                          <svg className="w-5 h-5 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                          </svg>
                      ) : (
                          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                          </svg>
                      )}
                  </button>
                  </div>
                </div>
              </div>

                {/* tabs for filtering batchchat list based on status (all, Ongoing, completed) */}
                <div className="px-4 py-1 text-md font-semibold border-b border-gray-300 flex justify-between items-center">
                  <p>Messages</p>
                    <div className="relative z-10">
                      <button
                          onClick={() => handleChatTab("")}
                          className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200  
                              ${chatListTab === "" ? 'border-b-2 border-green-400 text-green-600 bg-white' : ' text-gray-700 hover:border-b-2 hover:border-green-400'}`}
                      >
                      All
                      </button> 

                      <button
                          onClick={() => handleChatTab("Running")}
                          className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 
                              ${chatListTab === "Running" ? 'border-b-2 border-green-400 text-green-600 bg-white' : ' text-gray-700 hover:border-b-2 hover:border-green-400'}`}
                      >
                      Ongoing
                      </button>
                      
                      <button
                          onClick={() => handleChatTab("Completed")}
                          className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 
                              ${chatListTab === "Completed" ? 'border-b-2 border-green-400 text-green-600 bg-white' : ' text-gray-700 hover:border-b-2 hover:border-green-400'}`}
                      >
                      Archieved
                      </button>
                                  
                  </div>
                </div>

            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y scrollbar-custom">
              {batchChatList?.all_batch_chats.length > 0 ? (
                batchChatList?.all_batch_chats.map((batch) => (
                <div
                  key={batch.batch_id}
                  onClick={() => handleBatchClick(batch.batch_id)}
                  className={`p-4 pl-6 cursor-pointer hover:bg-green-50 relative ${batch.batch_id === selectedChatId ? "bg-green-200" : "" } `}
                  >
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex justify-between mb-0.5">
                        <p className="text-xs font-semibold text-gray-500" >{batch?.batch_code}</p>
                        <p className="text-xs text-gray-500 "> {batch?.last_message?.time}</p>
                      </div>
                      {/* <div className="flex items-center space-x-2"> 
                      <div className="rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                          {batch.batch_name.charAt(0).toUpperCase()}
                      </div>  */}
                      {/* </div>  */}
                      <p className="text-sm font-semibold text-black">{batch?.batch_name}</p>
                      <p className="text-sm text-gray-600 relative top-2">
                        <span className="font-medium">{batch?.last_message?.send_by}</span>:{" "}
                        {truncateText(batch?.last_message?.message, 50)}
                      </p>
                    </div>
                  </div>

                  {/* {unreadCounts[batch.batch_id] > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                      +{unreadCounts[batch.batch_id]}
                    </span>
                  )} */}

                  <span
                    className={`h-2 w-2 rounded-full absolute top-6 left-2 inline-block ${
                    batch?.batch_status?.toLowerCase() == "green"
                        ? "bg-green-500"
                        : batch?.batch_status?.toLowerCase() == "yellow"
                        ? "bg-yellow-300"
                        : batch?.batch_status?.toLowerCase() == "red"
                        ? "bg-red-600"
                        : "bg-gray-400"
                    }`}
                  />

                </div>
              ))
              ) : (
                <div className="p-4 text-gray-500 text-center">
                  <Empty description="No Batches found" />
                </div>
              )}
            </div>
          </div>

          {/* Chat Content Panel */}
          <div
            className={`bg-gray-50 flex flex-col overflow-hidden p-0
              ${isMobile && !selectedChatId ? "hidden" : "flex"}
              w-full md:basis-[55%] lg:basis-[59%] xl:basis-[59%] 2xl:basis-[60%] max-w-full`}
          >

            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className={`flex items-center justify-between p-4 border-b bg-green-200 ${isMobile ? 'px-2 py-2' : "p-4"}`}>
                  {isMobile && (
                    <button onClick={handleBack}>
                      <ArrowLeftOutlined className="mr-2" />
                    </button>
                  )}
                  <h3 className="text-md lg:text-lg font-sans font-semibold">{selectedChat.batch_code}</h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-2 pb-[80px] md:pb-2" id="chat-message-panel">
                    {Object.keys(groupedMessages).length > 0 ? (
                      Object.entries(groupedMessages).map(([dateLabel, msg], i) => (
                      // <div
                      //   key={i}
                      //   className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"}`}
                      // >
                      <div key={i}>
                        <p className="text-center text-gray-500 text-xs font-normal mb-4">
                          {dateLabel}
                        </p>

                        {msg.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex mb-3 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] relative rounded-xl px-4 py-2 shadow cursor-pointer ${
                              msg.isSelf ? "bg-green-500 text-white" : "bg-[#f8f9fa] text-black"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMsgId(msg.id);
                            }}
                          >
                            {!msg.isSelf  && msg.senderName && (
                              <div className="font-semibold font-sans text-xs mb-1">
                                {msg.senderRole === "admin" || "coordinator" ? "Craw Support" : msg.senderName}
                              </div>
                            )}

                            {msg.type === "image" ? (
                              <img
                                src={msg.fileUrl}
                                alt={msg.text}
                                className="max-w-full max-h-48 rounded"
                              />
                            ) : msg.type === "file" ? (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-blue-600 hover:text-blue-800"
                              >
                                📎 {msg.text}
                              </a>
                            ) : (
                              <div className="text-sm break-words">{msg.text}</div>
                            )}

                            <div
                              className={`text-xs text-right mt-1 ${
                                msg.isSelf ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {dayjs(msg.time).format("hh:mm A")}
                            </div>

                            {/* {(selectedMsgId === msg.id &&
                              (msg.senderName || userRole === "admin" || userRole === "coordinator")) && (
                              <Popover
                                content={deletePopoverContent(msg.id)}
                                trigger="click"
                                visible={visiblePopover === msg.id}
                                onVisibleChange={(visible) =>
                                  setVisiblePopover(visible ? msg.id : null)
                                }
                                placement="topRight"
                              >
                                <div
                                  className="absolute right-0 top-0 bg-white border text-red-600 text-xs px-2 py-1 rounded shadow cursor-pointer hover:bg-red-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DeleteOutlined />
                                </div>
                              </Popover>
                            )} */}
                          </div>
                        </div>
                      ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-2 text-sm">No messages</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Section */}
                {/* <div className="p-4 border-t flex items-center gap-2 w-auto bg-orange-400 md:static fixed bottom-0 left-0 right-0 z-10 md:z-auto">
                  <input
                    type="text"
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none w-full"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="shrink-0 bg-green-500 text-white px-4 py-2 rounded-full">
                    Send
                  </button>
                </div> */}

                <div className={`w-full flex items-center gap-2 border-t bg-white px-3 py-2 fixed bottom-0 left-0 right-0 z-50 md:static md:border-t-0`}
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                  >
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-0 focus:border-green-500"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => {
                          // Scroll to latest message when typing starts (especially on mobile)
                          setTimeout(() => {
                            const msgPanel = document.getElementById("chat-message-panel");
                            if (msgPanel) {
                              msgPanel.scrollTo({ top: msgPanel.scrollHeight, behavior: "smooth" });
                            }
                          }, 300);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                    </div>
                    <button
                      className="shrink-0 bg-green-500 text-white px-3 py-2 rounded-full"
                      onClick={handleSend}
                    >
                      <SendOutlined />
                    </button>
                </div>

              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default StudentBatchChat;


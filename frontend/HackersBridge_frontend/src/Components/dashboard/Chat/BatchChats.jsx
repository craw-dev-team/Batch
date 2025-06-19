import React, { useEffect, useRef, useState } from "react";
import { SendOutlined, LinkOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { Popover, Button } from "antd";
import { useBatchChats } from "./BatchChatsContext";
import dayjs from "dayjs";

const BatchChats = () => {
  const { fetchChats, chat, wsMessages, allChats, ws, sendMessage, connectWebSocket, unreadCounts, setUnreadCounts } = useBatchChats();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [message, setMessage] = useState("");
  const [combinedMessages, setCombinedMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [visiblePopover, setVisiblePopover] = useState(null);

  const [chatTab, setChatTab] = useState("");
  // for Search functionality from backend basis of tabs (All, Ongoing, Archieved)
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');

  const userRole = "admin";
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);



   const handleChatTab = (tab) => {
        setChatTab(tab);
    };



  useEffect(() => {
    connectWebSocket(selectedBatch?.batch_id);
    if (selectedBatch?.batch_id) {
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[selectedBatch.batch_id];
      return updated;
    });
  }

    return () => {
      // Automatically disconnected in context cleanup
    };
  }, [selectedBatch]);


  useEffect(() => {
    fetchChats({ search: searchTerm, batch__status: chatTab });
  }, [searchTerm, chatTab]);

     // HANDLE SEARCH INPUT AND DEBOUNCE 
    useEffect(() => {        
        const handler = setTimeout(() => {
            setSearchTerm(inputValue.trimStart());
        }, 500); // debounce delay in ms
        
        return () => {
            clearTimeout(handler); // clear previous timeout on re-typing
        };
    }, [inputValue]);



  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setCombinedMessages([]); // Optional: clear previous chat messages
    connectWebSocket(batch.batch_id); // This will trigger message fetch via WS
    
    // this will show badge of incomming messages in chat list 
    setUnreadCounts((prev) => ({
      ...prev,
      [batch.batch_id]: 0,
    }));
  };


  //  UPdate the message coming from web sockets
  useEffect(() => {
    if (!wsMessages || !selectedBatch) return;

    const messages = wsMessages.messages || [];

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      time: msg.gen_time,
      isSelf: msg.isSelf,
      senderName: msg.send_by,
      senderRole: msg.sender ? msg.sender : "CRAW Support",
      type: "text",
    }));

    formattedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
    setCombinedMessages(formattedMessages);
  }, [wsMessages, selectedBatch]);



  //  This will update the badge on chat to show unread messages count 
  useEffect(() => {
  if (!wsMessages || !Array.isArray(wsMessages)) return;

  const lastMessage = wsMessages[wsMessages.length - 1];

  if (
    lastMessage?.type === "chat" &&
    lastMessage?.batch_id !== selectedBatch?.batch_id
  ) {
    setUnreadCounts((prev) => ({
      ...prev,
      [lastMessage.batch_id]: (prev[lastMessage.batch_id] || 0) + 1,
    }));
  }
}, [wsMessages]);



  
//   useEffect(() => {
//     if (!wsMessages || !selectedBatch) return;

//     const messages = wsMessages?.messages || [];

//     const formattedMessages = messages.map((msg) => ({
//       id: msg.id,
//       text: msg.message,
//       time: msg.gen_time,
//       isSelf: msg.sender,
//       senderName: msg.send_by ,
//       type: "text",
//     }));
//     console.log("formattedMessages:", formattedMessages);
    
//     formattedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

//        setCombinedMessages(formattedMessages);

//   }, [wsMessages, selectedBatch]);


// useEffect(() => {
//   // Clear messages when switching to a different batch
//   setCombinedMessages([]);
// }, [selectedBatch]);




  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [combinedMessages]);


  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedMsgId(null);
      setVisiblePopover(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);



 const handleSend = () => {
  if (!message.trim() || !selectedBatch || !ws.current) return;

  if (ws.current.readyState !== WebSocket.OPEN) {
    message.error("Connection lost. Please wait for reconnection.");
    return;
  }

  const trimmedMessage = message.trim();
  setMessage(""); // Clear input
  sendMessage(selectedBatch.batch_id, trimmedMessage); // Fire and let history update UI
};




  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedBatch) {
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith("image/") ? "image" : "file";

      setCombinedMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          text: file.name,
          time: new Date().toISOString(),
          isSelf: true,
          senderName: null,
          type: fileType,
          fileUrl,
        },
      ]);

      e.target.value = "";
    }
  };

  const handleLinkClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteMessage = (id) => {
    setCombinedMessages((prev) => prev.filter((msg) => msg.id !== id));
    setSelectedMsgId(null);
    setVisiblePopover(null);
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
  console.log(combinedMessages);



  const deletePopoverContent = (msgId) => (
    <div className="flex flex-col space-y-2">
      <p>Are you sure you want to delete this chat?</p>
      <div className="flex space-x-2">
        <Button
          type="primary"
          danger
          size="small"
          onClick={() => {
            handleDeleteMessage(msgId);
          }}
        >
          Yes
        </Button>
        <Button
          size="small"
          onClick={() => setVisiblePopover(null)}
        >
          No
        </Button>
      </div>
    </div>
  );

  // Filter batches based on search query (batch_id or batch_code, case-insensitive)
  // const filteredBatches = Array.isArray(chat?.all_batch_chats) && chat?.all_batch_chats.filter((batch) => {
  //   if (!searchQuery) return true;
  //   const query = searchQuery.toLowerCase();
  //   return (
  //     batch.batch_id.toString().includes(query) ||
  //     batch.batch_code.toLowerCase().includes(query) ||
  //     batch.batch_name.toLowerCase().includes(query) 
  //   );
  // }) || [];


  return (
    <div className="sticky top-0 left-0 shadow-md border h-fit w-full overflow-hidden">
      <div className="pt-10 w-full h-[50rem] flex mx-2 my-4 rounded-sm">
        <div className="w-[30rem] border-r bg-white flex flex-col p-1">
          <h2 className="text-base font-semibold p-4 border-b bg-blue-100">All Batch Chats</h2>
          {/* Search Input */}
          <div className="px-1 py-2">
            <div className="relative">
              <input value={inputValue} type="text" id="table-search" placeholder="Search for student"
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500" 
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
            
            <div className="px-4 py-1 text-md font-semibold border-b border-gray-300 flex justify-between items-center">
                <p>Messages</p>
                  <div className="relative z-10">
                    <button
                        onClick={() => handleChatTab("")}
                        className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200  
                            ${chatTab === "" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    All
                    </button> 

                    <button
                        onClick={() => handleChatTab("Running")}
                        className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 
                            ${chatTab === "Running" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    Ongoing
                    </button>
                    
                    <button
                        onClick={() => handleChatTab("Completed")}
                        className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 
                            ${chatTab === "Completed" ? 'border-b-2 border-blue-500 text-black bg-white' : ' text-gray-700 hover:border-b-2 hover:border-blue-400'}`}
                    >
                    Archieved
                    </button>
                                
                </div>
            </div>
          
          <div className="flex-1 overflow-y-auto divide-y w-auto">
            {chat?.all_batch_chats.length > 0 ? (
              chat?.all_batch_chats.map((batch) => (
                <div
            key={batch?.id}
            onClick={() => handleBatchClick(batch)}
            className={`p-4 pl-6 cursor-pointer relative ${
                selectedBatch?.batch_id === batch?.batch_id
                ? "bg-blue-200"
                : "hover:bg-blue-50"
            }`}
            >
            <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex justify-between mb-0.5">
                    <p className="text-xs font-semibold text-gray-500">{batch?.batch_code}</p>
                    <p className="text-xs text-gray-500"> {batch?.last_message?.time}</p>
                  </div>
                 {/* <div className="flex items-center space-x-2"> 
                 <div className="rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                    {batch.batch_name.charAt(0).toUpperCase()}
                </div>  */}
                 {/* </div>  */}
                <p className="text-sm font-semibold text-black">{batch?.batch_name}</p>
                <p className="text-sm text-gray-600 relative top-2 truncate"><span>{batch?.last_message?.send_by}</span> : {batch?.last_message?.message}</p>
                </div>
            </div>
                {unreadCounts[batch.batch_id] > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
              +{unreadCounts[batch.batch_id]}
            </span>
          )}

            {/* Status Dot */}
            <span
                className={`h-2 w-2 rounded-full absolute top-6 left-2 inline-block ${
                batch?.batch_status.toLowerCase() === "green"
                    ? "bg-green-500"
                    : batch?.batch_status.toLowerCase() === "yellow"
                    ? "bg-yellow-300"
                    : batch?.batch_status.toLowerCase() === "red"
                    ? "bg-red-600"
                    : "bg-gray-400"
                }`}
            />
            </div>

              ))
            ) : (
              <div className="p-4 text-gray-500 text-center">
                No Batches Found
              </div>
            )}
          </div>
        </div>

        <div className="w-[80%] flex flex-col overflow-hidden p-1">
          {selectedBatch ? (
            <>
              <div className="w-auto flex items-center justify-between p-4 border-b bg-blue-100">
                <h3 className="text-base font-semibold text-black">
                  {selectedBatch.batch_name}
                </h3>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-white">
                {Object.keys(groupedMessages).length > 0 ? (
                  Object.entries(groupedMessages).map(([dateLabel, msgs], i) => (
                    <div key={i}>
                      <p className="text-center text-gray-500 text-sm font-medium mb-4">
                        {dateLabel}
                      </p>
                      {msgs.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex mb-3 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`relative rounded-xl px-4 py-2 max-w-xs shadow cursor-pointer ${
                              msg.isSelf ? "bg-sky-500 text-white" : "bg-[#f8f9fa] text-black"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMsgId(msg.id);
                            }}
                          >
                            {!msg.isSelf  && msg.senderName && (
                              <div className="font-semibold font-sans text-xs mb-1">{msg.senderName}</div>
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

                            {(selectedMsgId === msg.id &&
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
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center mt-4">No messages yet.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-white flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="flex-1 border border-gray-400 rounded-full w-full px-10 py-2 text-sm focus:ring-0 focus:outline-none"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <LinkOutlined
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 cursor-pointer"
                    onClick={handleLinkClick}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <button
                  className="shrink-0 bg-sky-500 text-white px-3 py-2 rounded-full"
                  onClick={handleSend}
                >
                  <SendOutlined />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a batch to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchChats;
// import React, { useEffect, useRef, useState } from "react";
// import { SendOutlined, LinkOutlined, DeleteOutlined, SearchOutlined, ArrowLeftOutlined, MoreOutlined, CopyOutlined } from "@ant-design/icons";
// import { BiShare } from "react-icons/bi";
// import { PiShareFat } from "react-icons/pi";
// import { Popover, Button } from "antd";
// import dayjs from "dayjs";
// import { useTrainerBatchChats } from "./TrainerChatFunctions";

// const TrainerBatchChats = () => {
//   const { fetchBatchChats, chat, wsMessages, allChats, ws, sendMessage, fetchAllChats, connectWebSocket, unreadCounts, setUnreadCounts, deleteMessage } = useTrainerBatchChats();
//   const [selectedBatch, setSelectedBatch] = useState(null);
//   const [message, setMessage] = useState("");
//   const [combinedMessages, setCombinedMessages] = useState([]);
//   const [selectedMsgId, setSelectedMsgId] = useState(null);
//   const [visiblePopover, setVisiblePopover] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [chatTab, setChatTab] = useState("");
//   const [replyTo, setReplyTo] = useState(null); // State retained for UI, but functionality enabled for replies
//   const [searchTerm, setSearchTerm] = useState('');
//   const [inputValue, setInputValue] = useState('');

//   const userRole = "Trainer";
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const getMessageById = (id) => combinedMessages.find((m) => m.id === id);

//   const handleChatTab = (tab) => {
//     setChatTab(tab);
//   };

//   useEffect(() => {
//     connectWebSocket(selectedBatch?.batch_id);
//     if (selectedBatch?.batch_id) {
//       setUnreadCounts((prev) => {
//         const updated = { ...prev };
//         delete updated[selectedBatch.batch_id];
//         return updated;
//       });
//     }

//     return () => {
//       // Automatically disconnected in context cleanup
//     };
//   }, [selectedBatch]);

//   useEffect(() => {
//     fetchBatchChats({ search: searchTerm, batch_status: chatTab });
//   }, [searchTerm, chatTab]);

//   useEffect(() => {        
//     const handler = setTimeout(() => {
//       setSearchTerm(inputValue.trimStart());
//     }, 500); 
        
//     return () => {
//       clearTimeout(handler); 
//     };
//   }, [inputValue]);

//   const handleBatchClick = (batch) => {
//     setSelectedBatch(batch);
//     setCombinedMessages([]); 
//     connectWebSocket(batch.batch_id); 
//     setReplyTo(null); // Retained for UI consistency
//     setUnreadCounts((prev) => ({
//       ...prev,
//       [batch.batch_id]: 0,
//     }));
//   };

//   useEffect(() => {
//     if (!wsMessages || !selectedBatch) return;
//     const messages = wsMessages.messages || [];
//     const formattedMessages = messages.map((msg) => ({
//       id: msg.id,
//       text: msg.message,
//       time: msg.gen_time,
//       isSelf: msg.isSelf,
//       senderName: msg.send_by,
//       senderRole: msg.sender || "Trainer",
//       type: "text",
//       reply_to: msg.reply_to || null,
//       reply_to_message: msg.reply_to_message || null,
//       reply_to_send_by: msg.reply_to_send_by || null,
//     }));
//     formattedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
//     setCombinedMessages(formattedMessages);
//   }, [wsMessages, selectedBatch]);

//   const handleSend = () => {
//     if (!message.trim() || !selectedBatch || !ws.current) return;

//     console.log("Reply to", replyTo)

//     const payload = {
//       // type: "send_message",
//       message: message.trim(),
//       reply_to: replyTo?.id || null,
//       reply_to_text: replyTo?.text || "",
//       reply_to_send_by: replyTo?.senderName || "",
//     };
//      console.log(payload)

//     sendMessage(selectedBatch.batch_id, payload);
//     setMessage("");
//     setReplyTo(null); // Reset after sending
//   };
 

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file && selectedBatch) {
//       const fileUrl = URL.createObjectURL(file);
//       const fileType = file.type.startsWith("image/") ? "image" : "file";

//       setCombinedMessages((prev) => [
//         ...prev,
//         {
//           id: `local-${Date.now()}`,
//           text: file.name,
//           time: new Date().toISOString(),
//           isSelf: true,
//           senderName: null,
//           type: fileType,
//           fileUrl,
//         },
//       ]);

//       e.target.value = "";
//     }
//   };

//   const handleLinkClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleDeleteMessage = async (id) => {
//     await deleteMessage(id);
//     setCombinedMessages((prev) => prev.filter((msg) => msg.id !== id)); 
//     setSelectedMsgId(null);
//     setVisiblePopover(null);
//   };

//   const isToday = (date) => {
//     const today = new Date();
//     return (
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getYear() === today.getYear()
//     );
//   };

//   const isYesterday = (date) => {
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     return (
//       date.getDate() === yesterday.getDate() &&
//       date.getMonth() === yesterday.getMonth() &&
//       date.getYear() === yesterday.getYear()
//     );
//   };

//   const groupMessagesByDate = (messages) => {
//     return messages.reduce((acc, message) => {
//       const msgDate = new Date(message.time);
//       let label = msgDate.toDateString();
      
//       if (isToday(msgDate)) label = "Today";
//       else if (isYesterday(msgDate)) label = "Yesterday";
      
//       if (!acc[label]) acc[label] = [];
//       acc[label].push(message);
//       return acc;
//     }, {});
//   };
  
//   const groupedMessages = groupMessagesByDate(combinedMessages);

//   const deletePopoverContent = (msgId) => (
//     <div className="flex flex-col space-y-2">
//       <p>Are you sure you want to delete this chat?</p>
//       <div className="flex space-x-2">
//         <Button
//           type="primary"
//           danger
//           size="small"
//           onClick={() => {
//             handleDeleteMessage(msgId);
//           }}
//         >
//           Yes
//         </Button>
//         <Button
//           size="small"
//           onClick={() => setVisiblePopover(null)}
//         >
//           No
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="fixed col-span-6 w-full h-screen shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden overflow-y-auto">
//       <div className="pt-0 col-span-6 w-full h-[calc(100vh-50px)] shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden">
//         <div className="h-full w-full max-w-full flex flex-col md:flex-row">
//           <div
//             className={`bg-white border-r sm:p-0 transition-all duration-300 flex flex-col
//               ${isMobile && selectedBatch ? "hidden" : "flex"}
//               w-full md:basis-1/4 lg:basis-[25%] xl:basis-[27%] 2xl:basis-[30%] max-w-full`}
//           >
//             <div className={`${isMobile ? "sticky top-0 z-50" : ""} bg-white p-0`}>
//               <h2 className={`text-lg font-semibold border-b bg-blue-100 ${isMobile ? "px-2 py-2" : "p-4"}`}>
//                 All Batch Chats
//               </h2>
//               <div className="px-1 py-2">
//                 <div className="relative">
//                   <input
//                     value={inputValue}
//                     type="text"
//                     id="table-search"
//                     placeholder="Search Batch"
//                     onChange={(e) => setInputValue(e.target.value)}
//                     className="w-full h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500"
//                   />
//                   <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                     <button
//                       onClick={() => {
//                         setInputValue("");
//                         setSearchTerm("");
//                       }}
//                     >
//                       {searchTerm ? (
//                         <svg
//                           className="w-5 h-5 text-gray-500"
//                           aria-hidden="true"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"
//                             clipRule="evenodd"
//                           ></path>
//                         </svg>
//                       ) : (
//                         <svg
//                           className="w-4 h-4 text-gray-500"
//                           aria-hidden="true"
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//                             clipRule="evenodd"
//                           ></path>
//                         </svg>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="px-4 py-1 text-md font-semibold border-b border-gray-300 flex justify-between items-center">
//                 <p>Messages</p>
//                 <div className="relative z-10">
//                   <button
//                     onClick={() => handleChatTab("")}
//                     className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200
//                       ${chatTab === "" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}
//                   >
//                     All
//                   </button>
//                   <button
//                     onClick={() => handleChatTab("Running")}
//                     className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200
//                       ${chatTab === "Running" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}
//                   >
//                     Ongoing
//                   </button>
//                   <button
//                     onClick={() => handleChatTab("Completed")}
//                     className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200
//                       ${chatTab === "Completed" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}
//                   >
//                     Archieved
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto divide-y scrollbar-custom">
//               {chat?.all_batch_chats.length > 0 ? (
//                 chat?.all_batch_chats.map((batch) => (
//                   <div
//                     key={batch?.id}
//                     onClick={() => handleBatchClick(batch)}
//                     className={`p-4 pl-6 cursor-pointer hover:bg-blue-50 relative
//                       ${selectedBatch?.batch_id === batch?.batch_id ? "bg-blue-200" : "hover:bg-blue-50"}`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="w-full">
//                         <div className="flex justify-between mb-0.5">
//                           <p className="text-xs font-semibold text-gray-500">{batch?.batch_code}</p>
//                           <p className="text-xs text-gray-500">{batch?.last_message?.time}</p>
//                         </div>
//                         <p className="text-sm font-semibold text-black">{batch?.batch_name}</p>
//                         <p className="text-sm text-gray-600 relative top-2 truncate">
//                           <span>{batch?.last_message?.send_by}</span> : {batch?.last_message?.message}
//                         </p>
//                       </div>
//                     </div>
//                     {unreadCounts[batch.batch_id] > 0 && (
//                       <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
//                         +{unreadCounts[batch.batch_id]}
//                       </span>
//                     )}
//                     <span
//                       className={`h-2 w-2 rounded-full absolute top-6 left-2 inline-block
//                         ${batch?.batch_status === "Running" 
//                           ? "bg-green-500" : batch?.batch_status === "Upcoming" 
//                           ? "bg-yellow-300" : batch?.batch_status === "Completed" 
//                           ? "bg-red-600" 
//                           : "bg-gray-400"}`}
//                     />
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-gray-500 text-center">No Batches Found</div>
//               )}
//             </div>
//           </div>

//           <div
//             className={`bg-gray-50 flex flex-col overflow-hidden p-0
//               ${isMobile && !selectedBatch ? "hidden" : "flex"}
//               w-full md:basis-[55%] lg:basis-[59%] xl:basis-[59%] 2xl:basis-[60%] max-w-full`}
//           >
//             {selectedBatch ? (
//               <>
//                 <div className={`flex items-center justify-between p-4 border-b bg-blue-100 ${isMobile ? "px-2 py-2 fixed top-0 w-full bg-blue-100 z-50" : "p-4"}`}>
//                   <button onClick={() => setSelectedBatch(null)} className="mr-2">
//                     <ArrowLeftOutlined />
//                   </button>
//                   <h3 className="text-md lg:text-lg font-sans font-semibold">{selectedBatch.batch_name}</h3>
//                 </div>

//                 <div className="flex-1 overflow-y-auto px-3 py-2 pb-[80px] md:pb-2" id="chat-message-panel" style={{ height: isMobile ? "calc(100vh - 100px)" : "auto" }}>
//                   {Object.keys(groupedMessages).length > 0 ? (
//                     Object.entries(groupedMessages).map(([dateLabel, msgs], i) => (
//                       <div key={i}>
//                         <p className="text-center text-gray-500 text-xs font-normal mb-4">{dateLabel}</p>
//                         {msgs.map((msg, index) => (
//                           <div
//                             key={index}
//                             className={`flex mb-3 items-start ${msg.isSelf ? "justify-end" : "justify-start"}`}
//                           >
//                             {msg.isSelf && (
//                               <div className="relative mr-2">
//                                 <div
//                                   className="p-1 cursor-pointer"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setSelectedMsgId(msg.id === selectedMsgId ? null : msg.id);
//                                   }}
//                                 >
//                                   <MoreOutlined className="text-lg text-gray-700 mt-4" />
//                                 </div>

//                                 {selectedMsgId === msg.id && (
//                                   <div className="absolute z-30 mt-1 right-0 bg-gray-50 border rounded-md shadow-md text-sm w-30">
//                                     <button
//                                       onClick={() => {
//                                         handleDeleteMessage(msg.id);
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-100 text-red-600"
//                                     >
//                                       <DeleteOutlined /> Delete
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         navigator.clipboard.writeText(msg.text);
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <CopyOutlined /> Copy
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         setReplyTo(msg); // UI action only, no functionality
//                                         setSelectedMsgId(null);
//                                         // TODO: Add reply-to logic here (e.g., populate reply preview and enable sending)
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <BiShare className="text-base" /> Reply
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         console.log("Forward message:", msg);
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <PiShareFat className="text-base" /> Forward
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             )}

//                             <div className={`max-w-[80%] relative rounded-xl shadow
//                               ${msg.isSelf ? "bg-sky-500 text-white" : "bg-[#f8f9fa] text-black"}`}>

//                               {!msg.isSelf && msg.senderName && (
//                                 <div className="font-semibold font-sans text-xs mb-1">{msg.senderName}</div>
//                               )}

//                               {/* Reply Bubble Inside Chat */}
//                               {msg.reply_to && (
//                                 <div className={`px-3 py-2 border-l-4 text-xs 
//                                   ${msg.isSelf ? "bg-sky-600 border-white/50 text-white/80" : "bg-gray-100 border-blue-400 text-gray-700"
//                                 }`}>
//                                   <div className="font-semibold">{msg.reply_to_send_by || "Unknown"}</div>
//                                   <div className="truncate italic text-[11px] opacity-90">{msg.reply_to_message || "(message deleted)"}</div>
//                                 </div>
//                               )}

//                                {/* Main message */}
//                                 <div className="px-4 py-2 text-sm break-words">
//                                   {msg.type === "image" ? (
//                                     <img src={msg.fileUrl} alt={msg.text} className="max-w-full max-h-48 rounded" />
//                                   ) : msg.type === "file" ? (
//                                     <a
//                                       href={msg.fileUrl}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="underline text-blue-600 hover:text-blue-800"
//                                     >
//                                       📎 {msg.text}
//                                     </a>
//                                   ) : (
//                                     <div
//                                       dangerouslySetInnerHTML={{
//                                         __html: msg.text.replace(
//                                           /(https?:\/\/[^\s]+)/g,
//                                           (url) =>
//                                             `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline ${msg.isSelf ? 'text-blue-200' : 'text-blue-600'}">${url}</a>`
//                                         ),
//                                       }}
//                                     />
//                                   )}
//                                 </div>

//                                 {/* Time */}
//                                 <div className={`text-[10px] px-4 pb-1 text-right ${msg.isSelf ? "text-white/70" : "text-gray-500"}`}>
//                                   {dayjs(msg.time).format("hh:mm A")}
//                                 </div>
//                               </div>

//                             {!msg.isSelf && (
//                               <div className="relative ml-2">
//                                 <div
//                                   className="p-1 cursor-pointer"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setSelectedMsgId(msg.id === selectedMsgId ? null : msg.id);
//                                   }}
//                                 >
//                                   <MoreOutlined className="text-lg text-gray-700 mt-5" />
//                                 </div>

//                                 {selectedMsgId === msg.id && (
//                                   <div className="absolute z-30 mt-1 left-0 bg-gray-50 border rounded-md shadow-md text-sm w-30">
//                                     <button
//                                       onClick={() => {
//                                         navigator.clipboard.writeText(msg.text);
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <CopyOutlined /> Copy
//                                     </button>
//                                     <button
//                                       onClick={() => {
//                                         console.log("Reply pressed for msg:", msg); 
//                                         setReplyTo(msg); 
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <BiShare className="text-base" /> Reply
//                                     </button>

//                                     <button
//                                       onClick={() => {
//                                         console.log("Forward message:", msg);
//                                         setSelectedMsgId(null);
//                                       }}
//                                       className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
//                                     >
//                                       <PiShareFat className="text-base" /> Forward
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         ))}

//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center text-gray-400 py-2 text-sm">No messages yet.</div>
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 {replyTo && (
//                   <div className={`mb-2 px-2 py-1 rounded text-xs border-l-4 ${
//                     replyTo.isSelf ? "bg-sky-600 border-white/50 text-white/90" : "bg-gray-200 border-blue-500 text-gray-700"
//                   }`}>
//                     <div className="flex justify-between items-center">
//                       <span>
//                         <strong>{replyTo.senderName || "You"}</strong>:{" "}
//                         {replyTo.text?.length > 50 ? replyTo.text.slice(0, 50) + "..." : replyTo.text}
//                       </span>
//                       <button
//                         onClick={() => setReplyTo(null)}
//                         className="ml-2 text-gray-500 hover:text-red-500 text-sm"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 <div
//                   className={`w-full flex items-center gap-2 border-t bg-white px-3 py-2 fixed bottom-0 left-0 right-0 z-50 md:static md:border-t-0`}
//                   style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
//                 >
//                   <div className="relative flex-1">
//                     <input
//                       type="text"
//                       className="w-full border border-gray-400 rounded-full px-8 py-2 text-sm focus:ring-0"
//                       placeholder="Type a message..."
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       onFocus={() => {
//                         setTimeout(() => {
//                           const msgPanel = document.getElementById("chat-message-panel");
//                           if (msgPanel) {
//                             msgPanel.scrollTo({ top: msgPanel.scrollHeight, behavior: "smooth" });
//                           }
//                         }, 300);
//                       }}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           handleSend();
//                         }
//                       }}
//                     />
//                     <LinkOutlined
//                       className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 cursor-pointer"
//                       onClick={handleLinkClick}
//                     />
//                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
//                   </div>
//                   <button className="shrink-0 bg-sky-500 text-white px-3 py-2 rounded-full" onClick={handleSend}>
//                     <SendOutlined />
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-gray-500">
//                 <p>Select a batch to view messages</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrainerBatchChats;


import React, { useEffect, useRef, useState } from "react";
import { SendOutlined, LinkOutlined, DeleteOutlined, SearchOutlined, ArrowLeftOutlined, MoreOutlined, CopyOutlined } from "@ant-design/icons";
import { BiShare } from "react-icons/bi";
import { PiShareFat } from "react-icons/pi";
import { Popover, Button, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useTrainerBatchChats } from "./TrainerbatchChatFunctions";

const TrainerBatchChats = () => {
  const { fetchBatchChats, chat, wsMessages, allChats, ws, sendMessage, fetchAllChats, connectWebSocket, unreadCounts, setUnreadCounts, deleteMessage } = useTrainerBatchChats();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [message, setMessage] = useState("");
  const [combinedMessages, setCombinedMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [visiblePopover, setVisiblePopover] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chatTab, setChatTab] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [forwardMessage, setForwardMessage] = useState(null);
  const [forwardTarget, setForwardTarget] = useState(null);
  const [isForwardModalVisible, setIsForwardModalVisible] = useState(false);

  const userRole = "Trainer";
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getMessageById = (id) => combinedMessages.find((m) => m.id === id);

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
    return () => {};
  }, [selectedBatch]);

  useEffect(() => {
    fetchBatchChats({ search: searchTerm, batch_status: chatTab });
  }, [searchTerm, chatTab]);

  useEffect(() => {        
    const handler = setTimeout(() => {
      setSearchTerm(inputValue.trimStart());
    }, 500); 
    return () => clearTimeout(handler); 
  }, [inputValue]);

  const handleBatchClick = (batch) => {
    setSelectedBatch(batch);
    setCombinedMessages([]); 
    connectWebSocket(batch.batch_id); 
    setReplyTo(null);
    setUnreadCounts((prev) => ({
      ...prev,
      [batch.batch_id]: 0,
    }));
  };

  useEffect(() => {
    if (!wsMessages || !selectedBatch) return;
    const messages = wsMessages.messages || [];
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      text: msg.message,
      time: msg.gen_time,
      isSelf: msg.isSelf,
      senderName: msg.send_by,
      senderRole: msg.sender || "Trainer",
      type: "text",
      reply_to: msg.reply_to || null,
      reply_to_message: msg.reply_to_message || null,
      reply_to_send_by: msg.reply_to_send_by || null,
    }));
    formattedMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
    setCombinedMessages(formattedMessages);
  }, [wsMessages, selectedBatch]);

  const handleSend = () => {
    if (!message.trim() || !selectedBatch || !ws.current) return;

    const payload = {
      message: message.trim(),
      reply_to: replyTo?.id || null,
      reply_to_text: replyTo?.text || "",
      reply_to_send_by: replyTo?.senderName || "",
    };

    sendMessage(selectedBatch.batch_id, payload);
    setMessage("");
    setReplyTo(null);
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

  const handleDeleteMessage = async (id) => {
    await deleteMessage(id);
    setCombinedMessages((prev) => prev.filter((msg) => msg.id !== id)); 
    setSelectedMsgId(null);
    setVisiblePopover(null);
  };

  const handleForward = (msg) => {
    setForwardMessage(msg);
    setIsForwardModalVisible(true);
    setSelectedMsgId(null);
  };

  const handleForwardSubmit = () => {
    if (forwardMessage && forwardTarget && ws.current) {
      // Reconnect WebSocket to the target batch
      connectWebSocket(forwardTarget);
      // Small delay to allow WebSocket reconnection
      setTimeout(() => {
        const payload = {
          message: forwardMessage.text,
          forwarded: true,
          original_sender: forwardMessage.senderName || "You",
          target_batch_id: forwardTarget, // Explicitly specify target batch
        };
        console.log("Forwarding message:", payload, "to batch:", forwardTarget); // Debug log
        sendMessage(forwardTarget, payload);
        setIsForwardModalVisible(false);
        setForwardMessage(null);
        setForwardTarget(null);
      }, 500); // Adjust delay if needed
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getYear() === today.getYear();
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getYear() === yesterday.getYear();
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

  const deletePopoverContent = (msgId) => (
    <div className="flex flex-col space-y-2">
      <p>Are you sure you want to delete this chat?</p>
      <div className="flex space-x-2">
        <Button type="primary" danger size="small" onClick={() => handleDeleteMessage(msgId)}>Yes</Button>
        <Button size="small" onClick={() => setVisiblePopover(null)}>No</Button>
      </div>
    </div>
  );

  return (
    <div className="fixed col-span-6 w-full h-screen shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden overflow-y-auto">
      <div className="pt-0 col-span-6 w-full h-[calc(100vh-50px)] shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden">
        <div className="h-full w-full max-w-full flex flex-col md:flex-row">
          <div
            className={`bg-white border-r sm:p-0 transition-all duration-300 flex flex-col
              ${isMobile && selectedBatch ? "hidden" : "flex"}
              w-full md:basis-1/4 lg:basis-[25%] xl:basis-[27%] 2xl:basis-[30%] max-w-full`}
          >
            <div className={`${isMobile ? "sticky top-0 z-50" : ""} bg-white p-0`}>
              <h2 className={`text-lg font-semibold border-b bg-blue-100 ${isMobile ? "px-2 py-2" : "p-4"}`}>
                All Batch Chats
              </h2>
              <div className="px-1 py-2">
                <div className="relative">
                  <input
                    value={inputValue}
                    type="text"
                    id="table-search"
                    placeholder="Search Batch"
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-8 block p-2 pr-10 text-xs text-gray-600 font-normal border border-gray-300 rounded-lg bg-gray-50 focus:ring-0 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button onClick={() => { setInputValue(""); setSearchTerm(""); }}>
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
                  <button onClick={() => handleChatTab("")} className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 ${chatTab === "" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}>All</button>
                  <button onClick={() => handleChatTab("Running")} className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 ${chatTab === "Running" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}>Ongoing</button>
                  <button onClick={() => handleChatTab("Completed")} className={`px-2 py-1 text-xs font-semibold rounded-sm transition-colors duration-200 ${chatTab === "Completed" ? "border-b-2 border-blue-500 text-black bg-white" : "text-gray-700 hover:border-b-2 hover:border-blue-400"}`}>Archieved</button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y scrollbar-custom-trainer">
              {chat?.all_batch_chats.length > 0 ? (
                chat?.all_batch_chats.map((batch) => (
                  <div key={batch?.batch_id} onClick={() => handleBatchClick(batch)} className={`p-4 pl-6 cursor-pointer hover:bg-blue-50 relative ${selectedBatch?.batch_id === batch?.batch_id ? "bg-blue-200" : "hover:bg-blue-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="w-full">
                        <div className="flex justify-between mb-0.5">
                          <p className="text-xs font-semibold text-gray-500">{batch?.batch_code}</p>
                          <p className="text-xs text-gray-500">{batch?.last_message?.time}</p>
                        </div>
                        <p className="text-sm font-semibold text-black">{batch?.batch_name}</p>
                        <p className="text-sm text-gray-600 relative top-2 truncate"><span>{batch?.last_message?.send_by}</span> : {batch?.last_message?.message}</p>
                      </div>
                    </div>
                    {unreadCounts[batch.batch_id] > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">+{unreadCounts[batch.batch_id]}</span>}
                    <span className={`h-2 w-2 rounded-full absolute top-6 left-2 inline-block ${batch?.batch_status === "Running" ? "bg-green-500" : batch?.batch_status === "Upcoming" ? "bg-yellow-300" : batch?.batch_status === "Completed" ? "bg-red-600" : "bg-gray-400"}`} />
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-500 text-center">No Batches Found</div>
              )}
            </div>
          </div>
          <div className={`bg-gray-50 flex flex-col overflow-hidden p-0 ${isMobile && !selectedBatch ? "hidden" : "flex"} w-full md:basis-[55%] lg:basis-[59%] xl:basis-[59%] 2xl:basis-[60%] max-w-full`}>
            {selectedBatch ? (
              <>
                <div className={`flex items-center justify-between p-4 border-b bg-blue-100 ${isMobile ? "px-2 py-2 fixed top-0 w-full bg-blue-100 z-50" : "p-4"}`}>
                  <button onClick={() => setSelectedBatch(null)} className="mr-2"><ArrowLeftOutlined /></button>
                  <h3 className="text-md lg:text-lg font-sans font-semibold">{selectedBatch.batch_name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2 pb-[80px] md:pb-2" id="chat-message-panel" style={{ height: isMobile ? "calc(100vh - 100px)" : "auto" }}>
                  {Object.keys(groupedMessages).length > 0 ? (
                    Object.entries(groupedMessages).map(([dateLabel, msgs], i) => (
                      <div key={i}>
                        <p className="text-center text-gray-500 text-xs font-normal mb-4">{dateLabel}</p>
                        {msgs.map((msg, index) => (
                          <div key={index} className={`flex mb-2 items-start ${msg.isSelf ? "justify-end" : "justify-start"}`}>
                            {msg.isSelf && (
                              <div className="relative mr-2">
                                <div className="p-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedMsgId(msg.id === selectedMsgId ? null : msg.id); }}>
                                  <MoreOutlined className="text-lg text-gray-700 mt-4" />
                                </div>
                                {selectedMsgId === msg.id && (
                                  <div className="absolute z-30 mt-1 right-0 bg-gray-50 border rounded-md shadow-md text-sm w-30">
                                    {/* <button onClick={() => { handleDeleteMessage(msg.id); setSelectedMsgId(null); }} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-100 text-red-600">
                                      <DeleteOutlined /> Delete
                                    </button> */}
                                    <button onClick={() => { navigator.clipboard.writeText(msg.text); setSelectedMsgId(null); }} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <CopyOutlined /> Copy
                                    </button>
                                    <button onClick={() => { setReplyTo(msg); setSelectedMsgId(null); }} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <BiShare className="text-base" /> Reply
                                    </button>
                                    <button onClick={() => handleForward(msg)} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <PiShareFat className="text-base" /> Forward
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={`max-w-[80%] relative rounded-xl px-4 py-2 shadow ${msg.isSelf ? "bg-sky-500 text-white" : "bg-[#f8f9fa] text-black"}`}>
                              {!msg.isSelf && msg.senderName && 
                                <div className="font-semibold font-sans text-xs ml-1 mb-1 ">{msg.senderName}</div>}
                              {msg.reply_to && (
                                <div className={`px-3 py-2 border-l-4 text-xs 
                                ${msg.isSelf ? "bg-sky-600 border-white/50 text-white/80" : "bg-gray-100 border-blue-400 text-gray-700"} rounded-t-md`}>
                                  <div className="font-semibold">{msg.reply_to_send_by || "Unknown"}</div>
                                  <div className="truncate italic text-[11px] opacity-90">{msg.reply_to_message || "(message deleted)"}</div>
                                </div>
                              )}
                              <div className="px-4 py-2 text-sm break-words">
                                {msg.type === "image" ? (
                                  <img src={msg.fileUrl} alt={msg.text} className="max-w-full max-h-48 rounded" />
                                ) : msg.type === "file" ? (
                                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">📎 {msg.text}</a>
                                ) : (
                                  <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/(https?:\/\/[^\s]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline ${msg.isSelf ? 'text-blue-200' : 'text-blue-600'}">${url}</a>`) }} />
                                )}
                              </div>
                              <div className={`text-[10px] px-4 pb-1 text-right ${msg.isSelf ? "text-white/70" : "text-gray-500"}`}>
                                {dayjs(msg.time).format("hh:mm A")}
                              </div>
                            </div>
                            {!msg.isSelf && (
                              <div className="relative ml-2">
                                <div className="p-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedMsgId(msg.id === selectedMsgId ? null : msg.id); }}>
                                  <MoreOutlined className="text-lg text-gray-700 mt-5" />
                                </div>
                                {selectedMsgId === msg.id && (
                                  <div className="absolute z-30 mt-0 left-0 bg-gray-50 border rounded-md shadow-md text-sm w-30">
                                    <button onClick={() => { navigator.clipboard.writeText(msg.text); setSelectedMsgId(null); }} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <CopyOutlined /> Copy
                                    </button>
                                    <button onClick={() => { setReplyTo(msg); setSelectedMsgId(null); }} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <BiShare className="text-base" /> Reply
                                    </button>
                                    <button onClick={() => handleForward(msg)} className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100">
                                      <PiShareFat className="text-base" /> Forward
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-2 text-sm">No messages yet.</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {replyTo && (
                  <div className={`mb-2 px-2 py-1 rounded-t-md text-xs border-l-4 
                  ${replyTo.isSelf ? "bg-sky-600 border-white/50 text-white/90" : "bg-gray-200 border-blue-500 text-gray-700"}`}>
                    <div className="flex justify-between items-center">
                      <span><strong>{replyTo.senderName || "You"}</strong>: {replyTo.text?.length > 50 ? replyTo.text.slice(0, 50) + "..." : replyTo.text}</span>
                      <button onClick={() => setReplyTo(null)} className="ml-2 text-gray-500 hover:text-red-500 text-sm">✕</button>
                    </div>
                  </div>
                )} 

                <div className={`w-full flex items-center gap-2 border-t bg-white px-3 py-2 fixed bottom-0 left-0 right-0 z-50 md:static md:border-t-0`} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded-full px-8 py-2 text-sm focus:ring-0"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => {
                        setTimeout(() => {
                          const msgPanel = document.getElementById("chat-message-panel");
                          if (msgPanel) msgPanel.scrollTo({ top: msgPanel.scrollHeight, behavior: "smooth" });
                        }, 300);
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                    />
                    <LinkOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 cursor-pointer" onClick={handleLinkClick} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                  <button className="shrink-0 bg-sky-500 text-white px-3 py-2 rounded-full" onClick={handleSend}><SendOutlined /></button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500"><p>Select a batch to view messages</p></div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Forward Message"
        open={isForwardModalVisible}
        onOk={handleForwardSubmit}
        onCancel={() => { setIsForwardModalVisible(false); setForwardMessage(null); setForwardTarget(null); }}
      >
        <p>Forward "{forwardMessage?.text?.length > 30 ? forwardMessage.text.slice(0, 30) + "..." : forwardMessage?.text}" to:</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Select a batch"
          onChange={(value) => setForwardTarget(value)}
          value={forwardTarget}
        >
          {chat?.all_batch_chats.map((batch) => (
            <Select.Option key={batch.batch_id} value={batch.batch_id} disabled={batch.batch_id === selectedBatch?.batch_id}>
              {batch.batch_name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default TrainerBatchChats;
import React, { useState, useEffect } from "react";
import {
  SendOutlined,
  PaperClipOutlined,
  MoreOutlined,
  PushpinOutlined,
  FileImageOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const chats = [
  {
    id: 1,
    name: "Batch A",
    messages: [
      { from: "trainer", text: "Welcome!" },
      { from: "student", text: "Hello!" },
    ],
  },
  {
    id: 2,
    name: "Batch B",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 3,
    name: "Batch C",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 4,
    name: "Batch D",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 5,
    name: "Batch E",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 6,
    name: "Batch F",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 7,
    name: "Batch G",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 8,
    name: "Batch H",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 9,
    name: "Batch I",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 10,
    name: "Batch J",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 11,
    name: "Batch K",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 12,
    name: "Batch L",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 13,
    name: "Batch M",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 14,
    name: "Batch N",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
  {
    id: 15,
    name: "Batch O",
    messages: [{ from: "trainer", text: "Are you ready?" }],
  },
];


const StudentTrainerChat = () => {
  const [selectedBatch, setSelectedBatch] = useState(1);
  const [message, setMessage] = useState("");
  const isMobile = window.innerWidth < 768; // you could improve this with a responsive hook
  const [selectedChatId, setSelectedChatId] = useState(null);


  const selectedChat = chats.find((chat) => chat.id === selectedChatId);



  const handleSend = () => {
    if (!message.trim()) return;
    messagesData[selectedBatch].push({ from: "student", text: message });
    setMessage("");
  };

  const handleSendDocument = () => {
    alert("Document upload functionality to be implemented.");
  };

  const handlePinMessage = (msgText) => {
    alert(`Pinned: "${msgText}"`);
  };

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

  const handleBack = () => setSelectedChatId(null);


  return (
  
<div className="fixed top-0 col-span-6 w-full h-screen shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-hidden">
<div className="pt-12 col-span-6 w-full h-[calc(100vh-64px)] shadow-md sm:rounded-lg border border-gray-50 bg-white overflow-x-hidden">
  {/* Full height container below navbar */}
  <div className="flex flex-col md:flex-row h-full w-full">
    {/* Sidebar Chat List */}
    <div
      className={`bg-white border-r w-full md:w-1/5 transition-all duration-300 flex flex-col ${
        isMobile && selectedChatId ? "hidden" : "flex"
      }`}
    >
      <h2 className="text-lg font-bold p-4 border-b bg-gray-100">Chats</h2>
      
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto divide-y">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={`p-4 cursor-pointer hover:bg-green-50 ${chat.id === selectedChatId ? "bg-green-200" : "" } `}
          >
            <p className="font-medium">{chat.name}</p>
            <p className="text-sm text-gray-500 truncate">
              {chat.messages.at(-1)?.text}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Chat Content Panel */}
    <div
      className={`flex flex-col w-full md:w-2/3 overflow-x-hidden ${
        isMobile && !selectedChatId ? "hidden" : "flex"
      }`}
    >

      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-100">
            {isMobile && (
              <button onClick={handleBack}>
                <ArrowLeftOutlined className="mr-2" />
              </button>
            )}
            <h3 className="text-lg font-semibold">{selectedChat.name}</h3>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {selectedChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.from === "student" ? "justify-end" : "justify-start"
                }`}
              >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap ${
                  msg.from === "student"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.text}
              </div>


              </div>
            ))}
          </div>

          {/* Input Section */}
          <div
            className="p-4 border-t bg-gray-50 flex items-center gap-2 w-full 
                      md:static fixed bottom-0 left-0 right-0 z-10 md:z-auto"
          >
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

export default StudentTrainerChat;

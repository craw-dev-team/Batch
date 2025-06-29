import axios from "axios";
import React, {createContext, useState, useContext, useCallback, children, useRef, useEffect} from "react";
import BASE_URL from "../../../ip/Ip";
import { message } from "antd";
import dayjs from "dayjs";


// Create the Context Object

const ChatContext = createContext();

const BatchChatsProvider = ({children}) => {
    const [chat, setChat] = useState();
    const [allChats, setAllChats] = useState();
    const [loading, setloading] = useState(false);
    const [wsMessages, setWsMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    const ws = useRef(null);


    const connectWebSocket = (batchId) => {
    const token = localStorage.getItem("token");
    if (!token || !batchId) return;

    // ✅ Close existing WebSocket if open
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setWsMessages([]);

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://13.203.183.149:8000/ws/admin-batch-chat/${batchId}/?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

   ws.current.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("WebSocket received:", data);

  if (data.type === "history") {
    // Initial batch load
    setWsMessages(data); // full history replaces everything
  } else if (data.type === "chat") {
    // New real-time message
    setWsMessages((prev) => {
      if (!prev) return { messages: [data], self_messages: [], type: "history" };

      return {
        ...prev,
        messages: [...prev.messages, data],
        // optionally: if it's sent by self, add to self_messages
        self_messages: data.sender === "admin" 
          ? [...(prev.self_messages || []), data] 
          : prev.self_messages,
      };
    });
  }
};


    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
    };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
  };
  
 const sendMessage = (batchId, messageText) => {
  if (!ws.current) {
    console.warn("WebSocket not initialized.");
    return;
  }

  if (ws.current && ws.current.readyState === WebSocket.OPEN) {
    const payload = {
      batch_id: batchId,
      type: "send_message",
      message: messageText,
    };
    console.log('payload',payload );
    
    ws.current.send(JSON.stringify(payload));
  } else {
    console.error("WebSocket not connected.");
  }
};


  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);







    // Fetch Chats
    const fetchChats = useCallback( async ({ search = '', batch__status = '' }) => {
    if (loading) return;
        const token = localStorage.getItem('token');
        if(!token) {
            console.log("No token found, user might be logged out");
            return;
        }

        setloading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/all_chats/`,
                {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                withCredentials: true,
                params: {
                    search,
                    batch__status
                }
            }
        );
        const data = response.data;

        setChat(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
              return data;
            }
            return prevData;
          });

          // console.log('Batches Data ', data)

        } catch (error) {
            console.error('Error fetching Chat Data', error);
        }finally {
            setloading(false);
        }
    },[loading]);



    //  Fetch All Chat
    // const fetchAllChats = useCallback( async (id) => {

    //      if (!id) {
    //         console.error("No batch_id provided");
    //         return;
    //     }

    //     if (loading) return;
    //         const token = localStorage.getItem('token');
    //         if(!token) {
    //             console.log("No token found, user might be logged out");
    //             return;
    //         }
    
    //         setloading(true);
    //         try {
    //             const response = await axios.get(`${BASE_URL}/api/batch_chats/${id}/`,
    //                 {headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
    //                 withCredentials: true,
    //             }
    //         );
    //         const data = response.data;
    //         console.log(response);
    
    //         setAllChats(prevData => {
    //             if(JSON.stringify(prevData) !== JSON.stringify(data)){
    //               return data;
    //             }
    //             return prevData;
    //           });
    
    //           // console.log('Batches Data ', data)
    
    //         } catch (error) {
    //             console.error('Error fetching Chat Data', error);
    //         }finally {
    //             setloading(false);
    //         }
    //     },[loading]);


    // Post Request for send messages
    //   const sendMessage = async (id, messageText) => {
    //     const token = localStorage.getItem("token");
    //     if (!token) {
    //       message.error("Unauthorized. Please log in.");
    //       return;
    //     }

    //     try {
    //       const response = await axios.post(
    //         `${BASE_URL}/api/batch_chats/message/${id}/`,
    //         { message: messageText },
    //         {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //           },
    //           withCredentials: true,
    //         }
    //       );

    //       if (response.status === 200 || response.status === 201) {
    //         // message.success("Message sent successfully.");
    //         fetchChats(id);
    //       } else {
    //         message.error("Failed to send message.");
    //       }
    //     } catch (error) {
    //       console.error("Error sending message:", error);
    //       message.error("Failed to send message.");
    //     }
    //   };


//   Post request for delete messages

const deleteMessage = async(id) => {
    if (!id) {
        console.error("No batch_id provided");
        return;
    }

    if (loading) return;
    const token = localStorage.getItem("token");
    if(!token) {
        message.error("Unauthorized, Please log in.")
        return;
    }
    try {
        const response = await axios.post(`${BASE_URL}//${id}`,
            { message: messageText },
            {
                headers:{"Content-Type": "application/json", Authorization: `Bearer ${token}`},
                withCredentials: true,
            }
        );

        if (response.status === 200 || response.status === 201 ){
            message.success("Message delete successfully")
            fetchChats(id);
        } else {
            message.error("Failed to delete message.");
        }
    } catch (error) {
        console.log("Error deleting message:", error);
        message.error("Failed to delete message");
    }
}


    return (
        <ChatContext.Provider value={{ fetchChats, loading, chat, allChats, ws, wsMessages, connectWebSocket, sendMessage, deleteMessage, disconnectWebSocket, unreadCounts, setUnreadCounts }}>
            {children}
        </ChatContext.Provider>
    )
};

// Custom hook to access context

const useBatchChats = () => {
    const context = useContext(ChatContext);
    if(!context) {
        throw new Error("ChatContext must be used within a BatchChatsProvider")
    }
    return context;
};

export { BatchChatsProvider, useBatchChats }
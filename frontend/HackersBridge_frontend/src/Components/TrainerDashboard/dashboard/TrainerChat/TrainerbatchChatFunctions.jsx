import axios from "axios";
import React, {createContext, useState, useContext, useCallback, children, useRef, useEffect} from "react";
import BASE_URL, {WEBSOCKET_URL} from "../../../../ip/Ip";
import { message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../dashboard/api/api";


// Create the Context Object

const TrainerChatContext = createContext();

const TrainerBatchChatsProvider = ({children}) => {
    const [chat, setChat] = useState();
    const [allChats, setAllChats] = useState();
    const [loading, setloading] = useState(false);
    const [wsMessages, setWsMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    const ws = useRef(null);


    const connectWebSocket = (batchId) => {
      // const token = localStorage.getItem("token");
      if ( !batchId) return;

      // ✅ Close existing WebSocket if open
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
        ws.current = null;
      }


      setWsMessages([]);

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${protocol}://${WEBSOCKET_URL}/ws/trainer-batch-chat/${batchId}/`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        // console.log("WebSocket connected");
      };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("WebSocket received:", data);

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
            self_messages: data.sender === "trainer" 
              ? [...(prev.self_messages || []), data] 
              : prev.self_messages,
          };
      });
    }
  };


    ws.current.onerror = (error) => {
      // console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      // console.log("WebSocket disconnected");
    };
    };

    const disconnectWebSocket = () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  
  // const sendMessage = (batchId, messageText) => {
  //   if (!ws.current) {
  //     // console.warn("WebSocket not initialized.");
  //     return;
  //   }

  //   if (ws.current && ws.current.readyState === WebSocket.OPEN) {
  //     const payload = {
  //       batch_id: batchId,
  //       type: "send_message",
  //       message: messageText,
  //     };
  //     // console.log('payload',payload );
      
  //     ws.current.send(JSON.stringify(payload));
  //   } else {
  //     // console.error("WebSocket not connected.");
  //   }
  // };


  const sendMessage = (
  batchId,
  messageText = "",
  fileUrl = null,
  fileName = null,
  fileSize = null,
  replyTo = null,
  isForwarded = false,
  forwardedFrom = null
) => {
  if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

  const payload = {
    batch_id: batchId,
    type: "send_message",
    message: messageText || "",

    // ✅ Optional File Metadata
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,

    // ✅ Optional Reply/Forward Metadata
    reply_to: replyTo,
    is_forwarded: isForwarded,
    forwarded_from: forwardedFrom,
  };

  ws.current.send(JSON.stringify(payload));
};

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);







    // Fetch Batch Chats
    const fetchBatchChats = useCallback( async ({ search = '', batch_status = '' }) => {
      if (loading) return;

        setloading(true);
        try {
            const response = await axiosInstance.get(`/Trainer_login/trainer/batch-chats/`,
              {  
              params: {
                    search,
                    batch_status
                }
            }
        );
        console.log(response);
        
        const data = response.data;

        setChat(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
              return data;
            }
            return prevData;
          });

          // console.log('Batches Data ', data)

        } catch (error) {
            // console.error('Error fetching Chat Data', error);
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
    //             const response = await axios.get(`${BASE_URL}/Trainer_login/trainer/batch-chats/${id}/`,
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
    //         `${BASE_URL}Trainer_login/trainer/batch-chats/${id}/send/`,
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
    //         fetchBatchChats(id);
    //       } else {
    //         message.error("Failed to send message.");
    //       }
    //     } catch (error) {
    //       console.error("Error sending message:", error);
    //       message.error("Failed to send message.");
    //     }
    //   };


//   Post request for delete messages

const deleteMessage = async (message_id) => {
  if (!message_id || loading) return;

  const token = localStorage.getItem("token");
  if (!token) {
    message.error("Unauthorized, Please log in.");
    return;
  }

  try {
    const response = await axiosInstance.delete(`/Trainer_login/trainer/chat/delete/${message_id}/`);

    if ([200, 201, 204].includes(response.status)) {
      message.success("Message deleted successfully");
    } else {
      message.error("Failed to delete message.");
    }
  } catch (error) {
    message.error("Failed to delete message.");
  }
};


    return (
        <TrainerChatContext.Provider value={{ fetchBatchChats, loading, chat, allChats, ws, wsMessages, connectWebSocket, sendMessage, deleteMessage, disconnectWebSocket, unreadCounts, setUnreadCounts }}>
            {children}
        </TrainerChatContext.Provider>
    )
};

// Custom hook to access context

const useTrainerBatchChats = () => {
    const context = useContext(TrainerChatContext);
    if(!context) {
        throw new Error("ChatContext must be used within a BatchChatsProvider")
    }
    return context;
};

export { TrainerBatchChatsProvider, useTrainerBatchChats }



// import { useCallback, useState, useEffect, useRef } from "react";
// import {WEBSOCKET_URL} from "../../../ip/Ip";
// import axiosInstance from "../../../../dashboard/api/api";




// const useTrainerBatchChats = () => {
    
//     const [loading, setloading] = useState(false);    
//     const [batchChatList, setBatchChatList] = useState();
    
//     const [batchChatMessage, setbatchChatMessage] = useState([]);
    
//     const ws = useRef(null);


//     // const connectWebSocket = (batchId) => {
//     //     const token = localStorage.getItem("token");
//     //     if (!token || !batchId) return;

//     //     // ✅ Close existing WebSocket if open
//     //     if (ws.current) {
//     //         ws.current.close();
//     //         ws.current = null;
//     //     }

//     //     setbatchChatMessage([]);

//     //     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//     //     const wsUrl = `${protocol}://${WEBSOCKET_URL}/ws/student-batch-chat/${batchId}/?token=${token}`;

//     //     ws.current = new WebSocket(wsUrl);

//     //     ws.current.onopen = () => {
//     //         console.log("WebSocket connected");
//     //     };

//     //     ws.current.onmessage = (event) => {
//     //     const data = JSON.parse(event.data);
//     //     console.log("WebSocket received:", data);

//     //     if (data.type === "history") {
//     //         // Initial batch load
//     //         setbatchChatMessage(data); // full history replaces everything
//     //     } else if (data.type === "chat") {
//     //         // New real-time message
//     //         setbatchChatMessage((prev) => {
//     //         if (!prev) return { messages: [data], self_messages: [], type: "history" };

//     //         return {
//     //             ...prev,
//     //             messages: [...prev.messages, data],
//     //             // optionally: if it's sent by self, add to self_messages
//     //             self_messages: data.sender === "admin" 
//     //             ? [...(prev.self_messages || []), data] 
//     //             : prev.self_messages,
//     //         };
//     //     });
//     //     }
//     //     } ;


//     //     ws.current.onerror = (error) => {
//     //     console.error("WebSocket error:", error);
//     //     };

//     //     ws.current.onclose = () => {
//     //     console.log("WebSocket disconnected");
//     //     };
//     //     };



//     const connectWebSocket = (batchId) => {
//         if (!batchId) return;

//         // ✅ Close existing WebSocket if open
//         if (ws.current) {
//             ws.current.close();
//             ws.current = null;
//         }

//         setbatchChatMessage([]);

//         const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//         const wsUrl = `${protocol}://${WEBSOCKET_URL}/ws/trainer-batch-chat/${batchId}/`; // ✅ Token removed

//         ws.current = new WebSocket(wsUrl);

//         ws.current.onopen = () => {
//             console.log("WebSocket connected");
//         };

//         ws.current.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             console.log("WebSocket received:", data);

//             if (data.type === "history") {
//                 setbatchChatMessage(data); // full history
//             } else if (data.type === "chat") {
//                 setbatchChatMessage((prev) => {
//                     if (!prev) return { messages: [data], self_messages: [], type: "history" };
//                     return {
//                         ...prev,
//                         messages: [...prev.messages, data],
//                         self_messages:
//                             data.sender === "admin"
//                                 ? [...(prev.self_messages || []), data]
//                                 : prev.self_messages,
//                     };
//                 });
//             }
//         };

//         ws.current.onerror = (error) => {
//             console.error("WebSocket error:", error);
//         };

//         ws.current.onclose = () => {
//             console.log("WebSocket disconnected");
//         };
//     };


//         const disconnectWebSocket = () => {
//             if (ws.current) {
//                 ws.current.close();
//             }
//         };



//         const sendMessage = (batchId, messageText) => {
//             if (!ws.current) {
//                 console.warn("WebSocket not initialized.");
//                 return;
//             }
        
//             if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//                 const payload = {
//                 batch_id: batchId,
//                 type: "send_message",
//                 message: messageText,
//                 };
//                 // console.log('payload',payload );
                
//                 ws.current.send(JSON.stringify(payload));
//             } else {
//                 console.error("WebSocket not connected.");
//             }
//         };
        
        
//         useEffect(() => {
//         return () => {
//             disconnectWebSocket();
//         };
//         }, []);




//     // fetch batch list for chat 
//      const fetchTrainerBatchChatList = useCallback( async ({ search = "", batch__status = "" }) => {
//       if (loading) return;

//         setloading(true);
//         try {
//             const response = await axiosInstance.get(`/Trainer_login/trainer_all_batch_chats/`,
//                 {
//                 params: {
//                     search,
//                     batch__status
//                 }
//             }
//         );
//         const data = response.data;

//         setBatchChatList(prevData => {
//             if(JSON.stringify(prevData) !== JSON.stringify(data)){
//               return data;
//             }
//             return prevData;
//           });

//         //   console.log('trainer Batches List ', data)

//         } catch (error) {
//             console.error('Error fetching Chat Data', error);
//         }finally {
//             setloading(false);
//         }
//     },[loading]);

//     return { batchChatList, fetchTrainerBatchChatList, ws, batchChatMessage, connectWebSocket, sendMessage }
// }

// export default useTrainerBatchChats;

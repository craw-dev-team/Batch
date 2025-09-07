import { useCallback, useState, useEffect, useRef } from "react";
import { WEBSOCKET_URL } from "../../../../../ip/Ip";
import axiosInstance from "../../../../dashboard/api/api";




const useStudentBatchChat = () => {
    
    const [loading, setloading] = useState(false);    
    const [batchChatList, setBatchChatList] = useState();
    
    const [batchChatMessage, setbatchChatMessage] = useState([]);
    
    const ws = useRef(null);


    // const connectWebSocket = (batchId) => {
    //     const token = localStorage.getItem("token");
    //     if (!token || !batchId) return;

    //     // ✅ Close existing WebSocket if open
    //     if (ws.current) {
    //         ws.current.close();
    //         ws.current = null;
    //     }

    //     setbatchChatMessage([]);

    //     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    //     const wsUrl = `${protocol}://${WEBSOCKET_URL}/ws/student-batch-chat/${batchId}/?token=${token}`;

    //     ws.current = new WebSocket(wsUrl);

    //     ws.current.onopen = () => {
    //         console.log("WebSocket connected");
    //     };

    //     ws.current.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     console.log("WebSocket received:", data);

    //     if (data.type === "history") {
    //         // Initial batch load
    //         setbatchChatMessage(data); // full history replaces everything
    //     } else if (data.type === "chat") {
    //         // New real-time message
    //         setbatchChatMessage((prev) => {
    //         if (!prev) return { messages: [data], self_messages: [], type: "history" };

    //         return {
    //             ...prev,
    //             messages: [...prev.messages, data],
    //             // optionally: if it's sent by self, add to self_messages
    //             self_messages: data.sender === "admin" 
    //             ? [...(prev.self_messages || []), data] 
    //             : prev.self_messages,
    //         };
    //     });
    //     }
    //     } ;


    //     ws.current.onerror = (error) => {
    //     console.error("WebSocket error:", error);
    //     };

    //     ws.current.onclose = () => {
    //     console.log("WebSocket disconnected");
    //     };
    //     };



    const connectWebSocket = (batchId) => {
        if (!batchId) return;

        // ✅ Close existing WebSocket if open
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        setbatchChatMessage([]);

        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${protocol}://${WEBSOCKET_URL}/ws/student-batch-chat/${batchId}/`; // ✅ Token removed

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "history") {
                setbatchChatMessage(data); // full history
            } else if (data.type === "chat") {
                setbatchChatMessage((prev) => {
                    if (!prev) return { messages: [data], self_messages: [], type: "history" };
                    return {
                        ...prev,
                        messages: [...prev.messages, data],
                        self_messages:
                            data.sender === "admin"
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
                // console.log('payload',payload );
                
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




    // fetch batch list for chat 
     const fetchStudentBatchChatList = useCallback( async ({ search = "", batch__status = "" }) => {
      if (loading) return;

        setloading(true);
        try {
            const response = await axiosInstance.get(`/Student_login/student/all/batch/chats/`,
                {
                params: {
                    search,
                    batch__status
                }
            }
        );
        const data = response.data;

        setBatchChatList(prevData => {
            if(JSON.stringify(prevData) !== JSON.stringify(data)){
              return data;
            }
            return prevData;
          });

        } catch (error) {
            console.error('Error fetching Chat Data', error);
        }finally {
            setloading(false);
        }
    },[loading]);

    return { batchChatList, fetchStudentBatchChatList, ws, batchChatMessage, connectWebSocket, sendMessage }
}

export default useStudentBatchChat;
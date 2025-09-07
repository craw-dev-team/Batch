import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Empty } from 'antd';
import dayjs from "dayjs";
import { useSpecificStudent } from "../../Contexts/SpecificStudent";
import { useTheme } from "../../../Themes/ThemeContext";



const SpecificStudentLogs = () => {
    // for theme -------------------------
    const { getTheme } = useTheme();
    const theme = getTheme();
    // ------------------------------------


    const { specificStudent, loading, fetchSpecificStudent } = useSpecificStudent();
    const { studentId } = useParams();

    const { student_logs } = specificStudent?.All_in_One || [];
    

    useEffect(() => {
        if (studentId) {
            try {
                // Decode the ID before using it
                const originalStudentId = atob(studentId);
                 
                // Fetch trainer data with the decoded ID
                fetchSpecificStudent(originalStudentId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[student_logs]);


    
    return (
        <>
            <div className={`relative w-full px-4 pb-4 pt-2 mt-1 h-auto shadow-md rounded-xl ${theme.specificPageBg}`}>
                <div className={`w-full px-1 py-3 flex justify-between font-semibold ${theme.text}`}>
                    <h1>Logs</h1>
                </div>

                {/* <div className={`overflow-hidden px-4 pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm`}> */}
                    <div className="w-full h-auto md:max-h-[37rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2 bg-white/40">
                        <table className="w-full  text-xs font-normal text-left text-gray-600">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr className="bg-gray-50/80">
                                <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                                    s.No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Username
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Changes in
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Changes
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Description                       
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                                    Type                       
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1 md:w-20 text-xs font-medium uppercase">
                                    Time                       
                                </th>
                                
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 font-light text-gray-700">
                        {loading ? (
                                <tr>
                                    <td colSpan="100%" className="text-center py-4">
                                        <Spin size="large" />
                                    </td>
                                </tr>
                        
                        ) : Array.isArray(student_logs) && student_logs.length > 0 ? (
                            student_logs.map((item, index) => (
                            <tr key={item.id} className="hover:bg-white transition-colors scroll-smooth">
                                <td scope="row" className="px-3 py-2 md:px-2">
                                    { index + 1}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-medium">
                                    {item.actor_first_name || item.actor}
                                </td>

                                <td className="px-3 py-2 md:px-1 font-normal">
                                    {item.object_repr}
                                </td>

                                <td className="px-3 py-2 md:px-1 font-normal">
                                {typeof item.changes === "object"
                                    ? Object.entries(item.changes).map(([key, value]) => {
                                        if (typeof value === "object" && value.old !== undefined && value.new !== undefined) {
                                        return `${key}: ${value.old} ➝ ${value.new}\n`;
                                        } else {
                                        return `${key}: ${JSON.stringify(value)}\n`;
                                        }
                                    }).join("")
                                    : item.changes}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-normal">
                                    {item.changes_text}
                                </td>


                                <td className="px-3 py-2 md:px-1 font-normal">
                                    {item.content_type}
                                </td>

                                <td className="px-3 py-2 md:px-1 font-normal">
                                    {dayjs(item.timestamp).format("DD/MM/YYYY | hh:mm A")}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="100%" className="text-center py-4 text-gray-500">
                                <Empty description="No Student Logs Found" />
                            </td>
                        </tr>
                    )}
                        </tbody>
                        </table>
                    </div>

                {/* </div> */}
            </div>

        </>
    )
};


export default SpecificStudentLogs;
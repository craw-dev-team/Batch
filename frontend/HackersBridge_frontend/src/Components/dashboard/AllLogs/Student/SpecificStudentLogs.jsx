import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Empty } from 'antd';
import dayjs from "dayjs";
import { useSpecificStudent } from "../../Contexts/SpecificStudent";



const SpecificStudentLogs = () => {
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
           <div className="w-auto mt-0 bg-white">
                <div className="relative w-full h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                        <h1>Logs</h1>
                    </div>

                    <div className={`overflow-hidden pb-2 relative `}>
            <div className="w-full h-[50rem] overflow-y-auto  rounded-lg pb-2">
            <table className="w-full text-xs text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50 sticky top-0 z-10">
                <tr>
                    <th scope="col" className="px-3 py-3 md:px-2">
                        s.No
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Username
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Changes in
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Changes
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Description                       
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1">
                        Type                       
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 md:w-20">
                        Time                       
                    </th>
                    
                </tr>
            </thead>
            <tbody>
            {loading ? (
                    <tr>
                        <td colSpan="100%" className="text-center py-4">
                            <Spin size="large" />
                        </td>
                    </tr>
               
            ) : Array.isArray(student_logs) && student_logs.length > 0 ? (
                student_logs.map((item, index) => (
                <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                        { index + 1}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.actor_first_name || item.actor}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {item.object_repr}
                    </td>

                    <td className="px-3 py-2 md:px-1">
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
                    <td className="px-3 py-2 md:px-1">
                        {item.changes_text}
                    </td>


                    <td className="px-3 py-2 md:px-1">
                        {item.content_type}
                    </td>

                    <td className="px-3 py-2 md:px-1">
                        {dayjs(item.timestamp).format("DD-MM-YYYY hh:mm A")}
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

        </div>
                </div>
            </div>
        </>
    )
};


export default SpecificStudentLogs;
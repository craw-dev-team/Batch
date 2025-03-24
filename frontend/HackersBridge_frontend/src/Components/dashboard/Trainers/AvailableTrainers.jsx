import React, { useState, useMemo } from "react";
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { Avatar, Tooltip, Tag } from 'antd';

const AvailableTrainers = () => {
  const [sortByName, setSortByName] = useState(false);
  const [sortByStartTime, setSortByStartTime] = useState(false);
  const { availableTrainers, loading } = useTrainerForm();

  const freeTrainers = availableTrainers?.free_trainers ?? [];

  const toggleSortByName = () => {
    setSortByName((prev) => !prev);
    setSortByStartTime(false); // Reset start_time sorting when sorting by name
  };
  
  const toggleSortByStartTime = () => {
    setSortByStartTime((prev) => !prev);
    setSortByName(false); // Reset name sorting when sorting by start_time
  };
  
  const sortedData = useMemo(() => {
    let sorted = [...freeTrainers];
  
    if (sortByName) {
      sorted.sort((a, b) => a.name.localeCompare(b.name)); // Always Ascending
    } else if (sortByStartTime) {
      sorted.sort((a, b) => a.start_time.localeCompare(b.start_time)); // Sort by Time as String
    }
  
    return sorted;
  }, [freeTrainers, sortByName, sortByStartTime]);

  return (
    <div className={"overflow-hidden pb-2"}>
    <div className="w-full h-[38rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
    <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
        <tr>
            <th scope="col" className="px-3 py-3 md:px-2">
                S.No
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Trainer ID
            </th>
            <th className="px-3 py-3  md:px-1 cursor-pointer" onClick={toggleSortByName}>
              <Tooltip title="sort by Trainer Name" placement="right">
                Trainer Name {sortByName ? "▲" : "▼"} 
              </Tooltip>
            </th>

            <th className="px-3 py-3 md:px-1 cursor-pointer" onClick={toggleSortByStartTime}>
              <Tooltip title="sort by Trainer Name" placement="right">
                Start Time {sortByStartTime  ? "▲" : "▼"} 
              </Tooltip>
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                End Time
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                course
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Language
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Location
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Free Days
            </th>
          
            
        </tr>
        </thead>
            <tbody>
            {Array.isArray(sortedData) && sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                        {index + 1}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-semibold">
                        {item.trainer_id}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.name} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {new Date(`1970-01-01T${item.start_time}`).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                      })} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {new Date(`1970-01-01T${item.end_time}`).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                      })} 
                    </td>
                    <td className="px-3 py-2 md:px-1 font-semibold">
                        <Avatar.Group
                            maxCount={2} // Show only 2 avatars initially
                            maxStyle={{
                                color: "#f56a00",
                                backgroundColor: "#fde3cf",
                                height: "24px", // Match avatar size
                                width: "24px", // Match avatar size
                            }}
                        >
                            {item.course &&
                              item.course.map(([id, name], index) => ( // Destructure to get name
                                <Tooltip key={id} title={name} placement="top">
                                  <Avatar size={24} style={{ backgroundColor: "#87d068" }}>
                                    {name[0]} {/* Display first letter of course name */}
                                  </Avatar>
                                </Tooltip>
                              ))}
                        </Avatar.Group>
                        {/* {item.course__name} */}
                    </td>
                    <td className="px-3 py-2 md:px-1">
                    <Tag bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      <Tag color={item.location === "Saket" ? 'blue' : "magenta"}>
                        {item.location}
                      </Tag>          
                    </td>
                    <td className="px-3 py-2 md:px-1">
                        {item.free_days}
                    </td>
                   
                </tr>
              ))
            ) : (
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colSpan="5" className="text-center py-3 text-gray-500">
                        No batches found for {activeTab}
                    </td>
                </tr>
            )}
      </tbody>
  </table>
  </div>
  </div>
  );
};

export default AvailableTrainers;

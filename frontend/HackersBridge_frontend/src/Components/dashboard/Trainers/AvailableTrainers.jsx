import React, { useState, useMemo } from "react";
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { Avatar, Tooltip, Tag } from 'antd';
import { CreateAvailableBatchForm } from "../Batches/AvailableBatches";
import { useNavigate } from "react-router-dom";
import { handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";

const AvailableTrainers = () => {
  const [sortByName, setSortByName] = useState(false);
  const [sortByStartTime, setSortByStartTime] = useState(false);
  const { availableTrainers, loading } = useTrainerForm();

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedBatch, setSelectedBatch] = useState(null);

  const navigate = useNavigate();

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


     // THIS FUNCTION CREATE BATCH OF TRAINER'S FREE TIME 
     const handleCreateClick = (trainer) => {
      setSelectedBatch({
          ...trainer, 
          courses: trainer.course?.map(([id, name]) => ({ id, name })) || [], // Extract id & name
      });
      setIsModalOpen(true);
  };
  


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
                Preferred Week
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Location
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Free Since
            </th>
            <th scope="col" className="px-3 py-3 md:px-1">
                Create Batch
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
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(navigate,item.tr_id)}>
                        {item.trainer_id}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleTrainerClick(navigate,item.tr_id)}>
                        {item.name} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {dayjs(`1970-01-01T${item.start_time}`).format("hh:mm A")} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {dayjs(`1970-01-01T${item.end_time}`).format("hh:mm A")} 
                    </td>
                    <td className="px-3 py-2 md:px-1 font-semibold">
                        <Avatar.Group
                           max={{
                              count: 2,
                              style: {
                                  color: "#f56a00",
                                  backgroundColor: "#fde3cf",
                                  height: "24px", // Match avatar size
                                  width: "24px", // Match avatar size
                            }
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
                      <Tag color={item.week === "Weekdays" ? 'cyan' : item.week === "Weekends" ? "gold" : "geekblue"}>
                        {item.week}
                      </Tag>          
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      <Tag color={item.location === "Saket" ? 'blue' : "magenta"}>
                        {item.location}
                      </Tag>
                    </td>
                    <td className="px-3 py-2 md:px-1">
                    {item.free_days >= 0 ? item.free_days + " Days" : item.free_days}
                    </td>
                    
                    <td className="px-3 py-2 md:px-1">
                      <button 
                          onClick={() => handleCreateClick(item)} 
                          type="button" 
                          className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                      >
                        Create +
                      </button>
                    </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td colSpan="5" className="text-center py-3 text-gray-500">
                        No batches found
                    </td>
                </tr>
            )}
                <CreateAvailableBatchForm isOpen={isModalOpen} selectedBatch={selectedBatch} onClose={() => setIsModalOpen(false)} />
            
      </tbody>
  </table>
  </div>
  </div>
  );
};

export default AvailableTrainers;

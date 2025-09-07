import React, { useState, useMemo } from "react";
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { Avatar, Tooltip, Tag } from 'antd';
import { CreateAvailableBatchForm } from "../Batches/AvailableBatches";
import { useNavigate } from "react-router-dom";
import { handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";
import { useTheme } from "../../Themes/ThemeContext";

const AvailableTrainers = () => {
    // for theme -------------------------
      const { getTheme } = useTheme();
      const theme = getTheme();
    // ------------------------------------
  
  const [sortByName, setSortByName] = useState(false);
  const [sortByStartTime, setSortByStartTime] = useState(false);
  const { availableTrainersData, loading } = useTrainerForm();

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedBatch, setSelectedBatch] = useState(null);

  const navigate = useNavigate();

  const freeTrainers = availableTrainersData?.free_trainers ?? [];

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
    <div className={"overflow-hidden pb-2 relative bg-white/40 backdrop-blur-sm rounded-xl shadow-sm"}>
    <div className="w-full h-[37rem] md:max-h-[32rem] 2xl:max-h-[37rem] overflow-y-auto rounded-xl pb-2">
    <table className="w-full text-xs font-normal text-left text-gray-500">
    <thead className="bg-white sticky top-0 z-10">
        <tr className="bg-gray-50/80">
            <th scope="col" className="px-3 py-3 md:px-2 text-xs font-medium uppercase">
                S.No
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Trainer ID
            </th>
            <th className="px-3 py-3  md:px-1 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByName}>
              <Tooltip title="sort by Trainer Name" placement="right">
                Trainer Name {sortByName ? "▲" : "▼"} 
              </Tooltip>
            </th>

            <th className="px-3 py-3 md:px-1 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByStartTime}>
              <Tooltip title="sort by Trainer Name" placement="right">
                Start Time {sortByStartTime  ? "▲" : "▼"} 
              </Tooltip>
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                End Time
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                course
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Language
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Preferred Week
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Location
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Free Since
            </th>
            <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                Create Batch
            </th>
          
            
        </tr>
        </thead>
            <tbody className="divide-y divide-gray-100 font-light text-gray-700">
            {Array.isArray(sortedData) && sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                    <td scope="row" className="px-3 py-2 md:px-2">
                        {index + 1}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.tr_id)}>
                        {item.trainer_id}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.tr_id)}>
                        {item.name} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {dayjs(`1970-01-01T${item.start_time}`).format("hh:mm A")} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
                      {dayjs(`1970-01-01T${item.end_time}`).format("hh:mm A")} 
                    </td>
                    <td className="px-3 py-2 md:px-1">
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
                                  <Avatar 
                                    size={24} 
                                    className={`${theme.studentCount} text-white`}
                                  >
                                    {name[0]}
                                  </Avatar>
                                </Tooltip>
                              ))}
                        </Avatar.Group>
                        {/* {item.course__name} */}
                    </td>
                    <td className="px-3 py-2 md:px-1 font-normal">
                      <Tag className="rounded-xl" bordered={false} color={item.languages == 'Hindi'? 'green' : item.languages == 'English'? 'volcano' : 'blue'}>{item.languages}</Tag>
                    </td>
                    <td className="px-3 py-2 md:px-1 font-normal">
                      <Tag className="rounded-xl" bordered={false} color={item.week === "Weekdays" ? 'cyan' : item.week === "Weekends" ? "gold" : "geekblue"}>
                        {item.week}
                      </Tag>          
                    </td>
                    <td className="px-3 py-2 md:px-1 font-normal">
                      <Tag className="rounded-xl" bordered={false} color={item.location === "Saket" ? 'blue' : "magenta"}>
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
                          className={`focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 shadow-lg hover:shadow-xl transition-all duration-200 ${theme.createBtn}`}>
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

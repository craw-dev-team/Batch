import React, { useState, useEffect, useMemo } from "react";
import { Tooltip, Tag, Empty } from 'antd';
import {DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTrainerForm } from "../Trainercontext/TrainerFormContext";
import { useNavigate } from "react-router-dom";
import handleBatchClick, { handleTrainerClick } from "../../Navigations/Navigations";
import dayjs from "dayjs";


const FutureAvailableTrainers = () => {


    const [sortByName, setSortByName] = useState(false);
    const [sortByStartTime, setSortByStartTime] = useState(false);
    const { availableTrainersData, loading } = useTrainerForm();

    const navigate = useNavigate();

    const futureAvailableTrainers = availableTrainersData?.future_availability_trainers ?? [];
    
    const toggleSortByName = () => {
      setSortByName((prev) => !prev);
      setSortByStartTime(false); // Reset start_time sorting when sorting by name
    };
    
    const toggleSortByStartTime = () => {
      setSortByStartTime((prev) => !prev);
      setSortByName(false); // Reset name sorting when sorting by start_time
    };
    
    const sortedData = useMemo(() => {
      let sorted = [...futureAvailableTrainers];
    
      if (sortByName) {
        sorted.sort((a, b) => a.name.localeCompare(b.name)); // Always Ascending
      } else if (sortByStartTime) {
        sorted.sort((a, b) => a.start_time.localeCompare(b.start_time)); // Sort by Time as String
      }
    
      return sorted;
    }, [futureAvailableTrainers, sortByName, sortByStartTime]);

    


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
                    <th scope="col" className="px-3 py-3  cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByName}>
                      <Tooltip title="sort by Trainer Name" placement="top">
                        Trainer Name  {sortByName ? <UpOutlined /> : <DownOutlined />} 
                      </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 cursor-pointer text-xs font-medium uppercase" onClick={toggleSortByStartTime}>
                      <Tooltip title="sort by Start Time" placement="top">
                        Start Time  {sortByStartTime  ? <UpOutlined /> : <DownOutlined />} 
                      </Tooltip>
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        End Time
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        Start Date
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        End Date
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        course
                    </th>
                    {/* <th scope="col" className="px-3 py-3 md:px-1">
                        Mode
                    </th> */}
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        Batch ID
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        Preferred Week
                    </th>
                    <th scope="col" className="px-3 py-3 md:px-1 text-xs font-medium uppercase">
                        Days Left
                    </th>
                    
                </tr>
                </thead>
                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                    {Array.isArray(sortedData) && sortedData.length > 0 ? (
                        sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors scroll-smooth">
                            <td scope="row" className="px-3 py-2 md:px-2">
                                {index + 1}
                            </td>
                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleTrainerClick(navigate,item.tr_id)}>
                                {item.trainer_id}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.name} 
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {dayjs(`1970-01-01T${item.start_time}`).format("hh:mm A")}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {dayjs(`1970-01-01T${item.end_time}`).format("hh:mm A")}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                            {dayjs(item.start_date).format("DD/MM/YYYY")}
                            </td>
                            <td className="px-3 py-2 md:px-1">
                            {dayjs(item.end_date).format("DD/MM/YYYY")}
                            </td>
                            <td className="px-3 py-2 md:px-1 font-medium">
                                {item.batch_course}
                            </td>
                            {/* <td className="px-3 py-2 md:px-1">
                                {item.mode}
                            </td> */}
                            <td className="px-3 py-2 md:px-1 font-medium cursor-pointer" onClick={() => handleBatchClick(navigate,item.batch__id)}>
                                {item.batch_id}
                            </td>
                          
                            <td className="px-3 py-2 md:px-1 font-normal">
                                <Tag className="rounded-xl" bordered={false} color={item.batch_week === "Weekdays" ? "cyan" : item.batch_week === "Weekends" ? "gold" : "geekblue" }>
                                    {item.batch_week}
                                </Tag>
                            </td>
                            <td className="px-3 py-2 md:px-1">
                                {item.free_days >= 0 ? item.free_days + " Days" : item.free_days}
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
              </tbody>
    </table>
    </div>
    </div>
    
  );
};

export default FutureAvailableTrainers;

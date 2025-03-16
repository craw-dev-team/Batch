import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useSpecificStudent } from "../Contexts/SpecificStudent";
import { useSpecificBatch } from "../Contexts/SpecificBatch";




const SpecificBatchPage = () => {
    const { batchId } = useParams();
    const { specificBatch, fetchSpecificBatch } = useSpecificBatch();
    const [activeTab, setActiveTab] = useState("running");
 
    
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    useEffect(() => {
        if (batchId) {
            try {
                // Decode the ID before using it
                const originalTrainerId = atob(batchId);
                
                // Fetch trainer data with the decoded ID
                fetchSpecificBatch(originalTrainerId);
            } catch (error) {
                console.error("Error decoding trainer ID:", error);
            }
        }
    },[batchId]);
    
    const batchDetails = specificBatch?.batch;
    console.log(batchDetails);
    

    // const filteredStudentData = specificStudent?.All_in_One
    //     ? activeTab === 'running'
    //     ? specificStudent?.All_in_One?.student_batch_ongoing
    //     : activeTab === 'scheduled'
    //     ? specificStudent?.All_in_One?.student_batch_upcoming
    //     : activeTab === 'completed'
    //     ? specificStudent?.All_in_One?.student_batch_completed
    //     : activeTab === 'allupcomingbatches'
    //     ? specificStudent?.All_in_One?.all_upcoming_batch
    //     : []
    // :[];


    return (
        <>
        <div className="w-auto h-full pt-20 px-2 mt-0 darkmode">
            <div className="grid grid-cols-6 gap-x-6">
                    {batchDetails ? (
                    <>
                <div className="px-4 py-4 col-span-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border">
                    
                    <div className="w-full h-auto px-1 py-3 text-lg font-semibold">
                        <p># {batchDetails.batch_id}</p>
                    </div>
                        <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 px-4 py-4 gap-4">

                        
                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Trainer</h1>
                            <p className="font-semibold">{batchDetails.trainer_name}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1">
                            <h1>Course</h1>
                            <p className="font-semibold">{batchDetails.course_name}</p>
                        </div>
                        
                        <div className="col-span-1 px-1 py-1">
                            <h1 >Start Time</h1>
                            <p className="font-semibold">{batchDetails.batch_time_data?.start_time}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1">
                            <h1 >End Time</h1>
                            <p className="font-semibold">{batchDetails.batch_time_data?.end_time}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Preferred Week</h1>
                            <p className="font-semibold">{batchDetails.preferred_week}</p>
                        </div>
                        
                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Location</h1>
                            <p className="font-semibold">{batchDetails.batch_location}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Language</h1>
                            <p className="font-semibold">{batchDetails.language}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Mode</h1>
                            <p className="font-semibold">{batchDetails.mode}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>Start Date</h1>
                            <p className="font-semibold">{batchDetails.start_date}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 md:mt-0 sm:mt-6">
                            <h1>End Date</h1>
                            <p className="font-semibold">{batchDetails.end_date}</p>
                        </div>

                        <div className="col-span-1 px-1 py-1 lg:mt-0 sm:mt-6">
                            <h1>Status</h1>
                            <p className="font-semibold">{batchDetails.status}</p>
                        </div>

                        </div>
                </div>

                <div className="px-4 py-4 col-span-5 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full font-semibold">
                        
                        <div className="col-span-1 text-lg px-4 py-4">
                            <h1>Students</h1>
                        </div>

                        <div className="col-span-1 px-4 py-2 leading-8">
                            <ul>
                            {specificBatch?.students.map((student, index) => (
                              <>
                                <li className="" key={index}><span className="mr-4">{index + 1} :</span>{student.name}</li>
                              </>
                            ))}


                            </ul>
                        </div>

                    </div>
                </div>

                
                    </>
                    ) : (
                        <p>Loading student data...</p>
                    )}
            </div>


           
                    
                
                   
        </div>  
        </>
    )

}

export default SpecificBatchPage;
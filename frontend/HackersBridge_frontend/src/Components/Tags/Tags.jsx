

const Tags = () => {

    return (
        <>
              <div className="relative w-full h-full mt-2 shadow-md sm:rounded-lg darkmode border border-gray-50 dark:border dark:border-gray-600">
                    <div className="w-full px-4 py-3 text flex justify-between font-semibold ">
                        <h1>All Tags</h1>
                            <div>
                                {/* <button onClick={() =>  { setIsModalOpen(true); setSelectedCoordinator(null); }} type="button" className="focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Add Coordinator +</button> */}
                            </div>
                    </div>

                    <div className={`overflow-hidden pb-2 relative`}>
                        <div className="w-full h-[30rem] overflow-y-auto dark:border-gray-700 rounded-lg pb-2">
                    <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 ">
                        <thead className="text-xs text-gray-700 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    S.No
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Tag Name
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Description
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3 md:px-1">
                                    Action
                                </th>
                                
                            </tr>
                        </thead>
                        <tbody>
                        {/* {loading ? (
                            <tr>
                                <td colSpan="100%" className="text-center py-4">
                                    <Spin size="large" />
                                </td>
                            </tr> */}
                    
                        {/* // ) : coordinatorData &&  Array.isArray(coordinatorData) && coordinatorData.length > 0 ? (
                        //     coordinatorData.map((item, index) => (     */}
                                <tr  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 scroll-smooth">
                                {/* <td scope="row" className="px-3 py-2 md:px-2 font-medium text-gray-900  dark:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2 md:px-1 font-bold cursor-pointer" onClick={() => handleCoordinatorClick(navigate,item.id)}>
                                    {item.coordinator_id}
                                </td> */}
                               
                                
                               
                                
                                {/* <td > <Button 
                                        color="primary" 
                                        variant="filled" 
                                        className="rounded-lg w-auto pl-3 pr-3 py-0 my-1 mr-1"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the click from bubbling to the <td> click handler
                                            handleEditClick(item);  // Open the form with selected course data
                                            setIsModalOpen(true);   // Open the modal
                                        }}
                                    >
                                        <EditOutlined />
                                    </Button>
                                    <Popconfirm
                                        title="Delete the Coordinator"
                                        description="Are you sure you want to delete this Coordinator?"
                                        onConfirm={() => confirm(item.id)}
                                        onCancel={cancel}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button 
                                            color="danger" 
                                            variant="filled" 
                                            className="rounded-lg w-auto px-3"
                                            onClick={(e) => e.stopPropagation()} // Prevent the click from triggering the Edit button
                                        >
                                            <DeleteOutlined />
                                        </Button>
                                </Popconfirm>
                                </td> */}
                            </tr>
                            {/* )) */}
                        {/* ) : (
                            <tr>
                                <td colSpan="100%" className="text-center py-4 text-gray-500">
                                    <Empty description="No Coordinators found" />
                                </td>
                            </tr>
                        )} */}
                        </tbody>
                    </table>
                    </div>

                    </div>
                </div>
        </>
    )
};

export default Tags;
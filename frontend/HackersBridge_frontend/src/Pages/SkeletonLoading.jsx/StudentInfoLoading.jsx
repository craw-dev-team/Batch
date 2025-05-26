



const StudentInfoLoading = () => {
  
    return (
        <>
        <div className="col-span-6 space-y-4 animate-pulse">
  <div className="bg-white border border-gray-100 rounded-md shadow px-4 py-4 space-y-4">
    <div className="h-6 bg-gray-200 rounded w-2/5 2xl:w-1/6"></div>

    <div className="grid 2xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-3 grid-cols-2 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-2/4"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  </div>

  <div className="px-1 py-4 col-span-6 mt-6 h-auto shadow-md sm:rounded-lg border border-gray-100 darkmode animate-pulse">
  <div className="w-full font-semibold space-y-4">
    
    {/* Header Skeleton */}
    <div className="col-span-1 text-lg px-1 py-4">
      <div className="h-6 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
    </div>

    {/* Table Skeleton */}
    <div className="col-span-1 border overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="text-xs uppercase bg-green-200 sticky top-0 z-10">
          <tr>
            {["S.No", "Course Name", "Course Status", "Batch Taken", "Books"].map((header, i) => (
              <th key={i} className="px-3 py-3">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(8)].map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="bg-white border-b border-gray-200"
            >
              <td className="px-3 py-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/5"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/3"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/6"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  </div>
</div>

</div>

        </>
    )
};


export default StudentInfoLoading;
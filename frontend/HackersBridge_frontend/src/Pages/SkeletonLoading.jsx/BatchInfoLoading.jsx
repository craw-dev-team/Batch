


const BatchInfoLoading = () => {

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

            </div>
        </>
    )
};


export default BatchInfoLoading;
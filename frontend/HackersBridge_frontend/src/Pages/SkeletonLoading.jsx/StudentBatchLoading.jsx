const StudentBatchLoading = () => {
    return (
        <>
            <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 grid-cols-1 2xl:text-md md:text-md text-xs px-2 py-4 gap-4 animate-pulse">
                {[...Array(1)].map((_, index) => (
                    <div
                        key={index}
                        className="min-h-[10rem] md:w-96 2xl:w-96 duration-300 shadow-md hover:shadow-xl transition-shadow hover:scale-100 cursor-pointer bg-white rounded-md"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start px-[14px] pt-2 pb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-7 bg-gray-300 rounded" />
                                <div className="w-16 h-4 bg-gray-300 rounded" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="w-12 h-3 bg-gray-200 rounded" />
                                <div className="w-12 h-3 bg-gray-200 rounded" />
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-[14px] py-2 flex flex-col gap-2">
                            <div className="w-2/4 h-3 bg-gray-200 rounded" />
                            <div className="w-3/5 h-3 bg-gray-200 rounded" />
                            <div className="w-1/3 h-3 bg-gray-200 rounded" />
                        </div>

                        {/* Footer */}
                        <div className="px-[14px] pb-0 mt-auto flex flex-col">
                            <div className="flex justify-between items-center mb-0 w-full">
                                <div className="flex gap-2">
                                    <div className="w-12 h-4 bg-gray-200 rounded-full" />
                                    <div className="w-12 h-4 bg-gray-200 rounded-full" />
                                    <div className="w-16 h-4 bg-gray-200 rounded-full" />
                                </div>
                                <div className="">
                                    <div className="w-14 h-6 bg-green-300 rounded-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
};

export default StudentBatchLoading;

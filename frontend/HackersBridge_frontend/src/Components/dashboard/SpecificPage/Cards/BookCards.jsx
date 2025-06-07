import React, { useState, useEffect } from 'react';
import { Card, Col, Row, DatePicker, Select, Popover, Empty } from 'antd';
import { useBookForm } from '../../BooksContext/BookFormContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;


const BookCards = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const { booksCountData, selectedOption, setSelectedOption, startDate, setStartDate, endDate, setEndDate, handleBookFilter  } = useBookForm();
    
    useEffect(() => {
        handleBookFilter();
    },[])
    
    const { all_book_tasks } = booksCountData || {};

    // Extract only keys that end with `_count`
    const cards = all_book_tasks
    ? Object.keys(all_book_tasks)
        .filter((key) => key.endsWith('_count'))
        .map((key) => ({
            key,
            label: key.replace('_count', '').replace(/_/g, ' '),
            count: all_book_tasks[key] || 0,
        }))
    : [];

    const allCountsZero = cards.every((card) => card.count === 0);




     // handle status change to date select in dropdown
        const handleRangeChange = (value) => {
            if (value && value.length === 2) {
              const start = value[0].format("YYYY-MM-DD");
              const end = value[1].format("YYYY-MM-DD");
          
              setStartDate(start);
              setEndDate(end);

              handleBookFilter("custom", start, end);
              setIsPopoverOpen(false)
            } else {
              setStartDate(null);
              setEndDate(null);
            }
          };


    return (
        <>
            <div className="w-full flex justify-end py-1 mb-1 px-4">
                <div className="flex items-start space-x-2">
                    {/* Popover to the left of Select */}
                    {selectedOption === "custom" && (
                    <Popover
                        placement="leftTop"
                        content={
                        <RangePicker
                            format="YYYY-MM-DD"
                            value={[
                            startDate ? dayjs(startDate) : null,
                            endDate ? dayjs(endDate) : null,
                            ]}
                            onChange={handleRangeChange}
                        />
                        }
                        open={isPopoverOpen}
                    >
                        <div className="w-0 h-0" /> {/* Dummy element to trigger the Popover */}
                    </Popover>
                    )}

                    {/* Select Field */}
                    <Select
                    placeholder="Filter By Date"
                    className="w-44 text-sm rounded border"
                    value={selectedOption}
                    onChange={(value) => {
                        setSelectedOption(value);
                        if (value === "custom") {
                            setIsPopoverOpen(true);
                        } else if (value === "this month") {
                            handleBookFilter(); // no filter
                        } else {
                            const status = value.toLowerCase().replace(/\s/g, "_");
                            handleBookFilter(status);
                        }
                        }}
                  
                    options={[
                        { value: "today", label: "Today" },
                        { value: "yesterday", label: "Yesterday" },
                        { value: "this week", label: "This Week" },
                        { value: "last week", label: "Last Week" },
                        { value: "this month", label: "This Month" },
                        { value: "last month", label: "Last Month" },
                        { value: "this year", label: "This Year" },
                        { value: "last year", label: "Last Year" },
                        { value: "custom", label: "Custom Dates" },
                    ]}
                    />
                </div>

                {/* Conditionally show buttons only if custom is selected */}
                {selectedOption === "custom" && (
                    <div className="flex gap-2 ml-2">
                    {/* <button
                        onClick={() => {
                            handleBookFilter("custom", startDate, endDate);
                            setIsPopoverOpen(false); // close popover
                        }}
                        disabled={loading}
                        className="text-xs px-3 py-1 bg-blue-500 text-white rounded"
                    >
                        Save
                    </button> */}
                    <button
                        onClick={() => {
                            setSelectedOption("this month");
                            setIsPopoverOpen(false); // close popover
                            handleBookFilter();
                        }}

                        className="text-xs px-3 py-1 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
                    >
                        Cancel
                    </button>
                    </div>
                )}
            </div>


        {cards.length === 0 || allCountsZero ? (
        <div className="w-full text-center text-gray-500  text-sm">
           <Empty description={`No Book Issued ${selectedOption}`}/>
        </div>
        ) : (
            <Row gutter={[14, 14]}>
            {cards.map(({ key, label, count }) => (
                <Col span={4} key={key}>
                <Card
                    title={<span style={{ fontSize: '18px' }}>{count}</span>}
                    variant="bordered"
                    className={`!p-0 rounded-md shadow-sm font-semibold transition-all duration-150 ${
                    key !== "all" ? "cursor-pointer" : "cursor-default"
                    }
                    `}
                    styles={{
                    header: {
                        padding: '2px 8px',
                        height: '28px',
                        backgroundColor: '#ebf5ff',
                    },
                    body: {
                        padding: '4px 8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px',
                        overflow: 'hidden',
                    }
                    }}
                    {...(key !== "all" && { onClick: () => handleTabClick(key) })}
                >
                    <div className="truncate">{label}</div>
                </Card>
                </Col>
            ))}
            </Row>
        )}
        </>
    )
}
export default BookCards;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams   } from 'react-router-dom';
import { Card, Col, Row, DatePicker, Select, Popover, Empty } from 'antd';
import dayjs from 'dayjs';
import { useBookForm } from '../../../BooksContext/BookFormContext';

const { RangePicker } = DatePicker;


const BookCards = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const { booksCountData, selectedOption, setSelectedOption, startDate, setStartDate, endDate, setEndDate, handleBookFilter  } = useBookForm();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();


    // TO FETCH DATA ON INITIAL MOUNT 
    // useEffect(() => {
    //     handleBookFilter();
    // },[])


    // TO FETCH SAME DATA WHEN COME FROM STUDENT CARD LIST , URL (/books/card/course_name)
    // On mount, read filters from URL params and set state
    useEffect(() => {
        const filter = searchParams.get('filter') || 'this month';
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        setSelectedOption(filter);

        if (filter === 'custom' && start && end) {
        setStartDate(start);
        setEndDate(end);
        handleBookFilter('custom', start, end);
        } else if (filter === 'this month') {
        handleBookFilter(); // default no-filter
        } else {
        const status = filter.toLowerCase().replace(/\s/g, '_');
        handleBookFilter(status);
        }
    }, []); // Run once on mount


    // When selectedOption or dates change, update URL params and refetch data
    useEffect(() => {
        if (selectedOption === 'custom') {
        if (startDate && endDate) {
            setSearchParams({ filter: 'custom', start: startDate, end: endDate });
            handleBookFilter('custom', startDate, endDate);
        }
        } else if (selectedOption === 'this month') {
        setSearchParams({ filter: 'this month' });
        handleBookFilter();
        } else {
        const status = selectedOption.toLowerCase().replace(/\s/g, '_');
        setSearchParams({ filter: selectedOption });
        handleBookFilter(status);
        }
    }, [selectedOption, startDate, endDate]);


    
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


        // HANDLE NAVIGATE TO /book/card/ 
        const handleCardClick = (label) => {
            const formattedKey = label.replace(/ /g, "_"); 
            const taskKey = `${formattedKey}_book_take_by`;
            const selectedData = booksCountData?.all_book_tasks?.[taskKey] || [];

            navigate(`/book/card/${formattedKey}?filter=${selectedOption}&start=${startDate}&end=${endDate}`, {
            state: { data: selectedData },
            });
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
                        size='small'
                        className="w-44 text-sm rounded border"
                        value={selectedOption}
                        onChange={(value) => {
                            setSelectedOption(value);
                            if (value === 'custom') {
                                setIsPopoverOpen(true);
                            } else {
                                setIsPopoverOpen(false);
                                setStartDate(null);
                                setEndDate(null);
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
                    {...(key !== "all" && { onClick: () => handleCardClick(label)})}
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
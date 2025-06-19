



// HANDLE NAVIGATE TO SPECIFIC BATCH PAGE 
    const handleBatchClick = (navigate,batchId) => {
        if (!batchId) return;
        const encodedBatchId = btoa(batchId);
        navigate(`/batches/${encodedBatchId}`);
    };

export default handleBatchClick;


// HANDLE NAVIGATE TO SPECIFIC STUDENT PAGE 
    const handleStudentClick = (navigate,studentId) => {
        if (!studentId) return;        
        const encodedStudentId = btoa(studentId);        
        navigate(`/students/${encodedStudentId}`);
    };

export {handleStudentClick};



// HANDLE NAVIGATE TO SPECIFIC TRAINER PAGE 
    const handleTrainerClick = (navigate,trainerId) => {    
        if (!trainerId) return;
        const encodedTrainerId = btoa(trainerId); 
        navigate(`/trainers/${encodedTrainerId}`);
    };

export {handleTrainerClick};


// HANDLE NAVIGATE TO SPECIFIC PAGE 
    const handleCourseClick = (navigate,courseId) => {
        if (!courseId) return;
        const encodedCourseId = btoa(courseId);
        navigate(`/course/${encodedCourseId}`)
    };

export {handleCourseClick};


// HANDLE NAVIGATE TO SPECIFIC BOOK PAGE 
    const handleBookClick = (navigate,bookId) => {
        if (!bookId) return;
        const encodedBookId = btoa(bookId); 
        navigate(`/book/${encodedBookId}`);
    };

export {handleBookClick};



// HANDLE NAVIGATE TO SPECIFIC COORDINATOR PAGE 
    const handleCoordinatorClick = async (navigate,coordinatorId) => {
        if (!coordinatorId) return;
            const encodedCoordinatorId = btoa(coordinatorId);
            navigate(`/add-details/coordinators/${encodedCoordinatorId}`);
    };

export {handleCoordinatorClick};
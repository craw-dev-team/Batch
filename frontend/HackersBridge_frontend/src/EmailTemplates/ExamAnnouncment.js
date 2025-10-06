


const ExamAnnouncement = (data) => {



return `

    <div style="padding: 30px; font-size: 16px; color: #000;">
        <h2 style="text-align: center; font-size: 22px; color: #000;">📢 Exam Schedule Announcement</h2>
        <p style="color: #000;">Dear <strong>Student</strong>,</p>
        <p style="color: #000;">This is to inform you that your course exam for <strong> ${data?.batch?.course_name }</strong> is scheduled on <strong> DD / MM / YYYY </strong>. Please ensure your presence on this day.</p>
        <p style="color: #000;">As part of our certification process, you must achieve a minimum of <strong>75%</strong> in this exam. If you fail to meet this requirement, you will not be eligible to receive the course completion certificate.</p>
        <p style="color: #000;">Prepare well and give your best. We are confident in your ability to succeed!</p>
        <p style="margin-top: 30px; color: #000;">
            📍 <strong>Our Address:</strong><br>
            1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
            Behind Saket Metro Station, New Delhi 110030
        </p>
        <p style="color: #000;">
            📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445 | +91-9650677445<br>
            📧 <strong>Email:</strong> training@craw.in<br>
            🌐 <strong>Website:</strong> 
            <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
        </p>
        <p style="color: #000;">
            Best regards,<br>
            <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
        </p>
    </div>
`;
}

export default ExamAnnouncement;
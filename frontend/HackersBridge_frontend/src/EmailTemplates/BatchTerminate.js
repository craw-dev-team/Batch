import { to12HourFormat } from ".";



const BatchTerminate = (data) => {

    return `

    <div style="padding: 30px; font-size: 16px; color: #000;">
            <h2 style="text-align: center; font-size: 22px; color: #b30000;">❌ Batch Termination Notice</h2>
            <p>Dear <strong>Student</strong>,</p>

            <p>We regret to inform you that your enrollment in the <strong>${data?.batch?.course_name}</strong> course, batch <strong>${data?.batch?.batch_id}</strong> scheduled at <strong>${to12HourFormat(data?.batch?.batch_time_data?.start_time)} - ${to12HourFormat(data?.batch?.batch_time_data?.end_time)}</strong>, has been <strong>terminated</strong> by the coordinator due to continuous non-attendance of the sessions.</p>

            <p>Despite previous warnings and reminders, there has been no significant improvement in your attendance. As a result, you are no longer part of the batch and will not be eligible for further training or certification under this batch.</p>

            <p>If you believe this is a mistake or if you're facing genuine issues, please reach out to your batch coordinator immediately to discuss your situation.</p>

            <p style="margin-top: 30px;">
                📍 <strong>Batch Details:</strong><br>
                • Course Name: <strong>${data?.batch?.course_name}</strong><br>
                • Batch Name: <strong>${data?.batch?.batch_id}</strong><br>
                • Batch Timing: <strong>${to12HourFormat(data?.batch?.batch_time_data?.start_time)} - ${to12HourFormat(data?.batch?.batch_time_data?.end_time)}</strong>
            </p>

             <p style="margin: 10px 10px; font-size: 16px; line-height: 1.6; color: #000;"><br>
                        For any further assistance, feel free to reach out to your batch coordinator:<br>
                        👤 Name: <strong>${data?.batch?.batch_coordinator_name}</strong><br>
                        📱 Phone: <strong>${data?.batch?.batch_coordinator_phone}</strong>
            </p> 

            <p style="margin-top: 30px;"><br>
                📍 <strong>Our Address:</strong><br>
                1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                Behind Saket Metro Station, New Delhi 110030
            </p>
            <p>
                📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                📧 <strong>Email:</strong> training@craw.in<br>
                🌐 <strong>Website:</strong> 
                <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
            </p>

            <p>Regards,<br>
            <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️</p>
        </div>
    

    `;
}
export default BatchTerminate
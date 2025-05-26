

const AttendanceWarning = (data) => {
    
    return `

        <div style="padding: 30px; color: #000;">
            <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">⚠️ Attendance Warning</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                Dear <strong style="font-weight: bold; color: #000;">Student</strong>,
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                Our records show that you have not been attending your scheduled sessions for the batch <strong>${data?.batch?.batch_id}</strong>. Regular participation is mandatory to ensure the successful completion of your course.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                Please consider this as an official warning. <strong>If you continue to remain absent without informing us, your batch enrollment will be terminated.</strong> This may lead to loss of access to classes and other course benefits.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                We strongly urge you to start attending your sessions immediately. If you're facing any issues or need support, reach out to your batch coordinator at the earliest.
            </p>

            <p style="margin: 5px 0; font-size: 16px; line-height: 1.6; color: #000;"><br>
                        For any further assistance, feel free to reach out to your batch coordinator:<br>
                        👤 Name: <strong>${data?.batch?.batch_coordinator_name}</strong><br>
                        📱 Phone: <strong>${data?.batch?.batch_coordinator_phone}</strong>
            </p> 

            <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;"><br>
            📍 <strong style="font-weight: bold;">Our Address:</strong><br>
                    1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                    Behind Saket Metro Station, New Delhi 110030
            </p>

            <p style="font-size: 15px; line-height: 1.6; color: #000;">
                📞 <strong style="font-weight: bold;">Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                📧 <strong style="font-weight: bold;">Email:</strong> training@craw.in<br>
                🌐 <strong style="font-weight: bold;">Website:</strong> 
                <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                Warm regards,<br>
                <strong style="font-weight: bold; color: #000;">Craw Cyber Security Pvt Ltd</strong> 🛡️
            </p>
        </div>
    `;

}

export default AttendanceWarning;
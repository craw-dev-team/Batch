import { to12HourFormat } from ".";



const BatchComplete = (data) => {
    
    
    
    return  `

        <div style="padding: 30px; color: #000;">
            <h2 style="text-align: center; color: #000; font-size: 24px; margin-bottom: 20px;">🎉 Congratulations on reaching this milestone!</h2>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                Dear <strong style="font-weight: bold; color: #000;">Student</strong>,
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                We are pleased to announce that you have successfully completed the 
                <strong style="font-weight: bold; color: #000;">${data?.batch?.course_name}</strong> 🚀
            </p>

            <div style="background-color: #f1f1f1; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">📘 Batch ID:</strong> ${data?.batch?.batch_id}</p>
                <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">📅 Start Date:</strong> ${data?.batch?.start_date}</p>
                <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">🏁 End Date:</strong> ${data?.batch?.end_date}</p>
                <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">🕒 Batch Timing:</strong> ${to12HourFormat(data?.batch?.batch_time_data?.start_time)} - ${to12HourFormat(data?.batch.batch_time_data?.end_time)}</p>
                <p style="font-size: 15px; margin: 6px 0; color: #000;"><strong style="font-weight: bold;">👨‍🏫 Trainer Name:</strong> ${data?.batch.trainer_name}</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #000;"><br>
                We hope this course has equipped you with valuable skills and knowledge for your future endeavors ✨<br>
                If you have any questions or need further assistance, feel free to reach out to us.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #000;">
                💬 Kindly support us by writing a quick Google review:  
                <a href="https://g.page/CrawSec/review?m" target="_blank" text-decoration: underline;">https://g.page/CrawSec/review?m</a>
            </p>

            <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
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

export default BatchComplete
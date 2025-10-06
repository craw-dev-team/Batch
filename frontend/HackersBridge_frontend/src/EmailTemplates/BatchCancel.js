


const Batchcancel = (data) => {
    
    const todayDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    
    return `

        <div style="padding: 30px; color: #000;">
                <h2 style="text-align: center; font-size: 24px; margin-bottom: 20px; color: #000;">❗Session Cancellation Notice</h2>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                   Dear <strong style="font-weight: bold; color: #000;">Student</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    We regret to inform you that your session scheduled for today, <strong>${todayDate}</strong>, under the batch <strong>${data?.batch?.batch_id}</strong> has been <strong>cancelled</strong>.
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    This is due to an urgent matter that requires the immediate attention of our trainer, <strong>${data?.batch?.trainer_name}</strong>. We understand the inconvenience this may cause and sincerely apologize.
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #000;">
                    We appreciate your understanding and cooperation in this matter. Please stay tuned for the rescheduled session details.
                </p>

                <p style="font-size: 15px; margin-top: 30px; line-height: 1.6; color: #000;">
                    📍 <strong style="font-weight: bold;">Our Address:</strong><br>
                    1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                    Behind Saket Metro Station, New Delhi 110030
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #000;">
                    📞 <strong style="font-weight: bold;">Phone:</strong> 011-40394315 | +91-9650202445 | +91-9650677445<br>
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

export default Batchcancel;


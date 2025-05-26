



const welcomeTemplate = (data) => {
    
    return`
        <div style="padding: 30px; font-size: 16px; color: #000;">
            <h2 style="text-align: center; font-size: 22px; color: #000;">🎉 Welcome to Craw Academy!</h2>
            <p style="color: #000;">Dear <strong>Student</strong>,</p>
            <p style="color: #000;">Congratulations on successfully enrolling in the <strong>${data?.batch?.course_name}</strong> course!</p><br>
            <p style="color: #000;">We are excited to have you with us on this learning journey. Your batch ID is <strong>${data?.batch?.batch_id }</strong>, and classes will begin from <strong>${data?.batch?.start_date }</strong>.</p>
            <p style="color: #000;">Make sure to attend your sessions regularly and participate actively to make the most of your training. We're here to support you at every step.</p>
            <p style="color: #000;">If you have any questions or need assistance, please feel free to contact us anytime.</p>
            <p style="margin-top: 30px; color: #000;">
                📍 <strong>Our Address:</strong><br>
                1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
                Behind Saket Metro Station, New Delhi 110030
            </p>
            <p style="color: #000;">
                📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445, +91-9650677445<br>
                📧 <strong>Email:</strong> training@craw.in<br>
                🌐 <strong>Website:</strong> 
                <a href="https://www.craw.in" style="text-decoration: underline;">www.craw.in</a>
            </p>
            <p style="color: #000;">
                Welcome once again!<br>
                <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
            </p>
        </div>
`;

}

export default welcomeTemplate;

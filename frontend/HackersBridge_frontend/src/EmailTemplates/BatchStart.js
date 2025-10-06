import { to12HourFormat } from ".";


const BatchStart = (data) => {


  return `

      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
              
          <!-- Header -->
        

          <!-- Body -->
          <div style="padding: 30px; font-size: 28px; color: #000;">
              <div style="text-align: center;">
              <h2 style="font-size: 22px;">📢 Welcome to Your New Batch!</h2>
              </div>

            
            <p>Dear <strong>Student</strong>,</p>
            <p>You have been successfully enrolled in the <strong>${data?.batch?.course_name || "your course"}</strong> course.</p><br>

            <!-- Batch Details Card -->
            <div style="background-color: #f1f1f1; padding: 18px; border-radius: 6px; margin: 20px 0; line-height: 1.6;">
              <p>🆔 <strong>Batch Code:</strong> ${data?.batch?.batch_id}</p>
              <p>📅 <strong>Start Date:</strong> ${data?.batch?.start_date}</p>
              <p>🕒 <strong>Timing:</strong> ${to12HourFormat(data?.batch?.batch_time_data?.start_time)} - ${to12HourFormat(data?.batch?.batch_time_data?.end_time)}</p>
              <p>🖥️ <strong>Mode:</strong> ${data?.batch.mode}</p>
              <p>🌐 <strong>Language:</strong> ${data?.batch.language}</p>
              <p>📍 <strong>Location:</strong> ${data?.batch.batch_location}</p>
              <p>📅 <strong>Classes on:</strong> ${data?.batch.preferred_week}</p>
              <p>👤 <strong>Trainer:</strong> ${data?.batch.trainer_name}</p>
              <p>🛏️ <strong>Trainer Week off:</strong> ${data?.batch.trainer_weekoff}</p><br>
            </div>

             <!-- ✅ New Class Meet Instructions Card -->
            <div style="background-color: #eaf6ff; padding: 20px; border-radius: 6px; margin-top: 30px;">
                <h3 style="color: #ff2a2a; font-size: 18px; margin-top: 0;">📲 Important Steps for CLASS MEET before the CLASS STARTS</h3>
                <p style="margin-bottom: 12px;">✅ <strong>Step 1: Download the App</strong><br>
                For Android users: Search and download <strong>CRAW ACADEMY</strong> from the Play Store.<br>
                For iPhone users: Search and download <strong>CLASS PLUS</strong> from the App Store.</p>

                <p style="margin-bottom: 12px;">✅ <strong>Step 2: Sign In</strong><br>
                Open the app after installing.<br>
                Sign in using your registered mobile number.<br>
                When asked for the Org Code, enter: <strong>CICZB</strong>.</p>

                <p style="margin-bottom: 12px;">✅ <strong>Step 3: Access Your Batch</strong><br>
                After signing in, go to the bottom of the screen and tap on "Batches".<br>
                You will see the batches you are part of.</p>

                <p style="margin-bottom: 0;">✅ <strong>Step 4: View Recordings & Chat</strong><br>
                Go to the "Chats" section in the app.<br>
                <em>(If you don't see the enrolled batches, contact your batch coordinator.)</em></p>
            </div>
            <!-- End of New Section -->

            <!-- Additional Info -->
            <p>We look forward to your participation and learning journey with Craw Security.</p><br>
            <p>💬 Leave a review: 
              <a href="https://g.page/CrawSec/review?m" target="_blank" style="color: #0a58ca;">https://g.page/CrawSec/review?m</a>
            </p>

            <!-- Contact Info -->
            <p style="margin-top: 30px;">
              📍 <strong>Our Address:</strong><br>
              1st Floor, Plot no. 4, Lane no. 2, Kehar Singh Estate, Westend Marg,<br>
              Behind Saket Metro Station, New Delhi 110030
            </p>

            <p>
              📞 <strong>Phone:</strong> 011-40394315 | +91-9650202445 | +91-9650677445<br>
              📧 <strong>Email:</strong> <a href="mailto:training@craw.in" style="color: #0a58ca;">training@craw.in</a><br>
              🌐 <strong>Website:</strong> <a href="https://www.craw.in" target="_blank" style="color: #0a58ca;">www.craw.in</a>
            </p>

            <p>
              Warm regards,<br>
              <strong>Craw Cyber Security Pvt Ltd</strong> 🛡️
            </p>
          </div>

          <!-- Footer -->
        
        </div>
      </body>


  `;

}

export default BatchStart;
# import os
# from reportlab.lib.pagesizes import landscape
# from reportlab.pdfgen import canvas
# from reportlab.lib.utils import ImageReader
# from reportlab.lib.colors import HexColor
# from reportlab.pdfbase import pdfmetrics
# from reportlab.pdfbase.ttfonts import TTFont
# from reportlab.lib.utils import asUnicode
# from datetime import date, datetime
# # from date_formatting import format_date
# # Ensure the fonts directory is correct
# # FONT_DIR = os.path.join(os.getcwd(), "fonts", "fonts")  #Path to fonts directory
# # FONT_DIR = os.path.join(os.getcwd(), "schedule", "fonts")
# FONT_DIR = r'D:\craw-002\PROJECT\backend\HackersBridge_backend\static\fonts'

# # FONT_DIR = r"C:\Users\Crawsec\Desktop\CRM\batch\schedule\fonts\fonts\Roboto-Bold.ttf"

# # Register Custom Fonts
# pdfmetrics.registerFont(TTFont("Roboto", os.path.join(FONT_DIR, "Roboto-Bold.ttf")))
# pdfmetrics.registerFont(TTFont("Corbel", os.path.join(FONT_DIR, "corbel.ttf")))
# pdfmetrics.registerFont(TTFont("Montserrat", os.path.join(FONT_DIR, "Montserrat-Regular.ttf")))

# def format_date(date_str):
#     # Define possible date formats
#     date_formats = [
#         "%d/%m/%Y",  # 25/11/2023
#         "%d %b %Y",  # 30 Dec 2023
#         "%d-%m-%Y",  # 24-12-2023
#         "%d.%m.%Y",  # 31.07.2023
#         "%d %B %Y",  # 22 December 2023
#         "%m-%d-%Y",  # 12-25-2023
#         "%Y-%m-%d"   # 2025-06-02 (handling input format from Google Sheets)
#     ]
#     for fmt in date_formats:
#         try:
#             dt = datetime.strptime(str(date_str), fmt)
#             break
#         except ValueError:
#             continue
#     else:
#         raise ValueError(f"Unsupported date format: {date_str}")
#     # Add suffix to the day
#     day = dt.day
#     suffix = "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
#     # Return properly formatted date as "1st September, 2025"
#     return dt.strftime(f"%d{suffix} %B, %Y")  # Use %-d for Linux/macOS, replace with %d on Windows

# # def format_date(dt):
# #     day = dt.day
# #     suffix = "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
# #     return dt.strftime(f"%d{suffix} %B %Y")  # Use %d instead of %-d for Windows
# # Constants "C:\Users\Crawsec\Desktop\CRM\batch\schedule\sample_certificate\AWS-SECURITY.jpg"
# # TEMPLATE_DIR = os.path.join(BASE_DIR, "static", "templates")
# TEMPLATE_DIR = r'D:\craw-002\PROJECT\backend\HackersBridge_backend\static\templates'

# TEMPLATE_PATH_aws_security = os.path.join(TEMPLATE_DIR, "AWS-SECURITY.png")
# TEMPLATE_PATH_end_point = os.path.join(TEMPLATE_DIR, "END-POINT.png")
# TEMPLATE_PATH_ethicalhacking = os.path.join(TEMPLATE_DIR, "ethicalhacking.png")
# TEMPLATE_PATH_forensics = os.path.join(TEMPLATE_DIR, "forensics.png")
# TEMPLATE_PATH_IOT = os.path.join(TEMPLATE_DIR, "IOT.png")
# TEMPLATE_PATH_linux = os.path.join(TEMPLATE_DIR, "linux.png")
# TEMPLATE_PATH_mobileapp = os.path.join(TEMPLATE_DIR, "mobileapp.png")
# TEMPLATE_PATH_networking = os.path.join(TEMPLATE_DIR, "networking.png")
# TEMPLATE_PATH_pentesting = os.path.join(TEMPLATE_DIR, "pentesting.png")
# TEMPLATE_PATH_python = os.path.join(TEMPLATE_DIR, "python.png")
# TEMPLATE_PATH_webapp = os.path.join(TEMPLATE_DIR, "webapp.png")
# TEMPLATE_PATH_AWS_ASSOCIATE = os.path.join(TEMPLATE_DIR, "AWS-ASSOCIATE.png")

# BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
# # OUTPUT_DIR = os.path.join(BASE_DIR, "static", "certificates")
# OUTPUT_DIR = r'C:\Users\pc\Downloads\cer'
# # Fonts
# FONT_COURSE = "Roboto"
# FONT_NAME = "Corbel"
# FONT_CERT_NO = "Montserrat"
# FONT_DATE = "Montserrat"
# # Colors
# COLOR_COURSE = HexColor("#FFFFFF")  # Change this if needed
# COLOR_NAME = HexColor("#000000")  # Change this if needed
# COLOR_CERT_NO = HexColor("#000000")  # Change this if needed
# COLOR_DATE = HexColor("#000000")  # Change this if needed
# CERTIFICATE_SIZE = (1684, 1190)  # Adjusted for landscape template
# # Ensure output directory exists
# os.makedirs(OUTPUT_DIR, exist_ok=True)
# def generate_certificate(course, name, certificate_no, date):
#     counter = 0
#     while os.path.exists(os.path.join(OUTPUT_DIR, f"{name}_{counter}.pdf")):
#         counter += 1
#     output_filename = os.path.join(OUTPUT_DIR, f"{name}_{counter}.pdf")
#     c = canvas.Canvas(output_filename, pagesize=landscape(CERTIFICATE_SIZE))
#     # Draw background template
#     if course == 'Basic Networking':
#         c.drawImage(ImageReader(TEMPLATE_PATH_networking), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Linux Essentials':
#         c.drawImage(ImageReader(TEMPLATE_PATH_linux), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Python Programming':
#         c.drawImage(ImageReader(TEMPLATE_PATH_python), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Ethical Hacking':
#         c.drawImage(ImageReader(TEMPLATE_PATH_ethicalhacking), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Advanced Penetration Testing':
#         c.drawImage(ImageReader(TEMPLATE_PATH_pentesting), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Cyber Forensics Investigation':
#         c.drawImage(ImageReader(TEMPLATE_PATH_forensics), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Web Application Security':
#         c.drawImage(ImageReader(TEMPLATE_PATH_webapp), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Mobile Application Security':
#         c.drawImage(ImageReader(TEMPLATE_PATH_mobileapp), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'Internet Of Things (IOT) Pentesting':
#         c.drawImage(ImageReader(TEMPLATE_PATH_IOT), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'End Point Security':
#         c.drawImage(ImageReader(TEMPLATE_PATH_end_point), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'AWS Associate':
#         c.drawImage(ImageReader(TEMPLATE_PATH_AWS_ASSOCIATE), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     elif course == 'AWS Security':
#         c.drawImage(ImageReader(TEMPLATE_PATH_aws_security), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
#     # Course Text
#     # c.setFont(FONT_COURSE, 100)
#     # c.setFillColor(COLOR_COURSE)
#     # c.drawString(622, 930, f"{course}")
#     # Recipient Name
#     c.setFont(FONT_NAME,74)
#     c.setFillColor(COLOR_NAME)
#     c.drawString(425, 510, name.upper())
#     # Certificate Number
#     c.setFont(FONT_CERT_NO, 23)
#     c.setFillColor(COLOR_CERT_NO)
#     c.drawString(100, 620, certificate_no)
#     # Date
#     c.setFont(FONT_DATE, 23)
#     c.setFillColor(COLOR_DATE)
#     # c.drawCentredString(CERTIFICATE_SIZE[0] / 2 - 615, 480, f"{date}")
#     c.drawString(100, 480, format_date(date).upper())
#     # Save PDF
#     c.save()
#     print(f"Certificate generated: {output_filename}")
#     return output_filename

# # if __name__ == "__main__":
# #     name = 'Mohammad Shafaque'
# #     course= 'End Point Security'
# #     certificate_no= 'CRAWEN-68273146/L10'
# #     date = date.today()
# #     print(generate_certificate(course, name, certificate_no, date))\

# CERTIFICATE_DIR = r'C:\Users\pc\Downloads\cer'

# def get_certificate_path(course_name, student_name, enrollment_no):
#     """Returns the file path of the generated certificate."""
#     sanitized_name = student_name.replace(" ", "_").replace("/", "_")
#     filename = f"{sanitized_name}_0.pdf"
#     return os.path.join(CERTIFICATE_DIR, filename)


import os
from reportlab.lib.pagesizes import landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime

# ✅ Correct FONT directory
FONT_DIR = r'C:\Users\Administrator\Desktop\CRAW\Batch\backend\HackersBridge_backend\static\fonts'

# ✅ Register Custom Fonts
pdfmetrics.registerFont(TTFont("Roboto", os.path.join(FONT_DIR, "Roboto-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Corbel", os.path.join(FONT_DIR, "corbel.ttf")))
pdfmetrics.registerFont(TTFont("Montserrat", os.path.join(FONT_DIR, "Montserrat-Regular.ttf")))

# ✅ Correct TEMPLATE directory
TEMPLATE_DIR = r'C:\Users\Administrator\Desktop\CRAW\Batch\backend\HackersBridge_backend\static\templates'

# ✅ Correct OUTPUT directory
OUTPUT_DIR = r'C:\Users\Administrator\Desktop\CRAW\Certificate'
os.makedirs(OUTPUT_DIR, exist_ok=True)  # Ensure the directory exists

# ✅ Certificate File Naming & Storage
CERTIFICATE_DIR = OUTPUT_DIR  # Keeping all certificates here

# ✅ Course Template Paths
TEMPLATES = {
    'Basic Networking': "networking.png",
    'Linux Essentials': "linux.png",
    'Python Programming': "python.png",
    'Ethical Hacking': "ethicalhacking.png",
    'CEH Training And Certification': "ethicalhacking.png",
    'Advanced Penetration Testing': "pentesting.png",
    'Cyber Forensics Investigation': "forensics.png",
    'Web Application Security': "webapp.png",
    'Mobile Application Security': "mobileapp.png",
    'Internet of Things Pentesting': "IOT.png",
    'End Point Security': "END-POINT.png",
    'AWS Associate': "AWS-ASSOCIATE.png",
    'AWS Security': "AWS-SECURITY.png",
    'SOC Analyst': "SOC-ANALYST.png",
    'CCNA 200-301': "CCNA-200-301.png",
    'CCNP 350-401': "CCNP-350-401.png",
    'CCNP 350-701': "CCNP-350-701.png",
    'Eccouncil CPENT': "CPENT.png",
    'Eccouncil CTIA': "CTIA.png",
    'Eccouncil WAHS': "WAHS.png",
    'Eccouncil WAHS': "WAHS.png",
    'CRTP': "CRTP.png",
    'Red Hat RH358': "RED-HAT-RH358.png",
    'Red Hat Rapid Track': "RED-HAT-Rapid-Track.png",
    'Red Hat Openshift': "RED-HAT-Openshift.png",
    'Red Hat RHCSA': "RED-HAT-RHCSA.png",
    'Red Hat RHCE': "RED-HAT-RHCE.png",
    'CompTIA A+': "CompTIA-A+.png",
    'COmpTIA network +': "COmpTIA-network-+.png",
    'COmpTIA Security +': "COmpTIA-Security-+.png",
    'EJPT': "EJPT.png",
    'Python AI': "Python-AI.png",
    'PEN-200/OSCP': "OSCP.png",
    'PEN-210/OSWA': "OSWA.png",
    'Certified Network Defender': "CND.png",
    'Red Hat OpenStack': "Red-Hat-OpenStack.png",
    'ISO': "ISO-27001.png",
    'Devops': "DEVOPS.png",
}


# ✅ Colors & Fonts
FONT_COURSE = "Roboto"
FONT_NAME = "Corbel"
FONT_CERT_NO = "Montserrat"
FONT_DATE = "Montserrat"
COLOR_NAME = HexColor("#000000")
COLOR_CERT_NO = HexColor("#000000")
COLOR_DATE = HexColor("#000000")
CERTIFICATE_SIZE = (1684, 1190)  # Landscape size

# ✅ Date Formatter
def format_date(date_str):
    """Format date into '1st September, 2025'."""
    date_formats = ["%d/%m/%Y", "%d %b %Y", "%d-%m-%Y", "%d.%m.%Y", "%d %B %Y", "%m-%d-%Y", "%Y-%m-%d"]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(str(date_str), fmt)
            break
        except ValueError:
            continue
    else:
        raise ValueError(f"Unsupported date format: {date_str}")

    day = dt.day
    suffix = "th" if 11 <= day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    
    return dt.strftime(f"%d{suffix} " "" " %B" " " " %Y")

# ✅ Generate Certificate
def generate_certificate(course, name, certificate_no, date):
    """Generate a PDF certificate."""
    sanitized_name = name.replace(" ", "_").replace("/", "_")
    sanitized_course = course.replace(" ", "_").replace("/", "_")
    
    # ✅ Ensure unique filename
    # counter = 0
    # while os.path.exists(os.path.join(OUTPUT_DIR, f"{sanitized_name}_{counter}.pdf")):
    #     counter += 1

    output_filename = os.path.join(OUTPUT_DIR, f"{sanitized_name}_{sanitized_course}_0.pdf")
    c = canvas.Canvas(output_filename, pagesize=landscape(CERTIFICATE_SIZE))

    # ✅ Load Background Template
    template_path = os.path.join(TEMPLATE_DIR, TEMPLATES.get(course, "default.png"))
    if os.path.exists(template_path):
        c.drawImage(ImageReader(template_path), 0, 0, width=CERTIFICATE_SIZE[0], height=CERTIFICATE_SIZE[1])
    else:
        print(f"⚠️ Warning: Template for {course} not found. Using default template.")

    # ✅ Draw Text on Certificate
    c.setFont(FONT_NAME, 74)
    c.setFillColor(COLOR_NAME)
    c.drawString(425, 510, name.upper())  # Recipient Name

    c.setFont(FONT_CERT_NO, 23)
    c.setFillColor(COLOR_CERT_NO)
    c.drawString(97.5, 620, certificate_no)  # Certificate Number

    c.setFont(FONT_DATE, 23)
    c.setFillColor(COLOR_DATE)
    c.drawString(97.5, 480, format_date(date)) # Date

    c.save()
    print(f"✅ Certificate generated: {output_filename}")
    
    return output_filename

# ✅ Retrieve Certificate Path
def get_certificate_path(course_name, student_name, enrollment_no):
    """Returns the file path of the generated certificate."""
    sanitized_name = student_name.replace(" ", "_").replace("/", "_")
    sanitized_course = course_name.replace(" ", "_").replace("/", "_")
    filename = f"{sanitized_name}_{sanitized_course}_0.pdf"
    return os.path.join(CERTIFICATE_DIR, filename)


# # ✅ Test Function to Generate All Certificates for One Student
# def generate_all_certificates_for_student(student_name, enrollment_no, date):
#     """
#     Generate all certificates for a given student for every available course.
    
#     :param student_name: Name of the student
#     :param enrollment_no: Unique enrollment/certificate number
#     :param date: Date of issuance (string format)
#     """
#     for course in TEMPLATES.keys():
#         try:
#             # Generate unique certificate number for each course if needed
#             course_cert_no = f"{enrollment_no}/{course[:3].upper()}"
#             generate_certificate(course, student_name, course_cert_no, date)
#         except Exception as e:
#             print(f"❌ Error generating certificate for course '{course}': {e}")

# # ✅ Example Usage
# if __name__ == "__main__":
#     student_name = "Keshav Gupta"
#     enrollment_no = "CRAWEN-68276044"
#     date = "09/09/2024"  # Can be in various formats

#     generate_all_certificates_for_student(student_name, enrollment_no, date)
from django.contrib import admin
from django.urls import path, include
from Student_login.views import *

urlpatterns = [
    # path('user_student/', StudentMeView.as_view(), name='student-login'),
    path('student_info/', StudentInfoView.as_view(), name='Student-info'),
    path('student_batch/', StudentBatchListView.as_view(), name='Student-batch'),
    path('student_batch_upcoming/', StudentUpcomingBatchListView.as_view(), name='Student-batch-upcoming'),
    path('student_batch_info/<int:id>/', StudentBatchInfoView.as_view(), name='Student-batch-info'),
    path('student_batch_certificate_download/<int:id>/', BatchCertificateDownloadView.as_view(), name='certificate-download-view'),
    path('student_batch_request/', StudentBatchRequestAPI.as_view(), name='Student-batch-request'),
    path('student_attendance_batchlist/', StudentAttendanceListView.as_view(), name='Student-batch-attendance'),
    path('student_certificates/', AllStudentCertificate.as_view(), name='all_student_certificates'),
    path('student_certificate_download/<int:course_id>/', DownloadStudentCertificate.as_view(), name='student_certificate_download'),
    path('student_ticket_create/', StudentTicketCreateAPIView.as_view(), name='student_ticket_create'),
    path('student_ticket/', StudentTicketAPIView.as_view(), name='student_ticket'),
    path('student_ticket/chats/<int:id>/', StudentTicketChatAPIView.as_view(), name='student_ticket-chat'),
    path('student_ticket/chats/message/<int:id>/', StudentTicketChatMessageAPIView.as_view(), name='student_ticket-chat'),
    path('student_ticket/status/<int:id>/', StudentTicketstatus.as_view(), name='student_ticket-status'),
    path('student_announcement/', StudentAnnouncementAPIView.as_view(), name='student_all_announcement'),
    path('student/all/batch/chats/', StudentALLBatchChatsAPIView.as_view(), name='student_all_batch_code'),
    path('student/batch/chats/<int:id>/', StudentBatchChatsMessage.as_view(), name='student_batch_chats'),
    path('student/batch/chats/message/<int:id>/', StudentBatchChatsMessageSender.as_view(), name='student_message_sender'),
    
    ]

{
    # path('only_student_login/', StudentLoginView.as_view(), name='student-login'),
    # path('batch_attendance/', create_attendance_for_all_batches_view, name='batch-attendance'),
    # path('batch_attendance_present/', batch_attendance_present, name='batch-attendance'),
}


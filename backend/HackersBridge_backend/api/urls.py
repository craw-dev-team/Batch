from django.contrib import admin
from django.urls import path, include
from nexus.views_user import *
from nexus.views_course import *
from nexus.views_batch import *
from Student.views import *
from Coordinator.views import *
from Counsellor.views import *
from Trainer.views import *

urlpatterns = [
    path('login/', UserLoginAPIView.as_view(), name='api-login'),
    path('register/', UserRegistrationAPIView.as_view(), name='api-register'),
    path('firsttime-reset-password/', FirstTimeResetPasswordAPIView.as_view(), name='api-register'),
    path('request-otp/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('logout/', UserLogoutAPIView.as_view(), name='logout'),  # Add logout route
    path('logs/', LogEntryListAPIView.as_view(), name='log-list'),

    path('courses/', CourseListAPIView.as_view(), name='course-list'),
    path('courses/add/', CourseCreateAPIView.as_view(), name='course-create'),
    path('courses/edit/<int:id>/', CourseEditAPIView.as_view(), name='course-edit'),
    path('courses/delete/<int:id>/', CourseDeleteAPIView.as_view(), name='course-delete'),
    
    path('coordinators/', CoordinatorListView.as_view(), name='coordinator-list'),
    path('coordinators/add/', CoordinatorCreateAPIView.as_view(), name='coordinator-create'),
    path('coordinators-logs/', CoordinatorLogListView.as_view(), name='coordinators-logs'),
    path('coordinators/edit/<int:id>/', CoordinatorEditAPIView.as_view(), name='coordinator-edit'),
    path('coordinators/delete/<int:id>/', CoordinatorDeleteAPIView.as_view(), name='coordinator-delete'),
    path('coordinators/<int:id>/students/', StudentsUnderCoordinatorView.as_view(), name='coordinator-list'),
    path('coordinators/<int:id>/trainer/', TrainerUnderCoordinatorView.as_view(), name='coordinator-list'),
    path('coordinators/info/<int:id>/', CoordinatorInfoAPIView.as_view(), name='coordinator-info'),
    
    path('counsellors/', CounsellorListView.as_view(), name='counsellor-list'),
    path('counsellors/add/', CounsellorCreateAPIView.as_view(), name='counsellor-create'),
    path('counsellors-logs/', CounsellorLogListView.as_view(), name='coordinators-logs'),
    path('counsellors/edit/<int:id>/', CounsellorEditAPIView.as_view(), name='counsellor-edit'),
    path('counsellors/delete/<int:id>/', CounsellorDeleteAPIView.as_view(), name='counsellor-delete'),
    path('counsellors/<int:id>/students/', StudentsUnderCounsellorView.as_view(), name='coordinator-list'),
    path('counsellors/info/<int:id>/', CousellorInfoAPIView.as_view(), name='counsellor-info'),
    
    path('students/', StudentListView.as_view(), name='student-list'),
    path('students/add/', AddStudentView.as_view(), name='add-student'),
    path('studentscraw/', StudentCrawListView.as_view(), name='student-list'),
    path('students-logs/', StudentLogListView.as_view(), name='student-logs'),
    path('students/edit/<int:id>/', EditStudentView.as_view(), name='edit-student'),
    path('students/fees/<int:student_id>/', AddFeesView.as_view(), name='add-fees'),
    path('students/info/<int:id>/', StudentInfoAPIView.as_view(), name='student-info'),
    path('students/delete/<int:id>/', DeleteStudentView.as_view(), name='delete-student'),
    path('student-course/edit/<int:id>/', StudentCourseEditAPIView.as_view(), name='student-course-edit'),
    path('generate-certificate/<int:id>/', GenerateCertificateAPIView.as_view(), name='generate-certificate'),
    path('download-certificate/<int:id>/', DownloadCertificateAPIView.as_view(), name='download_certificate'),
    # path('email-tracker/<int:id>/', email_open_tracker, name='email-tracker'),
    path('students/free/', FreeStudentListView.as_view(), name='trainer-availability'),
    
    path('trainers/', TrainerListAPIviews.as_view(), name='trainer-list'),
    path('trainers/add/', AddTrainerAPIView.as_view(), name='add_trainer_api'),
    path('trainers-logs/', TrainerLogListView.as_view(), name='trainers-logs'),
    path('trainers/info/<int:id>/', TrainerInfoAPIView.as_view(), name='info_trainer_api'),
    path('trainers/edit/<int:id>/', EditTrainerAPIView.as_view(), name='edit_trainer_api'),
    path('trainers/delete/<int:id>/', DeleteTrainerAPIView.as_view(), name='delete_trainer_api'),
    path('trainers/availability/', TrainerAvailabilityAPIView.as_view(), name='trainer-availability'),
    
    path('batches/', BatchAPIView.as_view(), name='batch-list'),
    path('batches/add/', BatchCreateAPIView.as_view(), name='add_batch_api'),
    path('batches-logs/', BatchLogListView.as_view(), name='batches-logs'),
    path('batches/info/<int:id>/', BatchInfoAPIView.as_view(), name='info_batch_api'),
    path('batches/edit/<int:id>/', BatchEditAPIView.as_view(), name='edit_batch_api'),
    path('batches/delete/<int:id>/', BatchDeleteAPIView.as_view(), name='delete_batch_api'),
    path('batches/<int:batch_id>/add-students/', BatchAddStudentAPIView.as_view(), name='batch_add_student_api'),
    path('batches/<int:batch_id>/available-students/', AvailableStudentsAPIView.as_view(), name='get_available_students'),
    path('batches/<int:batch_id>/available-trainers/', AvailableTrainersAPIView.as_view(), name='get_available_trainers'),
    path('batch/remove-student/<int:batch_id>/', BatchRemoveStudentAPIView.as_view(), name='remove_student_from_batch'),
    path('batch-student-assignment/update/<int:assignment_id>/', BatchStudentAssignmentUpdateAPIView.as_view(), name='update_batch_student_assignment'),
    path('batch-generate-certificate/<int:id>/', GenerateBatchCertificateAPIView.as_view(), name='generate-certificate'),

    path('books/', BookListAPIView.as_view(), name='book-list'),
    path('books/add/', BookCreateAPIView.as_view(), name='book-add'),
    path('books/edit/<int:id>/', BookUpdateAPIView.as_view(), name='book-edit'),
    path('books/delete/<int:id>/', BookDeleteAPIView.as_view(), name='book-delete'),
    path('student/book/<int:id>/', StudentBookAllotmentAPIView.as_view(), name='student-book-allotment'),
    
]




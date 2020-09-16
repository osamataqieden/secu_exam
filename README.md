# SecuExam.
This is team SecuExam's submission for the 2020 Amazon Techathon, SecuExam is a tool that allows teachers to hold automatically proctored and cheat proof online exams.  
This application is build on electronJS, and is a work in progress.

# Installation  

# Precompiled Binaries
Download and launch the application from https://drive.google.com/file/d/1KtLVExfVhUqxZ32a5z1dj7BmcdV1Zg63/view?usp=sharing

# Build from source.  
To build this application from source, pull/clone this repo and do the following:  
* Open terminal
* run npm install
* run npm start.

# Special Thanks:  
- To the Techathon team that was very supportive.  
- To the developers of Electron.js  
- To the developers of Harker.js
- To the developers of firebase Auth and Database.
- to the developers of AWS Rekogenetion.

# Usage, Policies and restrictions.  
# Usage.  
This application is used to establish online exams and coordinate them and use online automated proctoring to monitor the exam.  
Teachers must create a teacher's account, teachers can create exams and set policies that students must follow during the exam.  
Students must create a student's account, students can join the exams after teachers provide them with the exam tokens.  
# Policies.  
Teachers can set the following policies:  
* Detect when the students change the size of the screen / minimize the screen.  
* Detect abnormal objects (defined in the program as cellphones, headsets, books or the acting of reading).  
* Detect when the student is looking away from the screen (not very accurate).  
* Detect noise/voices in the vacinity of the student.  
# Restricitions.  
- This application is a work-in-progress and was not tested appropriately, bugs are bound to appear.
- If found any, please report them.  

# Setting up an Exam.
To set up an exam, you must login to a teacher's account and press 'Create an Exam' on the toolbar on the left.  
You must then follow the instructions.
You must send the token to your student to join the exam.  

# Joining the exam.  
To join an exam, you must have the token to that exam, only the teacher can provide it for you.
You must then follow the instructions.  
You can't start the exam before the start time.  
You must complete the exam before the duration is over.  
You must compliy with the policies set by your teacher.  






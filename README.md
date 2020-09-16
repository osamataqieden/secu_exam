# SecuExam.
This is team SecuExam's submission for the 2020 Amazon Techathon, SecuExam is a tool that allows teachers to hold automatically proctored and cheat proof online exams.  
This application is build on electronJS, and is a work in progress.

# Installation  

# Precompiled Binaries
Download the .exe file for windows from ./dist/

# Build from source.  
To build this application from source, pull/clone this repo and do the following:  
* Open terminal
* run npm install
* run npm start.

# List of Features.  
This application provides the following futures:  
- Two types of Accounts, Students and Teachers.  
- Teachers get to set the exams and the policies.  
- Students get to take the exam.  

# Policies.  
This application allows the teacher to set the following policies:  
- Face count detection: detect how many faces are in the room at the moment.
- Object detection: detect suspicious objects in the student's vacinity.  
- Audio detection: detect voices.   
- Screen minimzation and size changing: detect screen minimization and size changing.  

* Policies that use images are powered by AWS Rekogention, and the audio policiy is powered by Harker.js


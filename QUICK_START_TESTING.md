# Quick Start Guide - Testing Attempt & Response Features

## Prerequisites
- Backend running on `http://localhost:8081`
- Frontend running on `http://localhost:5173` (or your configured port)
- Database initialized with exam data
- At least one published exam with questions
- Student user account logged in

## Step-by-Step Testing Guide

### 1. Login as Student
```
Navigate to: http://localhost:5173/login
Email: student@example.com
Password: student123
```

### 2. View Available Exams
```
Expected Result:
- Dashboard shows list of published exams
- Each exam card displays:
  - Exam title
  - Description
  - Date, Duration, Marks
  - Question count
  - "View details" button
```

### 3. View Exam Details
```
Click: "View details" on any exam card
Expected Result:
- Exam overview with full details
- List of all questions with options shown
- "Start Exam" button visible
```

### 4. Start Exam
```
Click: "Start Exam" button
Expected Result:
- Redirected to exam taking interface
- Timer starts counting down
- First question displayed
- All navigation elements visible
- Status: "Question 1 of X"
```

### 5. Interact with Questions

#### Multiple Choice Question:
```
- See all options as radio buttons
- Click an option to select it
- Click "Save Answer" button
- Progress dot should update to show answered status
```

#### Descriptive Question:
```
- See textarea for input
- Type your answer
- Click "Save Answer" button
- Progress dot should update
```

### 6. Navigate Questions
```
Method 1 - Sequential:
- Click "Next →" button to move forward
- Click "← Previous" button to move backward
- Buttons disabled at start/end

Method 2 - Jump:
- Click any progress dot to jump to that question
- Active question dot has different styling
- Answered questions show different dot color
```

### 7. Monitor Timer
```
Normal State:
- Timer displays in format HH:MM:SS
- Counts down every second
- Located in top right header

Warning State (< 5 minutes):
- Timer background turns red/orange
- Timer pulses to draw attention
- Visual feedback of urgency
```

### 8. Auto-Submit Feature
```
Wait until timer reaches 00:00:00:
- Exam automatically submits
- Redirected to results page
- No user interaction needed
```

### 9. Manual Submit
```
Click: "Submit Exam" button
Expected Result:
- Confirmation (optional)
- Redirected to results page
- Cannot go back to exam
```

## Testing Results Page

### View Results
```
Expected Display:
- Large summary cards showing:
  * Marks obtained (e.g., "45")
  * Total marks (e.g., "100")
  * Correct answers (e.g., "9")
  * Total questions (e.g., "15")

- Performance bar:
  * Shows percentage
  * Visual progress bar
  * Colored based on performance
```

### Review Answers
```
Each Question Card Shows:
- Question number (Q1, Q2, etc.)
- Question text
- Your answer (with color coding):
  * Green = Correct answer
  * Red = Wrong answer
  * Orange = Unanswered
- Badge indicating correctness
- Marks earned (if any)
```

### Return to Dashboard
```
Click: "Back to Dashboard" button
Expected Result:
- Returns to student dashboard
- Same exam should not be available for attempt again
- Can view other published exams
```

## API Testing (Advanced)

### Using Postman/cURL

#### Start Attempt
```
POST http://localhost:8081/api/attempt/start/{examId}
Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Response:
{
  "id": 1,
  "examId": 5,
  "userId": 10,
  "attemptDate": "2026-09-11T10:30:00",
  "startTime": "2026-09-11T10:30:00",
  "endTime": null,
  "status": "IN_PROGRESS",
  "totalMarks": 100,
  "obtainedMarks": null
}
```

#### Save Response
```
POST http://localhost:8081/api/attempt/{attemptId}/response
Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Body:
{
  "questionId": 1,
  "selectedOptionId": 5,
  "answerText": null
}

Response:
{
  "id": 1,
  "attemptId": 1,
  "questionId": 1,
  "questionText": "What is 2+2?",
  "selectedOptionId": 5,
  "selectedOptionText": "4",
  "answerText": null,
  "obtainedMarks": 0
}
```

#### Submit Attempt
```
POST http://localhost:8081/api/attempt/{attemptId}/submit
Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Response:
{
  "id": 1,
  "examId": 5,
  "userId": 10,
  "attemptDate": "2026-09-11T10:30:00",
  "startTime": "2026-09-11T10:30:00",
  "endTime": "2026-09-11T11:30:00",
  "status": "COMPLETED",
  "totalMarks": 100,
  "obtainedMarks": 65
}
```

#### Get Responses
```
GET http://localhost:8081/api/attempt/{attemptId}/responses
Headers:
  Authorization: Bearer {JWT_TOKEN}

Response:
[
  {
    "id": 1,
    "attemptId": 1,
    "questionId": 1,
    "questionText": "What is 2+2?",
    "selectedOptionId": 5,
    "selectedOptionText": "4",
    "answerText": null,
    "obtainedMarks": 5
  },
  ...
]
```

## Common Testing Scenarios

### Scenario 1: Perfect Score
```
Steps:
1. Start exam
2. Answer all questions with correct options
3. Submit exam
Expected: obtainedMarks should equal totalMarks
```

### Scenario 2: Partial Answers
```
Steps:
1. Start exam
2. Answer only first 50% of questions
3. Submit exam
Expected: 
- Unanswered questions show 0 marks
- Only answered questions contribute to score
```

### Scenario 3: Time Expiration
```
Steps:
1. Start exam with very short duration (for testing: use browser devtools to modify)
2. Wait for timer to reach 00:00:00
Expected:
- Auto-submit occurs
- Redirected to results
- Only answered questions are graded
```

### Scenario 4: Changing Answers
```
Steps:
1. Answer question with Option A
2. Save response
3. Navigate away and back
4. Select Option B
5. Save response
6. Submit exam
Expected: 
- Latest answer (Option B) is evaluated
- Marks calculated based on Option B
```

### Scenario 5: Security Test
```
Steps:
1. Student A takes exam and submits
2. Try to access Student A's attempt as Student B
  URL: http://localhost:5173/student/exam-result/{attemptId}
Expected:
- 403 Forbidden error
- Cannot see other student's results
```

## Debugging Tips

### Check Browser Console
```
F12 → Console tab
Look for:
- Network errors (red)
- API response status codes
- Component mount/unmount messages
```

### Check Backend Logs
```
Look for:
- SQL queries being executed
- Transaction logs
- Exception stack traces
- Authentication/authorization denials
```

### Check Network Tab
```
F12 → Network tab
For each API call, verify:
- Status code (200, 201, etc.)
- Response time
- Response payload
- Headers (Authorization present)
```

### Test Database
```
SQL Queries to verify data:
-- Check attempt was created
SELECT * FROM attempt WHERE user_id = {userId} AND exam_id = {examId};

-- Check responses were saved
SELECT * FROM student_responses WHERE attempt_id = {attemptId};

-- Check marks were calculated
SELECT obtained_marks, status FROM attempt WHERE id = {attemptId};
```

## Performance Testing

### Load Testing
```
Tools: Apache JMeter, Postman, k6
Focus Areas:
- Concurrent exam attempts
- Response saving under load
- Result calculation performance
- Database connection pooling
```

### Browser Performance
```
F12 → Performance tab
Measure:
- Page load time
- Timer countdown smoothness
- Save response response time
- Navigation latency
```

## Rollback Instructions

If issues occur:

```
Backend Rollback:
1. Restore previous Attempt.java from git
2. Restore previous StudentResponse.java from git
3. Revert database migrations
4. Rebuild and restart backend

Frontend Rollback:
1. Remove ExamTake.jsx and ExamTake.css
2. Remove ExamResult.jsx and ExamResult.css
3. Remove new routes from AppRoutes.jsx
4. Restore ExamDetails.jsx
5. Rebuild frontend
```

## Success Indicators

✅ All UI elements load without errors
✅ Timer counts down accurately
✅ Responses save successfully
✅ Marks calculate correctly
✅ Results display properly
✅ Navigation works smoothly
✅ No console errors
✅ No 401/403 errors in network tab
✅ Duplicate attempt is prevented
✅ Complete flow takes ~5 seconds per step

## Next Steps

1. ✅ Manual testing complete
2. → Automated testing (Jest, Cypress)
3. → Load testing
4. → Security audit
5. → User acceptance testing
6. → Production deployment

---
**Need Help?**
- Check logs for detailed error messages
- Verify all prerequisites are met
- Ensure database migrations completed
- Check API documentation in IMPLEMENTATION_SUMMARY.md


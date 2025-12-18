# IELTS Speaking Test Enhancement Plan

## Current System Analysis
✅ **Existing Strengths:**
- MockTest and Question models are well-structured
- TestAttempt and Answer models support scoring
- Timer functionality exists
- Authentication and user management ready
- API endpoints for test creation and submission

## Required Enhancements for IELTS Speaking

### 1. Database Schema Updates
**Add to existing QuestionType enum:**
- SPEAKING_PART1 (Personal questions - 4-5 minutes)
- SPEAKING_PART2 (Cue card - 1-2 min prep + 1-2 min speak)
- SPEAKING_PART3 (Discussion - 4-5 minutes)

**Add new fields to Question model:**
- `preparationTime` (Integer) - for Part 2 preparation time
- `speakingTime` (Integer) - time allowed for speaking
- `cueCardContent` (String) - for Part 2 cue cards
- `followUpQuestions` (Json) - for Part 3 discussion topics

**Add SpeakingScore model:**
- Fluency & Coherence (1-9 bands)
- Lexical Resource (1-9 bands)
- Grammatical Range & Accuracy (1-9 bands)
- Pronunciation (1-9 bands)
- Overall Band Score

### 2. Frontend Enhancements
**New Components Needed:**
- AudioRecorder component for capturing responses
- SpeakingTestInterface with timer and section navigation
- CueCard display for Part 2
- SpeakingScoreInput for detailed scoring

**UI Flow Updates:**
- Section-based navigation (Part 1 → Part 2 → Part 3)
- Preparation time countdown for Part 2
- Speaking time tracking for each section
- Audio recording controls

### 3. API Enhancements
**New endpoints:**
- `/api/speaking/submit-audio` - handle audio submissions
- `/api/speaking/score` - submit speaking scores
- Enhanced `/api/mock-test/start` for speaking-specific questions

### 4. Speaking Topics Database
**Pre-built IELTS speaking topics:**
- Part 1: Family, Hometown, Work/Study, Hobbies, Food, etc.
- Part 2: Describe a person, place, event, object, experience
- Part 3: Abstract discussions on various topics

## Implementation Approach
1. **Phase 1**: Database schema updates
2. **Phase 2**: Basic speaking test flow
3. **Phase 3**: Audio recording capabilities
4. **Phase 4**: Speaking score tracking
5. **Phase 5**: IELTS topic database

## Time Estimate
- Database updates: 30 minutes
- Speaking test UI: 2-3 hours
- Audio recording: 1-2 hours
- Scoring system: 1-2 hours
- Testing and integration: 1 hour

**Total: 6-8 hours development time**

## Can Reuse Existing:
✅ User authentication
✅ Test attempt tracking
✅ Timer functionality
✅ Basic question/answer flow
✅ API structure
✅ UI components (with modifications)
✅ Database models (with extensions)

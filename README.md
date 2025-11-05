# QuizMaster React Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 3. Start the Application

**Terminal 1 - Start the Backend Server:**
```bash
npm run server
```

**Terminal 2 - Start the React Frontend:**
```bash
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
quizmaster-react/
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Home page with upload
│   │   ├── TopicSelection.jsx    # Topic selection after PDF analysis
│   │   ├── Quiz.jsx              # Interactive quiz interface
│   │   ├── Results.jsx           # Results and statistics
│   │   ├── Settings.jsx          # Settings and history
│   │   └── Navbar.jsx            # Navigation component
│   ├── App.jsx                   # Main app component
│   ├── App.css                   # Complete styling
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Base styles
├── server/
│   ├── index.js                  # Express server
│   └── services/
│       └── pdfService.js         # PDF processing and AI integration
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── index.html                   # HTML template
```

## ✨ Features Implemented

### 🎯 New Logic (As Requested)
1. **PDF Upload & Analysis**: Upload PDF, extract text content
2. **Topic Selection**: AI analyzes PDF and suggests topics
3. **Customizable Question Count**: Choose 3, 5, 7, 10, or 15 questions
4. **Topic-Based Quiz Generation**: Generate quiz focused on selected topic

### 🎨 UI Design (Matching Your Images)
1. **Home Page**: 
   - Welcome section with gradient text
   - Two main cards: Upload PDF & Start Quiz
   - Feature showcase at bottom
   
2. **Settings Page**:
   - Session management
   - PDF upload history
   - Wrong questions review
   - About section

3. **Color Scheme**: Purple, pink, blue gradients matching your design

### 🔧 Technical Features
- **React + Vite**: Modern, fast development
- **Express Backend**: PDF processing and AI integration
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live progress and feedback
- **Error Handling**: Comprehensive error management

## 🔑 API Endpoints

### POST /api/upload-pdf
Upload and analyze PDF file
- **Body**: FormData with 'pdf' field
- **Response**: Analysis results with text content

### POST /api/generate-topics
Generate topics from PDF content
- **Body**: `{ "content": "PDF text content" }`
- **Response**: Array of topic objects

### POST /api/generate-quiz
Generate quiz for selected topic
- **Body**: `{ "topic": "Topic title", "questionCount": 5, "content": "PDF content" }`
- **Response**: Quiz object with questions

## 🎮 How to Use

1. **Upload PDF**: Click "Choose PDF File" and select your document
2. **Select Topic**: Choose from AI-generated topics
3. **Choose Questions**: Select number of questions (3-15)
4. **Take Quiz**: Answer questions with timer and feedback
5. **View Results**: See detailed results and explanations
6. **Manage Settings**: Clear data, view history

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start backend server
npm run lint         # Run ESLint
```

### Environment Variables
- `GEMINI_API_KEY`: Your Google AI Studio API key
- `PORT`: Backend server port (default: 5000)

## 📱 Responsive Design

- **Desktop**: Full layout with side-by-side cards
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked cards, touch-friendly interface

## 🎨 Design System

### Colors
- Primary Purple: #8B5CF6
- Primary Pink: #EC4899
- Primary Blue: #3B82F6
- Primary Teal: #14B8A6

### Components
- Cards with rounded corners and shadows
- Gradient buttons and backgrounds
- Smooth animations and transitions
- Toast notifications for feedback

## 🔧 Troubleshooting

### Common Issues

1. **PDF Upload Fails**
   - Check file size (max 10MB)
   - Ensure file is a valid PDF
   - Check server logs for errors

2. **API Key Issues**
   - Verify GEMINI_API_KEY in .env file
   - Check Google AI Studio for quota limits

3. **Port Conflicts**
   - Change PORT in .env file
   - Update vite.config.js proxy settings

4. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy Backend
- Deploy server/ directory to your hosting service
- Set environment variables
- Ensure uploads/ directory is writable

### Deploy Frontend
- Deploy dist/ directory to CDN or static hosting
- Update API URLs if needed

## 📄 License

This project is open source and available under the MIT License.

---

**QuizMaster React** - Transform your PDFs into interactive learning experiences! 🎓✨
"# QuizMaster" 
"# mcq-builder" 

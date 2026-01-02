# 🎓 AI-Powered Study Companion

An intelligent, personalized study assistant that helps university students learn faster and smarter by leveraging **Retrieval-Augmented Generation (RAG)**. Upload your academic materials and interact with them using AI — just like ChatGPT, but grounded strictly in your content.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green)

## ✨ Features

### 📂 Document Upload & Management
- **Multi-format Support**: Upload PDFs, DOCX, PPTX, and TXT files
- **Secure Storage**: Files stored securely with user isolation
- **Organization**: Categorize by subject/course
- **Easy Management**: View, organize, and delete your materials

### 🧠 AI-Powered Summarization
- **Instant Summaries**: Convert lengthy lectures into concise bullet points
- **Key Concepts**: Extract main topics and important definitions
- **Revision-Friendly**: Perfect format for quick exam prep

### 💬 RAG-Based Q&A System
- **ChatGPT-Like Interface**: Natural conversation with your materials
- **Context-Aware Answers**: Responses based ONLY on your uploaded content
- **No Hallucination**: Vector-based retrieval ensures factual accuracy
- **Source Citations**: See which parts of your materials were used

### 📝 Exam Question Generation
- **Multiple Choice Questions**: Auto-generate MCQs from your content
- **Difficulty Levels**: Choose easy, medium, or hard questions
- **Practice Mode**: Test yourself with show/hide answers
- **Subject-Specific**: Questions tailored to each document

### 🔐 Authentication & Security
- **Secure Login**: JWT-based authentication with NextAuth.js
- **Data Isolation**: Each user's data is completely separate
- **Password Protection**: Bcrypt encryption for passwords
- **Session Management**: Secure session handling

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **React Hook Form** - Form management

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication

### AI & Processing
- **OpenAI GPT-4** - Text generation and summarization
- **OpenAI Embeddings** - Vector embeddings (text-embedding-3-small)
- **RAG Implementation** - Custom retrieval system
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX processing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ai-study-companion
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/study_companion?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# OpenAI
OPENAI_API_KEY="sk-proj-your-api-key-here"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"
```

### Step 4: Set Up the Database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 5: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### 1. Create an Account
- Navigate to `/auth/signup`
- Enter your name, email, and password
- Click "Create Account"

### 2. Upload Study Materials
- Go to Dashboard → Upload Materials
- Drag and drop or browse for files (PDF, DOCX, PPTX, TXT)
- Add subject and description (optional)
- Click "Upload"

### 3. Generate Summaries
- Go to Dashboard → Summarize
- Select a document
- Click "Generate Summary"
- View and save the AI-generated summary

### 4. Ask Questions
- Go to Dashboard → AI Chat
- Select one or more documents
- Type your question
- Get instant, context-aware answers

### 5. Practice with Questions
- Go to Dashboard → Practice Questions
- Select a document and difficulty level
- Generate exam-style MCQs
- Test yourself with show/hide answers

## 🏗️ Project Structure

```
ai-study-companion/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chat/         # Chat/Q&A endpoint
│   │   │   ├── documents/    # Document management
│   │   │   ├── questions/    # Question generation
│   │   │   └── summarize/    # Summarization endpoint
│   │   ├── auth/             # Auth pages (signin, signup)
│   │   ├── dashboard/        # Protected dashboard pages
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── providers/        # Context providers
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── ai.ts             # OpenAI integration
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma client
│   │   ├── document-processor.ts  # File processing
│   │   ├── embeddings.ts     # Vector embeddings
│   │   └── utils.ts          # Utility functions
│   ├── hooks/                # React hooks
│   └── types/                # TypeScript definitions
├── uploads/                  # File storage (gitignored)
├── .env                      # Environment variables
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Key Components

### RAG System Architecture
1. **Document Upload**: Files are processed and text is extracted
2. **Chunking**: Content is split into 1000-character chunks
3. **Embedding**: Each chunk is converted to vector embeddings
4. **Storage**: Embeddings stored in PostgreSQL
5. **Retrieval**: Query is embedded and similar chunks are found
6. **Generation**: GPT-4 generates answer from relevant chunks

### Database Schema
- **Users**: Authentication and user data
- **Documents**: Uploaded files and extracted content
- **Embeddings**: Vector embeddings for each document chunk
- **Conversations**: Chat history
- **Messages**: Individual chat messages
- **Questions**: Generated practice questions

## 🌟 Features in Detail

### Smart Document Processing
- Automatic text extraction from multiple formats
- Intelligent chunking for optimal embedding
- Metadata preservation (subject, description, file info)

### Advanced RAG Implementation
- Cosine similarity for semantic search
- Top-K retrieval for relevant context
- Citation tracking for transparency

### AI-Powered Learning
- Context-aware question answering
- Automatic summarization with key concepts
- Difficulty-adapted question generation
- Personalized to each student's materials

## 🚧 Future Enhancements

- [ ] Support for more file formats (videos, images)
- [ ] Flashcard generation from materials
- [ ] Study schedule planning with AI
- [ ] Collaborative study groups
- [ ] Mobile app (React Native)
- [ ] Voice interaction
- [ ] Multi-language support
- [ ] Advanced analytics and progress tracking
- [ ] Integration with LMS platforms
- [ ] Spaced repetition system

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents/upload` - Upload new document

### AI Features
- `POST /api/chat` - Ask questions (RAG)
- `POST /api/summarize` - Generate summary
- `POST /api/questions/generate` - Create practice questions

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based session management
- User data isolation in database
- Secure file upload validation
- API route protection with middleware
- Environment variable protection

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Restart PostgreSQL
# Check DATABASE_URL in .env
# Run: npx prisma db push
```

### OpenAI API Errors
```bash
# Verify OPENAI_API_KEY in .env
# Check API quota and billing
# Ensure model access (gpt-4, text-embedding-3-small)
```

### File Upload Failures
```bash
# Check file size limit (10MB)
# Verify supported format (PDF, DOCX, PPTX, TXT)
# Ensure uploads/ directory exists
```

## 📝 License

This project is for educational purposes. Modify and use as needed for your learning.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 👨‍💻 Developer

Built with ❤️ for students who want to study smarter, not harder.

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embeddings API
- Vercel for Next.js framework
- shadcn for beautiful UI components
- Prisma team for the amazing ORM

---

**Happy Learning! 🎓✨**

For questions or support, please open an issue on GitHub.

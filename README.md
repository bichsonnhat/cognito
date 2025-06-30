# 🧠 Cognito - AI-Powered Creative Platform

> A comprehensive AI platform for content generation, conversation, and multimedia processing powered by modern technologies.

![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![Prisma](https://img.shields.io/badge/Prisma-5.2.0-indigo)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.3-cyan)

## 🌟 Features

### 🎨 AI-Powered Content Generation
- **🗣️ Conversation AI**: Advanced chatbot with context-aware responses
- **🖼️ Photo Generation**: AI face swap technology supporting both image and video sources
- **🎥 Video Generation**: Lip-sync video creation with audio synchronization
- **🎵 Audio Generation**: Text-to-speech with voice cloning capabilities
- **💻 Code Generation**: AI-powered code assistance and generation

### 🎭 Advanced Media Processing
- **Face Swapping**: Upload images or videos as source material for realistic face swaps
- **Lip Sync Videos**: Create synchronized lip movements with custom audio
- **Voice Cloning**: Generate speech with custom voice samples
- **Multi-format Support**: Handles JPG, PNG, WebP, MP4, MOV, AVI formats

### 📚 Content Management
- **Gallery System**: Centralized view of all generated content
- **Auto-save**: Automatic saving of generated media to database
- **Content Filtering**: Filter by content type (audio, photo, video)
- **Download & Delete**: Manage your generated content easily

### 💳 Subscription & Limits
- **Freemium Model**: Free tier with usage limits
- **Stripe Integration**: Secure payment processing
- **Usage Tracking**: Monitor API calls and generation limits
- **Pro Features**: Unlimited access for subscribers

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.1.0 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Radix UI Components
- **State Management**: Zustand
- **Authentication**: Clerk
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **AI Processing**: Python Flask server with FaceFusion

### AI & Media Processing
- **Text Generation**: OpenAI GPT
- **Voice Synthesis**: Replicate AI (VixTTS)
- **Face Processing**: FaceFusion
- **Video Processing**: FFmpeg

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- PostgreSQL database
- FFmpeg installed

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cognito.git
cd cognito
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies (Python)
cd server
pip install flask flask-cors python-dotenv requests cloudinary replicate
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Services
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server URL
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Start Development Servers**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Python Backend):
```bash
cd server
python app.py
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
cognito/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Main application
│   │   └── (routes)/
│   │       ├── audio/            # Audio generation
│   │       ├── video/            # Video generation  
│   │       ├── photo/            # Photo generation
│   │       ├── code/             # Code generation
│   │       ├── conversation/     # Chat interface
│   │       └── gallery/          # Content gallery
│   ├── (landing)/                # Landing page
│   └── api/                      # API routes
├── components/                   # Reusable components
├── lib/                         # Utilities and configurations
├── prisma/                      # Database schema
├── server/                      # Python Flask backend
│   ├── app.py                   # Main Flask application
│   └── facefusion/              # AI processing engine
└── stores/                      # State management
```

## 🎯 API Endpoints

### Frontend API Routes
- `POST /api/audio` - Audio generation
- `GET /api/audio/prediction-status` - Check audio generation status
- `POST /api/photo` - Photo generation
- `POST /api/video` - Video generation
- `POST /api/conversation` - Chat completions
- `POST /api/code` - Code generation
- `GET/POST/DELETE /api/generated-content` - Content management
- `POST /api/stripe` - Payment processing
- `POST /api/webhook` - Stripe webhooks

### Python Backend Routes
- `POST /generate-audio` - Create audio prediction
- `GET /prediction-status` - Check prediction status
- `POST /faceswap` - Face swap processing
- `POST /generate-video` - Lip sync video generation

## 🔧 Configuration

### FaceFusion Setup
The project uses FaceFusion for advanced face processing:

1. **Install FaceFusion dependencies**:
```bash
cd server/facefusion
pip install -r requirements.txt
```

2. **Core ML Setup** (macOS):
```bash
pip install onnxruntime-coreml
```

### Cloudinary Configuration
Configure Cloudinary for media storage:
1. Create account at cloudinary.com
2. Get your cloud name, API key, and secret
3. Add to environment variables

### Stripe Integration
Set up Stripe for payments:
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhook endpoints
4. Add keys to environment variables

## 🎨 Features Deep Dive

### Audio Generation
- **Text-to-Speech**: Convert text to natural-sounding speech
- **Voice Cloning**: Upload audio samples for custom voice generation
- **Async Processing**: Real-time status updates with polling
- **Format Support**: Output in MP3/WAV formats

### Video Generation  
- **Lip Sync**: Synchronize lip movements with audio
- **Multi-format Input**: MP4, MOV, AVI support
- **High Quality**: Powered by FaceFusion technology
- **Cloud Processing**: Scalable video generation

### Photo Generation
- **Face Swapping**: Advanced face replacement technology
- **Dual Input**: Support for image and video sources
- **Real-time Preview**: Live preview of uploaded media
- **High Resolution**: Multiple resolution options

### Gallery Management
- **Auto-save**: Generated content automatically saved
- **Filtering**: View by content type
- **Download**: Direct download of generated files
- **Metadata**: Track prompts and generation parameters

## 🔐 Security & Privacy

- **Authentication**: Secure user authentication with Clerk
- **Data Protection**: User data encrypted and securely stored
- **File Processing**: Temporary file handling with cleanup
- **API Security**: Rate limiting and authentication required
- **Payment Security**: PCI-compliant Stripe integration

## 📊 Monitoring & Analytics

- **Usage Tracking**: Monitor API calls and generations
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage patterns and insights

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
# Prepare Python backend for deployment
cd server
pip freeze > requirements.txt
```

### Database (Neon/PlanetScale)
```bash
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](link-to-wiki)
- **Issues**: Report bugs on [GitHub Issues](link-to-issues)
- **Community**: Join our [Discord](link-to-discord)
- **Email**: support@cognito-ai.com

## 🙏 Acknowledgments

- [FaceFusion](https://github.com/facefusion/facefusion) for face processing technology
- [Replicate](https://replicate.com) for AI model hosting
- [Clerk](https://clerk.com) for authentication
- [Stripe](https://stripe.com) for payment processing
- [Cloudinary](https://cloudinary.com) for media management

---

<div align="center">
  <strong>Built with ❤️ by Nhat Bich</strong>
</div>
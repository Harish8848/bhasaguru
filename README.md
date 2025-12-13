# BhasaGuru - Language Learning Platform

BhasaGuru is a comprehensive language learning platform built with Next.js, featuring courses, lessons, mock tests, job listings, and cultural content to help users learn languages effectively.

## Features

- **Course Management**: Create and manage language courses with lessons, videos, and interactive content
- **Mock Tests**: Practice tests with multiple question types and performance tracking
- **Job Board**: Language-related job listings and applications
- **Cultural Content**: Articles and cultural insights
- **User Management**: Authentication, profiles, and progress tracking
- **Admin Dashboard**: Complete administrative control over content
- **Media Uploads**: Cloudinary integration for images and videos
- **Analytics**: Page views and user engagement tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Media Storage**: Cloudinary
- **Email**: Resend
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** (recommended) or npm
- **PostgreSQL** database (local or cloud like Neon)
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Harish8848/bhasaguru.git
   cd bhasaguru
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**

   Copy the `.env` file and update the following variables:

   ```bash
   cp .env .env.local
   ```

   **Required Environment Variables:**

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DIRECT_DATABASE_URL`: Direct database connection (for migrations)
   - `NEXTAUTH_SECRET`: Random secret for NextAuth
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `RESEND_API_KEY`: Your Resend API key for emails

4. **Database Setup**

   Generate Prisma client and push schema:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

   Seed the database with initial data:
   ```bash
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:pull` - Pull schema from database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with roles (USER, ADMIN, MODERATOR)
- **Courses**: Language courses with lessons
- **Lessons**: Individual lessons with content and media
- **Mock Tests**: Practice exams with questions
- **Questions**: Test questions with multiple types
- **Job Listings**: Language-related job opportunities
- **Articles**: Cultural and educational content
- **Enrollments**: User course enrollments and progress

## Authentication

The app uses NextAuth.js for authentication with Google OAuth. Users can:

- Sign in with Google
- View and edit their profiles
- Track learning progress
- Apply for jobs
- Save favorite content

## Admin Features

Admin users have access to:

- User management
- Course and lesson creation/editing
- Mock test management
- Job listing management
- Article publishing
- Analytics dashboard
- Content moderation

## API Routes

The application includes RESTful API routes for:

- `/api/courses` - Course management
- `/api/lessons` - Lesson content
- `/api/mock-test` - Test functionality
- `/api/jobs` - Job listings
- `/api/articles` - Cultural content
- `/api/admin/*` - Administrative operations
- `/api/auth/*` - Authentication

## File Upload

Media uploads are handled through Cloudinary with support for:

- Images (course thumbnails, user avatars, article images)
- Videos (lesson content)
- Audio files (lesson audio, test questions)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

For other platforms, ensure:

- Node.js 18+ runtime
- Environment variables are set
- Database is accessible
- Build command: `pnpm build` or `npm run build`
- Start command: `pnpm start` or `npm start`

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Component structure in `/src/components`
- API routes in `/src/app/api`

### Database Changes

When making schema changes:

1. Update `prisma/schema.prisma`
2. Generate migration: `pnpm db:migrate`
3. Update Prisma client: `pnpm db:generate`
4. Test changes thoroughly

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Prisma accelerate URL | Yes |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application base URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `RESEND_API_KEY` | Resend email API key | Yes |
| `REDIS_URL` | Redis connection URL | No |
| `RAPIDAPI_KEY` | RapidAPI key for external services | No |

## Support

For support or questions:

- Create an issue on GitHub
- Check existing documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.

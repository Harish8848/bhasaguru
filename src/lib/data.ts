import { BookOpen, Award, Briefcase, Users, TrendingUp, Globe } from "lucide-react"

//FAQs Data
export const faqs = [
    {
      id: 1,
      question: "What languages can I learn on BhasaGuru?",
      answer:
        "We offer Japanese, Korean, and English (IELTS,PTE) courses with CEFR levels from A1 to C2. Each language has comprehensive curriculum with video lessons, interactive exercises, and real-world scenarios.",
    },
    {
      id: 2,
      question: "How long does it take to become job-ready?",
      answer:
        "Most learners reach job-ready proficiency (B1-B2) in 4-6 months with consistent study. However, it depends on your starting level and commitment. We have a structured learning path to help you.",
    },
    {
      id: 3,
      question: "Are the certifications recognized internationally?",
      answer:
        "Yes! Our certifications align with CEFR standards and are recognized by employers in Japan, Korea, and globally. Many of our graduates have successfully used them for visa applications and job applications.",
    },
    {
      id: 4,
      question: "Can I access courses on mobile?",
      answer:
        "Obiviously, our web app is fully mobile responsive so,  You can download lessons and study offline, making it perfect for busy professionals.",
    },
    {
      id: 5,
      question: "What if I'm a complete beginner?",
      answer:
        "Perfect! We have dedicated A1 courses for complete beginners. Our step-by-step approach ensures you build strong foundations. Join thousands of beginners who have successfully progressed.",
    },
    {
      id: 6,
      question: "Is there job guarantee after course completion?",
      answer:
        "While we can't guarantee jobs, we actively match learners with opportunities and have a 95% placement success rate within 6 months of completion. Our job board has 1000+ listings.",
    },
  ]




  //Stats Data

  export const stats = [
    {
      number: "50K+",
      label: "Active Learners",
      description: "From 85+ countries learning with BhasaGuru",
    },
    {
      number: "500+",
      label: "Expert Courses",
      description: "From beginner to advanced proficiency levels",
    },
    {
      number: "95%",
      label: "Satisfaction Rate",
      description: "Learners recommend BhasaGuru to others",
    },
    {
      number: "1000+",
      label: "Job Placements",
      description: "Successful placements in 2024 alone",
    },
  ]
  
//Footer Links Data
  export const footerLinks = [
    {
      title: "Product",
      links: ["Courses", "Jobs", "Certifications", "Pricing"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Contact"],
    },
    {
      title: "Resources",
      links: ["Help Center", "Community", "API Docs", "Status"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Cookies", "Compliance"],
    },
  ]

  //Language Levels Data
  export const languages = [
    { code: "japanese", label: "Japanese", courses: 12, icon: "🇯🇵", learners: 8500 },
    { code: "korean", label: "Korean", courses: 10, icon: "🇰🇷", learners: 6200 },
    { code: "english", label: "English", courses: 15, icon: "🇺🇸", learners: 12000 },
  ]
  
  export const levels = [
    { level: "BEGINNER", label: "A1", description: "Start your journey" },
    { level: "ELEMENTARY", label: "A2", description: "Build foundation" },
    { level: "INTERMEDIATE", label: "B1", description: "Speak with confidence" },
    { level: "UPPER_INTERMEDIATE", label: "B2", description: "Advanced fluency" },
    { level: "ADVANCED", label: "C1", description: "Near native level" },
    { level: "PROFICIENT", label: "C2", description: "Mastery achieved" },
  ]


  //Features Data
  export const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description:
        "Comprehensive curriculum from CEFR A1 to C2 level. Learn at your own pace with video, audio, and interactive lessons.",
    },
    {
      icon: Award,
      title: "Certifications",
      description:
        "Earn recognized language proficiency certificates. Boost your resume and demonstrate your skills to employers.",
    },
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description:
        "Browse 1000+ international job listings. Get matched with positions that fit your language skills and career goals.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Connect with learners worldwide. Share experiences, get feedback, and build professional networks globally.",
    },
  ]
  

  //Job Stats Data
  export const jobStats = [
    { label: "Active Listings", value: "1,200+", icon: Briefcase },
    { label: "Average Salary", value: "NPR 1Lakh/Month", icon: TrendingUp },
    { label: "Successful Placements", value: "8,500+", icon: Globe },
  ]
  
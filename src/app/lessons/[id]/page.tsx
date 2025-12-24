import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { LessonView } from "@/components/lesson-view"
import { LessonAttachment, LessonType } from "@/lib/types"

interface LessonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  // Fetch lesson
  const lesson = await prisma.lesson.findUnique({
    where: { id: id },
    include: {
      course: {
        include: {
          lessons: {
            select: { id: true, title: true, slug: true, order: true, type: true, isFree: true },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!lesson) notFound()

  // Access control
  if (!lesson.isFree) {
    if (!session) {
         redirect(`/auth?callbackUrl=/lessons/${id}`)
    } else {
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: lesson.courseId
                }
            }
        })
        if (!enrollment) {
            redirect(`/courses/${lesson.course.slug}`)
        }
    }
  }

  // Fetch Progress
  let progress = null
  if (session) {
    const progressRecord = await prisma.progress.findUnique({
        where: {
            userId_lessonId: {
                userId: session.user.id,
                lessonId: id
            }
        }
    })
    if (progressRecord) {
        progress = {
            completed: progressRecord.completed,
            timeSpent: progressRecord.timeSpent
        }
    }
  }

  // Calculate next/prev
  const currentIndex = lesson.course.lessons.findIndex(l => l.id === id)
  const prevLesson = currentIndex > 0 ? lesson.course.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lesson.course.lessons.length - 1 ? lesson.course.lessons[currentIndex + 1] : null

  // Prepare data for client component
  const attachments = (lesson.attachments as unknown as LessonAttachment[]) || []

  const lessonData = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    type: lesson.type as LessonType,
    attachments: attachments,
    isFree: lesson.isFree,
    duration: lesson.duration,
    course: {
        id: lesson.course.id,
        title: lesson.course.title,
        slug: lesson.course.slug
    }
  }

  return (
    <LessonView 
        lesson={lessonData} 
        progress={progress} 
        prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null} 
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
        userId={session?.user?.id}
    />
  )
}

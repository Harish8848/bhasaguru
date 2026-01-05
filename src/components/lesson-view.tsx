"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Video, Music, Download, ArrowLeft, ArrowRight, Paperclip } from "lucide-react"
import { LessonAttachment, LessonType } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog"

interface LessonData {
  id: string
  title: string
  description?: string | null
  content: string
  type: LessonType
  attachments?: LessonAttachment[]
  isFree: boolean
  duration?: number | null
  course: {
    id: string
    title: string
    slug: string
  }
}

interface ProgressData {
  completed: boolean
  timeSpent: number
}

interface LessonViewProps {
  lesson: LessonData
  progress?: ProgressData | null
  prevLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
  userId?: string
}

export function LessonView({ lesson, progress, prevLesson, nextLesson, userId }: LessonViewProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(progress?.completed || false)
  const [markingComplete, setMarkingComplete] = useState(false)

  const handleToggleComplete = async () => {
    if (!userId) return 
    
    setMarkingComplete(true)
    try {
      const response = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !isCompleted })
      })
      
      if (response.ok) {
        setIsCompleted(!isCompleted)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update progress", error)
    } finally {
      setMarkingComplete(false)
    }
  }

  // Helper to render attachment icon
  const getAttachmentIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileText className="h-4 w-4" />
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    return <Paperclip className="h-4 w-4" />
  }
  
  // Find media attachment if Lesson Type is VIDEO or AUDIO
  const mediaAttachment = lesson.attachments?.find(a => 
    (lesson.type === 'VIDEO' && a.type.startsWith('video/')) ||
    (lesson.type === 'AUDIO' && a.type.startsWith('audio/'))
  )

  const renderPreviewContent = (att: LessonAttachment) => {
    if (att.type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center p-4">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={att.url} alt={att.name} className="  max-w-full max-h-[80vh] rounded-md object-cover object-center" />
        </div>
      )
    }
    if (att.type.startsWith("video/")) {
        return (
            <div className="flex items-center justify-center p-4 w-full">
                <video controls className="max-w-full max-h-[80vh] w-full" src={att.url} />
            </div>
        )
    }
    if (att.type.includes("pdf")) {
        return (
            <div className="w-full h-[80vh]">
                 <iframe src={att.url} className="w-full h-full rounded-md border" />
            </div>
        )
    }

    
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Paperclip className="h-16 w-16 text-muted-foreground mb-4" />
            <p>Preview not available for this file type.</p>
            <Button className="mt-4" asChild>
                <a href={att.url} download target="_blank" rel="noopener noreferrer">
                   <Download className="mr-2 h-4 w-4" /> Download File
                </a>
            </Button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12 ">
      {/* Top Navigation Bar */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/lessons`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lessons
            </Button>
            <div className="flex items-center gap-2">
                 {prevLesson && (
                    <Button variant="outline" size="sm" onClick={() => router.push(`/lessons/${prevLesson.id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Prev
                    </Button>
                 )}
                 {nextLesson && (
                    <Button variant="outline" size="sm" onClick={() => router.push(`/lessons/${nextLesson.id}`)}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 )}
            </div>
        </div>
      </div>

                {/* Header */}
                <div className="container mx-auto px-4 py-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{lesson.type}</Badge>
                        {lesson.duration && <span className="text-sm text-muted-foreground">{lesson.duration} mins</span>}
                    </div>
                    <h1 className="text-3xl font-bold">{lesson.title}</h1>
                    {lesson.description && <p className="text-muted-foreground mt-2">{lesson.description}</p>}
                </div>
{/*attachment rendering*/}
    <div className="space-y-6  mx-auto w-screen-lg px-4">
                {/* Direct Media Rendering */}
                {lesson.attachments && lesson.attachments.map((att, idx) => {
                    const isImage = att.type === "image" || att.type.startsWith("image/");
                    const isVideo = att.type === "video" || att.type.startsWith("video/");
                    const isAudio = att.type === "audio" || att.type.startsWith("audio/");
                    const isPdf = att.type === "pdf" || att.type.includes("pdf");

                    return (
                        <Card key={idx} className="overflow-hidden">
                             <CardHeader className="py-3 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base truncate pr-4" title={att.name}>{att.name}</CardTitle>
                                    <Button variant="ghost" size="icon" asChild title="Download">
                                        <a href={att.url} download target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isImage && (
                                     /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={att.url} alt={att.name} className="w-full h-auto object-contain max-h-600px" />
                                )}
                                {isVideo && (
                                    <div className="aspect-video bg-black">
                                        <video controls className="w-full h-full" src={att.url} />
                                    </div>
                                )}
                                {isAudio && (
                                    <div className="p-6 bg-muted flex flex-col items-center justify-center">
                                         <Music className="h-12 w-12 mb-4 text-muted-foreground" />
                                         <audio controls className="w-full" src={att.url} />
                                    </div>
                                )}
                                {isPdf && (
                                    <div className="w-full h-600px">
                                        <iframe src={att.url} className="w-full h-full" />
                                    </div>
                                )}
                                {!isImage && !isVideo && !isAudio && !isPdf && (
                                     <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                            <Paperclip className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{att.type}</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={att.url} download target="_blank" rel="noopener noreferrer">
                                                Download File
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                 {/* Fallback for Video Type if no attachments */}
                {lesson.type === 'VIDEO' && (!lesson.attachments || lesson.attachments.length === 0) && (
                     <Card className="p-8 text-center bg-muted">
                        <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Video content placeholder.</p>
                     </Card>
                )}
            </div>           
            <div className=" py-5 space-y-6   w-screen-lg px-4 ">
                {/* Lesson Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lesson Content</CardTitle>
                    </CardHeader>
                    <CardContent className="whitespace-pre-wrap">
                        <p className="text-2xl" dangerouslySetInnerHTML={{  __html : lesson.content  }} >
                        </p>
                    </CardContent>
                </Card>

            </div>
         </div>
  )
}
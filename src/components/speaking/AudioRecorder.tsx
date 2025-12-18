"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Trash2,
  Volume2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  maxDuration?: number // in seconds
  disabled?: boolean
  className?: string
}

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioUrl: string | null
  isPlaying: boolean
}

export default function AudioRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 120, // 2 minutes default
  disabled = false,
  className = ""
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioUrl: null,
    isPlaying: false
  })

  // Timer effect
  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return { ...prev, duration: maxDuration }
          }
          return { ...prev, duration: newDuration }
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.isRecording, state.isPaused, maxDuration])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setState(prev => ({
          ...prev,
          audioUrl,
          isRecording: false,
          isPaused: false
        }))
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        onRecordingComplete?.(audioBlob)
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false, 
        duration: 0,
        audioUrl: null 
      }))
      
      onRecordingStart?.()
      toast.success("Recording started")
      
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error("Failed to start recording. Please check microphone permissions.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      if (state.isPaused) {
        mediaRecorderRef.current.resume()
        setState(prev => ({ ...prev, isPaused: false }))
        toast.success("Recording resumed")
      } else {
        mediaRecorderRef.current.pause()
        setState(prev => ({ ...prev, isPaused: true }))
        toast.success("Recording paused")
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      onRecordingStop?.()
      toast.success("Recording stopped")
    }
  }

  const togglePlayback = () => {
    if (audioRef.current && state.audioUrl) {
      if (state.isPlaying) {
        audioRef.current.pause()
        setState(prev => ({ ...prev, isPlaying: false }))
      } else {
        audioRef.current.play()
        setState(prev => ({ ...prev, isPlaying: true }))
      }
    }
  }

  const downloadRecording = () => {
    if (state.audioUrl) {
      const link = document.createElement('a')
      link.href = state.audioUrl
      link.download = `speaking-response-${Date.now()}.webm`
      link.click()
      toast.success("Recording downloaded")
    }
  }

  const deleteRecording = () => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioUrl: null,
        isPlaying: false
      })
      toast.success("Recording deleted")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    if (state.isRecording && !state.isPaused) return "bg-red-500"
    if (state.isRecording && state.isPaused) return "bg-yellow-500"
    if (state.audioUrl) return "bg-green-500"
    return "bg-gray-500"
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Status Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="text-sm font-medium">
              {state.isRecording && !state.isPaused && "Recording..."}
              {state.isRecording && state.isPaused && "Paused"}
              {state.audioUrl && !state.isRecording && "Recording Complete"}
              {!state.isRecording && !state.audioUrl && "Ready to Record"}
            </span>
          </div>
          {state.isRecording && (
            <Badge variant="outline" className="font-mono">
              {formatTime(state.duration)} / {formatTime(maxDuration)}
            </Badge>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-3 mb-4">
          {!state.isRecording && !state.audioUrl && (
            <Button
              onClick={startRecording}
              disabled={disabled}
              size="lg"
              className="bg-red-600 hover:bg-red-700"
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          )}

          {state.isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
              >
                {state.isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
              
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}

          {state.audioUrl && (
            <>
              <Button
                onClick={togglePlayback}
                variant="outline"
                size="lg"
              >
                {state.isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={downloadRecording}
                variant="outline"
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button
                onClick={deleteRecording}
                variant="destructive"
                size="lg"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              <Button
                onClick={startRecording}
                variant="outline"
                size="lg"
              >
                <Mic className="mr-2 h-4 w-4" />
                Record Again
              </Button>
            </>
          )}
        </div>

        {/* Audio Playback */}
        {state.audioUrl && (
          <div className="space-y-3">
            <audio
              ref={audioRef}
              src={state.audioUrl}
              onEnded={() => setState(prev => ({ ...prev, isPlaying: false }))}
              className="w-full"
              controls
            />
            
            {/* Waveform Visualization Placeholder */}
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary/20 rounded-full flex-1 min-h-4px"
                  style={{
                    height: `${Math.random() * 100 + 10}%`,
                    animation: state.isPlaying ? 'pulse 0.5s ease-in-out infinite alternate' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recording Tips */}
        {!state.isRecording && !state.audioUrl && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3" />
              <span>Ensure your microphone is working properly</span>
            </div>
            <div>• Speak clearly and at a normal pace</div>
            <div>• Maximum recording time: {formatTime(maxDuration)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

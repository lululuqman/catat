import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Trash2 } from 'lucide-react'

function VoiceRecorder({ onRecordingComplete, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
  }

  const useRecording = () => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob)
    }
  }

  return (
    <div className="card">
      <div className="flex flex-col items-center space-y-4">
        {/* Recording Status */}
        <div className="text-center">
          {isRecording ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center animate-pulse">
                  <Mic className="h-12 w-12 text-primary-600" />
                </div>
                {isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2">
                      <span className="text-xs font-semibold text-gray-600">PAUSED</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900 font-mono">
                {formatTime(recordingTime)}
              </p>
              <p className="text-sm text-gray-500">Recording in progress...</p>
            </div>
          ) : audioBlob ? (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <Play className="h-12 w-12 text-green-600" />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">
                Recording complete
              </p>
              <p className="text-sm text-gray-500">Duration: {formatTime(recordingTime)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <Mic className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">
                Ready to record
              </p>
              <p className="text-sm text-gray-500">Click the button below to start</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && !isRecording && (
          <div className="w-full">
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              disabled={disabled}
              className="btn-primary flex items-center gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={pauseRecording}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={useRecording}
                className="btn-primary"
              >
                Use This Recording
              </button>
              <button
                onClick={deleteRecording}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder


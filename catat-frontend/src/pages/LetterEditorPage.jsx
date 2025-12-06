import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Download, Trash2 } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { pdfService } from '../services/pdfService'
import { formatMalaysianLetter } from '../templates/letterTemplates'

function LetterEditorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [metadata, setMetadata] = useState(null)
  const [structuredData, setStructuredData] = useState(null)
  const [transcript, setTranscript] = useState(null)

  useEffect(() => {
    // Load letter data from navigation state or Supabase (if editing existing)
    if (location.state) {
      const { letter, metadata: meta, structuredData: structured, transcript: trans } = location.state
      
      if (letter) {
        setContent(letter)
      }
      
      if (meta) {
        setMetadata(meta)
        setTitle(`${meta.letter_type} Letter - ${new Date().toLocaleDateString()}`)
      }
      
      if (structured) {
        setStructuredData(structured)
      }
      
      if (trans) {
        setTranscript(trans)
      }
    } else if (id && id !== 'new') {
      // TODO: Load from Supabase by ID
      // For now, redirect back if no state
      navigate('/letters')
    }
  }, [location, id, navigate])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // TODO: Save to Supabase
      // For now, just simulate save
      await new Promise(resolve => setTimeout(resolve, 500))
      
      alert('Letter saved successfully!')
      navigate('/letters')
    } catch (error) {
      alert('Failed to save letter: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this letter?')) {
      // TODO: Delete from Supabase
      navigate('/letters')
    }
  }

  const handleExportPDF = () => {
    try {
      // Strip HTML tags from Quill content for PDF
      const plainText = content.replace(/<[^>]*>/g, '')
      
      const pdfMetadata = {
        letter_type: metadata?.letter_type || 'letter',
        language: metadata?.language || 'en'
      }
      
      const doc = pdfService.generateLetterPDF(plainText, pdfMetadata)
      
      const filename = `${metadata?.letter_type || 'letter'}_${new Date().getTime()}.pdf`
      pdfService.downloadPDF(doc, filename)
      
    } catch (error) {
      alert('Failed to export PDF: ' + error.message)
    }
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/letters')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Letters</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              {id && id !== 'new' && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Letter'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Editor */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metadata Info */}
        {metadata && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-medium text-blue-900">
                Type: <span className="font-normal text-blue-700">{metadata.letter_type}</span>
              </span>
              <span className="font-medium text-blue-900">
                Language: <span className="font-normal text-blue-700">{metadata.language}</span>
              </span>
              {metadata.tone_detected && (
                <span className="font-medium text-blue-900">
                  Tone: <span className="font-normal text-blue-700">{metadata.tone_detected}</span>
                </span>
              )}
              {metadata.urgency && (
                <span className="font-medium text-blue-900">
                  Urgency: <span className="font-normal text-blue-700">{metadata.urgency}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Original Transcript (collapsible) */}
        {transcript && (
          <details className="mb-4 card cursor-pointer">
            <summary className="font-semibold text-gray-700">
              View Original Transcript
            </summary>
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcript}</p>
            </div>
          </details>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Letter Title..."
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="p-6">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Edit your letter here..."
              className="min-h-[500px]"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Tips:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Edit the letter content to add any missing details</li>
            <li>Ensure sender and recipient information is correct</li>
            <li>Check the date format matches Malaysian standards</li>
            <li>Click "Save Letter" to store it in your library</li>
            <li>Use "Export PDF" to download a formatted copy</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LetterEditorPage


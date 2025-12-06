import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Download, Trash2 } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

function NoteEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNewNote = id === 'new'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNewNote) {
      // Later: Load note from Supabase
      // For now, use mock data
      const mockNotes = {
        '1': { title: 'My First Note', content: '<p>This is a sample note. Click to edit!</p>' },
        '2': { title: 'Meeting Notes', content: '<p>Important points from today\'s meeting...</p>' },
        '3': { title: 'Ideas', content: '<p>Brainstorming session ideas...</p>' },
      }
      const note = mockNotes[id]
      if (note) {
        setTitle(note.title)
        setContent(note.content)
      }
    }
  }, [id, isNewNote])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      alert('Note saved successfully!')
      if (isNewNote) {
        navigate('/notes')
      }
    }, 500)
    // Later: Save to Supabase
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      // Later: Delete from Supabase
      navigate('/notes')
    }
  }

  const handleExportPDF = () => {
    // Later: Implement PDF export using your pdfService
    alert('PDF export feature coming soon!')
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/notes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Notes</span>
            </button>
            <div className="flex items-center gap-3">
              {!isNewNote && (
                <>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Editor */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Title Input */}
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title..."
              className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
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
              placeholder="Start writing your note..."
              className="min-h-[400px]"
            />
          </div>
        </div>

        {/* Save Reminder */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Don't forget to save your changes!</p>
        </div>
      </div>
    </div>
  )
}

export default NoteEditorPage


import { useState } from 'react'
import { FileText, Plus, Search, Trash2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function NotesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Mock notes data - later you'll replace this with real data from Supabase
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'My First Note',
      content: 'This is a sample note. Click to edit!',
      createdAt: '2025-12-06',
    },
    {
      id: 2,
      title: 'Meeting Notes',
      content: 'Important points from today\'s meeting...',
      createdAt: '2025-12-05',
    },
    {
      id: 3,
      title: 'Ideas',
      content: 'Brainstorming session ideas...',
      createdAt: '2025-12-04',
    },
  ])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteNote = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Catat
              </span>
            </div>
            <button 
              onClick={() => navigate('/notes/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Note
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            My Notes
          </h1>
          <p className="text-gray-600">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} in total
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/notes/new')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create New Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div onClick={() => navigate(`/notes/${note.id}`)}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/notes/${note.id}`)
                    }}
                    className="flex-1 text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note.id)
                    }}
                    className="flex-1 text-sm text-gray-600 hover:text-red-600 font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPage


import { useState, useEffect } from 'react'
import { FileText, Plus, Search, Trash2, Download, Edit, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { pdfService } from '../services/pdfService'
import { wordService } from '../services/wordService'
import { getLetterTypeDisplay, getLanguageDisplay } from '../templates/letterTemplates'

function LettersPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLanguage, setFilterLanguage] = useState('all')
  const [letters, setLetters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch letters from Supabase on mount
  useEffect(() => {
    loadLetters()
  }, [])

  const loadLetters = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!supabaseService.isConfigured()) {
        // Use mock data if Supabase not configured
        setLetters([
          {
            id: 'mock-1',
            title: 'Sample Complaint Letter',
            content: 'This is a sample letter. Configure Supabase to save real letters.',
            letter_type: 'complaint',
            language: 'en',
            tone_detected: 'formal',
            urgency: 'medium',
            created_at: new Date().toISOString(),
          }
        ])
        setError('Supabase not configured. Please set up your .env file.')
      } else {
        const data = await supabaseService.getLetters()
        setLetters(data)
      }
    } catch (err) {
      console.error('Failed to load letters:', err)
      setError(err.message)
      setLetters([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || letter.letter_type === filterType
    const matchesLanguage = filterLanguage === 'all' || letter.language === filterLanguage
    
    return matchesSearch && matchesType && matchesLanguage
  })

  const handleDeleteLetter = async (id) => {
    if (!confirm('Are you sure you want to delete this letter?')) {
      return
    }
    
    try {
      if (supabaseService.isConfigured()) {
        await supabaseService.deleteLetter(id)
        // Refresh the list
        await loadLetters()
        alert('Letter deleted successfully!')
      } else {
        setLetters(letters.filter(letter => letter.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete letter:', error)
      alert('Failed to delete letter: ' + error.message)
    }
  }

  const handleExportPDF = (letter) => {
    try {
      const pdfMetadata = {
        letter_type: letter.letter_type,
        language: letter.language
      }

      const doc = pdfService.generateLetterPDF(letter.content, pdfMetadata)
      const filename = `${letter.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`
      pdfService.downloadPDF(doc, filename)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF: ' + error.message)
    }
  }

  const handleExportWord = async (letter) => {
    try {
      const wordMetadata = {
        letter_type: letter.letter_type,
        language: letter.language
      }

      const doc = await wordService.generateLetterDOCX(letter.content, wordMetadata)
      const filename = `${letter.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.docx`
      await wordService.downloadDOCX(doc, filename)
    } catch (error) {
      console.error('Word export error:', error)
      alert('Failed to export Word document: ' + error.message)
    }
  }

  const getUrgencyColor = (urgency) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[urgency] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTypeIcon = (type) => {
    return <FileText className="h-5 w-5" />
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
            <div className="flex items-center gap-3">
              <button 
                onClick={loadLetters}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                title="Refresh letters"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={() => navigate('/generate')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                New Letter
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            My Letters
          </h1>
          <p className="text-gray-600">
            {letters.length} {letters.length === 1 ? 'letter' : 'letters'} in total
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 grid md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search letters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="proposal">Proposal</option>
              <option value="mc">MC Letter</option>
              <option value="general">General</option>
              <option value="official">Official</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="ms">Bahasa Malaysia</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <RefreshCw className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Loading letters...
            </h3>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery || filterType !== 'all' || filterLanguage !== 'all' 
                ? 'No letters found' 
                : 'No letters yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterType !== 'all' || filterLanguage !== 'all'
                ? 'Try adjusting your filters'
                : 'Generate your first letter to get started'}
            </p>
            {!searchQuery && filterType === 'all' && filterLanguage === 'all' && (
              <button 
                onClick={() => navigate('/generate')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Generate New Letter
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLetters.map((letter) => (
              <div
                key={letter.id}
                className="card hover:shadow-xl transition-all duration-300 group"
              >
                {/* Letter Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(letter.letter_type)}
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {letter.letter_type}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${getUrgencyColor(letter.urgency)}`}>
                    {letter.urgency}
                  </span>
                </div>

                {/* Letter Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {letter.title || 'Untitled Letter'}
                </h3>

                {/* Letter Preview */}
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                  {letter.content || 'No content'}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200">
                    {getLanguageDisplay(letter.language)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-200">
                    {letter.tone_detected}
                  </span>
                </div>

                {/* Date */}
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(letter.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/letters/${letter.id}/edit`)}
                    className="flex-1 text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportPDF(letter)
                    }}
                    className="flex-1 text-sm text-gray-600 hover:text-secondary-600 font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExportWord(letter)
                    }}
                    className="flex-1 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center justify-center gap-1"
                    title="Export as Word document"
                  >
                    <FileText className="h-4 w-4" />
                    Word
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLetter(letter.id)
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

export default LettersPage


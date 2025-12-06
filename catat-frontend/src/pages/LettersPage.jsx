import { useState } from 'react'
import { FileText, Plus, Search, Trash2, Download, Edit } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getLetterTypeDisplay, getLanguageDisplay } from '../templates/letterTemplates'

function LettersPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterLanguage, setFilterLanguage] = useState('all')
  
  // Mock letters data - later you'll replace this with real data from Supabase
  const [letters, setLetters] = useState([
    {
      id: 1,
      title: 'Complaint to DBKL',
      content: 'This is a sample complaint letter about road conditions...',
      letter_type: 'complaint',
      language: 'en',
      tone_detected: 'formal',
      urgency: 'high',
      createdAt: '2025-12-06',
    },
    {
      id: 2,
      title: 'MC Letter',
      content: 'Medical certificate request letter...',
      letter_type: 'mc',
      language: 'en',
      tone_detected: 'formal',
      urgency: 'medium',
      createdAt: '2025-12-05',
    },
    {
      id: 3,
      title: 'Proposal Surat',
      content: 'Cadangan projek baru...',
      letter_type: 'proposal',
      language: 'ms',
      tone_detected: 'formal',
      urgency: 'low',
      createdAt: '2025-12-04',
    },
  ])

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || letter.letter_type === filterType
    const matchesLanguage = filterLanguage === 'all' || letter.language === filterLanguage
    
    return matchesSearch && matchesType && matchesLanguage
  })

  const handleDeleteLetter = (id) => {
    if (confirm('Are you sure you want to delete this letter?')) {
      setLetters(letters.filter(letter => letter.id !== id))
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
            <button 
              onClick={() => navigate('/generate')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Letter
            </button>
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

        {/* Letters Grid */}
        {filteredLetters.length === 0 ? (
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
                  {new Date(letter.createdAt).toLocaleDateString('en-US', {
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
                    onClick={() => {
                      // TODO: Export PDF
                      alert('PDF export coming soon!')
                    }}
                    className="flex-1 text-sm text-gray-600 hover:text-secondary-600 font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    PDF
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


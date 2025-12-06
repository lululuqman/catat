import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import VoiceRecorder from '../components/VoiceRecorder'
import { apiService } from '../services/apiService'
import { getLetterTypeDisplay, getLanguageDisplay } from '../templates/letterTemplates'

function LetterGeneratorPage() {
  const navigate = useNavigate()
  
  const [language, setLanguage] = useState('en')
  const [letterType, setLetterType] = useState('complaint')
  const [audioBlob, setAudioBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  // User input fields
  const [senderName, setSenderName] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderContact, setSenderContact] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientTitle, setRecipientTitle] = useState('')
  const [recipientOrganization, setRecipientOrganization] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  const handleRecordingComplete = (blob) => {
    setAudioBlob(blob)
    setResult(null)
    setError(null)
  }

  const handleGenerateLetter = async () => {
    if (!audioBlob) {
      setError('Please record your message first')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)
    
    try {
      setGenerationStep('Transcribing audio...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGenerationStep('Analyzing content...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setGenerationStep('Generating letter...')
      
      // Prepare contact info to send to backend
      const contactInfo = {
        senderName,
        senderAddress,
        senderContact,
        recipientName,
        recipientTitle,
        recipientOrganization,
        recipientAddress
      }
      
      const response = await apiService.generateLetter(audioBlob, language, letterType, contactInfo)
      
      setResult(response)
      setGenerationStep('Complete!')
      
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message || 'Failed to generate letter')
      setGenerationStep(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditLetter = () => {
    if (result) {
      // Merge user-provided info with AI-extracted info
      const mergedStructuredData = {
        ...result.structured_data,
        sender: {
          ...result.structured_data.sender,
          name: senderName || result.structured_data.sender.name,
          address: senderAddress || result.structured_data.sender.address,
          contact: senderContact || result.structured_data.sender.contact,
        },
        recipient: {
          ...result.structured_data.recipient,
          name: recipientName || result.structured_data.recipient.name,
          title: recipientTitle || result.structured_data.recipient.title,
          organization: recipientOrganization || result.structured_data.recipient.organization,
          address: recipientAddress || result.structured_data.recipient.address,
        }
      }
      
      navigate('/letters/new/edit', {
        state: {
          letter: result.letter,
          metadata: result.metadata,
          structuredData: mergedStructuredData,
          transcript: result.transcript
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Catat
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Generate Letter
          </h1>
          <p className="text-gray-600 mb-3">
            Record your message and let AI transform it into a professional Malaysian formal letter
          </p>
          <div className="inline-flex items-center gap-2 text-sm bg-green-50 text-green-800 px-3 py-2 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span>Malaysian Formal Letter Format • Date in CAPITAL LETTERS • Professional Schema</span>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Letter Configuration</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isGenerating}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="ms">Bahasa Malaysia</option>
                <option value="mixed">Mixed (Manglish)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Choose the language for your final letter
              </p>
            </div>

            {/* Letter Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Type
              </label>
              <select
                value={letterType}
                onChange={(e) => setLetterType(e.target.value)}
                disabled={isGenerating}
                className="input-field"
              >
                <option value="complaint">Complaint Letter</option>
                <option value="proposal">Proposal Letter</option>
                <option value="mc">MC Letter</option>
                <option value="general">General Letter</option>
                <option value="official">Official Letter</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the type of letter you want to generate
              </p>
            </div>
          </div>

          {/* Sender and Recipient Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sender Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Sender (Your Info)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g., Ahmad bin Abdullah"
                    disabled={isGenerating}
                    className="input-field"
                  />
                </div>

                {showOptionalFields && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Address (Optional)
                      </label>
                      <textarea
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        placeholder="e.g., 123 Jalan Tun Razak, Kuala Lumpur"
                        disabled={isGenerating}
                        rows="2"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Contact (Optional)
                      </label>
                      <input
                        type="text"
                        value={senderContact}
                        onChange={(e) => setSenderContact(e.target.value)}
                        placeholder="e.g., 012-345-6789 or email@example.com"
                        disabled={isGenerating}
                        className="input-field"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Recipient Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Recipient (Send To)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., DBKL or YB. Datuk Ahmad"
                    disabled={isGenerating}
                    className="input-field"
                  />
                </div>

                {showOptionalFields && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title/Position (Optional)
                      </label>
                      <input
                        type="text"
                        value={recipientTitle}
                        onChange={(e) => setRecipientTitle(e.target.value)}
                        placeholder="e.g., Mayor, Director, YB"
                        disabled={isGenerating}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization (Optional)
                      </label>
                      <input
                        type="text"
                        value={recipientOrganization}
                        onChange={(e) => setRecipientOrganization(e.target.value)}
                        placeholder="e.g., Dewan Bandaraya Kuala Lumpur"
                        disabled={isGenerating}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Address (Optional)
                      </label>
                      <textarea
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="e.g., Menara DBKL, Jalan Raja Laut"
                        disabled={isGenerating}
                        rows="2"
                        className="input-field"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Toggle Optional Fields */}
            <div className="mt-4">
              <button
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showOptionalFields ? '− Hide Optional Fields' : '+ Show Optional Fields (Address, Contact, etc.)'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Fill in at least your name and recipient name. AI will try to extract additional details from your voice recording.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Record Your Message</h2>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isGenerating}
          />
        </div>

        {/* Generate Button */}
        {audioBlob && !result && (
          <div className="mb-6 text-center">
            <button
              onClick={handleGenerateLetter}
              disabled={isGenerating}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {generationStep || 'Processing...'}
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Generate Letter
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="card bg-red-50 border-2 border-red-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Letter Generated Successfully!</h3>
                  <p className="text-sm text-green-700">
                    {getLetterTypeDisplay(result.metadata.letter_type)} in {getLanguageDisplay(result.metadata.language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Transcript</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{result.transcript}</p>
              </div>
            </div>

            {/* Structured Data */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Extracted Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sender</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    {result.structured_data.sender.name && (
                      <p><span className="font-medium">Name:</span> {result.structured_data.sender.name}</p>
                    )}
                    {result.structured_data.sender.address && (
                      <p><span className="font-medium">Address:</span> {result.structured_data.sender.address}</p>
                    )}
                    {result.structured_data.sender.contact && (
                      <p><span className="font-medium">Contact:</span> {result.structured_data.sender.contact}</p>
                    )}
                    {!result.structured_data.sender.name && !result.structured_data.sender.address && (
                      <p className="text-gray-400 italic">No sender info detected</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recipient</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    {result.structured_data.recipient.name && (
                      <p><span className="font-medium">Name:</span> {result.structured_data.recipient.name}</p>
                    )}
                    {result.structured_data.recipient.organization && (
                      <p><span className="font-medium">Org:</span> {result.structured_data.recipient.organization}</p>
                    )}
                    {!result.structured_data.recipient.name && !result.structured_data.recipient.organization && (
                      <p className="text-gray-400 italic">No recipient info detected</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Subject:</span> {result.structured_data.subject}</p>
                  <p><span className="font-medium">Tone:</span> {result.structured_data.tone_detected}</p>
                  <p><span className="font-medium">Urgency:</span> {result.structured_data.urgency_level}</p>
                </div>
              </div>

              {result.structured_data.key_points.length > 0 && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {result.structured_data.key_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generated Letter */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Generated Letter</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Malaysian Formal Format
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
                <p className="text-xs text-gray-600">
                  ✓ Markdown-style formatting • ✓ Date in capital letters • ✓ Recipient left, date right
                </p>
              </div>
              <div
                className="bg-white p-6 rounded-lg border-2 border-gray-200 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: result.letter }}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleEditLetter}
                className="btn-primary text-lg px-8 py-4"
              >
                Edit & Save Letter
              </button>
              <button
                onClick={() => {
                  setResult(null)
                  setAudioBlob(null)
                }}
                className="px-8 py-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-lg"
              >
                Generate New Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LetterGeneratorPage


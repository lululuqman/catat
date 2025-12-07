import { FileText, Mic, Zap, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Catat
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/letters')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                My Letters
              </button>
              <button 
                onClick={() => navigate('/generate')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-primary-700 font-semibold text-sm">🇲🇾 Made for Malaysia</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6">
            You Speak.
            <span className="block bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 bg-clip-text text-transparent">
              Let AI Catat-ing for you.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Transform your voice into professional Malaysian letters in seconds. 
            Just speak your complaint, proposal, or message – AI handles the rest.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/generate')}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
            >
              <Mic className="h-5 w-5" />
              Generate Letter
            </button>
            <button 
              onClick={() => navigate('/letters')}
              className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 border-2 border-gray-200 text-lg"
            >
              View Examples
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-display font-bold text-center mb-16">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Voice Recording</h3>
            <p className="text-gray-600">
              Simply speak your complaint or proposal. No typing required. Supports Manglish too!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="bg-secondary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Letter Generation</h3>
            <p className="text-gray-600">
              Powered by Groq and Claude AI to transform casual speech into formal letters.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="bg-accent-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-accent-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Malaysian Formats</h3>
            <p className="text-gray-600">
              Proper Malaysian letter structure. English, Malay, or convert Manglish to formal.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-4">Perfect For</h2>
          <p className="text-gray-600 text-lg">Real situations where Malaysians need formal letters</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-4xl mb-3">🏘️</div>
            <h3 className="font-semibold mb-2">Complaints</h3>
            <p className="text-sm text-gray-600">Road issues, DBKL, housing</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="font-semibold mb-2">Proposals</h3>
            <p className="text-sm text-gray-600">Business, projects, ideas</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🏥</div>
            <h3 className="font-semibold mb-2">MC Letters</h3>
            <p className="text-sm text-gray-600">Medical leave notifications</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-semibold mb-2">Official Letters</h3>
            <p className="text-sm text-gray-600">School, university, government</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Generate Your Letter?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Just speak and let AI transform it into a professional Malaysian letter.
          </p>
          <button 
            onClick={() => navigate('/generate')}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-lg inline-flex items-center gap-2"
          >
            <Mic className="h-5 w-5" />
            Start Recording Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-display font-bold">Catat</span>
            </div>
            <p className="text-gray-400">
              © 2025 Catat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage


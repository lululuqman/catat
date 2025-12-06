import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

class ApiService {
  /**
   * Generate letter from audio recording
   * @param {Blob} audioBlob - The recorded audio blob
   * @param {string} language - Language: 'en', 'ms', or 'mixed'
   * @param {string} letterType - Letter type: 'complaint', 'proposal', 'mc', 'general', 'official'
   * @param {Object} contactInfo - User-provided contact information (optional)
   * @returns {Promise} Response with transcript, structured_data, letter, metadata
   */
  async generateLetter(audioBlob, language, letterType, contactInfo = {}) {
    try {
      const formData = new FormData()
      
      // Create a file from the blob with appropriate extension
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: 'audio/webm',
      })
      
      formData.append('audio', audioFile)
      formData.append('language', language)
      formData.append('letter_type', letterType)
      
      // Add user-provided contact information if available
      if (contactInfo.senderName) formData.append('sender_name', contactInfo.senderName)
      if (contactInfo.senderAddress) formData.append('sender_address', contactInfo.senderAddress)
      if (contactInfo.senderContact) formData.append('sender_contact', contactInfo.senderContact)
      if (contactInfo.recipientName) formData.append('recipient_name', contactInfo.recipientName)
      if (contactInfo.recipientTitle) formData.append('recipient_title', contactInfo.recipientTitle)
      if (contactInfo.recipientOrganization) formData.append('recipient_organization', contactInfo.recipientOrganization)
      if (contactInfo.recipientAddress) formData.append('recipient_address', contactInfo.recipientAddress)

      const response = await apiClient.post('/api/generate-letter', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('API Error:', error)
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.detail || 'Failed to generate letter'
        throw new Error(errorMessage)
      } else if (error.request) {
        // Request made but no response
        throw new Error('Cannot connect to server. Please ensure the backend is running.')
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred')
      }
    }
  }

  /**
   * Health check to verify backend connection
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      throw new Error('Backend server is not reachable')
    }
  }

  /**
   * Get server info
   */
  async getServerInfo() {
    try {
      const response = await apiClient.get('/')
      return response.data
    } catch (error) {
      throw new Error('Failed to get server info')
    }
  }
}

export const apiService = new ApiService()


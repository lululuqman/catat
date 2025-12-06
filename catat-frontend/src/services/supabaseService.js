import { supabase } from '../config/supabase'

class SupabaseService {
  /**
   * Save a letter to Supabase
   * @param {Object} letterData - Letter data to save
   * @returns {Promise<Object>} Saved letter with ID
   */
  async saveLetter(letterData) {
    try {
      const { data, error } = await supabase
        .from('letters')
        .insert([
          {
            title: letterData.title,
            content: letterData.content,
            letter_type: letterData.metadata?.letter_type || 'general',
            language: letterData.metadata?.language || 'en',
            tone_detected: letterData.metadata?.tone_detected,
            urgency: letterData.metadata?.urgency,
            transcript: letterData.transcript,
            structured_data: letterData.structuredData,
            metadata: letterData.metadata,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Supabase save error:', error)
        throw new Error(error.message)
      }

      return data[0]
    } catch (error) {
      console.error('Failed to save letter:', error)
      throw error
    }
  }

  /**
   * Update an existing letter
   * @param {string} id - Letter ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated letter
   */
  async updateLetter(id, updates) {
    try {
      const { data, error } = await supabase
        .from('letters')
        .update({
          title: updates.title,
          content: updates.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(error.message)
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update letter:', error)
      throw error
    }
  }

  /**
   * Get all letters
   * @returns {Promise<Array>} Array of letters
   */
  async getLetters() {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch letters:', error)
      throw error
    }
  }

  /**
   * Get a single letter by ID
   * @param {string} id - Letter ID
   * @returns {Promise<Object>} Letter object
   */
  async getLetter(id) {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to fetch letter:', error)
      throw error
    }
  }

  /**
   * Delete a letter
   * @param {string} id - Letter ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteLetter(id) {
    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
        throw new Error(error.message)
      }

      return true
    } catch (error) {
      console.error('Failed to delete letter:', error)
      throw error
    }
  }

  /**
   * Search letters by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching letters
   */
  async searchLetters(query) {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase search error:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Failed to search letters:', error)
      throw error
    }
  }

  /**
   * Check if Supabase is configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    return !!(url && key && url !== 'your_supabase_url' && key !== 'your_supabase_key')
  }
}

export const supabaseService = new SupabaseService()


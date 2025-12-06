/**
 * Letter Formatting Utilities
 * Converts plain text letters to properly formatted HTML for Quill editor
 * Supports Malaysian formal letter schema with simple HTML formatting
 *
 * Malaysian Formal Letter Structure:
 * - Sender info (each line in separate <p> tag)
 * - Horizontal separator (<hr>)
 * - Recipient info (each line in separate <p> tag)
 * - Date (separate <p> tag, in CAPITAL LETTERS)
 * - Salutation
 * - Subject (plain text with "Subject:" or "Perkara:" prefix)
 * - Body paragraphs
 * - Closing (separate <p> tags for closing phrase and signature)
 */

/**
 * Convert plain text letter to HTML with proper paragraph formatting
 * Supports Malaysian formal letter schema with separate paragraphs
 * @param {string} letterText - Plain text letter content
 * @returns {string} HTML formatted letter
 */
export const formatLetterToHTML = (letterText) => {
  if (!letterText) return ''

  // If already contains HTML tags, return as-is
  if (letterText.includes('<p>') || letterText.includes('<br>') || letterText.includes('<hr>')) {
    return letterText
  }

  // Split by double newlines to identify paragraphs
  const paragraphs = letterText.split(/\n\n+/)

  // Convert each paragraph to HTML
  const htmlParagraphs = paragraphs.map(para => {
    // Trim whitespace
    const trimmed = para.trim()
    if (!trimmed) return ''

    // Check if this is a separator line
    if (trimmed.match(/^[-_=]{3,}$/)) {
      return '<hr>'
    }

    // Replace single newlines with <br> tags within the paragraph
    const withBreaks = trimmed.replace(/\n/g, '<br>')

    // Wrap in paragraph tags
    return `<p>${withBreaks}</p>`
  }).filter(p => p) // Remove empty paragraphs

  return htmlParagraphs.join('\n\n')
}

/**
 * Convert HTML to plain text for PDF export
 * Handles Malaysian formal letter format with separate paragraphs
 * @param {string} html - HTML content
 * @returns {string} Plain text with proper line breaks
 */
export const htmlToPlainText = (html) => {
  if (!html) return ''

  // Create a temporary element
  const temp = document.createElement('div')
  temp.innerHTML = html

  // Replace <p> tags with double newlines for paragraph breaks
  let processedHtml = html
    .replace(/<hr\s*\/?>/gi, '\n---\n')  // Replace <hr> with separator
    .replace(/<\/p>\s*<p>/gi, '\n\n')    // Between paragraphs
    .replace(/<p[^>]*>/gi, '')            // Remove opening <p> (including with attributes)
    .replace(/<\/p>/gi, '\n\n')           // Replace closing </p> with newlines
    .replace(/<br\s*\/?>/gi, '\n')        // Replace <br> with newline
    .replace(/<strong>/gi, '')            // Remove <strong>
    .replace(/<\/strong>/gi, '')          // Remove </strong>
    .replace(/<span[^>]*>/gi, '')         // Remove <span> (including floated ones)
    .replace(/<\/span>/gi, '')            // Remove </span>
    .replace(/\*\*/g, '')                 // Remove markdown-style bold markers
    .replace(/<[^>]+>/g, '')              // Remove any remaining HTML tags

  // Create temp element with processed HTML to get clean text
  temp.innerHTML = processedHtml
  let text = temp.textContent || temp.innerText || ''

  // Clean up excessive newlines (more than 2 in a row)
  text = text.replace(/\n{3,}/g, '\n\n')

  // Trim whitespace from start and end
  text = text.trim()

  return text
}

/**
 * Ensure letter has proper Malaysian formal letter formatting structure
 * Checks for required elements: separator, salutation, subject
 * @param {string} content - Letter content (HTML or plain text)
 * @returns {string} Properly formatted HTML
 */
export const ensureMalaysianFormat = (content) => {
  const formatted = formatLetterToHTML(content)

  // Check if it has the Malaysian formal letter structure
  const hasSeparator = formatted.includes('<hr>') || formatted.includes('---')
  const hasSubject = formatted.includes('Subject:') || formatted.includes('Perkara:') ||
                     formatted.includes('Re:') || formatted.includes('Rujukan:')
  const hasSalutation = formatted.includes('Dear ') || formatted.includes('Tuan') || formatted.includes('Puan')

  // Log warnings for missing elements (helpful for debugging)
  if (!hasSeparator) {
    console.warn('Letter may be missing horizontal separator line (<hr>)')
  }
  if (!hasSubject) {
    console.warn('Letter may be missing subject line')
  }
  if (!hasSalutation) {
    console.warn('Letter may be missing salutation (Dear Sir/Madam or Tuan/Puan)')
  }

  return formatted
}

/**
 * Add proper spacing between letter sections
 * Updates for Malaysian formal letter schema
 * @param {string} html - HTML content
 * @returns {string} HTML with proper spacing
 */
export const addLetterSpacing = (html) => {
  // Add extra spacing after specific sections
  let spaced = html

  // Ensure spacing after <hr> separator
  spaced = spaced.replace(/<hr>\s*/gi, '<hr>\n\n')

  // Ensure spacing after subject line (plain text format)
  spaced = spaced.replace(/(Subject:.*?<\/p>)/gi, '$1\n\n')
  spaced = spaced.replace(/(Perkara:.*?<\/p>)/gi, '$1\n\n')
  spaced = spaced.replace(/(Re:.*?<\/p>)/gi, '$1\n\n')
  spaced = spaced.replace(/(Rujukan:.*?<\/p>)/gi, '$1\n\n')

  // Clean up excessive spacing
  spaced = spaced.replace(/\n{3,}/g, '\n\n')

  return spaced
}


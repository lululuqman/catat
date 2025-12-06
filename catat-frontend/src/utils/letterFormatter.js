/**
 * Letter Formatting Utilities
 * Converts plain text letters to properly formatted HTML for Quill editor
 */

/**
 * Convert plain text letter to HTML with proper paragraph formatting
 * @param {string} letterText - Plain text letter content
 * @returns {string} HTML formatted letter
 */
export const formatLetterToHTML = (letterText) => {
  if (!letterText) return ''
  
  // If already contains HTML tags, return as-is
  if (letterText.includes('<p>') || letterText.includes('<br>')) {
    return letterText
  }
  
  // Split by double newlines to identify paragraphs
  const paragraphs = letterText.split(/\n\n+/)
  
  // Convert each paragraph to HTML
  const htmlParagraphs = paragraphs.map(para => {
    // Trim whitespace
    const trimmed = para.trim()
    if (!trimmed) return ''
    
    // Replace single newlines with <br> tags within the paragraph
    const withBreaks = trimmed.replace(/\n/g, '<br>')
    
    // Wrap in paragraph tags
    return `<p>${withBreaks}</p>`
  }).filter(p => p) // Remove empty paragraphs
  
  return htmlParagraphs.join('\n')
}

/**
 * Convert HTML to plain text for PDF export
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
    .replace(/<\/p>\s*<p>/gi, '\n\n')  // Between paragraphs
    .replace(/<p>/gi, '')               // Remove opening <p>
    .replace(/<\/p>/gi, '\n\n')         // Replace closing </p> with newlines
    .replace(/<br\s*\/?>/gi, '\n')      // Replace <br> with newline
    .replace(/<strong>/gi, '')          // Remove <strong>
    .replace(/<\/strong>/gi, '')        // Remove </strong>
    .replace(/<[^>]+>/g, '')            // Remove any remaining HTML tags
  
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
 * Ensure letter has proper Malaysian formatting structure
 * @param {string} content - Letter content (HTML or plain text)
 * @returns {string} Properly formatted HTML
 */
export const ensureMalaysianFormat = (content) => {
  const formatted = formatLetterToHTML(content)
  
  // Check if it has the basic structure
  const hasSubject = formatted.includes('Re:') || formatted.includes('Rujukan:')
  const hasSalutation = formatted.includes('Dear ') || formatted.includes('Tuan') || formatted.includes('Puan')
  
  if (!hasSubject || !hasSalutation) {
    console.warn('Letter may be missing standard Malaysian format elements')
  }
  
  return formatted
}

/**
 * Add proper spacing between letter sections
 * @param {string} html - HTML content
 * @returns {string} HTML with proper spacing
 */
export const addLetterSpacing = (html) => {
  // Add extra spacing after specific sections
  let spaced = html
  
  // Add space after sender info (before date)
  spaced = spaced.replace(/(<\/p>\s*<p>\d{1,2}\s+\w+\s+\d{4}<\/p>)/i, '</p>\n\n$1')
  
  // Add space after date (before recipient)
  spaced = spaced.replace(/(\d{4}<\/p>\s*<p>)/i, '$1')
  
  // Add space after subject line
  spaced = spaced.replace(/(Re:.*?<\/strong><\/p>)/i, '$1\n')
  
  return spaced
}


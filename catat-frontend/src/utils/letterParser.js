/**
 * Shared letter parsing utilities for PDF and Word export services
 * Extracts structured letter components from HTML content
 */

/**
 * Parse letter structure from HTML content
 * Extract: sender, recipient, date, subject, salutation, body, closing, signature
 */
export function parseLetterStructure(html) {
  // Extract plain text from HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  const paragraphs = Array.from(temp.querySelectorAll('p'))
    .map(p => p.textContent.trim())
    .filter(p => p.length > 0)

  const structure = {
    sender: [],
    recipientName: '',
    recipient: [],
    date: '',
    subject: '',
    salutation: '',
    body: [],
    closing: '',
    signatureName: ''
  }

  let currentSection = 'sender'
  let foundSalutation = false

  paragraphs.forEach((para, index) => {
    const lower = para.toLowerCase()

    // Check if it's a date
    if (isDate(para)) {
      structure.date = para
      return
    }

    // Check if it's a subject line
    if (lower.startsWith('re:') || lower.startsWith('rujukan:') || lower.startsWith('subject:') || lower.includes('**subject')) {
      structure.subject = para.replace(/\*\*/g, '').trim()
      return
    }

    // Check if it's salutation
    if (isSalutation(para) && !foundSalutation) {
      structure.salutation = para
      foundSalutation = true
      currentSection = 'body'
      return
    }

    // Check if it's closing
    if (isClosing(para)) {
      structure.closing = para
      currentSection = 'signature'
      return
    }

    // Route to appropriate section
    if (currentSection === 'sender') {
      // Only add to sender if it contains bracket placeholders OR is very short (name/address format)
      // AND we haven't collected too many sender lines yet
      if (para.includes('[') && structure.sender.length < 3) {
        structure.sender.push(para)
      } else if (!para.includes('[') && para.length < 50 && structure.sender.length < 3) {
        structure.sender.push(para)
      } else {
        // Switch to recipient
        currentSection = 'recipient'
        // Check if this line is recipient or should go elsewhere
        if (para.includes('[')) {
          structure.recipient.push(para)
        } else {
          // This is likely body content that appears before recipient
          // Hold it temporarily and add after we find the structure
          currentSection = 'body'
          structure.body.push(para)
        }
      }
    } else if (currentSection === 'recipient') {
      // Recipient lines (before salutation)
      if (!foundSalutation && para.includes('[')) {
        // First recipient line is the name, rest is address
        if (!structure.recipientName) {
          structure.recipientName = para
        } else {
          structure.recipient.push(para)
        }
      } else if (!foundSalutation) {
        // Not a bracket placeholder, so it's body content
        currentSection = 'body'
        structure.body.push(para)
      }
    } else if (currentSection === 'body') {
      structure.body.push(para)
    } else if (currentSection === 'signature') {
      // After closing, this is signature name
      if (!structure.signatureName) {
        structure.signatureName = para
      }
    }
  })

  return structure
}

/**
 * Check if text is a date
 */
export function isDate(text) {
  const datePatterns = [
    /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|mac|april|mei|jun|julai|ogos|september|oktober|november|disember)/i,
    /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/,
    /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
    /[a-z]+\s+\d{1,2}\s+[a-z]+\s+\d{4}/i
  ]

  return datePatterns.some(pattern => pattern.test(text))
}

/**
 * Check if text is a salutation
 */
export function isSalutation(text) {
  const salutations = [
    'dear sir',
    'dear madam',
    'dear sir/madam',
    'tuan',
    'puan',
    'tuan/puan',
    'yang berhormat',
    'yb',
    'to whom'
  ]

  const lower = text.toLowerCase().trim()
  return salutations.some(sal => lower.includes(sal)) && text.length < 50
}

/**
 * Check if text is a closing phrase
 */
export function isClosing(text) {
  const closings = [
    'yours faithfully',
    'yours sincerely',
    'yours truly',
    'sincerely',
    'regards',
    'best regards',
    'yang benar',
    'yang menurut perintah',
    'sekian terima kasih',
    'terima kasih'
  ]

  const lower = text.toLowerCase().trim()
  return closings.some(closing => lower.includes(closing)) && text.length < 50
}

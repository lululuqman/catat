/**
 * Malaysian Letter Templates
 * Formats letters according to Malaysian formal letter standards
 * Uses simple HTML formatting with date in CAPITAL LETTERS
 * Subject line is plain text (no bold formatting)
 */

/**
 * Format date in Malaysian style with CAPITAL LETTERS
 * @param {Date} date - Date object
 * @param {string} language - 'en' or 'ms'
 * @returns {string} Formatted date in CAPITAL LETTERS
 */
export const formatMalaysianDate = (date = new Date(), language = 'en') => {
  const months = {
    en: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
    ms: ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER']
  }

  const day = date.getDate()
  const month = months[language][date.getMonth()]
  const year = date.getFullYear()

  // Return date in CAPITAL LETTERS
  return `${day} ${month} ${year}`
}

/**
 * Format English Letter with Malaysian Formal Schema
 * Returns HTML with simple formatting (subject line is plain text)
 */
export const formatEnglishLetter = (content, metadata = {}, structuredData = {}) => {
  const date = formatMalaysianDate(new Date(), 'en')

  const sender = structuredData?.sender || {}
  const recipient = structuredData?.recipient || {}
  const subject = structuredData?.subject || 'Letter'

  let letter = ''

  // Sender info - each line in separate <p> tag
  if (sender.name) letter += `<p>${sender.name}</p>\n\n`
  if (sender.address) letter += `<p>${sender.address}</p>\n\n`
  if (sender.contact) letter += `<p>${sender.contact}</p>\n\n`

  // Horizontal separator
  letter += '<hr>\n\n'

  // Recipient info - each line in separate <p> tag
  if (recipient.name) letter += `<p>${recipient.name}</p>\n\n`
  if (recipient.title) letter += `<p>${recipient.title}</p>\n\n`
  if (recipient.organization) letter += `<p>${recipient.organization}</p>\n\n`
  if (recipient.address) letter += `<p>${recipient.address}</p>\n\n`

  // Date in separate <p> tag
  letter += `<p>${date}</p>\n\n`

  // Salutation
  letter += '<p>Dear Sir/Madam,</p>\n\n'

  // Subject (plain text with prefix)
  letter += `<p>Subject: ${subject}</p>\n\n`

  // Content (wrap in paragraph if needed)
  if (content && !content.startsWith('<p>')) {
    letter += `<p>${content}</p>\n\n`
  } else {
    letter += content + '\n\n'
  }

  // Closing - separate <p> tags
  if (!content.includes('Yours faithfully') && !content.includes('Yours sincerely')) {
    letter += '<p>Yours faithfully,</p>\n\n'
    letter += `<p>${sender.name || '[Your Name]'}</p>`
  }

  return letter
}

/**
 * Format Malay Letter with Malaysian Formal Schema
 * Returns HTML with simple formatting (subject line is plain text)
 */
export const formatMalayLetter = (content, metadata = {}, structuredData = {}) => {
  const date = formatMalaysianDate(new Date(), 'ms')

  const sender = structuredData?.sender || {}
  const recipient = structuredData?.recipient || {}
  const subject = structuredData?.subject || 'Surat'

  let letter = ''

  // Sender info - each line in separate <p> tag
  if (sender.name) letter += `<p>${sender.name}</p>\n\n`
  if (sender.address) letter += `<p>${sender.address}</p>\n\n`
  if (sender.contact) letter += `<p>${sender.contact}</p>\n\n`

  // Horizontal separator
  letter += '<hr>\n\n'

  // Recipient info - each line in separate <p> tag
  if (recipient.name) letter += `<p>${recipient.name}</p>\n\n`
  if (recipient.title) letter += `<p>${recipient.title}</p>\n\n`
  if (recipient.organization) letter += `<p>${recipient.organization}</p>\n\n`
  if (recipient.address) letter += `<p>${recipient.address}</p>\n\n`

  // Date in separate <p> tag
  letter += `<p>${date}</p>\n\n`

  // Salutation
  letter += '<p>Tuan/Puan,</p>\n\n'

  // Subject (plain text with prefix)
  letter += `<p>Perkara: ${subject}</p>\n\n`

  // Opening
  if (!content.includes('Dengan segala hormatnya')) {
    letter += '<p>Dengan segala hormatnya, '
    // Content
    if (content && !content.startsWith('<p>')) {
      letter += content + '</p>\n\n'
    } else {
      letter += content + '\n\n'
    }
  } else {
    // Content
    if (content && !content.startsWith('<p>')) {
      letter += `<p>${content}</p>\n\n`
    } else {
      letter += content + '\n\n'
    }
  }

  // Closing - separate <p> tags
  if (!content.includes('Sekian, terima kasih')) {
    letter += '<p>Sekian, terima kasih.</p>\n\n'
    letter += '<p>Yang benar,</p>\n\n'
    letter += `<p>${sender.name || '[Nama Anda]'}</p>`
  }

  return letter
}

/**
 * Main function to format Malaysian letter with HTML formatting
 * @param {string} content - Letter content from AI
 * @param {object} metadata - Letter metadata
 * @param {string} language - 'en', 'ms', or 'mixed'
 * @param {object} structuredData - Structured data from backend
 * @returns {string} Formatted letter in HTML with Malaysian formal schema
 */
export const formatMalaysianLetter = (content, metadata = {}, language = 'en', structuredData = {}) => {
  // If content already looks formatted (has HTML tags or formal salutations), return as-is
  if (content.includes('<p>') || content.includes('<hr>') ||
      content.includes('Dear Sir/Madam') || content.includes('Tuan/Puan')) {
    return content
  }

  // Otherwise format based on language
  if (language === 'ms') {
    return formatMalayLetter(content, metadata, structuredData)
  } else {
    // Default to English for 'en' and 'mixed'
    return formatEnglishLetter(content, metadata, structuredData)
  }
}

/**
 * Extract plain text from HTML (for Quill editor content)
 */
export const stripHtml = (html) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Format letter type display name
 */
export const getLetterTypeDisplay = (letterType) => {
  const types = {
    complaint: 'Complaint Letter',
    proposal: 'Proposal Letter',
    mc: 'Medical Certificate Letter',
    general: 'General Letter',
    official: 'Official Letter'
  }
  return types[letterType] || 'Letter'
}

/**
 * Format language display name
 */
export const getLanguageDisplay = (language) => {
  const languages = {
    en: 'English',
    ms: 'Bahasa Malaysia',
    mixed: 'Mixed (Manglish)'
  }
  return languages[language] || 'English'
}


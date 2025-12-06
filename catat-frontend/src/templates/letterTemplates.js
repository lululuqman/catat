/**
 * Malaysian Letter Templates
 * Formats letters according to Malaysian official letter standards
 */

/**
 * Format date in Malaysian style
 * @param {Date} date - Date object
 * @param {string} language - 'en' or 'ms'
 * @returns {string} Formatted date
 */
export const formatMalaysianDate = (date = new Date(), language = 'en') => {
  const months = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ms: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
  }
  
  const day = date.getDate()
  const month = months[language][date.getMonth()]
  const year = date.getFullYear()
  
  return `${day} ${month} ${year}`
}

/**
 * Format English Letter
 */
export const formatEnglishLetter = (content, metadata = {}, structuredData = {}) => {
  const date = formatMalaysianDate(new Date(), 'en')
  
  const sender = structuredData?.sender || {}
  const recipient = structuredData?.recipient || {}
  const subject = structuredData?.subject || 'Letter'
  
  let letter = ''
  
  // Sender info
  if (sender.name) letter += `${sender.name}\n`
  if (sender.address) letter += `${sender.address}\n`
  if (sender.contact) letter += `${sender.contact}\n`
  letter += `\n`
  
  // Date
  letter += `${date}\n\n`
  
  // Recipient info
  if (recipient.name) letter += `${recipient.name}\n`
  if (recipient.title) letter += `${recipient.title}\n`
  if (recipient.organization) letter += `${recipient.organization}\n`
  if (recipient.address) letter += `${recipient.address}\n`
  letter += `\n`
  
  // Salutation
  letter += `Dear Sir/Madam,\n\n`
  
  // Subject
  letter += `Re: ${subject}\n\n`
  
  // Content
  letter += content
  
  // Closing
  if (!content.includes('Yours faithfully') && !content.includes('Yours sincerely')) {
    letter += `\n\nYours faithfully,\n\n`
    letter += sender.name || '[Your Name]'
  }
  
  return letter
}

/**
 * Format Malay Letter
 */
export const formatMalayLetter = (content, metadata = {}, structuredData = {}) => {
  const date = formatMalaysianDate(new Date(), 'ms')
  
  const sender = structuredData?.sender || {}
  const recipient = structuredData?.recipient || {}
  const subject = structuredData?.subject || 'Surat'
  
  let letter = ''
  
  // Sender info
  if (sender.name) letter += `${sender.name}\n`
  if (sender.address) letter += `${sender.address}\n`
  if (sender.contact) letter += `${sender.contact}\n`
  letter += `\n`
  
  // Date
  letter += `${date}\n\n`
  
  // Recipient info
  if (recipient.name) letter += `${recipient.name}\n`
  if (recipient.title) letter += `${recipient.title}\n`
  if (recipient.organization) letter += `${recipient.organization}\n`
  if (recipient.address) letter += `${recipient.address}\n`
  letter += `\n`
  
  // Salutation
  letter += `Tuan/Puan,\n\n`
  
  // Subject
  letter += `Rujukan: ${subject}\n\n`
  
  // Opening
  if (!content.includes('Dengan segala hormatnya')) {
    letter += `Dengan segala hormatnya, `
  }
  
  // Content
  letter += content
  
  // Closing
  if (!content.includes('Sekian, terima kasih')) {
    letter += `\n\nSekian, terima kasih.\n\n`
    letter += `Yang benar,\n\n`
    letter += sender.name || '[Nama Anda]'
  }
  
  return letter
}

/**
 * Main function to format Malaysian letter
 * @param {string} content - Letter content from AI
 * @param {object} metadata - Letter metadata
 * @param {string} language - 'en', 'ms', or 'mixed'
 * @param {object} structuredData - Structured data from backend
 * @returns {string} Formatted letter
 */
export const formatMalaysianLetter = (content, metadata = {}, language = 'en', structuredData = {}) => {
  // If content already looks formatted (has sender/recipient info), return as-is
  if (content.includes('Dear Sir/Madam') || content.includes('Tuan/Puan')) {
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


import jsPDF from 'jspdf'

class PDFService {
  /**
   * Generate PDF from letter content with proper Malaysian letter format
   */
  generateLetterPDF(letterContent, metadata = {}) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 25
    const maxWidth = pageWidth - (margin * 2)

    // Extract text from HTML
    const letterData = this.parseLetterStructure(letterContent)

    let y = margin

    // Set default font
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    // ===== SENDER SECTION (Top Left) =====
    if (letterData.sender.length > 0) {
      letterData.sender.forEach(line => {
        if (line.trim()) {
          doc.text(line.trim(), margin, y)
          y += 5
        }
      })
      y += 5 // Extra space after sender
    }

    // ===== HORIZONTAL LINE =====
    doc.setLineWidth(0.5)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8 // Space after line

    // ===== RECIPIENT SECTION (Left-aligned) with DATE (Right-aligned on last line) =====
    if (letterData.recipient.length > 0) {
      letterData.recipient.forEach((line, index) => {
        if (line.trim()) {
          doc.text(line.trim(), margin, y)
          
          // If this is the LAST recipient line AND we have a date,
          // put the date on the same line (right-aligned)
          if (index === letterData.recipient.length - 1 && letterData.date) {
            const dateX = pageWidth - margin - doc.getTextWidth(letterData.date)
            doc.text(letterData.date, dateX, y)
          }
          
          y += 5
        }
      })
      y += 8 // Extra space after recipient
    } else if (letterData.date) {
      // If no recipient but we have date, put it on right
      const dateX = pageWidth - margin - doc.getTextWidth(letterData.date)
      doc.text(letterData.date, dateX, y)
      y += 10
    }

    // ===== SALUTATION =====
    if (letterData.salutation) {
      doc.text(letterData.salutation, margin, y)
      y += 8 // Space after salutation
    }

    // ===== SUBJECT LINE (Bold and Underlined) - AFTER SALUTATION =====
    if (letterData.subject) {
      y += 2 // Small extra space before subject
      doc.setFont('helvetica', 'bold')
      const subjectText = letterData.subject
      doc.text(subjectText, margin, y)
      
      // Underline
      const subjectWidth = doc.getTextWidth(subjectText)
      doc.setLineWidth(0.3)
      doc.line(margin, y + 1, margin + subjectWidth, y + 1)
      
      y += 10 // Extra space after subject
      doc.setFont('helvetica', 'normal')
    }

    // ===== BODY PARAGRAPHS =====
    letterData.body.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        // Check for page break
        const estimatedHeight = Math.ceil(paragraph.length / 80) * 5 + 8
        if (y + estimatedHeight > pageHeight - margin - 20) {
          doc.addPage()
          y = margin
        }

        const wrappedText = doc.splitTextToSize(paragraph.trim(), maxWidth)
        doc.text(wrappedText, margin, y)
        y += wrappedText.length * 5
        y += 8 // Space between paragraphs
      }
    })

    // ===== CLOSING =====
    if (letterData.closing) {
      if (y > pageHeight - margin - 30) {
        doc.addPage()
        y = margin
      }
      doc.text(letterData.closing, margin, y)
      y += 5
    }

    // ===== SIGNATURE NAME =====
    if (letterData.signatureName) {
      if (y > pageHeight - margin - 20) {
        doc.addPage()
        y = margin
      }
      doc.text(letterData.signatureName, margin, y)
    }

    // Add footer
    this.addFooter(doc, metadata)

    return doc
  }

  /**
   * Parse letter structure from HTML content
   * Extract: sender, recipient, date, subject, salutation, body, closing, signature
   */
  parseLetterStructure(html) {
    // Extract plain text from HTML
    const temp = document.createElement('div')
    temp.innerHTML = html
    
    const paragraphs = Array.from(temp.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(p => p.length > 0)

    const structure = {
      sender: [],
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
      if (this.isDate(para)) {
        structure.date = para
        return
      }

      // Check if it's a subject line
      if (lower.startsWith('re:') || lower.startsWith('rujukan:') || lower.startsWith('subject:') || lower.includes('**subject')) {
        structure.subject = para.replace(/\*\*/g, '').trim()
        return
      }

      // Check if it's salutation
      if (this.isSalutation(para) && !foundSalutation) {
        structure.salutation = para
        foundSalutation = true
        currentSection = 'body'
        return
      }

      // Check if it's closing
      if (this.isClosing(para)) {
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
          structure.recipient.push(para)
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
  isDate(text) {
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
  isSalutation(text) {
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
  isClosing(text) {
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

  /**
   * Add footer to PDF with metadata
   */
  addFooter(doc, metadata) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()

    const footerY = pageHeight - 15
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')

    const letterType = this.formatLetterType(metadata?.letter_type)
    const language = this.formatLanguage(metadata?.language)
    const date = new Date().toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

    const footerText = `Generated by Catat • ${letterType} • ${language} • ${date}`
    
    const textWidth = doc.getTextWidth(footerText)
    const centerX = (pageWidth - textWidth) / 2
    
    doc.text(footerText, centerX, footerY)
  }

  /**
   * Format letter type for display
   */
  formatLetterType(type) {
    const types = {
      complaint: 'Complaint Letter',
      proposal: 'Proposal',
      mc: 'MC Letter',
      general: 'General Letter',
      official: 'Official Letter'
    }
    return types[type] || 'Letter'
  }

  /**
   * Format language for display
   */
  formatLanguage(lang) {
    const languages = {
      en: 'English',
      ms: 'Bahasa Malaysia',
      mixed: 'Mixed'
    }
    return languages[lang] || 'English'
  }

  /**
   * Download PDF to user's device
   */
  downloadPDF(doc, filename = 'letter.pdf') {
    doc.save(filename)
  }

  /**
   * Open PDF in new browser tab
   */
  openPDFInNewTab(doc) {
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url, '_blank')
  }

  /**
   * Get PDF as blob (for uploading to storage)
   */
  getPDFBlob(doc) {
    return doc.output('blob')
  }

  /**
   * Get PDF as base64 string
   */
  getPDFBase64(doc) {
    return doc.output('datauristring')
  }
}

export const pdfService = new PDFService()
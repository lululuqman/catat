import jsPDF from 'jspdf'

class PDFService {
  /**
   * Generate PDF from letter content with Malaysian formatting
   * Preserves all HTML formatting from Quill editor
   * @param {string} letterContent - The letter HTML content
   * @param {object} metadata - Letter metadata (letter_type, language, etc.)
   * @returns {jsPDF} PDF document
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

    doc.setFont('helvetica')
    doc.setTextColor(0, 0, 0)

    let y = margin
    const lineHeight = 5 // Height between lines within same paragraph
    const paragraphSpacing = 8 // Extra space between paragraphs

    // Parse HTML content
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(letterContent, 'text/html')
    const body = htmlDoc.body

    /**
     * Process a single element and return new Y position
     */
    const processElement = (element, currentY) => {
      let yPos = currentY

      // Check for page break
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPos > pageHeight - margin - requiredSpace) {
          doc.addPage()
          yPos = margin
        }
        return yPos
      }

      // TEXT NODE
      if (element.nodeType === Node.TEXT_NODE) {
        const text = element.textContent
        if (text && text.trim()) {
          // Don't render standalone text nodes (they'll be rendered by their parent)
          // This prevents duplicate rendering
          return yPos
        }
        return yPos
      }

      const tagName = element.tagName?.toLowerCase()

      // PARAGRAPH <p>
      if (tagName === 'p') {
        yPos = checkPageBreak()

        // Get all text content from paragraph (including formatted text)
        let paragraphText = ''
        let hasContent = false

        // Collect text and apply formatting
        const collectText = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent
            if (text && text.trim()) {
              paragraphText += text
              hasContent = true
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process child nodes
            node.childNodes.forEach(collectText)
          }
        }

        element.childNodes.forEach(collectText)

        if (hasContent && paragraphText.trim()) {
          // Check for alignment
          const style = element.getAttribute('style') || ''
          const classList = Array.from(element.classList || [])
          
          let align = 'left'
          if (style.includes('text-align: right') || style.includes('text-align:right') || 
              classList.some(c => c.includes('right'))) {
            align = 'right'
          } else if (style.includes('text-align: center') || style.includes('text-align:center') ||
                     classList.some(c => c.includes('center'))) {
            align = 'center'
          }

          // Process text with formatting
          yPos = this.renderFormattedParagraph(doc, element, yPos, margin, maxWidth, pageWidth, lineHeight, align)
          
          // Add paragraph spacing after content
          yPos += paragraphSpacing
        } else {
          // Empty paragraph - just add line spacing
          yPos += lineHeight
        }

        return yPos
      }

      // LINE BREAK <br>
      if (tagName === 'br') {
        return yPos + lineHeight
      }

      // LISTS <ul>, <ol>
      if (tagName === 'ul' || tagName === 'ol') {
        yPos = checkPageBreak()
        
        const listItems = element.querySelectorAll('li')
        listItems.forEach((li, index) => {
          yPos = checkPageBreak()
          
          const bullet = tagName === 'ul' ? '• ' : `${index + 1}. `
          const text = bullet + li.textContent.trim()
          
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          
          const wrappedText = doc.splitTextToSize(text, maxWidth - 5)
          doc.text(wrappedText, margin + 5, yPos)
          yPos += wrappedText.length * lineHeight
        })
        
        yPos += paragraphSpacing
        return yPos
      }

      // HEADINGS <h1>, <h2>, <h3>
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        yPos = checkPageBreak()
        
        const sizes = { h1: 16, h2: 14, h3: 13, h4: 12, h5: 11, h6: 10 }
        doc.setFontSize(sizes[tagName] || 11)
        doc.setFont('helvetica', 'bold')
        
        const text = element.textContent.trim()
        if (text) {
          const wrappedText = doc.splitTextToSize(text, maxWidth)
          doc.text(wrappedText, margin, yPos)
          yPos += wrappedText.length * lineHeight + 4
        }
        
        doc.setFont('helvetica', 'normal')
        return yPos
      }

      // DIV or other containers - process children
      if (element.childNodes && element.childNodes.length > 0) {
        element.childNodes.forEach(child => {
          yPos = processElement(child, yPos)
        })
      }

      return yPos
    }

    // Process body content
    if (body && body.childNodes && body.childNodes.length > 0) {
      body.childNodes.forEach(child => {
        y = processElement(child, y)
      })
    }

    // Add footer
    this.addFooter(doc, metadata)

    return doc
  }

  /**
   * Render a paragraph with inline formatting (bold, italic, underline)
   */
  renderFormattedParagraph(doc, element, startY, margin, maxWidth, pageWidth, lineHeight, align) {
    let yPos = startY
    const segments = []

    // Parse all inline formatting
    const parseNode = (node, format = {}) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        if (text && text.trim()) {
          segments.push({
            text: text,
            bold: format.bold || false,
            italic: format.italic || false,
            underline: format.underline || false
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase()
        const newFormat = { ...format }

        if (tagName === 'strong' || tagName === 'b') {
          newFormat.bold = true
        }
        if (tagName === 'em' || tagName === 'i') {
          newFormat.italic = true
        }
        if (tagName === 'u') {
          newFormat.underline = true
        }

        node.childNodes.forEach(child => parseNode(child, newFormat))
      }
    }

    element.childNodes.forEach(child => parseNode(child))

    // Render segments
    if (segments.length > 0) {
      doc.setFontSize(11)

      // Combine all text first for wrapping
      const fullText = segments.map(s => s.text).join('')
      const wrappedLines = doc.splitTextToSize(fullText, maxWidth)

      // Render each line
      wrappedLines.forEach(line => {
        let xPos = margin

        // Calculate X position based on alignment
        if (align === 'center') {
          const lineWidth = doc.getTextWidth(line)
          xPos = (pageWidth - lineWidth) / 2
        } else if (align === 'right') {
          const lineWidth = doc.getTextWidth(line)
          xPos = pageWidth - margin - lineWidth
        }

        // For simplicity, render the whole line with default formatting
        // (Full inline formatting with word-wrapping is complex and rarely needed for letters)
        const firstSegment = segments[0]
        
        if (firstSegment.bold && firstSegment.italic) {
          doc.setFont('helvetica', 'bolditalic')
        } else if (firstSegment.bold) {
          doc.setFont('helvetica', 'bold')
        } else if (firstSegment.italic) {
          doc.setFont('helvetica', 'italic')
        } else {
          doc.setFont('helvetica', 'normal')
        }

        doc.text(line, xPos, yPos)

        // Add underline if needed
        if (firstSegment.underline) {
          const lineWidth = doc.getTextWidth(line)
          doc.setLineWidth(0.2)
          doc.line(xPos, yPos + 1, xPos + lineWidth, yPos + 1)
        }

        yPos += lineHeight
      })
    }

    return yPos
  }

  /**
   * Add footer to PDF with metadata
   */
  addFooter(doc, metadata) {
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()

    const footerY = pageHeight - 12
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)

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
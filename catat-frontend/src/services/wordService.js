import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  Footer
} from 'docx'
import { parseLetterStructure } from '../utils/letterParser'

class WordService {
  /**
   * Generate Word document from letter content with proper Malaysian letter format
   */
  generateLetterDOCX(letterContent, metadata = {}) {
    if (!letterContent || !letterContent.trim()) {
      throw new Error('Letter content is empty')
    }

    // Parse HTML structure
    const letterData = parseLetterStructure(letterContent)

    if (!letterData.body || letterData.body.length === 0) {
      throw new Error('Could not parse letter content')
    }

    // Build document sections
    const sections = []

    // ===== SENDER SECTION (Top Left) =====
    if (letterData.sender.length > 0) {
      letterData.sender.forEach(line => {
        if (line.trim()) {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim() })],
              spacing: { after: 100 }
            })
          )
        }
      })
      // Extra space after sender
      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }))
    }

    // ===== HORIZONTAL LINE =====
    sections.push(
      new Paragraph({
        text: '',
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        spacing: { after: 200 }
      })
    )

    // ===== RECIPIENT NAME (Top, Left-aligned) =====
    if (letterData.recipientName) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: letterData.recipientName.trim() })],
          spacing: { after: 100 }
        })
      )
    }

    // ===== RECIPIENT ADDRESS (Left-aligned) with DATE (Right-aligned on same line) =====
    if (letterData.recipient.length > 0 || letterData.date) {
      sections.push(this.createRecipientDateTable(letterData))
    }

    // Extra space after recipient section
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }))

    // ===== SALUTATION =====
    if (letterData.salutation) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: letterData.salutation })],
          spacing: { after: 200 }
        })
      )
    }

    // ===== SUBJECT LINE (Bold and Underlined) - AFTER SALUTATION =====
    if (letterData.subject) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: letterData.subject,
              bold: true,
              underline: {
                type: UnderlineType.SINGLE
              }
            })
          ],
          spacing: { before: 100, after: 200 }
        })
      )
    }

    // ===== BODY PARAGRAPHS =====
    letterData.body.forEach(paragraph => {
      if (paragraph.trim()) {
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: paragraph.trim() })],
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED
          })
        )
      }
    })

    // ===== CLOSING =====
    if (letterData.closing) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: letterData.closing })],
          spacing: { before: 200, after: 100 }
        })
      )
    }

    // ===== SIGNATURE NAME =====
    if (letterData.signatureName) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: letterData.signatureName })],
          spacing: { after: 100 }
        })
      )
    }

    // Create document with proper margins (1 inch all sides = 1440 twips)
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: sections,
          footers: {
            default: this.createFooter(metadata)
          }
        }
      ]
    })

    return doc
  }

  /**
   * Create table for recipient address (left) and date (right) layout
   */
  createRecipientDateTable(letterData) {
    // Build recipient column content
    const recipientParagraphs = letterData.recipient.map(
      line =>
        new Paragraph({
          children: [new TextRun({ text: line.trim() })],
          spacing: { after: 100 }
        })
    )

    // Build date column content (right-aligned)
    const dateParagraphs = letterData.date
      ? [
          new Paragraph({
            children: [new TextRun({ text: letterData.date })],
            alignment: AlignmentType.RIGHT
          })
        ]
      : []

    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: recipientParagraphs.length > 0 ? recipientParagraphs : [new Paragraph({ text: '' })],
              width: {
                size: 50,
                type: WidthType.PERCENTAGE
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }
              }
            }),
            new TableCell({
              children: dateParagraphs.length > 0 ? dateParagraphs : [new Paragraph({ text: '' })],
              width: {
                size: 50,
                type: WidthType.PERCENTAGE
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE }
              }
            })
          ]
        })
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    })
  }

  /**
   * Create footer with metadata
   */
  createFooter(metadata) {
    const letterType = this.formatLetterType(metadata?.letter_type)
    const language = this.formatLanguage(metadata?.language)
    const date = new Date().toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

    const footerText = `Generated by Catat • ${letterType} • ${language} • ${date}`

    return new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: footerText,
              size: 16, // 8pt (half-points)
              color: '999999'
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ]
    })
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
   * Download Word document to user's device
   */
  async downloadDOCX(doc, filename = 'letter.docx') {
    try {
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading Word document:', error)
      throw new Error('Failed to generate Word document: ' + error.message)
    }
  }

  /**
   * Get Word document as blob (for future storage/upload)
   */
  async getDOCXBlob(doc) {
    return await Packer.toBlob(doc)
  }
}

export const wordService = new WordService()

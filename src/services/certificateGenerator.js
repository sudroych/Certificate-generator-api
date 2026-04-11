const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

/**
 * Certificate Generator Service
 * Generates IBM Distribution Sector certificates with clean, modern design using Sharp
 */
class CertificateGenerator {
  constructor() {
    // Certificate dimensions
    this.width = 1200;
    this.height = 900;
    
    // IBM Brand Colors
    this.colors = {
      ibmBlue: '#0F62FE',
      darkText: '#161616',
      grayText: '#525252',
      border: '#E0E0E0',
      background: '#FFFFFF'
    };
    
    // Organization (hardcoded)
    this.organization = 'IBM';
    this.footer = 'Distribution Sector Lead';
  }

  /**
   * Generate certificate ID
   * @returns {string} Unique certificate ID
   */
  generateCertificateId() {
    const uuid = uuidv4();
    return `CERT-${uuid}`;
  }

  /**
   * Format date to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Wrap text to fit within specified width (approximate)
   * @param {string} text - Text to wrap
   * @param {number} maxCharsPerLine - Maximum characters per line
   * @returns {string[]} Array of text lines
   */
  wrapText(text, maxCharsPerLine = 60) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * Generate SVG certificate
   * @param {Object} data - Certificate data
   * @returns {string} SVG string
   */
  generateSVG(data) {
    const { name, date, purpose } = data;
    const certificateId = this.generateCertificateId();
    const formattedDate = this.formatDate(date);
    const purposeLines = this.wrapText(purpose, 50);

    // Calculate dynamic Y positions
    let currentY = 120;
    const lineSpacing = 35;

    const svg = `
      <svg width="${this.width}" height="${this.height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="${this.width}" height="${this.height}" fill="${this.colors.background}"/>
        
        <!-- Outer Border -->
        <rect x="20" y="20" width="${this.width - 40}" height="${this.height - 40}" 
              fill="none" stroke="${this.colors.border}" stroke-width="2"/>
        
        <!-- Inner Border -->
        <rect x="30" y="30" width="${this.width - 60}" height="${this.height - 60}" 
              fill="none" stroke="${this.colors.border}" stroke-width="1"/>
        
        <!-- Title -->
        <text x="${this.width / 2}" y="${currentY}" 
              font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              fill="${this.colors.darkText}" text-anchor="middle">
          CERTIFICATE OF ACHIEVEMENT
        </text>
        
        <!-- Organization (IBM) -->
        <text x="${this.width / 2}" y="${currentY + 80}" 
              font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
              fill="${this.colors.ibmBlue}" text-anchor="middle">
          ${this.organization}
        </text>
        
        <!-- Decorative Line -->
        <line x1="400" y1="${currentY + 120}" x2="800" y2="${currentY + 120}" 
              stroke="${this.colors.ibmBlue}" stroke-width="2"/>
        
        <!-- Recipient Name -->
        <text x="${this.width / 2}" y="${currentY + 180}" 
              font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
              fill="${this.colors.darkText}" text-anchor="middle">
          ${this.escapeXml(name)}
        </text>
        
        <!-- Award Text -->
        <text x="${this.width / 2}" y="${currentY + 240}" 
              font-family="Arial, sans-serif" font-size="20" 
              fill="${this.colors.grayText}" text-anchor="middle">
          This certificate is awarded for
        </text>
        
        <!-- Purpose (with line wrapping) -->
        ${purposeLines.map((line, index) => `
          <text x="${this.width / 2}" y="${currentY + 290 + (index * lineSpacing)}" 
                font-family="Arial, sans-serif" font-size="24" 
                fill="${this.colors.darkText}" text-anchor="middle">
            ${this.escapeXml(line)}
          </text>
        `).join('')}
        
        <!-- Date -->
        <text x="${this.width / 2}" y="${currentY + 290 + (purposeLines.length * lineSpacing) + 50}" 
              font-family="Arial, sans-serif" font-size="18" 
              fill="${this.colors.grayText}" text-anchor="middle">
          Date: ${formattedDate}
        </text>
        
        <!-- Certificate ID -->
        <text x="${this.width / 2}" y="${currentY + 290 + (purposeLines.length * lineSpacing) + 85}" 
              font-family="monospace" font-size="14" 
              fill="${this.colors.grayText}" text-anchor="middle">
          Certificate ID: ${certificateId}
        </text>
        
        <!-- Footer Decorative Line -->
        <line x1="450" y1="${this.height - 85}" x2="750" y2="${this.height - 85}" 
              stroke="${this.colors.border}" stroke-width="1"/>
        
        <!-- Footer Text -->
        <text x="${this.width / 2}" y="${this.height - 60}" 
              font-family="Arial, sans-serif" font-size="16" 
              fill="${this.colors.darkText}" text-anchor="middle">
          ${this.footer}
        </text>
      </svg>
    `;

    return svg;
  }

  /**
   * Escape XML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeXml(text) {
    return text
      .replace(/&/g, String.fromCharCode(38) + 'amp;')
      .replace(/</g, String.fromCharCode(38) + 'lt;')
      .replace(/>/g, String.fromCharCode(38) + 'gt;')
      .replace(/"/g, String.fromCharCode(38) + 'quot;')
      .replace(/'/g, String.fromCharCode(38) + 'apos;');
  }

  /**
   * Generate certificate image
   * @param {Object} data - Certificate data
   * @param {string} data.name - Recipient name
   * @param {string} data.date - Certificate date
   * @param {string} data.purpose - Purpose/achievement
   * @returns {Promise<Buffer>} PNG image buffer
   */
  async generate(data) {
    try {
      // Generate SVG
      const svg = this.generateSVG(data);
      
      // Convert SVG to PNG using Sharp
      const imageBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      return imageBuffer;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate image');
    }
  }
}

module.exports = CertificateGenerator;

// Made with Bob

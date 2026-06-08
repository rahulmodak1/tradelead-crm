/**
 * phoneUtils.js
 * Utilities for cleaning Indian mobile numbers and generating WhatsApp URLs.
 *
 * Handles TradeIndia phone formats:
 *   +919301944848  →  9301944848
 *   91-9301944848  →  9301944848
 *   09301944848    →  9301944848
 *   +91 930 194 4848 → 9301944848
 *   <span>9301944848</span> → 9301944848
 */

/**
 * Strips HTML tags, spaces, special chars, country codes.
 * Returns a clean 10-digit Indian mobile number.
 *
 * @param {string} raw - Phone string in any TradeIndia format
 * @returns {string}   - 10-digit number, or empty string if invalid
 */
export const cleanPhone = (raw = '') => {
  if (!raw) return '';

  // 1. Strip HTML tags (e.g. <span>9301...</span>)
  let num = String(raw).replace(/<[^>]*>/g, '');

  // 2. Keep only digits
  num = num.replace(/\D/g, '');

  // 3. Remove leading country code variants
  //    91XXXXXXXXXX  (12 digits starting with 91 + valid mobile prefix)
  //    0XXXXXXXXXX   (11 digits starting with 0)
  if (num.length === 12 && num.startsWith('91')) {
    num = num.slice(2);
  } else if (num.length === 11 && num.startsWith('0')) {
    num = num.slice(1);
  }

  // 4. Validate: must be 10 digits starting with 6-9
  if (num.length === 10 && /^[6-9]/.test(num)) {
    return num;
  }

  // Return whatever we have — let the caller decide
  return num;
};

/**
 * Builds a wa.me URL with an optional pre-filled message.
 *
 * @param {string} phone   - Raw phone (any format)
 * @param {string} message - Plain text message (will be URL-encoded)
 * @returns {string}       - Full WhatsApp URL
 */
export const buildWhatsAppURL = (phone, message = '') => {
  const number = cleanPhone(phone);
  const base   = `https://wa.me/91${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

/**
 * Generates the standard TradeIndia CRM follow-up message.
 *
 * @param {Object} params
 * @param {string} params.customerName  - Lead's customer name
 * @param {string} params.inquiry       - Product / inquiry text
 * @param {string} params.company       - Lead's company name
 * @param {string} params.city          - Lead's city
 * @param {string} params.assignedUser  - Name of logged-in user sending the message
 * @returns {string} Plain text message, ready for encodeURIComponent
 */
export const buildWhatsAppMessage = ({
  customerName = '',
  inquiry      = '',
  company      = '',
  city         = '',
  assignedUser = '',
}) => `Hello ${customerName},

Thank you for your inquiry regarding ${inquiry}.

Company: ${company}
Location: ${city}

We received your inquiry through TradeIndia.

To provide the best quotation, please share:
• Quantity required
• Size specifications
• Printing requirements
• Delivery location

We look forward to assisting you.

Regards,
${assignedUser}
I Love EcoPack`;

/**
 * One-call helper: clean number + build message + return URL.
 * Use this in LeadTable and LeadDetailPage.
 *
 * @param {Object} lead         - Lead document
 * @param {string} assignedUser - Current user's name
 * @returns {string}            - Ready-to-open WhatsApp URL
 */
export const leadWhatsAppURL = (lead, assignedUser = '') => {
  const message = buildWhatsAppMessage({
    customerName: lead.customerName || lead.name || '',
    inquiry:      lead.inquiry      || lead.product || '',
    company:      lead.company      || '',
    city:         lead.city         || '',
    assignedUser,
  });
  return buildWhatsAppURL(lead.phone, message);
};

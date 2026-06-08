const axios = require("axios");

const TRADEINDIA_URL = "https://www.tradeindia.com/utils/my_inquiry.html";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length <= 10) return digits;
  return digits.slice(-10);
}

function mapInquiryToLead(inquiry) {
  return {
    customerName:
      inquiry.sender_name ||
      inquiry.senderName ||
      inquiry.name ||
      inquiry.customerName ||
      "Unknown",
    phone:
      inquiry.sender_mobile ||
      inquiry.senderMobile ||
      inquiry.mobile ||
      inquiry.phone ||
      "",
    email: inquiry.sender_email || inquiry.senderEmail || inquiry.email || "",
    company: inquiry.sender_co || inquiry.senderCo || inquiry.company || "",
    city: inquiry.sender_city || inquiry.senderCity || inquiry.city || "",
    product:
      inquiry.product_name ||
      inquiry.productName ||
      inquiry.product ||
      "",
    inquiry:
      inquiry.message ||
      inquiry.subject ||
      inquiry.inquiry ||
      inquiry.description ||
      "",
    status: "New",
    source: "TradeIndia",
    notes: inquiry.rfi_id
      ? `TradeIndia inquiry ID: ${inquiry.rfi_id}`
      : "",
  };
}

function extractInquiries(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const nestedKeys = [
    "data",
    "inquiries",
    "inquiry",
    "result",
    "leads",
    "inquiry_list",
    "inquiryList",
    "records",
  ];

  for (const key of nestedKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
}

async function fetchTradeIndiaLeadsFromAPI() {
  const userid = process.env.TRADEINDIA_USER_ID;
  const profile_id = process.env.TRADEINDIA_PROFILE_ID;
  const key = process.env.TRADEINDIA_API_KEY;

  if (!userid || !profile_id || !key) {
    throw new Error(
      "TradeIndia API credentials missing. Set TRADEINDIA_USER_ID, TRADEINDIA_PROFILE_ID, and TRADEINDIA_API_KEY in .env"
    );
  }

 const toDate = new Date();
const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const response = await axios.get(TRADEINDIA_URL, {
    params: {
      userid,
      profile_id,
      key,
      from_date: formatDate(fromDate),
      to_date: formatDate(toDate),
      limit: 100,
      page_no: 1,
    },
    timeout: 30000,
  });

  const { data } = response;

  if (typeof data === "string") {
    if (/sorry|maintenance|error/i.test(data)) {
      throw new Error(
        "TradeIndia API is temporarily unavailable. Please try again later."
      );
    }
    throw new Error(data);
  }

  const inquiries = extractInquiries(data);

  return inquiries
    .map(mapInquiryToLead)
    .filter((lead) => normalizePhone(lead.phone).length >= 10);
    
    console.log("FROM:", formatDate(fromDate));
console.log("TO:", formatDate(toDate));
}

module.exports = {
  fetchTradeIndiaLeadsFromAPI,
  normalizePhone,
  mapInquiryToLead,
};

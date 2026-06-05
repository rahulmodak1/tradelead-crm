const mongoose = require("mongoose");
const Quotation = require("../Models/Quotation");
const Lead = require("../Models/Lead");
const User = require("../Models/User");

async function seedQuotations() {
  try {
    console.log("Seeding quotations...");

    // Get admin user and sample leads
    const adminUser = await User.findOne({ role: "Admin" });
    if (!adminUser) {
      console.log("No admin user found. Skipping quotation seed.");
      return;
    }

    // Get sample leads
    const leads = await Lead.find().limit(5);
    if (leads.length === 0) {
      console.log("No leads found. Create some leads first.");
      return;
    }

    // Check if quotations already exist
    const existingCount = await Quotation.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Quotations already seeded (${existingCount} records)`);
      return;
    }

    const PRODUCT_CATEGORIES = [
      "Paper Bags",
      "Shipping Bags",
      "Ecommerce Packaging",
      "Jute Bags",
      "Cotton Bags",
      "Diaries",
      "MDF Products",
      "Fridge Magnets",
      "Wall Hangings",
      "Custom Product",
    ];

    const quotations = [
      {
        lead: leads[0]._id,
        customer: {
          name: leads[0].customerName,
          companyName: leads[0].companyName,
          phone: leads[0].phone,
          email: leads[0].email,
          city: leads[0].city,
        },
        title: "Q1 - Packaging Supplies",
        description: "Q1 quotation for packaging supplies",
        items: [
          {
            productName: "Premium Paper Bags",
            category: "Paper Bags",
            material: "Kraft Paper",
            size: "12x8x16 inches",
            gsmThickness: "120 GSM",
            printType: "2 Color",
            quantity: 1000,
            unitPrice: 15,
            gstPercent: 18,
            discount: 500,
          },
          {
            productName: "Printed Shipping Boxes",
            category: "Shipping Bags",
            material: "Corrugated",
            size: "10x8x6 inches",
            gsmThickness: "3mm",
            printType: "4 Color",
            quantity: 500,
            unitPrice: 25,
            gstPercent: 18,
            discount: 0,
          },
        ],
        deliveryLocation: "Delhi NCR",
        deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sampleRequired: true,
        artmarkAvailable: false,
        remarks: "Delivery by 15th of next month. Please confirm ASAP.",
        currency: "INR",
        status: "Draft",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
      },
      {
        lead: leads[1]._id,
        customer: {
          name: leads[1].customerName,
          companyName: leads[1].companyName,
          phone: leads[1].phone,
          email: leads[1].email,
          city: leads[1].city,
        },
        title: "Custom Jute Bags Quotation",
        description: "Quotation for eco-friendly jute bags",
        items: [
          {
            productName: "Natural Jute Shopping Bags",
            category: "Jute Bags",
            material: "100% Jute",
            size: "14x10 inches",
            gsmThickness: "500 GSM",
            printType: "1 Color",
            quantity: 2000,
            unitPrice: 20,
            gstPercent: 5,
            discount: 2000,
          },
        ],
        deliveryLocation: "Bangalore",
        deliveryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        sampleRequired: true,
        artworkAvailable: true,
        remarks: "Eco-friendly packaging. Bulk order discount applicable.",
        currency: "INR",
        status: "Sent",
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
      },
      {
        lead: leads[2]._id,
        customer: {
          name: leads[2].customerName,
          companyName: leads[2].companyName,
          phone: leads[2].phone,
          email: leads[2].email,
          city: leads[2].city,
        },
        title: "Printed Diaries & Notebooks",
        description: "Corporate diaries for 2025",
        items: [
          {
            productName: "Customized Diaries (A5)",
            category: "Diaries",
            material: "Art Paper Cover",
            size: "5.8x8.3 inches",
            gsmThickness: "300 GSM Cover",
            printType: "Full Color",
            quantity: 500,
            unitPrice: 80,
            gstPercent: 18,
            discount: 0,
          },
          {
            productName: "Branded Sticky Notes Pad",
            category: "Custom Product",
            material: "Paper",
            size: "3x3 inches",
            gsmThickness: "80 GSM",
            printType: "1 Color",
            quantity: 5000,
            unitPrice: 5,
            gstPercent: 18,
            discount: 5000,
          },
        ],
        deliveryLocation: "Mumbai",
        deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        sampleRequired: true,
        artworkAvailable: false,
        remarks: "Require artwork approval before production",
        currency: "INR",
        status: "Negotiation",
        validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
      },
      {
        lead: leads[3]._id,
        customer: {
          name: leads[3].customerName,
          companyName: leads[3].companyName,
          phone: leads[3].phone,
          email: leads[3].email,
          city: leads[3].city,
        },
        title: "MDF & Fridge Magnets Order",
        description: "Promotional items for Q2",
        items: [
          {
            productName: "Wooden MDF Coasters",
            category: "MDF Products",
            material: "MDF Wood",
            size: "4x4 inches",
            gsmThickness: "5mm",
            printType: "Digital Print",
            quantity: 1000,
            unitPrice: 12,
            gstPercent: 18,
            discount: 0,
          },
        ],
        deliveryLocation: "Pune",
        deliveryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        sampleRequired: false,
        artworkAvailable: true,
        remarks: "Ready design, no changes needed",
        currency: "INR",
        status: "Approved",
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
      },
    ];

    const created = await Quotation.insertMany(quotations);
    console.log(`✅ Created ${created.length} sample quotations`);
  } catch (error) {
    console.error("❌ Error seeding quotations:", error.message);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      return seedQuotations();
    })
    .then(() => {
      console.log("Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

module.exports = { seedQuotations };

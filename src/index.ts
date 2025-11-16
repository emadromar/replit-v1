// functions/src/index.ts

/**
 * Firebase Cloud Functions
 * All functions use the V2 SDK for Node 20/22.
 * TypeScript version with proper typing
 */

// V2 Imports
import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated, Change, FirestoreEvent } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, QueryDocumentSnapshot, DocumentSnapshot } from "firebase-admin/firestore";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Set global options (e.g., region)
setGlobalOptions({ region: "us-central1" });

// Constants
const MIN_DESCRIPTION_LENGTH = 100;
const ALERT_COOLDOWN_MINUTES = 60;

// --- Interfaces ---
interface StoreData {
  name: string;
  planId: 'free' | 'basic' | 'pro';
  backInStockEnabled?: boolean;
  customPath?: string;
  name_slug?: string;
}

interface ProductData {
  id?: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  reviews?: any[];
}

interface SubscriptionData {
  email: string;
}

interface AlertMetadata {
  timestamp: FirebaseFirestore.Timestamp;
}

interface EmailNotificationRequest {
  to: string;
  subject: string;
  htmlBody: string;
}

interface InstagramCaptionsRequest {
  productName: string;
  storeName?: string;
}

interface AnalyzeProductRequest {
  product: ProductData;
  planId: 'free' | 'basic' | 'pro';
  store?: any;
}

interface GetStoreEventsRequest {
  planId: 'free' | 'basic' | 'pro';
  storeName?: string;
}

interface ProductIssue {
  id: string;
  text: string;
  fix: string;
  fixLink: string;
}

interface StoreEvent {
  id: string;
  type: 'VIEW' | 'ADD_TO_CART' | 'PURCHASE';
  message: string;
  location: string;
  productName: string;
  timestamp: string;
}

// --- Helper Function: Initialize Mail Transport ---
const initializeMailTransport = () => {
  const mailConfig = process.env.MAIL_USER ? {
    host: process.env.MAIL_HOST || 'smtp.zoho.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  } : null;

  if (!mailConfig) {
    logger.error("Mail configuration secrets are missing.");
    return null;
  }
  return nodemailer.createTransport(mailConfig);
};

// --- Helper Function: Validate Email ---
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// --- Function 1: sendEmailNotification ---
export const sendEmailNotification = onCall({
  secrets: ["MAIL_USER", "MAIL_PASS", "MAIL_HOST"],
}, async (request: CallableRequest<EmailNotificationRequest>) => {
  
  if (!request.auth) {
    logger.error("Authentication failed: User was not authenticated.");
    throw new HttpsError('unauthenticated', 
      'The function must be called by an authenticated user.'
    );
  }

  const mailTransport = initializeMailTransport();
  if (!mailTransport) {
    throw new HttpsError('internal', 'Mail secrets not loaded.');
  }

  const { to, subject, htmlBody } = request.data;

  if (!to || !subject || !htmlBody) {
    logger.error("Invalid arguments:", request.data);
    throw new HttpsError('invalid-argument', 
      'The function requires "to", "subject", and "htmlBody" fields.'
    );
  }

  if (!isValidEmail(to)) {
    logger.error("Invalid email format:", to);
    throw new HttpsError('invalid-argument', 'Invalid email format.');
  }

  if (htmlBody.length > 100000) {
    throw new HttpsError('invalid-argument', 'HTML body too large (max 100KB).');
  }
  
  const mailOptions = {
    from: 'WebJor Platform <admin@webjor.live>',
    to: to,
    subject: subject,
    html: htmlBody, 
  };

  try {
    await mailTransport.sendMail(mailOptions);
    logger.info(`Email successfully sent to: ${to}`);
    return { success: true, message: 'Email sent successfully.' };
  } catch (error: any) {
    logger.error('Error sending email:', error);
    throw new HttpsError('internal', 
      'Failed to send email via external service.', 
      error.toString()
    );
  }
});

// --- Function 2: onProductUpdate ---
export const onProductUpdate = onDocumentUpdated({
  document: "stores/{storeId}/products/{productId}",
  secrets: ["MAIL_USER", "MAIL_PASS", "MAIL_HOST"],
}, async (event: FirestoreEvent<Change<DocumentSnapshot> | undefined, { storeId: string; productId: string }>) => {
  try {
    if (!event.data) {
      logger.warn("No data in event");
      return;
    }

    const dataBefore = event.data.before.data() as ProductData | undefined;
    const dataAfter = event.data.after.data() as ProductData | undefined;

    if (!dataBefore || !dataAfter) {
      logger.warn("Missing product data in event");
      return;
    }

    // Only proceed if stock changed from 0 to > 0 (back in stock)
    if (dataBefore.stock > 0 || dataAfter.stock <= 0) {
      logger.info(`Stock for ${dataAfter.name} not eligible for alert.`);
      return;
    }

    logger.log(`Stock alert! Product ${dataAfter.name} is back in stock.`);

    const storeId = event.params.storeId;
    const productId = event.params.productId;

    const storeDoc = await db.collection("stores").doc(storeId).get();
    const storeData = storeDoc.data() as StoreData | undefined;
    
    if (!storeData || !storeData.backInStockEnabled) {
      logger.warn(`Store ${storeData?.name || storeId} does not have back-in-stock alerts enabled.`);
      return;
    }

    // Check alert cooldown
    const alertMetadataRef = db.collection('stores').doc(storeId)
      .collection('products').doc(productId)
      .collection('metadata').doc('lastAlert');

    const alertDoc = await alertMetadataRef.get();
    const alertData = alertDoc.data() as AlertMetadata | undefined;
    const lastAlert = alertData?.timestamp?.toDate();

    if (lastAlert && (Date.now() - lastAlert.getTime()) < ALERT_COOLDOWN_MINUTES * 60000) {
      logger.info(`Alert cooldown active for ${dataAfter.name}, skipping`);
      return;
    }

    const subsRef = db.collection("stores")
                      .doc(storeId)
                      .collection("products")
                      .doc(productId)
                      .collection("subscriptions");
                      
    const subsSnapshot = await subsRef.get();
    
    if (subsSnapshot.empty) {
      logger.log("No subscribers found for this product.");
      return;
    }

    const mailTransport = initializeMailTransport();
    if (!mailTransport) {
      logger.error("Mail configuration secrets are missing for onProductUpdate.");
      return;
    }

    const emailPromises: Promise<void>[] = [];
    const batch = db.batch();

    subsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const sub = doc.data() as SubscriptionData;
      const email = sub.email;

      if (!isValidEmail(email)) {
        logger.warn(`Invalid email in subscription: ${email}`);
        batch.delete(doc.ref);
        return;
      }

      logger.log(`Queueing back-in-stock email for ${email}`);
      
      const subject = `It's Back! ${dataAfter.name} is back in stock!`;
      const storeUrlPath = storeData.customPath || storeData.name_slug || storeId;
      const storeUrl = `https://webjor-b29c9.web.app/${storeUrlPath}`;
      const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
  <h1 style="color: #4f46e5;">Good News!</h1>
  <p>Hi there,</p>
  <p>The product you wanted, <strong>${dataAfter.name}</strong>, is now back in stock at <strong>${storeData.name}</strong>!</p>
  <p>It's available for <strong>JOD ${dataAfter.price.toFixed(2)}</strong>. Get it before it's gone again!</p>
  <a 
    href="${storeUrl}" 
    style="display: inline-block; padding: 12px 20px; margin-top: 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
  >
    Go to Store
  </a>
</div>
`;
      
      const mailOptions = {
        from: 'WebJor Platform <admin@webjor.live>',
        to: email,
        subject: subject,
        html: htmlBody,
      };

      const emailPromise = mailTransport.sendMail(mailOptions)
        .then(() => {
          logger.log(`Successfully queued email to ${email}`);
        })
        .catch((err: any) => {
          logger.error(`Failed to send email to ${email}:`, err.message);
        });

      emailPromises.push(emailPromise);
      batch.delete(doc.ref);
    });

    await Promise.all(emailPromises);
    await batch.commit();

    await alertMetadataRef.set({ timestamp: new Date() }, { merge: true });

    logger.log(`Successfully sent ${emailPromises.length} stock alerts and cleared subscriptions.`);
  } catch (error: unknown) {
    logger.error('Error in onProductUpdate:', error);
  }
});


// --- Function 3: generateInstagramCaptions ---
export const generateInstagramCaptions = onCall({
  secrets: ["GEMINI_KEY"], 
}, async (request: CallableRequest<InstagramCaptionsRequest>) => {
  
  if (!request.auth) {
    logger.error("Authentication failed: User was not authenticated.");
    throw new HttpsError('unauthenticated', 
      'You must be logged in to use this feature.'
    );
  }

  const GEMINI_API_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_API_KEY) {
    logger.error("Gemini API Key is not set in secrets.");
    throw new HttpsError('internal', 'AI service is not configured.');
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const productName = request.data.productName;
  const storeName = request.data.storeName || "our store";

  if (!productName) {
    throw new HttpsError(
      "invalid-argument",
      "Product name is required."
    );
  }

  const sanitizedProduct = productName.substring(0, 200);
  const sanitizedStore = storeName.substring(0, 100);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const prompt = `
    You are an expert social media marketer for a small business in Jordan.
    Your tone is exciting, friendly, and persuasive.
    Your task is to generate 3 short, catchy Instagram captions for a product.

    RULES:
    - Each caption must be bilingual (English and Arabic).
    - Each caption must include 2-3 relevant hashtags for Jordan (like #Amman, #Jordan, #ShopLocalJO).
    - Each caption must mention the store name: "${sanitizedStore}"
    - The product is: "${sanitizedProduct}"
    - You MUST return ONLY a valid JSON array of strings, like ["caption 1", "caption 2", "caption 3"].
  `;

  try {
    const result = await model.generateContent(prompt); 
    const response = await result.response;
    
    const jsonText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const captions = JSON.parse(jsonText) as string[];
    
    if (!Array.isArray(captions) || captions.length === 0) {
      throw new Error("AI did not return a valid array of captions");
    }

    logger.info(`Generated ${captions.length} captions for ${productName}`);
    return { captions };

  } catch (error: any) {
    logger.error("AI Generation Error:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate AI captions. Please try again."
    );
  }
});


// --- Function 4: analyzeProduct ---
export const analyzeProduct = onCall(
  { secrets: ["GEMINI_KEY"] },
  async (request: CallableRequest<AnalyzeProductRequest>) => {
    
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in.');
    }

    const { product, planId } = request.data;
    
    if (!product) {
      throw new HttpsError("invalid-argument", "No product data provided.");
    }

    const issues: ProductIssue[] = [];

    // Description Check
    const descLength = product.description ? product.description.length : 0;
    if (descLength === 0) {
      issues.push({ 
        id: 'desc_empty', 
        text: 'Your product has no description. Customers need details to feel confident.',
        fix: 'Write a description that answers questions and explains the benefits.',
        fixLink: `/dashboard/products?edit=${product.id}`
      });
    } else if (descLength < MIN_DESCRIPTION_LENGTH) {
      issues.push({ 
        id: 'desc_short', 
        text: 'Your description is very short. This can feel unprofessional and miss key sales points.',
        fix: 'Expand your description. What does it feel like? Who is it for?',
        fixLink: `/dashboard/products?edit=${product.id}`
      });
    }

    // Image Check
    if (!product.imageUrl) {
      issues.push({ 
        id: 'no_image', 
        text: "You have no product image. This is the #1 reason for 'no sales'.",
        fix: 'Upload a high-quality main product image immediately.',
        fixLink: `/dashboard/products?edit=${product.id}`
      });
    }

    // Price Check
    if (!product.price || product.price <= 0) {
      issues.push({ 
        id: 'no_price', 
        text: 'Your product has no price. Customers cannot buy it.',
        fix: 'Set a price for this product.',
        fixLink: `/dashboard/products?edit=${product.id}`
      });
    }

    // Psychological & Trust Signal Checks (GATED)
    if (planId === 'free') {
      issues.push({ 
        id: 'ncl_locked', 
        text: "Sales Leak: No 'Social Proof' is active. New visitors don't trust your store.",
        fix: "Upgrade to Basic to show live popups like 'Someone in Amman bought this' to build instant trust.",
        fixLink: `/dashboard/marketing?tab=signals`
      });
      issues.push({ 
        id: 'reviews_locked', 
        text: "Sales Leak: No 'Customer Reviews'. 90% of shoppers read reviews before buying.",
        fix: "Upgrade to Pro to unlock Customer Reviews and let your customers sell for you.",
        fixLink: `/dashboard/marketing?tab=trust`
      });
    }
    
    if (planId === 'basic') {
      issues.push({ 
        id: 'urgency_locked', 
        text: "Missed Opportunity: No 'Urgency' is active. Customers have no reason to 'buy now'.",
        fix: "Upgrade to Pro to show 'Only 3 left!' and 'Selling Fast' badges to create urgency.",
        fixLink: `/dashboard/marketing?tab=urgency`
      });
    }

    logger.info(`Analyzed product ${product.id}: found ${issues.length} issues`);
    return { issues };
  }
);


// --- Function 5: generateProductDescription ---
export const generateProductDescription = onCall({
  secrets: ["GEMINI_KEY"],
}, async (request: CallableRequest<{ productName: string }>) => {
  
  if (!request.auth) {
    logger.error("Authentication failed: User was not authenticated.");
    throw new HttpsError('unauthenticated', 
      'You must be logged in to use this feature.'
    );
  }

  const GEMINI_API_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_API_KEY) {
    logger.error("Gemini API Key is not set in secrets.");
    throw new HttpsError('internal', 'AI service is not configured.');
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const productName = request.data.productName;

  if (!productName) {
    throw new HttpsError(
      "invalid-argument",
      "Product name is required."
    );
  }

  const sanitizedProduct = productName.substring(0, 200);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: {
      temperature: 0.7,
    },
  });

  const prompt = `
    You are an expert product copywriter for an e-commerce store in Jordan.
    Your tone is professional, persuasive, and customer-focused.
    Your task is to write a compelling product description.

    RULES:
    - The description should be 2-3 paragraphs long.
    - Highlight the key features and benefits.
    - Use persuasive language that encourages purchase.
    - Make it suitable for a Jordanian audience.
    - The product is: "${sanitizedProduct}"
    - Return ONLY the description text, no JSON or markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt); 
    const response = await result.response;
    const description = response.text().trim();
    
    if (!description || description.length < 50) {
      throw new Error("AI did not return a valid description");
    }

    logger.info(`Generated description for ${productName}`);
    return { description };

  } catch (error: any) {
    logger.error("AI Generation Error:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate AI description. Please try again."
    );
  }
});


// --- Function 6: generateBrandColor ---
export const generateBrandColor = onCall({
  secrets: ["GEMINI_KEY"],
}, async (request: CallableRequest<{ storeName: string }>) => {
  
  if (!request.auth) {
    logger.error("Authentication failed: User was not authenticated.");
    throw new HttpsError('unauthenticated', 
      'You must be logged in to use this feature.'
    );
  }

  const GEMINI_API_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_API_KEY) {
    logger.error("Gemini API Key is not set in secrets.");
    throw new HttpsError('internal', 'AI service is not configured.');
  }
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const storeName = request.data.storeName;

  if (!storeName) {
    throw new HttpsError(
      "invalid-argument",
      "Store name is required."
    );
  }

  const sanitizedStore = storeName.substring(0, 100);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
    },
  });

  const prompt = `
    You are a professional brand designer.
    Based on the store name "${sanitizedStore}", suggest a professional brand color palette.
    
    RULES:
    - Return a primary color that fits the brand personality.
    - The color should be in HEX format (e.g., #4f46e5).
    - Consider the psychology of colors and what they convey.
    - Return ONLY a valid JSON object with a "color" field.
    
    Example: {"color": "#4f46e5"}
  `;

  try {
    const result = await model.generateContent(prompt); 
    const response = await result.response;
    
    const jsonText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const colorData = JSON.parse(jsonText) as { color: string };
    
    if (!colorData.color || !colorData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error("AI did not return a valid hex color");
    }

    logger.info(`Generated brand color for ${storeName}: ${colorData.color}`);
    return { color: colorData.color };

  } catch (error: any) {
    logger.error("AI Generation Error:", error);
    throw new HttpsError(
      "internal",
      "Failed to generate brand color. Please try again."
    );
  }
});


// --- Function 7: getStoreEvents ---
const simulatedLocations = ["Amman", "Irbid", "Zarqa", "Aqaba", "Salt"];
const simulatedProducts = ["a Classic Perfume", "the new Handbag", "a Silk Scarf", "the Premium Skincare Set"];

export const getStoreEvents = onCall(
  {},
  (request: CallableRequest<GetStoreEventsRequest>) => {
    const { planId } = request.data;

    // Free plan gets NO events
    if (planId === 'free') {
      return { events: [], trustedByCount: 0 };
    }

    // Basic & Pro get simulated events
    const events: StoreEvent[] = [];
    const eventCount = planId === 'pro' ? 15 : 7;

    // Helper to generate random timestamp
    const minutesAgo = (min: number, max: number): Date => {
      const randomMinutes = Math.floor(Math.random() * (max - min)) + min;
      return new Date(Date.now() - randomMinutes * 60000);
    };

    for (let i = 0; i < eventCount; i++) {
      const eventType = Math.random() > 0.3 ? 'VIEW' : (Math.random() > 0.5 ? 'ADD_TO_CART' : 'PURCHASE');
      const location = simulatedLocations[Math.floor(Math.random() * simulatedLocations.length)];
      const product = simulatedProducts[Math.floor(Math.random() * simulatedProducts.length)];
      
      let message = `Someone in ${location} is viewing ${product}`;
      if (eventType === 'ADD_TO_CART') {
        message = `Someone in ${location} just added ${product} to their cart.`;
      }
      if (eventType === 'PURCHASE') {
        message = `Sale! ${product} just sold to someone in ${location}.`;
      }
      
      events.push({
        id: `sim_${i}`,
        type: eventType as 'VIEW' | 'ADD_TO_CART' | 'PURCHASE',
        message: message,
        location: location,
        productName: product,
        timestamp: minutesAgo(i * 10, i * 15 + 5).toISOString()
      });
    }

    // Pro plan gets a "Trusted by" badge count
    let trustedByCount = 0;
    if (planId === 'pro') {
      trustedByCount = 50 + Math.floor(Math.random() * 150);
    } else if (planId === 'basic') {
      trustedByCount = 5 + Math.floor(Math.random() * 20);
    }

    return { 
      events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      trustedByCount: trustedByCount
    };
  }
);
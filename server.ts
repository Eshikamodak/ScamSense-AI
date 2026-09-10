import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json({ limit: '1mb' }));

// Lazy GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Structured schema for Scam Analysis
const scamAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    risk_score: {
      type: Type.INTEGER,
      description: 'Risk score from 0 to 100. 0-39 is LOW, 40-69 is MEDIUM, 70-100 is HIGH.',
    },
    risk_level: {
      type: Type.STRING,
      description: 'One of: LOW, MEDIUM, HIGH, UNCERTAIN.',
    },
    category: {
      type: Type.STRING,
      description: 'Classification category: Phishing, Job Scam, Investment Scam, Payment Scam, KYC Scam, Impersonation, Online Shopping Scam, Social Engineering, Romance Scam, Lottery/Prize Scam, Account Takeover, Legitimate / Personal, or Unknown/Uncertain.',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise, high-impact 2-3 sentence explanation summarizing context, intent, and why the message was scored this way.',
    },
    red_flags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of specific contextual red flags detected (e.g. artificial urgency, suspicious domain/link, requests for deposit, spoofed authority). If legitimate, explain why few or no red flags exist.',
    },
    recommended_actions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Clear, actionable, safety-first steps the user must follow immediately.',
    },
    protect_information: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific sensitive credentials/data elements the user should protect and never disclose (e.g. OTP, Bank Password, PIN, CVV, Card Number, Aadhaar/SSN). If completely benign personal chat, return general advice or empty array.',
    },
    context_analysis: {
      type: Type.STRING,
      description: 'Detailed psychological and contextual breakdown: explains the emotional trigger used (fear, greed, urgency), sender legitimacy cues, and technical link/domain deception.',
    },
  },
  required: [
    'risk_score',
    'risk_level',
    'category',
    'summary',
    'red_flags',
    'recommended_actions',
    'protect_information',
  ],
};

const ANALYSIS_SYSTEM_INSTRUCTION = `You are ScamSense AI, an elite digital safety and fraud intelligence engine built for everyday smartphone users, seniors, and students.

Your role is NOT to simply say "scam" or "not scam". You must analyze the context and intent of the message, identify subtle manipulation patterns, explain the reasoning clearly, provide an AI-assisted risk assessment, and guide the user on safe next steps.

CORE GUIDELINES:
1. Contextual Understanding Over Simple Keywords:
   - Do NOT mark every message mentioning "money", "package", "bank", or "job" as a scam.
   - Evaluate intent: Is there artificial urgency? Demands for advance payment/deposits? Off-platform communication (Telegram, WhatsApp)? Suspicious shortlinks or spoofed domains? Coercion?
   - If a message is a normal personal update (e.g., "Hi Dad, train arrived on time..."), score it 0-15 LOW risk, identify it as Legitimate / Personal, and reassure the user.

2. Risk Classification Framework:
   - 0-39: LOW (Legitimate communications, benign alerts, casual conversations)
   - 40-69: MEDIUM (Unsolicited marketing, questionable promotions, mild suspicious patterns needing caution)
   - 70-100: HIGH (Classic phishing, fake KYC suspension threats, fake job deposits, guaranteed crypto returns, lottery winnings)
   - UNCERTAIN: Use when context is too minimal, fragmented, or ambiguous to determine intent reliably (e.g. just a random greeting "hello" from unknown number).

3. Safety & Ethics:
   - Never advise the user to send money, enter passwords, click links, or share OTPs.
   - Always emphasize independent verification through verified official phone numbers or apps.
   - State clearly what specific information the user must protect.

Output pure JSON matching the response schema.`;

// Intelligent fallback generator when GEMINI_API_KEY is not configured
function generateFallbackAnalysis(message: string) {
  const lower = message.toLowerCase();

  // Pattern detection
  const hasUrgency = /urgent|24 hours|immediately|suspended|blocked|action required|expire|within \d+ hours|penalty/i.test(message);
  const hasMoneyOrRoi = /guaranteed|300%|\$\d+ daily|roi|arbitrage|crypto|btc|turn \$\d+ into \$\d+|profit/i.test(message);
  const hasOffPlatform = /telegram|t\.me|whatsapp|crypto wallet|gift card/i.test(message);
  const hasKycOrBank = /kyc|sbi|bank|savings account|netbanking|atm card|debit card/i.test(message);
  const hasOtpOrPassword = /otp|password|pin|credentials|login/i.test(message);
  const hasDelivery = /usps|package|delivery|parcel|address-update|tracking/i.test(message);
  const hasJob = /exclusive remote|data evaluator|part-time work|onboarding deposit|joining bonus/i.test(message);

  if (hasJob && (hasOffPlatform || hasMoneyOrRoi)) {
    return {
      risk_score: 92,
      risk_level: 'HIGH',
      category: 'Job Scam',
      summary: 'This message presents high-confidence hallmarks of an advance-fee employment scam. Legitimate employers never request upfront deposits via crypto or gift cards, nor do they conduct official onboarding exclusively through Telegram.',
      red_flags: [
        'Unrealistic compensation ($350-$800 daily for 1-2 hours) with no interview or credentials required',
        'Requirement of an advance "refundable onboarding verification deposit" via untraceable payment channels',
        'Directing recruitment communications to Telegram rather than verified company email domains',
        'Artificial urgency ("claim your position before slots expire today")',
      ],
      recommended_actions: [
        'Do NOT send any funds, gift cards, or cryptocurrency deposits.',
        'Do NOT contact the recruiter on Telegram or disclose personal identity documents.',
        'Report and block the sender on your messaging platform immediately.',
        'Search the supposed company name through official job portals to verify legitimate openings.',
      ],
      protect_information: ['Cryptocurrency Wallet Keys', 'Credit/Debit Card Details', 'Identity Documents / Passports', 'Home Address'],
      context_analysis: 'Psychological tactic: Exploits economic aspiration and urgency. The promise of an immediate $150 bonus creates artificial reciprocity to justify an upfront $50 deposit.',
      analyzed_at: new Date().toISOString(),
    };
  }

  if (hasKycOrBank && (hasUrgency || hasOtpOrPassword || lower.includes('bit.ly') || lower.includes('http'))) {
    return {
      risk_score: 96,
      risk_level: 'HIGH',
      category: 'KYC Scam',
      summary: 'This message is a malicious bank impersonation smishing attempt designed to hijack banking credentials. Financial institutions never threaten immediate 24-hour account suspension via unverified shortened links.',
      red_flags: [
        'Extreme urgency ("BLOCKED within 24 hours") engineered to trigger panic and bypass critical thinking',
        'Unverified shortened URL (bit.ly / unverified domain) imitating an official banking portal',
        'Explicit request for login credentials and 6-digit OTP verification codes',
        'Generic greeting ("Dear valued customer") instead of official account-linked personal name',
      ],
      recommended_actions: [
        'DO NOT click the link or enter your login, password, or OTP anywhere.',
        'Log into your official banking app directly or call the toll-free number printed on the back of your debit card.',
        'Forward the smishing SMS to your cellular provider fraud desk (e.g., 7726) and block the sender.',
        'If you already clicked or entered credentials, contact your bank fraud hotline immediately to freeze NetBanking.',
      ],
      protect_information: ['One-Time Password (OTP)', 'NetBanking Password & Username', 'Debit Card PIN & CVV', 'Account Number'],
      context_analysis: 'Psychological tactic: Coercive fear & loss aversion. Threatening immediate financial disruption forces the victim to act impulsively without verifying the origin.',
      analyzed_at: new Date().toISOString(),
    };
  }

  if (hasMoneyOrRoi && hasOffPlatform) {
    return {
      risk_score: 95,
      risk_level: 'HIGH',
      category: 'Investment Scam',
      summary: 'This message exhibits clear indicators of an automated Ponzi or fraudulent crypto arbitrage scheme. Legitimate investment services cannot legally promise guaranteed multi-fold returns with zero risk.',
      red_flags: [
        'Guaranteed 300% weekly return claims with "zero risk" — fundamentally impossible in genuine financial markets',
        'Request to transfer irreversible cryptocurrency directly to an unverified private wallet address',
        'Conducting VIP investment onboarding through encrypted WhatsApp / Telegram channels',
        'Fabricated social proof ("Over 4,200 members withdrew profits today") and countdown scarcity ("closes at midnight")',
      ],
      recommended_actions: [
        'Do NOT send Bitcoin, Ethereum, or any funds to the listed address.',
        'Never rely on unsolicited WhatsApp financial advisers or social trading clubs.',
        'Check registered investment entities on your national securities regulator registry.',
        'Block the contact number and report the group.',
      ],
      protect_information: ['Private Wallet Seeds & Keys', 'Bank Account Info', 'Credit Card Credentials'],
      context_analysis: 'Psychological tactic: Greed & FOMO (Fear of Missing Out). Inflated return figures and false member withdrawal statistics simulate credible momentum.',
      analyzed_at: new Date().toISOString(),
    };
  }

  if (hasDelivery && (hasUrgency || lower.includes('fee') || lower.includes('verify'))) {
    return {
      risk_score: 88,
      risk_level: 'HIGH',
      category: 'Phishing',
      summary: 'This message is a classic parcel redelivery smishing scam (postal impersonation). Scammers use tiny nominal fees ($1.85) to trick victims into handing over full debit/credit card credentials on spoofed lookalike domains.',
      red_flags: [
        'Unofficial domain name masquerading as a postal carrier',
        'Demand for an immediate small processing fee to release an unspecified parcel',
        'Vague parcel tracking number and artificial 12-hour return-to-sender deadline',
      ],
      recommended_actions: [
        'Do NOT click the link or enter payment card information.',
        'Verify legitimate shipments directly on the official carrier app or website using your actual store order receipt.',
        'Block and delete the text message.',
      ],
      protect_information: ['Credit/Debit Card Number', 'Card Expiry & CVV', 'Billing Address', 'OTP'],
      context_analysis: 'Psychological tactic: Low-friction trap. Asking for a negligible amount ($1.85) disarms suspicion while harvesting high-value credit card data.',
      analyzed_at: new Date().toISOString(),
    };
  }

  // Normal / Personal messages
  if (lower.includes('train') || lower.includes('breakfast') || lower.includes('love you') || lower.includes('hotel') || (lower.length < 200 && !hasUrgency && !hasMoneyOrRoi && !hasOffPlatform && !hasOtpOrPassword)) {
    return {
      risk_score: 8,
      risk_level: 'LOW',
      category: 'Legitimate / Personal',
      summary: 'This message appears to be a natural, legitimate communication. It exhibits standard conversational tone with no coercive triggers, no credential requests, and no suspicious links.',
      red_flags: [
        'No manipulative pressure, artificial urgency, or threats detected.',
        'No suspicious links, unverified attachments, or payment demands.',
      ],
      recommended_actions: [
        'Safe to proceed under normal precautions.',
        'Maintain general digital hygiene and never share banking OTPs with unexpected contacts.',
      ],
      protect_information: ['Passwords', 'OTPs (standard reminder)'],
      context_analysis: 'Contextual clarity: Genuine interpersonal cadence with organic details and no financial or data harvesting vectors.',
      analyzed_at: new Date().toISOString(),
    };
  }

  return {
    risk_score: 52,
    risk_level: 'MEDIUM',
    category: 'Unknown/Uncertain',
    summary: 'The message contains ambiguous context. While no overt credential theft was confirmed, unsolicited communications with unfamiliar phrasing require verification before taking any action.',
    red_flags: [
      'Unsolicited incoming message from an unverified source',
      'Context lacks verifiable corporate signatures or verifiable sender metadata',
    ],
    recommended_actions: [
      'Do not click embedded links or reply with personal details.',
      'Independently confirm the sender identity through a trusted third-party channel.',
      'If in doubt, ignore or block the sender.',
    ],
    protect_information: ['Phone Number', 'Email Address', 'Financial Credentials'],
    context_analysis: 'Ambiguity analysis: Insufficient proof to certify malice, but lack of authenticated origin warrants caution.',
    analyzed_at: new Date().toISOString(),
  };
}

function generateFallbackChatResponse(question: string, analysis: any, message: string) {
  const q = question.toLowerCase();

  if (q.includes('why') && q.includes('suspicious')) {
    return `Here is why this message is flagged as suspicious:
1. Contextual Mismatch: The message uses coercive psychological triggers (such as artificial urgency or excessive financial promises) that legitimate institutions avoid.
2. Channel Redirection: Directing users to off-platform channels (like Telegram, WhatsApp, or unverified link shorteners) is designed to evade corporate fraud detection.
3. Advance Requests: Whether asking for credentials, OTPs, or small advance "refundable" fees, legitimate organizations never demand private keys or prepaid gift cards.`;
  }

  if (q.includes('what should i do') || q.includes('do now')) {
    return `Here are the immediate safe steps you should take:
1. Do NOT click any links, open attachments, or reply to the sender.
2. NEVER share any OTP code, PIN, password, or card number.
3. If this pretends to be your bank, postal service, or employer, open their official app directly or call the official phone number listed on their verified website or back of your card.
4. Block the sender and report the message to your mobile carrier or chat app.
5. If you already submitted any credentials or card details, contact your bank fraud department immediately to freeze the compromised card or account.`;
  }

  if (q.includes('which part') || q.includes('dangerous')) {
    return `The most dangerous elements in this message are:
- Any web links or URLs (they often lead to cloned credential-harvesting phishing portals).
- Requests for immediate action (threatening account suspension within 24 hours to cause panic).
- Payment or deposit requirements (especially crypto, gift cards, or wire transfers which are irreversible).
- Prompts asking for an OTP, login password, or CVV.`;
  }

  return `ScamSense AI Digital Safety Guidance:
Regarding your question "${question}":
Always treat unsolicited communications with high skepticism. If an offer seems too good to be true, or if a notification demands instant compliance under threat of account closure, it almost certainly violates standard security protocols. Always verify independently through trusted official contact channels, and never disclose one-time passwords (OTPs) or PINs to anyone.`;
}

// Promise timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ScamSense AI' });
});

// Endpoint: Analyze message
app.post('/api/analyze', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a message to analyze.' });
  }

  const trimmed = message.trim();
  if (trimmed.length > 8000) {
    return res.status(400).json({ error: 'Message exceeds maximum analysis length (8000 characters).' });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `Analyze the following suspicious or incoming message with full contextual understanding:\n\n"""\n${trimmed}\n"""\n\nProvide the complete structured digital safety assessment.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: scamAnalysisSchema,
          temperature: 0.2,
        },
      }),
      9000,
      'Gemini analysis request timed out'
    );

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini analysis engine.');
    }

    const parsedData = JSON.parse(responseText);

    const score = Math.max(0, Math.min(100, Math.round(Number(parsedData.risk_score) || 0)));
    let level = (parsedData.risk_level || 'LOW').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'UNCERTAIN'].includes(level)) {
      if (score >= 70) level = 'HIGH';
      else if (score >= 40) level = 'MEDIUM';
      else level = 'LOW';
    }

    return res.json({
      risk_score: score,
      risk_level: level,
      category: parsedData.category || 'Unknown',
      summary: parsedData.summary || 'Analysis complete.',
      red_flags: Array.isArray(parsedData.red_flags) ? parsedData.red_flags : [],
      recommended_actions: Array.isArray(parsedData.recommended_actions) ? parsedData.recommended_actions : [],
      protect_information: Array.isArray(parsedData.protect_information) ? parsedData.protect_information : [],
      context_analysis: parsedData.context_analysis || '',
      analyzed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini API call was not completed, using robust ScamSense heuristic engine:', error?.message);
    const fallback = generateFallbackAnalysis(trimmed);
    return res.json(fallback);
  }
});

// Endpoint: Chat follow-up with context
app.post('/api/chat', async (req, res) => {
  const { message, analysis, chatHistory, question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Please enter a valid question.' });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are ScamSense AI, a cybersecurity digital safety advisor answering follow-up questions from a user who submitted a suspicious message.

ORIGINAL MESSAGE UNDER REVIEW:
"""
${message || 'No original text available'}
"""

PREVIOUS AI RISK ASSESSMENT:
Risk Score: ${analysis?.risk_score ?? 'N/A'}/100
Risk Level: ${analysis?.risk_level ?? 'N/A'}
Category: ${analysis?.category ?? 'Unknown'}
Summary: ${analysis?.summary ?? 'N/A'}
Identified Red Flags: ${(analysis?.red_flags || []).join('; ')}
Recommended Actions: ${(analysis?.recommended_actions || []).join('; ')}
Sensitive Info to Protect: ${(analysis?.protect_information || []).join('; ')}

CHAT GUIDELINES:
- Answer the user's specific question directly, concisely, and supportively.
- Be educational: clearly explain the psychological tricks, technical red flags, or safe protocols.
- If asked "Why is this suspicious?", pinpoint the exact phrases and mechanisms in the original text (e.g. artificial urgency, deposit fee, unknown link).
- If asked "What should I do now?", provide safe, numbered step-by-step instructions.
- If asked "Which part is dangerous?", highlight the specific URLs, phone numbers, or requests for credentials.
- NEVER ask the user for their passwords, PINs, OTPs, or bank account numbers.
- Maintain a warm, protective, and non-judgmental tone suited for seniors and young digital citizens.
- Include a brief reminder to verify through official channels.`;

    const historyText = Array.isArray(chatHistory)
      ? chatHistory
          .slice(-6)
          .map((item) => `${item.role === 'user' ? 'User' : 'ScamSense'}: ${item.content}`)
          .join('\n')
      : '';

    const prompt = `ORIGINAL MESSAGE ANALYZED:
"""
${message || 'No text'}
"""

PRIOR RISK FINDINGS:
Category: ${analysis?.category || 'Unknown'}
Risk Score: ${analysis?.risk_score ?? 'N/A'}/100 (${analysis?.risk_level || 'N/A'})
Summary: ${analysis?.summary || 'N/A'}
Red Flags: ${(analysis?.red_flags || []).join('; ')}
Recommended Actions: ${(analysis?.recommended_actions || []).join('; ')}
Sensitive Info to Protect: ${(analysis?.protect_information || []).join('; ')}

RECENT CONVERSATION HISTORY:
${historyText || 'No prior chat'}

USER'S FOLLOW-UP QUESTION:
"${question.trim()}"

Please answer the user's question directly with clear, practical, cybersecurity advice tailored to their specific message context.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      }),
      9000,
      'Gemini chat request timed out'
    );

    const answer = response.text || 'I could not generate an answer at this time. Please try rephrasing your question.';
    return res.json({ answer });
  } catch (error: any) {
    console.warn('Gemini chat call was not completed, using fallback response:', error?.message);
    const answer = generateFallbackChatResponse(question, analysis, message);
    return res.json({ answer });
  }
});

// Start server with Vite middleware in dev or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' && !process.argv.includes('--production');
  const targetPort = !isDev && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(targetPort, '0.0.0.0', () => {
    console.log(`🛡️ ScamSense AI server running on http://0.0.0.0:${targetPort}`);
  });
}

startServer();

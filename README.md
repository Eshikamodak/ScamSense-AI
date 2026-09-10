# 🛡️ ScamSense AI

### Understand suspicious messages before you act.

ScamSense AI is an AI-powered conversational digital safety assistant that helps users analyze suspicious messages such as **job offers, KYC alerts, payment requests, investment schemes, phishing messages, and impersonation attempts**.

Instead of simply saying "Scam" or "Not a Scam", ScamSense AI uses **Google Gemini** to understand the context and intent of a message, explain the potential red flags, and provide practical safety actions.

---

## 🚨 Problem

Online scams are becoming more convincing and are constantly changing their wording.

Users may receive:

- Fake job offers
- KYC/account suspension messages
- Investment scams
- Payment requests
- Phishing links
- Fake customer-support messages
- Impersonation attempts
- Social-engineering messages

Traditional keyword-based systems can miss new or cleverly worded scams.

Users need more than a warning — they need to understand **why a message is suspicious and what they should do next.**

---

## 💡 Our Solution

**ScamSense AI** acts as a conversational digital safety layer.

Users can paste a suspicious message and receive:

- 📊 **AI-assisted Risk Score** — 0 to 100
- 🚦 **Risk Level** — LOW / MEDIUM / HIGH / UNCERTAIN
- 🏷️ **Scam Category**
- 🧠 **Simple Explanation**
- 🚩 **Red Flags**
- 🛡️ **Recommended Actions**
- 🔐 **Information to Protect**

Users can also continue the conversation and ask questions such as:

> "Why is this suspicious?"

> "What should I do now?"

> "What information should I avoid sharing?"

---

## ✨ Key Features

### 🔍 Context-Aware Scam Analysis
Gemini analyzes the message based on its **context, intent, urgency, requests, and social-engineering patterns**, rather than relying only on keywords.

### 📊 Explainable Risk Assessment
The system provides an AI-assisted risk score along with understandable reasons behind the assessment.

### 🚩 Red Flag Detection
Identifies suspicious patterns such as:

- Urgency and pressure
- Requests for money
- Requests for credentials
- Fake rewards or guaranteed returns
- Account suspension threats
- Suspicious job registration fees
- Impersonation

### 💬 Conversational Follow-Up
Users can ask follow-up questions instead of receiving only a static prediction.

### 🛡️ Actionable Safety Guidance
ScamSense AI suggests practical next steps, such as independently verifying the sender and avoiding sensitive information.

### 🔐 Privacy-Aware Design
The prototype does not use a permanent database to store analyzed messages, and the Gemini API key is kept in environment variables.

---

## 🧠 Why Gemini?

Scam messages are constantly changing.

A rule-based system may look for words such as:

`urgent`, `OTP`, `payment`, `KYC`, `winner`

But scammers can communicate the same intention using completely different wording.

Gemini can help understand:

- Context
- Intent
- Social engineering
- Impersonation
- Urgency
- Financial requests
- Credential requests
- Natural-language variations

This makes the system more flexible for previously unseen message patterns.

---

## 🏗️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Application logic |
| Streamlit | Web interface |
| Google Gemini API | AI-powered message analysis |
| Google GenAI SDK | Gemini API integration |
| python-dotenv | Environment variable management |
| Git & GitHub | Version control |

---

## 📁 Project Structure

```text
ScamSense-AI/
│
├── app.py
├── README.md
├── requirements.txt
├── .env
├── .gitignore
└── venv/

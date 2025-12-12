import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ValidationResult, ValidationStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const validationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ["APPROVED", "DENIED", "NEEDS_REVIEW"],
      description: "The strict validation status based on the Rules Logic.",
    },
    match_confidence: {
      type: Type.STRING,
      description: "Confidence string (e.g. '98%').",
    },
    patient_name: {
      type: Type.STRING,
      description: "Extracted Patient Name or 'Not Found'.",
    },
    insurance_provider: {
      type: Type.STRING,
      description: "Extracted Plan/Provider or 'Not Found'.",
    },
    referral_details: {
      type: Type.STRING,
      description: "Extracted Procedure Name.",
    },
    reasoning_points: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of detailed reasons for the status.",
    },
    action_items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of instructions on how to fix the issue or what to ask the doctor.",
    },
  },
  required: ["status", "match_confidence", "patient_name", "insurance_provider", "referral_details", "reasoning_points", "action_items"],
};

export const validateDocuments = async (
  insuranceBase64: string,
  insuranceMime: string,
  referralBase64: string,
  referralMime: string
): Promise<ValidationResult> => {
  try {
    const prompt = `
ROLE: You are the IAcolabora Intake Auditor. Your goal is to prevent billing denials (glosas) by analyzing insurance cards and medical referrals in real-time.

INPUT:
- Image 1: Insurance Card (OCR extraction required)
- Image 2: Medical Referral (Handwriting recognition required)

--- RULES DATABASE (START) ---

SPECIALTY: CARDIOLOGY + DEMO SCENARIOS
SUPPORTED PROCEDURES FOR DEMO:
1. Transthoracic Echocardiogram
2. Exercise Stress Test
3. 24-hour Holter Monitor
4. Facial Harmonization (Explicitly Excluded)

MODEL OBJECTIVE:
Classify the combination (insurance card image + medical order image) into:
* LOW_GLOSA_RISK
* MEDIUM_GLOSA_RISK
* HIGH_GLOSA_RISK

SCOPE PROTECTION (MANDATORY)
If the requested procedure is not Transthoracic Echocardiogram, Exercise Stress Test, 24-hour Holter or Facial Harmonization, respond exactly: "Rules for this procedure are not available in this demo version." in the reasoning.

GENERAL RULES (apply to all exams)
1. PATIENT IDENTITY: Patient name on the medical order must match the name on the insurance card.
2. CARD ELIGIBILITY: Card number and status must be active. Plan cannot indicate exclusion of complementary exams where applicable.
3. MANDATORY FIELDS IN THE MEDICAL ORDER (all must be visible and readable):
   * Name of the requested exam
   * Patient name
   * Date of the request
   * ICD code coherent with clinical indication
   * Exam description (TUSS or full term)
   * Physician’s name
   * Physician’s MD
   * Physician’s Signature
   * Clinical justification explaining why the exam is necessary
4. WAITING PERIOD:
   Standard rule: 180 days (PAC procedures) for elective exams.

RULES BY EXAM

A) TRANSTHORACIC ECHOCARDIOGRAM
TUSS Code: 40104037
Coverage: Included in ANS Rol for ambulatory and hospital segments. Card cannot indicate exclusion of complementary exams.
Accepted indications: Must include cardiologic symptom or diagnosis such as ICD I34, I35, I36, I37, I42, I50, I25, I10, R00, R01, murmur, dyspnea, chest pain, heart failure, cardiopathy, cardiomyopathy, hypertension, arrhythmia.
Not accepted: "check-up", "routine", "annual".
If missing cardiologic indication, classify as MEDIUM_GLOSA_RISK.

B) EXERCISE STRESS TEST
TUSS Code: 41401174
Coverage: Ambulatory exam with mandatory coverage in ambulatory or reference plans.
Accepted indications: Cardiovascular risk factors or suspicion of CAD such as hypertension, diabetes, CAD, chest pain, preoperative evaluation, arrhythmia, dyslipidemia, or any text indicating CAD risk.
Not accepted: "gym clearance", "fitness clearance", or requests without symptoms, diagnosis, or risk factors. Classify as MEDIUM_GLOSA_RISK.
#Required: Baseline ECG from the past 6 months and surgical risk questionnaire attached.

C) 24-HOUR HOLTER MONITOR
TUSS Codes: 20102011 (analog 2+ channels), 20102020 (digital 3 channels)
Coverage: Requires ambulatory segment. If hospital-only plan, classify as HIGH_GLOSA_RISK.
Accepted indications: Clear arrhythmic symptoms such as ICD I49, Z13.6, or text with palpitations, syncope, tachycardia, bradycardia, documented arrhythmia, conduction disorder.
Not accepted: isolated hypertension, check-up, generic requests without arrhythmic symptoms, missing indication. Classify as MEDIUM_GLOSA_RISK.
#Required: Previous baseline ECG attached.

D) FACIAL HARMONIZATION (SCENARIO 2)
Coverage: EXCLUDED (Aesthetic procedure).
Status: HIGH_GLOSA_RISK.
Teaching Output: "Plan AMIL Blue 300 does not cover aesthetic procedures. Suggest checking if there is a reconstructive indication (e.g., post-trauma) which might be covered with proper documentation."

MODEL PERSONA
You are an extremely rigorous cardiology technical auditor. You only approve when all mandatory elements are explicitly present.
Your mission:
1. Protect revenue by identifying errors.
2. Teach the receptionist how to correct issues (always explain what evidence is missing and how to resolve it).

RISK LOGIC

LOW_GLOSA_RISK:
* All mandatory fields legible
* Matching patient name
* Coverage compatible
* Adequate clinical indication
* No waiting-period issues

MEDIUM_GLOSA_RISK:
* Missing one mandatory item
* Inadequate or overly generic indication
* ICD mismatch
* Insufficient clinical justification

HIGH_GLOSA_RISK:
* Name mismatch between card and order
* Coverage failure (e.g., hospital-only plan requesting Holter)
* Request older than 90 days
* Waiting period not met (180 days)
* Missing two or more mandatory items
* Explicit exclusion of complementary exams on the card
* Inactive card number or status
* Plan indicates exclusion of complementary exams
* Newly activated plan without fulfilled waiting period
* Request for Facial Harmonization (Aesthetic)

INSTRUCTION TO THE MODEL: ALWAYS TEACH HOW TO FIX
For MEDIUM_GLOSA_RISK or HIGH_GLOSA_RISK:
1. Point out exactly what is missing.
2. Tell where to look in the image.
3. Provide an example of how it should appear.

Example:
"Clinical indication is missing. The request must explicitly mention a cardiologic symptom such as 'dyspnea' or 'chest pain'. Ask the physician to include this information."

--- SYSTEM INTERFACE PROTOCOL (MANDATORY) ---

CRITICAL INSTRUCTION:
Do not reply with conversational text. You are an API backend.
You must respond ONLY with a valid JSON object strictly following the schema.

MAPPING LOGIC:
1. LOW_GLOSA_RISK -> status: "APPROVED" (Triggers Green Card)
2. HIGH_GLOSA_RISK -> status: "DENIED" (Triggers Red Card)
3. MEDIUM_GLOSA_RISK -> status: "NEEDS_REVIEW" (Triggers Orange Card)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: insuranceMime,
              data: insuranceBase64,
            },
          },
          {
            inlineData: {
              mimeType: referralMime,
              data: referralBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: validationSchema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const jsonResponse = JSON.parse(text);

    // Map JSON response to internal ValidationResult interface
    return {
      status: jsonResponse.status as ValidationStatus,
      matchConfidence: jsonResponse.match_confidence,
      patientName: jsonResponse.patient_name,
      insuranceProvider: jsonResponse.insurance_provider,
      referralDetails: jsonResponse.referral_details,
      reasoningPoints: jsonResponse.reasoning_points || [],
      actionItems: jsonResponse.action_items || []
    };

  } catch (error) {
    console.error("Gemini Validation Error:", error);
    throw error;
  }
};
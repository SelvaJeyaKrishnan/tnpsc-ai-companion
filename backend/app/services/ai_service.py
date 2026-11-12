import os
from typing import List, Optional
import httpx
from app.schemas import ChatMessage

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Curated syllabus knowledge base for TNPSC doubt resolution
SYLLABUS_KNOWLEDGE_BASE = {
    "tamil": {
        "title": "General Tamil (பொதுத்தமிழ்)",
        "source": "Samacheer Kalvi Tamil (Standards 6 - 10), SCERT Tamil Nadu",
        "keywords": ["பொதுத்தமிழ்", "தமிழ் மொழி", "இலக்கணம்", "இலக்கியம்", "திருக்குறள்", "சந்தி", "வேற்றுமை", "பாரதியார்", "tamil grammar", "tamil literature", "podhuthamizh"],
        "content": (
            "பொதுத்தமிழ் தயாரிப்பு வழிகாட்டி:\n"
            "1. இலக்கணம் (பகுதி-அ): 21 முக்கிய பகுதிகள் - பெயர்ச்சொல், வினைச்சொல், சந்திப்பிழை நீக்குதல், "
            "பிரித்தெழுதுக, வேற்றுமை உருபுகள் (8 வேற்றுமைகள்). வல்லினம் மிகும் இடங்கள் மற்றும் மிகா இடங்களை கட்டாயம் நினைவில் கொள்ளவும்.\n"
            "2. இலக்கியம் (பகுதி-ஆ): திருக்குறள் (அன்புடைமை, பண்புடைமை, செய்ந்நன்றியறிதல், கல்வி, ஒழுக்கமுடைமை), "
            "சிலப்பதிகாரம், மணிமேகலை, கம்பராமாயணம் ஆகிய நூல்களின் ஆசிரியர் குறிப்பு மற்றும் சிறப்பு வரிகள்.\n"
            "3. தமிழ் அறிஞர்கள் (பகுதி-இ): பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர், கவிமணி மற்றும் ஜி.யு.போப், வீரமாமுனிவர் தொண்டுகள்."
        )
    },
    "polity": {
        "title": "Indian Polity & Constitution",
        "source": "Constitution of India, Samacheer Civics & Lakshmikanth",
        "keywords": ["polity", "constitution", "article", "rights", "preamble", "court", "president", "writs"],
        "content": (
            "Indian Polity TNPSC Core Principles:\n"
            "1. Preamble: Sovereign, Socialist, Secular, Democratic, Republic (42nd Amendment 1976 added Socialist, Secular, Integrity).\n"
            "2. Fundamental Rights (Articles 12-35): Part III (Magna Carta of India). Key writs under Art 32 (Supreme Court) and Art 226 (High Court): Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto.\n"
            "3. Directive Principles (Articles 36-51): Borrowed from Ireland. Art 40 (Gram Panchayats), Art 44 (Uniform Civil Code).\n"
            "4. 73rd and 74th Amendments (1992): Panchayati Raj and Municipalities - Eleventh and Twelfth Schedules."
        )
    },
    "aptitude": {
        "title": "Aptitude & Mental Ability",
        "source": "TNPSC PYQ Archive (2018-2025) & RS Aggarwal",
        "keywords": ["aptitude", "maths", "math", "interest", "hcf", "lcm", "ratio", "percentage", "time and work", "simplification"],
        "content": (
            "TNPSC Aptitude (25/25 Scoring Strategy):\n"
            "1. Simple & Compound Interest: SI = (P*N*R)/100. Difference between CI and SI for 2 years = P*(R/100)^2. For 3 years = P*(R/100)^2 * (3 + R/100).\n"
            "2. HCF & LCM: Product of two numbers = HCF * LCM. Co-primes always have HCF = 1.\n"
            "3. Time & Work: If A completes work in X days and B in Y days, together they take (X*Y)/(X+Y) days. Efficiency is inversely proportional to time taken.\n"
            "4. Ratio & Proportion: Direct vs Inverse proportion, duplicate ratio, and mixture rule."
        )
    },
    "unit8_9": {
        "title": "Unit 8 & 9: Tamil Society & Development Administration",
        "source": "Tamil Nadu Textbook Corporation & Archeology Department",
        "keywords": ["unit 8", "unit 9", "keeladi", "heritage", "justice party", "periyar", "anna", "scheme", "dravidian"],
        "content": (
            "Unit 8 & 9 Priority Foundations:\n"
            "1. Keeladi Excavations: Vaigai river civilization contemporary to Gangetic civilization (6th Century BCE), proving high literacy and urban planning in Sangam Age.\n"
            "2. Justice Party (1916): South Indian Liberal Federation (SILF). Milestone achievements: Non-Brahmin Manifesto, Communal G.O (1921), Mid-day Meal Scheme in Chennai (1920), Women suffrage (1921).\n"
            "3. Self-Respect Movement (1925): Founded by Thanthai Periyar. Focus on social equality, abolition of caste hierarchy, and rationalism.\n"
            "4. Tamil Nadu Welfare Schemes: Pudhumai Penn Scheme, CM Breakfast Scheme, Kalaignar Magalir Urimai Thogai, Illam Thedi Kalvi."
        )
    },
    "inm": {
        "title": "Indian National Movement & Tamil Nadu Role",
        "source": "Samacheer Kalvi History (Class 10 & 11) & Bipan Chandra",
        "keywords": ["inm", "freedom", "movement", "congress", "gandhi", "swadeshi", "vedaranyam", "rajaji", "chambaranar", "voc", "bharathi", "kamarajar"],
        "content": (
            "Indian National Movement & Tamil Nadu Pioneers:\n"
            "1. Early Resistance: Pulithevar (1751), Veerapandiya Kattabomman (1799), Maruthu Brothers (1801 Tiruchirappalli Proclamation), Vellore Mutiny (1806).\n"
            "2. Swadeshi Movement: V.O. Chidambaranar launched the Swadeshi Steam Navigation Company (1906) between Tuticorin and Colombo; Subramania Bharati's patriotic poetry; Vanchinathan shot Collector Ashe at Maniyachi (1911).\n"
            "3. Salt Satyagraha in TN: Led by C. Rajagopalachari (Rajaji) from Tiruchirappalli to Vedaranyam in April 1930.\n"
            "4. K. Kamaraj: Significant role in the Quit India Movement (1942), later championed universal primary education in Tamil Nadu."
        )
    },
    "economy": {
        "title": "Indian Economy & Tamil Nadu Economic Growth",
        "source": "NITI Aayog, Reserve Bank of India & Department of Economics TN",
        "keywords": ["economy", "gdp", "rbi", "budget", "tax", "inflation", "niti aayog", "five year plan", "gst", "finance commission"],
        "content": (
            "TNPSC Economics Core Review:\n"
            "1. Planning & NITI Aayog: Planning Commission replaced by NITI Aayog (Jan 1, 2015). Focus on cooperative federalism and SDG index.\n"
            "2. Monetary & Fiscal Policy: RBI controls inflation using Repo, Reverse Repo, CRR, and SLR. 16th Finance Commission headed by Arvind Panagariya.\n"
            "3. GST (Goods & Services Tax): 101st Constitutional Amendment (July 1, 2017) with 5%, 12%, 18%, 28% slabs.\n"
            "4. Tamil Nadu Economy: Second largest state economy in India; leads in factory workforce, automobile manufacturing (Detroit of South Asia), and renewable wind energy."
        )
    },
    "science": {
        "title": "General Science & Technology",
        "source": "ISRO Missions, NCERT & Tamil Nadu SCERT Science",
        "keywords": ["science", "physics", "chemistry", "biology", "space", "isro", "chandrayaan", "aditya", "disease", "vitamin", "vaccine"],
        "content": (
            "TNPSC Science & Space Technology Review:\n"
            "1. Space Achievements: Chandrayaan-3 successfully landed Vikram lander on Moon's south pole (Aug 23, 2023 - National Space Day). Aditya-L1 studying solar corona at Lagrange Point 1.\n"
            "2. ISRO Tamil Nadu Facilities: ISRO Propulsion Complex (IPRC) at Mahendragiri (Tirunelveli) and Second Spaceport at Kulasekarapattinam (Thoothukudi).\n"
            "3. Human Physiology & Health: Deficiency diseases: Vitamin A (Night blindness), Vitamin B1 (Beriberi), Vitamin C (Scurvy), Vitamin D (Rickets). Endocrine glands: Pituitary (Master gland), Pancreas (Insulin/Glucagon).\n"
            "4. Physics & Environment: Laws of Motion, Greenhouse effect (CO2, Methane), and Renewable Energy targets."
        )
    }
}


async def generate_ai_tutor_response(
    message: str,
    subject: str = "General Studies",
    target_exam: str = "Group 4",
    history: Optional[List[ChatMessage]] = None
) -> dict:
    prompt_lower = message.lower()

    # 1. If Gemini API key is configured, call Gemini API
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            sys_instruction = (
                f"You are an expert TNPSC preparation AI mentor for {target_exam} ({subject}). "
                "Provide accurate, syllabus-grounded answers in English and Tamil. "
                "Reference Tamil Nadu State Board (Samacheer Kalvi) facts and previous year questions. "
                "Be encouraging, concise and structured."
            )

            contents = []
            if history:
                for h in history[-4:]:
                    contents.append({
                        "role": "user" if h.role == "user" else "model",
                        "parts": [{"text": h.content}]
                    })
            contents.append({"role": "user", "parts": [{"text": f"{sys_instruction}\n\nStudent Question: {message}"}]})

            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json={"contents": contents})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return {
                            "reply": text,
                            "sources": ["Gemini 1.5 Flash", "Official TNPSC Syllabus", "Samacheer Kalvi"],
                            "suggested_topics": ["General Tamil", "Indian Polity", "Aptitude Tricks"],
                            "model": "gemini-1.5-flash"
                        }
        except Exception as e:
            # Fall back to grounded knowledge base on network or auth errors
            pass

    # 2. Comprehensive Grounded Knowledge Engine Fallback
    matched_entry = None
    for key, data in SYLLABUS_KNOWLEDGE_BASE.items():
        if any(kw in prompt_lower for kw in data["keywords"]):
            matched_entry = data
            break

    if not matched_entry:
        subj_l = subject.lower()
        if "tamil" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["tamil"]
        elif "polity" in subj_l or "constitution" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["polity"]
        elif "aptitude" in subj_l or "math" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["aptitude"]
        elif "history" in subj_l or "national" in subj_l or "inm" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["inm"]
        elif "economy" in subj_l or "economic" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["economy"]
        elif "science" in subj_l:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["science"]
        else:
            matched_entry = SYLLABUS_KNOWLEDGE_BASE["unit8_9"]

    reply_text = (
        f"**TNPSC Concept Clarification ({matched_entry['title']})**\n\n"
        f"{matched_entry['content']}\n\n"
        f"**Preparation Tip for {target_exam}:** Focus on solving previous 5 years' question papers. "
        "Make sure to test your recall using the Focus Timer and Mock Quizzes tab."
    )

    return {
        "reply": reply_text,
        "sources": [matched_entry["source"], "Official TNPSC Group Syllabus"],
        "suggested_topics": [
            "பகுதி-அ: இலக்கணம்",
            "Fundamental Rights & Writs",
            "Simple & Compound Interest",
            "Keeladi Excavations"
        ],
        "model": "tnpsc-grounded-curriculum-engine-v1"
    }

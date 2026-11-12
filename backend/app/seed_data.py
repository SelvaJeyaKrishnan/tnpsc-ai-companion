from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import Achievement, DailyStreak, User

TNPSC_SYLLABUS = {
    "Group 4": {
        "title": "TNPSC Group 4 (VAO, Junior Assistant, Typist)",
        "subjects": [
            {
                "id": "gen_tamil",
                "name": "General Tamil (பொதுத்தமிழ்)",
                "category": "Language",
                "topics": [
                    {"id": "tamil_ilakkanam", "name": "பகுதி-அ: இலக்கணம் (Grammar & Sandhi)", "subtopics": ["பொருத்தமான பொருளைத் தேர்வு செய்தல்", "பிரித்தெழுதுக & சேர்த்தெழுதுக", "சந்திப்பிழை நீக்குதல்", "பெயர்ச்சொல்லின் வகை"]},
                    {"id": "tamil_ilakkiyam", "name": "பகுதி-ஆ: இலக்கியம் (Literature)", "subtopics": ["திருக்குறள் (அன்புடைமை, பண்புடைமை)", "சிலப்பதிகாரம் & மணிமேகலை", "கம்பராமாயணம்", "எட்டுத்தொகை & பத்துப்பாட்டு"]},
                    {"id": "tamil_arignargal", "name": "பகுதி-இ: தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்", "subtopics": ["பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர்", "உ.வே.சாமிநாதையர்", "தேவநேயப் பாவாணர்", "ஜி.யு.போப், வீரமாமுனிவர்"]}
                ]
            },
            {
                "id": "aptitude",
                "name": "Aptitude & Mental Ability",
                "category": "Mathematical Ability",
                "topics": [
                    {"id": "simplification", "name": "Simplification & Percentage", "subtopics": ["BODMAS", "Fractions", "Percentage conversions"]},
                    {"id": "hcf_lcm", "name": "Highest Common Factor & LCM", "subtopics": ["Prime Factorization", "Word problems"]},
                    {"id": "ratio_proportion", "name": "Ratio, Proportion & Variation", "subtopics": ["Direct & Inverse ratios", "Mixture problems"]},
                    {"id": "interest", "name": "Simple & Compound Interest", "subtopics": ["SI formulas", "CI annual and half-yearly", "Difference SI & CI"]},
                    {"id": "time_work", "name": "Time & Work, Pipes & Cisterns", "subtopics": ["Unitary method", "Efficiency & Wages"]},
                    {"id": "logical_reasoning", "name": "Logical Reasoning & Puzzles", "subtopics": ["Dice & Cubes", "Number Series", "Visual Reasoning"]}
                ]
            },
            {
                "id": "polity",
                "name": "Indian Polity & Constitution",
                "category": "General Studies",
                "topics": [
                    {"id": "constitution_basics", "name": "Constitution of India & Preamble", "subtopics": ["Making of Constitution", "Salient features", "Preamble significance"]},
                    {"id": "fundamental_rights", "name": "Fundamental Rights & Duties", "subtopics": ["Articles 12-35", "Writs under Art 32 & 226", "DPSP"]},
                    {"id": "union_state", "name": "Union & State Executive & Legislature", "subtopics": ["President & Governor", "Parliament & State Assembly", "Supreme Court & High Courts"]},
                    {"id": "local_governance", "name": "Panchayati Raj & Local Bodies", "subtopics": ["73rd and 74th Amendments", "E-Governance in TN"]}
                ]
            },
            {
                "id": "history",
                "name": "History, Culture & INM",
                "category": "General Studies",
                "topics": [
                    {"id": "ancient_india", "name": "Indus Valley Civilization & Sangam Age", "subtopics": ["Harappan sites", "Sangam polity & trade"]},
                    {"id": "delhi_mughal", "name": "Delhi Sultanate & Mughals", "subtopics": ["Administration", "Art & Architecture"]},
                    {"id": "marathas_south", "name": "Marathas & South Indian History", "subtopics": ["Cholas, Cheras, Pandyas", "Vijayanagar Empire"]},
                    {"id": "national_movement", "name": "Indian National Movement", "subtopics": ["1857 Revolt", "Early uprisings in TN (Veerapandiya Kattabomman)", "Role of TN in Freedom Struggle"]}
                ]
            },
            {
                "id": "unit_8_9",
                "name": "Unit 8 & 9 (TN Heritage & Development)",
                "category": "Tamil Nadu Specific",
                "topics": [
                    {"id": "tn_heritage", "name": "History of Tamil Society & Archaeology", "subtopics": ["Keeladi, Sivagalai, Porunai", "Thirukkural moral philosophy"]},
                    {"id": "socio_political", "name": "Socio-Political Movements in TN", "subtopics": ["Justice Party", "Self-Respect Movement", "Periyar & Anna"]},
                    {"id": "tn_welfare", "name": "Social Welfare Schemes of Tamil Nadu", "subtopics": ["Pudhumai Penn", "Breakfast Scheme", "Healthcare indices"]}
                ]
            },
            {
                "id": "geography",
                "name": "Geography of India & Tamil Nadu",
                "category": "General Studies",
                "topics": [
                    {"id": "physical_geography", "name": "Physical Features & Monsoon", "subtopics": ["Western & Eastern Ghats", "South-West & North-East Monsoon"]},
                    {"id": "water_resources", "name": "Rivers, Minerals & Forests", "subtopics": ["Cauvery & Vaigai basins", "Sanctuaries in TN"]}
                ]
            },
            {
                "id": "economy",
                "name": "Indian Economy & Current Affairs",
                "category": "General Studies",
                "topics": [
                    {"id": "economy_basics", "name": "Nature of Indian Economy & Five Year Plans", "subtopics": ["NITI Aayog", "Finance Commission", "GST"]},
                    {"id": "current_affairs", "name": "Current Affairs (National & Tamil Nadu)", "subtopics": ["Awards & Honors", "Sports", "Govt initiatives"]}
                ]
            }
        ]
    },
    "Group 2": {
        "title": "TNPSC Group 2 & 2A (Combined Civil Services-II)",
        "subjects": [
            {
                "id": "gen_tamil_g2",
                "name": "General Tamil (Prelims)",
                "category": "Language",
                "topics": [
                    {"id": "tamil_grammar_g2", "name": "இலக்கணம் மற்றும் சொல்லகராதி", "subtopics": ["வேற்றுமை உருபுகள்", "தொகைநிலை & தொகாநிலை"]},
                    {"id": "tamil_lit_g2", "name": "பதினெண்கீழ்க்கணக்கு & காப்பியங்கள்", "subtopics": ["நாலடியார்", "சீவகசிந்தாமணி"]}
                ]
            },
            {
                "id": "unit8_g2",
                "name": "Unit 8: Tamil Society & Thirukkural",
                "category": "Core",
                "topics": [
                    {"id": "thirukkural_secular", "name": "Thirukkural as Secular Literature", "subtopics": ["Universal values", "Socio-economic ideas"]},
                    {"id": "tn_excavations", "name": "Archaeological Discoveries in TN", "subtopics": ["Adichanallur", "Kodumanal", "Keeladi"]}
                ]
            },
            {
                "id": "unit9_g2",
                "name": "Unit 9: Development Administration in TN",
                "category": "Core",
                "topics": [
                    {"id": "human_development", "name": "Human Development Indicators in TN", "subtopics": ["Health, Education, Gender indices"]},
                    {"id": "tn_economic_trends", "name": "Economic Trends & Industrial Corridors", "subtopics": ["SIPCOT, TIDEL, Renewable Energy"]}
                ]
            },
            {
                "id": "polity_g2",
                "name": "Indian Polity & Governance",
                "category": "General Studies",
                "topics": [
                    {"id": "constitutional_framework", "name": "Constitutional Framework & Federalism", "subtopics": ["Centre-State Relations", "Finance & Taxes"]}
                ]
            },
            {
                "id": "aptitude_g2",
                "name": "Aptitude and Mental Ability",
                "category": "Aptitude",
                "topics": [
                    {"id": "adv_aptitude", "name": "Advanced Reasoning & Data Interpretation", "subtopics": ["Tables & Pie charts", "Permutation & Probability"]}
                ]
            }
        ]
    },
    "Group 1": {
        "title": "TNPSC Group 1 (Deputy Collector, DSP, AC)",
        "subjects": [
            {
                "id": "history_culture_g1",
                "name": "History, Heritage, Culture & Social Movements",
                "category": "General Studies",
                "topics": [
                    {"id": "inm_g1", "name": "Indian National Movement & TN Renaissance", "subtopics": ["V.O.C, Subramania Bharathi", "Dravidian Movement"]}
                ]
            },
            {
                "id": "polity_g1",
                "name": "Constitution & Political Dynamics",
                "category": "General Studies",
                "topics": [
                    {"id": "electoral_system", "name": "Elections, Judiciary & Anti-Corruption", "subtopics": ["Lokpal, Lokayukta", "CVC & RTI Act"]}
                ]
            },
            {
                "id": "science_tech_g1",
                "name": "Science & Technology and Environment",
                "category": "General Studies",
                "topics": [
                    {"id": "applied_science", "name": "Space, IT, Defense & Biodiversity", "subtopics": ["ISRO missions", "Climate Change in TN"]}
                ]
            }
        ]
    }
}

DEFAULT_ACHIEVEMENTS = [
    {
        "badge_key": "first_session",
        "title": "First Focus Session",
        "description": "Completed your first recorded focus study session.",
        "icon": "zap"
    },
    {
        "badge_key": "streak_3",
        "title": "3-Day Consistency",
        "description": "Maintained an unbroken study streak for 3 consecutive days.",
        "icon": "flame"
    },
    {
        "badge_key": "streak_7",
        "title": "7-Day Champion",
        "description": "A full week of dedicated daily study and revision.",
        "icon": "award"
    },
    {
        "badge_key": "streak_30",
        "title": "30-Day Master",
        "description": "One entire month of daily discipline and revision.",
        "icon": "crown"
    },
    {
        "badge_key": "hours_10",
        "title": "10 Study Hours",
        "description": "Completed 10 cumulative hours of productive preparation.",
        "icon": "clock"
    },
    {
        "badge_key": "hours_50",
        "title": "50 Study Hours",
        "description": "Halfway to a century: 50 hours of focused revision.",
        "icon": "star"
    },
    {
        "badge_key": "hours_100",
        "title": "100 Study Hours",
        "description": "Elite Century Aspirant: 100 hours of deep study.",
        "icon": "trophy"
    },
    {
        "badge_key": "pomodoro_master",
        "title": "Pomodoro Prodigy",
        "description": "Completed 10 full Pomodoro focus cycles.",
        "icon": "target"
    },
    {
        "badge_key": "group_collaborator",
        "title": "Study Room Pioneer",
        "description": "Participated in a collaborative group study room.",
        "icon": "users"
    }
]


def init_seed_data(db: Session):
    from app.auth import hash_password

    # Check if default user exists
    user = db.query(User).filter(User.username == "karthik").first()
    if not user:
        user = User(
            username="karthik",
            email="karthik.tnpsc@example.com",
            password_hash=hash_password("karthik123"),
            full_name="Karthik Raja",
            target_exam="Group 4",
            timezone="Asia/Kolkata",
            daily_goal_minutes=120
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize streak
        streak = DailyStreak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            last_studied_date=None,
            total_sessions=0,
            total_seconds=0
        )
        db.add(streak)
        db.commit()
    elif not user.password_hash:
        user.password_hash = hash_password("karthik123")
        db.commit()

    return user

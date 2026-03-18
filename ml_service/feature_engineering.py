import re
import numpy as np

def extract_features(subject: str, body: str) -> np.ndarray:
    """
    Extract 8 structural features from email subject + body.
    Returns a numpy array of shape (1, 8)
    """
    text = f"{subject} {body}".lower()

    # Feature 1 — Urgency word count
    urgency_words = ['urgent', 'immediately', 'action required', 'verify now',
                     'expires', 'suspended', 'limited time', 'act now',
                     'within 24 hours', 'within 48 hours', 'deadline']
    urgency_count = sum(1 for w in urgency_words if w in text)

    # Feature 2 — Suspicious link patterns
    link_patterns = ['http://', 'click here', 'verify your account',
                     'confirm your', 'login now', '.tk', '.xyz', '.ml',
                     'bit.ly', 'tinyurl']
    link_count = sum(1 for p in link_patterns if p in text)

    # Feature 3 — Money/prize mentions
    money_words = ['prize', 'winner', 'won', 'lottery', 'reward',
                   'claim', 'free', 'gift card', 'cash', 'rs.',
                   'dollar', 'lakh', 'crore', '$$']
    money_count = sum(1 for w in money_words if w in text)

    # Feature 4 — Personal info requests
    personal_words = ['password', 'bank account', 'credit card', 'ssn',
                      'social security', 'date of birth', 'otp',
                      'pin number', 'full name', 'phone number']
    personal_count = sum(1 for w in personal_words if w in text)

    # Feature 5 — Fear/threat language
    fear_words = ['suspended', 'blocked', 'terminated', 'unauthorized',
                  'compromised', 'hacked', 'illegal', 'violation',
                  'permanently closed', 'legal action']
    fear_count = sum(1 for w in fear_words if w in text)

    # Feature 6 — Text length (normalized)
    text_length = min(len(text) / 1000.0, 1.0)

    # Feature 7 — Exclamation mark count (normalized)
    exclamation_count = min(text.count('!') / 10.0, 1.0)

    # Feature 8 — All caps word count
    caps_count = len(re.findall(r'\b[A-Z]{3,}\b', f"{subject} {body}"))
    caps_normalized = min(caps_count / 5.0, 1.0)

    features = np.array([[
        urgency_count,
        link_count,
        money_count,
        personal_count,
        fear_count,
        text_length,
        exclamation_count,
        caps_normalized
    ]])

    return features


def get_feature_names():
    return [
        'urgency_count',
        'link_count',
        'money_count',
        'personal_info_count',
        'fear_count',
        'text_length',
        'exclamation_count',
        'caps_word_count'
    ]
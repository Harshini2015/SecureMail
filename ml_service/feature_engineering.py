"""
features.py — Geeta (ML + Risk Scoring)
Extracts the 8 structural features as specified in the checklist.
Also provides TF-IDF vectorizer setup.
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


# ─────────────────────────────────────────────
# TF-IDF Vectorizer (fit on training data only)
# ─────────────────────────────────────────────

def get_tfidf_vectorizer():
    """Returns a new (unfitted) TF-IDF vectorizer as per checklist spec."""
    return TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words='english'
    )


# ─────────────────────────────────────────────
# 8 Structural Features (checklist exact spec)
# ─────────────────────────────────────────────

def extract_structural_features(subject: str, body: str) -> np.ndarray:
    """
    Extract exactly 8 structural features from email subject + body.

    Features (checklist order):
      1. url_count         — number of http/https links via regex
      2. has_attachment    — 1 if "attachment" or "see attached" found
      3. subject_length    — character count of subject
      4. all_caps_ratio    — ALL-CAPS words / total words
      5. urgent_word_count — count of urgent trigger words
      6. exclamation_count — number of '!' characters
      7. has_greeting      — 1 if "Dear" or "Hello" found
      8. special_char_ratio— count of !?$ characters / total length

    Returns: np.ndarray of shape (1, 8)
    """

    text = f"{subject} {body}"
    text_lower = text.lower()

    # 1. url_count — regex count of http/https links
    url_count = len(re.findall(r'https?://', text_lower))

    # 2. has_attachment — 1 if attachment words present
    has_attachment = int(
        'attachment' in text_lower or 'see attached' in text_lower
    )

    # 3. subject_length — character count of subject
    subject_length = len(subject)

    # 4. all_caps_ratio — CAPS words / total words
    words = text.split()
    caps_words = [w for w in words if w.isupper() and len(w) > 1]
    all_caps_ratio = len(caps_words) / len(words) if words else 0.0

    # 5. urgent_word_count — checklist exact word list
    urgent_words = [
        'urgent', 'verify', 'suspended', 'click here',
        'act now', 'confirm', 'limited'
    ]
    urgent_word_count = sum(1 for w in urgent_words if w in text_lower)

    # 6. exclamation_count — number of '!' characters
    exclamation_count = text.count('!')

    # 7. has_greeting — 1 if "Dear" or "Hello" present
    has_greeting = int('dear' in text_lower or 'hello' in text_lower)

    # 8. special_char_ratio — count of !?$ / total length
    special_chars = sum(1 for c in text if c in '!?$')
    special_char_ratio = special_chars / len(text) if len(text) > 0 else 0.0

    features = np.array([[
        url_count,
        has_attachment,
        subject_length,
        all_caps_ratio,
        urgent_word_count,
        exclamation_count,
        has_greeting,
        special_char_ratio
    ]])

    return features


def get_feature_names():
    """Returns the names of all 8 structural features."""
    return [
        'url_count',
        'has_attachment',
        'subject_length',
        'all_caps_ratio',
        'urgent_word_count',
        'exclamation_count',
        'has_greeting',
        'special_char_ratio'
    ]
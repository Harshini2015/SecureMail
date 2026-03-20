# Model Evaluation — SecureMail ML Service

## Dataset
- Source: ethancratchley/email-phishing-dataset (Kaggle)
- Total emails : 205052
- Legitimate (0): 198971
- Phishing   (1): 6081
- Phishing % : 3.0%

## Features Used (8 numeric columns from dataset)
1. num_words           — total word count
2. num_unique_words    — vocabulary richness
3. num_stopwords       — stopword count (legit emails have more)
4. num_links           — number of URLs (key phishing indicator)
5. num_unique_domains  — distinct domains linked
6. num_email_addresses — email addresses in body
7. num_spelling_errors — spelling mistakes (phishing has more)
8. num_urgent_keywords — urgent trigger words

## Model Comparison

| Model              | F1 (Phishing) | ROC-AUC |
|--------------------|---------------|---------|
| LogisticRegression | 0.0839        | 0.6692   |
| RandomForest       | 0.2251        | 0.8084   |
| XGBoost            | 0.2481        | 0.8664   |

**Best Model: XGBoost**
F1 = 0.2481 | ROC-AUC = 0.8664

## Why XGBoost over Logistic Regression?
XGBoost captures non-linear interactions between features
(e.g. high num_links AND high num_urgent_keywords together
is a stronger phishing signal than either alone).
LR treats features independently and misses these patterns.
See F1 scores above for evidence.

## Why These 8 Features?
- num_links: phishing emails almost always embed suspicious URLs
- num_urgent_keywords: pressure tactics are a hallmark of phishing
- num_spelling_errors: legitimate organisations proofread carefully
- num_unique_domains: legit emails link to 1-2 known trusted domains
- num_email_addresses: phishing emails spoof/harvest multiple addresses

## False Positive Analysis
A false positive = a legitimate email blocked as phishing.
Impact on user: cannot read safe email — causes frustration.
Minimised via class_weight='balanced' + F1 optimisation.

## Artifacts Generated
- model/phishing_model.joblib
- model/feature_cols.joblib
- docs/eda_plots/class_balance_pie.png
- docs/eda_plots/feature_distributions.png
- docs/eda_plots/correlation_heatmap.png
- docs/confusion_matrix.png
- docs/shap_summary.png

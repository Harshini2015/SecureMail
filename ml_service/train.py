import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from feature_engineering import extract_features

# ── Training data ──
# Format: (subject, body, label)  label: 1 = phishing, 0 = legitimate
TRAINING_DATA = [

    # PHISHING (label = 1)
    ("URGENT: Your bank account suspended", "Dear customer your account has been suspended click here to verify immediately within 24 hours or account permanently closed", 1),
    ("Your Amazon package could not be delivered", "Pay redelivery fee of rs.25 click here to confirm your address http://amzn-redeliver.tk urgent", 1),
    ("You have won Rs.10,00,000 lottery prize", "Congratulations you are winner send your bank account number and processing fee of rs.500 to claim prize within 48 hours", 1),
    ("Action required verify your Google account", "Unauthorized sign in detected from Russia immediately verify your password click http://google-verify.tk credential harvesting", 1),
    ("Your SBI account will be closed", "Suspicious activity detected on your account verify identity immediately or account permanently suspended action required urgent", 1),
    ("FREE iPhone 15 Pro claim before midnight", "You are our 1000000th visitor you won free iPhone claim your prize immediately limited stock expires tonight click now", 1),
    ("PayPal account limited action required", "We have limited your paypal account please verify your information immediately click here to restore access within 24 hours", 1),
    ("Your password expires today reset now", "Your email password will expire tonight to avoid losing access click the link and enter current and new password immediately", 1),
    ("HDFC Bank: Unusual transaction detected", "Rs.45000 debited from your account if not done by you click here immediately to block transaction and verify identity urgent", 1),
    ("Congratulations you have been selected", "You are selected for international lucky draw winner send full name address bank account number processing fee to claim rs.500", 1),
    ("Microsoft account security alert", "Suspicious login attempt detected from unknown device verify your microsoft account immediately or access will be terminated", 1),
    ("Your Netflix subscription will be cancelled", "Payment failed update your billing information immediately click here to avoid service interruption expires in 24 hours", 1),
    ("Income tax refund pending claim now", "Your income tax refund of rs.8500 is pending click the link enter your bank details to receive refund within 2 hours", 1),
    ("Courier delivery failed pay now", "Your courier could not be delivered please pay small customs fee of rs.150 to release package click link urgent", 1),
    ("WhatsApp account will be banned", "Your whatsapp account violates our terms click here to verify your phone number immediately to avoid permanent ban", 1),
    ("Exclusive prize winner notification", "Dear winner you have been selected claim your reward immediately send personal details to collect prize money expires soon", 1),
    ("Account verification required", "Click here now to verify your account credentials enter password and bank details to complete verification urgent action required", 1),
    ("Security breach detected your account", "Unauthorized access detected click immediately to secure your account verify password and personal information within 2 hours", 1),
    ("Final warning account suspended", "This is your final warning your account will be permanently deleted click to verify identity immediately urgent action required", 1),
    ("You won a gift card claim now", "Congratulations you have been randomly selected for a rs.5000 amazon gift card click here to claim before it expires tonight", 1),

    # LEGITIMATE (label = 0)
    ("Team meeting tomorrow at 10am", "Hi just a reminder that we have a team sync tomorrow at 10am in the main conference room please come prepared with updates", 0),
    ("Your pull request was merged", "Your pull request feat add authentication has been successfully merged into main branch great work keep it up", 0),
    ("Are you free this weekend", "Hey a few of us are planning to catch up this Saturday evening let me know if you can make it would be great", 0),
    ("Exam schedule published for December", "The December examination timetable has been published on the student portal please log in to view your personalized schedule", 0),
    ("5 new jobs matching your profile", "Based on your skills here are 5 job openings senior react developer at google backend engineer at microsoft and more view on linkedin", 0),
    ("Interview invitation Software Engineer role", "Congratulations you have been shortlisted for software engineer position please confirm your availability for technical interview next week", 0),
    ("Call me when you are free", "Hi dear just wanted to check in your father and I were thinking about you please call us when you get a chance we miss you", 0),
    ("Notes from today lecture", "Hey sharing my notes from today data structures lecture we covered AVL trees and red black trees assignment is due Friday", 0),
    ("Rent due this Friday", "Just a heads up that rent is due this Friday my share is ready can you transfer your portion to landlord account by Thursday", 0),
    ("Big Billion Days sale tonight", "The biggest sale of the year is here get up to 80 percent off on electronics fashion and more sale starts at midnight set reminders", 0),
    ("Welcome aboard onboarding documents", "Welcome to the company please find your onboarding documents access credentials for internal tools and employee handbook first day Monday 9am", 0),
    ("Your workspace has been updated", "We have rolled out new features to your workspace including improved database views and better mobile performance check changelog for details", 0),
    ("Project deadline reminder", "This is a reminder that the project submission deadline is next Friday please make sure all components are ready for final review", 0),
    ("Monthly newsletter from dev community", "This month in tech new frameworks released community events upcoming conferences and interesting articles from developers around the world", 0),
    ("Your order has been shipped", "Your order number 12345 has been shipped and will arrive in 3 to 5 business days track your package using the order ID on our website", 0),
    ("LinkedIn connection request accepted", "Your connection request has been accepted you are now connected grow your professional network by reaching out and starting a conversation", 0),
    ("Hackathon registration confirmed", "Your registration for the annual hackathon has been confirmed the event starts Saturday at 9am venue details will be shared by Friday", 0),
    ("Study group meeting this Sunday", "Hey everyone study group meeting is confirmed for this Sunday at 3pm at the library bring your notes and we will cover all topics", 0),
    ("GitHub security advisory", "A dependency in your repository has a known vulnerability we recommend updating to the latest version to keep your project secure", 0),
    ("Internship offer letter attached", "We are pleased to offer you an internship position starting next month please review the attached offer letter and confirm your acceptance", 0),
]

def train_model():
    print("Extracting features from training data...")

    X = []
    y = []

    for subject, body, label in TRAINING_DATA:
        features = extract_features(subject, body)
        X.append(features[0])
        y.append(label)

    X = np.array(X)
    y = np.array(y)

    print(f"Training samples: {len(X)}")
    print(f"Phishing: {sum(y)} | Legitimate: {len(y) - sum(y)}")

    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train XGBoost model
    print("\nTraining XGBoost model...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("\n── Evaluation Results ──")
    print(classification_report(y_test, y_pred,
          target_names=['Legitimate', 'Phishing']))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save model
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/phishing_model.joblib')
    print("\n✅ Model saved to model/phishing_model.joblib")

if __name__ == '__main__':
    train_model()
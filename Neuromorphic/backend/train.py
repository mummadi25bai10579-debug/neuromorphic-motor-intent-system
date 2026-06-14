import json
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from preprocessing import load_and_preprocess

# Load dummy data for demonstration (you'll use your real JSON)
with open('src/data/eeg_samples.json', 'r') as f:
    data = json.load(f)

df, features = load_and_preprocess(data)

X = df[features]
y = df['intent']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 7. Train Model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 8. Evaluate
predictions = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, predictions)}")
print(confusion_matrix(y_test, predictions))

# 9. Save Model
joblib.dump(model, 'backend/model.pkl')
print("Model saved to backend/model.pkl")

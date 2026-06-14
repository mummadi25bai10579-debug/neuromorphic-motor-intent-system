from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

# Load pre-trained model
model = joblib.load('backend/model.pkl')

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def predict(data: dict):
    # Prepare features similar to training (this is simplified)
    # In production, use the same preprocessing logic
    df = pd.DataFrame([data])
    # ... apply preprocessing ...
    
    prediction = model.predict(df)
    prob = model.predict_proba(df)
    
    return {
        "motor_intent": bool(prediction[0]),
        "confidence": float(np.max(prob))
    }

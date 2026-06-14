def suggest_therapy(intent, confidence):
    if intent == "Strong Intent" and confidence > 0.8:
        return "Increase resistance training intensity."
    elif intent == "Weak Intent":
        return "Focus on repetitive range of motion exercises."
    else:
        return "Continue passive assistance therapy."

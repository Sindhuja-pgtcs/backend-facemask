import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Import our training logic to allow auto-training if model is missing
from model_train import train_mask_detector

app = FastAPI(title="Face Mask Detection API")

# Enable CORS for all origins as requested
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request schema for prediction
class PredictionRequest(BaseModel):
    features: List[float] # Expecting a list of numerical features representing an image

# Global model variable
model = None

@app.on_event("startup")
def load_model():
    """Load model on startup, or train it if not found."""
    global model
    model_path = "model.pkl"
    
    if not os.path.exists(model_path):
        print(f"{model_path} not found. Triggering automated training...")
        train_mask_detector()
        
    model = joblib.load(model_path)
    print("Model loaded into memory.")

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
async def predict(request: PredictionRequest):
    """
    POST endpoint to predict if a person is wearing a mask based on input features.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        # Reshape features for model prediction
        data = np.array(request.features).reshape(1, -1)
        
        # Get prediction and probabilities
        prediction = int(model.predict(data)[0])
        probabilities = model.predict_proba(data)[0]
        confidence = float(probabilities[prediction])
        
        result = "Wearing Mask" if prediction == 1 else "No Mask"
        
        return {
            "prediction": result,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use environment variable PORT or default to 3000 (standard for this container)
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)

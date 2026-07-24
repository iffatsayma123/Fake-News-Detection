from random import choice, uniform

from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="TruthLens AI Service",
    description="Python AI service for multimodal fake news detection",
    version="1.0.0",
)


class PredictionRequest(BaseModel):
    newsTitle: str
    newsText: str


@app.get("/")
def root():
    return {
        "success": True,
        "message": "TruthLens AI service is running",
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "models_loaded": False,
    }


@app.post("/predict")
def predict_news(request: PredictionRequest):
    prediction = choice(["Real", "Fake"])
    confidence = round(uniform(80, 99), 2)

    return {
        "success": True,
        "prediction": prediction,
        "confidence": confidence,
        "textConfidence": confidence,
        "imageConfidence": 0,
        "titleReceived": request.newsTitle,
    }
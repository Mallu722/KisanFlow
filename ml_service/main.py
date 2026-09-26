from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
import math

app = FastAPI(title="KrishiFlow ML Wait-Time Service", version="1.0")

class WaitTimeRequest(BaseModel):
    centreId: str
    currentQueueDepth: int
    avgProcessingTimeMinutes: float
    historicalProcessingTimes: List[float] = []

class WaitTimeResponse(BaseModel):
    estimatedWaitMinutes: float
    confidence: float
    model_version: str

@app.post("/predict-wait-time", response_model=WaitTimeResponse)
def predict_wait_time(data: WaitTimeRequest):
    """
    Predicts the estimated wait time for a farmer at a specific centre.
    Currently uses a heuristic moving-average model. 
    Ready to be swapped with an ML regression model (e.g. XGBoost) in v2.
    """
    try:
        # Base linear wait time
        base_estimate = data.currentQueueDepth * data.avgProcessingTimeMinutes
        
        # Adjust with historical data if available (simple weighted average mock)
        if data.historicalProcessingTimes and len(data.historicalProcessingTimes) > 0:
            hist_avg = sum(data.historicalProcessingTimes) / len(data.historicalProcessingTimes)
            # Give 70% weight to current avg, 30% to historical avg
            adjusted_processing_time = (0.7 * data.avgProcessingTimeMinutes) + (0.3 * hist_avg)
            estimate = data.currentQueueDepth * adjusted_processing_time
            confidence = 0.85
        else:
            estimate = base_estimate
            confidence = 0.60
            
        # Add a slight non-linear penalty for very long queues (fatigue factor)
        if data.currentQueueDepth > 20:
            estimate = estimate * 1.1

        return WaitTimeResponse(
            estimatedWaitMinutes=round(estimate, 2),
            confidence=confidence,
            model_version="heuristic-v1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

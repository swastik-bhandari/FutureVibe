from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(title="FutureVibe ML Backend")


class PredictRequest(BaseModel):
    user_id: int


@app.get("/")
def health_check():
    return {"message": "FastAPI ML Backend is running.!"}



@app.post("/predict")
def predict(request: PredictRequest):
    user_id = request.user_id

    # Prediction logic

    return {"prediction": "Your prediction result here"}

































































































































if __name__ == "__main__":
    pass


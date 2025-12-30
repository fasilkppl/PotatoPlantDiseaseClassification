from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os

app = FastAPI(
    title="Plant Disease Detector API",
    description="AI-powered potato plant disease detection",
    version="1.0.0"
)

# CORS Configuration - explicitly allow your frontend origins
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:80",
    "http://13.60.195.26",
    "http://13.60.195.26:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Model configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
MODEL_FILE = os.environ.get("MODEL_FILE", "potatoes.h5")
MODEL_PATH = os.path.join(MODELS_DIR, MODEL_FILE)

# Load the pre-trained model
try:
    MODEL = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}")
    MODEL = None

# Define class names for prediction
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

# Expected image size (adjust based on your model's training)
IMAGE_SIZE = 256


@app.get("/")
async def root():
    return {"message": "Plant Disease Detector API", "status": "running"}


@app.get("/ping")
async def ping():
    return "Hello, I am alive"


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "model_path": MODEL_PATH,
        "model_file": MODEL_FILE
    }


def read_file_as_image(data) -> np.ndarray:
    """Read uploaded file as image and preprocess it."""
    image = Image.open(BytesIO(data))
    
    # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Resize to expected input size
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    
    # Convert to numpy array and normalize
    image_array = np.array(image)
    
    # Normalize pixel values to [0, 1] range
    image_array = image_array / 255.0
    
    return image_array


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image.
    
    Args:
        file: Uploaded image file (JPG, PNG, etc.)
    
    Returns:
        JSON with predicted class and confidence score
    """
    if MODEL is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server logs."
        )
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPG, PNG, etc.)"
        )
    
    try:
        # Read and preprocess image
        image = read_file_as_image(await file.read())
        
        # Create batch of size 1
        img_batch = np.expand_dims(image, 0)
        
        # Make prediction
        predictions = MODEL.predict(img_batch)
        
        # Get predicted class and confidence
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(np.max(predictions[0]))
        
        return {
            "class": predicted_class,
            "confidence": confidence
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

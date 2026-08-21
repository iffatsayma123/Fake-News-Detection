import io
import os

import joblib
import numpy as np
import tensorflow as tf
import torch

from fastapi import FastAPI, UploadFile, File, Form
from PIL import Image
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
)


# ============================================================
# 1. FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="TruthLens AI Service",
    description="Multimodal fake news detection using BERT and EfficientNetB0",
    version="2.2.0",
)


# ============================================================
# 2. MODEL PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models"
)

BERT_PATH = os.path.join(
    MODELS_DIR,
    "bert_text_model"
)

EFFICIENTNET_PATH = os.path.join(
    MODELS_DIR,
    "efficientnet_final.keras"
)

FUSION_PATH = os.path.join(
    MODELS_DIR,
    "multimodal_fusion_final.keras"
)

SCALER_PATH = os.path.join(
    MODELS_DIR,
    "multimodal_scaler.pkl"
)


# ============================================================
# 3. DEVICE
# ============================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print("PyTorch device:", device)


# ============================================================
# 4. LOAD BERT
# ============================================================

print("Loading BERT tokenizer...")

bert_tokenizer = AutoTokenizer.from_pretrained(
    BERT_PATH,
    local_files_only=True
)


print("Loading BERT classification model...")

bert_classifier = (
    AutoModelForSequenceClassification
    .from_pretrained(
        BERT_PATH,
        local_files_only=True
    )
)

bert_classifier.to(device)
bert_classifier.eval()


# Get the underlying BERT encoder.
# This produces 768-dimensional text features.

bert_model = bert_classifier.base_model

bert_model.to(device)
bert_model.eval()

print("BERT loaded successfully.")


# ============================================================
# 5. LOAD EFFICIENTNET
# ============================================================

print("Loading EfficientNet model...")

full_image_model = tf.keras.models.load_model(
    EFFICIENTNET_PATH,
    compile=False
)


# Extract the 1280-dimensional image representation
# used during multimodal fusion training.

image_feature_model = tf.keras.Model(
    inputs=full_image_model.input,
    outputs=full_image_model.layers[-2].output
)

print("EfficientNet loaded successfully.")


# ============================================================
# 6. LOAD MULTIMODAL FUSION MODEL
# ============================================================

print("Loading multimodal fusion model...")

fusion_model = tf.keras.models.load_model(
    FUSION_PATH,
    compile=False
)

print("Fusion model loaded successfully.")


# ============================================================
# 7. LOAD STANDARD SCALER
# ============================================================

print("Loading feature scaler...")

scaler = joblib.load(
    SCALER_PATH
)

print("Scaler loaded successfully.")


print("")
print("==========================================")
print("All TruthLens AI models loaded successfully!")
print("==========================================")
print("")


# ============================================================
# 8. TEXT FEATURE EXTRACTION
# ============================================================

def extract_text_features(text: str):

    encoded = bert_tokenizer(
        [text],
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )

    encoded = {
        key: value.to(device)
        for key, value in encoded.items()
    }

    with torch.no_grad():

        outputs = bert_model(
            **encoded
        )

    # CLS representation
    # Shape: (1, 768)

    cls_features = outputs.last_hidden_state[
        :, 0, :
    ]

    return (
        cls_features
        .cpu()
        .numpy()
        .astype(np.float32)
    )


# ============================================================
# 9. IMAGE FEATURE EXTRACTION
# ============================================================

def extract_image_features(image_bytes: bytes):

    image = Image.open(
        io.BytesIO(image_bytes)
    )

    image = image.convert("RGB")

    image = image.resize(
        (224, 224)
    )

    image_array = np.asarray(
        image,
        dtype=np.float32
    )

    # Add batch dimension:
    # (224,224,3) -> (1,224,224,3)

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    image_features = (
        image_feature_model.predict(
            image_array,
            verbose=0
        )
    )

    return image_features.astype(
        np.float32
    )


# ============================================================
# 10. ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "TruthLens AI service is running",
        "version": "2.2.0"
    }


# ============================================================
# 11. HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health_check():

    return {
        "success": True,
        "status": "healthy",
        "models_loaded": True,
        "text_model": "BERT",
        "image_model": "EfficientNetB0",
        "fusion": "Feature Concatenation",
        "device": str(device)
    }


# ============================================================
# 12. MULTIMODAL PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
async def predict_news(
    newsTitle: str = Form(...),
    newsText: str = Form(...),
    image: UploadFile = File(...)
):

    try:

        # ----------------------------------------------------
        # TEXT
        # ----------------------------------------------------

        # IMPORTANT:
        # Our BERT model was trained using Fakeddit clean_title.
        # Therefore, for the current trained model we use
        # the submitted news title as the BERT input.
        #
        # We still receive newsText and save it in MongoDB,
        # but it is not currently used by BERT inference.

        combined_text = newsTitle.strip()

        if not combined_text:

            return {
                "success": False,
                "message": "News title is required."
            }


        text_features = extract_text_features(
            combined_text
        )


        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        image_bytes = await image.read()

        if not image_bytes:

            return {
                "success": False,
                "message": "News image is required."
            }


        image_features = extract_image_features(
            image_bytes
        )


        # ----------------------------------------------------
        # VERIFY FEATURE DIMENSIONS
        # ----------------------------------------------------

        if text_features.shape[1] != 768:

            raise ValueError(
                "Unexpected BERT feature size: "
                f"{text_features.shape}"
            )


        if image_features.shape[1] != 1280:

            raise ValueError(
                "Unexpected EfficientNet feature size: "
                f"{image_features.shape}"
            )


        # ----------------------------------------------------
        # MULTIMODAL FEATURE FUSION
        # ----------------------------------------------------

        fused_features = np.concatenate(
            [
                text_features,
                image_features
            ],
            axis=1
        )


        # Expected:
        # BERT = 768
        # EfficientNet = 1280
        # Total = 2048

        if fused_features.shape[1] != 2048:

            raise ValueError(
                "Unexpected fused feature size: "
                f"{fused_features.shape}"
            )


        # ----------------------------------------------------
        # STANDARDIZATION
        # ----------------------------------------------------

        fused_scaled = scaler.transform(
            fused_features
        )


        # ----------------------------------------------------
        # FINAL MULTIMODAL CLASSIFIER
        # ----------------------------------------------------

        probability = fusion_model.predict(
            fused_scaled,
            verbose=0
        )[0][0]

        probability = float(
            probability
        )


        # ====================================================
        # FAKEDDIT BINARY LABEL MAPPING
        # ====================================================
        #
        # Class 0 = Real / True
        # Class 1 = Fake
        #
        # Sigmoid output = probability of Class 1.
        #
        # probability >= 0.5 -> Fake
        # probability < 0.5  -> Real
        # ====================================================

        if probability >= 0.5:

            predicted_class = 1

            prediction = "Fake"

            confidence = (
                probability * 100
            )

        else:

            predicted_class = 0

            prediction = "Real"

            confidence = (
                (1 - probability) * 100
            )


        # ----------------------------------------------------
        # CLASS PROBABILITIES
        # ----------------------------------------------------

        fake_probability = (
            probability * 100
        )

        real_probability = (
            (1 - probability) * 100
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "success": True,

            "prediction": prediction,

            "predictedClass": predicted_class,

            "confidence": round(
                confidence,
                2
            ),

            "realProbability": round(
                real_probability,
                2
            ),

            "fakeProbability": round(
                fake_probability,
                2
            ),

            "models": {
                "text": "BERT",
                "image": "EfficientNetB0",
                "fusion": "Feature Concatenation"
            }
        }


    except Exception as error:

        print(
            "Prediction error:",
            repr(error)
        )

        return {
            "success": False,
            "message": "Prediction failed",
            "error": str(error)
        }
import io
import os

import numpy as np
import onnxruntime as ort

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
)

from PIL import Image
from transformers import AutoTokenizer


# ============================================================
# 1. FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="TruthLens AI Service",
    description=(
        "Lightweight ONNX multimodal fake news "
        "detection using BERT and EfficientNetB0"
    ),
    version="3.2.0",
)


# ============================================================
# 2. MODEL PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models_onnx"
)


BERT_ONNX_PATH = os.path.join(
    MODELS_DIR,
    "bert_encoder_quantized.onnx"
)

EFFICIENTNET_ONNX_PATH = os.path.join(
    MODELS_DIR,
    "efficientnet_features.onnx"
)

FUSION_ONNX_PATH = os.path.join(
    MODELS_DIR,
    "fusion_model.onnx"
)

SCALER_PATH = os.path.join(
    MODELS_DIR,
    "multimodal_scaler.npz"
)

TOKENIZER_PATH = os.path.join(
    MODELS_DIR,
    "tokenizer"
)


# ============================================================
# 3. ONNX RUNTIME SETTINGS
# ============================================================

providers = [
    "CPUExecutionProvider"
]


session_options = ort.SessionOptions()

# Reduce ONNX Runtime memory usage
session_options.enable_cpu_mem_arena = False

session_options.enable_mem_pattern = False


# Suitable for single-user university demo usage
session_options.intra_op_num_threads = 1

session_options.inter_op_num_threads = 1


# Sequential execution may reduce memory overhead
session_options.execution_mode = (
    ort.ExecutionMode.ORT_SEQUENTIAL
)


# Keep graph optimization enabled
session_options.graph_optimization_level = (
    ort.GraphOptimizationLevel.ORT_ENABLE_ALL
)


# ============================================================
# 4. LOAD TOKENIZER
# ============================================================

print(
    "Loading BERT tokenizer..."
)

tokenizer = AutoTokenizer.from_pretrained(
    TOKENIZER_PATH,
    local_files_only=True
)

print(
    "Tokenizer loaded successfully."
)


# ============================================================
# 5. LOAD QUANTIZED BERT ONNX
# ============================================================

print(
    "Loading quantized BERT ONNX encoder..."
)

bert_session = ort.InferenceSession(
    BERT_ONNX_PATH,
    sess_options=session_options,
    providers=providers
)

print(
    "BERT ONNX encoder loaded successfully."
)


# ============================================================
# 6. LOAD EFFICIENTNET ONNX
# ============================================================

print(
    "Loading EfficientNet ONNX..."
)

image_session = ort.InferenceSession(
    EFFICIENTNET_ONNX_PATH,
    sess_options=session_options,
    providers=providers
)

print(
    "EfficientNet ONNX loaded successfully."
)


# ============================================================
# 7. LOAD FUSION ONNX
# ============================================================

print(
    "Loading fusion ONNX model..."
)

fusion_session = ort.InferenceSession(
    FUSION_ONNX_PATH,
    sess_options=session_options,
    providers=providers
)

print(
    "Fusion ONNX model loaded successfully."
)


# ============================================================
# 8. LOAD LIGHTWEIGHT SCALER
# ============================================================

print(
    "Loading lightweight scaler..."
)

scaler_data = np.load(
    SCALER_PATH
)

scaler_mean = (
    scaler_data["mean"]
    .astype(np.float32)
)

scaler_scale = (
    scaler_data["scale"]
    .astype(np.float32)
)

print(
    "Lightweight scaler loaded successfully."
)


print("")
print(
    "=============================================="
)
print(
    "TruthLens lightweight ONNX models loaded!"
)
print(
    "=============================================="
)
print("")


# ============================================================
# 9. TEXT FEATURE EXTRACTION
# ============================================================

def extract_text_features(
    text: str
):

    encoded = tokenizer(
        text,
        return_tensors="np",
        truncation=True,
        max_length=128,
        padding=True
    )


    input_ids = encoded[
        "input_ids"
    ].astype(
        np.int64
    )


    attention_mask = encoded[
        "attention_mask"
    ].astype(
        np.int64
    )


    if (
        "token_type_ids"
        in encoded
    ):

        token_type_ids = encoded[
            "token_type_ids"
        ].astype(
            np.int64
        )

    else:

        token_type_ids = (
            np.zeros_like(
                input_ids,
                dtype=np.int64
            )
        )


    bert_inputs = {
        "input_ids":
            input_ids,

        "attention_mask":
            attention_mask,

        "token_type_ids":
            token_type_ids
    }


    outputs = bert_session.run(
        None,
        bert_inputs
    )


    last_hidden_state = (
        outputs[0]
    )


    cls_features = (
        last_hidden_state[
            :, 0, :
        ]
    )


    return (
        cls_features
        .astype(
            np.float32
        )
    )


# ============================================================
# 10. IMAGE FEATURE EXTRACTION
# ============================================================

def extract_image_features(
    image_bytes: bytes
):

    image = Image.open(
        io.BytesIO(
            image_bytes
        )
    )


    image = image.convert(
        "RGB"
    )


    image = image.resize(
        (224, 224)
    )


    image_array = np.asarray(
        image,
        dtype=np.float32
    )


    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    input_name = (
        image_session
        .get_inputs()[0]
        .name
    )


    outputs = image_session.run(
        None,
        {
            input_name:
                image_array
        }
    )


    features = outputs[0]


    return (
        features
        .astype(
            np.float32
        )
    )


# ============================================================
# 11. ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message":
            "TruthLens AI service is running",
        "version":
            "3.2.0",
        "runtime":
            "ONNX Runtime"
    }


# ============================================================
# 12. HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health_check():

    return {
        "success": True,
        "status":
            "healthy",
        "models_loaded":
            True,
        "runtime":
            "ONNX Runtime",
        "text_model":
            "Quantized BERT Encoder",
        "image_model":
            "Quantized EfficientNetB0 ONNX",
        "fusion":
            "Feature Concatenation + ONNX Classifier",
        "scaler":
            "NumPy"
    }


# ============================================================
# 13. MULTIMODAL PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
async def predict_news(
    newsTitle: str = Form(...),
    newsText: str = Form(...),
    image: UploadFile = File(...)
):

    try:

        # ----------------------------------------------------
        # TEXT INPUT
        # ----------------------------------------------------

        # BERT was trained using Fakeddit clean_title,
        # so title is used for text inference.

        text = newsTitle.strip()


        if not text:

            return {
                "success": False,
                "message":
                    "News title is required."
            }


        # ----------------------------------------------------
        # BERT FEATURES
        # ----------------------------------------------------

        text_features = (
            extract_text_features(
                text
            )
        )


        if (
            text_features.shape[1]
            != 768
        ):

            raise ValueError(
                "Unexpected BERT feature shape: "
                f"{text_features.shape}"
            )


        # ----------------------------------------------------
        # IMAGE INPUT
        # ----------------------------------------------------

        image_bytes = await image.read()


        if not image_bytes:

            return {
                "success": False,
                "message":
                    "News image is required."
            }


        # ----------------------------------------------------
        # IMAGE FEATURES
        # ----------------------------------------------------

        image_features = (
            extract_image_features(
                image_bytes
            )
        )


        if (
            image_features.shape[1]
            != 1280
        ):

            raise ValueError(
                "Unexpected image feature shape: "
                f"{image_features.shape}"
            )


        # ----------------------------------------------------
        # MULTIMODAL FEATURE CONCATENATION
        # ----------------------------------------------------

        fused_features = np.concatenate(
            [
                text_features,
                image_features
            ],
            axis=1
        )


        if (
            fused_features.shape[1]
            != 2048
        ):

            raise ValueError(
                "Unexpected fused feature shape: "
                f"{fused_features.shape}"
            )


        # ----------------------------------------------------
        # LIGHTWEIGHT STANDARDIZATION
        # ----------------------------------------------------
        #
        # Equivalent to:
        #
        # StandardScaler.transform()
        #
        # Formula:
        #
        # (x - mean) / scale
        # ----------------------------------------------------

        fused_scaled = (
            (
                fused_features
                -
                scaler_mean
            )
            /
            scaler_scale
        ).astype(
            np.float32
        )


        # ----------------------------------------------------
        # FUSION CLASSIFIER
        # ----------------------------------------------------

        fusion_input_name = (
            fusion_session
            .get_inputs()[0]
            .name
        )


        fusion_outputs = (
            fusion_session.run(
                None,
                {
                    fusion_input_name:
                        fused_scaled
                }
            )
        )


        probability = float(
            np.asarray(
                fusion_outputs[0]
            ).reshape(-1)[0]
        )


        # ----------------------------------------------------
        # LABEL MAPPING
        # ----------------------------------------------------
        #
        # Fakeddit binary labels:
        #
        # 0 = Real / True
        # 1 = Fake
        #
        # Sigmoid output represents probability
        # of Class 1 = Fake.
        # ----------------------------------------------------

        if probability >= 0.5:

            predicted_class = 1

            prediction = "Fake"

            confidence = (
                probability
                * 100
            )

        else:

            predicted_class = 0

            prediction = "Real"

            confidence = (
                (1 - probability)
                * 100
            )


        fake_probability = (
            probability
            * 100
        )


        real_probability = (
            (1 - probability)
            * 100
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "success":
                True,

            "prediction":
                prediction,

            "predictedClass":
                predicted_class,

            "confidence":
                round(
                    confidence,
                    2
                ),

            "realProbability":
                round(
                    real_probability,
                    2
                ),

            "fakeProbability":
                round(
                    fake_probability,
                    2
                ),

            "models": {
                "text":
                    "Quantized BERT ONNX",

                "image":
                    "Quantized EfficientNetB0 ONNX",

                "fusion":
                    "ONNX Feature Fusion",

                "scaler":
                    "NumPy Standardization"
            }
        }


    except Exception as error:

        print(
            "Prediction error:",
            repr(error)
        )


        return {
            "success":
                False,

            "message":
                "Prediction failed",

            "error":
                str(error)
        }
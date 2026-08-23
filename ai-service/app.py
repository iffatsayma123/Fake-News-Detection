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
        "Multimodal fake-news classification using "
        "BERT V4 and EfficientNet V2"
    ),
    version="4.0.0",
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
    "bert_v4_classifier_quint8.onnx"
)

EFFICIENTNET_ONNX_PATH = os.path.join(
    MODELS_DIR,
    "efficientnet_v2_classifier.onnx"
)

TOKENIZER_PATH = os.path.join(
    MODELS_DIR,
    "tokenizer"
)


# ============================================================
# 3. SETTINGS
# ============================================================

MAX_LENGTH = 256

TEXT_WEIGHT = 0.50
IMAGE_WEIGHT = 0.50

providers = [
    "CPUExecutionProvider"
]


# ============================================================
# 4. MEMORY-FRIENDLY ONNX OPTIONS
# ============================================================

session_options = ort.SessionOptions()

session_options.enable_cpu_mem_arena = False
session_options.enable_mem_pattern = False

session_options.intra_op_num_threads = 1
session_options.inter_op_num_threads = 1

session_options.execution_mode = (
    ort.ExecutionMode.ORT_SEQUENTIAL
)

session_options.graph_optimization_level = (
    ort.GraphOptimizationLevel.ORT_ENABLE_ALL
)


# ============================================================
# 5. VERIFY FILES
# ============================================================

required_paths = {
    "BERT V4": BERT_ONNX_PATH,
    "EfficientNet V2": EFFICIENTNET_ONNX_PATH,
    "Tokenizer": TOKENIZER_PATH,
}

for name, path in required_paths.items():

    if not os.path.exists(path):

        raise FileNotFoundError(
            f"{name} not found: {path}"
        )


# ============================================================
# 6. LOAD TOKENIZER
# ============================================================

print("Loading BERT V4 tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    TOKENIZER_PATH,
    local_files_only=True
)

print("Tokenizer loaded.")


# ============================================================
# 7. LOAD BERT V4 QUINT8
# ============================================================

print("Loading BERT V4 QUInt8...")

bert_session = ort.InferenceSession(
    BERT_ONNX_PATH,
    sess_options=session_options,
    providers=providers
)

print("BERT V4 loaded.")


# ============================================================
# 8. LOAD EFFICIENTNET V2
# ============================================================

print("Loading EfficientNet V2...")

image_session = ort.InferenceSession(
    EFFICIENTNET_ONNX_PATH,
    sess_options=session_options,
    providers=providers
)

print("EfficientNet V2 loaded.")


print("")
print("=" * 55)
print("TruthLens AI V4 models loaded successfully")
print("=" * 55)
print("")


# ============================================================
# 9. SOFTMAX
# ============================================================

def softmax(logits):

    logits = np.asarray(
        logits,
        dtype=np.float32
    )

    logits = (
        logits
        -
        np.max(
            logits,
            axis=-1,
            keepdims=True
        )
    )

    exp_logits = np.exp(
        logits
    )

    return (
        exp_logits
        /
        np.sum(
            exp_logits,
            axis=-1,
            keepdims=True
        )
    )


# ============================================================
# 10. TEXT PREDICTION
# ============================================================

def predict_text_probability(text):

    encoded = tokenizer(
        text,
        return_tensors="np",
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH
    )

    input_ids = (
        encoded["input_ids"]
        .astype(np.int64)
    )

    attention_mask = (
        encoded["attention_mask"]
        .astype(np.int64)
    )

    if "token_type_ids" in encoded:

        token_type_ids = (
            encoded["token_type_ids"]
            .astype(np.int64)
        )

    else:

        token_type_ids = np.zeros_like(
            input_ids,
            dtype=np.int64
        )


    available_inputs = {
        item.name
        for item
        in bert_session.get_inputs()
    }


    bert_inputs = {}

    if "input_ids" in available_inputs:

        bert_inputs["input_ids"] = (
            input_ids
        )

    if "attention_mask" in available_inputs:

        bert_inputs["attention_mask"] = (
            attention_mask
        )

    if "token_type_ids" in available_inputs:

        bert_inputs["token_type_ids"] = (
            token_type_ids
        )


    outputs = bert_session.run(
        None,
        bert_inputs
    )


    logits = np.asarray(
        outputs[0]
    )


    probabilities = softmax(
        logits
    )[0]


    # V4 mapping:
    # Class 0 = Fake
    # Class 1 = Real

    fake_probability = float(
        probabilities[0]
    )

    real_probability = float(
        probabilities[1]
    )


    return (
        fake_probability,
        real_probability
    )


# ============================================================
# 11. IMAGE PREDICTION
# ============================================================

def predict_image_probability(
    image_bytes
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


    # IMPORTANT:
    # Keep the same preprocessing used by EfficientNet V2.
    # Do not divide by 255 here.

    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    image_input = (
        image_session
        .get_inputs()[0]
    )


    # Handle either NHWC or NCHW ONNX model.

    shape = image_input.shape

    if (
        len(shape) == 4
        and shape[1] == 3
    ):

        image_array = np.transpose(
            image_array,
            (0, 3, 1, 2)
        )


    outputs = image_session.run(
        None,
        {
            image_input.name:
                image_array
        }
    )


    output = np.asarray(
        outputs[0]
    )


    # EfficientNet V2:
    # Class 1 = Real
    # Class 0 = Fake

    real_probability = float(
        output.reshape(-1)[0]
    )


    real_probability = max(
        0.0,
        min(
            1.0,
            real_probability
        )
    )


    fake_probability = (
        1.0
        -
        real_probability
    )


    return (
        fake_probability,
        real_probability
    )


# ============================================================
# 12. ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message":
            "TruthLens AI service is running",
        "version": "4.0.0",
        "runtime": "ONNX Runtime"
    }


# ============================================================
# 13. HEALTH
# ============================================================

@app.get("/health")
def health_check():

    return {
        "success": True,

        "status": "healthy",

        "modelsLoaded": True,

        "runtime":
            "ONNX Runtime",

        "textModel":
            "BERT V4 QUInt8",

        "imageModel":
            "EfficientNet V2",

        "fusion":
            "50/50 probability late fusion",

        "textWeight":
            TEXT_WEIGHT,

        "imageWeight":
            IMAGE_WEIGHT,

        "labelMapping": {
            "0": "Fake",
            "1": "Real"
        }
    }


# ============================================================
# 14. PREDICT
# ============================================================

@app.post("/predict")
async def predict_news(

    newsTitle: str = Form(""),

    newsText: str = Form(""),

    image: UploadFile | None = File(None)

):

    try:

        title = (
            newsTitle.strip()
            if newsTitle
            else ""
        )

        article = (
            newsText.strip()
            if newsText
            else ""
        )


        # ====================================================
        # BUILD TEXT INPUT
        # ====================================================

        if title and article:

            model_text = (
                title
                +
                " [SEP] "
                +
                article
            )

        elif title:

            model_text = title

        elif article:

            model_text = article

        else:

            model_text = ""


        has_text = bool(
            model_text
        )


        # ====================================================
        # IMAGE INPUT
        # ====================================================

        image_bytes = None

        if image is not None:

            image_bytes = (
                await image.read()
            )


        has_image = bool(
            image_bytes
        )


        # ====================================================
        # REQUIRE AT LEAST ONE MODALITY
        # ====================================================

        if (
            not has_text
            and not has_image
        ):

            return {
                "success": False,

                "message":
                    "Please provide news text, "
                    "a title, or an image."
            }


        # ====================================================
        # TEXT MODEL
        # ====================================================

        text_fake = None
        text_real = None

        if has_text:

            (
                text_fake,
                text_real
            ) = predict_text_probability(
                model_text
            )


        # ====================================================
        # IMAGE MODEL
        # ====================================================

        image_fake = None
        image_real = None

        if has_image:

            (
                image_fake,
                image_real
            ) = predict_image_probability(
                image_bytes
            )


        # ====================================================
        # FINAL PROBABILITY
        # ====================================================

        if (
            has_text
            and has_image
        ):

            final_real = (
                TEXT_WEIGHT
                *
                text_real
                +
                IMAGE_WEIGHT
                *
                image_real
            )

            mode = "multimodal"


        elif has_text:

            final_real = (
                text_real
            )

            mode = "text-only"


        else:

            final_real = (
                image_real
            )

            mode = "image-only"


        final_real = max(
            0.0,
            min(
                1.0,
                float(
                    final_real
                )
            )
        )


        final_fake = (
            1.0
            -
            final_real
        )


        # ====================================================
        # CLASSIFICATION
        #
        # IMPORTANT:
        # prediction = Real/Fake for frontend compatibility
        # display_prediction = human-friendly wording
        # ====================================================

        if final_real >= 0.5:

            predicted_class = 1

            prediction = "Real"

            display_prediction = (
                "Likely Real"
            )

            confidence = (
                final_real
            )

        else:

            predicted_class = 0

            prediction = "Fake"

            display_prediction = (
                "Likely Fake"
            )

            confidence = (
                final_fake
            )


        # ====================================================
        # UNCERTAINTY FLAG
        # ====================================================

        needs_verification = (
            0.40
            <=
            final_real
            <=
            0.60
        )


        # ====================================================
        # DEBUG OUTPUT
        # ====================================================

        print("")
        print("=" * 55)

        print(
            "TruthLens AI V4 Prediction"
        )

        print(
            "Mode:",
            mode
        )

        if text_real is not None:

            print(
                "Text Real:",
                round(
                    text_real * 100,
                    2
                ),
                "%"
            )

        if image_real is not None:

            print(
                "Image Real:",
                round(
                    image_real * 100,
                    2
                ),
                "%"
            )

        print(
            "Final Real:",
            round(
                final_real * 100,
                2
            ),
            "%"
        )

        print(
            "Final Fake:",
            round(
                final_fake * 100,
                2
            ),
            "%"
        )

        print(
            "Prediction:",
            prediction
        )

        print(
            "Display Prediction:",
            display_prediction
        )

        print(
            "Needs Verification:",
            needs_verification
        )

        print("=" * 55)
        print("")


        # ====================================================
        # API RESPONSE
        # ====================================================

        response = {

            "success":
                True,

            # Keep this Real/Fake for existing frontend
            "prediction":
                prediction,

            # Human-friendly label
            "displayPrediction":
                display_prediction,

            "predictedClass":
                predicted_class,

            "confidence":
                round(
                    confidence * 100,
                    2
                ),

            "realProbability":
                round(
                    final_real * 100,
                    2
                ),

            "fakeProbability":
                round(
                    final_fake * 100,
                    2
                ),

            "needsVerification":
                needs_verification,

            "mode":
                mode,

            "models": {

                "text":
                    "BERT V4 QUInt8",

                "image":
                    "EfficientNet V2",

                "fusion":
                    (
                        "50/50 late fusion"
                        if mode
                        ==
                        "multimodal"
                        else
                        "Single modality"
                    )
            },

            "labelMapping": {
                "0": "Fake",
                "1": "Real"
            }
        }


        # ====================================================
        # OPTIONAL TEXT MODEL SCORES
        # ====================================================

        if text_real is not None:

            response[
                "textRealProbability"
            ] = round(
                text_real * 100,
                2
            )

            response[
                "textFakeProbability"
            ] = round(
                text_fake * 100,
                2
            )


        # ====================================================
        # OPTIONAL IMAGE MODEL SCORES
        # ====================================================

        if image_real is not None:

            response[
                "imageRealProbability"
            ] = round(
                image_real * 100,
                2
            )

            response[
                "imageFakeProbability"
            ] = round(
                image_fake * 100,
                2
            )


        return response


    except Exception as error:

        print(
            "Prediction error:",
            repr(error)
        )

        return {
            "success": False,

            "message":
                "Prediction failed",

            "error":
                str(error)
        }
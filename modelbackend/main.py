# python3 -m venv venv
# source venv/bin/activate
# pip install fastapi uvicorn torch torchvision pillow wikipedia python-multipart
# uvicorn main:app --reload
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io


app = FastAPI(title="Crop Disease Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropDiseaseCNN(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(128 * 28 * 28, 256)
        self.fc2 = nn.Linear(256, num_classes)
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        return self.fc2(x)

class_names = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy",
]

default_info = {
    "causes": ["No known causes available"],
    "prevention": ["No prevention data available"],
    "wiki": ""
}

disease_data = {
    "Pepper__bell___Bacterial_spot": {
        "causes": ["Bacterial infection", "Warm, wet weather"],
        "prevention": ["Use disease-free seeds", "Copper sprays"],
        "wiki": "https://en.wikipedia.org/wiki/Bacterial_spot_(pepper)"
    },
    "Pepper__bell___healthy": {
        "causes": ["No disease detected"],
        "prevention": ["Maintain good plant hygiene"],
        "wiki": ""
    },
    "Potato___Early_blight": {
        "causes": ["Fungal infection (Alternaria solani)", "Warm temperatures", "High humidity"],
        "prevention": ["Use certified seeds", "Crop rotation", "Apply fungicides"],
        "wiki": "https://en.wikipedia.org/wiki/Early_blight"
    },
    "Potato___Late_blight": {
        "causes": ["Fungal pathogen (Phytophthora infestans)", "Cool and wet conditions"],
        "prevention": ["Destroy infected plants", "Avoid overhead irrigation", "Apply fungicides early"],
        "wiki": "https://en.wikipedia.org/wiki/Late_blight"
    },
    "Potato___healthy": {
        "causes": ["No disease detected"],
        "prevention": ["Maintain good plant hygiene"],
        "wiki": ""
    },
    "Tomato_Bacterial_spot": {
        "causes": ["Bacterial infection", "Warm, wet conditions"],
        "prevention": ["Use disease-free seeds", "Avoid wet plants", "Copper sprays"],
        "wiki": "https://en.wikipedia.org/wiki/Bacterial_spot_(tomato)"
    },
    "Tomato_Early_blight": {
        "causes": ["Fungal infection", "Humid conditions"],
        "prevention": ["Use resistant varieties", "Remove infected leaves", "Apply fungicides"],
        "wiki": "https://en.wikipedia.org/wiki/Early_blight"
    },
    "Tomato_Late_blight": {
        "causes": ["Fungal pathogen", "Cool wet weather"],
        "prevention": ["Remove infected plants", "Fungicide application"],
        "wiki": "https://en.wikipedia.org/wiki/Late_blight"
    },
    "Tomato_Leaf_Mold": {
        "causes": ["Fungal spores", "High humidity"],
        "prevention": ["Proper spacing", "Fungicides"],
        "wiki": "https://en.wikipedia.org/wiki/Tomato_leaf_mold"
    },
    "Tomato_Septoria_leaf_spot": {
        "causes": ["Fungal infection", "Humid conditions"],
        "prevention": ["Remove infected leaves", "Apply fungicides"],
        "wiki": "https://en.wikipedia.org/wiki/Septoria_leaf_spot"
    },
    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "causes": ["Spider mites", "Dry conditions"],
        "prevention": ["Increase humidity", "Insecticidal soap"],
        "wiki": "https://en.wikipedia.org/wiki/Two-spotted_spider_mite"
    },
    "Tomato__Target_Spot": {
        "causes": ["Fungal pathogen", "Warm, humid weather"],
        "prevention": ["Remove infected plants", "Fungicide application"],
        "wiki": "https://en.wikipedia.org/wiki/Target_Spot"
    },
    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "causes": ["Viral infection", "Whitefly transmission"],
        "prevention": ["Control whiteflies", "Remove infected plants"],
        "wiki": "https://en.wikipedia.org/wiki/Tomato_yellow_leaf_curl_virus"
    },
    "Tomato__Tomato_mosaic_virus": {
        "causes": ["Viral infection", "Contact with infected plants"],
        "prevention": ["Remove infected plants", "Control aphids"],
        "wiki": "https://en.wikipedia.org/wiki/Tomato_mosaic_virus"
    },
    "Tomato_healthy": {
        "causes": ["No disease detected"],
        "prevention": ["Maintain good plant hygiene"],
        "wiki": ""
    },
}

model = CropDiseaseCNN(num_classes=len(class_names))
model.load_state_dict(torch.load("crop_disease_model.pth", map_location="cpu"))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

@app.get("/")
def home():
    return {"message": "Crop Disease Prediction API running 🚀"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image)
        probs = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probs, 1)

    predicted_class = class_names[predicted.item()]
    info = disease_data.get(predicted_class, default_info)

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence.item() * 100, 2),
        "causes": info.get("causes", default_info["causes"]),
        "prevention": info.get("prevention", default_info["prevention"]),
        "wikipedia_link": info.get("wiki", default_info["wiki"])
    }
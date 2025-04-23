# In order to install python packages needed
# import subprocess
# subprocess.run("pip install -r requirements.txt",shell=True)

import os
import time
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.linear_model import LinearRegression

# Load .env variables
load_dotenv()

# Creation of Ideal Data for Wait Time Predictions
icu_beds = np.random.randint(10, 100, size=100)
ventilators = np.random.randint(5, 20, size=100)
X = np.column_stack((icu_beds, ventilators))

a = 2.0
b = 0.5
base_wait_general = 100
base_wait_emergency = 75
noise = np.random.normal(0, 5, size=100)  

y_general = base_wait_general - (a * icu_beds + b * ventilators) + noise
y_general = np.clip(y_general, 5, None)

y_emergency = base_wait_emergency - (a * icu_beds + b * ventilators) + noise
y_emergency = np.clip(y_emergency, 5, None)

# Making linear regression model for Wait Time Predictions
model_general = LinearRegression()
model_general.fit(X,y_general)

model_emergency = LinearRegression()
model_emergency.fit(X,y_emergency)

print("Providing Predicted Wait Times to Database...")


while True:
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)

    db = client["test"]
    collection = db["hospitals"]

    hospitals = list(collection.find({}))

    for idx, hospital in enumerate(hospitals):
        resources = hospital.get("resources", {})
        icu = resources.get("icu_beds", 0)
        vents = resources.get("ventilators", 0)

        X_input = np.array([[icu, vents]])
        predicted_wait_general = round(max(model_general.predict(X_input)[0], 5))  
        predicted_str_general = f"{predicted_wait_general} mins"

        predicted_wait_emergency = round(max(model_emergency.predict(X_input)[0], 5))  
        predicted_str_emergency = f"{predicted_wait_emergency} mins"

        # Update the wait_times.general and wait_times.emergency field in the Database
        collection.update_one(
            {"_id": hospital["_id"]},
            {"$set": {
                "wait_times.general": predicted_str_general,
                "wait_times.emergency": predicted_str_emergency
            }}
        )


    time.sleep(5)

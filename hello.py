import json
import random
from datetime import datetime, timedelta

# --- Data Sources ---
cities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 
    'Multan', 'Faisalabad', 'Hyderabad', 'Quetta', 'Sialkot', 
    'Gujranwala', 'Mardan', 'Sukkur', 'Bahawalpur', 'Larkana'
]

# Approximate coordinates for each city [longitude, latitude]
city_coordinates = {
    'Lahore': [74.3295, 31.5470],
    'Karachi': [67.0011, 24.8607],
    'Islamabad': [73.0479, 33.6844],
    'Rawalpindi': [73.0551, 33.6007],
    'Peshawar': [71.5249, 34.0150],
    'Multan': [71.4734, 30.1575],
    'Faisalabad': [73.0831, 31.4504],
    'Hyderabad': [68.3738, 25.3920],
    'Quetta': [66.9827, 30.1798],
    'Sialkot': [74.5207, 32.4945],
    'Gujranwala': [74.1910, 32.1877],
    'Mardan': [72.0485, 34.1931],
    'Sukkur': [69.0369, 27.7054],
    'Bahawalpur': [71.6683, 29.3950],
    'Larkana': [68.2131, 27.5576]
}

street_names = [
    "Ferozepur Road", "Mall Road", "Gulberg Main Boulevard", "Shahrah-e-Faisal", 
    "Allama Iqbal Road", "Canal Bank Road", "University Road", "Ring Road", 
    "Zamzama Street", "Jail Road", "GT Road", "Iqbal Town Main Blvd", 
    "Nazimabad Block 3", "Gulshan-e-Iqbal Block 7", "Model Town C Block", 
    "DHA Phase 6", "Bahria Town Sector E", "North Nazimabad Block H", 
    "Saddar Road", "G-10 Markaz", "Blue Area", "Satellite Town", 
    "Airport Road", "F-8/3 Street", "Johar Town Main Road", "Korangi Road", 
    "Defence Road", "Sarwar Road", "Shalimar Link Road", "M. M. Alam Road"
]

hospital_adjectives = ['General', 'Central', 'Regional', 'National', 'City']
hospital_types = ['Hospital', 'Medical Center', 'Clinic']
insurance_options = ["XYZ Health", "ABC Insurance", "Alpha Insurance", "Beta Insurance", "Gamma Health"]
imaging_methods = ["X-Ray", "Ultrasound", "CT", "MRI"]

# --- Utility Functions ---
def random_last_updated():
    base = datetime(2025, 4, 1)
    random_offset = timedelta(seconds=random.randint(0, 86400))
    dt = base + random_offset
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')

def clean_data(obj):
    """
    Recursively clean strings in nested structures to ensure UTF-8 compatibility.
    """
    if isinstance(obj, dict):
        return {k: clean_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_data(item) for item in obj]
    elif isinstance(obj, str):
        return obj.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
    else:
        return obj

# --- Generate Dummy Hospital Data ---
data = []
for _ in range(100):
    city = random.choice(cities)
    
    # Hospital Name: e.g. "Lahore General Hospital"
    name = f"{city} {random.choice(hospital_adjectives)} {random.choice(hospital_types)}"
    
    # Location using coordinates for the city
    coordinates = city_coordinates.get(city, [0.0, 0.0])
    location = {"type": "Point", "coordinates": coordinates}
    
    # Address: e.g. "Ferozepur Road, Lahore, Pakistan"
    address = f"{random.choice(street_names)}, {city}, Pakistan"
    
    # Resources
    resources = {
        "icu_beds": random.randint(10, 50),
        "ventilators": random.randint(5, 20),
        "blood_bank": random.choice([True, False]),
        "medical_imaging": random.sample(imaging_methods, k=random.randint(1, len(imaging_methods)))
    }
    
    # Contact Information
    phone = f"+92 {random.randint(40, 99)} {random.randint(1000,9999)} {random.randint(1000,9999)}"
    email = f"info@{city.lower()}hospital.com"
    contact = {"phone": phone, "email": email}
    
    # Insurance Accepted (array of 2)
    insurance_accepted = random.sample(insurance_options, k=2)
    
    # Ratings
    ratings = round(random.uniform(3.5, 5.0), 1)
    
    # Wait Times
    wait_times = {
        "emergency": f"{random.randint(10, 60)} mins",
        "general": f"{round(random.uniform(0.5, 3.0), 1)} hours"
    }
    
    # Last Updated
    last_updated = random_last_updated()
    
    entry = {
        "name": name,
        "location": location,
        "address": address,
        "resources": resources,
        "contact": contact,
        "insurance_accepted": insurance_accepted,
        "ratings": ratings,
        "wait_times": wait_times,
        "last_updated": last_updated
    }
    
    # Clean the entry for UTF-8 safety
    data.append(clean_data(entry))

# --- Save as a JSON Lines File ---
# Each line in the file will be a valid JSON object.
output_filename = "dummy_hospital_data.json"
with open(output_filename, "w", encoding="utf-8") as f:
    for entry in data:
        json_line = json.dumps(entry, ensure_ascii=False)
        f.write(json_line + "\n")

print(f"✅ JSON file '{output_filename}' with 100 entries has been created.")
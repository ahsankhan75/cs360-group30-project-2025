import pandas as pd
import random
import string
from datetime import datetime, timedelta

# Cities with geolocation
cities = {
    'Lahore': (31.5497, 74.3436),
    'Karachi': (24.8607, 67.0011),
    'Islamabad': (33.6844, 73.0479),
    'Rawalpindi': (33.6007, 73.0679),
    'Peshawar': (34.0150, 71.5249),
    'Multan': (30.1575, 71.5249),
    'Faisalabad': (31.4504, 73.1350),
    'Hyderabad': (25.3960, 68.3578),
    'Quetta': (30.1798, 66.9750),
    'Sialkot': (32.4945, 74.5229),
    'Gujranwala': (32.1617, 74.1883),
    'Sukkur': (27.7052, 68.8574),
    'Bahawalpur': (29.3956, 71.6836),
    'Larkana': (27.5631, 68.2158),
    'Mardan': (34.1988, 72.0400)
}

blood_types = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
urgency_levels = ['Low', 'Medium', 'High', 'Critical']

def generate_request_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

def random_datetime(start_date, end_date):
    return start_date + timedelta(
        seconds=random.randint(0, int((end_date - start_date).total_seconds()))
    )

# Generate 100 entries
data = []

for _ in range(100):
    city = random.choice(list(cities.keys()))
    lat, lon = cities[city]

    # Add variation to coordinates
    lat += round(random.uniform(-0.05, 0.05), 6)
    lon += round(random.uniform(-0.05, 0.05), 6)

    entry = {
        "requestId": generate_request_id(),
        "hospitalName": f"{city} {random.choice(['General Hospital', 'Medical Center', 'Blood Bank'])}",
        "bloodType": random.choice(blood_types),
        "urgencyLevel": random.choice(urgency_levels),
        "location": city,
        "latitude": lat,
        "longitude": lon,
        "datePosted": random_datetime(datetime(2025, 4, 1), datetime(2025, 4, 2)).strftime('%Y-%m-%d %H:%M:%S'),
        "unitsNeeded": random.randint(1, 6)
    }

    data.append(entry)

# Save to CSV
df = pd.DataFrame(data)
df.to_csv("blood_requests.csv", index=False, encoding='utf-8-sig')

print("✅ CSV file 'blood_requests.csv' created successfully with 100 entries.")
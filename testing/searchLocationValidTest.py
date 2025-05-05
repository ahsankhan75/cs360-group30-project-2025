from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_experimental_option("prefs", {
    "profile.default_content_setting_values.geolocation": 1  # 1 = Allow, 2 = Block
})

driver = webdriver.Chrome(service=Service(), options=options)

driver.get("https://emcon-lums-2025.vercel.app/hospitals")

time.sleep(2)

location_toggle = driver.find_element(By.XPATH, "//span[contains(text(),'Show nearby hospitals')]/following-sibling::div/input")
driver.execute_script("arguments[0].click();", location_toggle)

time.sleep(1.5)

results = driver.find_elements(By.XPATH, "//div[contains(@class, 'shadow-md') and .//h3[contains(@class, 'text-teal-700')]]")

if len(results) > 0:
    print(f"✅ Found {len(results)} nearby hospital(s) - Test Passed")
else:
    print("❌ No hospitals found - Test Failed")

driver.quit()

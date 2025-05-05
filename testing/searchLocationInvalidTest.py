from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_experimental_option("prefs", {
    "profile.default_content_setting_values.geolocation": 2  # 1 = Allow, 2 = Block
})

driver = webdriver.Chrome(service=Service(), options=options)

driver.get("https://emcon-lums-2025.vercel.app/hospitals")
time.sleep(3)

location_toggle = driver.find_element(By.XPATH, "//span[contains(text(),'Show nearby hospitals')]/following-sibling::div/input")
driver.execute_script("arguments[0].click();", location_toggle)
time.sleep(3)

try:
    error_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Location access denied or unavailable.')]")
    print("✅ Location denied error prompt displayed - Test Passed")
except:
    print("❌ Location denied error prompt NOT displayed - Test Failed")

driver.quit()

import random
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

driver = webdriver.Chrome()

try:
    driver.get("https://emcon-lums-2025.vercel.app/hospital-admin/login")
    time.sleep(10)
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your email']").send_keys("saltycat12160@gmail.com")
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your password']").send_keys("Pakistan@1975")
    driver.find_element(By.XPATH, "//button[contains(text(),'Log In')]").click()
    time.sleep(6)

    profile_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Hospital Profile') or contains(@href, '/hospital-admin/profile')]")
    driver.execute_script("arguments[0].click();", profile_link)
    time.sleep(6)

    icu_beds = str(random.randint(10, 100))
    ventilators = str(random.randint(1, 20))

    driver.find_element(By.ID, "icu_beds").clear()
    driver.find_element(By.ID, "icu_beds").send_keys(icu_beds)

    driver.find_element(By.ID, "ventilators").clear()
    driver.find_element(By.ID, "ventilators").send_keys(ventilators)

    save_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Save Changes')]")
    driver.execute_script("arguments[0].scrollIntoView(true);", save_btn)
    driver.execute_script("arguments[0].click();", save_btn)
    time.sleep(6)

    if "dashboard" not in driver.current_url:
        driver.get("https://emcon-lums-2025.vercel.app/hospital-admin/dashboard")
        time.sleep(6)

    resource_list_items = driver.find_elements(By.XPATH, "//h2[contains(text(), 'Hospital Information')]/ancestor::div[contains(@class,'shadow')][1]//ul/li")

    found_icu = found_vent = False
    for li in resource_list_items:
        text = li.text.strip().lower()
        if text.startswith("icu beds:"):
            found_icu = text.endswith(icu_beds.lower())
        elif text.startswith("ventilators:"):
            found_vent = text.endswith(ventilators.lower())

    if found_icu and found_vent:
        print(f"✅ ICU Beds and Ventilators updated correctly: ICU Beds = {icu_beds}, Ventilators = {ventilators}")
    else:
        print("❌ Resource update did not reflect correctly - Test Failed")
        print(f"🔍 ICU Beds expected: {icu_beds}, Ventilators expected: {ventilators}")
        for li in resource_list_items:
            print("🔎 Found:", li.text)

except Exception as e:
    print(f"❌ Test Failed due to error: {e}")
finally:
    driver.quit()

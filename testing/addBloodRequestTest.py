from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time

driver = webdriver.Chrome()

try:
    driver.get("https://emcon-lums-2025.vercel.app/hospital-admin/login")
    time.sleep(10)

    driver.find_element(By.XPATH, "//input[@placeholder='Enter your email']").send_keys("saltycat12160@gmail.com")
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your password']").send_keys("Pakistan@1975")
    driver.find_element(By.XPATH, "//button[contains(text(),'Log In')]").click()
    time.sleep(6)

    blood_requests_btn = driver.find_element(By.XPATH, "//a[contains(@href, '/hospital-admin/blood-requests')]")
    driver.execute_script("arguments[0].click();", blood_requests_btn)
    time.sleep(6)

    create_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Create New Request')]")
    driver.execute_script("arguments[0].click();", create_btn)
    time.sleep(6)

    driver.find_element(By.NAME, "bloodType").send_keys("O+")
    driver.find_element(By.NAME, "urgencyLevel").send_keys("Critical")
    driver.find_element(By.NAME, "unitsNeeded").clear()
    driver.find_element(By.NAME, "unitsNeeded").send_keys("10")
    driver.find_element(By.NAME, "contactNumber").send_keys("03001234567")
    driver.find_element(By.NAME, "contactEmail").send_keys("admin@example.com")

    submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Create Request')]")
    driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
    driver.execute_script("arguments[0].click();", submit_button)
    time.sleep(6)

    requests = driver.find_elements(By.XPATH, "//ul[contains(@class,'divide-y')]/li")
    if not requests:
        print("❌ No requests found - Test Failed")
    else:
        top_request = requests[0].text.lower()
        if "o+" in top_request and "critical" in top_request and "10" in top_request:
            print("✅ Blood request successfully created and appears at the top - Test Passed")
        else:
            print("❌ Newly created request not found at the top - Test Failed")

except Exception as e:
    print(f"❌ Test Failed with error: {e}")
finally:
    driver.quit()

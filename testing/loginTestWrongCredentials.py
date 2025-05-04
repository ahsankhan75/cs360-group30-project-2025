from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

driver = webdriver.Chrome()

driver.get("https://emcon-lums-2025.vercel.app/login")

time.sleep(20)

email_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter your email']")
password_field = driver.find_element(By.XPATH, "//input[@placeholder='Enter your password']")

email_field.send_keys("burewala@gmail.com")
password_field.send_keys("Burewala4!")

password_field.send_keys(Keys.RETURN)

time.sleep(3)
if "dashboard" in driver.current_url.lower():
    print("❌ Login Successful - Test Failed")
else:
    print("✅ Login Failed - Test Passed")

driver.quit()

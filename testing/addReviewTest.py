from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

driver = webdriver.Chrome()

try:
    driver.get("https://emcon-lums-2025.vercel.app/login")
    time.sleep(10)

    driver.find_element(By.XPATH, "//input[@placeholder='Enter your email']").send_keys("jaffrialianser2004@gmail.com")
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your password']").send_keys("Brother4!")
    driver.find_element(By.XPATH, "//button[contains(text(),'Log In')]").click()
    time.sleep(5)

    driver.get("https://emcon-lums-2025.vercel.app/reviews")
    time.sleep(3)

    search_box = driver.find_element(By.XPATH, "//input[@placeholder='Search for a hospital...']")
    search_box.send_keys("Lahore City Clinic")
    time.sleep(3)

    dropdown_item = driver.find_element(By.XPATH, "//div[contains(text(), 'Lahore City Clinic')]")
    dropdown_item.click()
    time.sleep(3)

    stars = driver.find_elements(By.XPATH, "//button[.//span[text()='★']]")
    driver.execute_script("arguments[0].scrollIntoView(true);", stars[2])
    driver.execute_script("arguments[0].click();", stars[2])
    time.sleep(3)

    comment_box = driver.find_element(By.ID, "comment")
    comment_box.send_keys("This review was written by Selenium. It was programatically generated.")
    time.sleep(3)

    submit_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Submit Review')]")
    submit_btn.click()
    time.sleep(6)

    your_review = driver.find_element(By.XPATH, "//*[contains(text(), 'This review was written by Selenium')]")

    if your_review:
        print("✅ Review submitted and displayed successfully - Test Passed")
    else:
        print("❌ Review not displayed - Test Failed")

except Exception as e:
    print(f"❌ Test Failed due to error: {e}")

finally:
    driver.quit()

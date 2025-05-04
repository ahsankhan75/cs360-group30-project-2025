import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

try:
    wait = WebDriverWait(driver, 15)
    driver.get("https://emcon-lums-2025.vercel.app/login")
    wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))).send_keys("jaffrialianser2004@gmail.com")
    driver.find_element(By.XPATH, "//input[@type='password']").send_keys("Brother4!")
    time.sleep(5)

    login_btn = driver.find_element(By.XPATH, "//button[contains(text(),'Log In')]")
    driver.execute_script("arguments[0].scrollIntoView(true);", login_btn)
    login_btn.click()
    wait.until(EC.url_contains("/dashboard"))

    blood_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/blood-requests') and contains(text(), 'Blood Donations')]")))
    driver.execute_script("arguments[0].click();", blood_btn)
    wait.until(EC.presence_of_element_located((By.XPATH, "//table")))

    accepted = False
    page = 1

    while not accepted:
        print(f"🔍 Checking page {page} for Accept button...")

        try:
            scrollable_table = driver.find_element(By.XPATH, "//div[contains(@class, 'overflow-x-auto')]")
            driver.execute_script("arguments[0].scrollLeft = arguments[0].scrollWidth", scrollable_table)
            time.sleep(3)
        except Exception as e:
            print("⚠️ Could not scroll horizontally:", e)

        accept_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Accept Request')]")
        if accept_buttons:
            accept_button = accept_buttons[0]

            driver.execute_script("arguments[0].scrollIntoView(true);", accept_button)
            time.sleep(3)

            driver.execute_script("arguments[0].click();", accept_button)
            time.sleep(3)

            status_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Pending') or contains(text(), 'Accepted')]")
            if any("Pending" in s.text for s in status_buttons):
                print("✅ Request accepted successfully and marked as Pending Approval - Test Passed")
            else:
                print("❌ Accept button clicked but status not updated - Test Failed")
            accepted = True
            break

        next_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Next')]")
        if next_btns and next_btns[0].is_enabled():
            driver.execute_script("arguments[0].scrollIntoView(true);", next_btns[0])
            next_btns[0].click()
            page += 1
            time.sleep(3)
        else:
            print("❌ No Acceptable Request found after paginating - Test Failed")
            break

except Exception as e:
    print(f"❌ Test Failed with error: {e}")
finally:
    driver.quit()

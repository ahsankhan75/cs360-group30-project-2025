from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()

try:
    driver.get("https://emcon-lums-2025.vercel.app/login")
    time.sleep(10)
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your email']").send_keys("jaffrialianser2004@gmail.com")
    driver.find_element(By.XPATH, "//input[@placeholder='Enter your password']").send_keys("Brother4!")
    driver.find_element(By.XPATH, "//button[contains(text(),'Log In')]").click()
    time.sleep(4)

    def go_to_medical_card():
        medical_card_nav = driver.find_element(By.XPATH, "//a[contains(@href, '/medical-card') and contains(text(), 'Medical Card')]")
        driver.execute_script("arguments[0].scrollIntoView(true);", medical_card_nav)
        driver.execute_script("arguments[0].click();", medical_card_nav)
        time.sleep(4)

    go_to_medical_card()

    try:
        edit_btn = driver.find_element(By.XPATH, "//button[@title='Edit Medical Card']")
        driver.execute_script("arguments[0].click();", edit_btn)
        time.sleep(4)
    except:
        pass

    def fill_by_name(name_attr, value):
        try:
            field = driver.find_element(By.NAME, name_attr)
            driver.execute_script("arguments[0].scrollIntoView(true);", field)
            field.clear()
            field.send_keys(value)
        except Exception as e:
            print(f"⚠️ Couldn't fill '{name_attr}': {e}")

    try:
        date_field = driver.find_element(By.XPATH, "//input[@type='date']")
        driver.execute_script("arguments[0].scrollIntoView(true);", date_field)
        date_field.clear()
        date_field.send_keys("2004-03-21")
    except Exception as e:
        print(f"⚠️ Couldn't fill 'dateOfBirth' via placeholder: {e}")

    fill_by_name("name", "Ali Jaffri")
    fill_by_name("userContactNumber", "03123456789")
    fill_by_name("allergies", "Pollen")
    fill_by_name("currentMedications", "Aspirin")
    fill_by_name("medicalDevicesImplants", "Pacemaker")
    fill_by_name("recentSurgeryHospitalization", "Appendectomy")
    fill_by_name("dietaryRestrictions", "Vegan")
    fill_by_name("primaryEmergencyContact.name", "Ahmed Jaffri")
    fill_by_name("primaryEmergencyContact.relationship", "Brother")
    fill_by_name("primaryEmergencyContact.number", "03221234567")
    fill_by_name("secondaryEmergencyContact.name", "Sara Jaffri")
    fill_by_name("secondaryEmergencyContact.relationship", "Sister")
    fill_by_name("secondaryEmergencyContact.number", "03001234567")
    fill_by_name("insurance.provider", "ABC Insurance")
    fill_by_name("insurance.policyNumber", "POL123456")
    fill_by_name("insurance.groupNumber", "GRP7890")
    fill_by_name("primaryPhysician.name", "Dr. Rahim")
    fill_by_name("primaryPhysician.specialization", "Cardiology")
    fill_by_name("primaryPhysician.contact", "03335678900")

    driver.find_element(By.NAME, "gender").send_keys("Male")
    driver.find_element(By.NAME, "bloodType").send_keys("A+")

    try:
        checkbox = driver.find_element(By.NAME, "organDonor")
        if not checkbox.is_selected():
            driver.execute_script("arguments[0].click();", checkbox)
    except:
        pass

    submit_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Submit Card') or contains(text(), 'Update Card')]")
    driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
    driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(4)

    dashboard_link = driver.find_element(By.XPATH, "//a[@href='/' or contains(text(), 'Dashboard')]")
    driver.execute_script("arguments[0].click();", dashboard_link)
    time.sleep(4)

    go_to_medical_card()

    try:
        visible = driver.find_element(By.XPATH, "//*[contains(text(), 'Ali Jaffri')]")
        print("✅ Medical card saved and visible on revisit - Test Passed")
    except:
        print("❌ Medical card not found after saving - Test Failed")

except Exception as e:
    print(f"❌ Test Failed due to error: {e}")
finally:
    driver.quit()

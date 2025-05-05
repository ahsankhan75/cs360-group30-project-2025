import subprocess

test_files = [
    "loginTestSuccess.py",
    "loginTestWrongCredentials.py",
    "loginTestEmptyForm.py",
    "searchLocationValidTest.py",
    "searchLocationInvalidTest.py",
    "addReviewTest.py",
    "medicalCardTest.py",
    "hospitalResourceUpdateTest.py",
    "addBloodRequestTest.py",
    "acceptBloodRequestTest.py"
]

for test in test_files:
    print(f"Running {test}...")
    result = subprocess.run(["python3", test], capture_output=True, text=True)
    print("Output:\n", result.stdout)
    if result.stderr:
        print("Errors:\n", result.stderr)
    print("-" * 50)

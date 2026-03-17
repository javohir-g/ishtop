import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def log(msg):
    print(msg)
    sys.stdout.flush()

def create_test_profiles():
    # 1. Create Job Seeker
    log("--- 1. JOB SEEKER INITIALIZATION ---")
    url = f"{BASE_URL}/auth/dev-token?telegram_id=12345&role=job_seeker"
    log(f"POST {url}")
    try:
        res = requests.post(url)
        log(f"Status: {res.status_code}")
        if res.status_code != 200:
            log(f"Error: {res.text}")
            return
        
        data = res.json()
        seeker_id = data.get('user_id')
        log(f"User created/found. ID: {seeker_id}")
        token = data["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Verify
        log("Checking session...")
        me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        log(f"Session verification: {me_res.status_code}")
        if me_res.status_code != 200:
            log(f"Session error: {me_res.text}")
            return

        seeker_data = {
            "full_name": "Иван Иванов",
            "desired_position": "Воспитатель",
            "bio": "Опытный педагог с 5-летним стажем.",
            "district": "Чиланзар",
            "experience_years": 5,
            "desired_salary": "5,000,000 сум"
        }
        log("Updating job seeker profile...")
        upd_res = requests.put(f"{BASE_URL}/profile", json=seeker_data, headers=headers)
        log(f"Profile update result: {upd_res.status_code}")
        if upd_res.status_code != 200:
            log(f"Update error: {upd_res.text}")

    except Exception as e:
        log(f"EXCEPTION in Job Seeker flow: {str(e)}")

    # 2. Create Employer
    log("\n--- 2. EMPLOYER INITIALIZATION ---")
    url = f"{BASE_URL}/auth/dev-token?telegram_id=67891&role=kindergarten_employer"
    log(f"POST {url}")
    try:
        res = requests.post(url)
        log(f"Status: {res.status_code}")
        if res.status_code != 200:
            log(f"Error: {res.text}")
            return
            
        data = res.json()
        employer_id = data.get('user_id')
        log(f"User created/found. ID: {employer_id}")
        token = data["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Verify
        log("Checking session...")
        me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        log(f"Session verification: {me_res.status_code}")
        
        reg_data = {
            "full_name": "Мария Петрова",
            "position": "Заведующая",
            "kindergarten": {
                "name": "Солнышко",
                "district": "Юнусабад",
                "address": "ул. Амира Темура, 15",
                "phone": "+998 90 123 45 67",
                "description": "Лучший детский сад в районе."
            }
        }
        log("Updating employer profile...")
        upd_res = requests.put(f"{BASE_URL}/employer/profile", json=reg_data, headers=headers)
        log(f"Employer update result: {upd_res.status_code}")
        if upd_res.status_code != 200:
            log(f"Update error: {upd_res.text}")

    except Exception as e:
        log(f"EXCEPTION in Employer flow: {str(e)}")

if __name__ == "__main__":
    log("=== STARTING INITIALIZATION ===")
    create_test_profiles()
    log("=== INITIALIZATION FINISHED ===")

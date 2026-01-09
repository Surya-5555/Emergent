import requests
import json

# Test the fixed APIs
base_url = "https://leetcode-evolved.preview.emergentagent.com/api"

# Login to get token
login_response = requests.post(f"{base_url}/auth/login", json={
    "email": "test@example.com",
    "password": "Test123!"
})

if login_response.status_code == 200:
    token = login_response.json()['token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("✅ Login successful")
    
    # Test submission
    submission_data = {
        "problem_id": "two-sum",
        "code": "def twoSum(nums, target):\n    return [0, 1]",
        "language": "python",
        "status": "Accepted",
        "passed_tests": 5,
        "total_tests": 5
    }
    
    submission_response = requests.post(f"{base_url}/submissions", json=submission_data, headers=headers)
    print(f"Submission test: {submission_response.status_code} - {submission_response.text[:200]}")
    
    # Test discussion
    discussion_data = {
        "problem_id": "two-sum",
        "title": "Test Discussion",
        "content": "Testing the platform"
    }
    
    discussion_response = requests.post(f"{base_url}/discussions", json=discussion_data, headers=headers)
    print(f"Discussion test: {discussion_response.status_code} - {discussion_response.text[:200]}")
    
else:
    print(f"❌ Login failed: {login_response.status_code}")
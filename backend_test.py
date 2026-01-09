import requests
import sys
import json
from datetime import datetime

class DSAPlatformTester:
    def __init__(self, base_url="https://leetcode-evolved.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = "test@example.com"
        self.test_username = "testuser"
        self.test_password = "Test123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "username": self.test_username,
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user ID: {self.user_id}")
            return True
        return False

    def test_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Logged in user ID: {self.user_id}")
            return True
        return False

    def test_get_problems(self):
        """Test fetching all problems"""
        success, response = self.run_test(
            "Get All Problems",
            "GET",
            "problems",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} problems")
            return len(response) >= 6, response  # Should have 6 sample problems
        return False, []

    def test_get_problem_detail(self, problem_id="two-sum"):
        """Test fetching specific problem"""
        success, response = self.run_test(
            f"Get Problem Detail ({problem_id})",
            "GET",
            f"problems/{problem_id}",
            200
        )
        if success and 'title' in response:
            print(f"   Problem: {response['title']}")
            return True, response
        return False, {}

    def test_problem_filters(self):
        """Test problem filtering"""
        # Test difficulty filter
        success1, _ = self.run_test(
            "Filter Problems by Difficulty (Easy)",
            "GET",
            "problems?difficulty=Easy",
            200
        )
        
        # Test company filter
        success2, _ = self.run_test(
            "Filter Problems by Company (Google)",
            "GET",
            "problems?company=Google",
            200
        )
        
        return success1 and success2

    def test_create_submission(self, problem_id="two-sum"):
        """Test creating a submission"""
        success, response = self.run_test(
            "Create Submission",
            "POST",
            "submissions",
            200,
            data={
                "problem_id": problem_id,
                "code": "def twoSum(nums, target):\n    return [0, 1]",
                "language": "python",
                "status": "Accepted",
                "passed_tests": 5,
                "total_tests": 5
            }
        )
        return success, response

    def test_get_submissions(self):
        """Test fetching user submissions"""
        success, response = self.run_test(
            "Get User Submissions",
            "GET",
            "submissions",
            200
        )
        return success, response

    def test_ai_assist_hint(self, problem_id="two-sum"):
        """Test AI hint generation"""
        success, response = self.run_test(
            "AI Assist - Get Hint",
            "POST",
            "ai/assist",
            200,
            data={
                "problem_id": problem_id,
                "request_type": "hint"
            }
        )
        if success and 'response' in response:
            print(f"   AI Response length: {len(str(response['response']))}")
        return success, response

    def test_ai_assist_mistake_analysis(self, problem_id="two-sum"):
        """Test AI mistake analysis"""
        success, response = self.run_test(
            "AI Assist - Mistake Analysis",
            "POST",
            "ai/assist",
            200,
            data={
                "problem_id": problem_id,
                "user_code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        return [i, i+1]",
                "request_type": "mistake_analysis"
            }
        )
        return success, response

    def test_discussions(self):
        """Test discussions functionality"""
        # Get discussions
        success1, discussions = self.run_test(
            "Get Discussions",
            "GET",
            "discussions",
            200
        )
        
        # Create discussion
        success2, new_discussion = self.run_test(
            "Create Discussion",
            "POST",
            "discussions",
            200,
            data={
                "problem_id": "two-sum",
                "title": "Test Discussion",
                "content": "Testing the platform"
            }
        )
        
        discussion_id = None
        if success2 and 'id' in new_discussion:
            discussion_id = new_discussion['id']
            
            # Test upvote
            success3, _ = self.run_test(
                "Upvote Discussion",
                "POST",
                f"discussions/{discussion_id}/upvote",
                200
            )
            return success1 and success2 and success3
        
        return success1 and success2

    def test_blogs(self):
        """Test blogs functionality"""
        success, response = self.run_test(
            "Get Blogs",
            "GET",
            "blogs",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} blogs")
            return len(response) >= 2  # Should have 2 sample blogs
        return False

    def test_analytics(self):
        """Test analytics functionality"""
        success, response = self.run_test(
            "Get Analytics",
            "GET",
            "analytics",
            200
        )
        if success and 'solved_count' in response:
            print(f"   Analytics: {response}")
            return True
        return False

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting DSA Platform API Tests")
        print(f"   Base URL: {self.base_url}")
        
        # Test registration (try both register and login in case user exists)
        print("\n" + "="*50)
        print("AUTHENTICATION TESTS")
        print("="*50)
        
        register_success = self.test_register()
        if not register_success:
            print("   Registration failed, trying login...")
            login_success = self.test_login()
            if not login_success:
                print("❌ Both registration and login failed. Stopping tests.")
                return False
        
        # Test problems
        print("\n" + "="*50)
        print("PROBLEMS TESTS")
        print("="*50)
        
        problems_success, problems = self.test_get_problems()
        if not problems_success:
            print("❌ Failed to fetch problems")
            return False
            
        problem_detail_success, problem = self.test_get_problem_detail()
        if not problem_detail_success:
            print("❌ Failed to fetch problem detail")
            
        filter_success = self.test_problem_filters()
        
        # Test submissions
        print("\n" + "="*50)
        print("SUBMISSIONS TESTS")
        print("="*50)
        
        submission_success, _ = self.test_create_submission()
        get_submissions_success, _ = self.test_get_submissions()
        
        # Test AI features
        print("\n" + "="*50)
        print("AI INTEGRATION TESTS")
        print("="*50)
        
        ai_hint_success, _ = self.test_ai_assist_hint()
        ai_analysis_success, _ = self.test_ai_assist_mistake_analysis()
        
        # Test discussions
        print("\n" + "="*50)
        print("DISCUSSIONS TESTS")
        print("="*50)
        
        discussions_success = self.test_discussions()
        
        # Test blogs
        print("\n" + "="*50)
        print("BLOGS TESTS")
        print("="*50)
        
        blogs_success = self.test_blogs()
        
        # Test analytics
        print("\n" + "="*50)
        print("ANALYTICS TESTS")
        print("="*50)
        
        analytics_success = self.test_analytics()
        
        # Print final results
        print("\n" + "="*50)
        print("FINAL RESULTS")
        print("="*50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        
        critical_tests = [
            ("Authentication", register_success or login_success),
            ("Problems List", problems_success),
            ("Problem Detail", problem_detail_success),
            ("Submissions", submission_success),
            ("AI Integration", ai_hint_success or ai_analysis_success),
            ("Discussions", discussions_success),
            ("Blogs", blogs_success),
            ("Analytics", analytics_success)
        ]
        
        print("\nCritical Features Status:")
        for feature, status in critical_tests:
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {feature}")
        
        failed_features = [feature for feature, status in critical_tests if not status]
        if failed_features:
            print(f"\n⚠️  Failed Features: {', '.join(failed_features)}")
        
        return self.tests_passed >= (self.tests_run * 0.8)  # 80% pass rate

def main():
    tester = DSAPlatformTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
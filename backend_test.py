import requests
import json
import unittest
import uuid
import time
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://f512ea25-1d95-4f04-869a-412babd91281.preview.emergentagent.com/api"

class TestProposalAPI(unittest.TestCase):
    """Test suite for the Love Proposal API"""

    def setUp(self):
        """Set up test data"""
        self.proposal_data = {
            "partner_name": "Emma Johnson",
            "proposer_name": "Michael Smith",
            "message": "Will you marry me? You've made these past 5 years the best of my life.",
            "our_story": [
                {"date": "June 15, 2019", "event": "First met at Central Park"},
                {"date": "July 4, 2019", "event": "First date at Riverside Cafe"},
                {"date": "December 24, 2019", "event": "First said 'I love you'"},
                {"date": "March 10, 2020", "event": "Moved in together"},
                {"date": "August 8, 2022", "event": "Adopted our dog Max"}
            ]
        }
        self.proposal_id = None
        self.response_id = None

    def test_1_create_proposal(self):
        """Test creating a new proposal"""
        print("\n1. Testing proposal creation endpoint...")
        
        response = requests.post(f"{BACKEND_URL}/proposals", json=self.proposal_data)
        response_data = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data.get("success"))
        self.assertIsNotNone(response_data.get("proposal_id"))
        
        # Save the proposal_id for subsequent tests
        TestProposalAPI.proposal_id = response_data.get("proposal_id")
        print(f"Created proposal with ID: {TestProposalAPI.proposal_id}")

    def test_2_get_proposal(self):
        """Test retrieving a proposal by ID"""
        print("\n2. Testing proposal retrieval endpoint...")
        
        # Ensure we have a proposal_id from the previous test
        self.assertIsNotNone(TestProposalAPI.proposal_id, "No proposal_id available from previous test")
        
        response = requests.get(f"{BACKEND_URL}/proposals/{TestProposalAPI.proposal_id}")
        response_data = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data.get("partner_name"), self.proposal_data["partner_name"])
        self.assertEqual(response_data.get("proposer_name"), self.proposal_data["proposer_name"])
        self.assertEqual(response_data.get("message"), self.proposal_data["message"])
        self.assertEqual(len(response_data.get("our_story")), len(self.proposal_data["our_story"]))
        self.assertEqual(response_data.get("status"), "pending")

    def test_3_get_nonexistent_proposal(self):
        """Test retrieving a non-existent proposal"""
        print("\n3. Testing error handling for non-existent proposal...")
        
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BACKEND_URL}/proposals/{fake_id}")
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {response.text}")
        
        self.assertEqual(response.status_code, 404)

    def test_4_respond_yes_to_proposal(self):
        """Test responding 'yes' to a proposal"""
        print("\n4. Testing proposal response endpoint with 'yes'...")
        
        # Ensure we have a proposal_id from the previous test
        self.assertIsNotNone(TestProposalAPI.proposal_id, "No proposal_id available from previous test")
        
        response_data = {
            "proposal_id": TestProposalAPI.proposal_id,
            "response": "yes",
            "message": "Yes, I will marry you! I love you so much!"
        }
        
        response = requests.post(f"{BACKEND_URL}/proposals/{TestProposalAPI.proposal_id}/respond", json=response_data)
        response_json = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_json, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_json.get("success"))
        self.assertIsNotNone(response_json.get("response_id"))
        
        # Save the response_id
        TestProposalAPI.response_id = response_json.get("response_id")

    def test_5_check_proposal_status_after_yes(self):
        """Test checking proposal status after responding 'yes'"""
        print("\n5. Testing proposal status endpoint after 'yes' response...")
        
        # Ensure we have a proposal_id from the previous test
        self.assertIsNotNone(TestProposalAPI.proposal_id, "No proposal_id available from previous test")
        
        response = requests.get(f"{BACKEND_URL}/proposals/{TestProposalAPI.proposal_id}/status")
        response_data = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data.get("status"), "responded")
        self.assertEqual(response_data.get("response"), "yes")
        self.assertIsNotNone(response_data.get("responded_at"))

    def test_6_create_another_proposal(self):
        """Create another proposal for 'no' response test"""
        print("\n6. Creating another proposal for 'no' response test...")
        
        new_proposal = {
            "partner_name": "Olivia Davis",
            "proposer_name": "James Wilson",
            "message": "We've been through so much together. Will you marry me?",
            "our_story": [
                {"date": "February 14, 2020", "event": "Met at Valentine's Day party"},
                {"date": "March 1, 2020", "event": "First date at the art museum"},
                {"date": "September 5, 2020", "event": "Took our first trip together"}
            ]
        }
        
        response = requests.post(f"{BACKEND_URL}/proposals", json=new_proposal)
        response_data = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_data.get("success"))
        
        # Save the new proposal_id
        TestProposalAPI.second_proposal_id = response_data.get("proposal_id")
        print(f"Created second proposal with ID: {TestProposalAPI.second_proposal_id}")

    def test_7_respond_no_to_proposal(self):
        """Test responding 'no' to a proposal"""
        print("\n7. Testing proposal response endpoint with 'no'...")
        
        # Ensure we have a second proposal_id
        self.assertIsNotNone(TestProposalAPI.second_proposal_id, "No second proposal_id available")
        
        response_data = {
            "proposal_id": TestProposalAPI.second_proposal_id,
            "response": "no",
            "message": "I'm sorry, but I don't think I'm ready for this step yet."
        }
        
        response = requests.post(f"{BACKEND_URL}/proposals/{TestProposalAPI.second_proposal_id}/respond", json=response_data)
        response_json = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_json, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response_json.get("success"))

    def test_8_check_proposal_status_after_no(self):
        """Test checking proposal status after responding 'no'"""
        print("\n8. Testing proposal status endpoint after 'no' response...")
        
        # Ensure we have a second proposal_id
        self.assertIsNotNone(TestProposalAPI.second_proposal_id, "No second proposal_id available")
        
        response = requests.get(f"{BACKEND_URL}/proposals/{TestProposalAPI.second_proposal_id}/status")
        response_data = response.json()
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {json.dumps(response_data, indent=2)}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data.get("status"), "responded")
        self.assertEqual(response_data.get("response"), "no")
        self.assertIsNotNone(response_data.get("responded_at"))

    def test_9_missing_fields(self):
        """Test creating a proposal with missing required fields"""
        print("\n9. Testing error handling for missing fields...")
        
        incomplete_data = {
            "partner_name": "Sophie Miller",
            # Missing proposer_name
            "message": "Will you marry me?"
            # Missing our_story
        }
        
        response = requests.post(f"{BACKEND_URL}/proposals", json=incomplete_data)
        
        print(f"Response status code: {response.status_code}")
        print(f"Response data: {response.text}")
        
        self.assertNotEqual(response.status_code, 200)  # Should not be successful

if __name__ == "__main__":
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(TestProposalAPI('test_1_create_proposal'))
    test_suite.addTest(TestProposalAPI('test_2_get_proposal'))
    test_suite.addTest(TestProposalAPI('test_3_get_nonexistent_proposal'))
    test_suite.addTest(TestProposalAPI('test_4_respond_yes_to_proposal'))
    test_suite.addTest(TestProposalAPI('test_5_check_proposal_status_after_yes'))
    test_suite.addTest(TestProposalAPI('test_6_create_another_proposal'))
    test_suite.addTest(TestProposalAPI('test_7_respond_no_to_proposal'))
    test_suite.addTest(TestProposalAPI('test_8_check_proposal_status_after_no'))
    test_suite.addTest(TestProposalAPI('test_9_missing_fields'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)
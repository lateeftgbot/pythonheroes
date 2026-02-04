import requests
import json

def test_bot():
    bot_url = "https://pythonheroes.onrender.com/api/payment-intent"
    payload = {
        "email": "tester@example.com",
        "name": "Manual Tester",
        "amount": 3000,
        "status": "manual_test"
    }

    print(f"--- TESTING BOT CONNECTION ---")
    print(f"Target URL: {bot_url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(bot_url, json=payload, timeout=15)
        print(f"\n[SUCCESS] Request sent!")
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Bot website is reachable and responding correctly!")
        elif response.status_code == 404:
            print("\n❌ Path not found (404). Check if the route '/api/payment-intent' exists in your bot code.")
        else:
            print(f"\n⚠️ Received unexpected status code: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("\n❌ Connection Timed Out. The bot website might be down or Render is sleeping.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    test_bot()

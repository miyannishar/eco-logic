import requests

# Replace with your actual IP address
SERVER_IP = "YOUR_IP_ADDRESS"
BASE_URL = f"http://{SERVER_IP}:8000"

def test_eco_agent():
    """Test the eco-agent product details endpoint"""
    url = f"{BASE_URL}/eco-agent/product-details"
    
    files = {
        'file': ('product.mp4', open('media/videos/test_product.mp4', 'rb'), 'video/mp4')
    }
    
    params = {
        'userMedicalAilments': 'Lactose intolerance'
    }
    
    response = requests.post(url, files=files, params=params)
    print("Eco-Agent Response:", response.json())

def test_report_analysis():
    """Test the report analysis endpoint"""
    url = f"{BASE_URL}/analyse-and-upload"
    
    files = {
        'fileInput': ('report.pdf', open('media/reports/test_report.pdf', 'rb'), 'application/pdf')
    }
    
    params = {
        'userId': 'test_user_123'
    }
    
    response = requests.post(url, files=files, params=params)
    print("Report Analysis Response:", response.json())

if __name__ == "__main__":
    try:
        print("Testing Eco-Agent endpoint...")
        test_eco_agent()
        
        print("\nTesting Report Analysis endpoint...")
        test_report_analysis()
    except Exception as e:
        print(f"Error occurred: {str(e)}") 
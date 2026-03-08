import requests
import os

FILE_NAME = "real_test.mp3"

def test_voice_endpoint():
    url = "http://localhost:8000/api/chat/voice"
    
    if not os.path.exists(FILE_NAME):
        print(f"ERROR: I cannot find {FILE_NAME}!")
        return

    print(f"Found {FILE_NAME}! Sending to the backend API...")
    
    with open(FILE_NAME, "rb") as f:
        files = {"audio_file": (FILE_NAME, f, "audio/mpeg")}
        data = {"session_id": "test_session_123"}
        
        # We send a dummy Authorization header to bypass HTTPBearer
        headers = {"Authorization": "Bearer test_token_123"}
        response = requests.post(url, files=files, data=data, headers=headers)
        
        print(f"\n--- RESPONSE ---")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"User Transcribed Text: {str(response.headers.get('X-User-Transcript')).encode('utf-8', 'replace').decode('utf-8')}")
            print(f"AI Text Response: {str(response.headers.get('X-AI-Response')).encode('utf-8', 'replace').decode('utf-8')}")
            print(f"AI Gamification Quests: {str(response.headers.get('X-AI-Tasks')).encode('utf-8', 'replace').decode('utf-8')}")
            
            output_file = "ai_response.mp3"
            with open(output_file, "wb") as out_f:
                out_f.write(response.content)
            print(f"\nSUCCESS! 🎙️ The AI's audio response has been saved as: {output_file}")
            print(f"Play '{output_file}' to hear the Cartesia voice!")
        else:
            print(f"Error Details: {response.text}")

if __name__ == "__main__":
    test_voice_endpoint()

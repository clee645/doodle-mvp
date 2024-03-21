import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)  # This is needed to allow cross-origin requests from your extension

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key = openai_api_key)

def generate_description(image_url):
    try:
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Explain what user action occured in this image based on what's highlighted. In your response start with a directive such as 'Click on download button' and respond from the perspective of an expert who is directing a user on how to do this one step. Your response should be short and only one sentence."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                }
            ],
            max_tokens=100,
        )
        description = response.choices[0].message.content
        return description
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return None


@app.route('/generate-description', methods=['POST'])
def generate_description_endpoint():
    content = request.json
    print(f"Received content: {content}")  
    if not content or 'imageUrl' not in content:
        return jsonify(error="No imageUrl provided."), 400
    image_url = content['imageUrl']
    
    description = generate_description(image_url)
    if description is None:  
        return jsonify(error="Failed to generate description."), 500
    
    return jsonify(description=description)


if __name__ == '__main__':
    app.run(debug=True)
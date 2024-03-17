from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)  # This is needed to allow cross-origin requests from your extension

client = OpenAI(api_key ="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")

def generate_description(image_url):
  response = client.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "Explain what user action occured in this image based on what's higlighted. In your response start with a directive such as 'Click on download button' and respond from the perspective of an expert who is directing a user on how to do this one step. Your response should be short and only one sentence."},
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
  print(description)
  return description


@app.route('/generate-presigned-url', methods=['GET'])
def generate_presigned_url():
    s3_client = boto3.client('s3', region_name='us-east-1', aws_access_key_id='AKIATTGE7H6EBUDBZV4U', aws_secret_access_key='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')
    bucket_name = 'doodle-screenshots'
    object_name = 'unique-object-key.png'  # Ensure this is unique for each upload

    presigned_url = s3_client.generate_presigned_url('put_object',
                                                     Params={'Bucket': bucket_name,
                                                             'Key': object_name,
                                                             'ContentType': 'image/png'},  # Ensure ContentType is specified here
                                                     ExpiresIn=3600)
    return jsonify({'url': presigned_url})


@app.route('/generate-description', methods=['POST'])
def generate_description_endpoint():
    if 'image' not in request.files:
        return jsonify(error="No image file provided."), 400
    image = request.files['image']
    image_path = "./images/" + image.filename
    image.save(image_path)
    
    description = generate_description(image_path)
    
    return jsonify(description=description)

if __name__ == '__main__':
    app.run(debug=True)
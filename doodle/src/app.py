import os
# from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)  # This is needed to allow cross-origin requests from your extension

# load_dotenv()
# openai_api_key = os.getenv("OPENAI_API_KEY")
# client = OpenAI(api_key = openai_api_key)

def generate_description(element_type, element_name):
    # Simple logic to generate a description based on element type and name
    if element_type == 'button':
        return f'Click the "{element_name}" button.'
    elif element_type == 'a':
        return f'Click on the link "{element_name}".'
    elif element_type == 'select':
        return 'Select an option from the dropdown.'
    else:
        return 'Interact with the element.'

@app.route('/generate-description', methods=['POST'])
def generate_description_endpoint():
    content = request.json
    json_formatted_str = json.dumps(content, indent=2)  # Directly use 'content' here
    print(json_formatted_str)
    if not content or 'elementInfo' not in content:
        return jsonify(error="No elementInfo provided."), 400
    
    element_info = content['elementInfo']
    print(element_info)
    if element_info == "initialize":
        description = "Welcome to Doodle!"
    else:
        description = generate_description(element_info['elementType'], element_info['elementName'])
    
    return jsonify(description=description)


if __name__ == '__main__':
    app.run(debug=True)
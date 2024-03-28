import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI
import os
import json
from notion_client import Client as NotionClient

app = Flask(__name__)
CORS(app)  # This is needed to allow cross-origin requests from your extension

load_dotenv()  # Load environment variables
notion_token = '' #os.getenv("NOTION_TOKEN")
notion_page_id = '' #os.getenv("NOTION_PAGE_ID")
openai_api_key = '' #os.getenv("OPENAI_API_KEY")

# Initialize Notion and OpenAI clients
notion_client = NotionClient(auth=notion_token)
openai_client = OpenAI(api_key=openai_api_key)

@app.route('/walkthrough')
def walkthrough():
    return render_template('walkthrough.html')

def generate_title(screenshots, descriptions):

    messages = []
    for url in screenshots:
        image_object = {
            "type": "image_url",
            "image_url": {
                "url": url,
            },
        }
        messages.append(image_object)

    # Add the common user message to the messages list
    user_message = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": f"Generate a short once sentence title from what the user is doing sequentially in these images. What the user is doing is highlighted in purple boxes. An example title may be 'Setting up email campaigns on Hunter.' Use the following descriptions that correspond to the following images as context for what is going on in the images to create the title. Here are the descriptions: {descriptions}",
            }
        ] + messages,  # Append the list of image messages
    }

    # Call the completion API with the constructed messages list
    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[user_message],
        max_tokens=300,
    )
    
    title_with_quotes = response.choices[0].message.content
    title = title_with_quotes.strip('\'"')
    return title

def add_title(client, page_id, title):
    response = client.pages.create(
        parent={"type": "page_id", "page_id": page_id},
        properties={
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": title
                    }
                }
            ]
        }
    )

    new_notion_page_id = response['id']
    print(new_notion_page_id)
    return new_notion_page_id

def write_clickable_text(client, page_id, text, link_page_id):
    client.blocks.children.append(
        block_id=page_id,
        children=[
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        { "type": "text",
                            "text": {
                            "content": text,
                            "link": {
                                "url": link_page_id
                                }
                            },
                            "annotations": {
                                "bold": True
                            },
                        }
                    ]
                }
            }
        ]
    )

def write_text(client, page_id, text):
    client.blocks.children.append(
        block_id = page_id,
        children = [
            {
                "object":"block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text":[
                        {
                            "type":"text",
                            "text": {
                                "content": text
                            }
                        }
                    ]
                }
            }
        ]
    )

def write_image(client, page_id, image_url):
    client.blocks.children.append(
        block_id=page_id,
        children=[
            {
                "object": "block",
                "type": "image",
                "image": {
                    "type": "external",
                    "external": {
                        "url": image_url
                    }
                }
            }
        ]
    )


def build_notion_page_url(new_notion_page_id, title):
    url = 'https://abyssinian-chess-530.notion.site/'

    #Add dashes to title name
    words = title.split()
    dashed_title = "".join(word + "-" for word in words)

    #remove dashes from new_notion_page_id
    no_dash_notion_page_id = new_notion_page_id.replace("-", "")

    #concatenate both
    final_notion_url = url + dashed_title + no_dash_notion_page_id
    return final_notion_url
 


@app.route('/create-notion-page', methods=['POST'])
def create_notion_page():
    # Parse request data
    data = request.json
    screenshots = data.get('screenshots', [])
    descriptions = data.get('descriptions', [])
    
    # Generate title based on screenshots and descriptions
    title = generate_title(screenshots, descriptions)  # Implement this as shown previously
    
    # Create a new Notion page and add the content
    new_notion_page_id = add_title(notion_client, notion_page_id, title)

    link_page_id = "http://127.0.0.1:5000/walkthrough" 
    write_clickable_text(notion_client, new_notion_page_id, "Walk me through (Click on me)", link_page_id)

    for description, screenshot in zip(descriptions, screenshots):
        write_text(notion_client, new_notion_page_id, description)
        write_image(notion_client, new_notion_page_id, screenshot)
    
    # Build and return the Notion page URL
    notion_page_url = build_notion_page_url(new_notion_page_id, title)
    print("complete url: " + notion_page_url)
    return jsonify({"notion_page_url": notion_page_url}), 200


def generate_description(element_type, element_name):
    # Simple logic to generate a description based on element type and name
    if element_type == 'button':
        return f'Click the "{element_name}" button.'
    elif element_type == 'span':
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
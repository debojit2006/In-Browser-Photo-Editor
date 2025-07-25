# This Python code would run on a server using the Flask framework.
# It would handle tasks like saving user images to a database or cloud storage.
from flask import Flask, request, jsonify
import base64
import os
import uuid # Use UUID for truly unique filenames

# Initialize the Flask application
app = Flask(__name__)

# This is a simulation. In a real-world app, you would save to a
# cloud storage service like Amazon S3 or Google Cloud Storage, not the local filesystem.
UPLOAD_FOLDER = 'user_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Define an API endpoint for saving images
@app.route('/api/save_image', methods=['POST'])
def save_image():
    """
    Expects a JSON payload with an 'image' key containing a Base64 encoded image string.
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # The image data is sent as a Data URL: "data:image/png;base64,iVBORw0KGgo..."
        # We need to split off the header to get just the Base64 content.
        header, encoded = data['image'].split(',', 1)
        image_bytes = base64.b64decode(encoded)
        
        # Generate a unique filename to prevent overwriting files
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Write the image bytes to a file
        with open(filepath, "wb") as fh:
            fh.write(image_bytes)
            
        print(f"Image saved to {filepath}")
        
        # Send a success response back to the client
        return jsonify({
            "message": "Image saved successfully!",
            "filename": filename,
            "path": f"/{UPLOAD_FOLDER}/{filename}" # A simulated URL
        }), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    # Run the Flask development server
    app.run(debug=True, port=5000)

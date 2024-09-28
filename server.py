from flask import Flask, request, jsonify
import nbformat
from nbconvert import PythonExporter
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Function to execute your IPython notebook
def get_transcript_from_notebook(video_url):
    url = video_url
    video_id = url.replace('https://www.youtube.com/watch?v=', '')
    video_id = url.replace('https://www.youtube.com/watch?v=', '').split('&')[0]
    print(video_id)

    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return "transcript"

@app.route('/get_transcript', methods=['POST'])
def get_transcript():
    data = request.get_json()
    video_url = data.get('url')

    # Fetch the transcript by executing the notebook or your existing logic
    transcript = get_transcript_from_notebook(video_url)
    
    return jsonify({'transcript': transcript})

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)

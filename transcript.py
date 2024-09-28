from youtube_transcript_api import YouTubeTranscriptApi

url = 'https://www.youtube.com/watch?v=2TL3DgIMY1g&ab_channel=ElitheComputerGuy'
video_id = url.replace('https://www.youtube.com/watch?v=', '')
video_id = url.replace('https://www.youtube.com/watch?v=', '').split('&')[0]
print(video_id)

transcript = YouTubeTranscriptApi.get_transcript(video_id)


print(transcript)

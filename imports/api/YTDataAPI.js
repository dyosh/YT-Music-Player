import { API_KEY } from '/API_KEYS.js';
const GET_INFO_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?id=';

export function getYTDataFromVideo(videoId) {
  let url =  GET_INFO_BASE_URL + videoId + "&key=" + API_KEY + "&part=snippet,contentDetails";

  let infoPromise = fetch(url).then(function(response) {
    return response.json();
  }).then(function(response){
    let infoResponse = response;

    let infoTitle = infoResponse.items[0].snippet.title;
    let thumbnailSrc = infoResponse.items[0].snippet.thumbnails.high.url;
   
    let duration = infoResponse.items[0].contentDetails.duration;
    let durationInSeconds = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = (parseInt(durationInSeconds[1]) || 0);
    let minutes = (parseInt(durationInSeconds[2]) || 0);
    let seconds = (parseInt(durationInSeconds[3]) || 0);
    durationInSeconds = hours * 3600 + minutes * 60 + seconds;

    let info = {
      videoId: videoId,
      title: infoTitle,
      thumbnailSrc: thumbnailSrc,
      duration: durationInSeconds
    };

    return info;
  });

  return infoPromise;
}
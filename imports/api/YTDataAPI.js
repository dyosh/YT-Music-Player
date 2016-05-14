import { API_KEY } from '/API_KEYS.js';
const GET_INFO_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?id=';

export function getYTDataFromVideo(videoId) {
  console.log("getInfo() called with videoId " + videoId);      

  let url =  GET_INFO_BASE_URL + videoId + "&key=" + API_KEY + "&part=snippet,contentDetails";

  let infoPromise = fetch(url).then(function(response) {
    return response.json();
  }).then(function(response){
    let infoResponse = response;

    let infoTitle = infoResponse.items[0].snippet.title;
    if (infoTitle.length > 15) {
      infoTitle = infoTitle.substr(0,15) + "...";
    }
    let thumbnailSrc = infoResponse.items[0].snippet.thumbnails.high.url;
    let duration = infoResponse.items[0].contentDetails.duration;

    let info = {
      videoId: videoId,
      title: infoTitle,
      thumbnailSrc: thumbnailSrc,
      duration: duration
    };

    return info;
  });

  return infoPromise;
}

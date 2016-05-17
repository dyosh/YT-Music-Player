import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import Header from './Header.jsx';
import Footer from './Footer.jsx';
// import PlaylistForm from './PlaylistForm.jsx';
import Playlist from './Playlist.jsx';

import { Playlists } from '../api/playlists.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.currentIndex = 0;
    this.playlist;

    this.state = {
      songTitle: '',
      thumbnailSrc: ''
    };

    this.player;
    this.intervalID;

    this.initAPI = this.initAPI.bind(this);
    this.play = this.play.bind(this);
    this.playNext = this.playNext.bind(this);
    this.playPrevious = this.playPrevious.bind(this);
    this.restartCurrentSong = this.restartCurrentSong.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.changeVolume = this.changeVolume.bind(this);

    this.renderPlaylists = this.renderPlaylists.bind(this);

    this.initAPI();
  }

  // initial load of playlist done here.
  componentWillReceiveProps(playlistProps) {
    this.playlist = playlistProps.playlists[0].songs;
  }

  initAPI() {
    // 2. This code loads the IFrame Player API code asynchronously.
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // onYoutubeIframeAPIReady() is a callback function that gets called once the script is fully 
    // loaded. tag.addEventListener('load' ,() => {}) did not work, the iframe was not fully loaded
    // so the player never showed up. 
    let t = this;
    onYouTubeIframeAPIReady = function() {
      t.player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: {
          'controls': 1,
          'rel': 0,
          'showinfo': 0
        },
        events: {
          'onReady': t.play,
          'onStateChange': t.onPlayerStateChange
        }
      });
    }
  }

  changeVolume(val) {
    if (this.player !== undefined) {
      this.player.setVolume(val.currentTarget.value);
    }
  }

  play() {
    let song = this.playlist[this.currentIndex];

    this.setState({
      songTitle: song.title,
      thumbnailSrc: song.thumbnailSrc 
    });

    this.player.loadVideoById({videoId: song.videoId});
    this.player.playVideo();
  }

  playNext() {
    if (this.currentIndex >= this.playlist.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex += 1;
    }
    this.play();
  }

  playPrevious() {
    if (this.currentIndex <= 0) {
      this.currentIndex = this.playlist.length - 1;
    } else {
      this.currentIndex -= 1;
    }
    this.play();
  }

  restartCurrentSong() {
    this.player.seekTo(0);
  }

  onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      this.playNext();
    }

    if (event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.PAUSED) {
      window.clearInterval(this.intervalID);
    }

    if (event.data === YT.PlayerState.PLAYING) {
      let seconds = this.player.getDuration();
      let currentPixelWidth = ((this.player.getCurrentTime() / seconds) * 405);
      this.startProgressBar(seconds, currentPixelWidth);
    }
  }

  startProgressBar(seconds, currentPixelWidth) {
    // if video stops (for example buffering) do window.clearInterval(intervalID);
    // player.getCurrentTime() will return current time on the video. This translates
    // to how many pixels wide the animation is (animation ticks +pixelWidth every second)
    let pixelWidth = currentPixelWidth;  

    let loadingBar = document.getElementById('loadingBar');

    loadingBar.style.width = pixelWidth + "px";
    this.intervalID = window.setInterval(startAnimation, 1000);

    function startAnimation() {
      pixelWidth += (405/seconds);
      if (pixelWidth >= 405) {
        window.clearInterval(this.intervalID);
        loadingBar.style.width = "0px";
      } else {
        loadingBar.style.width = pixelWidth + "px";
      }
    }
  }

  renderPlaylists() {
    let playlists = this.props.playlists;
    return playlists.map((playlist) => (
      <Playlist key={playlist._id} playlist={playlist} player={this} />
    ));
  }

  render() {
    return (
      <div className="container">
        <Header />

        <div className="player">
          <div className="player__video" id="player"></div>
          <div className="player__song_details">
            <div className="player__song_details_left">
              <h1>{this.state.songTitle}</h1>
              <input type="range" min="0" max="100" onChange={this.changeVolume} />
              <div className="player__loading">
                <div className="player__loading__progress" id="loadingBar"></div>
              </div> 
            </div>
            <div className="player__song_details_right">
              <img src={this.state.thumbnailSrc} />
            </div>
          </div>

          <div className={"player_controls_container"}>
            <div className={"player_controls_prev"} onClick={this.playPrevious}>Previous</div>
            <div className={"player_controls_next"} onClick={this.playNext}>Next</div>
            <div className={"player_controls_restart"} onClick={this.restartCurrentSong}>Restart</div>
          </div>
        </div>
  
        <div className="list_of_playlists">      
          <ul>
            {this.renderPlaylists()}
          </ul>
        </div>
        
      </div>
    );
  }
}

App.propTypes = {
  playlists: PropTypes.object.isRequired,
}

export default createContainer(() => {
  return {
    playlists: Playlists.find({}).fetch()
  };
}, App);
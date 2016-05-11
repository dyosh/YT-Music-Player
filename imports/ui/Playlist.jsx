import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';
import Song from './Song.jsx';

import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';

import { API_KEY } from '/API_KEYS.js';

require('../static/css/playlist.css');

const GET_INFO_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?id=';

export default class Playlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displaySongs: false,
    };

    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.toggleShowSongs = this.toggleShowSongs.bind(this);
    this.getInfo = this.getInfo.bind(this);
  }

  convertToMilliseconds() {
    
  }

  displayEdit() {
    console.log("displayEdit pressed");
  }

  getInfo(videoId) {
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
        infoTitle: infoTitle,
        thumbnailSrc: thumbnailSrc,
        duration: duration
      };

      return info;
    }.bind(this));

    return infoPromise;
  }  

  removePlaylist() {
    Playlist.remove(this.props.playlist._id);
  }

  toggleShowSongs() {
    // if (this.state.displaySongs === 'hidden') {
    //   this.state.displaySongs = '';
    // } else {
    //   this.state.displaySongs = 'hidden';
    // }

    // this.setState({
    //   showSongs: this.state.displaySongs,
    // });
  }

  addSongToPlaylist(event) {
    event.preventDefault();

    let videoId = ReactDOM.findDOMNode(this.refs.videoId).value.trim();
    let infoTitle = '';
    let thumbnailSrc = '';

    let gettingInfoPromise = new Promise(function(resolve, reject) {
      resolve(this.getInfo(videoId));
    }.bind(this)).then(function(info) {

      let songObj = {
        videoId: videoId,
        title: info.infoTitle,
        thumbnailSrc: info.thumbnailSrc
      };

      Songs.insert(songObj, function(err, songID) {
        if (err) { console.log("ERROR in addSongToPlaylist(): " + err); }
        
        console.log(songID);
        // songObj.song_id = songID;

        Playlists.update(this.props.playlist._id, {
          $push: { 
            songs: 
              {
                song_id: songID,
                videoId: videoId,
                title:  info.infoTitle,
                thumbnailSrc: info.thumbnailSrc,
                duration : info.duration
              }
          }
        });      

      }.bind(this));
    }.bind(this));

    ReactDOM.findDOMNode(this.refs.videoId).value = '';

  }

  loadPlaylist() {
    console.log(this.props.playlist);

    this.props.player.playlist = this.props.playlist.songs;
    this.props.player.currentIndex = 0;
    this.props.player.play();


    // this.props.player.playlist.length = 0;
    // this.props.playlist.songs.map((song) => {
    //   this.props.player.playlist.push(song);
    // });

    // console.log(this.props.player.playlist);

    // for (let song of this.props.playlist.songs) {
    //   this.props.player.playlist.push(song.videoId);
    // }

    // this.props.player.currentIndex = 0;
    // this.props.player.play();
  }

  removePlaylist() {
    Playlists.remove(this.props.playlist._id);
  }

  toggleShowPlaylist() {
    this.setState({displaySongs: !this.state.displaySongs}, () => {
      let songs = ReactDOM.findDOMNode(this.refs.plistSongs);
      if (this.state.displaySongs) {
        songs.style.display = 'list-item';
      } else {
        songs.style.display = 'none';
      }
    });
  }

  render() {
    return (
      <li>
        <div className="playlist_title_container">
          <div className="playlist_title" ref="playlistTitle" onClick={this.toggleShowPlaylist.bind(this)}>
            <h3>{this.props.playlist.name}</h3>
          </div>
          <div className="edit_btn" onClick={this.displayEdit.bind(this)}>Edit</div>
        </div>

        <div ref="plistSongs" className="playlist_songs">
          <button onClick={this.removePlaylist.bind(this)}>Remove Playlist</button>
          <button onClick={this.loadPlaylist.bind(this)}>Load Playlist</button>
          <Song songs={this.props.playlist.songs} player={this.props.player} playlist={this.props.playlist}/>
        </div>
        <form onSubmit={this.addSongToPlaylist.bind(this)}>
          <input placeholder="videoId here" ref="videoId"/> 
          <input type="submit" value="videoId here" />
        </form>
      </li>
    );
  }
}

Playlist.propTypes = {
  playlist: PropTypes.object.isRequired
}
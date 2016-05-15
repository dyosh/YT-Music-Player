import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';
import Song from './Song.jsx';
import PlaylistForm from './PlaylistForm.jsx';

import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';

import { API_KEY } from '/API_KEYS.js';

require('../static/css/playlist.css');

const GET_INFO_BASE_URL = 'https://www.googleapis.com/youtube/v3/videos?id=';

export default class Playlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistToEdit: '',
      showForm: '',
      displaySongs: false,
    };

    this.addSongToPlaylist = this.addSongToPlaylist.bind(this);
    this.getInfo = this.getInfo.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);
    this.changeShowValue = this.changeShowValue.bind(this);
  }

  convertToMilliseconds() {

  }

  displayEdit(playlist) {
    console.log("displayEdit pressed");
    console.log(playlist);
    let playlistToEdit = ReactDOM.findDOMNode(this.refs.plistForm);
    playlistToEdit.style.display = 'block';
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
  }

  removePlaylist() {
    Playlists.remove(this.props.playlist._id);
  }

  // used when PlaylistForm is closed from its own view.
  changeShowValue(val) {
    console.log("changeShowValue value:", val);
    this.setState({
      showForm: val,
      playlistToEdit: ''
    });
  }

  showPlaylistForm(props, evt) {
    console.log("showPlaylistForm with props", props);
    if (evt) {
      evt.preventDefault();
    }

    if (this.state.showForm === '') {
      this.setState({ 
        showForm: true,
        playlistToEdit: props 
      });
    } else {
      this.setState({
        showForm: !this.state.showForm
      });
    }
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
        <div>
          <li>
            <div className="playlist_title_container">
              <div className="playlist_title" ref="playlistTitle" onClick={this.toggleShowPlaylist.bind(this)}>
                <h3>{this.props.playlist.name}</h3>
              </div>
              <div className="edit_btn" onClick={this.showPlaylistForm.bind(this, this.props.playlist)}>Edit</div>          
            </div>

<<<<<<< HEAD
            <PlaylistForm ref="plistForm" changeShowValue={this.changeShowValue} showForm={this.state.showForm} playlistToEdit={this.props.playlist}/>
=======
            <PlaylistForm ref="plistForm" changeShowValue={this.changeShowValue} showForm={this.state.showForm} />
>>>>>>> 352aa79bed823efd6eb424ef7668a30a42b716b6

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

        </div>
    );
  }

}

Playlist.propTypes = {
  playlist: PropTypes.object.isRequired
}
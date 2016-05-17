import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import App from './App.jsx';
import Song from './Song.jsx';
import PlaylistForm from './PlaylistForm.jsx';

import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';
import { getYTDataFromVideo } from '../api/YTDataAPI.js';

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
    this.removePlaylist = this.removePlaylist.bind(this);
    this.changeShowValue = this.changeShowValue.bind(this);
  }

  convertToMilliseconds() {

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
      resolve(getYTDataFromVideo(videoId));
    }.bind(this)).then(function(info) {

      let songObj = info;

      Songs.insert(songObj, function(err, songID) {
        if (err) { console.log("ERROR in addSongToPlaylist(): " + err); }
        
        Playlists.update(this.props.playlist._id, {
          $push: { 
            songs: 
              {
                song_id: songID,
                videoId: songObj.videoId,
                title:  songObj.title,
                thumbnailSrc: songObj.thumbnailSrc,
                duration : songObj.duration
              }
          }
        });      

      }.bind(this));
    }.bind(this));

    ReactDOM.findDOMNode(this.refs.videoId).value = '';

  }

  loadPlaylist() {
    this.props.player.playlist = this.props.playlist.songs;
    this.props.player.currentIndex = 0;
    this.props.player.play();
  }

  removePlaylist() {
    Playlists.remove(this.props.playlist._id);
  }

  // used when PlaylistForm is closed from its own view.
  changeShowValue(val) {
    this.setState({
      showForm: val,
      playlistToEdit: ''
    });
  }

  showPlaylistForm(props, evt) {
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
      <li>
        <div className="playlist_title_container">
          <div className="playlist_title" ref="playlistTitle" onClick={this.toggleShowPlaylist.bind(this)}>
            <h3>{this.props.playlist.name}</h3>
          </div>
        </div>

        <PlaylistForm ref="plistForm" changeShowValue={this.changeShowValue} showForm={this.state.showForm} playlistToEdit={this.props.playlist} />

        <div ref="plistSongs" className="playlist_songs">
          <div className="playlist_options">
            <div className={"load_playlist_btn"} onClick={this.loadPlaylist.bind(this)}>Load Playlist</div>
            <div className={"edit_playlist_btn"} onClick={this.showPlaylistForm.bind(this, this.props.playlist)}>Edit</div>    
          </div>

          <Song songs={this.props.playlist.songs} player={this.props.player} playlist={this.props.playlist}/>
        </div>
      </li>

    );
  }

}

Playlist.propTypes = {
  playlist: PropTypes.object.isRequired
}
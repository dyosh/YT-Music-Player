import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';

import { getYTDataFromVideo } from '../api/YTDataAPI.js';

require('../static/css/playlistForm.css');

export default class PlaylistForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      songInFormCounter: 1,
    }

    this.addPlaylist = this.addPlaylist.bind(this);
    this.addSongFieldToForm = this.addSongFieldToForm.bind(this);
    this.removeSongFromAddSongField = this.removeSongFromAddSongField.bind(this);
  }

  addPlaylist(evt) {
    evt.preventDefault();

    const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    
    // TODO(Dan): Add code to ensure no duplicate title names exist before 
    // creating a new playlist.
    if (name === '') { 
      console.log("playlist name cannot be empty");
    } else {
      let videoIds = [];
      for (let i = 0; i < this.state.songInFormCounter; i++) {
        let videoId = document.getElementById('song'+i).value;
        videoIds.push(videoId);
      }

      let playlistId = '';
     
      let createPlaylist = new Promise(function(resolve, reject) {
        resolve(Playlists.insert({name: name}, function(err, _id) {
          return(_id)
        }));
      }).then(function(playlistID) {
        playlistId = playlistID;
        return Promise.all(videoIds.map(function(id) {
          return getYTDataFromVideo(id);
        }));
      }).then(function(songArr) {
        console.log("!!!!!!!!!!!!songArr", songArr);
        return Promise.all(songArr.map(function(songObj) {
          return new Promise(function(resolve, reject) {
            resolve(Songs.insert(songObj, function(err, songID) {
              if (err) { console.log("ERROR in addSongToPlaylist(): " + err); }
              songObj.song_id = songID;
              console.log(songObj);
            }));
          })
        }));
      }).then(function(completedSongObj) {
        console.log("!!!!!!!!!!!!COMPLETEDSONGOBJ", completedSongObj);
      });

      // TODO(Dan): after insert the callback function is automatically being returned.
      // for example Songs.insert(_, function(err, songId) {}) auto returns songId.
      // need to figure out whats up with this.


    }
    // Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';    
  }

  addSongFieldToForm(evt) {
    evt.preventDefault();
    this.setState({
      songInFormCounter: this.state.songInFormCounter + 1
    });
  }

  removeSongFromAddSongField(evt) {
    evt.preventDefault();
    this.setState({
      songInFormCounter: this.state.songInFormCounter - 1
    });
  }

  render() {
    // TODO(Dan): not sure if this is the most efficient way to do this in React.
    let songsInForm = [];
    for (let i = 0; i < this.state.songInFormCounter; i++) {
      songsInForm.push((<input id={"song"+i} placeholder="Enter videoId" />));
    }

    return (
      <div className="playlistFormContainer">
        <form onSubmit={this.addPlaylist.bind(this)} >
          <input 
            type="text"
            ref="name"
            placeholder="Enter name of playlist"
          />
          {songsInForm}
          <button onClick={this.addSongFieldToForm}>Add Another Song</button>
          <input type="submit" value="Add Playlist" />
        </form>
      </div>
    );
  }
}
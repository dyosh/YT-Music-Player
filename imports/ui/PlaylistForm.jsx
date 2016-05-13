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
      songsInForm: [
        {
          id: 0,
          html: (
              <div key={0}>
                <input id="song0" placeholder="Enter videoId" />
                <button onClick={this.removeSongFromAddSongField.bind(this, 0)}> X </button>
              </div>
          )
        }
      ],
    } 

    this.addPlaylist = this.addPlaylist.bind(this);
    this.addSongFieldToForm = this.addSongFieldToForm.bind(this);
    this.removeSongFromAddSongField = this.removeSongFromAddSongField.bind(this);
  }

  // showForm from Header.jsx. Resets the form after PlaylistForm is closed.
  componentWillReceiveProps(props) {
    if (!this.props.showForm) {
      this.state.songsInForm.length = 1;
    }
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
      let numID = 0;
      for (let i = 0; i < this.state.songsInForm.length; i++) {
        let id = this.state.songsInForm[i].id;
        let videoId = document.getElementById('song' + id).value;
        videoIds.push(videoId);
        document.getElementById('song' + id).value = '';
      }

      // after videoIds are loaded into the array, make the songsInForm show only 1 input
      this.state.songsInForm.length = 1;

      let playlistID = '';
     
      let createPlaylist = new Promise(function(resolve, reject) {
        resolve(Playlists.insert({name: name}, function(err, _id) {
          return(_id)
        }));
      }).then(function(_id) {
        playlistID = _id;
        return Promise.all(videoIds.map(function(id) {
          return getYTDataFromVideo(id);
        }));
      }).then(function(songArr) {
        return Promise.all(songArr.map(function(songObj) {
          return new Promise(function(resolve, reject) {
            resolve(Songs.insert(songObj, function(err, songID) {
              if (err) { console.log("ERROR in addSongToPlaylist(): " + err); }
            }));
          }).then(function(songID) {
              songObj.song_id = songID;
              return songObj;
          });
        }));
      }).then(function(completedSongObj) {
        Playlists.update(playlistID, {
          $push: { songs: { $each: completedSongObj } }
        });

      });

    }
    // Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';  

    // hide PlaylistForm after submitting. 
    // TODO(Dan): this feels like a strange way to do 2 way data binding or essentially
    // state inheritence. Find a less confusing way to do this.
    this.props.extendHeader.showPlaylistForm(evt);
  }

  addSongFieldToForm(evt) {
    evt.preventDefault();

    let songInput = this.state.songsInForm;
    songInput.push({
      id: this.state.songInFormCounter,
      html: (
      <div key={this.state.songInFormCounter}>
        <input id={"song" + (this.state.songInFormCounter)} placeholder="Enter videoId" />
        <button onClick={this.removeSongFromAddSongField.bind(this, this.state.songInFormCounter)}> X </button>
      </div>
    )});

    this.setState({
      songInFormCounter: this.state.songInFormCounter + 1,
      songsInForm: songInput
    });
  }

  removeSongFromAddSongField(id, evt) {
    evt.preventDefault();

    let songFields = this.state.songsInForm;
    for (let i = 0; i < this.state.songsInForm.length; i++) {
      if (this.state.songsInForm[i].id === id) {
        songFields.splice(i, 1);
        break;
      }
    }

    this.setState({
      songsInForm: songFields
    });

  }

  render() {
    let songInputs = [];
    for (songForm of this.state.songsInForm){
      songInputs.push(songForm.html);
    }

    return (
      <div className="playlistFormContainer">
        <h1>Create Playlist</h1>
        <form onSubmit={this.addPlaylist.bind(this)} >
          <input 
            type="text"
            ref="name"
            placeholder="Enter name of playlist"
          />
          {songInputs}
          <button onClick={this.addSongFieldToForm}>Add Another Song</button>
          <button type="submit">Add Playlist</button>
        </form>
      </div>
    );
  }
}
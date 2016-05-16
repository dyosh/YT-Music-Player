import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Song from './Song.jsx';

import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';

import { getYTDataFromVideo } from '../api/YTDataAPI.js';

require('../static/css/playlistForm.css');

export default class PlaylistForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistToEdit: '',
      showForm: false,
      songInFormCounter: 1,
      songsInForm: [{
        id: 0,
        html: (
          <div key={0}>
            <input id={"song0"} placeholder="Enter videoId" />
            <button onClick={this.removeSongFromAddSongField.bind(this, 0)}> X </button>
          </div>
        )
      }],
    }

    this.addPlaylist = this.addPlaylist.bind(this);
    this.addSongFieldToForm = this.addSongFieldToForm.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.displayExistingPlaylistForm = this.displayExistingPlaylistForm.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.removeSongFromAddSongField = this.removeSongFromAddSongField.bind(this);
    this.toggleShowPlaylistForm = this.toggleShowPlaylistForm.bind(this);

    this.updateExistingPlaylist = this.updateExistingPlaylist.bind(this);
    this.removePlaylist = this.removePlaylist.bind(this);

  }

  // showForm from Header.jsx. Resets the form after PlaylistForm is closed.
  componentWillReceiveProps(props) {
    // this.props.showForm !== this.state.showForm added to prevent updates when any other prop gets updated.
    if (props.showForm === false && props.showForm === !this.state.showForm) {
      this.toggleShowPlaylistForm();
      this.resetForm();
    } 
    else if (props.showForm === true && props.showForm === !this.state.showForm) {
      if (props.playlistToEdit !== undefined) {
        this.resetForm();
        this.displayExistingPlaylistForm(props.playlistToEdit);
        this.toggleShowPlaylistForm();
      } else {
        this.toggleShowPlaylistForm();

        // this.resetForm() added here to fix issue when edit button on playlist list item clicked. 
        // the brought up form rendered properly but the value of the first songForm input was not
        // working, it was always null despite text being inside the input. resettin here somehow fixes this.
        // it worked with the header though, there must be some issue with the key value or something?
        // TODO(dan): At some point figure out wtf is going on here and do a proper fix.
        this.resetForm();
      }
    } 
  }

  addPlaylist(evt) {
    evt.preventDefault();
    const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    

    // TODO(Dan): Add code to ensure no duplicate title names exist before 
    // creating a new playlist.
    if (name === '') { 
      console.log("playlist name cannot be empty");
      this.resetForm();
    } else {
      let videoIds = [];
      let numID = 0;
      for (let i = 0; i < this.state.songsInForm.length; i++) {
        let id = this.state.songsInForm[i].id;
        let videoId = document.getElementById('song' + id).value.trim();

        if (videoId !== '') {
          videoIds.push(videoId);
        }
      }
      // after videoIds are loaded into the array, make the songsInForm show only 1 input
      this.resetForm();

      if (this.props.playlistToEdit !== undefined) {
        this.updateExistingPlaylist(name, videoIds, this.props.playlistToEdit);
      } else {
        this.createNewPlaylist(name, videoIds);
      }
      
    }
    // Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';  

    // hide PlaylistForm after submitting. 
    this.toggleShowPlaylistForm();
  }

  addSongFieldToForm(evt) {
    if (evt) {
      evt.preventDefault();
    }

    let songInput = this.state.songsInForm;
    songInput.push({
      id: this.state.songInFormCounter,
      html: (
      <div key={this.state.songInFormCounter}>
        <input id={"song" + this.state.songInFormCounter} placeholder="Enter videoId" />
        <button onClick={this.removeSongFromAddSongField.bind(this, this.state.songInFormCounter)}> X </button>
      </div>
    )});

    this.setState({
      songInFormCounter: this.state.songInFormCounter + 1,
      songsInForm: songInput
    });
  }

  createNewPlaylist(name, videoIds) {
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

  resetForm() {
    this.setState({ songsInForm: [] }, () => {
      this.addSongFieldToForm();
    })
  }

  toggleShowPlaylistForm(evt) {
    if (evt) {
      evt.preventDefault();
    }

    this.setState({ showForm: !this.state.showForm }, () => {
      let playlistForm = ReactDOM.findDOMNode(this.refs.playlistForm);
      if (this.state.showForm) {
        playlistForm.style.display = 'block';
      } else {
        this.props.changeShowValue(false);
        playlistForm.style.display = 'none';
        this.resetForm();
      }
    });
  }


  /*************************************************************************************
  /                                EXISTING PLAYLIST                                   *
  *************************************************************************************/
  displayExistingPlaylistForm(playlistToEdit) {
    ReactDOM.findDOMNode(this.refs.name).value = playlistToEdit.name;

    this.setState({
      playlistToEdit: playlistToEdit
    });
  }

  updateExistingPlaylist(updatedName, videoIds, playlist) {
    let createPlaylist = new Promise(function(resolve, reject) {
      resolve();
    }).then(function() {
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
      Playlists.update(playlist._id, {
        $set : { name: updatedName },
        $push: { songs: { $each: completedSongObj } }
      });
    });

  }

  removePlaylist() {
    Playlist.remove(this.props.playlistToEdit._id);
  } 

  render() {
    let songInputs = [];
    for (songForm of this.state.songsInForm){
      songInputs.push(songForm.html);
    }

    return (
      <div ref="playlistForm" className="playlistFormContainer">
        <div className="playlistCancelBtn" onClick={this.toggleShowPlaylistForm}> X </div>
        <h1>Create Playlist</h1>
        <form onSubmit={this.addPlaylist.bind(this)} >
          <input 
            type="text"
            ref="name"
            placeholder="Enter name of playlist"
          />

          <ul>
            <Song songs={this.state.playlistToEdit.songs} playlist={this.state.playlistToEdit}/>
          </ul>

          {songInputs}

          <button onClick={this.addSongFieldToForm}>Add Another Song</button>
          <button type="submit">Add Playlist</button>
        </form>
      </div>
    );
  }
}
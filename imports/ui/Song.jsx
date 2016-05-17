import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Playlists } from '../api/playlists.js';
import { Songs } from '../api/songs.js';

require('../static/css/song.css');

export default class Song extends Component {
  playlistSongClicked(i, evt) { 
    if (this.props.player) {
      this.props.player.currentIndex = i;
      this.props.player.playlist = this.props.playlist.songs;
      this.props.player.play();
    }
  }

  removeSongFromPlaylist(song, evt) {  
    if (evt) {
      evt.preventDefault();
    }

    Songs.remove(song.song_id);

    Playlists.update(
      {'_id': this.props.playlist._id}, 
      { $pull: { "songs" : { song_id: song.song_id}}}
    );  
  }

  renderSongs() {
    let songs = this.props.songs;

    if (songs === undefined) {
      return
    } else {
      if (this.props.editable === 'true') {
        return songs.map((song, i) => {
          return (
            <li key={i} onClick={this.playlistSongClicked.bind(this, i)} className="form_song_in_playlist">
              <div className="form_song_title">
                {song.title.substr(0,30) + " ..."}
              </div>
              <div className="rm_song_btn" onClick={this.removeSongFromPlaylist.bind(this, song)} >
                DELETE
              </div>
            </li>
          );
        }); 
      } else {
        return songs.map((song, i) => {
          let minutes = '--';
          let seconds = '--';

          if (!isNaN(song.duration)) {
            minutes = parseInt(song.duration / 60);
            seconds = song.duration - (minutes * 60);
          }

          return (
            <li key={i} onClick={this.playlistSongClicked.bind(this, i)} className="song_in_playlist">
              <span className="songTitle">
                {song.title.substr(0,30) + " ..."}
              </span>
              <span className="songDuration">
                { minutes + ":" + seconds }
              </span>
            </li>
          );
        });              
      }

    }
  }

  render() {
    return (
      <ul>
        {this.renderSongs()}
      </ul>
    );
  }
}

Song.propTypes = {
  songs: PropTypes.array.isRequired,
}
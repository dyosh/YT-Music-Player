import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Playlists } from '../api/playlists.js';

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
      return songs.map((song, i) => (
        <div className="song_in_playlist">
          <li key={i} onClick={this.playlistSongClicked.bind(this, i)}>
            {song.title}
            {song.duration}
            <button onClick={this.removeSongFromPlaylist.bind(this, song)}>Remove Song</button>
          </li>
        </div>
      ));
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
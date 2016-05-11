import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
// import { createContainer } from 'meteor/react-meteor-data';

import { Playlists } from '../api/playlists.js';

require('../static/css/playlistForm.css');

export default class PlaylistForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      songsInForm: [(
        <input type="text" placeholder="Testerino"></input>
      )],
      songInFormCounter: 1,
    }

    this.songFormCounter = 0;

    this.addPlaylist = this.addPlaylist.bind(this);
    this.addSongFieldToForm = this.addSongFieldToForm.bind(this);
    this.removeSongFromAddSongField = this.removeSongFromAddSongField.bind(this);
  }

  addPlaylist(event) {
    event.preventDefault();

    const name = ReactDOM.findDOMNode(this.refs.name).value.trim();
    
    let songs = [];

    // TODO(Dan): Add code to ensure no duplicate title names exist before 
    // creating a new playlist.
    if (name === '') { 
      console.log("playlist name cannot be empty");
    } else {
      Playlists.insert({
        name: name,
      });
    }
    // Clear form
    ReactDOM.findDOMNode(this.refs.name).value = '';    
  }

  addSongFieldToForm(evt) {
    evt.preventDefault();

    let songRefNum = this.state.songInFormCounter++;
    this.state.songsInForm.push((<input ref={"song"+songRefNum} placeholder="testerino"></input>));
    

    this.setState({
      songsInForm: this.state.songsInForm,
    });

    console.log(this.state.songsInForm);


    // this.setState({
    //   test: this.state.test.push(<input placeholder="testerino"></input>)
    // });


    // let span = document.createElement('span');
    // let input = document.createElement('INPUT');
    // let remove = document.createElement('button');

    // input.setAttribute('type', 'text');
    // input.setAttribute('placeholder', 'Enter videoId');

    // this.songFormCounter += 1;
    // input.setAttribute('Name', 'song_' + this.songFormCounter);

    // remove.innerHTML = 'remove';

    // span.appendChild(input);
    // remove.setAttribute('onClick', this.removeSongFromAddSongField.bind(this));
    // span.appendChild(remove);
    // span.setAttribute('id', 'id_' + this.songFormCounter);

    // let test = React.createElement('li', null, 'something');

    // ReactDOM.render(test, document.getElementById('myForm'));

    // document.getElementById('myForm').appendChild(test);
  }

  removeSongFromAddSongField(evt) {
    evt.preventDefault();
    console.log("removeSongFromAddSongField called");
  }

  render() {
    let songsInForm = this.state.test;

    return (
      <div className="playlistFormContainer">
        <form onSubmit={this.addPlaylist.bind(this)} >
          <input 
            type="text"
            ref="name"
            placeholder="Enter name of playlist"
          />
          <input
            type="text"
            ref="song1"
            placeholder="Enter videoId"
          />
          <span id="myForm"></span>
          {songsInForm}
          <button onClick={this.addSongFieldToForm}>Add Another Song</button>
          <input type="submit" value="Add Playlist" />
        </form>
      </div>
    );
  }
}

// PlaylistForm.propTypes = {
//   playlist: PropTypes.object,
// }

// export default createContainer(() => {
//   return {
//     playlists: Playlists.find({}).fetch(),
//   };
// }, PlaylistForm);
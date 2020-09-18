import React, { Component } from 'react';
import './App.css';
import Visual from './Visual/Visual';
import Menu from './Menu/Menu';


export default class App extends Component {
	constructor(props) {
		super(props);

		this._onItemDownToMove = this._onItemDownToMove.bind(this);
	}

	_onItemDownToMove(e, key, item) {
		this.refs.visual.createVertex(e, key, item);
	}

    render() {
        return (
          <div className="app">
			  <div id="visual" className="app-visual">
				  <Visual ref="visual"/>
			  </div>
			  <div className="app-menu">
				  <Menu onItemDownToMove={this._onItemDownToMove}/>
			  </div>
          </div>
        );
    }
}
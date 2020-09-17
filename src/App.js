import React, { Component } from 'react';
import './App.css';
import Vertex from './Vertex/Vertex';
import Menu from './Menu/Menu';


export default class App extends Component {
    render() {
        return (
          <div className="app">
			  <div id="visual" className="app-visual">
				  <Vertex coors={[100, 100]}/>
			  </div>
			  <div className="app-menu">
				  <Menu/>
			  </div>
          </div>
        );
    }
}
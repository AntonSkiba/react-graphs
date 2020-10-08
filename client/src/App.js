import React from 'react';
import RootComponent from './RootComponent';
import './App.css';

import Creator from './Creator/Creator';
import Landscape from './Landscape/Landscape';

export default class App extends RootComponent {
    constructor(props) {
        super(props);

        this.state = {
            showLandscape: true,
            project: '123'
        };

        this._onRender = this._onRender.bind(this);
    }

    _onRender(project) {
        this.setState({
            project,
            showLandscape: true,
        });
    }
	
    render() {
        return (
            <div className="app">
                {this.state.showLandscape 
                ? <Landscape
                    project={this.state.project}/> 
                : <Creator 
                    onRender={this._onRender}/>}
				
            </div>
        );
    }
}
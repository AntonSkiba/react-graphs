import React from 'react';
import RootComponent from './RootComponent';
import './App.css';

import Creator from './Creator/Creator';
import Landscape from './Landscape/Landscape';

export default class App extends RootComponent {
    constructor(props) {
        super(props);

        this.state = {
            showLandscape: false,
            loader: true,
            project: {}
        };

        this._onRender = this._onRender.bind(this);
        // this._onLandscapeCalculated = this._onLandscapeCalculated.bind(this);
    }

    _onRender(project) {
        this.setState({
            project,
            showLandscape: true,
        });
    }

    _onLandscapeCalculated() {
        // this.setState({
        //     loader: false
        // })
    }
	
    render() {
        return (
            <div className="app">
                {this.state.showLandscape 
                ? <Landscape
                    project={this.state.project}
                    onLandscapeCalculated={this._onLandscapeCalculated}/> 
                : <Creator 
                    onRender={this._onRender}/>}
				
            </div>
        );
    }
}
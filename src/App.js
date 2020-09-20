import React from 'react';
import RootComponent from './RootComponent';
import './App.css';
import Visual from './Visual/Visual';
import Menu from './Menu/Menu';


export default class App extends RootComponent {
	constructor(props) {
		super(props);

		this._onItemDownToMove = this._onItemDownToMove.bind(this);
		this._onChangeZone = this._onChangeZone.bind(this);
		this._onReturnVertex = this._onReturnVertex.bind(this);

	}

	_onItemDownToMove(e, key, item) {
		this._onChangeZone(true);
		this._children.visual.createVertex(e, key, item);
	}

	_onChangeZone(isMenu) {
		this._children.menu.changeZone(isMenu);
	}
	_onReturnVertex(e, key, item) {
		this._children.menu.createVertex(e, key, item);
	}

    render() {
        return (
            <div className="app">
				<div className="app-header">
				</div>
				<div className="app-content">
					<div id="visual" className="app-visual">
						<Visual
							ref={this._setChildren.bind(this, 'visual')}
							onChangeZone={this._onChangeZone}
							onReturnVertex={this._onReturnVertex}/>
					</div>
					<div className="app-menu">
						<Menu ref={this._setChildren.bind(this, 'menu')} onItemDownToMove={this._onItemDownToMove}/>
					</div>
				</div>
            </div>
        );
    }
}
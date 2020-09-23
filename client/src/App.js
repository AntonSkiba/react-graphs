import React from 'react';
import RootComponent from './RootComponent';
import './App.css';

import Visual from './Visual/Visual';
import Menu from './Menu/Menu';
import Header from './Header/Header';


export default class App extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			projects: []
		}

		this._onItemDownToMove = this._onItemDownToMove.bind(this);
		this._onChangeZone = this._onChangeZone.bind(this);
		this._onReturnVertex = this._onReturnVertex.bind(this);
		this._onSave = this._onSave.bind(this);
		this._loadApp = this._loadApp.bind(this);
		this._createApp = this._createApp.bind(this);
		this._onStateChange = this._onStateChange.bind(this);
	}

	componentDidMount() {
		fetch('/projects', {
			method: 'GET'
		})
		.then(res => {
			return res.json();
		})
		.then(projects => {
			this.setState({
				projects
			});
		});
	}

	_onItemDownToMove(e, key, item) {
		this._onChangeZone(true);
		this._children.visual.createVertex(e, key, item);
	}

	_loadApp(name) {
		fetch(`/load/${name}`, {
			method: 'GET',
		})
		.then(res => res.json())
		.then(res => {
			console.log(res.message);
			if (res.project) {
				this._children.visual.updateData(res.project.visual);
				this._children.menu.updateData(res.project.menu);
				this._children.header.setName(name);
			}
		});
	}

	_createApp() {
		this._children.visual.updateData();
		this._children.menu.updateData();
		this._children.header.setName('');
	}

	_onChangeZone(isMenu) {
		this._children.menu.changeZone(isMenu);
	}

	_onStateChange() {
		this._children.header.setWarningIcon(true);
	}

	_onReturnVertex(e, key, item) {
		this._children.menu.createVertex(e, key, item);
	}

	// Ну теперь все в бэк сохраняется, кто же знал что у куки максимальный объем 4096b
	// Правда сейчас записываю в json и ограничение вроде бы для fs на сервере 100мб *facepalm*
	// бд точно не буду подключать
	_onSave(e, name) {
		const project = {
			visual: this._children.visual.getData(),
			menu: this._children.menu.getData()
		}

		fetch('/save', {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({name, project})
		})
		.then(res => res.json())
		.then(res => {
			console.log(res.message);
			if (res.projects) {
				this._children.header.setWarningIcon(false);
				this.setState({
					projects: res.projects
				});
			}
		});
	}
	
    render() {
        return (
            <div className="app">
				<div className="app-header">
					<Header
						ref={this._setChildren.bind(this, 'header')}
						onSave={this._onSave}
						onLoadApp={this._loadApp}
						onCreateApp={this._createApp}
						projects={this.state.projects}/>
				</div>
				<div id="visual" className="app-visual">
					<Visual
						ref={this._setChildren.bind(this, 'visual')}
						onChangeZone={this._onChangeZone}
						onStateChange={this._onStateChange}
						onReturnVertex={this._onReturnVertex}/>
				</div>
				<div className="app-menu">
					<Menu
						onStateChange={this._onStateChange}
						ref={this._setChildren.bind(this, 'menu')}
						onItemDownToMove={this._onItemDownToMove}/>
				</div>
            </div>
        );
    }
}
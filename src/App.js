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
			saved: JSON.parse(document.cookie.split('saved=')[1]?.split(';')[0] || '{}')
		}

		this._onItemDownToMove = this._onItemDownToMove.bind(this);
		this._onChangeZone = this._onChangeZone.bind(this);
		this._onReturnVertex = this._onReturnVertex.bind(this);
		this._onSave = this._onSave.bind(this);
		this._loadApp = this._loadApp.bind(this);
		this._createApp = this._createApp.bind(this);
		this._onStateChange = this._onStateChange.bind(this);
	}

	_onItemDownToMove(e, key, item) {
		this._onChangeZone(true);
		this._children.visual.createVertex(e, key, item);
	}

	_loadApp(name) {
		if (this.state.saved[name]) {
			// глубокое копирование объекта
			let savedObj = JSON.parse(JSON.stringify(this.state.saved[name]));
			this._children.visual.updateData(savedObj.visual);
			this._children.menu.updateData(savedObj.menu);
			this._children.header.setName(name);

			this._children.header.setWarningIcon(false);
		} else {
			alert(`Файл: ${name} не найден`);
		}
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

	// Сохраняем из приложения в куки, потому что мне стало лень 
	// прикручивать бэк для тестового приложения \о/
	_onSave(e, name) {
		const saveObj = {
			visual: this._children.visual.getData(),
			menu: this._children.menu.getData()
		}

		this._children.header.setWarningIcon(false);

		// Добавляем новый объект в saved
		this.setState({
			saved: Object.assign(this.state.saved, {
				[name]: JSON.parse(JSON.stringify(saveObj))
			})
		});

		this._setCookie(this.state.saved);
	}

	_setCookie(saved) {
		document.cookie = `saved=${JSON.stringify(saved)}; expires=Fri, 1 Jan 2100 00:00:00 GMT`;
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
						projects={Object.keys(this.state.saved)}/>
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
import React from 'react';
import RootComponent from '../RootComponent';
import './Creator.css';

import Visual from './Visual/Visual';
import Menu from './Menu/Menu';
import Header from '../Header/Header';
import Loader from '../Components/Loader/Loader';
import Button from '../Components/Button/Button';
import CustomInput from '../Components/CustomInput/CustomInput';
import Selector from '../Components/Selector/Selector';


export default class Creator extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			loader: false,
			isUnsaved: true
		}

		this.loadedProjectName = ''
		this._onItemDownToMove = this._onItemDownToMove.bind(this);
		this._onChangeZone = this._onChangeZone.bind(this);
		this._onReturnVertex = this._onReturnVertex.bind(this);
		this._onSave = this._onSave.bind(this);
		this._inputName = this._inputName.bind(this);
		this._onRender = this._onRender.bind(this);
		this._loadApp = this._loadApp.bind(this);
		this._createApp = this._createApp.bind(this);
		this._onStateChange = this._onStateChange.bind(this);
	}

	_onItemDownToMove(e, key, item) {
		this._onChangeZone(true);
		this._children.visual.createVertex(e, key, item);
	}

	_loadApp(name) {
		// Покажем лоадер только через 100мс, если не успеет загрузится, чтобы постоянно не моргало
		const loaderTimeout = setTimeout(() => {
			this.setState({loader: true});
		}, 100);
		
		fetch(`/load/${name}`, {
			method: 'GET',
		})
		.then(res => res.json())
		.then(res => {
			if (res.error) {
				console.error(res.error);
			} else {
				console.log(res.message);
				this._children.visual.updateData(res.project.visual);
				this._children.menu.updateData(res.project.menu);
				this._children.filenameInput.setValue(name);
				this.setState({
					isUnsaved: false
				});
				this.loadedProjectName = name;
			}
			clearTimeout(loaderTimeout);
			this.setState({loader: false});
		});
	}

	_createApp() {
		this._children.visual.updateData();
		this._children.menu.updateData();
		this._children.filenameInput.setValue('');
		this.setState({
			isUnsaved: true
		});
	}

	_onChangeZone(isMenu) {
		this._children.menu.changeZone(isMenu);
	}

	_onStateChange() {
		this.setState({
			isUnsaved: true
		});
	}

	_onReturnVertex(e, key, item) {
		this._children.menu.createVertex(e, key, item);
	}

	// Ну теперь все в бэк сохраняется, кто же знал что у куки максимальный объем 4096b
	// Правда сейчас записываю в json и ограничение вроде бы для fs на сервере 100мб *facepalm*
	// бд точно не буду подключать
	_onSave() {
		const name = this._children.filenameInput.getValue();
		if (name) {
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
				if (res.error) {
					console.error(res.error);
				} else {
					console.log(res.message);
					this.setState({
						isUnsaved: false
					});
					this._children.list.update();
					this._children.list.setSelected(name);
				}
			});
		}
	}

	_inputName() {
		// При изменении имени файла сбрасываем выбранное значение
		this._children.list.clearSelect();

		this.setState({
			isUnsaved: true
		});
	}

	_onRender() {
		this._notify('render', this.loadedProjectName);
	}
	
    render() {
		const warningIcon = this.state.isUnsaved
			? <div className="app-icon app-error" title="Save your changes">✎</div>
			: <div className="app-icon app-success"  title="All saved">✔</div>

        return (
            <div className="creator">
				{this.state.loader && <Loader />}
				<Header>
					{warningIcon}
					<Button onClick={this._onSave} className="creator-header__button">Save</Button>
					<div>as</div>
					<CustomInput
						ref={this._setChildren.bind(this, 'filenameInput')}
						size="10"
						validators={[
							(value) => value ? true : 'please enter name',
						]}
						onChange={this._inputName}/>

					<Selector
						ref={this._setChildren.bind(this, 'list')}
						listMethod="projects/list"
						deleteMethod="projects/delete"
						selectTitle="Open project"
						deleteTitle="Delete project"
						showAddItem={true}
						addNewName="+ Project"
						addNewTitle="Add new project"
						selected="+ Project"
						onItemChanged={this._loadApp}
						onCreate={this._createApp}/>

					<Button onClick={this._onRender} className="creator-header__button">Render</Button>
					</Header>
				<div id="visual" className="creator-visual">
					<Visual
						ref={this._setChildren.bind(this, 'visual')}
						onChangeZone={this._onChangeZone}
						onStateChange={this._onStateChange}
						onReturnVertex={this._onReturnVertex}/>
				</div>
				<div className="creator-menu">
					<Menu
						onStateChange={this._onStateChange}
						ref={this._setChildren.bind(this, 'menu')}
						onItemDownToMove={this._onItemDownToMove}/>
				</div>
            </div>
        );
    }
}
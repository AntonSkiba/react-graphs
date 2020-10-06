import React from 'react';
import RootComponent from '../../RootComponent';
import './Menu.css';

import Button from '../../Components/Button/Button';
import MenuVertexItem from './MenuVertexItem/MenuVertexItem';

export default class Menu extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			vertices: {},
			isHover: false
		}

		this.createVertex = this.createVertex.bind(this);
		this.getData = this.getData.bind(this);
		this.updateData = this.updateData.bind(this);
	}

	createVertex(e, key, vertex) {
		// Если пришел ключ, значит возвращаем старый компонент, иначе
		// создаем новый пустой объект, под уникальным ключом
		// для того, чтобы сработала проверка на рендере
		this.setState({
			vertices: Object.assign({
				[key || this._generateUID()]: vertex || {}
			}, this.state.vertices),
			isHover: false
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	// Метод возвращает данные о вершинах из меню
	getData() {
		return {
			vertices: this.state.vertices,
		}
	}

	updateData(data) {
		if (data) {
			this.setState({
				vertices: data.vertices
			});
		} else {
			this.setState({
				vertices: {}
			});
		}
	}

	_onSave(key, e, vertex) {
		this.setState({
			vertices: Object.assign(this.state.vertices, {
				[key]: vertex
			})
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	_onRemove(key) {
		this.setState(prevState => {
			delete prevState.vertices[key];
			return { vertices: Object.assign({}, prevState.vertices)}
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	// публичный метод, подсвечивает меню, если на него направлен элемент
	changeZone(isMenu) {
		this.setState({
			isHover: isMenu
		});
	}

	_onDownToMove(key, e) {
		this._notify('itemDownToMove', e, key, this.state.vertices[key]);
	}

	render() {
		const listItems = Object.keys(this.state.vertices).map((key) => {
			// рендерим только, если в вершинах есть значение по ключу
			if (this.state.vertices[key]) {
				return (
					<MenuVertexItem
						vertex={this.state.vertices[key]}
						onSave={this._onSave.bind(this, key)}
						onRemove={this._onRemove.bind(this, key)}
						onStateChange={this._notify.bind(this, 'stateChange')}
						onDownToMove={this._onDownToMove.bind(this, key)}
						key={key}/>
				)
			}
		});

		return (
			<div className={"menu" + (this.state.isHover ? " menu-hover" : "")} id="menu">
				<Button onClick={this.createVertex}>+ New vertex</Button>
				<div className="menu-list">
					{listItems}
				</div>
			</div>
		);
	}
}

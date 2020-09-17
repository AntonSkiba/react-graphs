import React, { Component } from 'react';
import './Menu.css';

import Button from './Button/Button';
import MenuVertexItem from './MenuVertexItem/MenuVertexItem';

const __generateUID = () => {
	let text = "";
  	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export default class Menu extends Component {
	constructor(props) {
		super(props);

		this.state = {
			vertices: {}
		}

		this._createVertex = this._createVertex.bind(this);
	}

	_createVertex() {
		// Создаем новый пустой объект, под уникальным ключом
		// для того, чтобы сработала проверка на рендере
		this.setState({
			vertices: Object.assign({
				[__generateUID()]: {}
			}, this.state.vertices)
		});
	}

	_onSave(key, e, vertex) {
		this.state.vertices[key] = vertex;
	}

	_onRemove(key) {
		this.setState(prevState => {
			delete prevState.vertices[key];
			return { vertices: Object.assign({}, prevState.vertices)}
		});
	}

	render() {
		const listItems = Object.keys(this.state.vertices).map((key) => {
			// рендерим только, если в вершинах есть значение по ключу
			if (this.state.vertices[key]) {
				return (
					<MenuVertexItem 
						onSave={this._onSave.bind(this, key)} 
						onRemove={this._onRemove.bind(this, key)}
						key={key}/>
				)
			}
		});

		return (
			<div className="menu">
				<Button onClick={this._createVertex}>+ New vertex</Button>
				<div className="menu-list">
					{listItems}
				</div>
			</div>
		);
	}
}

import React from 'react';
import RootComponent from '../RootComponent';
import './Visual.css';

import Vertex from './Vertex/Vertex'

export default class Visual extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			vertices: {}
		}

		this.createVertex = this.createVertex.bind(this);
	}

	// Публичный метод, вызывается из App.js, когда перемещаем новую вершину из меню
	createVertex(e, key, vertex) {
		e = e || window.event;
		this.setState({
			vertices: Object.assign({
				[key]: {
					...vertex,
					coors: [e.clientX - 25, e.clientY - 10]
				}
			}, this.state.vertices)
		});
	}

	remove(key) {
		this.setState(prevState => {
			delete prevState.vertices[key];
			return { vertices: Object.assign({}, prevState.vertices)}
		});
	}

	_onReturnVertex(key, e, vertex) {
		this._notify('returnVertex', e, key, vertex)
	}

	render() {
		const visualVertices = Object.keys(this.state.vertices).map((key) =>
			<Vertex 
				id={key}
				key={key}
				onRemove={this.remove.bind(this, key)}
				onReturnVertex={this._onReturnVertex.bind(this, key)}
				onChangeZone={this._notify.bind(this, 'changeZone')}
				coors={this.state.vertices[key].coors}
				name={this.state.vertices[key].name}/>
		);
		return (
			<div className="visual">
				{visualVertices}
			</div>
		);
	}
}

import React, { Component } from 'react';
import './Visual.css';

import Vertex from './Vertex/Vertex'

export default class Visual extends Component {
	constructor(props) {
		super(props);

		this.state = {
			vertices: {}
		}

		this.createVertex = this.createVertex.bind(this);
	}

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

	render() {
		const visualVertices = Object.keys(this.state.vertices).map((key) =>
			<Vertex 
				id={key} 
				key={key} 
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

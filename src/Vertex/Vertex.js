import React, { Component } from 'react';
import './Vertex.css';

export default class Vertex extends Component {
	constructor(props) {
		super(props);

		this.state = {
			id: props.id,
			coors: props.coors,
			_startCoors: props.coors,
		}

		this._dragMouseDown = this._dragMouseDown.bind(this);
		this._elementDrag = this._elementDrag.bind(this);
		this._dragMouseUp = this._dragMouseUp.bind(this);
	}

	_dragMouseDown() {
		document.addEventListener('mouseup', this._dragMouseUp);
		document.addEventListener('mousemove', this._elementDrag)
	}

	_elementDrag(e) {
		e = e || window.event;
		if (e.clientX < window.innerWidth - 25
		 && e.clientY < window.innerHeight - 80
		 && e.clientX > 25 && e.clientY > 0) {
			this.setState({
				coors: [e.clientX - 50, e.clientY - 10]
			});
		}
	}

	_dragMouseUp() {
		document.removeEventListener('mouseup', this._dragMouseUp);
		document.removeEventListener('mousemove', this._elementDrag)
	}

	render() {
		return (
			<div 
				className="vertex" 
				id={this.state.id} 
				style={{top: this.state.coors[1], left: this.state.coors[0]}}>
				<div className="vertex-title" onMouseDown={this._dragMouseDown}>{this.props.name}</div>
				<div className="vertex-coors">
					<div className="vertex-coors__elem">x: {this.state.coors[0] || 0}</div>
					<div className="vertex-coors__elem">y: {this.state.coors[1] || 0}</div>
				</div>
			</div>
		);
	}
};

Vertex.defaultProps = {
	coors: [200, 200],
	name: 'unnamed vertex'
};

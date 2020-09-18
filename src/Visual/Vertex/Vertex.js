import React from 'react';
import RootComponent from '../../RootComponent';
import './Vertex.css';

import Button from '../../Button/Button';

export default class Vertex extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			id: props.id,
			coors: props.coors,
			vertex: {
				name: props.name,
			},

			_zone: 'visual'
		}

		this._dragMouseDown = this._dragMouseDown.bind(this);
		this._elementDrag = this._elementDrag.bind(this);
		this._dragMouseUp = this._dragMouseUp.bind(this);

		// Вызываем, когда вершина создается, чтобы сразу ее перемещать
		this._dragMouseDown();
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

		// Определяем куда вершина наведена
		
		if (e.clientX > document.getElementById('menu').offsetLeft && this.state._zone !== 'menu') {
			this.setState({
				_zone: 'menu'
			});
			this._notify('changeZone', true);
		} else if (e.clientX < document.getElementById('menu').offsetLeft && this.state._zone !== 'visual') {
			this.setState({
				_zone: 'visual'
			});
			this._notify('changeZone', false);
		}
	}

	_dragMouseUp(e) {
		document.removeEventListener('mouseup', this._dragMouseUp);
		document.removeEventListener('mousemove', this._elementDrag)

		if (this.state._zone === 'menu') {
			this._notify('returnVertex', e, this.state.vertex);
			this._notify('remove', e);
		}
	}

	render() {
		return (
			<div 
				className="vertex" 
				id={this.state.id} 
				style={{top: this.state.coors[1], left: this.state.coors[0]}}>
				<div 
					className={"vertex-title" + (!this.props.name ? " app-disabled" : '')} 
					title={this.state.vertex.name}
					onMouseDown={this._dragMouseDown}>
					{this.state.vertex.name || '~ unnamed ~'}
				</div>
				<div className="vertex-coors">
					<div className="vertex-coors__elem">x: {this.state.coors[0] || 0}</div>
					<div className="vertex-coors__elem">y: {this.state.coors[1] || 0}</div>
				</div>

				<Button className="app-error" onClick={this._notify.bind(this, 'remove')}>✘</Button>
			</div>
		);
	}
};

Vertex.defaultProps = {
	coors: [200, 200],
};

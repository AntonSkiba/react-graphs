import React from 'react';
import RootComponent from '../../../RootComponent';
import './Vertex.css';

import VertexMenu from './VertexMenu/VertexMenu';

export default class Vertex extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			vertex: {
				id: props.id,
				coors: props.coors,
				name: props.name
			},

			_zone: 'menu',
			_showContext: false,
			_propsSnapshot: [props.id, props.coors, props.name]
		}

		this.zIndexForInfoPopup = 1;

		this._dragMouseDown = this._dragMouseDown.bind(this);
		this._elementDrag = this._elementDrag.bind(this);
		this._dragMouseUp = this._dragMouseUp.bind(this);

		this._edgeMouseDown = this._edgeMouseDown.bind(this);
		this._edgeMouseDrag = this._edgeMouseDrag.bind(this);
		this._edgeMouseUp = this._edgeMouseUp.bind(this);

		this._doubleClickReturn = this._doubleClickReturn.bind(this);

		this._updateVertex = this._updateVertex.bind(this);

		// Вызываем, когда вершина создается, чтобы сразу ее перемещать
		if (this.props.isNew) {
			this._dragMouseDown();
		}
	}

	// Проверяем обновление из опций для обновления координат вершины
	// все это только потому что у вершин из разных файлов могут быть одинаковые id
	// но мы же пишем на реакте, поэтому мы не перестраиваем полностью вершину
	// мы должны поменять ее координаты. Наверно проще было бы где-нибудь сверху
	// вызывать полное перестроение дочерних элементов на загрузку нового проекта
	static getDerivedStateFromProps(props, state) {
		const newSnapshot = [props.id, props.coors, props.id]
		if (JSON.stringify(newSnapshot) !== JSON.stringify(state._propsSnapshot)) {
			return {
				vertex: {
					id: props.id,
					name: props.name,
					coors: props.coors
				},
				_propsSnapshot: newSnapshot
			}
		}
		return null;
	}

	_dragMouseDown() {
		document.addEventListener('mouseup', this._dragMouseUp);
		document.addEventListener('mousemove', this._elementDrag)
	}

	_elementDrag(e) {
		e = e || window.event;
		if (e.clientX < window.innerWidth - 25
		 && e.clientY < window.innerHeight - 25
		 && e.clientX > 25 && e.clientY > 20) {
			this.setState({
				vertex: {
					...this.state.vertex,
					coors: [e.clientX - 25, e.clientY + 10]
				}
			});

			// Посылаем событие, о том, что вершина перемещается, для обновления координат в массиве вершин
			this._notify('vertexDrag', [e.clientX - 25, e.clientY + 10]);
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
		document.removeEventListener('mousemove', this._elementDrag);

		if (this.state._zone === 'menu') {
			this._notify('returnVertex', e, this.state.vertex);
			this._notify('remove', e);
		}
	}

	_doubleClickReturn(e) {
		this._notify('returnVertex', e);
		this._notify('remove', e);
	}

	_edgeMouseDown(e) {
		if (e.button === 0) {
			this._notify('edgeMouseDown', e);
			document.addEventListener('mousemove', this._edgeMouseDrag);
			document.addEventListener('mouseup', this._edgeMouseUp);
		}
		
	}

	_edgeMouseDrag(e) {
		e = e || window.event;
		this._notify('edgeDrag', e);
	}

	_edgeMouseUp(e) {
		this._notify('edgeMouseUp', e);
		document.removeEventListener('mouseup', this._edgeMouseUp);
		document.removeEventListener('mousemove', this._edgeMouseDrag);
	}

	_toggleInfo(show, e) {
		e.preventDefault();
		if (this.state._showContext !== show) {
			this.setState({
				_showContext: show
			});
			// Когда показываем инфо, чуть-чуть выдвигаем вершину на первый план
			if (show) {
				this.zIndexForInfoPopup = 2;
			} else {
				this.zIndexForInfoPopup = 1;
			}
		}
	}

	_updateVertex(e, info) {
		const vertex = Object.assign(this.state.vertex, info);
		this.setState({
			vertex
		});

		this._notify('update', vertex);
	}

	render() {

		return (
			<div 
				className={"vertex" + (this.props.isHover ? " vertex-hover" : "")} 
				id={this.state.vertex.id} 
				style={{
					top: this.state.vertex.coors[1], 
					left: this.state.vertex.coors[0],
					zIndex: this.zIndexForInfoPopup
				}}>
				<div 
					className={"vertex-title" + (!this.props.name ? " app-disabled" : '')} 
					title={this.state.vertex.name}
					onMouseDown={this._dragMouseDown}
					onDoubleClick={this._doubleClickReturn}>
					{this.state.vertex.name || '~ unnamed ~'}
				</div>
				<div className="vertex-edge"
					title='create edge'
					onMouseDown={this._edgeMouseDown}
					onMouseEnter={this._notify.bind(this, 'vertexMouseEnter')}
					onMouseLeave={this._notify.bind(this, 'vertexMouseLeave')}
					onContextMenu={this._toggleInfo.bind(this, true)}>
				</div>
				{this.state._showContext && <VertexMenu
					onUpdate={this._updateVertex}
					onClose={this._toggleInfo.bind(this, false)}
					onRemove={this._notify.bind(this, 'remove')}
					onCopy={this._notify.bind(this, 'copy')}
					vertex={this.state.vertex}/>}
			</div>
		);
	}
};

Vertex.defaultProps = {
	coors: [200, 200],
};

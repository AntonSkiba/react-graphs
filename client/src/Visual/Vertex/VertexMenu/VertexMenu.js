import React from 'react';
import RootComponent from '../../../RootComponent';
import './VertexMenu.css';

import Button from '../../../Button/Button';

export default class VertexMenu extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);
		
		this.state = {
			id: this.props.info.id,
			name: this.props.info.name || '~ unnamed ~'
		}

		// Радиус вершины
		this.vertexRadius = 25;

		// Отступ от центра вершины
		this.vertexMargin = 5;

		// ширина и высота инфо
		this.infoWidth = 250;
		this.infoHeight = 300;

	}

	_recalcLocation(vertexCoors) {
		// По дефолту меню справа от вершины
		const menuCoors = [this.vertexRadius + this.vertexMargin, -this.infoHeight/2];
		// если вершина 
		// + ширина информационного окна
		// + отступ вылезают за экран
		// + ширина меню вылезают за экран, тогда нужно показать окно слева
		if (vertexCoors[0] + this.infoWidth + this.vertexRadius + this.vertexMargin + 300 > window.innerWidth) {
		 	menuCoors[0] = -this.infoWidth - this.vertexMargin*2 - this.vertexRadius;
		}
		// Расчитываем высоту
		if (vertexCoors[1] + this.vertexRadius - this.infoHeight/2 < 0) {
			menuCoors[1] = -vertexCoors[1] - this.vertexRadius;
		} else if (vertexCoors[1] + this.vertexRadius + this.infoHeight/2 > window.innerHeight) {
			menuCoors[1] = window.innerHeight - vertexCoors[1] - this.infoHeight - this.vertexRadius;
		}

		return menuCoors;
	}

	render() {
		const menuCoors = this._recalcLocation(this.props.info.coors)
		const menuStyle = {
			top: menuCoors[1] + this.vertexRadius,
			left: menuCoors[0] + this.vertexRadius,
			width: this.infoWidth,
			height: this.infoHeight
		}
		return (
			<div
				className="vertexMenu"
				style={menuStyle}>
				<div className="vertexMenu-header">
					<div
						title={this.state.name}
						className="vertexMenu-header__name">
						{this.state.name}
					</div>
					<Button
						title="Edit vertex" 
						className="vertexMenu-header__button app-functional">
						☰
					</Button>
					<Button
						title="Close info" 
						className="vertexMenu-header__button"
						onClick={this._notify.bind(this, 'close')}>
						✖
					</Button>
				</div>
				<div className="vertexMenu-body">
					<div className="vertexMenu-body__row app-label">
						<div className="app-disabled">Unique id:&nbsp;</div>
						<div className="app-functional">{this.state.id}</div>
					</div>
				</div>
				<div className="vertexMenu-footer">
					<Button 
						className="vertexMenu-footer__copy app-functional" 
						onClick={this._notify.bind(this, 'copy')}>
						★ Copy
					</Button>
					<Button 
						className="vertexMenu-footer__delete app-error" 
						onClick={this._notify.bind(this, 'remove')}>
						✘ Delete
					</Button>
				</div>
			</div>
		);
	}
}

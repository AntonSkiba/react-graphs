import React from 'react';
import RootComponent from '../../../../RootComponent';
import './VertexMenu.css';

import Button from '../../../../Components/Button/Button';
import CustomInput from '../../../../Components/CustomInput/CustomInput';

export default class VertexMenu extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);
		
		this.state = {
			vertex: this.props.vertex,
			_editMode: false
		}

		this._onSave = this._onSave.bind(this);
		this._onEdit = this._onEdit.bind(this);

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

	_onSave(e) {
		// Собираем все текстовые инпуты и смотрим на результаты их валидаций
		const vertex = Object.assign({}, this.state.vertex);
		let hasError = false;

		for (const childName in this._children) {
			const vertexState = childName.split('input-')[1];
			const result = this._children[childName].getValue();
			// может быть пустая строка, поэтому !== null
			if (vertexState && result !== null) {
				vertex[vertexState] = result;
			} else {
				hasError = true;
			}
		}

		if (!hasError) {
			this.setState({
				_editMode: false,
				vertex
			});
			this._notify('update', e, vertex);
		}

	}

	_onEdit(e) {
		this.setState({
			_editMode: true
		});
	}

	render() {
		const menuCoors = this._recalcLocation(this.props.vertex.coors)
		const menuStyle = {
			top: menuCoors[1] + this.vertexRadius,
			left: menuCoors[0] + this.vertexRadius,
			width: this.infoWidth,
			height: this.infoHeight
		}
		const functionalButton  = this.state._editMode 
			  ? <Button
					title="Save vertex" 
					className="vertexMenu-header__button app-success"
					onClick={this._onSave}>
					✔
				</Button>
			  : <Button
					title="Edit vertex" 
					className="vertexMenu-header__button app-functional"
					onClick={this._onEdit}>
					☰
				</Button>
		return (
			<div
				className="vertexMenu"
				style={menuStyle}>
				<div className="vertexMenu-header">
					<CustomInput
						className="vertexMenu-header__name"
						ref={this._setChildren.bind(this, 'input-name')}
						placeholder="vertex name"
						disabled={!this.state._editMode}
						value={this.state.vertex.name}/>
					{functionalButton}
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
						<div className="app-functional">{this.state.vertex.id}</div>
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

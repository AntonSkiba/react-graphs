import React from 'react';
import RootComponent from '../../../RootComponent';
import './MenuVertexItem.css'
import Button from '../../../Components/Button/Button';
import CustomInput from '../../../Components/CustomInput/CustomInput';

export default class MenuVertexItem extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);
		
		// Если в объекте имя заполнено, можно показать его нередактируемым в данный момент
		this.state = {
			vertex: props.vertex,

			_editMode: !props.vertex.name
		}

		this._onSave = this._onSave.bind(this);
		this._onEdit = this._onEdit.bind(this);
		this._onMouseDown = this._onMouseDown.bind(this);
		this._inputChange = this._inputChange.bind(this);
	}

	_inputChange() {

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
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
			this._notify('save', e, vertex);	
		}
		
	}

	_onEdit(e) {
		this.setState({
			_editMode: true
		});
	}

	_onMouseDown(e) {
		if (!this.state._editMode) {
			this._notify('downToMove', e);
			this._notify('remove', e);
		}
	}
	
	render() {
		const editButton = this.state._editMode 
			? <Button className="menu-item__button app-success" onClick={this._onSave}>✔</Button>
			: <Button className="menu-item__button app-functional" onClick={this._onEdit}>☰</Button>

		return (
			<div className="menu-item">
				<div 
					className={"menu-item-row" + (!this.state._editMode ? " menu-item__movable" : '')} 
					onMouseDown={this._onMouseDown}>
					<div className="menu-item-row__label">Name</div>
					<CustomInput
						ref={this._setChildren.bind(this, 'input-name')}
						placeholder="of vertex"
						disabled={!this.state._editMode}
						value={this.state.vertex.name || ''}
						onChange={this._inputChange}/>
				</div>

				<div className="menu-item-row menu-item__buttons">
					{editButton}
					<Button className="menu-item__button app-error" onClick={this._notify.bind(this, 'remove')}>✘</Button>
				</div>
			</div>
		);
	}
}


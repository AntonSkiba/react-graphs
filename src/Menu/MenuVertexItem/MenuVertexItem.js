import React from 'react';
import RootComponent from '../../RootComponent';
import './MenuVertexItem.css'
import Button from '../../Button/Button';

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
	}

	_inputChange(state, e) {
		this.setState({
			vertex: Object.assign(this.state.vertex, {
				[state] : e.target.value
			})
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	_onSave(e) {
		this.setState({
			_editMode: false
		});
		this._notify('save', e, this.state.vertex);	
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
					<input
						className="menu-item-row__input" 
						type="text" 
						size="30"
						placeholder="of vertex"
						disabled={!this.state._editMode}
						value={this.state.vertex.name || ''}
						onChange={this._inputChange.bind(this, 'name')}/>
				</div>

				<div className="menu-item-row menu-item__buttons">
					{editButton}
					<Button className="menu-item__button app-error" onClick={this._notify.bind(this, 'remove')}>✘</Button>
				</div>
			</div>
		);
	}
}


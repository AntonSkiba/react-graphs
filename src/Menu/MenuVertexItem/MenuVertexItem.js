import React, { Component } from 'react';
import './MenuVertexItem.css'
import Button from '../Button/Button';

export default class MenuVertexItem extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			name: '',
			x: undefined,
			y: undefined,

			_editMode: this.props.editMode
		}
	}

	_inputChange(state, e) {
		this.setState({
			[state] : e.target.value
		});
	}

	_buttonsClick(action, e) {
		let {onSave, onRemove} = this.props;
		switch(action) {
			case 'save':
				// Меняем мод
				this.setState({
					_editMode: false
				});
				onSave && onSave(e, {
					name: this.state.name,
					coors: [this.state.x, this.state.y]
				});
				break;
			case 'edit':
				// Меняем мод
				this.setState({
					_editMode: true
				});
				break; 
			case 'remove':
				onRemove && onRemove(e);
				break;
		}
	}
	
	render() {
		const editButton = this.state._editMode 
			? <Button className="menu-item__button" onClick={this._buttonsClick.bind(this, 'save')}>✔</Button>
			: <Button className="menu-item__button" onClick={this._buttonsClick.bind(this, 'edit')}>☰</Button>

		return (
			<div className="menu-item">
				<div className="menu-item-row">
					<div className="menu-item-row__label">Name</div>
					<input
						className="menu-item-row__input" 
						type="text" 
						size="30"
						placeholder="of vertex"
						disabled={!this.state._editMode}
						onChange={this._inputChange.bind(this, 'name')}/>
				</div>

				<div className="menu-item-row">
					<div className="menu-item-row__label">X = </div>
					<input
						className="menu-item-row__input" 
						type="number"
						placeholder="0"
						disabled={!this.state._editMode}
						onChange={this._inputChange.bind(this, 'x')}/>
					<div className="menu-item-row__label"> | </div>

					<div className="menu-item-row__label">Y = </div>
					<input
						className="menu-item-row__input" 
						type="number"
						placeholder="0"
						disabled={!this.state._editMode}
						onChange={this._inputChange.bind(this, 'y')}/>
					<div className="menu-item-row__label"> | </div>
				</div>

				<div className="menu-item-row menu-item__buttons">
					{editButton}
					<Button className="menu-item__button" onClick={this._buttonsClick.bind(this, 'remove')}>✘</Button>
				</div>
			</div>
		);
	}
}

MenuVertexItem.defaultProps = {
	editMode: true
};


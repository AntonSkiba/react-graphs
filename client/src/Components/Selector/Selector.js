import React from 'react';
import RootComponent from '../../RootComponent';
import Button from '../Button/Button';
import './Selector.css';

export default class Selector extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			listMethod: this.props.listMethod,
			deleteMethod: this.props.deleteMethod,
			loaded: false,
			error: '',
			items: null,
			isOpen: false,
			selected: this.props.selected || (this.props.showAddItem ? this.props.addNewName : '--------')
		}

		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseLeave = this._onMouseLeave.bind(this);
		this._onSelect = this._onSelect.bind(this);
		this.update = this.update.bind(this);
		this.clearSelect = this.clearSelect.bind(this);
		this.setSelected = this.setSelected.bind(this);
	}

	componentDidMount() {
		if (typeof this.state.listMethod === 'string') {
			this.update();
		} else {
			console.error(`Type of list method must be a string.\nlistMethod: ${this.state.listMethod}`);
		}
	}

	update() {
		fetch(`/${this.state.listMethod}`, {
			method: 'GET'
		})
		.then(res => res.json())
		.then(items => {
			if (items.error) {
				this.setState({
					error: items.error,
					loaded: true
				})
			} else {
				this.setState({
					items,
					loaded: true
				});
			}
		});
	}

	clearSelect() {
		this.setState({
			selected: this.props.selected || (this.props.showAddItem ? this.props.addNewName : this.state.items[0])
		});
	}

	setSelected(selected) {
		this.setState({
			selected
		});
	}

	_onMouseMove() {
		if (this.state.items) {
			this.setState({
				isOpen: true
			});
		}
	}

	_onMouseLeave() {
		if (this.state.items) {
			this.setState({
				isOpen: false
			});
		}
	}

	_onSelect(name) {
		if (name !== this.state.selected) {
			this.setState({
				selected: name
			});

			if (name === this.props.addNewName) {
				this._notify('create');
			} else {
				this._notify('itemChanged', name);
			}
		}
	}

	_onDelete(name) {
		if (typeof this.state.deleteMethod === 'string') {
			fetch(`/${this.state.deleteMethod}/${name}`, {
				method: 'GET',
			})
			.then(res => res.json())
			.then(res => {
				if (res.error) {
					console.error(res.error);
				} else {
					console.log(res.message);
					this.state.items.splice(this.state.items.indexOf(name), 1);
					this.setState({
						items: this.state.items.slice()
					})
					if (name === this.state.selected) {
						this._notify('create');
						this.clearSelect();
					}
				}
			})
		} else {
			console.error(`Type of delete method must be a string.\ndeleteMethod: ${this.state.deleteMethod}`);
		}
	}

	render() {
		const list = this.state.items?.map(item =>
			<div key={item} className="selector-list__item">
				<Button
					className={"selector-list__item-name" + (item === this.state.selected ? " app-functional" : "")} 
					title={`${this.props.selectTitle}: ${item}`}
					onClick={this._onSelect.bind(this, item)}>
					{item}
				</Button>
				<Button
					className="selector-list__item-delete app-error" 
					title={`${this.props.deleteTitle}: ${item}`}
					onClick={this._onDelete.bind(this, item)}>
					✘
				</Button>
			</div>
		) || [];
		
		if (this.props.showAddItem) {
			list.unshift(
				<div key={this.props.addNewName} className="selector-list__item">
					<Button
						className={"selector-list__item-name" + (this.props.addNewName === this.state.selected ? " app-functional" : "")}
						title={this.props.addNewTitle}
						onClick={this._onSelect.bind(this, this.props.addNewName)}>
						{this.props.addNewName}
					</Button>
				</div>
			);
		}
		

		const listStyle = this.state.isOpen ? {
			top: 30,
			opacity: 1
		} : {
			opacity: 0,
			top: -300
		};

		const iconStyle = this.state.isOpen ? {
			transform: 'rotate(-90deg)'
		} : {
			transform: 'rotate(90deg)'
		};

		return (
			<div className="selector" onMouseLeave={this._onMouseLeave}>
				<div className="selector-button" onMouseMove={this._onMouseMove}>
					{!this.state.loaded && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>}
					{this.state.error && <div className="selector-button__name app-error app-label">{this.state.error}</div>}
					{this.state.items && <div 
						className="selector-button__name">
						{this.state.selected}
					</div>}
					{this.state.items && <div className="selector-button__icon" style={iconStyle}>
						»
					</div>}
				</div>
				<div
					style={listStyle}
					className="selector-list">
					{list}
				</div>
			</div>
		);
	}
}

Selector.defaultProps = {
	selectTitle: 'Select',
	deleteTitle: 'Delete',
	addNewName: '+ Add',
	addNewTitle: '+ Add',
	showAddItem: false
}
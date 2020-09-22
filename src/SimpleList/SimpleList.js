import React from 'react';
import RootComponent from '../RootComponent';
import './SimpleList.css';

export default class SimpleList extends RootComponent {
	constructor(props) {
		super(props);

		this.newUID = this._generateUID();

		// При построении приложения выбран "+ Project"
		this.state={
			selected: this.newUID
		}
	}

	_onChange(e) {
		if (e.target.value === this.newUID) {
			this._notify.call(this, 'create', e.target.value);
		} else {
			this._notify.call(this, 'itemChange', e.target.value);
		}

		this.setState({
			selected: e.target.value
		});
	}

	clearSelect() {
		this.setState({
			selected: this.newUID
		});
	}

	render() {
		let list = this.props.items.map(item =>
			<option
				key={item}
				value={item}
				className="simpleList-item">
				{item}
			</option>
		);

		list.unshift(
			<option
				key={this.newUID}
				value={this.newUID}
				className="simpleList-item">
				+ Project
			</option>
		);
		return (
			<select 
				className="simpleList" 
				value={this.state.selected}
				onChange={this._onChange.bind(this)}>
				{list}
			</select>
		);
	}
}

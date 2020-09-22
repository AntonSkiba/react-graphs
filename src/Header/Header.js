import React from 'react';
import RootComponent from '../RootComponent';
import './Header.css';

import Button from '../Button/Button';
import SimpleList from '../SimpleList/SimpleList';

export default class Header extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			show: false,
			inputInvalid: false,
			fileName: '',
			isUnsaved: false
		}

		this.height = 38;

		this._showHeader = this._showHeader.bind(this);
		this._onSave = this._onSave.bind(this);
		this._inputName = this._inputName.bind(this);
		this.setName = this.setName.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousemove', this._showHeader);
	}

	componentWillUnmount() {
		document.removeEventListener('mousemove', this._showHeader);
	}

	_showHeader(e) {
		e = e || window.event;
		if (e.clientY < this.height && e.clientX < document.getElementById('menu').offsetLeft && !this.state.show) {
			this.setState({
				show: true
			})
		} else if (e.clientY > this.height && this.state.show) {
			this.setState({
				show: false
			})
		}
	}

	_onSave(e) {
		if (this.state.fileName) {
			this._notify('save', e, this.state.fileName);
		} else {
			this.setState({
				inputInvalid: true
			});
		}
		
	}

	_inputName(e) {
		this.setState({
			fileName: e.target.value,
			inputInvalid: false
		});

		// При изменении имени файла сбрасываем выбранное значение
		this._children.list.clearSelect();

		this.setWarningIcon(true);
	}

	setName(fileName) {
		this.setState({
			fileName,
			inputInvalid: false
		});
	}

	setWarningIcon(isUnsaved) {
		if (isUnsaved !== this.state.isUnsaved) {
			this.setState({
				isUnsaved
			});
		}
	}

	render() {
		const headerStyle = {
			top: this.state.show ? 0 : -this.height,
			height: this.height
		}

		const warningIcon = this.state.isUnsaved
			? <div className="header-icon app-error" title="Save your changes">✎</div>
			: <div className="header-icon app-success"  title="All saved">✔</div>

		return (
			<div className="header" style={headerStyle}>
				{warningIcon}
				<Button onClick={this._onSave} className="header-button">Save</Button>
				<div>as</div>
				<input
					className={"header-input" + (this.state.inputInvalid ? " header-input-error" : "")}
					type="text"
					size="10"
					maxLength="10"
					placeholder="name"
					value={this.state.fileName}
					onChange={this._inputName}/>
				
				{this.state.inputInvalid && <div className="app-label app-error">please enter name</div>}
				<div className="header-divider"></div>

				<SimpleList
					ref={this._setChildren.bind(this, 'list')}
					items={this.props.projects}
					onItemChange={this._notify.bind(this, 'loadApp')}
					onCreate={this._notify.bind(this, 'createApp')}/>
			</div>
		);
	}
}

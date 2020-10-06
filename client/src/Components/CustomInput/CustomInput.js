import React from 'react';
import RootComponent from '../../RootComponent';
import './CustomInput.css';

export default class CustomInput extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			isInvalid: false,
			errorMessages: [],
			value: this.props.value
		}

		this.getValue = this.getValue.bind(this);
		this.setValue = this.setValue.bind(this);

		this._onChange = this._onChange.bind(this);
	}

	_onChange(e) {
		this.setState({
			value: e.target.value,
			isInvalid: false
		});

		this.props.onChange && this.props.onChange(e);
	}

	// Возвращает значение из инпута, с учетом переданных валидаторов
	getValue() {
		if (this.props.validators) {
			const errorMessages = [];
			this.props.validators.forEach(valid => {
				const validationResult = valid(this.state.value);
				if (typeof validationResult === 'string') {
					errorMessages.push(validationResult);
				}
			});

			if (errorMessages.length) {
				this.setState({
					errorMessages,
					isInvalid: true
				});
				return null;
			} else {
				return this.state.value;
			}
			
		} else {
			return this.state.value;
		}
	}

	setValue(value) {
		this.setState({
			value,
			isInvalid: false
		});
	}

	render() {
		const errors = this.state.errorMessages.map(error => 
			<div key={this._generateUID} className="app-label app-error">{error}</div>
		);

		return (
			<div className={"input-contaner " + this.props.className}>
				<input
					className={"input" + (this.state.isInvalid ? " input-error" : "")}
					type="text"
					size={this.props.size}
					maxLength={this.props.maxLength}
					placeholder={this.props.placeholder}
					disabled={this.props.disabled}
					value={this.state.value}
					onChange={this._onChange}/>

					{this.state.isInvalid && <div className="input-error__list">{errors}</div>}
			</div>
		);
	}
}

CustomInput.defaultProps = {
	size: "30",
	maxLength: "30",
	placeholder: "name",
	value: "",
	disabled: false,
	className: ""
}

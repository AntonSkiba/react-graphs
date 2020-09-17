import React, { Component } from 'react';
import './Button.css';

export default class Button extends Component {
	render() {
		return (
			<button onClick={this.props.onClick} className={"button " + this.props.className}>
				{this.props.children}
			</button>
		);
	}
}

Button.defaultProps = {
	className: ''
}

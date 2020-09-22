import React from 'react';
import RootComponent from '../RootComponent';
import './Button.css';

export default class Button extends RootComponent {
	render() {
		return (
			<button
				tabIndex="-1"
				onClick={this.props.onClick} 
				className={"button " + this.props.className}>
				{this.props.children}
			</button>
		);
	}
}

Button.defaultProps = {
	className: ''
}

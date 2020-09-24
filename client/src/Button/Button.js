import React from 'react';
import RootComponent from '../RootComponent';
import './Button.css';

export default class Button extends RootComponent {
	render() {
		return (
			<div className={this.props.className}>
				<button
					title={this.props.title}
					tabIndex="-1"
					disabled={this.props.disabled}
					onClick={this.props.onClick} 
					className="button">
					{this.props.children}
				</button>
			</div>
			
		);
	}
}

Button.defaultProps = {
	className: '',
	title: '',
	disabled: false
}

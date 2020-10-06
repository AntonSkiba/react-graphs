import React from 'react';
import RootComponent from '../RootComponent';
import './Header.css';

export default class Header extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			show: false
		}

		this.height = 38;

		this._showHeader = this._showHeader.bind(this);
		this._closeHeader = this._closeHeader.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousemove', this._showHeader);

	}

	componentWillUnmount() {
		document.removeEventListener('mousemove', this._showHeader);
	}

	_showHeader(e) {
		e = e || window.event;
		if (e.clientY < this.height - 30 && !this.state.show) {
			this.setState({
				show: true
			});
		}
	}

	_closeHeader(e) {
		this.setState({
			show: false
		});
	}

	render() {
		const headerStyle = {
			top: this.state.show ? 0 : -this.height,
			height: this.height
		}

		return (
			<div onMouseLeave={this._closeHeader} className="header" style={headerStyle}>
				{this.props.children}
			</div>
		);
	}
}

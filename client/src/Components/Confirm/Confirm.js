import React from 'react';
import RootComponent from '../../RootComponent';
import './Confirm.css';

import Button from '../Button/Button';

export default class Confirm extends RootComponent {
	render() {
		return (
			<div className="confirm-container">
				<div className="confirm">
					<div className="confirm-title">{this.props.title}</div>
					<div className="confirm-message">{this.props.title}</div>
					{this.props.type.includes('ok') && <Button onClick={this._notify.bind(this, 'confirm', 'ok')}>Ok</Button>}
					{this.props.type.includes('yes') && <Button onClick={this._notify.bind(this, 'confirm', 'yes')}>Yes</Button>}
					{this.props.type.includes('no') && <Button onClick={this._notify.bind(this, 'confirm', 'no')}>No</Button>}
					{this.props.type.includes('cancel') && <Button onClick={this._notify.bind(this, 'confirm', 'cancel')}>Cancel</Button>}
				</div>
			</div>
		);
	}
}

import React  from 'react';
import RootComponent from '../../RootComponent';
import './Loader.css';

export default  class Loader extends RootComponent {
	render() {
		return (
			<div className="loader">
				<div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
			</div>
		);
	}
}

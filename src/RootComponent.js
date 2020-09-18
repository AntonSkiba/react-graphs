import { Component } from 'react';
// Родительский компонент для всех остальных,
// расширяет набор наследуемых методов

export default class RootComponent extends Component {
	constructor(props) {
		super(props);

		this._children = {};
	}
	// метод, грубо говоря, кидает событие наверх, на самом деле вызывает передаваемый коллбэк
	// но выглядит это следующим образом:
	// child -> "this._notify('something')"
	// parent -> "<Parent onSomething={this._onSomething} />"
	_notify(action, ...params) {
		// Формируем имя метода remove -> onRemove
		const methodName = `on${action[0].toUpperCase() + action.slice(1)}`;
		// неважно какой контекст передадим, в родителе метод должен быть связан со своим контекстом
		if (this.props[methodName]) {
			this.props[methodName].apply(null, params);
		} else {
			console.warn(`Метод: ${methodName} не был передан в класс: ${this.constructor.name}`);
		}
	}

	_setChildren(name, element) {
		this._children[name] = element;
	}
	
}

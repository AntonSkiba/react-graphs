import React from 'react';
import RootComponent from '../RootComponent';
import './Visual.css';

import Vertex from './Vertex/Vertex'

export default class Visual extends RootComponent {
	constructor(props) {
		super(props);
		this._notify = this._notify.bind(this);

		this.state = {
			vertices: {},

			visualWidth: window.innerWidth - 300,
			visualHeight: window.innerHeight
		}
		
		// Не стейт, потому что пытался сделать через отдельный компонент ребро
		// разочаровался, и отрисовываю просто здесь, через visualCanvas
		this.edges = {};

		this.edgeDragFrom = false;
		this.edgeDragTo = false;
		this.edgeDragKey = false;

		this.createVertex = this.createVertex.bind(this);
		this._onVertexMouseHover = this._onVertexMouseHover.bind(this);

		this._resize = this._resize.bind(this);
		this.getData = this.getData.bind(this);
		this.updateData = this.updateData.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this._resize);
		this.canvas = this._children.visualCanvas;
		this.ctx = this.canvas.getContext('2d');
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this._resize);
	}

	updateData(data) {
		if (data) {
			this.setState({
				vertices: data.vertices
			});
			this.edges = data.edges;
		} else {
			this.setState({
				vertices: {}
			});
			this.edges = {};
		}

		this._redrawEdges();
	}
	// Метод возвращает данные о ребрах и вершинах с визуальной части
	getData() {
		return {
			vertices: this.state.vertices,
			edges: this.edges
		}
	}

	_resize() {
		this.setState({
			visualWidth: window.innerWidth - 300,
			visualHeight: window.innerHeight
		});

		this._redrawEdges();
	}

	// Публичный метод, вызывается из App.js, когда перемещаем новую вершину из меню
	createVertex(e, key, vertex) {
		e = e || window.event;
		this._setVertexParams(key, {
			...vertex,
			links: [],
			isNew: true,
			coors: [e.clientX - 25, e.clientY + 10]
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	// Создаем новое ребро, по сколько ребро тянется от вершины, у нового ребра
	// конечные точки совпадают со стартовыми
	createEdge() {
		const coors = this.state.vertices[this.edgeDragFrom].coors;
		this.edgeDragKey = this._generateUID();

		this.edges[this.edgeDragKey] = {
			from: {
				key: this.edgeDragFrom,
				name: this.state.vertices[this.edgeDragFrom].name,
				coors: [coors[0] + 25, coors[1] + 25]
			},
			to: {
				coors: [coors[0] + 25, coors[1] + 25]
			},
		}

		this._redrawEdges();
	}

	// Метод удаляет вершину и связанные ребра
	removeVertex(key) {
		this.setState(prevState => {
			delete prevState.vertices[key];
			return { vertices: Object.assign({}, prevState.vertices)}
		});

		const linkEdges = this._edgeExists(key);

		// Обновляем список ссылок у связанных вершин
		linkEdges.forEach(linkEdge => {
			const edge = this.edges[linkEdge];
			// Нужно удалить только у связанных вершин
			// удаляемая вершина сама очистит links.
			// Если у найденного ребра стартовая вершина совпадает, то есть она является
			// удаляемой, нужно поправить линки у конечной и наоборот
			const vertexKey = edge.from.key === key ? edge.to.key : edge.from.key;
			const dirctn = edge.from.key === key ? 'from' : 'to';
			let linkIndex = -1;
			this.state.vertices[vertexKey].links.forEach((link, index) => {
				if (this._isEqual(link[dirctn], edge[dirctn])) {
					linkIndex = index;
				}
			});
			this.state.vertices[vertexKey].links.splice(linkIndex, 1)
			this._setVertexParams(vertexKey, {
				links: this.state.vertices[vertexKey].links
			});
		});

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');

		this.removeEdges(linkEdges);
	}

	// Метод копирует, то есть создает новую вершину на основе старой
	copyVertex(key, e) {
		this.createVertex(e, this._generateUID(), this.state.vertices[key]);
	}

	removeEdges(keys) {
		keys.forEach(key => {
			delete this.edges[key];
		});

		this._redrawEdges();
	}

	// Метод вызывается когда нужно вернуть вершину в меню,
	// то есть, либо на двойной клик по ней, либо если мы ее навели на меню
	_onReturnVertex(key, e) {
		this._notify('returnVertex', e, key, this.state.vertices[key])
	}

	// Метод вызывается когда мы опускаем курсор на вершину для создания ребра.
	// Создает соответственно ребро с начальной вершиной, конечное определяется позже.
	_onEdgeMouseDown(key, e) {
		this.edgeDragFrom = key;

		this.createEdge();
	}

	// Метод вызывается когда мы протягиваем ребро от одной вершины, 
	// ставит конечные точки ребра, как координаты курсора
	_onEdgeDrag(key, e) {
		this.edges[this.edgeDragKey].to.coors = [e.clientX, e.clientY]
		this._redrawEdges();
	}

	_redrawEdges() {
		this.ctx.beginPath();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (let edgeKey in this.edges) {
			this.ctx.moveTo(this.edges[edgeKey].from.coors[0], this.edges[edgeKey].from.coors[1]);
			this.ctx.lineTo(this.edges[edgeKey].to.coors[0], this.edges[edgeKey].to.coors[1]);
			// Понадобится, если нужно будет обозначать направление
			// this.ctx.fillRect(this.edges[edgeKey].to.coors[0], this.edges[edgeKey].to.coors[1], 5, 5);
		}
		this.ctx.stroke();
	}

	// ~~~ Как-то не получилось, может вернусь когда-нибудь ~~~
	// Проверяет кликнули ли на ребро
	// _selectEdge(e) {
	// 	for (const edge in this.edges) {
	// 		const [x, y] = [e.clientX, e.clientY];
	// 		let [x1, y1] = this.edges[edge].from.coors;
	// 		const [x2, y2] =  this.edges[edge].to.coors;
			
	// 		// проверяем на совпадения, делаем специальные погрешности в 1 пиксель
	// 		// иначе случится плохое - деление на ноль или px\py === 0, а это доп. проверки
	// 		if (x1 === x || x1 === x2) {
	// 			x1++;
	// 		}

	// 		if (y1 === y || y1 === y2) {
	// 			y1++;
	// 		}

	// 		const px = (x - x1) / (x2 - x1);
	// 		const py = (y - y1) / (y2 - y1);

	// 		// проверяем на принадлжность к отрезку, и ставим диапозон на несколько пикселей от отрезка
	// 		if (Math.abs(px - py) <= 0.3) {
	// 			console.log('select this edge: "' + this.edges[edge].from.name + '"-"' + this.edges[edge].to.name + '"');
	// 		}
	// 	}
	// }

	// Метод определяет, есть ли ребро с этими вершинами, если есть возвращает массив найденных ребер,
	// принимает либо один аргумент, либо два, то есть просто вершину, либо начало и конец ребра
	_edgeExists(vertexKey, toKey) {
		let foundEdges = [];
		if (toKey) {
			foundEdges = Object.keys(this.edges).filter(key => {
				return this.edges[key].from.key === vertexKey
					&& this.edges[key].to.key === toKey
			});
		} else if (vertexKey) {
			foundEdges = Object.keys(this.edges).filter(key => {
				return this.edges[key].from.key === vertexKey
					|| this.edges[key].to.key === vertexKey
			});
		}

		return foundEdges;
	}

	// Метод вызывается, когда мы отпускаем курсор, если в это время, есть edgeDragTo
	// значит мы отпустили курсор над другой вершиной и нужно добавить в ребро 
	// конечную вершину и сохранить его, иначе нужно удалить созданное ребро
	_onEdgeMouseUp(vertexKey, e) {
		if (this.edgeDragTo) {
			// убираем ховер
			this._setVertexParams(this.edgeDragTo, {isHover: false});

			// Если такое ребро уже существует, мы должны удалить это
			// Если брать ребра с направлениями, то можно оставить только первый вызов
			let alreadyExists = [...this._edgeExists(this.edgeDragFrom, this.edgeDragTo), 
								 ...this._edgeExists(this.edgeDragTo, this.edgeDragFrom)];

			if (!alreadyExists.length) {

				this.edges[this.edgeDragKey].to.coors[0] = this.state.vertices[this.edgeDragTo].coors[0] + 25;
				this.edges[this.edgeDragKey].to.coors[1] = this.state.vertices[this.edgeDragTo].coors[1] + 25;
				this.edges[this.edgeDragKey].to.key = this.edgeDragTo;
				this.edges[this.edgeDragKey].to.name =  this.state.vertices[this.edgeDragTo].name

				// Обновляем список ссылок у вершины
				// обновляем у вершины "откуда"
				this._setVertexParams(this.edgeDragFrom, {
					links: [...this.state.vertices[this.edgeDragFrom].links, {
						to: this.edges[this.edgeDragKey].to
					}]
				});

				// обновляем у вершины "куда"
				this._setVertexParams(this.edgeDragTo, {
					links: [...this.state.vertices[this.edgeDragTo].links, {
						from: this.edges[this.edgeDragKey].from
					}]
				});

				// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
				this._notify('stateChange');

				this._redrawEdges();
			} else {
				this.removeEdges([this.edgeDragKey]);
			}
		} else {
			this.removeEdges([this.edgeDragKey]);
		}
		this.edgeDragFrom = false;
		this.edgeDragTo = false;
		this.edgeDragKey = false;
	}

	// Метод по ключу устанавливает параметры вершины
	_setVertexParams(key, params) {
		this.setState({
			vertices: Object.assign(this.state.vertices, {
				[key]: {
					...this.state.vertices[key],
					...params
				}
			})
		});
	}

	// Вызывается на перемещение вершины и записывает новые координаты
	// Ребрам содержащим эти вершины, также устанавливаются новые координаты
	_onVertexDrag(vertexKey, coors) {
		this._setVertexParams(vertexKey, {
			coors,
			isNew: false
		});

		// Находим ребро и определяем какие координаты меняются
		for (let edgeKey in this.edges) {
			if (this.edges[edgeKey].from.key === vertexKey) {
				this.edges[edgeKey].from.coors = [coors[0] + 25, coors[1] + 25]
				this._redrawEdges();
			} else if (this.edges[edgeKey].to.key === vertexKey) {
				this.edges[edgeKey].to.coors = [coors[0] + 25, coors[1] + 25]
				this._redrawEdges();
			}
		}

		// Вызываем для того, чтобы предупредить пользователя о несохраненном файле
		this._notify('stateChange');
	}

	// Метод вызывается при попадании курсора на вершину, когда протягивается ребро
	// устанавливается hover а вершину, а также записывается выделенная вершина или убирается,
	// чтобы при отпускании курсора, понять какую вершину нужно связать
	_onVertexMouseHover(key, isHover, e) {
		if (this.edgeDragFrom && this.edgeDragFrom !== key) {

			// устанавливаем ховер на вершину
			this._setVertexParams(key, {isHover});

			this.edgeDragTo = isHover ? key : false;
		}
	}

	render() {
		const visualVertices = Object.keys(this.state.vertices).map((key) =>
			<Vertex 
				id={key}
				key={key}
				ref={this._setChildren.bind(this, key)}
				onRemove={this.removeVertex.bind(this, key)}
				onCopy={this.copyVertex.bind(this, key)}
				onReturnVertex={this._onReturnVertex.bind(this, key)}
				onVertexDrag={this._onVertexDrag.bind(this, key)}
				onChangeZone={this._notify.bind(this, 'changeZone')}

				onEdgeMouseDown={this._onEdgeMouseDown.bind(this, key)}
				onEdgeDrag={this._onEdgeDrag.bind(this, key)}
				onEdgeMouseUp={this._onEdgeMouseUp.bind(this, key)}
				onVertexMouseEnter={this._onVertexMouseHover.bind(this, key, true)}
				onVertexMouseLeave={this._onVertexMouseHover.bind(this, key, false)}

				coors={this.state.vertices[key].coors}
				isHover={this.state.vertices[key].isHover}
				links={this.state.vertices[key].links}
				name={this.state.vertices[key].name}
				isNew={this.state.vertices[key].isNew}/>
		);

		return (
			<div>
				<canvas
					ref={this._setChildren.bind(this, 'visualCanvas')}
					className="visual"
					height={this.state.visualHeight}
					width={this.state.visualWidth}>
				</canvas>
				{visualVertices}
			</div>
		);
	}
}

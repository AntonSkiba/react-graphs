import React from 'react';
import RootComponent from '../RootComponent';
import './Landscape.css';

import Loader from '../Components/Loader/Loader';
import Header from '../Header/Header';


class Landscape extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			loader: true,
			visualWidth: window.innerWidth,
			visualHeight: window.innerHeight,
		}

		this.zoom = 0.5;
		this.pos = [0, 0];
		this.startPos = [0, 0];

		// Характеристики ландшафта
		this.landscapeBlockSize = 4;
		this.landscape = [];
		// Биомы
		this.biomes = {
			water: {
				line: 0.1,
				color: [0, 25, 65]
			},
			beach: {
				line: 0.2,
				color: [70, 120, 200]
			},
			forest: {
				line: 0.3,
				color: [0, 180, 90]
			},
			jungle: {
				line: 0.5,
				color: [0, 95, 30]
			},
			savannah: {
				line: 0.7,
				color: [180, 220, 125]
			},
			desert: {
				line: 0.9,
				color: [225, 205, 165]
			}
		}

		this.shapes = [];

		this.width = 2000;
		this.height = 2000;
		
		this._onMouseDown = this._onMouseDown.bind(this);
		this._onMouseMove = this._onMouseMove.bind(this);
		this._onMouseUp = this._onMouseUp.bind(this);
		this._onMouseWheel = this._onMouseWheel.bind(this);

		this._resize = this._resize.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this._resize);

		this.canvas = this._children.landscapeCanvas;
		this.ctx = this.canvas.getContext('2d');

		fetch(`/generate?name=${this.props.project}&width=${this.width}&height=${this.height}&block=${this.landscapeBlockSize}`, {
			method: 'GET'
		})
		.then(res => res.json())
		.then(res => {
			if (res.error) {
				console.error(res.error);
			} else {
				this.setState({
					loader: false
				});

				// https://www.redblobgames.com/maps/terrain-from-noise/#demo
				// https://www.redblobgames.com/maps/mapgen4/
				// https://www.redblobgames.com/x/1842-delaunay-voronoi-sphere/
				// https://www.redblobgames.com/x/1843-planet-generation/
				// https://www.ixbt.com/video/3dterrains-generation.shtml
				// http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/
				for (let y = 0; y < res.landscape.length; y++) {
					for (let x = 0; x < res.landscape[y].length; x++) {
						// Создаем зеленую карту, у которой в глубине все равно будет черный
						// а на высоте белый, как-бы снег
						let color = [
							Math.pow(res.landscape[y][x], 2)*255,
							res.landscape[y][x]*255,
							Math.pow(res.landscape[y][x], 2)*255
						]
						
						// Вода
						if (res.landscape[y][x] < this.biomes.water.line) {
							color = this.biomes.water.color;
						} else if (res.landscape[y][x] < this.biomes.beach.line) {
							color = this.biomes.beach.color;
						} else if (res.landscape[y][x] < this.biomes.forest.line) {
							color = this.biomes.forest.color;
						} else if (res.landscape[y][x] < this.biomes.jungle.line) {
							color = this.biomes.jungle.color;
						} else if (res.landscape[y][x] < this.biomes.savannah.line) {
							color = this.biomes.savannah.color;
						} else if (res.landscape[y][x] < this.biomes.desert.line) {
							color = this.biomes.desert.color;
						}

						this.landscape.push({
							left: x*this.landscapeBlockSize,
							top: y*this.landscapeBlockSize,
							width: this.landscapeBlockSize,
							height: this.landscapeBlockSize,
							color: `rgb(${color})`
						});
					}
				}

				this._redrawProject();
			}
		});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this._resize);
	}

	// Возвращает карту высот первичного ландшафта
	// _getMap() {
	// 	const size = Math.max(this.width, this.height)/this.landscapeBlock;
	// 	for (let y = 0; y < size; y++) {
	// 		this.heightMap[y] = [];
	// 		for (let x = 0; x < size; x++) {
	// 			const nx = x/size - 0.5;
	// 			const ny = y/size - 0.5;
	// 			this.heightMap[y][x] = this.simplex.noise2D(nx, ny);
	// 		}
	// 	}

	// 	//console.log(this.heightMap);
	// }

	// _getRand(min, max) {
	// 	return Math.round(Math.random() * (max - min)) + min;
	// }

	// _calculatedProject() {
	// 	return new Promise((resolve, reject) => {
	// 		// Для начала генерируем ландшафт с заданной детализацией
	// 		// this._getMap();

	// 		// const models = this.project.visual.vertices;
	// 		// const modelKeys = Object.keys(models);
	// 		// const length = modelKeys.length;
	// 		// modelKeys.forEach((key, i) => {
	// 		// 	const width = this._getRand(0, 100);
	// 		// 	const height = this._getRand(0, 100);
	// 		// 	const left = this._getRand(0, this.width - width);
	// 		// 	const top =this._getRand(0, this.height - height);
	// 		// 	this.shapes.push({text: models[key].name, left, top, width, height, type: 'rect'});
	// 		// });
	// 		resolve();
	// 	});
	// }

	_resize() {
		this.setState({
			visualWidth: window.innerWidth,
			visualHeight: window.innerHeight
		});

		this._redrawProject();
	}

	_redrawProject() {
		this.ctx.beginPath();
		this.ctx.clearRect(-10, -10, this.canvas.width - this.pos[0] + 20, this.canvas.height - this.pos[1] + 20);
	
		// рисуем область отображения
		this.ctx.strokeRect(0, 0, Math.round(this.width*this.zoom), Math.round(this.height*this.zoom));

		// Отдельно рисуем ландшафт
		this._drawLandscape()

		// рисуем объекты
		this._drawShapes();
	}

	_drawLandscape() {
		this.landscape.forEach(piece => {
			const realPiece = {
				...piece,
				left: Math.round(piece.left*this.zoom),
				top: Math.round(piece.top*this.zoom),
				width: Math.round(piece.width*this.zoom),
				height: Math.round(piece.height*this.zoom)
			}

			// рисуем только видимую часть
			if (realPiece.left + this.pos[0] < window.innerWidth && realPiece.left + realPiece.width > -this.pos[0]
				&& realPiece.top + this.pos[1] < window.innerHeight && realPiece.top + realPiece.height > -this.pos[1]) {
				this._drawRect(realPiece, 'fillRect');
			}
		});
	}

	_drawShapes() {
		this.shapes.forEach(shape => {
			// у каждой фигуры есть координаты, ширина, высота
			const realShape = {
				...shape,
				left: Math.round(shape.left*this.zoom),
				top: Math.round(shape.top*this.zoom),
				width: Math.round(shape.width*this.zoom),
				height: Math.round(shape.height*this.zoom)
			}
			
			// рисуем только видимую часть
			if (realShape.left + this.pos[0] < window.innerWidth && realShape.left + realShape.width > -this.pos[0]
				&& realShape.top + this.pos[1] < window.innerHeight && realShape.top + realShape.height > -this.pos[1]) {
				switch (realShape.type) {
					case 'rect':
						this._drawRect(realShape, 'strokeRect');
						break;
					default:
						break;
				}
			}
			
		});
	}

	_drawText(props) {
		const settings = Object.assign({
			text: '',
			size: 20,
			left: 0,
			top: 0,
			color: 'black'
		}, props);

		this.ctx.font = `${settings.size}px Arial`;
		this.ctx.fillStyle = settings.color;
		this.ctx.fillText(
			settings.text, 
			settings.left,
			settings.top + settings.size
		);
	}

	_drawRect(props, type) {
		const settings = Object.assign({
			text: '',
			size: 20,
			left: 0,
			top: 0,
			color: 'black'
		}, props);
		
		this.ctx.strokeStyle = settings.color;
		this.ctx.fillStyle = settings.color;
		this.ctx.lineWidth = '2';
		this.ctx[type](props.left, props.top, props.width, props.height);
		//this.ctx.stroke();
	
		if (settings.text) {
			this._drawText({
				size: 14,
				text: settings.text,
				top: settings.top - 20,
				left: settings.left
			})
		}

	}

	_onMouseDown(e) {
		document.addEventListener('mouseup', this._onMouseUp);
		document.addEventListener('mousemove', this._onMouseMove);
		this.prevMove = [e.clientX, e.clientY];
	}

	_onMouseMove(e) {
		this.move = [e.clientX - this.prevMove[0], e.clientY - this.prevMove[1]];
		// ограничиваем движение слева и сверху
		const futX = this.pos[0] + this.move[0];
		const futY = this.pos[1] + this.move[1];
		this.move[0] = futX < 10 && futX > window.innerWidth - this.width*this.zoom - 10 ? this.move[0] : 0;
		this.move[1] = futY < 10 && futY > window.innerHeight - this.height*this.zoom - 10 ? this.move[1] : 0;

		this.prevMove = [e.clientX, e.clientY];
		
		this.pos = [this.pos[0] + this.move[0], this.pos[1] + this.move[1]];

		this.ctx.translate(this.move[0], this.move[1]);
		this._redrawProject();
	}

	_onMouseUp() {
		document.removeEventListener('mouseup', this._onMouseUp);
		document.removeEventListener('mousemove', this._onMouseMove);
	}

	_onMouseWheel(e) {
		const zoomSpeed = -e.deltaY/40;
		this.zoom += zoomSpeed/100;

		// Убираем всякие javascript-овские приколы в виде бесконечных дробей
		this.zoom = Math.round(this.zoom*100)/100;

		// мне не понравилось как смазываются линии квадрата и вообще я не хочу чтобы текст уменьшался
		// поэтому будет собственное масштабирование у каждых фигур
		// this.ctx.scale(this.zoom, this.zoom);
		this._redrawProject();
		// this.ctx.scale(1/this.zoom, 1/this.zoom);
	}

	render() {
		console.log('rerender');
		return (
			<div className="landscape">
				{this.state.loader && <Loader />}
				<Header>
					<div className="landscape-header__logo">Project: <span className="app-functional">{this.props.project}</span></div>
				</Header>
				<canvas
					ref={this._setChildren.bind(this, 'landscapeCanvas')}
					className="landscape-view"
					height={this.state.visualHeight}
					width={this.state.visualWidth}
					onMouseDown={this._onMouseDown}
					onWheel={this._onMouseWheel}>
				</canvas>
			</div>
		);
	}
}

export default Landscape;

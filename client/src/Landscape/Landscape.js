import React from 'react';
import RootComponent from '../RootComponent';
import './Landscape.css';

import Loader from '../Components/Loader/Loader';
import Header from '../Header/Header';
import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Button from '../Components/Button/Button';


class Landscape extends RootComponent {
	constructor(props) {
		super(props);

		this.state = {
			loader: true
		}

		// Характеристики ландшафта
		this.landscapeParams = {
			// Размер блока
			block: 4,
			// Массив фигур/пикселей для отрисовки ландшафта
			data: [],
			// Скалистость
			octave: 6,
			// Частота рельефа, то есть чем больше, тем больше рельефа
			freq: 3,
			// Равнинность, чем больше, тем больше равнинных поверхностей
			flatness: 3,
		}

		// Ширина и высота
		this.width = 2000;
		this.height = 2000;

		this.shapes = [];

		this._resize = this._resize.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this._resize);

		this.sceneSetup();
		this.addCustomSceneObjects();
		
		fetch('/generate', {
			method: 'POST',
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: this.props.project,
				width: this.width,
				height: this.height,
				block: this.landscapeParams.block,
				octave: this.landscapeParams.octave,
				freq: this.landscapeParams.freq,
				flatness: this.landscapeParams.flatness
			})
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

				this.addTerrain(res.heightMap, res.moisMap);

				this.startAnimationLoop();
				// this._redrawProject();
			}
		});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this._resize);
		window.cancelAnimationFrame(this.requestID);
		this.controls.dispose();
	}

	sceneSetup() {
		const width = this.mount.clientWidth;
		const height = this.mount.clientHeight;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xffffff);
        this.camera = new THREE.PerspectiveCamera(
            75, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            10000 // far plane
		);
		this.camera.position.z = 500;
		this.camera.position.x = 300;
		this.camera.position.y = 500;
		this.controls = new OrbitControls( this.camera, this.mount );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement); // mount using React ref
	}

	addTerrain(heightMap, moisMap) {
		const geometry = new THREE.PlaneBufferGeometry(
			this.width, this.height, 
			this.width/this.landscapeParams.block - 1,
			this.height/this.landscapeParams.block - 1
		);

		const position = geometry.attributes.position;
		const colors = [];
		
		for (let y = 0; y < heightMap.length; y++) {
			for (let x = 0; x < heightMap[y].length; x++) {
				
				let color = this.getBiom(heightMap[y][x], moisMap[y][x]);
				color = color.map(p => p/255);
				colors.push(...color);

				// линия воды
				if (heightMap[y][x] < 0.08) {
					heightMap[y][x] = 0.08
				}

				// if (heightMap[y][x] > 0.26 + moisMap[y][x]/2 && heightMap[y][x] < 0.46 + moisMap[y][x]/2) {
				// 	heightMap[y][x] = 0.32 + moisMap[y][x]/2;
				// }

				const idx = y*heightMap.length + x
				position.setZ(idx, heightMap[y][x]*400);
			}
		}
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geometry.rotateX(-Math.PI/2);

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			vertexColors: THREE.VertexColors,
			side: THREE.DoubleSide,
			shininess: 10
		});


		this.landscape = new THREE.Mesh(geometry, material);
		this.scene.add(this.landscape);
	}

	addCustomSceneObjects() {
		
		// this.light = new THREE.PointLight(0xffffff, 2, 0);
		// this.light.position.set(400, 400, 400);

		// this.scene.add(this.light);

		const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9);
		directionalLight.position.set(400, 400, 400);
		directionalLight.castShadow = true;
		directionalLight.shadowCameraVisible = true;

		this.scene.add(directionalLight);

		const color = 0xFFFFFF;  // white
		const near = 0.1;
		const far = 2000;
		this.scene.fog = new THREE.Fog(color, near, far);
	}

	startAnimationLoop = () => {
        this.renderer.render(this.scene, this.camera);

        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
	};
	
	getBiom(h, m) {
		const colors = {
			OCEAN: [255*Math.pow(h*8, 2), 255*Math.pow(h*8, 2), 255*10*h],
			SHALLOW: [93, 128, 255],
			BEACH: [181, 160, 112],
			SCORCHED: [51, 51, 51],
			BARE: [140, 140, 140],
			TUNDRA: [195, 199, 175],
			SNOW: [255, 255, 255],
			TEMPERATE_DESERT: [207, 222, 155],
			SHRUBLAND: [129, 145, 116],
			TAIGA: [149, 171, 128],
			GRASSLAND: [59, 158, 52],
			TEMPERATE_DECIDUOUS_FOREST: [106, 143, 101],
			TEMPERATE_RAIN_FOREST: [83, 122, 77],
			TROPICAL_SEASONAL_FOREST: [148, 176, 128],
			TROPICAL_RAIN_FOREST: [15, 77, 11],
			SUBTROPICAL_DESERT: [171, 165, 109]
		}
		// вода
		if (h < 0.08) return colors.OCEAN;

		// пляж
		if (h < 0.12) return colors.BEACH;

		// Далее смотрим по типу климата
		if (h > 0.8) {
			if (m < 0.1) return colors.SCORCHED;
			if (m < 0.2) return colors.BARE;
			if (m < 0.5) return colors.TUNDRA;
			return colors.SNOW;
		}

		if (h > 0.6) {
			if (m < 0.33) return colors.TEMPERATE_DESERT;
			if (m < 0.66) return colors.SHRUBLAND;
			return colors.TAIGA
		}

		if (h > 0.3) {
			if (m < 0.16) return colors.TEMPERATE_DESERT;
			if (m < 0.50) return colors.GRASSLAND;
			if (m < 0.83) return colors.TEMPERATE_DECIDUOUS_FOREST;
			return colors.TEMPERATE_RAIN_FOREST;
		}

		if (m < 0.16) return colors.SUBTROPICAL_DESERT;
		if (m < 0.33) return colors.GRASSLAND;
		if (m < 0.66) return colors.TROPICAL_SEASONAL_FOREST;
		return colors.TROPICAL_RAIN_FOREST
	}

	_resize() {
		const width = this.mount.clientWidth;
		const height = this.mount.clientHeight;
		
		this.renderer.setSize(width, height);
        this.camera.aspect = width / height;

		this.camera.updateProjectionMatrix();
	}

	render() {
		console.log('rerender');
		return (
			<div className="landscape">
				{this.state.loader && <Loader />}
				<Header>
					<div className="landscape-header__logo">Project: <span className="app-functional">{this.props.project}</span></div>
					<div className="landscape-header__buttons">
						<Button className="landscape-header__buttons-item">Rebuild</Button>
					</div>
				</Header>

				<div className="landscape-view" ref={ref => (this.mount = ref)} />
			</div>
		);
	}
}

export default Landscape;

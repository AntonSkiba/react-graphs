const express = require('express');
const config = require('config');
const path = require('path');
const fs = require('fs');
const SimplexNoise = require('simplex-noise');
const e = require('express');

const app = express();

app.use(express.json({limit: '50mb', extended: true }));
app.use(express.urlencoded({limit: '50mb'}));

if (process.env.NODE_ENV === 'production') {
	app.use('/', express.static(path.join(__dirname, 'client', 'build')));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

app.get('/projects/list', (req, res) => {
	fs.readdir(path.join(__dirname, 'saved'), (err, files) => {
		if (err) {
			fs.mkdir(path.join(__dirname, 'saved'), (err) => {
				if (err) { 
					res.status(500).json({error: 'Не удалось загрузить приложение, попробуйте позже'});
					return console.error(err); 
				}
				res.send([]);
			});
		} else {
			res.send(files.map(file => file.slice(0, -5)));
		}
	});
});

app.get('/projects/delete/:name', (req, res) => {
	const name = req.params.name;

	fs.unlink(path.join(__dirname, 'saved', `${name}.json`), (err) => {
		if (err) {
			res.status(500).json({error: `Проект: ${name} не получилось удалить, попробуйте позже.`});
			return console.error(err);
		}
		res.status(201).json({message: `Проект: ${name} удален!`, project: name});
	});
});


app.post('/save', (req, res) => {
	const {name, project} = req.body;
	if (name && project) {
		// Обновляем/создаем новый проект
		fs.writeFile(path.join(__dirname, 'saved', `${name}.json`), JSON.stringify(project, null, 2), 'utf8', (err) => {
				if (err) {
					res.status(500).json({error: 'Проект не сохранился, попробуйте позже'});
					return console.error(err); 
				}
				
				res.status(201).json({message: 'Проект сохранен'});
			}
		);
	} else {
		res.status(400).json({error: 'Некорректные данные проекта'});
	}
});

app.get('/load/:name', (req, res) => {
	const name = req.params.name;
	const dir = path.join(__dirname, 'saved', `${name}.json`);
	fs.readFile(dir, 'utf8', (err, project) => {
		if (err) {
			res.status(500).json({error: 'Проект не загружается, попробуйте позже'});
			return console.error(err);
		}
		res.status(201).json({message: 'Проект загрузился', project: JSON.parse(project)});
	});
});

app.get('/generate', (req, res) => {
	const {name, width, height, block} = req.query;
	const dir = path.join(__dirname, 'saved', `${name}.json`);
	fs.readFile(dir, 'utf8', (err, loaded) => {
		if (err) {
			res.status(500).json({error: 'Проект не загружается, попробуйте позже'});
			return console.error(err);
		}
		// генерируем ландшафт
		const simplex = new SimplexNoise();
		const elevation = getElevation(simplex, width/block, height/block);

		const project = JSON.parse(loaded);
		res.status(200).json({landscape: elevation});
	});
});


function getElevation(simplex, width, height) {
	const elevation = [];
	let min = [], max = [];
	for (let y = 0; y < height; y++) {
		elevation[y] = [];
		for (let x = 0; x < width; x++) {
			const nx = x/width;
			const ny = y/height;

			elevation[y][x] = customNoise(simplex, [nx, ny], 4, 5);
		}
		min.push(Math.min(...elevation[y]));
		max.push(Math.max(...elevation[y]));
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// Нормализуем
			const posElevation = normilize(elevation[y][x], Math.max(...max), Math.min(...min));
			
			// Задаем равнинность
			elevation[y][x] = Math.pow(posElevation, 2);
		}
	}

	return elevation;
}

// octave: отвечает за скалистость
function customNoise(simplex, [nx, ny], octave = 1) {
	let value = 0;
	let freq = 1;

	for (let i = 0; i < octave; i++) {
		value += simplex.noise2D(freq*nx, freq*ny)/freq;
		freq *= 2;
	}
	
	return value;
}

function normilize(val, max, min) {
	return (val - min) / (max - min); 
}

const PORT = config.get('port') || 5000;

app.listen(PORT, () => console.log(`App has been started on ${PORT}...`));
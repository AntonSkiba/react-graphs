const express = require('express');
const config = require('config');
const path = require('path');
const fs = require("fs");

const app = express();

app.use(express.json({limit: '50mb', extended: true }));
app.use(express.urlencoded({limit: '50mb'}));

if (process.env.NODE_ENV === 'production') {
	app.use('/', express.static(path.join(__dirname, 'client', 'build')));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

app.get('/projects', (req, res) => {
	fs.readdir(path.join(__dirname, 'saved'), (err, files) => {
		if (err) {
			fs.mkdir(path.join(__dirname, 'saved'), (err) => {
				if (err) { 
					res.status(500).json({message: 'Не удалось загрузить приложение, попробуйте позже'});
					return console.error(err); 
				}
				res.send([]);
			});
		} else {
			res.send(files.map(file => file.slice(0, -5)));
		}
	});
});

app.post('/save', (req, res) => {
	const {name, project} = req.body;
	if (name && project) {
		const dir = path.join(__dirname, 'saved');
		// Обновляем/создаем новый проект
		fs.writeFile(path.join(dir, `${name}.json`), JSON.stringify(project, null, 2), 'utf8', (err) => {
				if (err) {
					res.status(500).json({message: 'Проект не сохранился, попробуйте позже'});
					return console.error(err); 
				}
				// Вычитываем названия всех проектов, чтобы отправить на клиент
				fs.readdir(dir, (errDir, files) => {
					if (errDir) { 
						res.status(500).json({message: 'Проект не сохранился, попробуйте позже'});
						return console.error(err); 
					}
					res.status(201).json({message: 'Проект сохранен', projects: files.map(file => file.slice(0, -5))});
				});
			}
		);
	} else {
		res.status(400).json({message: 'Некорректные данные проекта'});
	}
});

app.get('/load/:name', (req, res) => {
	const name = req.params.name;
	const dir = path.join(__dirname, 'saved');
	fs.readFile(path.join(dir, `${name}.json`), 'utf8', (err, project) => {
		if (err) {
			res.status(500).json({message: 'Проект не загружается, попробуйте позже'});
			return console.error(err);
		}
		res.status(201).json({message: 'Проект загрузился', project: JSON.parse(project)});
	});
});



const PORT = config.get('port') || 5000;

app.listen(PORT, () => console.log(`App has been started on ${PORT}...`));
import fs from 'fs';
import path from 'path';
import Ajv from  "ajv";
import yaml from 'js-yaml';

const ajv = new Ajv()
import schema from './schema.json' assert {type: 'json'};

(async () => {
	/**
	 * Validate Template recipe
	 */
	let doc;
	try {
		doc = await yaml.load(fs.readFileSync('./template.yml', 'utf8'));
		// console.log(doc);
	} catch (e) {
		console.log(e);
	}

	const valid = ajv.validate(schema, doc);
	if (!valid) {
		console.log(ajv.errors);
	}

	/**
	 * Validate Recipes
	 */
	const recipes = fs.readdirSync('./recipes');
	for (const recipe of recipes) {
		try {
			doc = await yaml.load(fs.readFileSync(path.join('./recipes', recipe), 'utf8'));
			console.log(doc);
		} catch (e) {
			console.log(e);
		}

		// calculate the cost
		console.log("recipe cost", doc.ingredients.map(ingredient => ingredient.cost).reduce((a, b) => a + b, 0));

		const valid = ajv.validate(schema, doc);
		if (!valid) {
			console.log(ajv.errors);
		}
	}

})();


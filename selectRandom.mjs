import fs from 'fs';
import path from 'path';
import Ajv from  "ajv";
import yaml from 'js-yaml';
import { Console } from 'console';


(async () => {
	/**
	 * select random recipes
	 */
	const recipes = fs.readdirSync('./recipes');
	let list = [];
	let selected = {};
	let count = 0;

	for (const recipe of recipes) {
		let doc;
		try {
			doc = await yaml.load(fs.readFileSync(path.join('./recipes', recipe), 'utf8'));
			// console.log(doc);
		} catch (e) {
			console.log(e);
		}
		doc.id = count;
		doc.total = Math.ceil(doc.ingredients.map(ingredient => ingredient.cost).reduce((a, b) => a + b, 0));
		list.push(doc)
		count += 1;
	}

	// console.log(list);

	// select 7 recipes at random from the list
	for (let i = 2; i > 0; i--) {
		let index = Math.floor(Math.random() * recipes.length);
		if (selected[list[index]['id']] != undefined || selected[list[index]['id']] != null) {
			i += 1;
		} else {
			selected[list[index]['id']] = list[index];
		}
	}

	// print recipe names
	console.log("Recipes:\n");
	for (const [key, value] of Object.entries(selected)) {
		console.log(`- ${value.title} (${value.description})`);
	}

	console.log("\nGrocery List:\n");
	// sort by total cost
	let sorted = Object.values(selected).sort((a, b) => a.total - b.total);

	// build a grocery list
	let groceryList = {
		total: 0
	};
	for (const recipe of sorted) {
		for (const ingredient of recipe.ingredients) {
			if (groceryList[ingredient.name] != undefined || groceryList[ingredient.name] != null) {
				// if units are the same, add the amounts
				if (groceryList[ingredient.name].unit == ingredient.unit) {
					groceryList[ingredient.name].count += ingredient.count;
					groceryList[ingredient.name].unit += ingredient.unit;
					groceryList[ingredient.name].cost += ingredient.cost;

					// human readable string
					if (groceryList[ingredient.name].unit){
						groceryList[ingredient.name].human = `${groceryList[ingredient.name].count} ${groceryList[ingredient.name].unit} ${groceryList[ingredient.name].name}`;
					} else {
						groceryList[ingredient.name].human = `${groceryList[ingredient.name].count} ${groceryList[ingredient.name].name}`;
					}

					// how much should this cost?
					groceryList.total += ingredient.cost;
				} else {
					// @TODO: convert units
					console.log('units are different');
					groceryList[ingredient.name].items = [groceryList[ingredient.name], ingredient];
					groceryList.total += ingredient.cost;
				}
			} else {
				groceryList[ingredient.name] = ingredient;

				// human readable string
				if (groceryList[ingredient.name].unit){
					groceryList[ingredient.name].human = `${groceryList[ingredient.name].count} ${groceryList[ingredient.name].unit} ${groceryList[ingredient.name].name}`;
				} else {
					groceryList[ingredient.name].human = `${groceryList[ingredient.name].count} ${groceryList[ingredient.name].name}`;
				}

				groceryList.total += ingredient.cost;
			}
		}
	}

	// print the human readable grocery list
	for (const ingredient of Object.values(groceryList)) {
		if (ingredient.human) {
			console.log(ingredient.human);
		}
	}

	console.log("\n")
	console.log("Total Cost Est: ", Math.ceil(groceryList.total));


})();


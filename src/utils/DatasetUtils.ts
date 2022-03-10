import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import JSZip from "jszip";

/**
 * Checks the validity of an id
 * Will return false if an invalid id, else true
 *
 * An invalid id is one which contains an underscore or is all whitespace
 *
 * @param id: The id of a database
 * */
function isValidDatasetIdName(id: string): boolean {
	const whiteSpaceRegex: RegExp = /^\s*$/;
	const underScoreRegex: RegExp = /^.*_.*$/;
	return !(id.match(whiteSpaceRegex) || id.match(underScoreRegex));
}

/**
 * Takes key and then verifies if the attched datatype is of the correct type
 * If it does not match throws InsightError
 *
 *
 * @param key: key of the InsightResult
 * @param value: value of the InsightResult
 */
function checkCorrectTypeOfValueForKey(key: string, value: string | number) {
	let mFields = [
		"avg",
		"pass",
		"fail",
		"audit",
		"year",
		"lat",
		"lon",
		"seats"
	];
	let sFields = [
		"dept",
		"id",
		"instructor",
		"title",
		"uuid",
		"fullname",
		"shortname",
		"number",
		"name",
		"address",
		"type",
		"furniture",
		"href"
	];

	let expectedDatatype: string;

	if (mFields.includes(key)) {
		expectedDatatype = "number";
	} else if (sFields.includes(key)) {
		expectedDatatype = "string";
	} else {
		throw new InsightError("Given an invalid key " + key);
	}
	checkIdProperDatatype(value, expectedDatatype, key);
}

	/**
	 * Returns if the expected and actual values types match up
	 * Otherwise throws and InsightError
	 *
	 * @param value: original value
	 * @param expectedTypeOfValue: the expected type of the value
	 * @param key: the key of the value, used for error message
	 */
function checkIdProperDatatype(value: string | number, expectedTypeOfValue: string, key: string): void {
	if (typeof value === expectedTypeOfValue) {
		return;
	} else {
		throw new InsightError(`Invalid value type for
		key: ${key}
		actualType: ${typeof value}
		expectedType: ${expectedTypeOfValue}`);
	}
}

/**
 * List all currently added datasets from disk,
 * including their id, type, and number of rows/valid sections
 *
 * Promise should fulfill with an array of currently added InsightDatasets,
 * and will only fulfill
 */
function listFromDisk(): Promise<InsightDataset[]> {
	let datasets: any[][];
	let dataset: InsightDataset;
	let addedInsightDatasets: InsightDataset[] = [];
	if (fs.existsSync("./data/")) {
		fs.readdirSync("./data/").forEach((file) => {
			let path = "./data/" + file;
			datasets = JSON.parse(fs.readFileSync(path, "utf8"));
			let datasetIdName = file.substring(0, file.length - 4);
			if (typeof (datasets[0][2]) === "string") {
				dataset = {
					id: datasetIdName,
					kind: InsightDatasetKind.Rooms,
					numRows: datasets.length
				};
			} else {
				dataset = {
					id: datasetIdName,
					kind: InsightDatasetKind.Courses,
					numRows: datasets.length
				};
			}
			addedInsightDatasets.push(dataset);
		});
	}
	return new Promise(function (resolve) {
		resolve(addedInsightDatasets);
	});
}

/**
 * Removes dataset from disk
 *
 * Promise should fulfill with the deleted database id,
 * throws NotFoundError otherwise
 *
 * @param id: The id of a database
 */
function removeFromDisk(id: string): Promise<string> {
	try{
		const path = "./data/" + id + ".txt";
		fs.statSync(path);
		fs.unlinkSync(path);
		return new Promise(function (resolve) {
			resolve(id);
		});
	} catch {
		throw new NotFoundError("id does not exist");
	}
}

/**
 * Checks if id exists in disk
 *
 * Will return true if id is unique,
 * false otherwise
 *
 * @param id: The id of a database
 */
function checkExistingIdName(id: string): void {
	if (fs.existsSync("./data/")) {
		fs.readdirSync("./data/").forEach((file) => {
			let datasetIdName = file.substring(0, file.length - 4);
			if (id === datasetIdName) {
				throw new InsightError("Given an already existing id " + id);
			}
		});
	}
	return;
}

/**
 * Handles invalid id exception for add/remove dataset
 *
 * Will throw InsightError if id is invalid,
 * does nothing otherwise
 *
 * @param id: The id of a database
 */
function checkValidId(id: string): Promise<string[]> | void {
	if (!isValidDatasetIdName(id)) {
		throw new InsightError("Given an invalid id " + id);
	}
	return;
}

/**
 * Unzips content using JSZip
 *
 * Promise should fulfill with an updated zip object
 * Promise should reject with an InsightError describing the error
 *
 * @param content: The content of a database
 */
function unzipData(content: string): Promise<any> {
	return new Promise((resolve, reject) => {
		let zip = new JSZip();
		zip.loadAsync(content, {base64: true}).then(function (result) {
			resolve(result);
		}).catch(function () {
			reject(new InsightError("Given a non zip file"));
		});
	});
}

/**
 * Handles no valid section error for processData
 *
 * Will throw InsightError if no valid sections were extracted,
 * does nothing otherwise
 */
function checkDatasetLength(dataset: any[]): void {
	if (dataset.length === 0) {
		throw new InsightError("No valid rooms exist");
	}
	return;
}

/**
 * Saves courses to disk
 *
 * Will return true on success,
 * false otherwise
 */
function saveToDisk(id: string, dataset: any): void {
	if (!fs.existsSync("./data/")) {
		fs.mkdirSync("./data/");
	}
	const path = "./data/" + id + ".txt";
	fs.writeFileSync(path, JSON.stringify(dataset));
}

/**
 * Grabs all dataset ids from disk
 *
 * Will return with array of currently added ids
 */
function grabDatasetIds(): Promise<string[]> {
	let datasetIdNames: string[] = [];
	fs.readdirSync("./data/").forEach((file) => {
		let datasetIdName = file.substring(0, file.length - 4);
		datasetIdNames.push(datasetIdName);
	});
	return new Promise(function (resolve) {
		resolve(datasetIdNames);
	});
}

export {
	isValidDatasetIdName,
	checkCorrectTypeOfValueForKey,
	checkIdProperDatatype,
	listFromDisk,
	removeFromDisk,
	checkExistingIdName,
	unzipData,
	checkDatasetLength,
	saveToDisk,
	grabDatasetIds,
	checkValidId
};

import {InsightError} from "../controller/IInsightFacade";
import JSZip from "jszip";
let dataSet: any[] = [];

/**
 * Processes and stores inserted data for InsightFacade
 *
 * Promise should fulfill with a string array of all currently added dataset ids
 * Promise should reject with an InsightError describing the error
 *
 * @param content: The content of a database
 * @param id: The id of a database
 */
function processData(content: string, id: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		unzipData(content)
			.then(function (unZippedContent) {
				return Promise.all(parseData(unZippedContent));
			})
			.then(function (JSONs) {
				if(JSONs.length === 0) {
					reject(new InsightError("No course folder contents exist"));
				}
				let validSectionsAdded = grabData(JSONs, id);
				if (validSectionsAdded === 0) {
					reject(new InsightError("No valid sections exist"));
				}
				return grabDatasetNames();
			}).then(function (addedIds) {
				resolve(addedIds);
			})
			.catch(function (err) {
				reject(err);
			});
	});
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
 * Reads JSON files in courses folder
 *
 * Will return an Array of promises, each containing
 * readable JSON content from /courses directory of type string
 *
 * @param unZippedContent: The unzipped content read from JSZIP
 */
function parseData(unZippedContent: JSZip): Array<Promise<any>> {
	let promiseArray: Array<Promise<any>> = [];
	unZippedContent.folder("courses")?.forEach(((relativePath, file) => {
		promiseArray.push(file.async("string"));
	}));
	return promiseArray;
}

/**
 * Grabs relevant fields from valid sections
 *
 * Will return the number of valid sections added to database
 *
 * @param JSONs: The readable JSON content from /courses directory
 * @param id: The id of a database
 */
function grabData(JSONs: string[], id: string): number {
	let validSectionsAdded = 0;
	for (const val of JSONs) {
		try {
			let obj = JSON.parse(val);
			let result = obj.result;
			for (const field of result) {
				if (field.Section === "overall") {
					field.Year = "1900";
				}
				let attributes = [id, field.Subject, field.Course, field.Avg,
					field.Professor, field.Title, field.Pass, field.Fail,
					field.Audit, field.id, field.Year];
				if (isValidSection(attributes)) {
					dataSet.push(attributes);
					validSectionsAdded++;
				}
			}
		} catch { // invalid JSON, skip over
		}
	}
	return validSectionsAdded;
}

/**
 * Checks if any fields in course section are undefined
 *
 * Will return false if any field is undefined,
 * true otherwise
 *
 * @param attributes: The array of fields grabbed from JSONs
 */
function isValidSection(attributes: any[]): boolean {
	for (const val of attributes) {
		if (val === undefined) {
			return false;
		}
	}
	return true;
}

/**
 * Checks if id exists in database
 *
 * Will return true if id is unique,
 * false otherwise
 *
 * @param id: The id of a database
 */
function isExistingDatasetIdName(id: string): boolean {
	let idArray1: string[] = [];
	for (let val of dataSet) {
		idArray1.push(val[0]);
	}
	const uniqueSet = new Set(idArray1);
	return !uniqueSet.has(id);
}

/**
 * Grabs all dataset ids from database
 *
 * Will return with array of currently added ids
 */
function grabDatasetNames(): Promise<string[]> {
	let idArray: string[] = [];
	for (let val of dataSet) {
		idArray.push(val[0]);
	}
	return new Promise(function (resolve) {
		resolve(Array.from(new Set(idArray)));
	});
}

/**
 * Checks the validity of an id
 * Will return false if an invalid id, else true
 *
 * An invalid id is one which contains an underscore or is all whitespace
 *
 * @param id: The id of a database
 */
function isValidDatasetIdName(id: string): boolean {
	const whiteSpaceRegex: RegExp = /^\s*$/;
	const underScoreRegex: RegExp = /^.*_.*$/;
	return !(id.match(whiteSpaceRegex) || id.match(underScoreRegex));
}

/**
 * query keys use "courses_<key>" whereas in the data is just <key>
 * This helper verifies that it is a valid key then returns the translated key
 * Throws InsightError if there is not a valid key
 *
 *
 * @param key: The key of the InsightResult
 *
 */
function translateIdToMatchDatasetStyle(key: string): string {
	let newKey: string;
	switch (key) {
		case "courses_dept": {
			newKey = "dept";
			break;
		} case "courses_id": {
			newKey = "id";
			break;
		} case "courses_avg": {
			newKey = "avg";
			break;
		} case "courses_instructor": {
			newKey = "instructor";
			break;
		} case "courses_title": {
			newKey = "title";
			break;
		} case "courses_pass": {
			newKey = "pass";
			break;
		} case "courses_fail": {
			newKey = "fail";
			break;
		} case "courses_audit": {
			newKey = "audit";
			break;
		} case "courses_uuid": {
			newKey = "uuid";
			break;
		} case "courses_year": {
			newKey = "year";
			break;
		} default: {
			throw new InsightError("Given an invalid key " + key);
		}
	}
	return newKey;
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
	let expectedDatatype: string;
	switch (key) {
		case "dept": {
			expectedDatatype = "string";
			break;
		} case "id": {
			expectedDatatype = "string";
			break;
		} case "avg": {
			expectedDatatype = "number";
			break;
		} case "instructor": {
			expectedDatatype = "string";
			break;
		} case "title": {
			expectedDatatype = "string";
			break;
		} case "pass": {
			expectedDatatype = "number";
			break;
		} case "fail": {
			expectedDatatype = "number";
			break;
		} case "audit": {
			expectedDatatype = "number";
			break;
		} case "uuid": {
			expectedDatatype = "string";
			break;
		} case "year": {
			expectedDatatype = "number";
			break;
		} default: {
			throw new InsightError("Given an invalid key " + key);
		}
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

export {
	translateIdToMatchDatasetStyle,
	isValidDatasetIdName,
	checkCorrectTypeOfValueForKey,
	processData,
	isExistingDatasetIdName
};

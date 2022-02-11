import {InsightError} from "../controller/IInsightFacade";
import JSZip from "jszip";

/**
 * Checks the validity of an id
 * Will return false if an invalid id, else true
 *
 * An invalid id is one which contains an underscore or is all whitespace
 *
 * @param id: The id of a database
 */

function isValidDatasetIdName(id: string): boolean {
	// checks if the id is all whitespace
	const whiteSpaceRegex: RegExp = /^\s*$/;
	// checks if the id contains an underscore
	const underScoreRegex: RegExp = /^.*_.*$/;

	// checks if the id is all whitespace and returns false if so
	if (id.match(whiteSpaceRegex)) {
		return false;
	}

	// checks if the id contains an underscore and returns false if so
	if (id.match(underScoreRegex)) {
		return false;
	}

	return true;
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
	checkCorrectTypeOfValueForKey
};

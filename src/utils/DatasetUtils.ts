import {InsightError} from "../controller/IInsightFacade";

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
	if (!id.match(underScoreRegex)) {
		return false;
	}

	return true;
}

/**
 * query keys use "courses_<key> whereas in the data is just <key>
 * This helper verifies that it is both a valid key and returns the translated key
 * Throws InsightError if there is not a valid key
 * Throws InsightError if the value of the key is the incorrect type
 *
 *
 * @param key: The key of the InsightResult
 * @param value: The value of the InsightResult, either of type string or number
 *
 */

function translateIdToMatchDatasetStyle(key: string, value: string | number): string {
	let newKey: string;

	switch (key) {
		case "courses_dept": {
			newKey = transformToNewKey(value, "string", "dept");
			break;
		} case "courses_id": {
			newKey = transformToNewKey(value, "string", "id");
			break;
		} case "courses_avg": {
			newKey = transformToNewKey(value, "number", "avg");
			break;
		} case "courses_instructor": {
			newKey = transformToNewKey(value, "string", "instructor");
			break;
		} case "courses_title": {
			newKey = transformToNewKey(value, "string", "title");
			break;
		} case "courses_pass": {
			newKey = transformToNewKey(value, "number", "pass");
			break;
		} case "courses_fail": {
			newKey = transformToNewKey(value, "number", "fail");
			break;
		} case "courses_audit": {
			newKey = transformToNewKey(value, "number", "audit");
			break;
		} case "courses_uuid": {
			newKey = transformToNewKey(value, "string", "uuid");
			break;
		} case "courses_year": {
			newKey = transformToNewKey(value, "number", "year");
			break;
		} default: {
			throw new InsightError("Given an invalid key " + key);
		}
	}
	return newKey;
}

/**
 * Check the originalType and the expectedType are the same and returns the newKey if matched
 * Otherwise throws insightError if not matched
 *
 *
 * @param value: original value
 * @param expectedTypeOfValue: the expected type of the value
 * @param newKey: the new key to match the dataset style
 */

function transformToNewKey(value: string | number, expectedTypeOfValue: string, newKey: string): string {
	if (typeof value === expectedTypeOfValue) {
		return newKey;
	} else {
		throw new InsightError(`Invalid value type for
		key: ${newKey}
		actualType: ${typeof value}
		expectedType: ${expectedTypeOfValue}`);
	}
}

export {translateIdToMatchDatasetStyle, isValidDatasetIdName};

import {InsightError} from "../controller/IInsightFacade";

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

export {
	isValidDatasetIdName,
	checkCorrectTypeOfValueForKey,
	checkIdProperDatatype
};

import {InsightError, InsightResult} from "../controller/IInsightFacade";
import {logicComparisonConstructor} from "../Filters/LogicComparison";
import {Filter} from "../Filters/Filter";
import {negationConstructor} from "../Filters/Negation";
import {sCompareConstructor} from "../Filters/SComparison";
import {mCompareConstructor} from "../Filters/MComparison";
import {EmptyFilter} from "../Filters/EmptyFilter";

/**
 * Takes a json containing a filter and converts it to type Filter
 * If given an invalid json returns an InsightError
 * Recursive Filters return Promised, Logic/Not to avoid asynch issues
 * whereas the value filters return just there new filter
 *
 * @param json: json value containing filter
 *
 * @return Promise<Filter>: The promise of the valid filter
 */

function jsonToFilter(json: any): Promise<Filter> {
	let filter: Filter | undefined;
	if (json === undefined) {
		filter = new EmptyFilter();
	} else if (json.GT !== undefined) {
		filter = mCompareConstructor("GT", json.GT);
	} else if (json.LT !== undefined) {
		filter = mCompareConstructor("LT", json.LT);
	} else if (json.EQ !== undefined) {
		filter = mCompareConstructor("EQ", json.EQ);
	} else if (json.IS !== undefined) {
		filter = sCompareConstructor(json.IS);
	} else if (json.AND !== undefined) {
		filter = logicComparisonConstructor("AND", json.AND);
	} else if (json.OR !== undefined) {
		filter = logicComparisonConstructor("OR", json.OR);
	} else if (json.NOT !== undefined) {
		return new Promise((resolve) => {
			resolve(negationConstructor(json.NOT));
		});
	} else {
		filter = undefined;
	}

	return new Promise(function (resolve, reject) {
		if (filter === undefined) {
			reject(new InsightError("Not a valid filter"));
		} else {
			resolve(filter);
		}
	});
}

/**
 * Extracts the dataset id from the key
 * throws InsightError if given invalid key
 *
 * @param key: query containing id
 */

function getDatasetIdFromKey(key: string): string {
	let underScorePos: number =  key.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + key);
	} else {
		return key.slice(0, underScorePos);
	}
}

/**
 * Extracts the field from the key
 * throws InsightError if given invalid key
 *
 * @param key: query containing id
 */

function getFieldFromKey(key: string): string {
	let underScorePos: number =  key.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + key);
	}

	return key.slice(underScorePos + 1);
}

/**
 * Return the index in our attributes for the given field
 * Throws InsightError if given invalid field
 *
 * @param field: Field
 */

function getIndexOfGivenField(field: string): number {
	let attributes = [
		"dept",
		"id",
		"avg",
		"instructor",
		"title",
		"pass",
		"fail",
		"audit",
		"uuid",
		"year"
	];

	let index = attributes.indexOf(field);

	if (index === -1) {
		throw new InsightError("Given invalid field " + field);
	}

	return index;
}

/**
 * Recursively runs the query of all given Filters
 *
 * @param filters: Filters to query
 * @param data: Data to filter
 *
 * @return Promise<Array<Array<Array<string | number>>: Promise of all the filtered data returned in an array
 */

function queryAllFilters(filters: Filter[], data: Array<Array<string | number>>):
	Promise<Array<Array<Array<string | number>>>> {
	return new Promise(function (resolve) {
		let filteredQueries: Array<Array<Array<string | number>>> = [];
		for (let filter of filters) {
			filter.query(data).then((filteredQuery) => {
				filteredQueries.push(filteredQuery);

				if (filteredQueries.length === filters.length) {
					resolve(filteredQueries);
				}
			});
		}
	});
}

/**
 * Takes the given data and turns it into an array of InsightResults
 *
 * @param columns: Fields that are included in the data
 * @param data: the data to be transformed
 *
 * @return Promise<InsightResult[]>: returns the promise of the array of InsightResult
 */

function toInsightResult(columns: string[], data: Array<Array<string | number>>): Promise<InsightResult[]> {
	return new Promise((resolve) => {
		let orderedOfExpectedFields: number[] = getOrderOfExpectedFields(columns);
		let returnVal: InsightResult[] = [];
		for (let entry of data) {
			let insightResult: {[key: string]: string | number} = {};
			for (let fieldPos of orderedOfExpectedFields) {
				insightResult[columns[fieldPos]] = entry[fieldPos];
			}
			returnVal.push(insightResult);
		}

		resolve(returnVal);
	});
}

/**
 * Gets the ordered index of expected fields
 *
 * If given ["courses", "id", "pass"] returns [0,2,1]
 *
 * @param keys
 */

function getOrderOfExpectedFields(keys: string[]): number[] {
	let returnVal: number[] = [];

	let attributes = [
		"dept",
		"id",
		"avg",
		"instructor",
		"title",
		"pass",
		"fail",
		"audit",
		"uuid",
		"year"
	];

	for (let key of keys) {
		let field: string = getFieldFromKey(key);
		returnVal.push(attributes.indexOf(field));
	}

	returnVal = returnVal.map((value, index) => {
		return index;
	});

	return returnVal;
}

/**
 * Expects query to be of 3 different types
 * If string: return the parsed string
 * If Array: stringify the array then return the parsed string
 * If Object: stringify the object then return the parsed string
 * else throw an InsightError
 *
 * @param query: unformatted query
 */

function toProperQueryFormat(query: any): any {
	if (typeof query === "string") {
		return JSON.parse(query);
	} else if (Array.isArray(query) || typeof query === "object") {
		let jsonStr: string = JSON.stringify(query);
		return JSON.parse(jsonStr);
	} else {
		throw new InsightError("Given invalid query format");
	}
}

/**
 * Throws Insight Error if given invalid parameter
 */

function checkValidQueryParameters(where: Filter, columns: string[], order: string) {
	if (columns === undefined ||
		columns.length === 0 ||
		order === undefined ||
		order.length === 0) {
		throw new InsightError("Invalid query");
	}
}

export{getFieldFromKey, jsonToFilter,
	getIndexOfGivenField, queryAllFilters, toInsightResult, getDatasetIdFromKey, toProperQueryFormat,
	checkValidQueryParameters};

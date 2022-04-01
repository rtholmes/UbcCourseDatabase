import {InsightError, InsightResult} from "../controller/IInsightFacade";
import {logicComparisonConstructor} from "../Filters/LogicComparison";
import {Filter} from "../Filters/Filter";
import {negationConstructor} from "../Filters/Negation";
import {sCompareConstructor} from "../Filters/SComparison";
import {mCompareConstructor} from "../Filters/MComparison";
import {EmptyFilter} from "../Filters/EmptyFilter";
import {stringify} from "querystring";
import {CourseData} from "./CourseData";

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

	if (json.GT !== undefined) {
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
	} else if (stringify(json) === "") {
		filter = new EmptyFilter();
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
 * Recursively runs the query of all given Filters
 *
 * @param filters: Filters to query
 * @param data: Data to filter
 *
 * @return Promise<Array<Array<Array<string | number>>: Promise of all the filtered data returned in an array
 */

function queryAllFilters(filters: Filter[], data: CourseData[]):
	Promise<CourseData[][]> {
	return new Promise(function (resolve) {
		let filteredQueries: CourseData[][] = [];
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

function toInsightResult(columns: string[], data: CourseData[]): Promise<InsightResult[]> {
	return new Promise((resolve) => {
		let returnVal: InsightResult[] = [];
		let value: string | number | undefined;
		for (let entry of data) {
			let insightResult: {[key: string]: string | number} = {};
			for (let column of columns) {
				value = entry.get(column);
				if (value === undefined) {
					throw new InsightError("Invalid key");
				}
				insightResult[column] = value;
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
	try {
		if (typeof query === "string") {
			return JSON.parse(query);
		} else if (Array.isArray(query) || typeof query === "object") {
			let jsonStr: string = JSON.stringify(query);
			return JSON.parse(jsonStr);
		}
	} catch (err) {
		throw new InsightError("Given invalid query format");
	}
}

/**
 * Throws InsightError if given invalid parameter
 * Throws InsightError if order is not in columns
 */

function checkValidQueryParameters(where: Filter, columns: string[], order: string | undefined) {
	if (where === undefined ||
		columns === undefined ||
		columns.length === 0) {
		throw new InsightError("Invalid query");
	}
	if (typeof order === "string" && !columns.includes(order)) {
		throw new InsightError("Order is not contained in Columns");
	}
}

export{getFieldFromKey, jsonToFilter, queryAllFilters, toInsightResult, getDatasetIdFromKey, toProperQueryFormat,
	checkValidQueryParameters};

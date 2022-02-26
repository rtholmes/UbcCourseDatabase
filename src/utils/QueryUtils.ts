import {
	InsightError,
	InsightResult
} from "../controller/IInsightFacade";
import {checkCorrectTypeOfValueForKey} from "./DatasetUtils";
import {Filter, LogicComparison, MComparison, Negation, Query, SComparison} from "./Query";

function jsonToFilter(obj: any): Promise<Filter> {
	let returnValue: Filter | undefined;
	if (obj.GT !== undefined) {
		returnValue = mCompareConstructor("GT", obj.GT);
	} else if (obj.LT !== undefined) {
		returnValue = mCompareConstructor("LT", obj.LT);
	} else if (obj.EQ !== undefined) {
		returnValue = mCompareConstructor("EQ", obj.EQ);
	} else if (obj.AND !== undefined) {
		returnValue = logicComparisonConstructor("AND", obj.AND);
	} else if (obj.OR !== undefined) {
		returnValue = logicComparisonConstructor("OR", obj.OR);
	} else if (obj.IS !== undefined) {
		returnValue = sCompareConstructor(obj.IS);
	} else if (obj.NOT !== undefined) {
		return new Promise((resolve) => {
			resolve(negationConstructor(obj.NOT));
		});
	} else {
		returnValue = undefined;
	}

	return new Promise(function (resolve, reject) {
		if (returnValue === undefined) {
			reject(new InsightError("Not a valid filter"));
		} else {
			resolve(returnValue);
		}
	});
}

function negationConstructor(obj: any): Promise<Negation> {

	if (JSON.stringify(obj) === "{}") {
		throw new InsightError("Given empty filter list for logic comparison");
	}

	return new Promise((resolve) => {
		jsonToFilter(obj).then((temp) => {
			if (temp === undefined) {
				throw new InsightError();
			}

			resolve(new Negation(temp));
		});
	});
}


function sCompareConstructor(obj: any): SComparison {
	let tempSKey: any;
	let tempInputString: any;

	for (const field in obj) {
		tempSKey = field;
		tempInputString = obj[field];
	}

	if ((typeof tempSKey) !== "string" || (typeof tempInputString) !== "string") {
		throw new InsightError(`incorrect typing for sKey and/or input string \n
			sKey: ${typeof tempSKey} \n
		  	input string: ${typeof tempInputString}`);
	}

	checkCorrectTypeOfValueForKey(getKeyFromIdKey(tempSKey), tempInputString);
	Query.isRepeatDataId(getDatasetIdFromString(tempSKey));

	const asteriskRegex: RegExp = /^.*[*].*$/;
	if (tempInputString.match(asteriskRegex)) {
		throw new InsightError("input string contained an * inputString:" + tempInputString);
	}

	return new SComparison(tempSKey, tempInputString);
}
function mCompareConstructor(comp: string, obj: any): MComparison {
	let tempMKey: any;
	let tempNum: any;

	for (const field in obj) {
		tempMKey = field;
		tempNum = obj[field];
	}

	if ((typeof tempMKey) !== "string" || (typeof tempNum) !== "number") {
		throw new InsightError(`incorrect typing for mkey and/or number \n
			mKey: ${typeof tempMKey} \n
		  	number: ${typeof tempNum}`);
	}

	checkCorrectTypeOfValueForKey(getKeyFromIdKey(tempMKey), tempNum);
	Query.isRepeatDataId(getDatasetIdFromString(tempMKey));
	return new MComparison(comp, tempMKey, tempNum);
}

function logicComparisonConstructor(log: string, obj: object[]): LogicComparison {
	let arr: Filter[] = [];

	if (obj.length === 0 ) {
		throw new InsightError("Given empty filter list for logic comparison");
	}

	for (let field of obj) {
		jsonToFilter(field).then((temp) => {
			arr.push(temp);
		});
	}

	return new LogicComparison(log, arr);
}

function getPromiseOfDatasetIdFromQuery(query: Query): Promise<string> {
	let queryKey: string = query.order;
	let underScorePos: number =  queryKey.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + queryKey);
	}

	// returns just <dataset_id>
	return new Promise(function (resolve, reject) {
		if (underScorePos === -1) {
			reject(new InsightError("Invalid query key, \n" +
				" expects: <dataset_id>_<dataset_key>, \n" +
				" actual: " + queryKey));
		} else {
			resolve(queryKey.slice(0, underScorePos));
		}
	});
}

function getDatasetIdFromString(str: string): string {
	let underScorePos: number =  str.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + str);
	}

	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + str);
	} else {
		return str.slice(0, underScorePos);
	}
}

function getKeyFromIdKey(str: string): string {
	let underScorePos: number =  str.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + str);
	}

	return str.slice(underScorePos + 1);
}

function getIndexOfGivenAttribute(str: string): number {
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

	return attributes.indexOf(str);
}

function queryAllFilters(filters: Filter[], data: Array<Array<string | number>>):
	Promise<Array<Array<Array<string | number>>>> {
	return new Promise(function (resolve) {
		let multiArr: Array<Array<Array<string | number>>> = [];
		for (let filter of filters) {
			filter.query(data).then((returnVal) => {
				multiArr.push(returnVal);
			});
		}
		resolve(multiArr);
	});
}

function toInsightResult(columns: string[], data: Array<Array<string | number>>): Promise<InsightResult[]> {
	return new Promise((resolve) => {
		let temp: number[] = fun(columns);
		let returnVal: InsightResult[] = [];
		for (let entry of data) {
			let temp12: {[key: string]: string | number} = {};
			for (let temp4 of temp) {
				temp12[columns[temp4]] = entry[temp4];
			}
			returnVal.push(temp12);
		}

		resolve(returnVal);
	});
}

function fun(columns: string[]): number[] {
	let returnVal: number[] = [];

	let attributes = [
		"dept",
		"courses",
		"avg",
		"instructor",
		"title",
		"pass",
		"fail",
		"audit",
		"id",
		"year"
	];

	for (let temp of columns) {
		let temp2: string = getKeyFromIdKey(temp);
		returnVal.push(attributes.indexOf(temp2));
	}

	returnVal = returnVal.map((value, index) => {
		return index;
	});

	return returnVal;
}

export{getPromiseOfDatasetIdFromQuery, getKeyFromIdKey, jsonToFilter,
	getIndexOfGivenAttribute, queryAllFilters, toInsightResult, getDatasetIdFromString};

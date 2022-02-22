import {
	Filter,
	InsightError,
	LogicComparison,
	MComparison,
	Negation,
	Query,
	SComparison
} from "../controller/IInsightFacade";

function isValidQuery(query: unknown): boolean {
	// stub
	return false;
}

function queryDatabase(query: Query) {
	let datasetId: string = getDatasetIdFromQuery(query);


}

function jsonToFilter(obj: any): Filter {
	let returnValue: Filter;
	if (obj.GT !== undefined) {
		returnValue = mCompareConstructor("GT", obj.GT);
	} else if (obj.LT !== undefined) {
		returnValue = mCompareConstructor("GT", obj.LT);
	} else if (obj.EQ !== undefined) {
		returnValue = mCompareConstructor("GT", obj.EQ);
	} else if (obj.AND !== undefined) {
		returnValue = logicComparisonConstructor("AND", obj.AND);
	} else if (obj.OR !== undefined) {
		returnValue = logicComparisonConstructor("OR", obj.OR);
	} else if (obj.IS !== undefined) {
		returnValue = sCompareConstructor(obj.IS);
	} else if (obj.NOT !== undefined) {
		returnValue = negationConstructor(obj.NOT);
	} else {
		throw new InsightError("Not a valid filter");
	}

	return returnValue;
}

function negationConstructor(obj: any): Negation {
	let arr: Filter = jsonToFilter(obj);

	for (let field of obj) {
		arr = jsonToFilter(field);
	}

	return {
		i: 0,
		filter: arr
	};
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

	return {
		i: 0,
		sKey: tempSKey,
		inputString: tempInputString
	};
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

	return {
		i: 0,
		comparator: comp,
		mKey: tempMKey,
		num: tempNum
	};
}

function logicComparisonConstructor(log: string, obj: object[]): LogicComparison {
	let arr: Filter[] = [];

	for (let field of obj) {
		let temp = jsonToFilter(field);
		arr.push(temp);
	}

	return {
		i: 0,
		logic: log,
		filters: arr
	};
}

function verifyCorrectTypes(where: unknown, columns: unknown, order: unknown) {
	if (!(typeof where === "object")) {
		throw new InsightError("Invalid type for WHERE is type " + typeof where);
	}

	if (!Array.isArray(columns)) {
		throw new InsightError("COLUMNS is not an array, is " + typeof columns);
	}

	if (!(typeof order === "string")) {
		throw new InsightError("ORDER is not type string, is " + typeof order);
	}
}

function getDatasetIdFromQuery(query: Query): string {
	let queryKey: string = query.order;
	let underScorePos: number =  queryKey.indexOf("_");

	// -1 means that the value was not found therefore it was an invalid query
	if (underScorePos === -1) {
		throw new InsightError("Invalid query key, \n" +
			" expects: <dataset_id>_<dataset_key>, \n" +
			" actual: " + queryKey);
	}

	// returns just <dataset_id>
	return queryKey.slice(0, underScorePos);
}


export{isValidQuery, queryDatabase, verifyCorrectTypes, getDatasetIdFromQuery, jsonToFilter};

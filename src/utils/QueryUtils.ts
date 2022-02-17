import {Filter, InsightError, LogicComparison, Query} from "../controller/IInsightFacade";

function isValidQuery(query: unknown): boolean {
	// stub
	return false;
}

function queryDatabase(query: Query) {
	let datasetId: string = getDatasetIdFromQuery(query);


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


export{isValidQuery, queryDatabase, verifyCorrectTypes, getDatasetIdFromQuery};

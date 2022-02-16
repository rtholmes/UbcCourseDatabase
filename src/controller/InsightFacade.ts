import {
	Filter,
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, Query
} from "./IInsightFacade";

import {getDatasetIdFromQuery, isValidQuery, queryDatabase} from "../utils/QueryUtils";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	/*
		{
			"WHERE":{
			   "GT":{
				  "courses_avg":97
			   }
			},
			"OPTIONS":{
			   "COLUMNS":[
				  "courses_dept",
				  "courses_avg"
			   ],
			   "ORDER":"courses_avg"
			}
		}
	 */

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let obj: any;

		if (typeof query === "string") {
			obj = JSON.parse(query);
		} else if (Array.isArray(query) || typeof query === "object") {
			let jsonStr: string = JSON.stringify(query);
			obj = JSON.parse(jsonStr);
		} else {
			throw new InsightError("Given invalid query format");
		}


		//  '{"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"],"ORDER":"courses_avg"}}'

		// Object { WHERE: Object { GT: Object { courses_avg: 97 } }, OPTIONS: Object { COLUMNS: Array ["courses_dept", "courses_avg"], ORDER: "courses_avg" } }
		let where: Filter = obj.WHERE;
		let columns: string[] = obj.OPTIONS.COLUMNS;
		let order: string = obj.OPTIONS.ORDER;

		let queer: Query = new Query(where, columns, order);

		let id: string = getDatasetIdFromQuery(queer);

		queer.query();


		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}


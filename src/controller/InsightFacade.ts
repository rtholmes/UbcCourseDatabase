import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "./IInsightFacade";

import {
	toProperQueryFormat,
	jsonToFilter, toInsightResult, checkValidQueryParameters, getDatasetIdFromKey
} from "../utils/QueryUtils";

import {listFromDisk, removeFromDisk, checkValidId} from "../utils/DatasetUtils";
import CourseHandler from "../utils/CourseHandler";
import RoomHandler from "../utils/RoomHandler";
import {Query} from "../utils/Query";
import {Filter} from "../Filters/Filter";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private CourseHandler: CourseHandler;
	private RoomHandler: RoomHandler;
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.CourseHandler = new CourseHandler();
		this.RoomHandler = new RoomHandler();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			checkValidId(id);
		} catch (err) {
			return Promise.reject(err);
		}
		switch(kind) {
			case InsightDatasetKind.Courses: return this.CourseHandler.processData(content, id);
			case InsightDatasetKind.Rooms: return this.RoomHandler.processData(content, id);
		}
	}

	public removeDataset(id: string): Promise<string> {
		try {
			checkValidId(id);
		} catch (err) {
			return Promise.reject(err);
		}
		return removeFromDisk(id);
	}

	public performQuery(queryInput: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
		// let formattedQuery: any = toProperQueryFormat(queryInput);
		//
		// return new Promise((resolve, reject) => {
		// 	if (formattedQuery.OPTIONS === undefined) {
		// 		reject(new InsightError("OPTIONS undefined"));
		// 	}
		//
		// 	let where: Filter = formattedQuery.WHERE;
		// 	let columns: string[] = formattedQuery.OPTIONS.COLUMNS;
		// 	let order: string = formattedQuery.OPTIONS.ORDER;
		// 	checkValidQueryParameters(where, columns, order);
		//
		// 	let query: Query;
		// 	jsonToFilter(where).then((filter) => {
		// 		query = new Query(filter, columns, order);
		// 		let id = getDatasetIdFromKey(columns[0]);
		// 		return this.CourseHandler.getDataFromDiskGivenId(id);
		// 	}).then((data) => {
		// 		return query.query(data);
		// 	}).then((queriedData) => {
		// 		if (queriedData.length > 5000) {
		// 			reject(new ResultTooLargeError());
		// 		}
		// 		return query.organizeSections(queriedData);
		// 	}).then((organizedData) => {
		// 		return query.truncateSections(organizedData);
		// 	}).then((truncatedData) => {
		// 		resolve(toInsightResult(query.columns, truncatedData));
		// 	}).catch(() => {
		// 		reject(new InsightError());
		// 	});
		// });
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return listFromDisk();
	}
}


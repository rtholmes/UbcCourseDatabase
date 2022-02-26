import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "./IInsightFacade";

import {
	getPromiseOfDatasetIdFromQuery,
	jsonToFilter, toInsightResult
} from "../utils/QueryUtils";

import {isValidDatasetIdName} from "../utils/DatasetUtils";
import CourseHandler from "../utils/CourseHandler";
import {Filter, Query} from "../utils/Query";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private DatasetHandler: CourseHandler;
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.DatasetHandler = new CourseHandler();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// Check for valid id
		if (!isValidDatasetIdName(id)) {
			return Promise.reject(new InsightError("Given an invalid id " + id));
		}
		// Check for existing id
		if (this.DatasetHandler.isExistingDatasetIdName(id)) {
			return Promise.reject(new InsightError("Given an already existing id " + id));
		}
		// Check for dataset type
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Given dataset kind Rooms"));
		}
		// Extract data and load to disk, return any errors
		return new Promise((resolve, reject) => {
			this.DatasetHandler.processData(content, id)
				.then(function (result) {
					resolve(result);
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}

	public removeDataset(id: string): Promise<string> {
		// Check for valid id
		if (!isValidDatasetIdName(id)) {
			return Promise.reject(new InsightError("Given an invalid id " + id));
		}
		// Search for existing id, remove from disk if it exists, error otherwise
		return new Promise((resolve, reject) => {
			this.DatasetHandler.removeFromDisk(id)
				.then(function (result) {
					resolve(result);
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let obj: any;

		if (typeof query === "string") {
			obj = JSON.parse(query);
		} else if (Array.isArray(query) || typeof query === "object") {
			let jsonStr: string = JSON.stringify(query);
			obj = JSON.parse(jsonStr);
		} else {
			return Promise.reject(new InsightError("Given invalid query format"));
		}

		return new Promise((resolve, reject) => {
			if (obj.OPTIONS === undefined) {
				reject(new InsightError("OPTIONS undefined"));
			}

			let where: Filter = obj.WHERE;
			let columns: string[] = obj.OPTIONS.COLUMNS;
			let order: string = obj.OPTIONS.ORDER;
			if (where === undefined ||
				columns === undefined ||
				columns.length === 0 ||
				order === undefined ||
				order.length === 0) {
				reject(new InsightError("Invalid query"));
			}

			let queer: Query;
			jsonToFilter(where).then((filter) => {
				queer = new Query(filter, columns, order);
				return getPromiseOfDatasetIdFromQuery(queer);
			}).then((id) => {
				return this.DatasetHandler.getDataFromDiskGivenId(id);
			}).then((data) => {
				return queer.query(data);
			}).then((queriedData) => {
				if (queriedData.length > 5000) {
					reject(new ResultTooLargeError());
				}
				return queer.organizeSections(queriedData);
			}).then((organizedData) => {
				return queer.truncateSections(organizedData);
			}).then((truncatedData) => {
				resolve(toInsightResult(queer.columns, truncatedData));
			}).catch(() => {
				reject(new InsightError());
			});
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		// Load datasets from disk, print each InsightDataset
		return new Promise((resolve, reject) => {
			this.DatasetHandler.listFromDisk()
				.then(function (result) {
					resolve(result);
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}
}

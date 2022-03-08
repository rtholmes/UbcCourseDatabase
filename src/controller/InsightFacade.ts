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

import {isValidDatasetIdName} from "../utils/DatasetUtils";
import CourseHandler from "../utils/CourseHandler";
import {Query} from "../utils/Query";
import {Filter} from "../Filters/Filter";
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

	public performQuery(queryInput: unknown): Promise<InsightResult[]> {
		let formattedQuery: any = toProperQueryFormat(queryInput);

		return new Promise((resolve, reject) => {
			if (formattedQuery.OPTIONS === undefined) {
				reject(new InsightError("OPTIONS undefined"));
			}

			let where: Filter = formattedQuery.WHERE;
			let columns: string[] = formattedQuery.OPTIONS.COLUMNS;
			let order: string = formattedQuery.OPTIONS.ORDER;
			checkValidQueryParameters(columns, order);

			let query: Query;
			jsonToFilter(where).then((filter) => {
				query = new Query(filter, columns, order);
				let id = getDatasetIdFromKey(order);
				return this.DatasetHandler.getDataFromDiskGivenId(id);
			}).then((data) => {
				return query.query(data);
			}).then((queriedData) => {
				if (queriedData.length > 5000) {
					reject(new ResultTooLargeError());
				}
				return query.organizeSections(queriedData);
			}).then((organizedData) => {
				return query.truncateSections(organizedData);
			}).then((truncatedData) => {
				resolve(toInsightResult(query.columns, truncatedData));
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

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import {isValidDatasetIdName} from "../../src/utils/DatasetUtils";
import CourseHandler from "../utils/CourseHandler";
import JSZip from "jszip";
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
		return Promise.reject("Not implemented.");
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

import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";

import {isValidDatasetIdName, isValidContentType} from "../../src/utils/DatasetUtils";

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
		if (!isValidDatasetIdName(id)) {
			return Promise.reject (new InsightError("Given an invalid id " + id));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject (new InsightError("Given dataset kind Rooms"));
		}
		if (!isValidContentType(content)) {
			return Promise.reject (new InsightError("Given a non zip file"));
		}
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}

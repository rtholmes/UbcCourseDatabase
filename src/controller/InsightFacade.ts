import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";

import {isValidDatasetIdName} from "../../src/utils/DatasetUtils";
import JSZip from "jszip";
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
			return Promise.reject(new InsightError("Given an invalid id " + id));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Given dataset kind Rooms"));
		}

		// Todo: Properly configure promises below & figure out non zip case
		JSZip.loadAsync(content, {base64: true}).then(function (zip) {
			zip.folder("courses")?.forEach(((relativePath, file) => {
				file.async("string").then((contents) => {
					const obj = JSON.parse(contents);
					const result = obj.result;
					for (let i = 0; i <= result.length; i++) {
						let dept = result[i].Subject;
						let id = result[i].Course;
						let avg = result[i].Avg;
						let instructor = result[i].Professor;
						let title = result[i].Title;
						let pass = result[i].Pass;
						let fail = result[i].Fail;
						let audit = result[i].Audit;
						let uuid = result[i].id;
						let year = result[i].Year;
						if (result[i].Section === "overall") {
							year = "1900";
						}
						if (dept !== undefined && id !== undefined && avg !== undefined &&
							instructor !== undefined && title !== undefined && pass !== undefined &&
							fail !== undefined && audit !== undefined && uuid !== undefined && year !== undefined) {
							// Todo: Save valid fields to some data structure
						}
					}
				});
			}));
		});
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

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
						let COURSE_DEPT = result[i].Subject;
						let COURSE_ID = result[i].Course;
						let COURSE_AVG = result[i].Avg;
						let COURSE_INSTRUCTOR = result[i].Professor;
						let COURSE_TITLE = result[i].Title;
						let COURSE_PASS = result[i].Pass;
						let COURSE_FAIL = result[i].Fail;
						let COURSE_AUDIT = result[i].Audit;
						let COURSE_UUID = result[i].id;
						let COURSE_YEAR = result[i].Year;
						if (result[i].Section === "overall") {
							COURSE_YEAR = "1900";
						}
						if (COURSE_DEPT !== undefined && id !== undefined && COURSE_AVG !== undefined &&
							COURSE_INSTRUCTOR !== undefined && COURSE_TITLE !== undefined && COURSE_PASS !== undefined
							&& COURSE_FAIL !== undefined && COURSE_AUDIT !== undefined && COURSE_UUID !== undefined &&
							COURSE_YEAR !== undefined) {
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

import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import JSZip from "jszip";
import * as fs from "fs-extra";

export default class CourseHandler {
	private coursesDataset: any[];

	constructor() {
		this.coursesDataset = [];
	}

	public processData(content: string, id: string): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}
}

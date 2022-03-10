import {InsightError} from "../controller/IInsightFacade";
import {checkExistingIdName, unzipData, checkDatasetLength, saveToDisk, grabDatasetIds} from "../utils/DatasetUtils";
import JSZip from "jszip";
import * as fs from "fs-extra";
import {CourseData} from "./CourseData";

export default class CourseHandler {
	private coursesDataset: any[];

	constructor() {
		this.coursesDataset = [];
	}

	/**
	 * Processes and stores inserted data for InsightFacade
	 *
	 * Promise should fulfill with a string array of all currently added dataset ids
	 * Promise should reject with an InsightError describing the error
	 *
	 * @param content: The content of a database
	 * @param id: The id of a database
	 */
	public processData(content: string, id: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			checkExistingIdName(id);
			unzipData(content)
				.then((unZippedContent) => {
					return Promise.all(this.parseData(unZippedContent));
				})
				.then((JSONs) => {
					this.checkFileLength(JSONs);
					this.grabData(JSONs);
					checkDatasetLength(this.coursesDataset);
					return saveToDisk(id, this.coursesDataset);
				}).then(() => {
					return grabDatasetIds();
				}).then(function (addedIds) {
					resolve(addedIds);
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}

	/**
	 * Reads JSON files in courses folder
	 *
	 * Will return an Array of promises, each containing
	 * readable JSON content from /courses directory of type string
	 *
	 * @param unZippedContent: The unzipped content read from JSZIP
	 */
	private parseData(unZippedContent: JSZip): Array<Promise<any>> {
		let promiseArray: Array<Promise<any>> = [];
		unZippedContent.folder("courses")?.forEach(((relativePath, file) => {
			promiseArray.push(file.async("string"));
		}));
		return promiseArray;
	}

	/**
	 * Grabs relevant fields from valid sections
	 *
	 * Will return the number of valid sections added to database
	 *
	 * @param JSONs: The readable JSON content from /courses directory
	 */
	private grabData(JSONs: string[]): number {
		this.coursesDataset = [];
		let validSectionsAdded = 0;
		for (const val of JSONs) {
			try {
				let result = JSON.parse(val).result;
				for (const field of result) {
					if (field.Section === "overall") {
						field.Year = "1900"; // set year to 1900 if section === overall
					}
					let attributes = [
						field.Subject,
						field.Course,
						field.Avg,
						field.Professor,
						field.Title,
						field.Pass,
						field.Fail,
						field.Audit,
						String(field.id),
						Number(field.Year)
					];
					this.checkValidSection(attributes);
				}
			} catch { // invalid JSON, skip over
			}
		}
		return validSectionsAdded;
	}

	/**
	 * Checks if any fields in course section are undefined
	 *
	 * Will do nothing if any field is undefined,
	 * push fields to course dataset otherwise
	 *
	 * @param attributes: The array of fields grabbed from JSONs
	 */
	private checkValidSection(attributes: any[]): void {
		for (const val of attributes) {
			if (val === undefined) {
				return;
			}
		}
		this.coursesDataset.push(attributes);
	}

	/**
	 * Grabs database from disk given id
	 *
	 * Will return with the requested course database as a 2D array,
	 * Will throw InsightError if database with given id does not exist
	 */
	public getDataFromDiskGivenId(id: string): Promise<CourseData[]> {
		return new Promise(function (resolve, reject) {
			if (fs.existsSync("./data/")) {
				let path: string = "./data/" + id + ".txt";
				let jsons = JSON.parse(fs.readFileSync(path,"utf8"));
				let returnVal: CourseData[] = [];
				for (let json of jsons) {
					let attributes = new Map([
						["dept", json[0]],
						["id", json[1]],
						["avg", json[2]],
						["instructor", json[3]],
						["title", json[4]],
						["pass", json[5]],
						["fail", json[6]],
						["audit", json[7]],
						["uuid", json[8]],
						["year", json[9]]
					]);
					returnVal.push(new CourseData(attributes));
				}
				resolve(returnVal);
			} else {
				reject(new InsightError(`Could not find data in folder with id: ${id}`));
			}
		});
	}

	/**
	 * Handles no course folder contents error for processData
	 *
	 * Will throw InsightError if no course folder contents were extracted,
	 * does nothing otherwise
	 *
	 * @param JSONs: The readable JSON content from /courses directory
	 */
	protected checkFileLength(JSONs: string[]): void {
		if (JSONs.length === 0) {
			throw new InsightError("No course folder contents exist");
		}
		return;
	}
}

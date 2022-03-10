import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import JSZip from "jszip";
import * as fs from "fs-extra";
import {isString} from "util";

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
			this.checkExistingIdName(id);                                       // 0.5) Check for existing id name
			this.unzipData(content)                                             // 1) Unzip Data, check if non zip
				.then((unZippedContent) => {
					return Promise.all(this.parseData(unZippedContent));        // 2) Grab all ./courses/ files
				})
				.then((JSONs) => {
					this.checkFileLength(JSONs);                                // 3) Check if no ./courses/ files
					this.grabData(JSONs);										// 4) Store valid sections to array
					this.checkDatasetLength();									// 5) Check if any valid sections exist
					return this.saveToDisk(id);                                 // 6) Save valid sections to disk
				}).then(() => {
					return this.grabDatasetIds(); 							    // 7) Grab all added ids from disk
				}).then(function (addedIds) {
					resolve(addedIds);											// 8) Return ids
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}

	/**
	 * Unzips content using JSZip
	 *
	 * Promise should fulfill with an updated zip object
	 * Promise should reject with an InsightError describing the error
	 *
	 * @param content: The content of a database
	 */
	private unzipData(content: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let zip = new JSZip();
			zip.loadAsync(content, {base64: true}).then(function (result) {
				resolve(result);
			}).catch(function () {
				reject(new InsightError("Given a non zip file"));
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
	 * Saves courses to disk
	 *
	 * Will return true on success,
	 * false otherwise
	 */
	private saveToDisk(id: string): void {
		if (!fs.existsSync("./data/")) {
			fs.mkdirSync("./data/");
		}
		const path = "./data/" + id + ".txt";
		fs.writeFileSync(path, JSON.stringify(this.coursesDataset));
	}

	/**
	 * Grabs all dataset ids from disk
	 *
	 * Will return with array of currently added ids
	 */
	private grabDatasetIds(): Promise<string[]> {
		let datasetIdNames: string[] = [];
		fs.readdirSync("./data/").forEach((file) => {
			let datasetIdName = file.substring(0, file.length - 4);
			datasetIdNames.push(datasetIdName);
		});
		return new Promise(function (resolve) {
			resolve(datasetIdNames);
		});
	}

	/**
	 * Checks if id exists in disk
	 *
	 * Will return true if id is unique,
	 * false otherwise
	 *
	 * @param id: The id of a database
	 */
	public checkExistingIdName(id: string): void {
		if (fs.existsSync("./data/")) {
			fs.readdirSync("./data/").forEach((file) => {
				let datasetIdName = file.substring(0, file.length - 4);
				if (id === datasetIdName) {
					throw new InsightError("Given an already existing id " + id);
				}
			});
		}
		return;
	}

	/**
	 * Removes dataset from disk
	 *
	 * Promise should fulfill with the deleted database id,
	 * throws NotFoundError otherwise
	 *
	 * @param id: The id of a database
	 */
	public removeFromDisk(id: string): Promise<string> {
		try{
			const path = "./data/" + id + ".txt";
			fs.statSync(path);
			fs.unlinkSync(path);
			return new Promise(function (resolve) {
				resolve(id);
			});
		} catch {
			throw new NotFoundError("id does not exist");
		}
	}

	/**
	 * List all currently added datasets from disk,
	 * including their id, type, and number of rows/valid sections
	 *
	 * Promise should fulfill with an array of currently added InsightDatasets,
	 * and will only fulfill
	 */
	public listFromDisk(): Promise<InsightDataset[]> {
		let dataset: InsightDataset;
		let addedInsightDatasets: InsightDataset[] = [];
		if (fs.existsSync("./data/")) {
			fs.readdirSync("./data/").forEach((file) => {
				let path = "./data/" + file;
				this.coursesDataset = JSON.parse(fs.readFileSync(path, "utf8"));
				let datasetIdName = file.substring(0, file.length - 4);
				if (typeof (this.coursesDataset[0][2]) === "string") {
					dataset = {
						id: datasetIdName,
						kind: InsightDatasetKind.Rooms,
						numRows: this.coursesDataset.length
					};
				} else {
					dataset = {
						id: datasetIdName,
						kind: InsightDatasetKind.Courses,
						numRows: this.coursesDataset.length
					};
				}
				addedInsightDatasets.push(dataset);
			});
		}
		return new Promise(function (resolve) {
			resolve(addedInsightDatasets);
		});
	}

	/**
	 * Grabs database from disk given id
	 *
	 * Will return with the requested course database as a 2D array,
	 * Will throw InsightError if database with given id does not exist
	 */
	public getDataFromDiskGivenId(id: string): Promise<Array<Array<string | number>>> {
		return new Promise(function (resolve, reject) {
			if (fs.existsSync("./data/")) {
				let path: string = "./data/" + id + ".txt";
				resolve(JSON.parse(fs.readFileSync(path,"utf8")));
			} else {
				reject(new InsightError(`Could not find data in folder with id: ${id}`));
			}
		});
	}

	/**
	 * Handles no valid section error for processData
	 *
	 * Will throw InsightError if no valid sections were extracted,
	 * does nothing otherwise
	 */
	private checkDatasetLength(): void {
		if (this.coursesDataset.length === 0) {
			throw new InsightError("No valid sections exist");
		}
		return;
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

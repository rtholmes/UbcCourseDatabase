import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import JSZip from "jszip";
import * as fs from "fs-extra";
import parse5, {parse} from "parse5";
import * as http from "http";

export default class RoomHandler {
	private roomsDataset: any[];
	private buildingsDataset: any[];
	private roomAttributes: any[];
	private buildingAttributes: any[];

	constructor() {
		this.roomsDataset = [];
		this.buildingsDataset = [];
		this.roomAttributes = ["NULL", "NULL", "NULL", "NULL", "NULL", 0, 0, 0, "NULL", "NULL", "NULL"];
		this.buildingAttributes = ["NULL", "NULL", "NULL", "NULL"];
	}

	// TODO:
	//  - turn index.htm into tree1, wait for result
	//  - Extract Building Info from tree1 w/ DFS
	//  - Save each building info in buildingAttributes[] + append to buildingsDataset[]
	//  - For each building inside buildingsDataset[], use href to make tree234.., append to promise list
	//  - After promise.all, extract room info from tree234.. (need to make sure a building knows its rooms somehow?)
	//  - Save each room info to roomAttributes[] (with combined buildingAttributes) + append to roomsDataset[]
	//  - Extract addresses from roomsDataset[] to find GeoLocations, save results to roomsDataset[]
	//  - Save roomsDataset[] to disk
	public processData(content: string, id: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			this.checkExistingIdName(id);
			this.unzipData(content)
				.then((unZippedContent) => {
					try {
						return unZippedContent.file("rooms/index.htm").async("string").then((data: any) => {
							const document = parse5.parse(data);
							// eslint-disable-next-line max-nested-callbacks
							this.doSomeDFS(document, unZippedContent);
							console.log(this.roomsDataset);
							console.log(this.roomAttributes);
							resolve(Promise.reject("Not implemented."));
						});
					} catch {
						reject(new InsightError("No Rooms Folder"));
					}
				})
				.catch(function (err) {
					reject(err);
				});
		});
	}

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

	private checkExistingIdName(id: string): void {
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

	private doSomeDFS(document: any, unZippedContent: any) {
		if (document.nodeName === "tr") {
			try {
				let buildingCode = document.childNodes[3].childNodes[0].value;
				let buildingTitle = document.childNodes[5].childNodes[1].childNodes[0].value;
				let buildingAddress = document.childNodes[7].childNodes[0].value;
				let buildingHref = document.childNodes[5].childNodes[1].attrs[0].value.substring(1);
				this.roomAttributes[0] = buildingTitle.trim();
				this.roomAttributes[1] = buildingCode.trim();
				this.roomAttributes[4] = buildingAddress.trim();
				return this.grabRooms(buildingHref, unZippedContent).then(() => {
					return;
				});
			} catch {
				return;
			}
		}
		try {
			for (let i = 0; i <= document.childNodes.length; i++) {
				this.doSomeDFS(document.childNodes[i], unZippedContent);
			}
		} catch {
			return;
		}
		return;
	}

	private grabRooms(buildingHref: string, unZippedContent: any) {
		return new Promise((resolve, reject) => {
			try {
				return unZippedContent.file("rooms" + buildingHref).async("string").then((data: any) => {
					const document = parse5.parse(data);
					resolve(this.doMoreDFS(document));
				});
			} catch {
				// Room folder does not exist, skip over
				return;
			}
		});
	}

	private doMoreDFS(document: any) {
		if (document.nodeName === "tr") {
			try {
				let roomNumber = document.childNodes[1].childNodes[1].childNodes[0].value;
				let roomCapacity = document.childNodes[3].childNodes[0].value;
				let roomFurniture = document.childNodes[5].childNodes[0].value;
				let roomType = document.childNodes[7].childNodes[0].value;
				let roomHref = document.childNodes[9].childNodes[1].attrs[0].value;
				this.roomAttributes[2] = roomNumber.trim();
				this.roomAttributes[3] = this.roomAttributes[1] + "_" + roomNumber.trim();
				this.roomAttributes[7] = roomCapacity.trim();
				this.roomAttributes[8] = roomType.trim();
				this.roomAttributes[9] = roomFurniture.trim();
				this.roomAttributes[10] = roomHref.trim();
				this.roomsDataset.push(this.roomAttributes);
			} catch {
				return;
			}
		}
		try {
			for (let i = 0; i <= document.childNodes.length; i++) {
				this.doMoreDFS(document.childNodes[i]);
			}
		} catch {
			return;
		}
		return;
	}

	private requestGeolocation(attributes: Array<string | number>): Promise<any> {
		return new Promise((resolve, reject) => {
			let URLAddress = encodeURI(attributes[4] as string);
			let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team678/" + URLAddress;
			http.get(url, function (res: any) {
				let data = "";
				res.on("data", function (segment: any) {
					data += segment.toString();
				});
				res.on("end", function () {
					resolve(JSON.parse(data));
				});
			}).on("error", function (err: any) {
				console.log(err);
				reject(err);
			});
		});
	}
}

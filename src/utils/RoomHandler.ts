import {InsightError} from "../controller/IInsightFacade";
import {checkExistingIdName, unzipData, checkDatasetLength, saveToDisk, grabDatasetIds} from "../utils/DatasetUtils";
import JSZip from "jszip";
import parse5 from "parse5";

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
	// 	- Implement geolocation lat/lon
	public processData(content: string, id: string): Promise<string[]> {
		this.roomsDataset = [];
		this.buildingsDataset = [];
		return new Promise((resolve, reject) => {
			checkExistingIdName(id);
			unzipData(content)
				.then((unZippedContent) => {
					try {
						return unZippedContent.file("rooms/index.htm").async("string");
					} catch {
						throw new InsightError("No rooms folder exists");
					}
				})
				.then((data: any) => {
					const document = parse5.parse(data);
					this.extractBuildingInfo(document);
					return unzipData(content);
				})
				.then((unZippedContent) => {
					return Promise.all(this.grabRoomHtmlFiles(unZippedContent));
				})
				.then((files) => {
					let trees = this.turnFilesIntoTrees(files);
					this.extractRoomInfo(trees);
					checkDatasetLength(this.roomsDataset);
					saveToDisk(id, this.roomsDataset);
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

	private extractBuildingInfo(document: any) {
		if (document.nodeName === "tr") {
			try {
				this.buildingAttributes = [];
				let buildingCode = document.childNodes[3].childNodes[0].value;
				let buildingTitle = document.childNodes[5].childNodes[1].childNodes[0].value;
				let buildingAddress = document.childNodes[7].childNodes[0].value;
				if (buildingAddress.trim() === "") {
					return;
				}
				let buildingHref = document.childNodes[5].childNodes[1].attrs[0].value.substring(1);
				this.buildingAttributes[0] = buildingTitle.trim();
				this.buildingAttributes[1] = buildingCode.trim();
				this.buildingAttributes[2] = buildingAddress.trim();
				this.buildingAttributes[3] = buildingHref.trim();
				this.buildingsDataset.push(this.buildingAttributes);
			} catch {
				return;
			}
		}
		try {
			for (let i = 0; i <= document.childNodes.length; i++) {
				this.extractBuildingInfo(document.childNodes[i]);
			}
		} catch {
			return;
		}
		return;
	}

	private grabRoomHtmlFiles(unZippedContent: JSZip): Array<Promise<any> | undefined > {
		let promiseArray: Array<Promise<any> | undefined > = [];
		for (let i = 0; i < this.buildingsDataset.length; i++) {
			let buildingHref = this.buildingsDataset[i][3];
			if (unZippedContent.file("rooms" + buildingHref) !== null) {
				promiseArray.push(unZippedContent.file("rooms" + buildingHref)?.async("string"));
			} else {
				this.buildingsDataset[i] = undefined;
			}
		}
		this.buildingsDataset = this.buildingsDataset.filter(function (element) {
			return element !== undefined;
		});
		return promiseArray;
	}

	private turnFilesIntoTrees(files: any[]): any[] {
		let trees = [];
		for (const item of files) {
			if (item !== undefined) {
				const document = parse5.parse(item);
				trees.push(document);
			}
		}
		return trees;
	}

	private extractRoomInfo(trees: any[]) {
		for (let i = 1; i < trees.length; i++) {
			this.extractBuildingRoomInfo(trees[i], this.buildingsDataset[i]);
		}
	}

	private extractBuildingRoomInfo(treeElement: any, buildingsDatasetElement: any) {
		if (treeElement.nodeName === "tr") {
			try {
				this.roomAttributes = [];
				let roomNumber = treeElement.childNodes[1].childNodes[1].childNodes[0].value;
				let roomCapacity = treeElement.childNodes[3].childNodes[0].value;
				if (roomCapacity.trim() === ""){
					roomCapacity = 0;
				} else {
					roomCapacity = Number(roomCapacity.trim());
				}
				let roomFurniture = treeElement.childNodes[5].childNodes[0].value;
				let roomType = treeElement.childNodes[7].childNodes[0].value;
				let roomHref = treeElement.childNodes[9].childNodes[1].attrs[0].value;
				this.roomAttributes[0] = buildingsDatasetElement[0];
				this.roomAttributes[1] = buildingsDatasetElement[1];
				this.roomAttributes[2] = roomNumber.trim();
				this.roomAttributes[3] = this.roomAttributes[1] + "_" + roomNumber.trim();
				this.roomAttributes[4] = buildingsDatasetElement[2];
				this.roomAttributes[7] = roomCapacity;
				this.roomAttributes[8] = roomType.trim();
				this.roomAttributes[9] = roomFurniture.trim();
				this.roomAttributes[10] = roomHref.trim();
				this.roomsDataset.push(this.roomAttributes);
			} catch {
				return;
			}
		}
		try {
			for (let i = 0; i <= treeElement.childNodes.length; i++) {
				this.extractBuildingRoomInfo(treeElement.childNodes[i], buildingsDatasetElement);
			}
		} catch {
			return;
		}
		return;
	}
}

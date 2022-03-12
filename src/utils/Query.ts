import {getDatasetIdFromKey, getFieldFromKey} from "./QueryUtils";
import {InsightError} from "../controller/IInsightFacade";
import {Filter} from "../Filters/Filter";
import {CourseData} from "./CourseData";

export class Query {
	public where: Filter;
	public columns: string[]; // array of mkey and skey
	public order: string | undefined; // mkey or skey
	public static datasetName: string;

	constructor(where: Filter, columns: string[], order: string | undefined) {
		this.where = where;
		this.columns = columns;
		this.order = order;

		for (let column of this.columns) {
			Query.isRepeatDataId(getDatasetIdFromKey(column));
		}
		if (this.order !== undefined) {
			Query.isRepeatDataId(getDatasetIdFromKey(this.order));
		}
	}

	public static isRepeatDataId(str: string) {
		if (this.datasetName === undefined) {
			this.datasetName = str;
			return;
		} else {
			if (this.datasetName !== str) {
				throw new InsightError("Used multiple datasets");
			}
		}
	}

	public query(data: CourseData[]): Promise<CourseData[]> {
		return this.where.query(data);
	}

	public truncateSections(data: CourseData[]): Promise<CourseData[]> {
		let returnVal: CourseData[] = [];
		let value: string | number | undefined;
		for (let dataPoint of data) {
			let orderedDataPoint: CourseData = new CourseData(new Map<string, string | number>());
			for (let column of this.columns) {
				value = dataPoint.get(getFieldFromKey(column));
				if (value === undefined) {
					throw new InsightError("Invalid key");
				}
				orderedDataPoint.set(column, value);
			}
			returnVal.push(orderedDataPoint);
		}

		return new Promise(function (resolve) {
			resolve(returnVal);
		});
	}

	public organizeSections(data: CourseData[]): Promise<CourseData[]> {
		if (this.order === undefined) {

			return new Promise((resolve) => {
				resolve(data);
			});

		} else {

			let map: Map<string | number, CourseData[]> = new Map();

			let key: string = getFieldFromKey(this.order);

			for (const dataPoint of data) {
				let value: string | number | undefined = dataPoint.get(key);
				if (value === undefined) {
					throw new InsightError("Invalid key");
				}
				let valOfMapAtDataPoint = map.get(value);
				if (valOfMapAtDataPoint === undefined) {
					valOfMapAtDataPoint = [];
				}
				valOfMapAtDataPoint.push(dataPoint);
				map.set(value, valOfMapAtDataPoint);
			}

			const sortedMap = new Map([...map.entries()].sort());

			let returnVal: CourseData[] = [];

			for (let val of sortedMap.values()) {
				for (let valElement of val.reverse()) {
					returnVal.push(valElement);
				}
			}

			return new Promise(function (resolve) {
				resolve(returnVal);
			});
		}
	}
}

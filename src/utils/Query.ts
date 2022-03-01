import {getFieldFromKey, getIndexOfGivenField} from "./QueryUtils";
import {InsightError} from "../controller/IInsightFacade";
import {Filter} from "../Filters/Filter";

export class Query {
	public where: Filter;
	public columns: string[]; // array of mkey and skey
	public order: string; // mkey or skey
	public static datasetName: string;

	constructor(where: Filter, columns: string[], order: string) {
		this.where = where;
		this.columns = columns;
		this.order = order;
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

	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		return this.where.query(data);
	}

	public truncateSections(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		let returnVal: Array<Array<string | number>> = [];
		let orderOfFields: number[] = [];
		for (let column of this.columns) {
			orderOfFields.push(getIndexOfGivenField(getFieldFromKey(column)));
		}
		for (let dataPoint of data) {
			let orderedDataPoint: Array<string | number> = [];
			for (let field of orderOfFields) {
				orderedDataPoint.push(dataPoint[field]);
			}
			returnVal.push(orderedDataPoint);
		}

		return new Promise(function (resolve) {
			resolve(returnVal);
		});
	}

	public organizeSections(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		let map: Map<string | number, Array<Array<number | string>>> = new Map();

		let orderIndex: number = getIndexOfGivenField(getFieldFromKey(this.order));

		for (const dataPoint of data) {
			let valOfMapAtDataPoint: Array<Array<string | number>> | undefined = map.get(dataPoint[orderIndex]);
			if (valOfMapAtDataPoint === undefined) {
				valOfMapAtDataPoint = [];
			}
			valOfMapAtDataPoint.push(dataPoint);
			map.set(dataPoint[orderIndex], valOfMapAtDataPoint);
		}

		const sortedMap = new Map([...map.entries()].sort());

		let returnVal: Array<Array<string | number>> = [];

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


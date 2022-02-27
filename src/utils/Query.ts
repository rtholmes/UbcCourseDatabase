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
		let arr: Array<Array<string | number>> = [];
		let arr2: number[] = [];
		for (let temp of this.columns) {
			arr2.push(getIndexOfGivenField(getFieldFromKey(temp)));
		}
		for (let varTemp of data) {
			let arr3: Array<string | number> = [];
			for (let i of arr2) {
				arr3.push(varTemp[i]);
			}
			arr.push(arr3);
		}

		return new Promise(function (resolve) {
			resolve(arr);
		});
	}

	public organizeSections(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		let map: Map<string | number, Array<Array<number | string>>> = new Map();

		let temp: number = getIndexOfGivenField(getFieldFromKey(this.order));

		for (const varTemp of data) {
			let temp2: Array<Array<string | number>> | undefined = map.get(varTemp[temp]);
			if (temp2 === undefined) {
				temp2 = [];
			}
			temp2.push(varTemp);
			map.set(varTemp[temp], temp2);
		}

		const sortedMap = new Map([...map.entries()].sort());

		let returnVal: Array<Array<string | number>> = [];

		for (let val of sortedMap.values()) {
			for (let temp3 of val) {
				returnVal.push(temp3);
			}
		}

		return new Promise(function (resolve) {
			resolve(returnVal);
		});
	}
}


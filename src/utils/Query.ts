import {getIndexOfGivenAttribute, getKeyFromIdKey, queryAllFilters} from "./QueryUtils";
import {InsightError} from "../controller/IInsightFacade";

export class LogicComparison implements Filter {
	// AND || OR
	private logic: string;
	private filters: Filter[];

	constructor(logic: string, filters: Filter[]) {
		this.logic = logic;
		this.filters = filters;
	}

	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		return new Promise((resolve) => {
			queryAllFilters(this.filters, data).then((multiArr) => {

				if (this.logic === "AND") {

					multiArr[0] = multiArr[0].filter((element) => {
						let bool = true;
						for (let arr2 of multiArr) {
							if (!arr2.includes(element)) {
								bool = false;
							}
						}
						return bool;
					});

					resolve(multiArr[0]);

				} else {

					let tempArr: Array<Array<string | number>> = [];
					for (let ele of multiArr) {
						// combines the tempArr with the ele then filters out duplicates
						tempArr = tempArr.concat(ele).filter(
							function (elem, index, self) {
								return index === self.indexOf(elem);
							});
					}

					resolve(tempArr);
				}
			});
		});
	}
}

export class MComparison implements Filter {
	// GT || EQ || LT
	private comparator: string;
	private mKey: string;
	private num: number;

	constructor(comparator: string, mKey: string, num: number) {
		this.comparator = comparator;
		this.mKey = mKey;
		this.num = num;
	}

	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		let arr: Array<Array<string | number>> = [];
		let key = getKeyFromIdKey(this.mKey);
		let pos = getIndexOfGivenAttribute(key);

		for (let val of data) {
			if (this.comparator === "EQ") {
				if (val[pos] === this.num) {
					arr.push(val);
				}
			} else if (this.comparator === "GT") {
				if (val[pos] > this.num) {
					arr.push(val);
				}
			} else {
				if (val[pos] < this.num) {
					arr.push(val);
				}
			}
		}

		return new Promise(function (resolve) {
			resolve(arr);
		});
	}
}

export class SComparison implements Filter {
	private sKey: string;
	private inputString: string;

	constructor(sKey: string, inputString: string) {
		this.sKey = sKey;
		this.inputString = inputString;
	}

	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		let arr: Array<Array<string | number>> = [];
		let key = getKeyFromIdKey(this.sKey);
		let pos = getIndexOfGivenAttribute(key);

		for (let val of data) {
			if (val[pos] === this.inputString) {
				arr.push(val);
			}
		}

		return new Promise(function (resolve) {
			resolve(arr);
		});
	}
}

export class Negation implements Filter {
	private filter: Filter;

	constructor(filter: Filter) {
		this.filter = filter;
	}

	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		return new Promise((resolve) => {
			this.filter.query(data).then((queried: Array<Array<string | number>>) => {
				let validArr: Array<Array<string | number>>;
				// if data includes valid in invalidArr remove it
				validArr = data.filter((element: Array<string | number>) => {
					return !queried.includes(element);
				});
				resolve(validArr);
			});
		});
	}
}

export interface Filter {
	query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>>;
}

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
			arr2.push(getIndexOfGivenAttribute(getKeyFromIdKey(temp)));
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

		let temp: number = getIndexOfGivenAttribute(getKeyFromIdKey(this.order));

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

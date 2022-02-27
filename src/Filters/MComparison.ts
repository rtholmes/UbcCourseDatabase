import {InsightError} from "../controller/IInsightFacade";
import {checkCorrectTypeOfValueForKey} from "../utils/DatasetUtils";
import {getDatasetIdFromKey, getFieldFromKey, getIndexOfGivenField} from "../utils/QueryUtils";
import {Filter} from "./Filter";
import {Query} from "../utils/Query";

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
		let filteredData: Array<Array<string | number>> = [];
		let key = getFieldFromKey(this.mKey);
		let pos = getIndexOfGivenField(key);

		for (const dataPoint of data) {
			if (this.comparator === "EQ") {
				if (dataPoint[pos] === this.num) {
					filteredData.push(dataPoint);
				}
			} else if (this.comparator === "GT") {
				if (dataPoint[pos] > this.num) {
					filteredData.push(dataPoint);
				}
			} else {
				if (dataPoint[pos] < this.num) {
					filteredData.push(dataPoint);
				}
			}
		}

		return new Promise(function (resolve) {
			resolve(filteredData);
		});
	}
}

/**
 * Take the json containing the mCompare filter and formats it
 * throws InsightError is MKey or num are invalid or of mismatching expected types
 * Throws InsightError if it will ask for a different database then the one already being used
 *
 * @param comp: The comparator used either "GT" | "LT" | "EQ"
 * @param json: The unformatted json
 *
 * @return MComparison: Returns the MComparison filter
 */
export function mCompareConstructor(comp: string, json: any): MComparison {
	let tempMKey: any;
	let tempNum: any;

	for (const field in json) {
		tempMKey = field;
		tempNum = json[field];
	}

	if ((typeof tempMKey) !== "string" || (typeof tempNum) !== "number") {
		throw new InsightError(`incorrect typing for mkey and/or number \n
			mKey: ${typeof tempMKey} \n
		  	number: ${typeof tempNum}`);
	}

	checkCorrectTypeOfValueForKey(getFieldFromKey(tempMKey), tempNum);
	Query.isRepeatDataId(getDatasetIdFromKey(tempMKey));
	return new MComparison(comp, tempMKey, tempNum);
}

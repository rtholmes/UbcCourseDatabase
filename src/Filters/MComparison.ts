import {InsightError} from "../controller/IInsightFacade";
import {checkCorrectTypeOfValueForKey} from "../utils/DatasetUtils";
import {getDatasetIdFromKey, getFieldFromKey} from "../utils/QueryUtils";
import {Filter} from "./Filter";
import {Query} from "../utils/Query";
import {CourseData} from "../utils/CourseData";

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

	public query(data: CourseData[]): Promise<CourseData[]> {
		let filteredData: CourseData[] = [];
		let key = getFieldFromKey(this.mKey);

		for (let dataPoint of data) {
			let value = dataPoint.get(key);
			if (typeof value !== "number") {
				throw new InsightError("invalid type of mKey");
			}
			if (this.comparator === "EQ") {
				if (value === this.num) {
					filteredData.push(dataPoint);
				}
			} else if (this.comparator === "GT") {
				if (value > this.num) {
					filteredData.push(dataPoint);
				}
			} else if (this.comparator === "LT") {
				if (value < this.num) {
					filteredData.push(dataPoint);
				}
			} else {
				return Promise.reject(new InsightError("Invalid comparator " + this.comparator));
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

	if (typeof tempMKey !== "string" || typeof tempNum !== "number") {
		throw new InsightError(`incorrect typing for mkey and/or number \n
			mKey: ${typeof tempMKey} \n
		  	number: ${typeof tempNum}`);
	}

	checkCorrectTypeOfValueForKey(getFieldFromKey(tempMKey), tempNum);
	Query.isRepeatDataId(getDatasetIdFromKey(tempMKey));
	return new MComparison(comp, tempMKey, tempNum);
}

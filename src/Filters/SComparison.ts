import {InsightError} from "../controller/IInsightFacade";
import {checkCorrectTypeOfValueForKey} from "../utils/DatasetUtils";
import {getDatasetIdFromKey, getFieldFromKey} from "../utils/QueryUtils";
import {Filter} from "./Filter";
import {Query} from "../utils/Query";
import {CourseData} from "../utils/CourseData";

export class SComparison implements Filter {
	private sKey: string;
	private inputString: string;

	constructor(sKey: string, inputString: string) {
		this.sKey = sKey;
		this.inputString = inputString;
	}

	public  query(data: CourseData[]): Promise<CourseData[]> {
		let filteredData: CourseData[] = [];
		let key = getFieldFromKey(this.sKey);

		for (const dataPoint of data) {
			if (dataPoint.get(key) === this.inputString) {
				filteredData.push(dataPoint);
			}
		}

		return new Promise(function (resolve) {
			resolve(filteredData);
		});
	}
}

/**
 * Take the json containing the sCompare filter and formats it
 * throws InsightError is SKey or InputString are invalid or of mismatching expected types
 * Throws InsightError if inputString contains an *
 * Throws InsightError if it will ask for a different database then the one already being used
 *
 * @param json: The unformatted json
 *
 * @return SComparison: Returns the SComparison filter
 */

export function sCompareConstructor(json: any): SComparison {
	let tempSKey: any;
	let tempInputString: any;

	for (const field in json) {
		tempSKey = field;
		tempInputString = json[field];
	}

	if ((typeof tempSKey) !== "string" || (typeof tempInputString) !== "string") {
		throw new InsightError(`incorrect typing for sKey and/or input string \n
			sKey: ${typeof tempSKey} \n
		  	input string: ${typeof tempInputString}`);
	}

	checkCorrectTypeOfValueForKey(getFieldFromKey(tempSKey), tempInputString);
	Query.isRepeatDataId(getDatasetIdFromKey(tempSKey));

	/*
		const asteriskRegex: RegExp = /^.*[*].*$/;
		if (tempInputString.match(asteriskRegex)) {
			throw new InsightError("input string contained an * inputString:" + tempInputString);
		}
	 */
	return new SComparison(tempSKey, tempInputString);
}

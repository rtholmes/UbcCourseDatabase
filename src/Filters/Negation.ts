import {Filter} from "./Filter";
import {InsightError} from "../controller/IInsightFacade";
import {jsonToFilter} from "../utils/QueryUtils";
import {CourseData} from "../utils/CourseData";

export class Negation implements Filter {
	private filter: Filter;

	constructor(filter: Filter) {
		this.filter = filter;
	}

	public query(data: CourseData[]): Promise<CourseData[]> {
		return new Promise((resolve) => {
			this.filter.query(data).then((queriedData: CourseData[]) => {
				let negatedData: CourseData[];
				// filters out data to remove all elements in queriedData
				negatedData = data.filter((element) => {
					return !queriedData.includes(element);
				});
				resolve(negatedData);
			});
		});
	}
}

/**
 * Take the json containing the Not filter and formats it
 *
 * @param json: The unformatted json
 *
 * @return Promise<Negation>: Returns a promise of the Negation filter
 */

export function negationConstructor(json: any): Promise<Negation> {
	// catches empty NOT filter
	if (JSON.stringify(json) === "{}") {
		throw new InsightError("Given empty filter list for logic comparison");
	}

	// returns a promise so the recursion will continue asynchronously without issue
	return new Promise((resolve, reject) => {
		jsonToFilter(json).then((negatedFilter) => {
			if (negatedFilter === undefined) {
				reject(new InsightError());
			}

			resolve(new Negation(negatedFilter));
		});
	});
}

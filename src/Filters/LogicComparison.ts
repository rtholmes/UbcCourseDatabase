import {jsonToFilter, queryAllFilters} from "../utils/QueryUtils";
import {InsightError} from "../controller/IInsightFacade";
import {Filter} from "./Filter";

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
			queryAllFilters(this.filters, data).then((filteredDataArray) => {

				if (this.logic === "AND") {

					// filter out repeat elements
					filteredDataArray[0] = filteredDataArray[0].filter((element) => {
						let bool = true;
						for (const filterData of filteredDataArray) {
							if (!filterData.includes(element)) {
								bool = false;
							}
						}
						return bool;
					});

					resolve(filteredDataArray[0]);

				} else {

					let combinedData: Array<Array<string | number>> = [];
					for (const filteredData of filteredDataArray) {
						// combines the combinedData with the filteredData then filters out duplicates
						combinedData = combinedData.concat(filteredData).filter(
							function (dataPoint, index, self) {
								return index === self.indexOf(dataPoint);
							});
					}

					resolve(combinedData);

				}
			});
		});
	}
}

/**
 * Take the json containing the Logic filter and formats it while recursively formatting all children
 *
 * @param logic: the logic used either "AND" | "OR"
 * @param json: The unformatted json
 *
 * @return Promise<LogicComparison>: Returns a promise of the LogicComparison filter
 */

export function logicComparisonConstructor(logic: string, json: object[]): LogicComparison {
	let filters: Filter[] = [];

	if (json.length === 0 ) {
		throw new InsightError("Given empty filter list for logic comparison");
	}

	for (let field of json) {
		jsonToFilter(field).then((filter) => {
			filters.push(filter);
		});
	}

	return new LogicComparison(logic, filters);
}

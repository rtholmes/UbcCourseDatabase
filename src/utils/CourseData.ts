import {checkCorrectTypeOfValueForKey} from "./DatasetUtils";

export class CourseData extends Map<string, string | number> {

	constructor(map: Map<string, string | number>) {
		super(map);

		map.forEach((val, key) => {
			checkCorrectTypeOfValueForKey(key, val);
		});
	}
}

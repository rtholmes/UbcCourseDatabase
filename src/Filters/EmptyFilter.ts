import {Filter} from "./Filter";
import {CourseData} from "../utils/CourseData";

export class EmptyFilter implements Filter {
	// if there is no Filter then it returns all data
	public query(data: CourseData[]): Promise<CourseData[]> {
		return new Promise((resolve) => {
			resolve(data);
		});
	}
}

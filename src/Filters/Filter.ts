import {CourseData} from "../utils/CourseData";

export interface Filter {
	query(data: CourseData[]): Promise<CourseData[]>;
}

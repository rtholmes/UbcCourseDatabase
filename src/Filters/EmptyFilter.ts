import {Filter} from "./Filter";

export class EmptyFilter implements Filter {

	// if there is no Filter then it returns all data
	public query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>> {
		return new Promise((resolve) => {
			resolve(data);
		});
	}
}

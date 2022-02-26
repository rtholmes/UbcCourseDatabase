export interface Filter {
	query(data: Array<Array<string | number>>): Promise<Array<Array<string | number>>>;
}

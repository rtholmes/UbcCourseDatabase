import {assert, expect} from "chai";
import {
	checkCorrectTypeOfValueForKey,
	isValidDatasetIdName,
	translateIdToMatchDatasetStyle
} from "../../src/utils/DatasetUtils";
import {InsightError} from "../../src/controller/IInsightFacade";
import {verifyCorrectTypes} from "../../src/utils/QueryUtils";


describe( "Dataset Util Tests", function () {

	it("Test a Regex for a valid id", function () {
		let id1: string = "test";
		let id2: string = "test test";
		let id3: string = " test ";

		assert.isTrue(isValidDatasetIdName(id1));
		assert.isTrue(isValidDatasetIdName(id2));
		assert.isTrue(isValidDatasetIdName(id3));
	});

	it("Test a Regex for id containing an underscore", function () {
		let id1: string = "_";
		let id2: string = "test_";
		let id3: string = "test_test";
		let id4: string = " _ ";

		assert.isFalse(isValidDatasetIdName(id1));
		assert.isFalse(isValidDatasetIdName(id2));
		assert.isFalse(isValidDatasetIdName(id3));
		assert.isFalse(isValidDatasetIdName(id4));

	});

	it("Test a Regex for an id with all whitespace", function () {
		let id1: string = "";
		let id2: string = " ";
		let id3: string = "   ";

		assert.isFalse(isValidDatasetIdName(id1));
		assert.isFalse(isValidDatasetIdName(id2));
		assert.isFalse(isValidDatasetIdName(id3));

	});

	it("Test that courses_key properly converts to key format", function () {
		let map = new Map<string, string>([
			["courses_dept", "dept"],
			["courses_id", "id"],
			["courses_avg", "avg"],
			["courses_instructor", "instructor"],
			["courses_title", "title"],
			["courses_pass", "pass"],
			["courses_fail", "fail"],
			["courses_audit", "audit"],
			["courses_uuid", "uuid"],
			["courses_year", "year"]
		]);

		for (let [oldKey, newKey] of map) {
			expect(translateIdToMatchDatasetStyle(oldKey)).to.be.deep.equal(newKey);
		}
	});

	it("Test that a key is passing with its expected datatype", function () {
		let map = new Map<string, number | string>([
			["dept", "CPSC"],
			["id", "201"],
			["avg", 50],
			["instructor", "Best Prof"],
			["title", "Software Design"],
			["pass", 99],
			["fail", 1],
			["audit", 600],
			["uuid", "1234567"],
			["year", 2000]
		]);

		for (let [key, value] of map) {
			try {
				checkCorrectTypeOfValueForKey(key ,value);
			} catch (err) {
				assert.fail((err as Error).message);
			}
		}
	});

	it("Test that a key is throwing an InsightError with it's unexpected datatype", function () {
		let map = new Map<string, number | string>([
			["dept", 1],
			["id", 1],
			["avg", "1"],
			["instructor", 1],
			["title", 1],
			["pass", "1"],
			["fail", "1"],
			["audit", "1"],
			["uuid", 1],
			["year", "2000"]
		]);

		for (let [key, value] of map) {
			try {
				checkCorrectTypeOfValueForKey(key, value);
				assert.fail("Error not thrown");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		}
	});
});

describe("Query Util Tests", function () {
	let testWhere;
	let testColumns;
	let testOrder;


	it("Test a valid where, column, and order", function () {
		testWhere = new Object();

		testColumns = new Array([
			"courses_dept",
			"courses_avg"
		]);

		testOrder = "courses_avg";

		try {
			verifyCorrectTypes(testWhere, testColumns, testOrder);
		} catch (err) {
			//
		}
	});


});

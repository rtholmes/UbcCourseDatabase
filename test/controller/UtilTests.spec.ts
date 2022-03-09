import {assert, expect} from "chai";
import {InsightError} from "../../src/controller/IInsightFacade";
import {
	checkCorrectTypeOfValueForKey,
	isValidDatasetIdName
} from "../../src/utils/DatasetUtils";

// tests for utils
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
			["year", 2000],
			["lat", 12.3456],
			["lon", 78.9012],
			["seats", 100],
			["fullname", "Hugh Dempster Pavilion"],
			["shortname", "DMP"],
			["number", "101"],
			["name", "DMP_101"],
			["address", "6245 Agronomy Road V6T 1Z4"],
			["type", "Small Group"],
			["furniture", "Classroom-Movable Tables & Chairs"],
			["href", "url"]
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
			["year", "2000"],
			["lat", "12.3456"],
			["lon", "78.9012"],
			["seats", "100"],
			["fullname", 1],
			["shortname", 1],
			["number", 1],
			["name", 1],
			["address", 1],
			["type", 1],
			["furniture", 1],
			["href", 1]
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

import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
	NotFoundError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";
import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";
import {describe} from "mocha";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();
	// Reference any datasets you've added to test/resources/archives here, and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
		noCourses: "./test/resources/archives/noCourses.zip",
		nonZip: "./test/resources/archives/nonZip.txt",
		rooms: "./test/resources/archives/rooms.zip",
		skipNonJSON: "./test/resources/archives/skipNonJSON.zip",
		singleInvalidJSON: "./test/resources/archives/singleInvalidJSON.zip",
		skipInvalidJSON: "./test/resources/archives/skipInvalidJSON.zip",
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("should add a dataset successfully", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then((dataIDS) => {
					expect(dataIDS).to.be.an.instanceof(Array);
					expect(dataIDS).to.have.length(1);
					const insightDatasetCourses = dataIDS.find((dataID) => dataID === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.equal("courses");
				})
				.catch(() => {
					expect.fail("Should not execute");
				});
		});

		it("should add multiple datasets successfully", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses);
				})
				.then((dataIDS) => {
					expect(dataIDS).to.be.an.instanceof(Array);
					expect(dataIDS).to.have.length(2);
					const insightDatasetCourses = dataIDS.find((dataID) => dataID === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.equal("courses");
					const insightDatasetCourses2 = dataIDS.find((dataID) => dataID === "courses2");
					expect(insightDatasetCourses2).to.exist;
					expect(insightDatasetCourses2).to.equal("courses2");
				})
				.catch(() => {
					expect.fail("Should not execute");
				});
		});

		it("should reject add when id is empty", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject add when id is white space", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset(" ", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject add when id is underscore", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("_", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject add when id contains underscore", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses_", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject when dataset kind is rooms", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Rooms)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject when id is the same as an id of an already added dataset", function() {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses);
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject non zip files", function() {
			const content: string = datasetContents.get("nonZip") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject zip files without a courses folder", function() {
			const content: string = datasetContents.get("rooms") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject zip files with an empty courses folder", function() {
			const content: string = datasetContents.get("noCourses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should reject single invalid JSON", function() {
			const content: string = datasetContents.get("singleInvalidJSON") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.an.instanceof(InsightError);
				});
		});

		it("should skip over any non JSON files", function() {
			const content: string = datasetContents.get("skipNonJSON") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.listDatasets().then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 58,
						}]);
					});
				})
				.catch(() => {
					expect.fail("Should not execute");
				});
		});

		it("should skip invalid JSON files", function () {
			const content: string = datasetContents.get("skipInvalidJSON") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.listDatasets().then((insightDatasets) => {
						expect(insightDatasets).to.be.an.instanceof(Array);
						expect(insightDatasets).to.have.length(1);
						expect(insightDatasets).to.deep.equal([{
							id: "courses",
							kind: InsightDatasetKind.Courses,
							numRows: 58,
						}]);
					});
				})
				.catch(() => {
					expect.fail("Should not execute");
				});
		});

		it("should remove single dataset successfully", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset("courses")
						.then((removedID) => {
							expect(removedID).to.be.a("string");
							expect(removedID).to.equal("courses");
							return insightFacade.listDatasets()
								.then((insightDatasets) => {
									expect(insightDatasets).to.be.an.instanceof(Array);
									expect(insightDatasets).to.have.length(0);
								});
						})
						.catch(() => {
							expect.fail("Should not execute");
						});
				});
		});

		it("should remove multiple datasets successfully", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses)
						.then(() => {
							return insightFacade.removeDataset("courses2")
								.then((removedID) => {
									expect(removedID).to.be.a("string");
									expect(removedID).to.equal("courses2");
									return insightFacade.listDatasets()
										.then((insightDatasets) => {
											expect(insightDatasets).to.be.an.instanceof(Array);
											expect(insightDatasets).to.have.length(1);
											return insightFacade.removeDataset("courses")
												.then((removedID2) => {
													expect(removedID2).to.be.a("string");
													expect(removedID2).to.equal("courses");
													return insightFacade.listDatasets()
														.then((insightDatasets2) => {
															expect(insightDatasets2).to.be.an.instanceof(Array);
															expect(insightDatasets2).to.have.length(0);
														});
												})
												.catch(() => {
													expect.fail("Should not execute");
												});
										});
								})
								.catch(() => {
									expect.fail("Should not execute");
								});
						});
				});
		});

		it("should reject remove when attempting to remove non-existent, valid id", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset("courses2");
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(NotFoundError);
				});
		});

		it("should reject remove when id contains underscore", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset("courses_");
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("should reject remove when id is empty", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset("");
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("should reject remove when id is white space", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset(" ");
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("should reject remove when id is underscore", function(){
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => {
					return insightFacade.removeDataset("_");
				})
				.then(() => {
					expect.fail("Should not execute");
				})
				.catch((err) => {
					expect(err).to.be.instanceof(InsightError);
				});
		});

		it("should list no datasets", function () {
			return insightFacade.listDatasets().then((insightDatasets) => {
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("should list one dataset", function () {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => insightFacade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(1);
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					}]);
				});
		});

		it("should list multiple datasets", function () {
			const content: string = datasetContents.get("courses") ?? "";
			return insightFacade.addDataset("courses", content, InsightDatasetKind.Courses)
				.then(() => insightFacade.addDataset("courses2", content, InsightDatasetKind.Courses))
				.then(() => insightFacade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
					const insightDatasetCourses2 = insightDatasets.find((dataset2) => dataset2.id === "courses2");
					expect(insightDatasetCourses2).to.exist;
					expect(insightDatasetCourses2).to.deep.equal({
						id: "courses2",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});
	});
	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {

			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();
			// eslint-disable-next-line max-len
			insightFacade.performQuery({WHERE:{GT:{courses_avg:97}},OPTIONS:{COLUMNS:["courses_dept","courses_avg"],ORDER:"courses_avg"}});

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(actual, expected) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});
});

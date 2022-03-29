import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {atob, btoa} from "buffer";
import * as fs from "fs";
import {InsightDatasetKind, NotFoundError} from "../controller/IInsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static facade: InsightFacade;
	public static readonly jsonFilesPath = "./data/jsonFiles";

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();
		// let path = fs.readFileSync("./test/resources/archives/courses.zip").toString("base64");
		// Server.facade.addDataset("courses", path, InsightDatasetKind.Courses);
		Server.facade = new InsightFacade();

		this.registerMiddleware();
		this.registerRoutes();
		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))

		// commented out because I already have the data locally, add back in when pushed to master
		// Server.facade.addDataset("courses", "./test/resources/archives/courses.zip",
		//	InsightDatasetKind.Courses);
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// Discord Bot commands
		this.express.put("/query/:id/:jsonString", Server.serverAddQuery);
		this.express.get("/query/:id", Server.serverGetQuery);
		this.express.get("/dataset/query/:id", Server.serverQueryDataset);
		this.express.get("/queries", Server.serverListQueries);
	}

	// receives a query to the database
	// id: the query name
	// jsonInput: json in base64 string
	private static serverAddQuery(req: Request, res: Response) {
		try {
			let jsonString = JSON.stringify(req.params);
			console.log(`Server::serverAddQuery(..) - params: ${jsonString}`);
			let jsonParsed = JSON.parse(jsonString);
			let jsonName = jsonParsed.id;
			let jsonFile = atob(jsonParsed.jsonString);
			console.log(`Server::serverAddQuery(..) - jsonFile: ${jsonFile}`);
			fs.writeFileSync(`${Server.jsonFilesPath}/${jsonName}`, jsonFile);
			res.status(200).json({result: `${jsonName} has been saved`});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	// gets query with given id
	private static serverGetQuery(req: Request, res: Response) {
		try {
			let jsonString = JSON.stringify(req.params);
			console.log(`Server::serverAddQuery(..) - id: ${jsonString}`);
			let jsonParsed = JSON.parse(jsonString);
			let jsonName = jsonParsed.id;
			let queryData = fs.readFileSync(`${Server.jsonFilesPath}/${jsonName}`, "base64");
			res.status(200).json({result: queryData});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	// Queries the dataset with query responding to id
	private static serverQueryDataset(req: Request, res: Response) {
		return new Promise(() => {
			let jsonString = JSON.stringify(req.params);
			console.log(`Server::serverAddQuery(..) - jsonString: ${jsonString}`);
			let jsonParsed = JSON.parse(jsonString);
			let jsonName = jsonParsed.id;
			let queryDataString = JSON.stringify(fs.readFileSync(`${Server.jsonFilesPath}/${jsonName}`,
				"utf8"));
			let queryData = JSON.parse(queryDataString);
			console.log(`Server::serverAddQuery(..) - queryData: ${queryData}`);
			Server.facade.performQuery(queryData).then((insightResults) => {
				let formattedResults = btoa(JSON.stringify(insightResults));
				res.status(200).json({result: formattedResults});
			}).catch((err) => {
				res.status(400).json({error: err});
			});
		});
	}

	// Lists all query id's
	private static serverListQueries(req: Request, res: Response): void {
		try {
			console.log("Server::serverListQueries(..)");
			let arr: string[] = [];

			// can make async is having runtime issues
			let files = fs.readdirSync(Server.jsonFilesPath);

			for (let statsKey of files) {
				arr.push(statsKey);
			}

			if (arr.length > 0) {
				res.status(200).json({result: arr});
			} else {
				new Error("No Queries Saved");
			}

		} catch (err) {
			res.status(400).json({error: err});
		}
	}


	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}

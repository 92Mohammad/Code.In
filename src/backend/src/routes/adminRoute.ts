import { json, Request, Response, Router } from "express";
const router = Router();
import * as fs from "fs";
import path from "path";
import { NewProblemInput, NewTestCaseFormat } from "./contributionRoute";
import { z } from "zod";
import { createProblem } from "../db/problem";
import { ParseProblemDetails } from "../lib";
import { createTestCases } from "../db/testcase";

router.post("/signup", async (req: Request, res: Response) => {});

router.post("/login", async (req: Request, res: Response) => {});

router.get("/new-problems", async (req: Request, res: Response) => {
	try {
		// get all new problems from contribute/newproblem folder
		// and send it to admin for review
		const ALL_PROBLEMS = getAllNewProblem();
		return res.status(200).json({
			problems: ALL_PROBLEMS,
		});
	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});
router.get("/new-testcases", async (req: Request, res: Response) => {
	try {
		// get all new testcases from contribute/newtestcases folder
		// and send it to admin for review
		const ALL_TESTCASES = getAllNewTestcases();
		return res.status(200).json({ testcases: ALL_TESTCASES });
	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});
// Save problem after review
router.post("/save-problem", async (req: Request, res: Response) => {
	const { problemId } = req.body;
	try {
		// save the problem in database with with given id
        const newProblem = saveProblemAndTestCase(problemId);

        //generate boilerplate code if problem has been saved and save them into database

        // save testcases in database 
        

	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});

// Save testcase after review
router.post("/save-testcase", async (req: Request, res: Response) => {
	try {
	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});

// After problem details if find error while reviewing
router.post("/update-problem", async (req: Request, res: Response) => {
	try {
	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});

// After testcase details if find error while reviewing
router.get("/update-tesctcase", async (req: Request, res: Response) => {
	try {
	} catch (error: any) {
		console.error("Error: ", (error as Error).message);
	}
});

type ProblemType = z.infer<typeof NewProblemInput>;

function getAllNewProblem(): ProblemType[] {
	let problems: ProblemType[] = [];
	const folderPath = path.join(__dirname, "contribute", "newproblem");
	const files = fs.readdirSync(folderPath);
	files.forEach((file) => {
		// Only process JSON files
		if (path.extname(file) === ".json") {
			const filePath = path.join(folderPath, file);

			// Read the file contents
			const fileContents = fs.readFileSync(filePath, "utf-8");

			try {
				// Parse the JSON content
				const jsonData = JSON.parse(fileContents);
				const newProblem = {
					id: jsonData.id,
					title: jsonData.title,
					description: jsonData.default,
					difficulty: jsonData.difficulty,
					returnType: jsonData.returnType,
					parameters: jsonData.parameters,
					testcases: jsonData.testcases,
				};
				problems.push(newProblem);
				// Do something with the JSON data
				console.log("Title:", jsonData.title);
				console.log("Description:", jsonData.description);
				console.log("Difficulty:", jsonData.difficulty);
				console.log("Testcases:", jsonData.testcases);
				console.log("-----------------------------------");
			} catch (err) {
				console.error(`Error parsing JSON in file ${file}:`, err);
			}
		}
	});
	return problems;
}

type TestCaseType = z.infer<typeof NewTestCaseFormat>;

function getAllNewTestcases(): TestCaseType[] {
	let testcases: TestCaseType[] = [];
	const folderPath = path.join(__dirname, "contribute", "newtestcase");
	const files = fs.readdirSync(folderPath);
	files.forEach((file) => {
		// Only process JSON files
		if (path.extname(file) === ".json") {
			const filePath = path.join(folderPath, file);

			// Read the file contents
			const fileContents = fs.readFileSync(filePath, "utf-8");

			try {
				// Parse the JSON content
				const jsonData = JSON.parse(fileContents);
				const newTestcase: TestCaseType = {
					testcaseId: jsonData.testcaseId,
					problemTitle: jsonData.problemTitle,
					testcases: jsonData.testcases,
				};
				testcases.push(newTestcase);
				// Do something with the JSON data
				console.log("Title:", jsonData.title);
				console.log("Description:", jsonData.description);
				console.log("Difficulty:", jsonData.difficulty);
				console.log("Testcases:", jsonData.testcases);
				console.log("-----------------------------------");
			} catch (err) {
				console.error(`Error parsing JSON in file ${file}:`, err);
			}
		}
	});
	return testcases;
}

function saveProblemAndTestCase(problemId: string) {
	// read the file and match the problem id
	const folderPath = path.join(__dirname, "contribute", "newproblem");
	const files = fs.readdirSync(folderPath);

	files.forEach(async (file) => {
		// Only process JSON files
		if (path.extname(file) === ".json") {
			const filePath = path.join(folderPath, file);
            
			// Read the file contents
			try {
				// Parse the JSON content
                const parser = new ParseProblemDetails()
                const problem =  parser.extractProblemDetails(filePath);
                if (problem.id === problemId){
                    // read the details and save it into database
                    const newProblem = await createProblem(
                        problem.title,
                        problem.description,
                        problem.difficulty,
                        problem.userId
                    );
                    // new problem will return the problem id
                    // use the problem id to save the testcases
                    
                    if (!newProblem.success) {
                        console.log("Error: ", newProblem.msg);
                        return; //  [Todo] - need to use concept of recursion that call atleas 3 times if there is problem in createing new problem or testcases
                    }
                    // save testcase
                    const newTestcase = await createTestCases({
                        problemId: newProblem.id,
                        title: problem.title,
                        testcases: problem.testcases
                    })
                    if (!newTestcase.success){
                        return;
                    }

                    const java = parser.getJavaBoilerplateCode();
                    const cpp = parser.getCppBoilerplateCode();
                    const typescript = parser.getTypescriptBoilerplateCode();

                }
				// // Do something with the JSON data
				// console.log("Title:", jsonData.title);
				// console.log("Description:", jsonData.description);
				// console.log("Difficulty:", jsonData.difficulty);
				// console.log("Testcases:", jsonData.testcases);
				// console.log("-----------------------------------");
			} catch (err) {
				console.error(`Error parsing JSON in file ${file}:`, err);
			}
		}
	});
}

export default router;

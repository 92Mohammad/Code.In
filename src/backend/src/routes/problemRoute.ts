import { Request, Router, Response } from "express";
const router = Router();
import { problems } from "../../problem";
import axios from "axios";
import auth, { CustomRequestObject } from "../middleware/auth";
import { GenerateFullProblemDefinition } from '../lib/generateFullProblemDefinition'
import { getAllTestcases } from "../db/testcase";
import { ProblemSubmissionData, TestCaseReturnType, Problem } from "../@utils/types";
import { getProblemsWithStatus, getProblemsWithoutStatus } from "../db/problem";


router.get("/", (req: Request, res: Response) => {
	console.log("request reach here");
	const q = req.query;
	const pageNumber = Number(q.page);
	const pageSize = Number(q.pageSize);
	const difficultyLevel = String(q.difficultyLevel);
	console.log(difficultyLevel);
	const startIndex = (pageNumber - 1) * pageSize;
	let problemsSet = problems;

	if (difficultyLevel !== "") {
		problemsSet = problemsSet.filter(
			(problem) => problem.difficultyLevel === difficultyLevel
		);
	}
	const endIndex = Math.min(pageNumber * pageSize, problemsSet.length);
	const newProblemSet = problemsSet.slice(startIndex, endIndex);
	const totalPages = Math.ceil(problemsSet.length / pageSize);

	return res
		.status(200)
		.json({ message: "success", data: newProblemSet, totalPages });
});



// filter the problem based on action type {difficulty, status}
router.get("/filter-problem", auth, async (req: Request, res: Response) => {
	const { userAuthorized } = req as CustomRequestObject;
	const query  = req.query;
	const pageNumber  = Number(query.pageNumber);
	const pageSize = Number(query.pageSize);
	const difficulty = String(query.difficulty);
	const status = String(query.status);
	console.log('check user authoriztion: ', userAuthorized);
	console.log('difficulty data on backend: ', difficulty);

	try {
		
		const startIndex = (pageNumber - 1) * pageSize;
		if (userAuthorized){
			console.log('inside authorization')
			const { userId } = req as CustomRequestObject;
			const problemsWithStatus = await getProblemsWithStatus(userId);
			if (!problemsWithStatus.success){
				return res.json({ err: "something went wrong while quering to database"});
			}

			let problems: Problem[] = problemsWithStatus.problems;
			
			if (difficulty !== "" && status !== ""){
				// means there is  difficulty and status query just so filter based on that
				problems = problems.filter(p => p.problem.difficulty === difficulty && p.status === status)

			}
			else if (difficulty !== "" && status === ""){
				// means there is  no status but difficulty
				problems = problems.filter(p => p.problem.difficulty === difficulty );
				console.log('problem after filter: ', problems);
			}
			else if (difficulty === "" && status !== ""){
				problems = problems.filter(p => p.status === status)
			}
			// 
			console.log(problems)
			const endIndex = Math.min(pageNumber * pageSize, problems.length);
			const problemSet = problems.slice(startIndex, endIndex);
			const totalPages = Math.ceil(problems.length / pageSize);
			return res.status(200).json({
				message: "success",
				data: problemSet, 
				totalPages
			})
		}
		else {
			// just send the problem without Problem status because user is not authorized
			const problemWithoutStatus = await getProblemsWithoutStatus()
			if (!problemWithoutStatus.success){
				return res.json({ err: "check cehck...."})
			}
			const endIndex = Math.min(pageNumber * pageSize, problemWithoutStatus.problems.length);
			const problemSet = problemWithoutStatus.problems.slice(startIndex, endIndex);
			const totalPages = Math.ceil(problemWithoutStatus.problems.length / pageSize);
			return res.status(200).json({
				message: "success",
				data: problemSet, 
				totalPages
			})
		}
	} catch (error: any) {
		console.error("Error during getting problme: ", error.message);
	}
});

router.post("/submit-problem", auth, async (req: Request, res: Response) => {
	const { userAuthorized, userId } = req as CustomRequestObject;


	try {
		// if (!userAuthorized) {
		// 	return res
		// 		.status(400)
		// 		.json({ message: "your are not authorized, please login" });
		// }
		const parseUserSubmitCode = ProblemSubmissionData.safeParse(req.body);
		if (!parseUserSubmitCode.success) {
			return res.status(401).json({ error: parseUserSubmitCode.error });
		}
		const { problemId, languageId, code } = parseUserSubmitCode.data;
		
		const testcases = await getAllTestcases(problemId);

		if (testcases.data === undefined || !testcases.success ){
			return res.status(500).json({ error: testcases?.err || "Error occured while fetching testcases" });
		}
		// 3. create submission array
		
		const submissions: {
			language_id: number;
			source_code: string,
			stdin: string,
			expected_output: string
		}[] = testcases.data.map((testcase:  TestCaseReturnType) => {  // [Todo] - remove type any and add testcase actual type 
			const parser = new GenerateFullProblemDefinition
			parser.parseTestCase(testcase);
			//getProblem() --> { fullBoilerplate code, stdin, stdout, }
			const problem = parser.getProblem(languageId, code);

			return {
				language_id: languageId, // Java ID for Judge0
				source_code: problem.fullBoilerplatecode,
				stdin: problem.stdin,
				expected_output: JSON.stringify(problem.stdout)
			};
		});

		console.log('this is submission array: ', submissions);


		const JUDGE0_API_URL  =`${process.env.JUDGE0_API_URL}/submissions/batch`;
		const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
		// 4. make api call
		const data = JSON.stringify(submissions);
		const submissionsTokens = await axios.post(JUDGE0_API_URL ,{
			data,
			param: {
				base64_encoded: false		
			},

		},	
			{
				headers: {
					"Content-Type": "application/json",
					"x-rapidapi-host": "judge0-ce.p.rapidapi.com",
					"x-rapidapi-key": JUDGE0_API_KEY,
				},
			}
		);

		const tokens = submissionsTokens.data as CreateSubmissionApiReponse[];
		// above response will return array of tokens so make a call to get the submissions result
		const submissionResult = await axios.get(JUDGE0_API_URL, {
			params: {
				tokens: tokens.map((token: CreateSubmissionApiReponse) => {
					return token
				}).join(','),
				base64_encoded: false,
			}
		})
		const executionResult = submissionResult.data as SubmissionsResult[];
		// above reponse will return a submission array
		const failedTestCases: SubmissionsResult[] =  executionResult.filter((submission: SubmissionsResult )=> {
			return submission.status.description !== "Accepted" || submission.compile_output !== null;
		});
		if (failedTestCases.length !== 0){
			// meanse all testcases not passed
			return res.status(200).json({
				data: failedTestCases,
				type: "error"
			});
		}

		return res.status(200).json({
			type: "success",
			message: "Your submissions has been accepted"
		})
		// store the user submission in databases if accepted { problemId, userId, submission status, code}
		
	} catch (error: any) {}
});

interface CreateSubmissionApiReponse {
	token: string
}


interface SubmissionsResult {
	time: string;
	memory: number;
	status: {
		id: number;
		description: string
	},
	stdout: string,
	compile_output: string | null,
}

export default router;

/*
	
	Create multiple submissions at once
	- POST
	- https://judge0-ce.p.rapidapi.com/submissions/batch
	- body: {
		"submissions": [
			{		
				"language_id": 62,
				"source_code": "public class Main{public static void main(String[] args){System.out.println(40);}}"
			},
			{
				"language_id": 62,
				"source_code": "public class Main{public static void main(String[] args){System.out.println(20);}}"
			},
			{
				"language_id": 62,
				"source_code": "public class Main{public static void main(String[] args){System.out.println(30);}}"
			}  
		],

	} ,
	params: {
    	base64_encoded: 'false'
 	 },


	- Get multiple submissions at once.
	- https://judge0-ce.p.rapidapi.com/submissions/batch
	-params: {
		tokens: 'dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db',
		base64_encoded: 'true',
		fields: '*'
	},

*/
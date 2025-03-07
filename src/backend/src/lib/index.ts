import * as fs from "fs";

interface Parameter {
	parameterId: string;
	type: string;
	name: string;
}

export interface TestCaseWithProblem {
	testcaseId: string;
	inputs: {
		name: string;
		type: string;
		value: string;
	}[];
	output: {
		type: string;
		value: string;
	};
}

export class ParseProblemDetails {
	id: string = ""; // problem id
	testcaseId: string = "";
	title: string = "";
	description: string = "";
	difficulty: string = ""
	functionName: string = "";
	returnType: string = "";
	userId: string = "";
	parameters: Parameter[] = [];
	testcases: TestCaseWithProblem[] = []; // testcases that comes while creating new problem

	extractProblemDetails(filePath: string) {
		// Read the JSON file
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const data = JSON.parse(fileContent);
		this.id = data.id;
		this.title = data.title || "";
		this.description = data.description || "";
		this.difficulty = data.difficulty;
		
		this.returnType = data.returnType || "";
		this.userId = data.userId;
		this.parameters = data.parameters;
		this.testcases = data.testcases;
		const name: string  = data.title.split(" ");
		this.functionName = name[0].charAt(0).toLowerCase() + name[0].slice(1) + name[1]; // only take two word

		return {
			id: this.id,
			title: this.title,
			description: this.description,
			difficulty: this.difficulty,
			userId: this.userId,
			testcases: this.testcases
		};
	}
	
	getJavaBoilerplateCode() {
		// since return type is already standard to java type .
		// need to format parameters
		const inputs = this.parameters
			.map((params) => {
				return `${params.type} ${params.name}`;
			})
			.join(", ");

		return `public static ${this.returnType} ${this.functionName}(${inputs}){\n\t// write your code here.\n}`;
	}

	getCppBoilerplateCode() {
		const inputs = this.parameters
			.map((params) => {
				return `${this.mapTypeToCpp(params.type)} ${params.name}`;
			})
			.join(", ");

		return  `${this.mapTypeToCpp(this.returnType)} ${
			this.functionName
		}(${inputs}){\n\t//write your code here.\n}`;
	}

	getTypescriptBoilerplateCode(){
		const inputs = this.parameters.map(params => {
			return `${params.name}: ${this.mapTypeToTypescript(params.type)}`
		}).join(', ');

		return  `function ${this.functionName}(${inputs}): ${this.mapTypeToTypescript(this.returnType)}{\n\t// write your code here.\n}`

	}
	getJavascriptBoilerplateCode () {
		const inputs = this.parameters.map(params => {
			return `${params.name}`
		}).join(', ');
		
		const templateCode  = `/*\n\t${this.parameters.map(params => `@param{${this.mapTypeToTypescript(params.type)}} ${params.name}`).join('\n\t')}\n\t@return{${this.mapTypeToTypescript(this.returnType)}}\n*/\n\nvar ${this.functionName} = function(${inputs}) {\n\t//write your code here.\n};`
		return templateCode;
	}

	mapTypeToCpp(returnType: string) {
		switch (returnType) {
			case 'void':
				return 'void';
			case "int":
				return "int";
			case "int[]":
				return "int[]";
			case "String":
				return "string";
			case "boolean":
				return "bool";
			case "char":
				return "char";
			case "String[]":
			case "char[]":
				return "vector<string>";
			case "char[][]":
				return "vector<vector<string>>";
			case "List<Integer>":
				return "vector<int>";
			case "List<String>":
				return "vector<string>";
			case "int[][]":
			case "List<List<Integer>>" :
				return "vector<vector<int>>";
			case "int[][]":
			case "List<List<String>>" :
				return "vector<vector<string>>";
			default:
				return "";
		}
	}

	mapTypeToTypescript(returnType: string) {
		switch (returnType) {
			case 'void':
				return 'void';
			case "int":
				return "number";
			case "List<Integer>":
			case "int[]" :
				return "number[]";
			case  "char":
			case "string" :
			case "String" :
				return "string";
			case "Boolean" :
			case "boolean":
				return "boolean";
			case "string[]":
			case "String[]" :
				return "string[]";
			case "int[][]":
			case "List<List<Integer>>":
				return "number[][]";
			default:
				return "number";
		}
	}
}

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ProblemState, Problem, ApiResponse } from "../types";
import { client } from "../api/client";
import { RootState } from "../app/store";




export const problemSliceInitialState: ProblemState = {
	problems: [],
	selectedLanguage: "javascript",
	pageSize: 10,
	numberOfPages: 2,
	error: null,
};

export const getProblems = createAsyncThunk('/problem/getProblems', async(pageNumber: number, ThunkAPI) => {
	const store = ThunkAPI.getState() as RootState;
	const { pageSize } = store.problem;
	try {
		const res = await client.get<ApiResponse<Problem[]>>(`/problem`, {
			params: {
				page: pageNumber,
				pageSize: pageSize
			}
		});
		console.log(res.data.data);
		return res.data.data;
	}
	catch(error: any){
		return ThunkAPI.rejectWithValue(error.message || "failed to fetch problems");
	}

})

export const getTotalPageNumber = createAsyncThunk('/problem/getTotalPageNumber', async(_ , ThunkAPI) => {
	// make  a get request to get the total number of pages
})

export const problemSlice = createSlice({
	name: "problem",
	initialState: problemSliceInitialState,
	reducers: {
		setSelectedLanguage: (state, action: PayloadAction<string>) => {
			state.selectedLanguage = action.payload;
		},
		setPageSize: (state, action: PayloadAction<number>) => {
			state.pageSize = action.payload;
		},
		
	},
	extraReducers: (builder) => {
		builder.addCase(getProblems.pending, (_, action) => {
			console.log(action.payload);
			console.log('pending...');

		}) 
		builder.addCase(getProblems.fulfilled, (state, action) => {
			console.log(action.payload);
			state.problems = action.payload;
			console.log('fulfilled');
		}) 
		builder.addCase(getProblems.rejected, (_, action) => {
			console.log(action.payload);
			console.log('rejected');
		}) 
	}
});

export default problemSlice.reducer;
export const {
	setSelectedLanguage,
	setPageSize
} = problemSlice.actions;


	// const  nextPaginationNumber = action.payload;
			// const startIndex = (nextPaginationNumber - 1) * MAX_PROBLEM_LIMIT;
			// // [Todo-Future]- change the below problem.slice with state.problem.slice
			// const endIndex = Math.min(
			// 	nextPaginationNumber * MAX_PROBLEM_LIMIT,
			// 	problems.length
			// );
			// // [Todo-Future]- change the below problem.slice with state.problem.slice
			// const newProblemSet = problems.slice(startIndex, endIndex);
			// state.problemSet = newProblemSet;
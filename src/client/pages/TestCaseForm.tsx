import { useSelector } from "react-redux";
import { Plus } from "lucide-react";

import { useAppDispatch, RootState } from "@/client/app/store";
import { addNewTestcase } from "@/client/features/problemFormSlice";
import { TestCaseContainer } from "@/client/components/common/TestCaseContainer";
import { Button } from "../components/ui/button";

export const TestCaseForm = () => {
	const dispatch = useAppDispatch();

	const { testcases } = useSelector((state: RootState) => state.problemform);
	
	return (
		<div className="max-w-3xl  shadow-lg rounded-2xl  border-[1.5px] border-slate-800   flex flex-1 flex-col">
			<div className="bg-slate-800 flex items-center px-5 py-4 rounded-tl-2xl rounded-tr-2xl">
				<h2 className="text-2xl font-bold text-slate-200">
					Testcase Examples Details
				</h2>
			</div>
			<div className={`flex flex-col justify-start ${testcases.length === 0 && " items-center pt-10"}`}>
				<div className=" px-4 py-4 flex flex-col gap-4 text-lg">
					{testcases.length === 0 ? (
						<div>No testcase added yet</div>
					) : (
						testcases.map((testcase, index) => (
							<TestCaseContainer
								key={testcase.id}
								id={testcase.id}
								testcaseNo={index + 1}
								input={testcase.input}
								output={testcase.output}
							/>
						))
					)}
				</div>

				<div className="px-4 flex justify-center">
					<Button
						className="flex flex-row gap-3 bg-slate-800 rounded-xl "
						onClick={() => dispatch(addNewTestcase())}
					>
						<Plus className="w-4 h-4" />
						Add More Testcase
					</Button>
				</div>
			</div>
		</div>
	);
};

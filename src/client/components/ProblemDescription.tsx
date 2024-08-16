import { TestCase} from '../components/TestCase'
import { testcase } from '../../utils/testcase'






export const ProblemDescription = () => {
  return (
    <section className="flex flex-1 gap-8 flex-col rounded-lg text-white bg-darkGray justify-start px-5 py-3 overflow-scroll scroll-smooth">
      <div className="flex flex-col gap-[28px] pt-5 ">
        how to create markdow for test cases 🤔? 
      </div>
      <div className="flex flex-col gap-8 ">
        {testcase.map((testcase, index) => {
          return (
            <TestCase
              key={testcase.id}
              testCaseNumber={index}
              input={testcase.input}
              output={testcase.output}
            />
          );
        })}
      </div>
    </section>
  );
};

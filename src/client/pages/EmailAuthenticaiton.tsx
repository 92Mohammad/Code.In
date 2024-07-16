import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useState, useRef } from "react";

interface FocusIndexAndDigit {
  focusIndex: string;
  firstDigi: string;
  secondDigi:string;
  thirdDigi: string;
  fourthDigi: string
}

export const EmailAuthenticaiton = () => {
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const [focusedIndexAndDigit, setFocusedIndexAndDigit] =
    useState<FocusIndexAndDigit>({
      focusIndex: "",
      firstDigi: "",
      secondDigi: "",
      thirdDigi: "",
      fourthDigi: "",
    });

  return (
    <div className="bg-[#141515] flex fixed top-0 bottom-0 left-0 right-0">
      <div className="flex flex-col relative w-[500px] h-[400px] top-[164px] left-[486px] bg-[#00242c] rounded-[29px] items-center pt-10">
        <div className="flex flex-col items-center gap-8">
          <div className="h-[38px]  [font-family:'Inria_Sans-Bold',Helvetica] font-bold text-[#81e291] text-[25px] text-center tracking-[3.20px] leading-[normal] whitespace-nowrap">
            Email Authentication
          </div>
          <div className=" [font-family:'Inter-Regular',Helvetica] font-normal text-white text-xl tracking-[2.40px] leading-[normal]">
            Enter OTP code
          </div>

          <div className="flex flex-row gap-5">
            <Input value={focusedIndexAndDigit.firstDigi} inputRef={ref0}/>
            <Input value={ focusedIndexAndDigit.secondDigi} inputRef={ref1}/>
            <Input value={ focusedIndexAndDigit.thirdDigi} inputRef={ref2}/>
            <Input value={focusedIndexAndDigit.fourthDigi} inputRef = {ref3}/>
          </div>
          <Button classname="bg-[#81e291] rounded-[10px] text-black [font-family:'Inter-Regular',Helvetica] h-14 w-72">
            Verify OTP
          </Button>

          <a className=" [font-family:'Inter-Regular',Helvetica] font-normal text-white  hover:text-red-400 text-[15px] text-center tracking-[1.50px] leading-[normal] whitespace-nowrap cursor-pointer">
            Resend OTP
          </a>
        </div>
      </div>
    </div>
  );
};

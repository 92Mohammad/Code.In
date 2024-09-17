import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, RootState } from "@/client/app/store";
import { setPassword } from "@/client/features/userSlice";


export const PasswordInputField = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { password } = useSelector((state: RootState) => state.user);

  const style = "absolute right-3 top-2  text-gray-400 px-1 py-1 w-8 h-8 cursor-pointer rounded-full hover:bg-gray-600";

  return (
    <>
      <div className=" relative rounded-lg">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Passowrd"
          value = {password}
          className="focus:outline-none focus:ring focus:ring-offset-[#81E291] rounded-md border  px-3 py-3 bg-transparent text-white relative w-full text-sm"
          onChange={(e) => dispatch(setPassword(e.target.value))}
        />
        {showPassword ? (
          <MdVisibility 
            className={style} 
            onClick={() => setShowPassword(prevShow => !prevShow)}
          />
        ) : (
          <MdVisibilityOff 
            className={style}
            onClick={() => setShowPassword(prevShow => !prevShow)}
          />
        )}
      </div>
    </>
  );
};

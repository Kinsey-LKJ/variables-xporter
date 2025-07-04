import { useContext } from "react";
import { AppContext } from "./App";

const Welcome = () => {
  const {textData} = useContext(AppContext)
  return (
    <div className="w-full h-full overflow-y-hidden">
      <div className="grid gap-6">
        <div className="grid gap-3 text-center">
          <div className="text-4xl font-bold special-text">Variables Xporter</div>
          <div className=" text-sm">{textData.export_figma_variables_tailwind_css_or_css_variables}</div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

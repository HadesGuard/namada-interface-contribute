import { Image, ProgressIndicator } from "@namada/components";
import clsx from "clsx";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";

type ContainerHeaderProps = {
  totalSteps: number;
  currentStep: number;
};

export const ContainerHeader = ({
  totalSteps,
  currentStep,
}: ContainerHeaderProps): JSX.Element => {
  const navigate = useNavigate();
  return (
    <>
      {totalSteps === 0 && (
        <div className="max-w-[200px] mx-auto">
          <Image imageName="Logo" />
        </div>
      )}
      {totalSteps > 0 && (
        <>
          {/* Don't show return button in the last step */}
          {currentStep < totalSteps && (
            <span
              className={clsx(
                "flex absolute items-center text-yellow cursor-pointer h-full left-4",
                "top-0 text-[22px] transition-colors hover:text-cyan active:top-px"
              )}
              onClick={() => navigate(-1)}
            >
              <GoArrowLeft />
            </span>
          )}
          <ProgressIndicator
            keyName="setup"
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        </>
      )}
    </>
  );
};

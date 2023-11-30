import { Image, ImageName, Stack } from "@namada/components";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { claimAtom, confirmationAtom } from "../../state";
import {
  PageHeaderContainer,
  PageHeaderLink,
  PageHeaderStartOver,
} from "./PageHeader.components";

type PageHeaderProps = {
  showStartOver: boolean;
  showTermsOfService: boolean;
  yellowLogo: boolean;
};

export const PageHeader = ({
  showStartOver,
  showTermsOfService,
  yellowLogo,
}: PageHeaderProps): JSX.Element => {
  const [, setClaimState] = useAtom(claimAtom);
  const [, setConfirmationState] = useAtom(confirmationAtom);
  const navigate = useNavigate();

  return (
    <PageHeaderContainer themeColor={yellowLogo ? "primary" : "utility1"}>
      {showStartOver && <span />}

      <Stack as="a" gap={6} direction="horizontal">
        <Image
          imageName={ImageName.LogoMinimal}
          styleOverrides={{ width: "50px" }}
          forceLightMode={!yellowLogo}
        />
        <Image
          imageName={ImageName.Logo}
          styleOverrides={{ width: "180px" }}
          forceLightMode={!yellowLogo}
        />
      </Stack>

      {showStartOver && (
        <PageHeaderLink
          onClick={() => {
            navigate("/");
            setClaimState(null);
            setConfirmationState(null);
          }}
        >
          <PageHeaderStartOver
            themeColor={yellowLogo ? "primary" : "utility1"}
          />{" "}
          <span>Start over</span>
        </PageHeaderLink>
      )}

      {showTermsOfService && (
        <PageHeaderLink href="#" target="_blank" rel="noreferrer nofollow">
          Terms of Service
        </PageHeaderLink>
      )}
    </PageHeaderContainer>
  );
};
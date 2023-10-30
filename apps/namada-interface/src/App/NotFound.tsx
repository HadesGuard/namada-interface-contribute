import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonVariant,
  Heading,
  Icon,
  IconName,
  NavigationContainer,
} from "@namada/components";

import { TopLevelRoute } from "./types";
import {
  NotFoundContainer,
  NotFoundContent,
  ButtonsContainer,
} from "./NotFound.components";
import { BackButton } from "./Token/TokenSend/TokenSendForm.components";

const NotFound = (): JSX.Element => {
  const navigate = useNavigate();
  const handleWalletClick = (): void => {
    navigate(TopLevelRoute.Wallet);
  };
  return (
    <NotFoundContainer>
      <NavigationContainer>
        <Heading level="h1">Oops!</Heading>
      </NavigationContainer>
      <NotFoundContent>
        <Heading level="h1">Page not found.</Heading>
        <Button onClick={handleWalletClick} variant={ButtonVariant.Contained}>
          Return to wallet
        </Button>
      </NotFoundContent>
      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </NotFoundContainer>
  );
};

export default NotFound;

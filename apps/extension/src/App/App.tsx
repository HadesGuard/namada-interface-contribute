import { Alert, Container } from "@namada/components";
import { formatRouterPath, getTheme } from "@namada/utils";
import { useAccounts } from "hooks/useAccount";
import { useSystemLock } from "hooks/useSystemLock";
import { matchPath, useLocation } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AppContent } from "./AppContent";
import { AppHeader } from "./Common/AppHeader";
import { Login } from "./Login";
import { AccountManagementRoute, LoadingStatus, TopLevelRoute } from "./types";

export const App: React.FC = () => {
  const theme = getTheme("dark");
  const location = useLocation();

  const { isLocked, unlock, lock } = useSystemLock();
  const {
    accounts,
    parentAccounts,
    status: accountLoadingStatus,
    activeAccountId,
    changeActiveAccountId,
    error,
    remove: removeAccount,
  } = useAccounts();

  const displayReturnButton = (): boolean => {
    const setupRoute = formatRouterPath([TopLevelRoute.Setup]);
    const indexRoute = formatRouterPath([
      TopLevelRoute.Accounts,
      AccountManagementRoute.ViewAccounts,
    ]);

    return Boolean(
      !isLocked &&
        isLocked !== undefined &&
        !matchPath(setupRoute, location.pathname) &&
        !matchPath(indexRoute, location.pathname)
    );
  };

  const accountLoadingComplete =
    accountLoadingStatus === LoadingStatus.Completed;

  const userHasAccounts = accountLoadingComplete && accounts.length > 0;

  const shouldDisplayAppContent =
    (accountLoadingComplete && !userHasAccounts) || isLocked === false;

  return (
    <ThemeProvider theme={theme}>
      <Container
        size="popup"
        header={<AppHeader returnButton={displayReturnButton()} />}
      >
        {error && (
          <Alert title="Error" type="error">
            {error}
          </Alert>
        )}
        {isLocked && userHasAccounts && <Login onLogin={unlock} />}
        {shouldDisplayAppContent && (
          <AppContent
            accounts={accounts}
            parentAccounts={parentAccounts}
            activeAccountId={activeAccountId}
            onChangeActiveAccount={changeActiveAccountId}
            onDeleteAccount={removeAccount}
            onLockApp={lock}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};
